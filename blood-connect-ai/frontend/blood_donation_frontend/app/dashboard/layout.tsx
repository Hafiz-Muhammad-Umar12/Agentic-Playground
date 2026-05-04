"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { notificationsAPI } from "@/lib/api";
import {
  Droplets, LayoutDashboard, PlusCircle, List,
  Users, Bell, User, LogOut, Menu, X, ChevronRight
} from "lucide-react";

const NAV = [
  { href: "/dashboard",              icon: LayoutDashboard, label: "Dashboard"       },
  { href: "/dashboard/requests",     icon: List,            label: "Blood Requests"  },
  { href: "/dashboard/create",       icon: PlusCircle,      label: "New Request"     },
  { href: "/dashboard/donors",       icon: Users,           label: "Find Donors"     },
  { href: "/dashboard/my-donations", icon: Droplets,        label: "My Donations"    },
  { href: "/dashboard/notifications",icon: Bell,            label: "Notifications"   },
  { href: "/dashboard/profile",      icon: User,            label: "Profile"         },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    notificationsAPI.getUnreadCount()
      .then(r => setUnread(r.data.unread_count))
      .catch(() => {});
    const t = setInterval(() => {
      notificationsAPI.getUnreadCount()
        .then(r => setUnread(r.data.unread_count))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(t);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blood-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-dark-800 border-r border-white/5 z-30 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:flex
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/5">
          <div className="w-8 h-8 bg-blood-600 rounded-lg flex items-center justify-center">
            <Droplets size={15} className="text-white" />
          </div>
          <span className="font-display text-lg font-bold text-white">BloodLink</span>
          <button className="ml-auto md:hidden text-white/40" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* User pill */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 bg-dark-700 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 bg-blood-800 rounded-full flex items-center justify-center text-blood-300 font-bold text-sm">
              {user.full_name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.full_name}</p>
              <p className="text-white/40 text-xs truncate">{user.blood_group} · {user.role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                  ${active
                    ? "bg-blood-600/20 text-blood-400 border border-blood-600/20"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <Icon size={16} className={active ? "text-blood-400" : "text-white/40 group-hover:text-white/70"} />
                <span className="flex-1">{label}</span>
                {label === "Notifications" && unread > 0 && (
                  <span className="bg-blood-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
                {active && <ChevronRight size={14} className="text-blood-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-400/5 w-full transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center gap-3 px-4 py-4 border-b border-white/5 bg-dark-800">
          <button onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Droplets size={16} className="text-blood-500" />
            <span className="font-display font-bold text-white">BloodLink</span>
          </div>
          <Link href="/dashboard/notifications" className="ml-auto relative text-white/60">
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blood-600 rounded-full text-[10px] text-white flex items-center justify-center">
                {unread}
              </span>
            )}
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
