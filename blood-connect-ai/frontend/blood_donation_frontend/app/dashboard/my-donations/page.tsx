"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { donationsAPI } from "@/lib/api";
import { Donation } from "@/types";
import { DONATION_STATUS_COLORS, timeAgo, formatDate } from "@/lib/utils";
import { Droplets, Calendar, ArrowRight, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function MyDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    donationsAPI.getMy()
      .then(r => setDonations(r.data))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const handleComplete = async (id: number) => {
    try {
      await donationsAPI.update(id, { status: "completed" });
      toast.success("Donation marked as completed! Thank you 🩸");
      setDonations(prev => prev.map(d => d.id === id ? { ...d, status: "completed" } : d));
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel this donation?")) return;
    try {
      await donationsAPI.update(id, { status: "cancelled" });
      setDonations(prev => prev.map(d => d.id === id ? { ...d, status: "cancelled" } : d));
      toast.success("Donation cancelled");
    } catch {
      toast.error("Failed");
    }
  };

  const stats = {
    total: donations.length,
    completed: donations.filter(d => d.status === "completed").length,
    pending: donations.filter(d => d.status === "pending").length,
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">My Donations</h1>
        <p className="text-white/40 text-sm mt-1">Track all your blood donation activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Completed", value: stats.completed, color: "text-green-400" },
          { label: "Pending", value: stats.pending, color: "text-yellow-400" },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-white/40 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="card animate-pulse h-28" />)}
        </div>
      ) : donations.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Droplets size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-display text-lg">No donations yet</p>
          <p className="text-sm mt-1 mb-6">Find blood requests and help save lives</p>
          <Link href="/dashboard/requests" className="btn-primary mx-auto w-fit">
            Browse Requests <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {donations.map(d => (
            <div key={d.id} className="card">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blood-950/80 border border-blood-800/40 rounded-lg flex items-center justify-center">
                    <Droplets size={16} className="text-blood-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      Request #{d.request_id}
                    </p>
                    <p className="text-white/40 text-xs">{d.units_donated} unit(s) · {timeAgo(d.created_at)}</p>
                  </div>
                </div>
                <span className={`badge ${DONATION_STATUS_COLORS[d.status]}`}>
                  {d.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-white/40 mb-3">
                {d.scheduled_date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={11} /> Scheduled: {formatDate(d.scheduled_date)}
                  </span>
                )}
                {d.donated_at && (
                  <span className="flex items-center gap-1">
                    <CheckCircle size={11} className="text-green-400" /> Donated: {formatDate(d.donated_at)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/dashboard/requests/${d.request_id}`}
                  className="btn-ghost text-xs py-1.5 px-3">
                  View Request <ArrowRight size={12} />
                </Link>
                {d.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleComplete(d.id)}
                      className="text-xs text-green-400 hover:text-green-300 border border-green-500/20 hover:border-green-500/40 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                    >
                      <CheckCircle size={12} /> Mark Completed
                    </button>
                    <button
                      onClick={() => handleCancel(d.id)}
                      className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-950/20 transition-all"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
