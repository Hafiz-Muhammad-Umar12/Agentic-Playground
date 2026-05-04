import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus, Zap, Film, Clock, TrendingUp,
  ChevronRight, RefreshCw, Activity, CheckCircle2,
  AlertCircle, Loader2, Server
} from 'lucide-react'
import { repurposeAPI } from '../services/api'
import { useJobStore } from '../store'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending:      { color: 'text-neutral-400', dot: '#666', label: 'Pending' },
  downloading:  { color: 'text-blue-400',    dot: '#60a5fa', label: 'Downloading' },
  transcribing: { color: 'text-purple-400',  dot: '#c084fc', label: 'Transcribing' },
  analyzing:    { color: 'text-yellow-400',  dot: '#facc15', label: 'Analyzing' },
  clipping:     { color: 'text-orange-400',  dot: '#fb923c', label: 'Clipping' },
  captioning:   { color: 'text-pink-400',    dot: '#f472b6', label: 'Captioning' },
  uploading:    { color: 'text-cyan-400',    dot: '#22d3ee', label: 'Uploading' },
  completed:    { color: 'text-green-400',   dot: '#4ade80', label: 'Completed' },
  failed:       { color: 'text-red-400',     dot: '#f87171', label: 'Failed' },
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const jobs = useJobStore(s => s.getAllJobs())
  const [backendOk, setBackendOk] = useState(null)
  const [checkingBackend, setCheckingBackend] = useState(true)

  useEffect(() => {
    repurposeAPI.healthCheck()
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false))
      .finally(() => setCheckingBackend(false))
  }, [])

  const completedJobs = jobs.filter(j => j.status === 'completed')
  const processingJobs = jobs.filter(j => !['completed', 'failed'].includes(j.status))
  const totalClips = completedJobs.reduce((a, j) => a + (j.total_clips || j.clips?.length || 0), 0)

  return (
    <div className="min-h-screen" style={{ background: '#070708' }}>
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-5xl tracking-wider text-white mb-2">DASHBOARD</h1>
            <p className="font-mono text-sm text-neutral-600">Your video repurposing command center</p>
          </div>
          <Link to="/submit">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary px-5 py-3 rounded-xl flex items-center gap-2 text-sm shrink-0"
            >
              <Plus size={16} /> NEW JOB
            </motion.button>
          </Link>
        </motion.div>

        {/* Backend Status */}
       <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.05 }}
  className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl mb-6 border font-mono text-xs transition-all duration-300 ${
    checkingBackend
      ? 'border-neutral-700 bg-neutral-900/40 text-neutral-400'
      : backendOk
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
      : 'border-red-500/30 bg-red-500/10 text-red-400'
  }`}
>
  {/* LEFT SIDE */}
  <div className="flex items-center gap-3">
    <Server size={13} />

    {checkingBackend && (
      <span className="flex items-center gap-2">
        <span className="animate-pulse">Checking backend connection...</span>
      </span>
    )}

    {!checkingBackend && backendOk && (
      <span className="flex items-center gap-2">
        <span className="text-emerald-400">Backend Online</span>
        <span className="text-emerald-300/70">• All systems operational</span>
      </span>
    )}

    {!checkingBackend && !backendOk && (
      <span className="flex items-center gap-2">
        <span className="text-red-400">Backend Offline</span>
        <span className="text-red-300/70">• Server not reachable</span>
      </span>
    )}
  </div>

  {/* RIGHT SIDE ACTION */}
  {!checkingBackend && (
    <button
      onClick={() => {
        setCheckingBackend(true);
        repurposeAPI
          .healthCheck()
          .then(() => setBackendOk(true))
          .catch(() => setBackendOk(false))
          .finally(() => setCheckingBackend(false));
      }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
    >
      <RefreshCw size={11} className={checkingBackend ? "animate-spin" : ""} />
      Retry
    </button>
  )}
</motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          {[
            { icon: <Film size={18} />, value: jobs.length, label: 'TOTAL JOBS', color: '#FF6B00' },
            { icon: <CheckCircle2 size={18} />, value: completedJobs.length, label: 'COMPLETED', color: '#4ade80' },
            { icon: <Activity size={18} />, value: processingJobs.length, label: 'IN PROGRESS', color: '#60a5fa' },
            { icon: <TrendingUp size={18} />, value: totalClips, label: 'CLIPS MADE', color: '#FFB800' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-2xl p-5 glow-border"
              style={{ background: '#0D0D0F' }}
            >
              <div style={{ color: stat.color }} className="mb-3">{stat.icon}</div>
              <div className="font-display text-4xl text-white mb-1">{stat.value}</div>
              <div className="font-mono text-xs text-neutral-600 tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Jobs List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl tracking-wider text-white">RECENT JOBS</h2>
          </div>

          {jobs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {jobs.map((job, i) => (
                <JobRow key={job.job_id} job={job} index={i} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function JobRow({ job, index }) {
  const navigate = useNavigate()
  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending
  const clipsCount = job.total_clips || job.clips?.length || 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/job/${job.job_id}`)}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all hover:border-orange-500/20 group"
      style={{ background: '#0D0D0F', border: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Status dot */}
      <div className="relative shrink-0">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.dot, boxShadow: `0 0 8px ${cfg.dot}` }} />
        {!['completed', 'failed'].includes(job.status) && (
          <div className="absolute inset-0 rounded-full animate-ping" style={{ background: cfg.dot, opacity: 0.4 }} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm text-white truncate group-hover:text-orange-300 transition-colors">
          {job.video_title || job.youtube_url || 'Uploaded video'}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className={`font-mono text-xs ${cfg.color}`}>{cfg.label}</span>
          {job.duration_seconds && (
            <span className="font-mono text-xs text-neutral-700 flex items-center gap-1">
              <Clock size={9} /> {Math.floor(job.duration_seconds / 60)}m
            </span>
          )}
          <span className="font-mono text-xs text-neutral-700">{job.job_id?.slice(0, 8)}...</span>
        </div>
      </div>

      {/* Progress / Clips */}
      <div className="shrink-0 text-right">
        {job.status === 'completed' ? (
          <div>
            <div className="font-display text-xl text-orange-400">{clipsCount}</div>
            <div className="font-mono text-[10px] text-neutral-700">CLIPS</div>
          </div>
        ) : job.status === 'failed' ? (
          <AlertCircle size={18} className="text-red-400" />
        ) : (
          <div className="flex items-center gap-2">
            <div className="font-mono text-xs text-neutral-500">{job.progress || 0}%</div>
            <Loader2 size={14} className="text-orange-400 animate-spin" />
          </div>
        )}
      </div>

      <ChevronRight size={16} className="text-neutral-700 group-hover:text-orange-400 transition-colors shrink-0" />
    </motion.div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20 rounded-2xl glow-border"
      style={{ background: '#0D0D0F' }}
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-float"
        style={{ background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.2)' }}
      >
        <Zap size={36} className="text-orange-400" />
      </div>
      <h3 className="font-display text-3xl tracking-wider text-white mb-2">NO JOBS YET</h3>
      <p className="font-mono text-sm text-neutral-600 mb-8">Submit your first video to start creating viral clips</p>
      <Link to="/submit">
        <button className="btn-primary px-8 py-3 rounded-xl text-sm">
          + SUBMIT VIDEO
        </button>
      </Link>
    </motion.div>
  )
}
