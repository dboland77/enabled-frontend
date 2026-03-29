'use client';

import { useState, useEffect, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';
import { IAdjustmentRequestItem, RequestStatusTypes } from '@/types/adjustmentRequest';
import { IPassportData, IPassportHolder, generatePassportNumber } from '@/types/passport';

// ----------------------------------------------------------------------

interface UsePassportReturn {
  passportData: IPassportData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
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

      // Build holder info from user metadata
      const holder: IPassportHolder = {
        id: user.id,
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatarUrl: user.user_metadata?.avatar_url,
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

  useEffect(() => {
    fetchPassportData();
  }, [fetchPassportData]);

  return {
    passportData,
    loading,
    error,
    refetch: fetchPassportData,
  };
}

// Helper to get initials from name
function getInitials(name: string | null | undefined): string {
  if (!name) return 'AP';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
