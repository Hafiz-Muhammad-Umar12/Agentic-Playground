"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { requestsAPI, donationsAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { BloodRequest, Donation } from "@/types";
import { URGENCY_COLORS, STATUS_COLORS, bloodGroupColor, formatDate, timeAgo } from "@/lib/utils";
import { MapPin, Phone, Clock, User, ArrowLeft, Droplets, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function RequestDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [req, setReq] = useState<BloodRequest | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    requestsAPI.getOne(Number(id))
      .then(r => {
        setReq(r.data);
        // If owner, also fetch donations
        if (r.data.requester_id === user?.id) {
          return donationsAPI.getForRequest(Number(id));
        }
      })
      .then(d => { if (d) setDonations(d.data); })
      .catch(() => toast.error("Request not found"))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await donationsAPI.accept({ request_id: Number(id), units_donated: 1 });
      toast.success("You accepted this request! 🩸");
      router.push("/dashboard/my-donations");
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Failed");
    } finally {
      setAccepting(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this request?")) return;
    setCancelling(true);
    try {
      await requestsAPI.cancel(Number(id));
      toast.success("Request cancelled");
      router.push("/dashboard/requests");
    } catch {
      toast.error("Failed to cancel");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blood-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!req) return (
    <div className="p-8 text-center text-white/40">Request not found</div>
  );

  const isOwner = user?.id === req.requester_id;
  const canDonate = req.status === "open" && !isOwner;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <Link href="/dashboard/requests" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 w-fit">
        <ArrowLeft size={15} /> Back to Requests
      </Link>

      <div className="card mb-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-16 h-16 ${bloodGroupColor(req.blood_group)} rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0`}>
            {req.blood_group}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-white">{req.patient_name}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`badge ${URGENCY_COLORS[req.urgency]}`}>{req.urgency} urgency</span>
              <span className={`badge ${STATUS_COLORS[req.status]}`}>{req.status.replace("_", " ")}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-white/50">Units collected</span>
            <span className="text-white font-medium">{req.units_fulfilled} / {req.units_needed}</span>
          </div>
          <div className="h-2 bg-dark-500 rounded-full overflow-hidden">
            <div
              className="h-full bg-blood-gradient rounded-full transition-all"
              style={{ width: `${Math.min(100, (req.units_fulfilled / req.units_needed) * 100)}%` }}
            />
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { icon: MapPin, label: "Hospital", value: req.hospital_name },
            { icon: MapPin, label: "Address", value: req.hospital_address },
            { icon: MapPin, label: "City", value: req.city },
            { icon: Phone, label: "Contact", value: req.contact_number },
            { icon: Clock, label: "Posted", value: timeAgo(req.created_at) },
            { icon: Clock, label: "Required By", value: req.required_by ? formatDate(req.required_by) : "ASAP" },
            { icon: User, label: "Requested By", value: req.requester?.full_name || "—" },
            { icon: Droplets, label: "Blood Type", value: req.blood_group },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-dark-600 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} className="text-white/30" />
                <span className="text-white/40 text-xs">{label}</span>
              </div>
              <p className="text-white text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>

        {req.description && (
          <div className="bg-dark-600 rounded-lg p-4 mb-6">
            <p className="text-white/40 text-xs mb-1">Description</p>
            <p className="text-white/80 text-sm leading-relaxed">{req.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {canDonate && (
            <button onClick={handleAccept} disabled={accepting} className="btn-primary blood-glow flex-1 justify-center py-3">
              {accepting ? "Accepting..." : "🩸 Donate Blood"}
            </button>
          )}
          {isOwner && req.status === "open" && (
            <button onClick={handleCancel} disabled={cancelling}
              className="btn-ghost border-red-500/30 text-red-400 hover:bg-red-950/20 flex-1 justify-center py-3">
              <XCircle size={16} /> {cancelling ? "Cancelling..." : "Cancel Request"}
            </button>
          )}
        </div>
      </div>

      {/* Donations list (owner only) */}
      {isOwner && donations.length > 0 && (
        <div className="card">
          <h2 className="font-display text-lg font-semibold text-white mb-4">Donors ({donations.length})</h2>
          <div className="space-y-3">
            {donations.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-dark-600 rounded-lg">
                <div>
                  <p className="text-white text-sm font-medium">Donor #{d.donor_id}</p>
                  <p className="text-white/40 text-xs">{d.units_donated} unit(s) · {timeAgo(d.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${d.status === "completed" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>
                    {d.status}
                  </span>
                  {d.status === "pending" && (
                    <button
                      onClick={async () => {
                        await donationsAPI.update(d.id, { status: "confirmed" });
                        toast.success("Donation confirmed!");
                        setDonations(prev => prev.map(x => x.id === d.id ? { ...x, status: "confirmed" } : x));
                      }}
                      className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                    >
                      <CheckCircle size={13} /> Confirm
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
