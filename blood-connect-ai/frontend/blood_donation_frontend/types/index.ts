// ─── Enums ────────────────────────────────────────────────────────────
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type UserRole = "donor" | "receiver" | "both";
export type UrgencyLevel = "low" | "medium" | "high" | "critical";
export type RequestStatus = "open" | "in_progress" | "fulfilled" | "cancelled" | "expired";
export type DonationStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type NotificationType =
  | "new_request" | "request_accepted" | "donation_confirmed"
  | "donation_completed" | "request_fulfilled" | "request_expired" | "general";

// ─── User ────────────────────────────────────────────────────────────
export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  blood_group: BloodGroup;
  role: UserRole;
  city?: string;
  address?: string;
  is_active: boolean;
  is_available: boolean;
  last_donation_date?: string;
  created_at: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  blood_group: BloodGroup;
  role: UserRole;
  city?: string;
}

// ─── Blood Request ────────────────────────────────────────────────────
export interface BloodRequest {
  id: number;
  requester_id: number;
  patient_name: string;
  blood_group: BloodGroup;
  units_needed: number;
  units_fulfilled: number;
  hospital_name: string;
  hospital_address: string;
  city: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  description?: string;
  contact_number: string;
  required_by?: string;
  created_at: string;
  requester?: User;
}

export interface CreateRequestPayload {
  patient_name: string;
  blood_group: BloodGroup;
  units_needed: number;
  hospital_name: string;
  hospital_address: string;
  city: string;
  urgency: UrgencyLevel;
  description?: string;
  contact_number: string;
  required_by?: string;
}

// ─── Donation ─────────────────────────────────────────────────────────
export interface Donation {
  id: number;
  donor_id: number;
  request_id: number;
  status: DonationStatus;
  units_donated: number;
  scheduled_date?: string;
  donated_at?: string;
  notes?: string;
  created_at: string;
}

// ─── Notification ─────────────────────────────────────────────────────
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: NotificationType;
  is_read: boolean;
  related_request_id?: number;
  related_donation_id?: number;
  created_at: string;
}
