"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { requestsAPI } from "@/lib/api";
import { BloodRequest } from "@/types";
import { URGENCY_COLORS, STATUS_COLORS, bloodGroupColor, timeAgo } from "@/lib/utils";
import { PlusCircle, Droplets, MapPin, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestsAPI.getMy()
      .then(r => setRequests(r.data))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">My Requests</h1>
          <p className="text-white/40 text-sm mt-1">All blood requests you have created</p>
        </div>
        <Link href="/dashboard/create" className="btn-primary">
          <PlusCircle size={16} /> New
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="card animate-pulse h-28" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Droplets size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-display text-lg">No requests yet</p>
          <p className="text-sm mt-1 mb-6">Create your first blood request</p>
          <Link href="/dashboard/create" className="btn-primary mx-auto w-fit">
            Create Request <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <Link key={req.id} href={`/dashboard/requests/${req.id}`} className="card hover:border-white/15 transition-all block">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${bloodGroupColor(req.blood_group)} rounded-xl flex items-center justify-center text-white font-bold shrink-0`}>
                  {req.blood_group}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-white font-semibold">{req.patient_name}</h3>
                    <span className={`badge ${URGENCY_COLORS[req.urgency]}`}>{req.urgency}</span>
                    <span className={`badge ${STATUS_COLORS[req.status]}`}>{req.status.replace("_", " ")}</span>
                  </div>
                  <p className="text-white/40 text-sm flex items-center gap-1">
                    <MapPin size={11} /> {req.hospital_name}, {req.city}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-white/30">
                    <span>{req.units_fulfilled}/{req.units_needed} units</span>
                    <span>{timeAgo(req.created_at)}</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-white/20 shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
