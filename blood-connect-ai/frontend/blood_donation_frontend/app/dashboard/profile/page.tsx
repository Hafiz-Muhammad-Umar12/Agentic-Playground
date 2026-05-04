"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/auth";
import { usersAPI } from "@/lib/api";
import { BLOOD_GROUPS, formatDate, bloodGroupColor } from "@/lib/utils";
import { User, Mail, Phone, MapPin, Droplets, Save, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

interface ProfileForm {
  full_name: string;
  phone: string;
  city: string;
  address: string;
  last_donation_date: string;
}

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);

  const { register, handleSubmit } = useForm<ProfileForm>({
    defaultValues: {
      full_name: user?.full_name || "",
      phone: user?.phone || "",
      city: user?.city || "",
      address: user?.address || "",
      last_donation_date: user?.last_donation_date
        ? new Date(user.last_donation_date).toISOString().split("T")[0]
        : "",
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true);
    try {
      await usersAPI.updateMe({
        ...data,
        last_donation_date: data.last_donation_date
          ? new Date(data.last_donation_date).toISOString()
          : undefined,
      });
      await refresh();
      toast.success("Profile updated!");
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      await usersAPI.updateMe({ is_available: !user?.is_available });
      await refresh();
      toast.success(user?.is_available ? "Marked as unavailable" : "Marked as available!");
    } catch {
      toast.error("Failed");
    } finally {
      setToggling(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">My Profile</h1>
        <p className="text-white/40 text-sm mt-1">Manage your account details</p>
      </div>

      {/* Profile Card */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 ${bloodGroupColor(user.blood_group)} rounded-2xl flex items-center justify-center text-white font-bold text-xl`}>
            {user.blood_group}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">{user.full_name}</h2>
            <p className="text-white/40 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge bg-blood-950/60 text-blood-400 border-blood-800/40">
                {user.blood_group}
              </span>
              <span className="badge bg-dark-500 text-white/50 border-white/10 capitalize">
                {user.role}
              </span>
              <span className={`badge ${user.is_active ? "bg-green-950/60 text-green-400 border-green-800/40" : "bg-gray-900/60 text-gray-500 border-gray-700/40"}`}>
                {user.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center justify-between p-4 bg-dark-600 rounded-xl">
          <div>
            <p className="text-white font-medium text-sm">Donor Availability</p>
            <p className="text-white/40 text-xs mt-0.5">
              {user.is_available ? "You are visible to receivers" : "You are hidden from receivers"}
            </p>
          </div>
          <button
            onClick={toggleAvailability}
            disabled={toggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              user.is_available
                ? "bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30"
                : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
            }`}
          >
            {user.is_available
              ? <><ToggleRight size={18} /> Available</>
              : <><ToggleLeft size={18} /> Unavailable</>
            }
          </button>
        </div>

        {user.last_donation_date && (
          <p className="text-white/30 text-xs mt-3 text-center">
            Last donation: {formatDate(user.last_donation_date)}
          </p>
        )}
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
        <h2 className="font-display text-lg font-semibold text-white mb-2">Edit Information</h2>

        <div>
          <label className="text-white/60 text-xs font-medium mb-1.5 block">Full Name</label>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input {...register("full_name")} className="input-field pl-10" />
          </div>
        </div>

        <div>
          <label className="text-white/60 text-xs font-medium mb-1.5 block">Phone</label>
          <div className="relative">
            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input {...register("phone")} className="input-field pl-10" />
          </div>
        </div>

        <div>
          <label className="text-white/60 text-xs font-medium mb-1.5 block">City</label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input {...register("city")} className="input-field pl-10" placeholder="Karachi" />
          </div>
        </div>

        <div>
          <label className="text-white/60 text-xs font-medium mb-1.5 block">Address</label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input {...register("address")} className="input-field pl-10" placeholder="Street, Area" />
          </div>
        </div>

        <div>
          <label className="text-white/60 text-xs font-medium mb-1.5 block">Last Donation Date</label>
          <div className="relative">
            <Droplets size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input {...register("last_donation_date")} className="input-field pl-10" type="date" />
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="text-white/60 text-xs font-medium mb-1.5 block">Email (cannot change)</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={user.email} className="input-field pl-10 opacity-40 cursor-not-allowed" disabled />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
          <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
