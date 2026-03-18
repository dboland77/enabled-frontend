'use client';

import { useState, useEffect, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';

export interface IDepartment {
  id: string;
  department_name: string;
  department_description: string | null;
}

export function useDepartments() {
  const supabase = createClient();
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('departments')
        .select('*')
        .order('department_name', { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setDepartments(data as IDepartment[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return { departments, loading, error, refetch: fetchDepartments };
}
