"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { requestsAPI, donationsAPI, notificationsAPI } from "@/lib/api";
import { BloodRequest, Donation, Notification } from "@/types";
import { timeAgo, URGENCY_COLORS, STATUS_COLORS, bloodGroupColor } from "@/lib/utils";
import {
  Droplets, PlusCircle, Users, Bell, TrendingUp,
  Heart, AlertCircle, ArrowRight, Clock
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      requestsAPI.getAll({ limit: 5, status: "open" }),
      donationsAPI.getMy(),
      notificationsAPI.getAll({ limit: 5 }),
      notificationsAPI.getUnreadCount(),
    ]).then(([req, don, notif, count]) => {
      setRequests(req.data);
      setDonations(don.data);
      setNotifications(notif.data);
      setUnread(count.data.unread_count);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Open Requests", value: requests.length, icon: AlertCircle, color: "text-blood-400", bg: "bg-blood-950/60" },
    { label: "My Donations", value: donations.length, icon: Heart, color: "text-green-400", bg: "bg-green-950/60" },
    { label: "Notifications", value: unread, icon: Bell, color: "text-yellow-400", bg: "bg-yellow-950/60" },
    { label: "Blood Group", value: user?.blood_group || "—", icon: Droplets, color: "text-purple-400", bg: "bg-purple-950/60" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Welcome, {user?.full_name.split(" ")[0]} 👋
        </h1>
        <p className="text-white/40 mt-1">Here's what's happening on BloodLink today.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { href: "/dashboard/create", icon: PlusCircle, label: "New Request", color: "border-blood-700/40 hover:border-blood-500/60 hover:bg-blood-950/30" },
          { href: "/dashboard/requests", icon: List2, label: "View Requests", color: "border-white/10 hover:border-white/20 hover:bg-white/5" },
          { href: "/dashboard/donors", icon: Users, label: "Find Donors", color: "border-white/10 hover:border-white/20 hover:bg-white/5" },
          { href: "/dashboard/notifications", icon: Bell, label: "Notifications", color: "border-white/10 hover:border-white/20 hover:bg-white/5" },
        ].map(({ href, icon: Icon, label, color }) => (
          <Link key={href} href={href}
            className={`card flex flex-col items-center gap-2 py-5 border ${color} transition-all duration-200 text-center`}>
            <Icon size={20} className="text-white/60" />
            <span className="text-white/70 text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-white font-bold text-2xl">{value}</p>
            <p className="text-white/40 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-semibold text-white">Recent Requests</h2>
            <Link href="/dashboard/requests" className="text-blood-400 text-sm hover:text-blood-300 flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />)}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-white/30">
              <Droplets size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No open requests</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {requests.map(req => (
                <Link key={req.id} href={`/dashboard/requests/${req.id}`}
                  className="flex items-center gap-3 p-3 bg-dark-600 hover:bg-dark-500 rounded-lg transition-colors group">
                  <div className={`w-9 h-9 ${bloodGroupColor(req.blood_group)} rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                    {req.blood_group}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{req.patient_name}</p>
                    <p className="text-white/40 text-xs truncate">{req.hospital_name} · {req.city}</p>
                  </div>
                  <span className={`badge ${URGENCY_COLORS[req.urgency]} shrink-0`}>
                    {req.urgency}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-semibold text-white">Notifications</h2>
            <Link href="/dashboard/notifications" className="text-blood-400 text-sm hover:text-blood-300 flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-white/30">
              <Bell size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {notifications.map(n => (
                <div key={n.id} className={`p-3 rounded-lg transition-colors ${!n.is_read ? "bg-blood-950/40 border border-blood-900/30" : "bg-dark-600"}`}>
                  <div className="flex items-start gap-2.5">
                    <Bell size={13} className={`mt-0.5 shrink-0 ${!n.is_read ? "text-blood-400" : "text-white/30"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{n.title}</p>
                      <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{n.message}</p>
                    </div>
                    <span className="text-white/30 text-xs shrink-0 flex items-center gap-1">
                      <Clock size={10} /> {timeAgo(n.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// inline icon shim
function List2(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 24, ...rest } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  );
}
