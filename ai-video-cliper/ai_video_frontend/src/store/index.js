import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        localStorage.removeItem('auth_token')
        set({ token: null, user: null })
      },
    }),
    { name: 'auth-store' }
  )
)

export const useJobStore = create((set, get) => ({
  jobs: {},
  activeJobId: null,

  setActiveJob: (jobId) => set({ activeJobId: jobId }),

  addJob: (job) => set((s) => ({
    jobs: { ...s.jobs, [job.job_id]: { ...job, clips: [] } }
  })),

  updateJob: (jobId, data) => set((s) => ({
    jobs: {
      ...s.jobs,
      [jobId]: { ...s.jobs[jobId], ...data }
    }
  })),

  setJobResults: (jobId, results) => set((s) => ({
    jobs: {
      ...s.jobs,
      [jobId]: { ...s.jobs[jobId], ...results, loaded: true }
    }
  })),

  getJob: (jobId) => get().jobs[jobId],

  getAllJobs: () => Object.values(get().jobs).sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  ),
}))
