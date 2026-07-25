import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { apiClient } from '../services/apiClient';

const NotificationContext = createContext(null);

const SOCKET_URL = process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  // Load persisted notifications from DB on login
  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setNotifications([]);
      return;
    }

    // Fetch existing notifications from DB
    apiClient.get('/notifications')
      .then(data => {
        const normalized = data.map(n => ({
          id:         n.notificationId,
          type:       n.type,
          action:     n.action,
          title:      n.title,
          message:    n.message,
          resourceId: n.resourceId,
          timestamp:  n.createDate,
          read:       n.status === 'read',
        }));
        setNotifications(normalized);
      })
      .catch(() => {});

    // Connect socket
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      // Event 1: presence:join
      socket.emit('presence:join', { userId: user.userId, role: user.userRole });
    });

    // Event 5: notification:new — add incoming to top of list
    socket.on('notification:new', (notification) => {
      setNotifications(prev => [{
        id:         notification.id,
        type:       notification.type,
        action:     notification.action,
        title:      notification.title,
        message:    notification.message,
        resourceId: notification.resourceId,
        timestamp:  notification.timestamp,
        read:       false,
      }, ...prev]);
    });

    socket.on('notification:read_ack',     ({ notificationId }) => {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    });
    socket.on('notification:read_all_ack', () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    });
    socket.on('notification:clear_ack',    () => {
      setNotifications([]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // Event 2: mark one as read (socket + API)
  const markRead = useCallback((notificationId) => {
    if (socketRef.current) socketRef.current.emit('notification:read', { notificationId });
    apiClient.put(`/notifications/${notificationId}/read`).catch(() => {});
  }, []);

  // Event 3: mark all as read (socket + API)
  const markAllRead = useCallback(() => {
    if (socketRef.current) socketRef.current.emit('notification:read_all');
    apiClient.put('/notifications/read-all').catch(() => {});
  }, []);

  // Event 4: clear all — single API call
  const clearAll = useCallback(() => {
    if (socketRef.current) socketRef.current.emit('notification:clear');
    apiClient.delete('/notifications/clear-all').catch(() => {});
    setNotifications([]);
  }, []);

  // Delete one notification (client-side remove + API)
  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    apiClient.delete(`/notifications/${notificationId}`).catch(() => {});
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, clearAll, deleteNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
}