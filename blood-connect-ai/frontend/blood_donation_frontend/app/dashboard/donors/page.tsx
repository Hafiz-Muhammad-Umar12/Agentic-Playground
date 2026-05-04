"use client";
import { useState } from "react";
import { matchingAPI } from "@/lib/api";
import { User, BloodGroup } from "@/types";
import { BLOOD_GROUPS, bloodGroupColor } from "@/lib/utils";
import { Search, Users, Phone, MapPin, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function DonorsPage() {
  const [donors, setDonors] = useState<User[]>([]);
  const [bloodGroup, setBloodGroup] = useState<string>("");
  const [city, setCity] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [compatibility, setCompatibility] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!bloodGroup) { toast.error("Select a blood group"); return; }
    setLoading(true);
    try {
      const [donorRes, compatRes] = await Promise.all([
        matchingAPI.findDonors(bloodGroup, city || undefined),
        matchingAPI.compatibility(bloodGroup),
      ]);
      setDonors(donorRes.data);
      setCompatibility(compatRes.data.can_receive_from || []);
      setSearched(true);
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Find Donors</h1>
        <p className="text-white/40 text-sm mt-1">Search for available blood donors near you.</p>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <select
            className="input-field md:w-44"
            value={bloodGroup}
            onChange={e => setBloodGroup(e.target.value)}
          >
            <option value="">Select Blood Group *</option>
            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>

          <div className="relative flex-1">
            <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              className="input-field pl-10"
              placeholder="Filter by city (optional)"
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>

          <button onClick={handleSearch} disabled={loading} className="btn-primary px-8">
            <Search size={16} />
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Compatibility info */}
        {compatibility.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-white/40 text-xs mb-2">
              Compatible donors for <strong className="text-white">{bloodGroup}</strong>:
            </p>
            <div className="flex gap-2 flex-wrap">
              {compatibility.map(bg => (
                <span key={bg} className={`${bloodGroupColor(bg as BloodGroup)} text-white text-xs font-bold px-2.5 py-1 rounded-lg`}>
                  {bg}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {!searched ? (
        <div className="text-center py-20 text-white/20">
          <Users size={48} className="mx-auto mb-3 opacity-20" />
          <p className="font-display text-xl">Search for donors</p>
          <p className="text-sm mt-1">Select a blood group to find compatible donors</p>
        </div>
      ) : loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="card animate-pulse h-28" />)}
        </div>
      ) : donors.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-display text-lg">No donors found</p>
          <p className="text-sm mt-1">Try removing the city filter</p>
        </div>
      ) : (
        <>
          <p className="text-white/40 text-sm mb-4">{donors.length} donor(s) found</p>
          <div className="grid md:grid-cols-2 gap-4">
            {donors.map(donor => (
              <div key={donor.id} className="card hover:border-blood-800/40 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 ${bloodGroupColor(donor.blood_group)} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {donor.blood_group}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{donor.full_name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {donor.is_available ? (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle size={11} /> Available
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-white/30 text-xs">
                          <XCircle size={11} /> Unavailable
                        </span>
                      )}
                      <span className="text-white/20">·</span>
                      <span className="text-white/40 text-xs">{donor.role}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-white/40">
                  {donor.city && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {donor.city}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Phone size={11} /> {donor.phone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
