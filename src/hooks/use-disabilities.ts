'use client';

import { useState, useEffect, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';
import { IDisabilityItem } from '@/types/disability';

export function useDisabilities() {
  const supabase = createClient();
  const [disabilities, setDisabilities] = useState<IDisabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisabilities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('disabilities')
        .select('*')
        .order('disability_name', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setDisabilities(data as IDisabilityItem[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch disabilities');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const deleteDisability = useCallback(
    async (id: string) => {
      try {
        const { error: deleteError } = await supabase
          .from('disabilities')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        setDisabilities((prev) => prev.filter((d) => d.id !== id));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete disability');
        return false;
      }
    },
    [supabase]
  );

  useEffect(() => {
    fetchDisabilities();
  }, [fetchDisabilities]);

  return { disabilities, loading, error, refetch: fetchDisabilities, deleteDisability };
}
