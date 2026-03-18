'use client';

import { useState, useEffect, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';

// ----------------------------------------------------------------------

export interface UserDisability {
  id: string;
  disability_id: string;
  disability_name: string;
  disability_nhs_slug: string;
}

export interface UserAdjustment {
  id: string;
  adjustment_id: string;
  adjustment_title: string;
  adjustment_type: string;
  adjustment_detail: string | null;
  approved_at: string;
  notes: string | null;
}

export interface UserProfile {
  userId: string;
  firstname: string;
  lastname: string;
  avatar: string | null;
  job_title: string | null;
  role: string | null;
  department: string | null;
  line_manager_id: string | null;
  is_disabled: boolean;
  is_first_login: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdate {
  firstname: string;
  lastname: string;
  job_title?: string | null;
  role?: string | null;
  department?: string | null;
  line_manager_id?: string | null;
  is_disabled?: boolean;
}

export function useUserProfile() {
  const supabase = createClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get the currently authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const { data, error: profileError } = await supabase
        .from('user_profile')
        .select('*')
        .eq('userId', user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
      } else {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const updateAvatar = useCallback(
    async (avatarUrl: string) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        console.log('[v0] updateAvatar - User:', user?.id);
        console.log('[v0] updateAvatar - Avatar URL:', avatarUrl);

        if (!user) {
          console.log('[v0] updateAvatar - No user found');
          return;
        }

        // Use UPDATE since the profile should already exist (created via updateProfile)
        const { data, error: updateError } = await supabase
          .from('user_profile')
          .update({
            avatar: avatarUrl,
            updatedAt: new Date().toISOString(),
          })
          .eq('userId', user.id)
          .select();

        console.log('[v0] updateAvatar - Response data:', data);
        console.log('[v0] updateAvatar - Error:', updateError);

        if (!updateError && data && data.length > 0) {
          setProfile((prev) => prev ? { ...prev, avatar: avatarUrl } : data[0] as UserProfile);
        } else if (data && data.length === 0) {
          console.log('[v0] updateAvatar - No profile found. Please save your profile first.');
        }
      } catch (err) {
        console.error('[v0] Failed to update avatar:', err);
      }
    },
    [supabase]
  );

  const updateProfile = useCallback(
    async (updates: UserProfileUpdate) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // Use upsert to create the profile if it doesn't exist
      const now = new Date().toISOString();
      const { data, error: updateError } = await supabase
        .from('user_profile')
        .upsert({
          userId: user.id,
          firstname: updates.firstname,
          lastname: updates.lastname,
          job_title: updates.job_title ?? null,
          role: updates.role ?? null,
          department: updates.department ?? null,
          line_manager_id: updates.line_manager_id ?? null,
          is_disabled: updates.is_disabled ?? false,
          is_first_login: false, // Mark as not first login after profile update
          createdAt: now,
          updatedAt: now,
        }, {
          onConflict: 'userId',
        })
        .select();

      if (updateError) throw updateError;

      setProfile((prev) =>
        prev 
          ? { ...prev, ...updates, is_first_login: false } 
          : data?.[0] as UserProfile
      );
    },
    [supabase]
  );

  // Fetch user's disabilities
  const fetchUserDisabilities = useCallback(async (): Promise<UserDisability[]> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    type DisabilityQueryResult = {
      id: string;
      disability_id: string;
      disability_index: {
        disability_name: string;
        disability_nhs_slug: string;
      } | null;
    };

    const { data, error: fetchError } = await supabase
      .from('user_disabilities')
      .select(`
        id,
        disability_id,
        disability_index (
          disability_name,
          disability_nhs_slug
        )
      `)
      .eq('user_id', user.id);

    if (fetchError || !data) return [];

    return (data as unknown as DisabilityQueryResult[]).map((item) => ({
      id: item.id,
      disability_id: item.disability_id,
      disability_name: item.disability_index?.disability_name ?? '',
      disability_nhs_slug: item.disability_index?.disability_nhs_slug ?? '',
    }));
  }, [supabase]);

  // Fetch user's approved adjustments
  const fetchUserAdjustments = useCallback(async (): Promise<UserAdjustment[]> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    type AdjustmentQueryResult = {
      id: string;
      adjustment_id: string;
      approved_at: string;
      notes: string | null;
      adjustments: {
        adjustment_title: string;
        adjustment_type: string;
        adjustment_detail: string | null;
      } | null;
    };

    const { data, error: fetchError } = await supabase
      .from('user_adjustments')
      .select(`
        id,
        adjustment_id,
        approved_at,
        notes,
        adjustments (
          adjustment_title,
          adjustment_type,
          adjustment_detail
        )
      `)
      .eq('user_id', user.id);

    if (fetchError || !data) return [];

    return (data as unknown as AdjustmentQueryResult[]).map((item) => ({
      id: item.id,
      adjustment_id: item.adjustment_id,
      adjustment_title: item.adjustments?.adjustment_title ?? '',
      adjustment_type: item.adjustments?.adjustment_type ?? '',
      adjustment_detail: item.adjustments?.adjustment_detail ?? null,
      approved_at: item.approved_at,
      notes: item.notes,
    }));
  }, [supabase]);

  // Add disability to user
  const addUserDisability = useCallback(async (disabilityId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error: insertError } = await supabase
      .from('user_disabilities')
      .insert({
        user_id: user.id,
        disability_id: disabilityId,
      });

    if (insertError) throw insertError;
  }, [supabase]);

  // Remove disability from user
  const removeUserDisability = useCallback(async (userDisabilityId: string) => {
    const { error: deleteError } = await supabase
      .from('user_disabilities')
      .delete()
      .eq('id', userDisabilityId);

    if (deleteError) throw deleteError;
  }, [supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { 
    profile, 
    loading, 
    error, 
    refetch: fetchProfile, 
    updateAvatar, 
    updateProfile,
    fetchUserDisabilities,
    fetchUserAdjustments,
    addUserDisability,
    removeUserDisability,
  };
}
