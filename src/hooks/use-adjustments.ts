'use client';

import { useState, useEffect, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';
import { IAdjustmentItem } from '@/types/adjustment';

export function useAdjustments() {
  const supabase = createClient();
  const [adjustments, setAdjustments] = useState<IAdjustmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdjustments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('adjustments')
        .select('*')
        .order('adjustment_title', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setAdjustments(data as IAdjustmentItem[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch adjustments');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const deleteAdjustment = useCallback(
    async (id: string) => {
      try {
        const { error: deleteError } = await supabase
          .from('adjustments')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        setAdjustments((prev) => prev.filter((a) => a.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete adjustment');
        return false;
      }
    },
    [supabase]
  );

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  return { adjustments, loading, error, refetch: fetchAdjustments, deleteAdjustment };
}
