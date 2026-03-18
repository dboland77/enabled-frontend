'use client';

import { useState, useEffect, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';

export interface IRole {
  id: string;
  role_name: string;
  role_description: string | null;
}

export function useRoles() {
  const supabase = createClient();
  const [roles, setRoles] = useState<IRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('roles')
        .select('*')
        .order('role_name', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setRoles(data as IRole[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return { roles, loading, error, refetch: fetchRoles };
}
