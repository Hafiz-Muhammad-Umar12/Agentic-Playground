import { BloodGroup, UrgencyLevel, RequestStatus, DonationStatus } from "@/types";

export const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  low: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
};

export const STATUS_COLORS: Record<RequestStatus, string> = {
  open: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  fulfilled: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  expired: "bg-red-900/20 text-red-300 border-red-900/30",
};

export const DONATION_STATUS_COLORS: Record<DonationStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-gray-500/20 text-gray-400",
};

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PK", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function bloodGroupColor(bg: BloodGroup): string {
  const colors: Record<BloodGroup, string> = {
    "A+":  "bg-red-600",
    "A-":  "bg-red-800",
    "B+":  "bg-orange-600",
    "B-":  "bg-orange-800",
    "AB+": "bg-purple-600",
    "AB-": "bg-purple-800",
    "O+":  "bg-blood-600",
    "O-":  "bg-blood-900",
  };
  return colors[bg] || "bg-gray-600";
}
