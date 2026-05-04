import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mode,    setMode]    = useState('login'); // 'login' | 'signup'
  const [form,    setForm]    = useState({ name: '', email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn  = mode === 'login' ? login : signup;
      const res = await fn(form);
      loginUser(res.data.access_token, { id: res.data.user_id, name: res.data.name });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Animated grid bg */}
      <div style={styles.grid} />
      <div style={styles.glow} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>👻</div>
          <div>
            <div style={styles.logoText}>GHOSTTRACK</div>
            <div style={styles.logoSub}>ANTI-THEFT SYSTEM</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={styles.tabs}>
          {['login','signup'].map(t => (
            <button key={t} style={{...styles.tab, ...(mode===t ? styles.tabActive : {})}}
              onClick={() => { setMode(t); setError(''); }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={styles.form}>
          {mode === 'signup' && (
            <div style={styles.field}>
              <label style={styles.label}>FULL NAME</label>
              <input name="name" value={form.name} onChange={handle}
                placeholder="John Doe" required style={styles.input} />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>EMAIL ADDRESS</label>
            <input name="email" type="email" value={form.email} onChange={handle}
              placeholder="agent@ghosttrack.io" required style={styles.input} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>PASSWORD</label>
            <input name="password" type="password" value={form.password} onChange={handle}
              placeholder="••••••••" required style={styles.input} />
          </div>

          {error && <div style={styles.error}>⚠ {error}</div>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? '...' : mode === 'login' ? 'ACCESS SYSTEM' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div style={styles.footer}>
          Secure end-to-end tracking — GhostTrack v1.0
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#030b12',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Courier New', monospace",
    position: 'relative',
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  glow: {
    position: 'absolute',
    top: '30%', left: '50%',
    transform: 'translate(-50%,-50%)',
    width: 600, height: 600,
    background: 'radial-gradient(circle, rgba(0,255,136,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(5,18,28,0.95)',
    border: '1px solid rgba(0,255,136,0.2)',
    borderRadius: 4,
    padding: '40px 48px',
    width: 420,
    position: 'relative',
    boxShadow: '0 0 60px rgba(0,255,136,0.08), inset 0 1px 0 rgba(0,255,136,0.1)',
  },
  logoRow: {
    display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32,
  },
  logoIcon: { fontSize: 36 },
  logoText: {
    color: '#00ff88', fontSize: 22, fontWeight: 700, letterSpacing: 4,
  },
  logoSub: {
    color: 'rgba(0,255,136,0.45)', fontSize: 10, letterSpacing: 3,
  },
  tabs: { display: 'flex', marginBottom: 28, borderBottom: '1px solid rgba(0,255,136,0.12)' },
  tab: {
    flex: 1, background: 'none', border: 'none', color: 'rgba(0,255,136,0.35)',
    fontSize: 11, letterSpacing: 2, padding: '10px 0', cursor: 'pointer',
    borderBottom: '2px solid transparent', marginBottom: -1,
  },
  tabActive: { color: '#00ff88', borderBottomColor: '#00ff88' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { color: 'rgba(0,255,136,0.5)', fontSize: 10, letterSpacing: 2 },
  input: {
    background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.15)',
    borderRadius: 2, color: '#e0ffe0', padding: '11px 14px',
    fontSize: 13, outline: 'none', fontFamily: 'inherit',
  },
  error: {
    color: '#ff4466', fontSize: 12, background: 'rgba(255,68,102,0.08)',
    border: '1px solid rgba(255,68,102,0.2)', padding: '8px 12px', borderRadius: 2,
  },
  btn: {
    background: 'linear-gradient(135deg, #00ff88, #00cc66)',
    border: 'none', borderRadius: 2, color: '#030b12',
    fontSize: 12, fontWeight: 700, letterSpacing: 3,
    padding: '14px', cursor: 'pointer', marginTop: 4,
    fontFamily: 'inherit',
  },
  footer: {
    textAlign: 'center', color: 'rgba(0,255,136,0.2)',
    fontSize: 10, letterSpacing: 1, marginTop: 28,
  },
};
