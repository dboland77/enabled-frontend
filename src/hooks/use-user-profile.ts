'use client';

import useSWR, { mutate } from 'swr';
import { useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';

// ----------------------------------------------------------------------

const PROFILE_CACHE_KEY = 'user-profile';

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

// Fetcher function for SWR
async function fetchUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient();
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error: profileError } = await supabase
    .from('user_profile')
    .select('*')
    .eq('userId', user.id)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  return data as UserProfile;
}

export function useUserProfile() {
  const supabase = createClient();

  const { data: profile, error, isLoading: loading } = useSWR<UserProfile | null>(
    PROFILE_CACHE_KEY,
    fetchUserProfile,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
    }
  );

  const refetch = useCallback(() => {
    mutate(PROFILE_CACHE_KEY);
  }, []);

  const updateAvatar = useCallback(
    async (avatarUrl: string) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const { data, error: updateError } = await supabase
          .from('user_profile')
          .update({
            avatar: avatarUrl,
            updatedAt: new Date().toISOString(),
          })
          .eq('userId', user.id)
          .select();

        if (!updateError && data && data.length > 0) {
          // Update the SWR cache immediately for all components
          mutate(PROFILE_CACHE_KEY, (current: UserProfile | null | undefined) => 
            current ? { ...current, avatar: avatarUrl } : current,
            false
          );
        }
      } catch (err) {
        console.error('Failed to update avatar:', err);
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

      const now = new Date().toISOString();
      
      // Use UPDATE instead of UPSERT since the profile should already exist
      const { data, error: updateError } = await supabase
        .from('user_profile')
        .update({
          firstname: updates.firstname,
          lastname: updates.lastname,
          job_title: updates.job_title ?? null,
          role: updates.role ?? null,
          department: updates.department ?? null,
          line_manager_id: updates.line_manager_id ?? null,
          is_disabled: updates.is_disabled ?? false,
          is_first_login: false,
          updatedAt: now,
        })
        .eq('userId', user.id)
        .select();

      if (updateError) throw new Error(`Failed to update profile: ${updateError.message}`);

      // Update the SWR cache immediately for all components
      mutate(PROFILE_CACHE_KEY, (current: UserProfile | null | undefined) => 
        current 
          ? { ...current, ...updates, is_first_login: false } 
          : data?.[0] as UserProfile,
        false
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

  return { 
    profile: profile ?? null, 
    loading, 
    error: error?.message ?? null, 
    refetch, 
    updateAvatar, 
    updateProfile,
    fetchUserDisabilities,
    fetchUserAdjustments,
    addUserDisability,
    removeUserDisability,
  };
}
