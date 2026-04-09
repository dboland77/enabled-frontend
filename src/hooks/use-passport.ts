'use client';

import { useState, useEffect, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';
import { IAdjustmentRequestItem, RequestStatusTypes } from '@/types/adjustmentRequest';
import { IPassportData, IPassportHolder, IPassportChallenge, generatePassportNumber } from '@/types/passport';
import { IDisabilityItem } from '@/types/disability';

// ----------------------------------------------------------------------

interface UsePassportReturn {
  passportData: IPassportData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addChallenge: (description: string, category?: string) => Promise<boolean>;
  removeChallenge: (challengeId: string) => Promise<boolean>;
  updateChallenge: (challengeId: string, description: string, category?: string) => Promise<boolean>;
}

export function usePassport(): UsePassportReturn {
  const supabase = createClient();
  const [passportData, setPassportData] = useState<IPassportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPassportData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      // Fetch user profile for additional details
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Fetch user's saved disabilities
      const { data: userDisabilities } = await supabase
        .from('user_disabilities')
        .select(`
          disability_id,
          disabilities (
            id,
            disability_name,
            disability_nhs_slug,
            category,
            subcategory,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      // Fetch user's challenges ("I struggle with")
      const { data: userChallenges } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch approved adjustment requests for this user
      const { data: adjustmentRequests, error: fetchError } = await supabase
        .from('adjustment_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', RequestStatusTypes.APPROVED)
        .order('responded_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      // Map disabilities
      const disabilities: IDisabilityItem[] = (userDisabilities || [])
        .filter((ud: any) => ud.disabilities)
        .map((ud: any) => ({
          id: ud.disabilities.id,
          disability_name: ud.disabilities.disability_name,
          disability_nhs_slug: ud.disabilities.disability_nhs_slug,
          category: ud.disabilities.category,
          subcategory: ud.disabilities.subcategory,
          created_at: ud.disabilities.created_at,
          updated_at: ud.disabilities.updated_at,
        }));

      // Map challenges
      const challenges: IPassportChallenge[] = (userChallenges || []).map((lim: any) => ({
        id: lim.id,
        description: lim.description,
        category: lim.category,
        createdAt: new Date(lim.created_at),
      }));

      // Map database columns to our interface
      const mappedAdjustments: IAdjustmentRequestItem[] = (adjustmentRequests || []).map((req) => ({
        id: req.id,
        title: req.title,
        detail: req.detail,
        createdAt: req.created_at,
        adjustmentType: req.adjustment_type,
        requiredDate: req.required_date,
        workfunction: req.work_function,
        benefit: req.benefit,
        location: req.location,
        disability: req.disability,
        status: req.status,
        approverId: req.approver_id,
        approverName: req.approver_name,
        responseMessage: req.response_message,
        respondedAt: req.responded_at,
        requesterName: req.requester_name,
        requesterEmail: req.requester_email,
      }));

      // Build holder info from user metadata and profile
      const holder: IPassportHolder = {
        id: user.id,
        fullName: profile?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url,
        jobTitle: profile?.job_title,
        department: profile?.department,
        issueDate: new Date(user.created_at || Date.now()),
      };

      // Find the earliest approval date for the passport issue date
      const firstApprovalDate = mappedAdjustments.length > 0
        ? new Date(Math.min(...mappedAdjustments.map(a => new Date(a.respondedAt || a.createdAt).getTime())))
        : new Date();

      // Find the most recent update
      const lastUpdated = mappedAdjustments.length > 0
        ? new Date(Math.max(...mappedAdjustments.map(a => new Date(a.respondedAt || a.createdAt).getTime())))
        : new Date();

      // Build passport data
      const passport: IPassportData = {
        passportNumber: generatePassportNumber(user.id),
        holder: {
          ...holder,
          issueDate: firstApprovalDate,
        },
        disabilities,
        challenges,
        approvedAdjustments: mappedAdjustments,
        stamps: mappedAdjustments.map((adj) => ({
          id: adj.id,
          adjustmentTitle: adj.title || 'Untitled',
          approvalDate: adj.respondedAt || adj.createdAt,
          approverName: adj.approverName || 'Approver',
          approverInitials: getInitials(adj.approverName),
        })),
        issueDate: firstApprovalDate,
        lastUpdated,
      };

      setPassportData(passport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch passport data');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const addChallenge = useCallback(async (description: string, category?: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error: insertError } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          description,
          category: category || null,
        });

      if (insertError) {
        console.error('Error adding challenge:', insertError);
        return false;
      }

      await fetchPassportData();
      return true;
    } catch (err) {
      console.error('Error adding challenge:', err);
      return false;
    }
  }, [supabase, fetchPassportData]);

  const removeChallenge = useCallback(async (challengeId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('user_challenges')
        .delete()
        .eq('id', challengeId);

      if (deleteError) {
        console.error('Error removing challenge:', deleteError);
        return false;
      }

      await fetchPassportData();
      return true;
    } catch (err) {
      console.error('Error removing challenge:', err);
      return false;
    }
  }, [supabase, fetchPassportData]);

  const updateChallenge = useCallback(async (
    challengeId: string,
    description: string,
    category?: string
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('user_challenges')
        .update({
          description,
          category: category || null,
        })
        .eq('id', challengeId);

      if (updateError) {
        console.error('Error updating challenge:', updateError);
        return false;
      }

      await fetchPassportData();
      return true;
    } catch (err) {
      console.error('Error updating challenge:', err);
      return false;
    }
  }, [supabase, fetchPassportData]);

  useEffect(() => {
    fetchPassportData();
  }, [fetchPassportData]);

  return {
    passportData,
    loading,
    error,
    refetch: fetchPassportData,
    addChallenge,
    removeChallenge,
    updateChallenge,
  };
}

// Helper to get initials from name
function getInitials(name: string | null | undefined): string {
  if (!name) return 'AP';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
