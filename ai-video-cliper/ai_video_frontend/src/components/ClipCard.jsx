import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Download, Copy, ExternalLink, ChevronDown, ChevronUp,
  TrendingUp, Clock, Hash, Zap, Play
} from 'lucide-react'
import { repurposeAPI } from '../services/api'
import toast from 'react-hot-toast'

const PLATFORM_COLORS = {
  tiktok: { color: '#00f2ea', label: 'TikTok' },
  reels: { color: '#E1306C', label: 'Reels' },
  youtube_shorts: { color: '#FF0000', label: 'YT Shorts' },
}

const MOMENT_COLORS = {
  emotional: '#ff6b9d',
  educational: '#6bbbff',
  controversial: '#ff9f6b',
  surprising: '#c46bff',
  funny: '#6bff9f',
  motivational: '#ffdb6b',
}

export default function ClipCard({ clip, index }) {
  const [expanded, setExpanded] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const platform = PLATFORM_COLORS[clip.platform] || { color: '#FF6B00', label: clip.platform }
  const momentColor = MOMENT_COLORS[clip.moment_type] || '#FF6B00'
  const score = Math.round(clip.viral_score || 0)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const data = await repurposeAPI.getDownloadUrl(clip.id)
      
      // Fetch as blob to force download
      const response = await fetch(data.download_url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `clip_${clip.id.slice(0, 8)}.mp4`
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
      
      toast.success('Download started!')
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Download failed')
    } finally {
      setDownloading(false)
    }
  }

  const copyCaption = () => {
    const text = `${clip.hook_text}\n\n${clip.caption}\n\n${(clip.hashtags || []).map(h => `#${h}`).join(' ')}`
    navigator.clipboard.writeText(text)
    toast.success('Caption copied!')
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="clip-card rounded-2xl overflow-hidden"
      style={{ background: '#0D0D0F', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Top bar */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${platform.color}, ${momentColor})` }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs px-2 py-0.5 rounded-md border"
              style={{ color: platform.color, borderColor: `${platform.color}40`, background: `${platform.color}10` }}>
              {platform.label}
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded-md"
              style={{ color: momentColor, background: `${momentColor}12`, border: `1px solid ${momentColor}35` }}>
              {clip.moment_type}
            </span>
          </div>

          {/* Viral Score */}
          <div className="flex items-center gap-2 shrink-0">
            <TrendingUp size={13} style={{ color: score >= 75 ? '#6bff9f' : score >= 50 ? '#FFB800' : '#FF6B00' }} />
            <div className="text-right">
              <div className="font-display text-2xl leading-none"
                style={{ color: score >= 75 ? '#6bff9f' : score >= 50 ? '#FFB800' : '#FF6B00' }}>
                {score}
              </div>
              <div className="font-mono text-[9px] text-neutral-700">VIRAL SCORE</div>
            </div>
          </div>
        </div>

        {/* Score bar */}
        <div className="h-1 rounded-full bg-white/5 mb-4 overflow-hidden">
          <div className="h-full rounded-full score-bar" style={{ width: `${score}%` }} />
        </div>

        {/* Hook Text */}
        {clip.hook_text && (
          <div className="mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.15)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={11} className="text-orange-400" />
              <span className="font-mono text-[10px] text-orange-500 tracking-widest">HOOK</span>
            </div>
            <p className="font-mono text-sm text-white font-semibold leading-snug">"{clip.hook_text}"</p>
          </div>
        )}

        {/* Time info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 font-mono text-xs text-neutral-500">
            <Clock size={11} />
            {formatTime(clip.start_time)} → {formatTime(clip.end_time)}
          </div>
          <div className="font-mono text-xs text-neutral-600">
            {Math.round(clip.duration)}s clip
          </div>
        </div>

        {/* Expandable section */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between py-2 border-t border-white/5 font-mono text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          <span>CAPTION & DETAILS</span>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-3 space-y-3"
          >
            {clip.seo_title && (
              <div>
                <p className="font-mono text-[10px] text-neutral-600 tracking-widest mb-1">SEO TITLE</p>
                <p className="font-mono text-xs text-neutral-300">{clip.seo_title}</p>
              </div>
            )}
            {clip.caption && (
              <div>
                <p className="font-mono text-[10px] text-neutral-600 tracking-widest mb-1">CAPTION</p>
                <p className="font-mono text-xs text-neutral-400 leading-relaxed">{clip.caption}</p>
              </div>
            )}
            {clip.hashtags?.length > 0 && (
              <div>
                <p className="font-mono text-[10px] text-neutral-600 tracking-widest mb-1.5 flex items-center gap-1">
                  <Hash size={9} /> HASHTAGS
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {clip.hashtags.map(tag => (
                    <span key={tag} className="tag-pill">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
            {clip.insight_reason && (
              <div className="px-3 py-2 rounded-lg bg-white/3 border border-white/5">
                <p className="font-mono text-[10px] text-neutral-600 tracking-widest mb-1">WHY THIS WILL GO VIRAL</p>
                <p className="font-mono text-xs text-neutral-500 leading-relaxed">{clip.insight_reason}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 btn-primary py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            {downloading ? (
              <div className="loading-dots flex gap-1"><span /><span /><span /></div>
            ) : (
              <><Download size={13} /> DOWNLOAD</>
            )}
          </button>
          <button
            onClick={copyCaption}
            className="px-3 py-2 rounded-xl border border-white/8 hover:border-orange-500/30 text-neutral-500 hover:text-orange-400 transition-all flex items-center gap-1.5 font-mono text-xs"
          >
            <Copy size={13} /> COPY
          </button>
          {clip.published_url && (
            <a
              href={clip.published_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl border border-green-500/25 text-green-400 hover:bg-green-500/10 transition-all flex items-center gap-1.5 font-mono text-xs"
            >
              <ExternalLink size={13} /> VIEW
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}
