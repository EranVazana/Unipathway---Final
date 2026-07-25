import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationIcon({ type }) {
  if (type === 'university') return <span className="notif-icon notif-icon--university">🏛️</span>;
  if (type === 'department')  return <span className="notif-icon notif-icon--department">📚</span>;
  return <span className="notif-icon">🔔</span>;
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, clearAll, deleteNotification } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleBellClick() {
    setOpen(prev => !prev);
  }

  function handleNotifClick(notif) {
    if (!notif.read) markRead(notif.id);
  }

  return (
    <div className="notif-bell-wrap" ref={ref}>

      {/* Bell icon — no button wrapper, just the SVG + badge */}
      <div className="notif-bell-trigger" onClick={handleBellClick}>
        <svg
          width="25" height="25"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </div>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown__header">
            <div className="notif-dropdown__actions">
              <button
                type="button"
                className="notif-action-btn"
                onClick={markAllRead}
                disabled={unreadCount === 0}
              >
                Mark all read
              </button>
              <button
                type="button"
                className="notif-action-btn notif-action-btn--clear"
                onClick={clearAll}
                disabled={notifications.length === 0}
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="notif-dropdown__list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <p>You're all caught up!</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`notif-item${notif.read ? '' : ' notif-item--unread'}`}
                  onClick={() => handleNotifClick(notif)}
                >
                  <NotificationIcon type={notif.type} />
                  <div className="notif-item__body">
                    <p className="notif-item__title">{notif.title}</p>
                    <p className="notif-item__message">{notif.message}</p>
                    <p className="notif-item__time">{timeAgo(notif.timestamp)}</p>
                  </div>
                  {!notif.read && <span className="notif-item__dot" />}
                  <button
                    type="button"
                    className="notif-item__delete"
                    onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                    aria-label="Delete notification"
                  >✕</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}