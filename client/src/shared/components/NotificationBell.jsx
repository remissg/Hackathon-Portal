import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Ticket,
  QrCode,
  Users,
  Award,
  Star,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Info,
} from 'lucide-react';

const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(isoString).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  });
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'pass':
      return <QrCode className="w-4 h-4 text-emerald-400" />;
    case 'invite':
      return <Users className="w-4 h-4 text-indigo-400" />;
    case 'status':
      return <Award className="w-4 h-4 text-amber-400" />;
    case 'evaluation':
      return <Star className="w-4 h-4 text-yellow-400" />;
    case 'role':
      return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    case 'success':
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case 'system':
      return <Sparkles className="w-4 h-4 text-sky-400" />;
    default:
      return <Info className="w-4 h-4 text-sky-400" />;
  }
};

const NotificationBell = ({ align = 'right', className = '' }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const containerRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications?limit=30');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('[Notification Sync Error]:', err.response?.data?.message || err.message);
    }
  }, [isAuthenticated]);

  // Initial fetch and 30-second live polling
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('[Mark All Read Error]:', err);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.patch(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notif._id ? { ...n, isRead: true, readAt: new Date() } : n
          )
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      } catch (err) {
        console.error('[Mark Read Error]:', err);
      }
    }

    setIsOpen(false);

    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('[Clear Notifications Error]:', err);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next) fetchNotifications();
        }}
        className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center justify-center"
        title="Notifications"
        aria-label="Toggle notifications dropdown"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-cyan-500 text-slate-950 font-extrabold text-[10px] flex items-center justify-center animate-pulse shadow-sm shadow-cyan-500/50">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Popover Dropdown (100% Solid Opaque #090e1a Background — Zero Transparency) */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'left' ? 'left-0' : 'right-0'
          } mt-2 w-80 sm:w-96 rounded-2xl bg-[#090e1a] border border-slate-700 shadow-2xl shadow-black ring-1 ring-slate-700/80 py-3 z-[100] animate-fade-in divide-y divide-slate-800`}
          style={{ backgroundColor: '#090e1a', opacity: 1 }}
        >
          {/* Header */}
          <div className="px-4 pb-2.5 flex items-center justify-between bg-[#090e1a]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white tracking-tight">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* Notifications Scroll List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800 py-1 bg-[#090e1a]">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center bg-[#090e1a]">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-2 text-slate-500">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-300">All caught up!</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  No notifications found for {user?.email}
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.isRead;
                return (
                  <button
                    key={n._id}
                    type="button"
                    onClick={() => handleItemClick(n)}
                    className={`w-full text-left px-4 py-3 transition flex items-start gap-3 group ${
                      isUnread
                        ? 'bg-[#121c2e] hover:bg-[#18263e] border-l-2 border-cyan-400'
                        : 'bg-[#090e1a] hover:bg-slate-800'
                    }`}
                    style={{ backgroundColor: isUnread ? '#121c2e' : '#090e1a' }}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800 border border-slate-700 shrink-0 group-hover:scale-105 transition-transform">
                      {getTypeIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p
                          className={`text-xs font-semibold leading-snug truncate ${
                            isUnread ? 'text-white' : 'text-slate-300'
                          }`}
                        >
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium whitespace-nowrap">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 pt-2.5 flex items-center justify-between text-[11px] bg-[#090e1a]">
              <span className="text-slate-400 font-medium">HackSphere Live Alerts</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
