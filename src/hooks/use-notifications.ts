'use client';

import { useState, useEffect, useCallback } from 'react';

import { createClient } from '@/lib/supabase/client';
import {
  INotification,
  NotificationRow,
  transformNotification,
  NotificationType,
  NotificationCategory,
} from '@/types/notification';

// ----------------------------------------------------------------------

export interface CreateNotificationData {
  userId: string;
  title: string;
  message?: string;
  type: NotificationType;
  category: NotificationCategory;
  relatedRequestId?: string;
  metadata?: Record<string, unknown>;
}

export function useNotifications() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
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
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        const transformed = (data as NotificationRow[]).map(transformNotification);
        setNotifications(transformed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error('Not authenticated');
        }

        const { error: updateError } = await supabase
          .from('notifications')
          .update({
            is_read: true,
            read_at: new Date().toISOString(),
          })
          .eq('id', notificationId)
          .eq('user_id', user.id);

        if (updateError) throw updateError;

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        );

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
        return false;
      }
    },
    [supabase]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (updateError) throw updateError;

      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: n.readAt || now }))
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
      return false;
    }
  }, [supabase]);

  const createNotification = useCallback(
    async (data: CreateNotificationData) => {
      try {
        // Check if a notification of the same type already exists for this user
        const { data: existing, error: checkError } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', data.userId)
          .eq('type', data.type)
          .limit(1);

        if (checkError) {
          console.error('Failed to check existing notifications:', checkError);
          throw checkError;
        }

        // If notification of this type already exists, skip creation
        if (existing && existing.length > 0) {
          console.log(`Notification of type "${data.type}" already exists, skipping creation`);
          return null;
        }

        const insertData = {
          user_id: data.userId,
          title: data.title,
          message: data.message || null,
          type: data.type,
          category: data.category,
          related_request_id: data.relatedRequestId || null,
          metadata: data.metadata || {},
          is_read: false,
        };

        const { data: result, error: insertError } = await supabase
          .from('notifications')
          .insert(insertData)
          .select()
          .single();

        if (insertError) throw insertError;

        return transformNotification(result as NotificationRow);
      } catch (err) {
        console.error('Failed to create notification:', err);
        throw err;
      }
    },
    [supabase]
  );

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      // Optimistic update - remove from local state immediately
      const previousNotifications = notifications;
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          // Rollback on auth error
          setNotifications(previousNotifications);
          throw new Error('Not authenticated');
        }

        const { error: deleteError } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId)
          .eq('user_id', user.id);

        if (deleteError) {
          // Rollback on delete error
          setNotifications(previousNotifications);
          throw deleteError;
        }

        return true;
      } catch (err) {
        console.error('Failed to delete notification:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete notification');
        return false;
      }
    },
    [supabase, notifications]
  );

  // Subscribe to real-time notifications
  useEffect(() => {
    const setupSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotification = transformNotification(payload.new as NotificationRow);
            setNotifications((prev) => [newNotification, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, [supabase]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  return {
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
  };
}
