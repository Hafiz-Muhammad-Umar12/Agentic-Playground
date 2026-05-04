"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { requestsAPI } from "@/lib/api";
import { BLOOD_GROUPS } from "@/lib/utils";
import { ArrowLeft, Droplets } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface FormData {
  patient_name: string;
  blood_group: string;
  units_needed: number;
  hospital_name: string;
  hospital_address: string;
  city: string;
  urgency: string;
  description: string;
  contact_number: string;
  required_by: string;
}

export default function CreateRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { units_needed: 1, urgency: "medium" },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        units_needed: Number(data.units_needed),
        required_by: data.required_by ? new Date(data.required_by).toISOString() : undefined,
        description: data.description || undefined,
      };
      const res = await requestsAPI.create(payload);
      toast.success("Blood request created! 🩸");
      router.push(`/dashboard/requests/${res.data.id}`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="text-white/60 text-xs font-medium mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-blood-400 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <Link href="/dashboard/requests" className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 w-fit">
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-white">Create Blood Request</h1>
        <p className="text-white/40 mt-1 text-sm">Fill in the details to notify matching donors instantly.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Patient Info */}
        <div className="card">
          <h2 className="font-display text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Droplets size={16} className="text-blood-400" /> Patient Information
          </h2>
          <div className="space-y-4">
            <Field label="Patient Name *" error={errors.patient_name?.message}>
              <input
                {...register("patient_name", { required: "Required" })}
                className="input-field"
                placeholder="Muhammad Usman"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Blood Group *" error={errors.blood_group?.message}>
                <select {...register("blood_group", { required: "Required" })} className="input-field">
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </Field>

              <Field label="Units Needed *">
                <input
                  {...register("units_needed", { required: true, min: 1, max: 10 })}
                  className="input-field"
                  type="number"
                  min={1}
                  max={10}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Hospital Info */}
        <div className="card">
          <h2 className="font-display text-base font-semibold text-white mb-4">Hospital Details</h2>
          <div className="space-y-4">
            <Field label="Hospital Name *" error={errors.hospital_name?.message}>
              <input
                {...register("hospital_name", { required: "Required" })}
                className="input-field"
                placeholder="Aga Khan Hospital"
              />
            </Field>

            <Field label="Hospital Address *" error={errors.hospital_address?.message}>
              <input
                {...register("hospital_address", { required: "Required" })}
                className="input-field"
                placeholder="Stadium Road, Karachi"
              />
            </Field>

            <Field label="City *" error={errors.city?.message}>
              <input
                {...register("city", { required: "Required" })}
                className="input-field"
                placeholder="Karachi"
              />
            </Field>
          </div>
        </div>

        {/* Request Details */}
        <div className="card">
          <h2 className="font-display text-base font-semibold text-white mb-4">Request Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Urgency Level *">
                <select {...register("urgency")} className="input-field">
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="critical">🔴 Critical</option>
                </select>
              </Field>

              <Field label="Required By">
                <input
                  {...register("required_by")}
                  className="input-field"
                  type="datetime-local"
                />
              </Field>
            </div>

            <Field label="Contact Number *" error={errors.contact_number?.message}>
              <input
                {...register("contact_number", { required: "Required" })}
                className="input-field"
                placeholder="+92 300 0000000"
              />
            </Field>

            <Field label="Additional Notes">
              <textarea
                {...register("description")}
                className="input-field resize-none h-24"
                placeholder="Any additional information about the patient or condition..."
              />
            </Field>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 blood-glow text-base">
          {loading ? "Creating Request..." : "🩸 Create Blood Request"}
        </button>
      </form>
    </div>
  );
}
