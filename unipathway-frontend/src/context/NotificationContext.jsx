import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { apiClient } from '../services/apiClient';

const NotificationContext = createContext(null);

// Resolves the Socket.IO server URL.
// - If REACT_APP_API_BASE_URL is an explicit absolute URL, use its origin.
// - Otherwise (relative path like '/api', or unset), decide by environment:
//   - Local dev (CRA dev server also binds to :3000) -> explicitly target the
//     backend's default port instead of window.location.origin, which would
//     point back at the frontend dev server itself.
//   - Everywhere else (production) -> window.location.origin, since the
//     Express backend serves both the API and the built frontend.
function resolveSocketUrl() {
  const base = process.env.REACT_APP_API_BASE_URL;

  if (base && /^https?:\/\//i.test(base)) {
    return base.replace(/\/api\/?$/, '');
  }

  const isLocalDev = typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname);

  if (isLocalDev) {
    return 'http://localhost:3000';
  }

  return window.location.origin;
}

const SOCKET_URL = resolveSocketUrl();

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