import {useCallback, useEffect, useMemo, useState} from 'react';
import {useAuth, useOrg} from '@/context';
import type {AppNotification} from '@/types/notifications';
import {
  createNotification,
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToNotifications,
} from '@/services/notificationService';

export function useNotifications() {
  const {user} = useAuth();
  const {currentOrg} = useOrg();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToNotifications({
      recipientId: user.id,
      orgId: currentOrg?.id,
      onUpdate: list => {
        setNotifications(list);
        setLoading(false);
        setError(null);
      },
      onError: err => {
        setError(err?.message || 'Failed to load notifications');
        setLoading(false);
      },
    });

    return () => {
      unsubscribe?.();
    };
  }, [user?.id, currentOrg?.id]);

  // Derive unreadCount from the real-time notifications list
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const createAppNotification = useCallback(
    async (payload: Parameters<typeof createNotification>[0]) => {
      return createNotification(payload);
    },
    [],
  );

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;
      await markNotificationAsRead(notificationId, user.id);
      // Optimistic update: mark locally so badge updates instantly
      setNotifications(prev => prev.map(n => (n.id === notificationId ? {...n, isRead: true} : n)));
    },
    [user?.id],
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    await markAllNotificationsAsRead(user.id);
    // Optimistic update
    setNotifications(prev => prev.map(n => ({...n, isRead: true})));
  }, [user?.id]);

  const removeNotification = useCallback(async (notificationId: string) => {
    await deleteNotification(notificationId);
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const sorted = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const getMs = (dateInput: any): number => {
        if (!dateInput) return 0;
        if (dateInput instanceof Date) {
          const t = dateInput.getTime();
          return isNaN(t) ? 0 : t;
        }
        if (typeof dateInput.toDate === 'function') {
          const d = dateInput.toDate();
          return d instanceof Date ? d.getTime() : 0;
        }
        const parsed = new Date(dateInput);
        const t = parsed.getTime();
        return isNaN(t) ? 0 : t;
      };

      return getMs(b.createdAt) - getMs(a.createdAt);
    });
  }, [notifications]);

  return {
    notifications: sorted,
    unreadCount,
    loading,
    error,
    actions: {
      createAppNotification,
      markRead,
      markAllAsRead,
      removeNotification,
    },
  };
}
