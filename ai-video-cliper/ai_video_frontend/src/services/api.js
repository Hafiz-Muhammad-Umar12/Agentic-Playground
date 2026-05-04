import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

// Attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ────────────────────────────────────────────────────

export const authAPI = {
  login: async (email, password) => {
    const form = new FormData()
    form.append('username', email)
    form.append('password', password)
    const res = await api.post('/api/v1/auth/login', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },

  register: async (email, password) => {
    const res = await api.post('/api/v1/auth/register', { email, password })
    return res.data
  },

  getMe: async () => {
    const res = await api.get('/api/v1/auth/me')
    return res.data
  }
}

// ─── Repurpose ───────────────────────────────────────────────

export const repurposeAPI = {
  submitYouTube: async ({ youtube_url, platforms, language, max_clips }) => {
    const res = await api.post('/api/v1/repurpose/submit', {
      youtube_url, platforms, language, max_clips
    })
    return res.data
  },

  submitUpload: async (file, { platforms, language, max_clips }) => {
    const form = new FormData()
    form.append('file', file)
    form.append('platforms', platforms.join(','))
    form.append('language', language)
    form.append('max_clips', max_clips)
    const res = await api.post('/api/v1/repurpose/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 min for upload
    })
    return res.data
  },

  getStatus: async (jobId) => {
    const res = await api.get(`/api/v1/repurpose/status/${jobId}`)
    return res.data
  },

  getResults: async (jobId) => {
    const res = await api.get(`/api/v1/repurpose/results/${jobId}`)
    return res.data
  },

  getDownloadUrl: async (clipId) => {
    const res = await api.get(`/api/v1/repurpose/clip/${clipId}/download`)
    return res.data
  },

  publishClips: async (jobId, tokens) => {
    const res = await api.post('/api/v1/repurpose/publish', {
      job_id: jobId,
      youtube_token: tokens.youtube,
      tiktok_token: tokens.tiktok,
    })
    return res.data
  },

  healthCheck: async () => {
    const res = await api.get('/health')
    return res.data
  }
}

export default api
