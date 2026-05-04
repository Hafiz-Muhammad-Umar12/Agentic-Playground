import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────
export const signup = (data) => api.post('/auth/signup', data);
export const login  = (data) => api.post('/auth/login', data);
export const getMe  = ()     => api.get('/auth/me/profile');

// ─── Device ──────────────────────────────────────────────────────────────────
export const getMyDevices    = ()        => api.get('/device/my-devices');
export const getDevice       = (id)      => api.get(`/device/${id}`);
export const registerDevice  = (data)    => api.post('/device/register', data);
export const deleteDevice    = (id)      => api.delete(`/device/${id}`);

// ─── Location ─────────────────────────────────────────────────────────────────
export const getLastLocation    = (id)                => api.get(`/location/last/${id}`);
export const getLocationHistory = (id, limit=100)     => api.get(`/location/history/${id}?limit=${limit}`);

export default api;
