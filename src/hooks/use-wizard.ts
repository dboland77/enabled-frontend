'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { createClient } from '@/lib/supabase/client';
import { ILimitationItem, IRecommendedAdjustment, IWizardState } from '@/types/wizard';
import { IDisabilityItem } from '@/types/disability';
import { IAdjustmentItem } from '@/types/adjustment';

// ----------------------------------------------------------------------
// Hook: useLimitations
// Fetches all limitations, optionally filtered by disability IDs
// ----------------------------------------------------------------------

export function useLimitations(disabilityIds?: string[]) {
  const supabase = useMemo(() => createClient(), []);
  const [limitations, setLimitations] = useState<ILimitationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLimitations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (disabilityIds && disabilityIds.length > 0) {
        // Fetch limitations linked to selected disabilities
        const { data: linkedLimitations, error: linkError } = await supabase
          .from('disability_limitations')
          .select('limitation_id')
          .in('disability_id', disabilityIds);

        if (linkError) throw linkError;

        const limitationIds = [...new Set(linkedLimitations?.map((l) => l.limitation_id) || [])];

        if (limitationIds.length > 0) {
          const { data, error: fetchError } = await supabase
            .from('limitations')
            .select('*')
            .in('id', limitationIds)
            .order('category', { ascending: true })
            .order('name', { ascending: true });

          if (fetchError) throw fetchError;
          setLimitations((data || []) as ILimitationItem[]);
        } else {
          // No linked limitations, fetch all
          const { data, error: fetchError } = await supabase
            .from('limitations')
            .select('*')
            .order('category', { ascending: true })
            .order('name', { ascending: true });

          if (fetchError) throw fetchError;
          setLimitations((data || []) as ILimitationItem[]);
        }
      } else {
        // No disabilities selected, fetch all limitations
        const { data, error: fetchError } = await supabase
          .from('limitations')
          .select('*')
          .order('category', { ascending: true })
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;
        setLimitations((data || []) as ILimitationItem[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch limitations');
    } finally {
      setLoading(false);
    }
  }, [supabase, disabilityIds]);

  useEffect(() => {
    fetchLimitations();
  }, [fetchLimitations]);

  return { limitations, loading, error, refetch: fetchLimitations };
}

// ----------------------------------------------------------------------
// Hook: useRecommendedAdjustments
// Calculates recommended adjustments based on selected disabilities and limitations
// ----------------------------------------------------------------------

export function useRecommendedAdjustments(
  selectedDisabilities: string[],
  selectedLimitations: string[]
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
          sources: { type: 'disability' | 'limitation'; name: string; score: number }[];
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

      // 2. Get adjustments from limitations
      if (selectedLimitations.length > 0) {
        const { data: limitationAdjustments, error: laError } = await supabase
          .from('limitation_adjustments')
          .select(
            `
            relevance_score,
            limitation:limitations(id, name),
            adjustment:adjustments(*)
          `
          )
          .in('limitation_id', selectedLimitations);

        if (laError) throw laError;

        limitationAdjustments?.forEach((la: any) => {
          const adjId = la.adjustment.id;
          const existing = adjustmentMap.get(adjId);

          const source = {
            type: 'limitation' as const,
            name: la.limitation.name,
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
  }, [supabase, selectedDisabilities, selectedLimitations]);

  useEffect(() => {
    if (selectedDisabilities.length > 0 || selectedLimitations.length > 0) {
      fetchRecommendations();
    } else {
      setRecommendations([]);
      setLoading(false);
    }
  }, [fetchRecommendations, selectedDisabilities.length, selectedLimitations.length]);

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
    selectedLimitations: [],
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
          selectedLimitations: data.selected_limitations || [],
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
            selectedLimitations: [],
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
          selected_limitations: updatedSession.selectedLimitations,
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
      selectedLimitations: [],
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
