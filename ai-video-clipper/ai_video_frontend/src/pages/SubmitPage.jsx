import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Youtube, Upload, Link2, Zap, Globe, Film,
  ChevronDown, CheckCircle, X, Play
} from 'lucide-react'
import { repurposeAPI } from '../services/api'
import { useJobStore } from '../store'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', color: '#00f2ea', desc: 'Short + fast hook' },
  { id: 'reels', label: 'Instagram Reels', color: '#E1306C', desc: 'Aesthetic + captions' },
  { id: 'youtube_shorts', label: 'YouTube Shorts', color: '#FF0000', desc: 'SEO title + hashtags' },
]

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ur', label: 'Urdu' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ar', label: 'Arabic' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
]

export default function SubmitPage() {
  const [mode, setMode] = useState('url') // 'url' | 'upload'
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [file, setFile] = useState(null)
  const [platforms, setPlatforms] = useState(['tiktok', 'reels', 'youtube_shorts'])
  const [language, setLanguage] = useState('en')
  const [maxClips, setMaxClips] = useState(10)
  const [loading, setLoading] = useState(false)

  const addJob = useJobStore((s) => s.addJob)
  const setActiveJob = useJobStore((s) => s.setActiveJob)
  const navigate = useNavigate()

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.mkv'] },
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB
  })

  const togglePlatform = (id) => {
    setPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleSubmit = async () => {
    if (mode === 'url' && !youtubeUrl) return toast.error('Enter a YouTube URL')
    if (mode === 'upload' && !file) return toast.error('Select a video file')
    if (platforms.length === 0) return toast.error('Select at least one platform')

    setLoading(true)
    try {
      let job
      if (mode === 'url') {
        job = await repurposeAPI.submitYouTube({ youtube_url: youtubeUrl, platforms, language, max_clips: maxClips })
      } else {
        job = await repurposeAPI.submitUpload(file, { platforms, language, max_clips: maxClips })
      }
      addJob({ ...job, created_at: new Date().toISOString() })
      setActiveJob(job.job_id)
      toast.success('Job submitted! Processing started...')
      navigate(`/job/${job.job_id}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#070708' }}>
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="tag-pill">NEW JOB</span>
          </div>
          <h1 className="font-display text-5xl tracking-wider text-white mb-2">
            REPURPOSE<br />
            <span className="shimmer-text">YOUR VIDEO</span>
          </h1>
          <p className="font-mono text-sm text-neutral-500">
            Turn 1 long video → 10+ viral clips automatically
          </p>
        </motion.div>

        {/* Mode Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 p-1 rounded-xl"
          style={{ background: '#0D0D0F', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          {[
            { id: 'url', icon: <Youtube size={16} />, label: 'YouTube URL' },
            { id: 'upload', icon: <Upload size={16} />, label: 'Upload File' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-sm transition-all ${
                mode === tab.id
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
              style={mode === tab.id ? {
                background: 'linear-gradient(135deg,#FF6B00,#FF8C00)',
                boxShadow: '0 0 20px rgba(255,107,0,0.3)'
              } : {}}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl p-6 mb-5 glow-border"
          style={{ background: '#0D0D0F' }}
        >
          <AnimatePresence mode="wait">
            {mode === 'url' ? (
              <motion.div key="url" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <label className="font-mono text-xs text-neutral-500 tracking-widest mb-3 flex items-center gap-1.5">
                  <Link2 size={12} className="text-orange-500" /> YOUTUBE URL
                </label>
                <div className="flex items-center gap-3 px-4 py-4 rounded-xl border border-white/8 bg-white/2 focus-within:border-orange-500/50 transition-all">
                  <Youtube size={18} className="text-red-500 shrink-0" />
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={e => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 bg-transparent outline-none font-mono text-sm text-white placeholder-neutral-700"
                  />
                  {youtubeUrl && (
                    <button onClick={() => setYoutubeUrl('')}>
                      <X size={14} className="text-neutral-600 hover:text-red-400" />
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <label className="font-mono text-xs text-neutral-500 tracking-widest mb-3 flex items-center gap-1.5">
                  <Upload size={12} className="text-orange-500" /> VIDEO FILE
                </label>
                {file ? (
                  <div className="flex items-center gap-3 px-4 py-4 rounded-xl border border-orange-500/30 bg-orange-500/5">
                    <Film size={18} className="text-orange-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-white truncate">{file.name}</p>
                      <p className="font-mono text-xs text-neutral-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button onClick={() => setFile(null)}>
                      <X size={14} className="text-neutral-600 hover:text-red-400" />
                    </button>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? 'border-orange-500 bg-orange-500/5'
                        : 'border-white/10 hover:border-orange-500/40 hover:bg-white/2'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload size={28} className={`mx-auto mb-3 ${isDragActive ? 'text-orange-400' : 'text-neutral-600'}`} />
                    <p className="font-mono text-sm text-neutral-400">
                      {isDragActive ? 'Drop it here...' : 'Drag & drop or click to select'}
                    </p>
                    <p className="font-mono text-xs text-neutral-700 mt-1">MP4, MOV, AVI, MKV — max 2GB</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Platform Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 mb-5 glow-border"
          style={{ background: '#0D0D0F' }}
        >
          <label className="font-mono text-xs text-neutral-500 tracking-widest mb-4 flex items-center gap-1.5">
            <Play size={12} className="text-orange-500" /> OUTPUT PLATFORMS
          </label>
          <div className="grid grid-cols-1 gap-3">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                  platforms.includes(p.id)
                    ? 'border-orange-500/40 bg-orange-500/8'
                    : 'border-white/6 bg-white/2 hover:border-white/12'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
                  <div>
                    <p className="font-mono text-sm text-white">{p.label}</p>
                    <p className="font-mono text-xs text-neutral-600">{p.desc}</p>
                  </div>
                </div>
                {platforms.includes(p.id) && <CheckCircle size={16} className="text-orange-400" />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Settings Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          {/* Language */}
          <div className="rounded-2xl p-5 glow-border" style={{ background: '#0D0D0F' }}>
            <label className="font-mono text-xs text-neutral-500 tracking-widest mb-3 flex items-center gap-1.5">
              <Globe size={12} className="text-orange-500" /> LANGUAGE
            </label>
            <div className="relative">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full bg-transparent font-mono text-sm text-white outline-none cursor-pointer appearance-none pr-6"
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code} style={{ background: '#131316' }}>{l.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
            </div>
          </div>

          {/* Max Clips */}
          <div className="rounded-2xl p-5 glow-border" style={{ background: '#0D0D0F' }}>
            <label className="font-mono text-xs text-neutral-500 tracking-widest mb-3 flex items-center gap-1.5">
              <Film size={12} className="text-orange-500" /> MAX CLIPS
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={1} max={20} value={maxClips}
                onChange={e => setMaxClips(Number(e.target.value))}
                className="flex-1 accent-orange-500 cursor-pointer"
              />
              <span className="font-display text-2xl text-orange-400 w-8 text-right">{maxClips}</span>
            </div>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          onClick={handleSubmit}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-base relative overflow-hidden"
        >
          {loading ? (
            <div className="loading-dots flex gap-1.5"><span /><span /><span /></div>
          ) : (
            <>
              <Zap size={18} />
              <span>START REPURPOSING — {platforms.length} PLATFORM{platforms.length !== 1 ? 'S' : ''}</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}
