import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2, CheckCircle2, XCircle, Mic, Brain,
  Scissors, Type, CloudUpload, ArrowRight, Clock
} from 'lucide-react'
import { useJobStore } from '../store'
import { useJobPoller } from '../hooks/useJobPoller'
import Navbar from '../components/Navbar'
import ClipCard from '../components/ClipCard'

const STEPS = [
  { status: 'downloading', icon: <CloudUpload size={16} />, label: 'Downloading Video', range: [5, 18] },
  { status: 'transcribing', icon: <Mic size={16} />, label: 'Transcribing Audio', range: [20, 38] },
  { status: 'analyzing', icon: <Brain size={16} />, label: 'AI Viral Analysis', range: [40, 53] },
  { status: 'clipping', icon: <Scissors size={16} />, label: 'Cutting Clips', range: [55, 68] },
  { status: 'captioning', icon: <Type size={16} />, label: 'Adding Captions & Hooks', range: [70, 83] },
  { status: 'uploading', icon: <CloudUpload size={16} />, label: 'Uploading to Storage', range: [85, 98] },
]

function getStepState(step, currentStatus, progress) {
  const statusOrder = ['downloading', 'transcribing', 'analyzing', 'clipping', 'captioning', 'uploading', 'completed']
  const currentIdx = statusOrder.indexOf(currentStatus)
  const stepIdx = statusOrder.indexOf(step.status)

  if (currentStatus === 'completed') return 'done'
  if (stepIdx < currentIdx) return 'done'
  if (stepIdx === currentIdx) return 'active'
  return 'pending'
}

export default function JobPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const job = useJobStore(s => s.jobs[jobId])

  useJobPoller(jobId)

  useEffect(() => {
    if (!jobId) navigate('/dashboard')
  }, [jobId])

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#070708' }}>
        <Navbar />
        <div className="text-center">
          <Loader2 size={32} className="text-orange-400 animate-spin mx-auto mb-3" />
          <p className="font-mono text-sm text-neutral-500">Loading job...</p>
        </div>
      </div>
    )
  }

  const isCompleted = job.status === 'completed'
  const isFailed = job.status === 'failed'
  const isProcessing = !isCompleted && !isFailed

  return (
    <div className="min-h-screen" style={{ background: '#070708' }}>
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="tag-pill">JOB</span>
            <span className="font-mono text-xs text-neutral-700">{jobId?.slice(0, 8)}...</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl tracking-wider text-white mb-1">
                {job.video_title || 'Processing Video'}
              </h1>
              {job.duration_seconds && (
                <p className="font-mono text-xs text-neutral-500 flex items-center gap-1.5">
                  <Clock size={12} />
                  {Math.floor(job.duration_seconds / 60)}m {Math.floor(job.duration_seconds % 60)}s original
                </p>
              )}
            </div>
            <StatusBadge status={job.status} />
          </div>
        </motion.div>

        {/* Progress Panel */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl p-6 mb-8 glow-border"
              style={{ background: '#0D0D0F' }}
            >
              {/* Overall progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-xs text-neutral-500 tracking-widest">OVERALL PROGRESS</span>
                  <span className="font-display text-2xl text-orange-400">{job.progress || 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full progress-active"
                    style={{ background: 'linear-gradient(90deg, #FF6B00, #FFB800)' }}
                    animate={{ width: `${job.progress || 0}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {STEPS.map((step, i) => {
                  const state = getStepState(step, job.status, job.progress)
                  return (
                    <motion.div
                      key={step.status}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        state === 'active' ? 'bg-orange-500/10 border border-orange-500/25' :
                        state === 'done' ? 'opacity-60' : 'opacity-25'
                      }`}
                    >
                      <div className={`shrink-0 ${
                        state === 'active' ? 'text-orange-400' :
                        state === 'done' ? 'text-green-400' : 'text-neutral-700'
                      }`}>
                        {state === 'done' ? <CheckCircle2 size={16} /> :
                         state === 'active' ? <Loader2 size={16} className="animate-spin" /> :
                         step.icon}
                      </div>
                      <span className={`font-mono text-sm ${
                        state === 'active' ? 'text-white' :
                        state === 'done' ? 'text-neutral-400' : 'text-neutral-700'
                      }`}>
                        {step.label}
                      </span>
                      {state === 'active' && (
                        <div className="ml-auto loading-dots flex gap-1">
                          <span /><span /><span />
                        </div>
                      )}
                      {state === 'done' && (
                        <span className="ml-auto font-mono text-xs text-green-600">DONE</span>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Failed State */}
        {isFailed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl p-6 mb-8 border border-red-500/30 bg-red-500/5"
          >
            <div className="flex items-center gap-3 mb-2">
              <XCircle size={20} className="text-red-400" />
              <span className="font-display text-lg tracking-wider text-red-400">JOB FAILED</span>
            </div>
            <p className="font-mono text-sm text-neutral-400">{job.error_message || 'An unknown error occurred.'}</p>
            <button
              onClick={() => navigate('/submit')}
              className="mt-4 btn-primary px-5 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              Try Again <ArrowRight size={14} />
            </button>
          </motion.div>
        )}

        {/* Completed Results */}
        {isCompleted && job.clips && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'CLIPS GENERATED', value: job.total_clips || job.clips?.length || 0 },
                { label: 'PLATFORMS', value: [...new Set(job.clips?.map(c => c.platform))].length },
                { label: 'AVG VIRAL SCORE', value: Math.round(job.clips?.reduce((a, c) => a + (c.viral_score || 0), 0) / (job.clips?.length || 1)) + '%' },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl p-5 text-center glow-border" style={{ background: '#0D0D0F' }}>
                  <div className="font-display text-4xl text-orange-400 mb-1">{stat.value}</div>
                  <div className="font-mono text-xs text-neutral-600 tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Clips Grid */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl tracking-wider text-white">YOUR CLIPS</h2>
              <span className="tag-pill">SORTED BY VIRAL SCORE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...(job.clips || [])]
                .sort((a, b) => (b.viral_score || 0) - (a.viral_score || 0))
                .map((clip, i) => (
                  <ClipCard key={clip.id} clip={clip} index={i} />
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const config = {
    pending: { color: 'text-neutral-400', bg: 'bg-neutral-500/10 border-neutral-500/20', label: 'PENDING' },
    downloading: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'DOWNLOADING' },
    transcribing: { color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', label: 'TRANSCRIBING' },
    analyzing: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: 'ANALYZING' },
    clipping: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', label: 'CLIPPING' },
    captioning: { color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', label: 'CAPTIONING' },
    uploading: { color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', label: 'UPLOADING' },
    completed: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', label: '✓ COMPLETED' },
    failed: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: '✗ FAILED' },
  }
  const c = config[status] || config.pending
  return (
    <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs tracking-widest shrink-0 ${c.color} ${c.bg}`}>
      {c.label}
    </div>
  )
}
