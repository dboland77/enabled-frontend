'use client';

import { useState, useEffect, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';

// ----------------------------------------------------------------------

export interface UserProfile {
  userId: string;
  firstname: string;
  lastname: string;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdate {
  firstname: string;
  lastname: string;
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

      console.log('[v0] updateProfile - User:', user?.id);
      console.log('[v0] updateProfile - Updates:', updates);

      if (!user) throw new Error('Not authenticated');

      // Use upsert to create the profile if it doesn't exist
      const now = new Date().toISOString();
      const { data, error: updateError } = await supabase
        .from('user_profile')
        .upsert({
          userId: user.id,
          firstname: updates.firstname,
          lastname: updates.lastname,
          createdAt: now,
          updatedAt: now,
        }, {
          onConflict: 'userId',
        })
        .select();

      console.log('[v0] updateProfile - Response data:', data);
      console.log('[v0] updateProfile - Error:', updateError);

      if (updateError) throw updateError;

      setProfile((prev) =>
        prev 
          ? { ...prev, firstname: updates.firstname, lastname: updates.lastname } 
          : data?.[0] as UserProfile
      );
    },
    [supabase]
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile, updateAvatar, updateProfile };
}
