'use client';

import { useState, useEffect, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';
import { IAdjustmentRequestItem, RequestStatusTypes } from '@/types/adjustmentRequest';

// ----------------------------------------------------------------------

export interface CreateAdjustmentRequestData {
  title: string;
  detail: string;
  adjustmentType: string;
  workfunction: string;
  location: string;
  requiredDate: Date;
}

export interface UpdateAdjustmentRequestData extends CreateAdjustmentRequestData {
  id: string;
  status?: RequestStatusTypes;
}

export function useAdjustmentRequests() {
  const supabase = createClient();
  const [adjustmentRequests, setAdjustmentRequests] = useState<IAdjustmentRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdjustmentRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('adjustment_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('createdAt', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setAdjustmentRequests(data as IAdjustmentRequestItem[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch adjustment requests');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const createAdjustmentRequest = useCallback(
    async (requestData: CreateAdjustmentRequestData) => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error('Not authenticated');
        }

        const now = new Date().toISOString();
        const { data, error: insertError } = await supabase
          .from('adjustment_requests')
          .insert({
            user_id: user.id,
            title: requestData.title,
            detail: requestData.detail,
            adjustmentType: requestData.adjustmentType,
            workfunction: requestData.workfunction,
            location: requestData.location,
            requiredDate: requestData.requiredDate.toISOString(),
            status: RequestStatusTypes.NEW,
            createdAt: now,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setAdjustmentRequests((prev) => [data as IAdjustmentRequestItem, ...prev]);
        return data as IAdjustmentRequestItem;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create adjustment request');
        throw err;
      }
    },
    [supabase]
  );

  const updateAdjustmentRequest = useCallback(
    async (requestData: UpdateAdjustmentRequestData) => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error('Not authenticated');
        }

        const { data, error: updateError } = await supabase
          .from('adjustment_requests')
          .update({
            title: requestData.title,
            detail: requestData.detail,
            adjustmentType: requestData.adjustmentType,
            workfunction: requestData.workfunction,
            location: requestData.location,
            requiredDate: requestData.requiredDate.toISOString(),
            status: requestData.status || RequestStatusTypes.PENDING,
          })
          .eq('id', requestData.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;

        setAdjustmentRequests((prev) =>
          prev.map((item) => (item.id === requestData.id ? (data as IAdjustmentRequestItem) : item))
        );
        return data as IAdjustmentRequestItem;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update adjustment request');
        throw err;
      }
    },
    [supabase]
  );

  const deleteAdjustmentRequest = useCallback(
    async (id: string) => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error('Not authenticated');
        }

        const { error: deleteError } = await supabase
          .from('adjustment_requests')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        setAdjustmentRequests((prev) => prev.filter((item) => item.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete adjustment request');
        return false;
      }
    },
    [supabase]
  );

  useEffect(() => {
    fetchAdjustmentRequests();
  }, [fetchAdjustmentRequests]);

  return {
    adjustmentRequests,
    loading,
    error,
    refetch: fetchAdjustmentRequests,
    createAdjustmentRequest,
    updateAdjustmentRequest,
    deleteAdjustmentRequest,
  };
}
