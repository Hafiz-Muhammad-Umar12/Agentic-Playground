"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { requestsAPI, donationsAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { BloodRequest } from "@/types";
import { BLOOD_GROUPS, URGENCY_COLORS, STATUS_COLORS, bloodGroupColor, timeAgo } from "@/lib/utils";
import { Search, PlusCircle, Droplets, MapPin, Phone, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function RequestsPage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterBG, setFilterBG] = useState<string>("");
  const [filterUrgency, setFilterUrgency] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("open");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterBG) params.blood_group = filterBG;
      if (filterUrgency) params.urgency = filterUrgency;
      if (filterStatus) params.status = filterStatus;
      const res = await requestsAPI.getAll(params);
      setRequests(res.data);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [filterBG, filterUrgency, filterStatus]);

  const filtered = requests.filter(r =>
    !search ||
    r.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    r.city.toLowerCase().includes(search.toLowerCase()) ||
    r.hospital_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Blood Requests</h1>
          <p className="text-white/40 text-sm mt-1">{filtered.length} requests found</p>
        </div>
        <Link href="/dashboard/create" className="btn-primary">
          <PlusCircle size={16} /> New Request
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              className="input-field pl-10"
              placeholder="Search by patient, hospital, city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className="input-field md:w-36" value={filterBG} onChange={e => setFilterBG(e.target.value)}>
            <option value="">All Groups</option>
            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>

          <select className="input-field md:w-36" value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)}>
            <option value="">All Urgency</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select className="input-field md:w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="">All Status</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="card animate-pulse h-32" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Droplets size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-display text-lg">No requests found</p>
          <p className="text-sm mt-1">Try changing your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(req => (
            <RequestCard key={req.id} req={req} onRefresh={fetchRequests} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({ req, onRefresh }: { req: BloodRequest; onRefresh: () => void }) {
  const { user } = useAuth();
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await donationsAPI.accept({ request_id: req.id, units_donated: 1 });
      toast.success("You have accepted this request! 🩸");
      onRefresh();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Failed to accept");
    } finally {
      setAccepting(false);
    }
  };

  const isOwner = user?.id === req.requester_id;
  const canDonate = req.status === "open" && !isOwner;

  return (
    <div className="card hover:border-white/15 transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 ${bloodGroupColor(req.blood_group)} rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0`}>
          {req.blood_group}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="text-white font-semibold text-base">{req.patient_name}</h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={`badge ${URGENCY_COLORS[req.urgency]}`}>{req.urgency}</span>
                <span className={`badge ${STATUS_COLORS[req.status]}`}>{req.status.replace("_", " ")}</span>
                <span className="text-white/30 text-xs">
                  {req.units_fulfilled}/{req.units_needed} units
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/dashboard/requests/${req.id}`} className="btn-ghost text-sm py-1.5 px-3">
                Details
              </Link>
              {canDonate && (
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="btn-primary text-sm py-1.5 px-3 blood-glow"
                >
                  {accepting ? "..." : "Donate 🩸"}
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 flex-wrap text-sm text-white/40">
            <span className="flex items-center gap-1.5">
              <MapPin size={12} /> {req.hospital_name}, {req.city}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone size={12} /> {req.contact_number}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} /> {timeAgo(req.created_at)}
            </span>
          </div>

          {req.description && (
            <p className="mt-2 text-white/40 text-sm line-clamp-2">{req.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}