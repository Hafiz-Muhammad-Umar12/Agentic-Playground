"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Droplets, Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from "lucide-react";
import { authAPI } from "@/lib/api";
import Cookies from "js-cookie";
import { BLOOD_GROUPS } from "@/lib/utils";

interface SignupForm {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  blood_group: string;
  role: string;
  city: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    defaultValues: { role: "both" }
  });

  // Helper: backend error ko readable string mein convert karo
  const parseError = (e: unknown): string => {
    const err = e as {
      response?: {
        data?: {
          detail?: unknown;
        };
      };
      message?: string;
    };

    const detail = err?.response?.data?.detail;

    if (!detail) return err?.message || "Signup failed";

    // String error
    if (typeof detail === "string") return detail;

    // Pydantic validation errors array
    if (Array.isArray(detail)) {
      return detail
        .map((d: { msg?: string; loc?: string[] }) => {
          const field = d?.loc?.slice(-1)[0] || "";
          const msg = d?.msg || "Invalid value";
          return field ? `${field}: ${msg}` : msg;
        })
        .join(", ");
    }

    // Object error
    if (typeof detail === "object") {
      return JSON.stringify(detail);
    }

    return "Signup failed";
  };

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    try {
      const res = await authAPI.signup(data);
      Cookies.set("access_token", res.data.access_token, { expires: 1 });
      Cookies.set("refresh_token", res.data.refresh_token, { expires: 7 });
      toast.success("Account created! Welcome to BloodLink 🩸");
      router.push("/dashboard");
    } catch (e: unknown) {
      toast.error(parseError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-10">
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-blood-900/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 bg-blood-600 rounded-xl flex items-center justify-center">
            <Droplets size={18} className="text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-white">BloodLink</span>
        </div>

        <div className="card border-white/8">
          <h1 className="font-display text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-white/40 text-sm mb-8">Join thousands of lifesavers today</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  {...register("full_name", { required: "Name is required" })}
                  className="input-field pl-10"
                  placeholder="Muhammad Ali"
                />
              </div>
              {errors.full_name && <p className="text-blood-400 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" }
                  })}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  type="email"
                />
              </div>
              {errors.email && <p className="text-blood-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">Phone</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  {...register("phone", { required: "Phone is required" })}
                  className="input-field pl-10"
                  placeholder="+92 300 0000000"
                />
              </div>
              {errors.phone && <p className="text-blood-400 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            {/* Blood Group + Role */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/60 text-xs font-medium mb-1.5 block">Blood Group</label>
                <select
                  {...register("blood_group", { required: "Select blood group" })}
                  className="input-field"
                >
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
                {errors.blood_group && <p className="text-blood-400 text-xs mt-1">{errors.blood_group.message}</p>}
              </div>

              <div>
                <label className="text-white/60 text-xs font-medium mb-1.5 block">I am a</label>
                <select {...register("role")} className="input-field">
                  <option value="both">Donor & Receiver</option>
                  <option value="donor">Donor only</option>
                  <option value="receiver">Receiver only</option>
                </select>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">City</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  {...register("city")}
                  className="input-field pl-10"
                  placeholder="Karachi"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-white/60 text-xs font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  type={showPw ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-blood-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-6 py-3 blood-glow"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 text-sm mt-5">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blood-400 hover:text-blood-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
} 