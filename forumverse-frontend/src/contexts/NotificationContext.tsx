import { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import axios from '@/lib/axios';
import socket from '@/lib/socket';
import { Notification } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Helper function to check if user is properly authenticated with token
  const isProperlyAuthenticated = () => {
    const token = localStorage.getItem('token');
    return isAuthenticated && token;
  };

  const fetchNotifications = useCallback(async () => {
    if (!isProperlyAuthenticated()) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/notifications');
      setNotifications(response.data);
      
      const unread = response.data.filter((n: Notification) => !n.read).length;
      setUnreadCount(unread);
    } catch (error: any) {
      // Silently fail on 401 errors (user may not be fully authenticated yet)
      if (error.response?.status !== 401) {
        console.error('Error fetching notifications:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isProperlyAuthenticated()) return;
    
    try {
      const response = await axios.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated]);

  const markAsRead = async (id: string) => {
    if (!isProperlyAuthenticated()) {
      console.warn('Cannot mark notification as read: not authenticated');
      toast({
        title: 'Authentication Required',
        description: 'Please log in to interact with notifications',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const response = await axios.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? response.data : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn('Auth token may have expired. Please refresh the page.');
        toast({
          title: 'Session Expired',
          description: 'Please refresh the page and log in again',
          variant: 'destructive',
        });
      } else {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const markAllAsRead = async () => {
    if (!isProperlyAuthenticated()) {
      console.warn('Cannot mark all notifications as read: not authenticated');
      return;
    }
    
    try {
      await axios.patch('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Error marking all notifications as read:', error);
      } else {
        console.warn('Auth token may have expired. Please refresh the page.');
      }
    }
  };

  const deleteNotification = async (id: string) => {
    if (!isProperlyAuthenticated()) {
      console.warn('Cannot delete notification: not authenticated');
      toast({
        title: 'Authentication Required',
        description: 'Please log in to interact with notifications',
        variant: 'destructive',
      });
      return;
    }
    
    // Find the notification BEFORE deleting it
    const deletedNotification = notifications.find(n => n.id === id);
    const wasUnread = deletedNotification && !deletedNotification.read;
    
    try {
      await axios.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Update unread count if deleted notification was unread
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn('Auth token may have expired. Please refresh the page.');
        toast({
          title: 'Session Expired',
          description: 'Please refresh the page and log in again',
          variant: 'destructive',
        });
      } else {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const deleteAllNotifications = async () => {
    if (!isProperlyAuthenticated()) {
      console.warn('Cannot delete all notifications: not authenticated');
      return;
    }
    
    try {
      await axios.delete('/notifications');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Error deleting all notifications:', error);
      } else {
        console.warn('Auth token may have expired. Please refresh the page.');
      }
    }
  };

  // Initial fetch - add a small delay to ensure token is set
  useEffect(() => {
    if (isAuthenticated) {
      // Small delay to ensure auth token is properly set in axios interceptor
      const timeoutId = setTimeout(() => {
        fetchNotifications();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Socket.io listeners
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Join user's notification room
    socket.emit('join', user.id);

    // Listen for new notifications
    socket.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.emit('leave', user.id);
      socket.off('notification');
    };
  }, [isAuthenticated, user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};



