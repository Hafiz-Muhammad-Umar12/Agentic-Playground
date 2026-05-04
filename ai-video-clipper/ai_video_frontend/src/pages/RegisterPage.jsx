import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Fill all fields')
    if (password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 6) return toast.error('Password too short (min 6)')
    setLoading(true)
    try {
      await authAPI.register(email, password)
      toast.success('Account created! Sign in now.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#FF6B00,#FF8C00)', boxShadow: '0 0 30px rgba(255,107,0,0.4)' }}>
            <Zap size={26} className="text-white" />
          </div>
          <h1 className="font-display text-4xl tracking-widest text-white">CLIPFORGE AI</h1>
          <p className="font-mono text-xs text-neutral-500 mt-2 tracking-widest">CREATE YOUR ACCOUNT</p>
        </div>

        <div className="rounded-2xl p-8 glow-border" style={{ background: '#0D0D0F' }}>
          <h2 className="font-display text-2xl tracking-wider text-white mb-1">REGISTER</h2>
          <p className="text-sm text-neutral-500 font-mono mb-8">Start repurposing content today</p>

          <form onSubmit={handleRegister} className="space-y-5">
            {[
              { label: 'EMAIL', icon: <Mail size={14} />, value: email, set: setEmail, type: 'email', ph: 'you@example.com' },
              { label: 'PASSWORD', icon: <Lock size={14} />, value: password, set: setPassword, type: 'password', ph: 'Min 6 characters' },
              { label: 'CONFIRM PASSWORD', icon: <Lock size={14} />, value: confirm, set: setConfirm, type: 'password', ph: 'Repeat password' },
            ].map(({ label, icon, value, set, type, ph }) => (
              <div key={label}>
                <label className="flex items-center gap-1.5 font-mono text-xs text-neutral-500 tracking-widest mb-2">
                  <span className="text-orange-500">{icon}</span>{label}
                </label>
                <div className="flex items-center px-4 py-3 rounded-xl border border-white/8 bg-white/3 focus-within:border-orange-500/50 transition-all">
                  <input
                    type={type}
                    value={value}
                    onChange={e => set(e.target.value)}
                    placeholder={ph}
                    className="w-full bg-transparent outline-none text-sm font-mono text-white placeholder-neutral-600"
                  />
                </div>
              </div>
            ))}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? (
                <div className="loading-dots flex gap-1"><span /><span /><span /></div>
              ) : (
                <><UserPlus size={16} /><span>CREATE ACCOUNT</span></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm font-mono text-neutral-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-400 hover:text-orange-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
