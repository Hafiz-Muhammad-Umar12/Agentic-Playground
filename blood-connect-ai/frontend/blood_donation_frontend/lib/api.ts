import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = Cookies.get("refresh_token");
        if (!refresh) throw new Error("No refresh token");
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refresh,
        });
        Cookies.set("access_token", data.access_token, { expires: 1 });
        Cookies.set("refresh_token", data.refresh_token, { expires: 7 });
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  signup: (data: object) => api.post("/auth/signup", data),
  me: () => api.get("/auth/me"),
  refresh: (refresh_token: string) =>
    api.post("/auth/refresh", { refresh_token }),
};

// ─── Blood Requests ───────────────────────────────────────────────────
export const requestsAPI = {
  getAll: (params?: object) => api.get("/requests", { params }),
  getMy: () => api.get("/requests/my"),
  getOne: (id: number) => api.get(`/requests/${id}`),
  create: (data: object) => api.post("/requests", data),
  update: (id: number, data: object) => api.patch(`/requests/${id}`, data),
  cancel: (id: number) => api.delete(`/requests/${id}`),
};

// ─── Donations ────────────────────────────────────────────────────────
export const donationsAPI = {
  accept: (data: { request_id: number; units_donated: number }) =>
    api.post("/donations", data),
  getMy: () => api.get("/donations/my"),
  getForRequest: (requestId: number) =>
    api.get(`/donations/request/${requestId}`),
  update: (id: number, data: object) => api.patch(`/donations/${id}`, data),
};

// ─── Users ────────────────────────────────────────────────────────────
export const usersAPI = {
  getDonors: (params?: object) => api.get("/users/donors", { params }),
  getUser: (id: number) => api.get(`/users/${id}`),
  updateMe: (data: object) => api.patch("/users/me", data),
};

// ─── Notifications ────────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: (params?: object) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markRead: (ids: number[]) =>
    api.patch("/notifications/mark-read", { notification_ids: ids }),
  markAllRead: () => api.patch("/notifications/mark-all-read"),
  clear: () => api.delete("/notifications/clear"),
};

// ─── Matching ────────────────────────────────────────────────────────
export const matchingAPI = {
  findDonors: (blood_group: string, city?: string) =>
    api.get("/matching/donors", { params: { blood_group, city } }),
  compatibility: (blood_group: string) =>
    api.get(`/matching/compatibility/${blood_group}`),
};
