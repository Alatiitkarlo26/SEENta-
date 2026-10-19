import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { itemService } from '../services/itemService';
import {
  X,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

function formatRelativeTime(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function NotificationsModal({ isOpen, onClose, onViewItem, anchorRef }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [coords, setCoords] = useState(null);
  const popoverRef = useRef(null);

  // Position popover directly beneath the trigger button
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (anchorRef?.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        const cardWidth = Math.min(410, window.innerWidth - 24);
        const maxAllowedRight = Math.max(12, window.innerWidth - cardWidth - 12);
        const naturalRight = window.innerWidth - rect.right;
        const clampedRight = Math.max(12, Math.min(naturalRight, maxAllowedRight));

        setCoords({
          top: Math.round(rect.bottom + 8),
          right: Math.round(clampedRight)
        });
      } else {
        setCoords({
          top: 68,
          right: 16
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, anchorRef]);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const data = await itemService.getNotifications(user.id);
      setNotifications(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  // Escape key listener to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMarkAsRead = async (notif, e) => {
    e?.stopPropagation();
    try {
      await itemService.markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await itemService.markAllNotificationsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  return (
    <>
      {/* Invisible Click-Outside Dismiss: NO page darkening, NO background blur */}
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Popover Card anchored beneath the alerts button */}
      <div
        ref={popoverRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-popover-title"
        style={
          coords
            ? {
                top: `${coords.top}px`,
                right: `${coords.right}px`,
                maxHeight: 'calc(100vh - 84px)'
              }
            : {
                top: '68px',
                right: '16px',
                maxHeight: 'calc(100vh - 84px)'
              }
        }
        className="fixed z-50 w-[calc(100vw-24px)] sm:w-[410px] max-w-[420px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl shadow-slate-900/15 dark:shadow-black/70 overflow-hidden animate-popoverEnter flex flex-col transition-colors duration-200"
      >
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="notif-popover-title"
                  className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-tight"
                >
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Real-time matches, claim updates, and alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 active:scale-95"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark all</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-90"
              title="Close"
              aria-label="Close notifications"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Segmented Control (All / Unread) */}
        {notifications.length > 0 && (
          <div className="px-5 pt-3 pb-1 flex items-center justify-between shrink-0">
            <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl gap-0.5">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer active:scale-95 ${
                  filter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer active:scale-95 ${
                  filter === 'unread'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {filter === 'unread' && unreadCount > 0 && (
              <span className="text-[10px] text-slate-400 font-medium">
                Filtering unread
              </span>
            )}
          </div>
        )}

        {/* Scrollable Notification List */}
        <div className="overflow-y-auto custom-scrollbar flex-1 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[380px]">
          {error && (
            <div className="m-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-5 h-5 border-2 border-theme border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-medium">Checking alerts...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800/70 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {filter === 'unread' ? 'No unread notifications' : 'All caught up'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[260px] mx-auto leading-relaxed">
                {filter === 'unread'
                  ? 'You have viewed all incoming alerts.'
                  : "You will be alerted here when an item matching your lost report is found or logged on campus."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isMatch = notif.type === 'MATCH';
              const isClaim = notif.type === 'CLAIM';

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.is_read) handleMarkAsRead(notif);
                    if (notif.reference_id && onViewItem) {
                      onViewItem(notif.reference_id);
                    }
                  }}
                  className={`p-4 transition-all duration-150 cursor-pointer flex items-start gap-3 group active:scale-[0.99] ${
                    notif.is_read
                      ? 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                      : 'bg-amber-500/[0.03] dark:bg-amber-500/[0.05] hover:bg-amber-500/[0.07] text-slate-900 dark:text-white'
                  }`}
                >
                  {/* Category Glyph Icon */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105 ${
                      isMatch
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : isClaim
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {isMatch ? (
                      <Sparkles className="w-4 h-4" />
                    ) : isClaim ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isMatch
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                            : isClaim
                            ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {isMatch ? 'Match Alert' : isClaim ? 'Claim Update' : notif.type}
                      </span>

                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1 group-hover:text-theme transition-colors leading-tight">
                      {notif.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.reference_id && (
                      <div className="mt-2 text-[11px] font-semibold text-theme inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Inspect matching item</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Unread dot indicator */}
                  {!notif.is_read && (
                    <span
                      className="w-2 h-2 rounded-full bg-theme shrink-0 mt-2 shadow-2xs"
                      title="Unread"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
          <span className="font-medium">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-semibold transition-all cursor-pointer active:scale-95"
          >
            Dismiss
          </button>
        </div>
      </div>
    </>
  );
}
