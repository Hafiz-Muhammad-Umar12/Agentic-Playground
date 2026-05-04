import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, LogOut, LayoutDashboard, User } from 'lucide-react'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
      style={{ background: 'rgba(7,7,8,0.92)', backdropFilter: 'blur(24px)' }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#FF6B00,#FF8C00)', boxShadow: '0 0 20px rgba(255,107,0,0.4)' }}>
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-display text-xl tracking-wider text-white group-hover:text-orange-400 transition-colors">
            CLIPFORGE
          </span>
          <span className="tag-pill ml-1">AI</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/dashboard" active={location.pathname === '/dashboard'}>
            <LayoutDashboard size={14} />Dashboard
          </NavLink>
          <NavLink to="/submit" active={location.pathname === '/submit'}>
            <Zap size={14} />New Job
          </NavLink>
        </div>

        {/* User */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.15)' }}>
              <User size={13} className="text-orange-400" />
              <span className="font-mono text-xs text-orange-300">{user.email?.split('@')[0]}</span>
              {user.is_premium && <span className="tag-pill">PRO</span>}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={14} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </motion.nav>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono transition-all ${
        active
          ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20'
          : 'text-neutral-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
    </Link>
  )
}
