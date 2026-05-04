"use client";
import { useEffect, useState } from "react";
import { notificationsAPI } from "@/lib/api";
import { Notification } from "@/types";
import { timeAgo } from "@/lib/utils";
import { Bell, CheckCheck, Trash2, Droplets, Clock } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

const NOTIF_ICONS: Record<string, string> = {
  new_request:        "🩸",
  request_accepted:   "✅",
  donation_confirmed: "🎯",
  donation_completed: "🎉",
  request_fulfilled:  "💚",
  request_expired:    "⏰",
  general:            "📢",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll({ unread_only: unreadOnly, limit: 50 });
      setNotifications(res.data);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifs(); }, [unreadOnly]);

  const markAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success("All marked as read");
  };

  const markRead = async (id: number) => {
    await notificationsAPI.markRead([id]);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const clearAll = async () => {
    if (!confirm("Clear all notifications?")) return;
    await notificationsAPI.clear();
    setNotifications([]);
    toast.success("Cleared");
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-blood-400 text-sm mt-1">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-ghost text-sm py-2 px-3">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className="text-white/30 hover:text-red-400 p-2 rounded-lg hover:bg-red-950/20 transition-all">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setUnreadOnly(false)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!unreadOnly ? "bg-blood-600 text-white" : "text-white/40 hover:text-white"}`}
        >
          All
        </button>
        <button
          onClick={() => setUnreadOnly(true)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${unreadOnly ? "bg-blood-600 text-white" : "text-white/40 hover:text-white"}`}
        >
          Unread
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="card animate-pulse h-20" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Bell size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-display text-lg">No notifications</p>
          <p className="text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markRead(n.id)}
              className={`card cursor-pointer transition-all duration-200 hover:border-white/15 ${
                !n.is_read
                  ? "border-blood-800/50 bg-blood-950/30"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">
                  {NOTIF_ICONS[n.notification_type] || "📢"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${!n.is_read ? "text-white" : "text-white/70"}`}>
                      {n.title}
                    </p>
                    {!n.is_read && (
                      <div className="w-2 h-2 bg-blood-500 rounded-full shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-white/25 text-xs flex items-center gap-1">
                      <Clock size={10} /> {timeAgo(n.created_at)}
                    </span>
                    {n.related_request_id && (
                      <Link
                        href={`/dashboard/requests/${n.related_request_id}`}
                        onClick={e => e.stopPropagation()}
                        className="text-blood-400 text-xs hover:text-blood-300"
                      >
                        View Request →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
