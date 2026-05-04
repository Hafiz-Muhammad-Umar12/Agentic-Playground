import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Fill all fields')
    setLoading(true)
    try {
      const data = await authAPI.login(email, password)
      localStorage.setItem('auth_token', data.access_token)
      const user = await authAPI.getMe()
      setAuth(data.access_token, user)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(255,107,0,0.3)', '0 0 50px rgba(255,107,0,0.6)', '0 0 20px rgba(255,107,0,0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#FF6B00,#FF8C00)' }}
          >
            <Zap size={26} className="text-white" />
          </motion.div>
          <h1 className="font-display text-4xl tracking-widest text-white">CLIPFORGE AI</h1>
          <p className="font-mono text-xs text-neutral-500 mt-2 tracking-widest">VIRAL VIDEO REPURPOSER</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 glow-border" style={{ background: '#0D0D0F' }}>
          <h2 className="font-display text-2xl tracking-wider text-white mb-1">SIGN IN</h2>
          <p className="text-sm text-neutral-500 font-mono mb-8">Access your repurposing dashboard</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <Field label="EMAIL" icon={<Mail size={14} />}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent outline-none text-sm font-mono text-white placeholder-neutral-600"
              />
            </Field>

            <Field label="PASSWORD" icon={<Lock size={14} />}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent outline-none text-sm font-mono text-white placeholder-neutral-600"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="text-neutral-600 hover:text-orange-400 transition-colors ml-2">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </Field>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? (
                <div className="loading-dots flex gap-1">
                  <span /><span /><span />
                </div>
              ) : (
                <><span>SIGN IN</span><ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm font-mono text-neutral-600 mt-6">
            No account?{' '}
            <Link to="/register" className="text-orange-400 hover:text-orange-300 transition-colors">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center font-mono text-xs text-neutral-700 mt-6">
          Powered by Claude AI + Whisper + FFmpeg
        </p>
      </motion.div>
    </div>
  )
}

function Field({ label, icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 font-mono text-xs text-neutral-500 tracking-widest mb-2">
        <span className="text-orange-500">{icon}</span>
        {label}
      </label>
      <div className="flex items-center px-4 py-3 rounded-xl border border-white/8 bg-white/3 focus-within:border-orange-500/50 focus-within:bg-orange-500/3 transition-all">
        {children}
      </div>
    </div>
  )
}
