'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { createClient } from '@/lib/supabase/client';
import { IChallengeItem, IRecommendedAdjustment, IWizardState } from '@/types/wizard';
import { IDisabilityItem } from '@/types/disability';
import { IAdjustmentItem } from '@/types/adjustment';

// ----------------------------------------------------------------------
// Hook: useChallenges
// Fetches all challenges, optionally filtered by disability IDs
// ----------------------------------------------------------------------

export function useChallenges(disabilityIds?: string[]) {
  const supabase = useMemo(() => createClient(), []);
  const [challenges, setChallenges] = useState<IChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (disabilityIds && disabilityIds.length > 0) {
        // Fetch challenges linked to selected disabilities
        const { data: linkedChallenges, error: linkError } = await supabase
          .from('disability_challenges')
          .select('challenge_id')
          .in('disability_id', disabilityIds);

        if (linkError) throw linkError;

        const challengeIds = [...new Set(linkedChallenges?.map((l) => l.challenge_id) || [])];

        if (challengeIds.length > 0) {
          const { data, error: fetchError } = await supabase
            .from('challenges')
            .select('*')
            .in('id', challengeIds)
            .order('category', { ascending: true })
            .order('name', { ascending: true });

          if (fetchError) throw fetchError;
          setChallenges((data || []) as IChallengeItem[]);
        } else {
          // No linked challenges, fetch all
          const { data, error: fetchError } = await supabase
            .from('challenges')
            .select('*')
            .order('category', { ascending: true })
            .order('name', { ascending: true });

          if (fetchError) throw fetchError;
          setChallenges((data || []) as IChallengeItem[]);
        }
      } else {
        // No disabilities selected, fetch all challenges
        const { data, error: fetchError } = await supabase
          .from('challenges')
          .select('*')
          .order('category', { ascending: true })
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;
        setChallenges((data || []) as IChallengeItem[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  }, [supabase, disabilityIds]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  return { challenges, loading, error, refetch: fetchChallenges };
}

// ----------------------------------------------------------------------
// Hook: useRecommendedAdjustments
// Calculates recommended adjustments based on selected disabilities and challenges
// ----------------------------------------------------------------------

export function useRecommendedAdjustments(
  selectedDisabilities: string[],
  selectedChallenges: string[]
) {
  const supabase = useMemo(() => createClient(), []);
  const [recommendations, setRecommendations] = useState<IRecommendedAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const adjustmentMap = new Map<
        string,
        {
          adjustment: IAdjustmentItem;
          sources: { type: 'disability' | 'challenge'; name: string; score: number }[];
          totalScore: number;
        }
      >();

      // 1. Get adjustments from disabilities
      if (selectedDisabilities.length > 0) {
        const { data: disabilityAdjustments, error: daError } = await supabase
          .from('disability_adjustments')
          .select(
            `
            relevance_score,
            disability:disabilities(id, disability_name),
            adjustment:adjustments(*)
          `
          )
          .in('disability_id', selectedDisabilities);

        if (daError) throw daError;

        disabilityAdjustments?.forEach((da: any) => {
          const adjId = da.adjustment.id;
          const existing = adjustmentMap.get(adjId);

          const source = {
            type: 'disability' as const,
            name: da.disability.disability_name,
            score: da.relevance_score,
          };

          if (existing) {
            existing.sources.push(source);
            existing.totalScore += da.relevance_score;
          } else {
            adjustmentMap.set(adjId, {
              adjustment: da.adjustment,
              sources: [source],
              totalScore: da.relevance_score,
            });
          }
        });
      }

      // 2. Get adjustments from challenges
      if (selectedChallenges.length > 0) {
        const { data: challengeAdjustments, error: laError } = await supabase
          .from('challenge_adjustments')
          .select(
            `
            relevance_score,
            challenge:challenges(id, name),
            adjustment:adjustments(*)
          `
          )
          .in('challenge_id', selectedChallenges);

        if (laError) throw laError;

        challengeAdjustments?.forEach((la: any) => {
          const adjId = la.adjustment.id;
          const existing = adjustmentMap.get(adjId);

          const source = {
            type: 'challenge' as const,
            name: la.challenge.name,
            score: la.relevance_score,
          };

          if (existing) {
            existing.sources.push(source);
            existing.totalScore += la.relevance_score;
          } else {
            adjustmentMap.set(adjId, {
              adjustment: la.adjustment,
              sources: [source],
              totalScore: la.relevance_score,
            });
          }
        });
      }

      // 3. Convert to array and sort by relevance
      const sortedRecommendations: IRecommendedAdjustment[] = Array.from(adjustmentMap.values())
        .map((item) => ({
          id: item.adjustment.id,
          title: item.adjustment.title,
          category: item.adjustment.category,
          description: item.adjustment.description,
          relevance_score: Math.min(100, Math.round(item.totalScore / item.sources.length)),
          sources: item.sources,
          selected: false,
        }))
        .sort((a, b) => b.relevance_score - a.relevance_score);

      setRecommendations(sortedRecommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  }, [supabase, selectedDisabilities, selectedChallenges]);

  useEffect(() => {
    if (selectedDisabilities.length > 0 || selectedChallenges.length > 0) {
      fetchRecommendations();
    } else {
      setRecommendations([]);
      setLoading(false);
    }
  }, [fetchRecommendations, selectedDisabilities.length, selectedChallenges.length]);

  return { recommendations, loading, error, refetch: fetchRecommendations };
}

// ----------------------------------------------------------------------
// Hook: useWizardSession
// Manages wizard session state with auto-save
// ----------------------------------------------------------------------

export function useWizardSession() {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<IWizardState>({
    currentStep: 1,
    selectedDisabilities: [],
    selectedChallenges: [],
    selectedAdjustments: [],
    additionalNotes: '',
    sessionId: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing session on mount
  const loadSession = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('wizard_sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('completed_at', null)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows found
        throw fetchError;
      }

      if (data) {
        setSession({
          currentStep: data.current_step,
          selectedDisabilities: data.selected_disabilities || [],
          selectedChallenges: data.selected_challenges || [],
          selectedAdjustments: data.selected_adjustments || [],
          additionalNotes: data.additional_notes || '',
          sessionId: data.id,
        });
      } else {
        // No existing session - load user's saved disabilities from their profile
        const { data: userDisabilities, error: disabilitiesError } = await supabase
          .from('user_disabilities')
          .select('disability_id')
          .eq('user_id', user.id);

        if (!disabilitiesError && userDisabilities && userDisabilities.length > 0) {
          // Pre-populate session with user's profile disabilities
          const disabilityIds = userDisabilities.map((ud) => ud.disability_id);
          setSession({
            currentStep: 1,
            selectedDisabilities: disabilityIds,
            selectedChallenges: [],
            selectedAdjustments: [],
            additionalNotes: '',
            sessionId: null,
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Save session to database
  const saveSession = useCallback(
    async (newState: Partial<IWizardState>) => {
      setSaving(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('User not authenticated');
        }

        const updatedSession = { ...session, ...newState };

        const sessionData = {
          user_id: user.id,
          current_step: updatedSession.currentStep,
          selected_disabilities: updatedSession.selectedDisabilities,
          selected_challenges: updatedSession.selectedChallenges,
          selected_adjustments: updatedSession.selectedAdjustments,
          additional_notes: updatedSession.additionalNotes,
        };

        if (session.sessionId) {
          // Update existing session
          const { error: updateError } = await supabase
            .from('wizard_sessions')
            .update(sessionData)
            .eq('id', session.sessionId);

          if (updateError) throw updateError;
        } else {
          // Create new session
          const { data, error: insertError } = await supabase
            .from('wizard_sessions')
            .insert(sessionData)
            .select()
            .single();

          if (insertError) throw insertError;
          updatedSession.sessionId = data.id;
        }

        setSession(updatedSession);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save session');
      } finally {
        setSaving(false);
      }
    },
    [supabase, session]
  );

  // Update state locally only (for text inputs to avoid save on every keystroke)
  const updateSessionLocal = useCallback((updates: Partial<IWizardState>) => {
    setSession((prev) => ({ ...prev, ...updates }));
  }, []);

  // Update state locally and trigger save (for non-text inputs like selections)
  const updateSession = useCallback(
    (updates: Partial<IWizardState>) => {
      setSession((prev) => ({ ...prev, ...updates }));
      // Don't save additionalNotes on every keystroke - it will be saved on blur or step change
      if (!('additionalNotes' in updates)) {
        saveSession(updates);
      }
    },
    [saveSession]
  );

  // Save notes explicitly (call on blur or before completing)
  const saveNotes = useCallback(() => {
    saveSession({ additionalNotes: session.additionalNotes });
  }, [saveSession, session.additionalNotes]);

  // Complete the wizard and create adjustment request
  const completeWizard = useCallback(async () => {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create the adjustment request
      const { data: request, error: requestError } = await supabase
        .from('adjustment_requests')
        .insert({
          user_id: user.id,
          title: 'Adjustment Request from Wizard',
          detail: session.additionalNotes || 'Submitted via adjustment wizard',
          status: 'NEW',
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Link selected adjustments to the request
      if (session.selectedAdjustments.length > 0) {
        const items = session.selectedAdjustments.map((adjustmentId) => ({
          request_id: request.id,
          adjustment_id: adjustmentId,
        }));

        const { error: itemsError } = await supabase
          .from('adjustment_request_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      // Mark session as completed
      if (session.sessionId) {
        await supabase
          .from('wizard_sessions')
          .update({ completed_at: new Date().toISOString() })
          .eq('id', session.sessionId);
      }

      return request.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete wizard');
      return null;
    } finally {
      setSaving(false);
    }
  }, [supabase, session]);

  // Reset wizard
  const resetWizard = useCallback(async () => {
    if (session.sessionId) {
      await supabase.from('wizard_sessions').delete().eq('id', session.sessionId);
    }
    setSession({
      currentStep: 1,
      selectedDisabilities: [],
      selectedChallenges: [],
      selectedAdjustments: [],
      additionalNotes: '',
      sessionId: null,
    });
  }, [supabase, session.sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return {
    session,
    loading,
    saving,
    error,
    updateSession,
    updateSessionLocal,
    saveNotes,
    completeWizard,
    resetWizard,
  };
}
