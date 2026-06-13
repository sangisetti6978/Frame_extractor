import { useContext, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import LoginForm from '../components/auth/LoginForm'

/* ─── SVG Icons ─── */
const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const GiftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
  </svg>
)
const FilmIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/>
  </svg>
)

const s = {
  page: {
    minHeight: '100vh',
    background: '#06060e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 24px 60px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  mesh: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse 60% 50% at 25% 50%, rgba(124,58,237,0.2) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 75% 40%, rgba(37,99,235,0.15) 0%, transparent 60%)
    `,
    pointerEvents: 'none',
  },
  grid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)',
    WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)',
    pointerEvents: 'none',
  },
  container: {
    width: '100%',
    maxWidth: '1080px',
    position: 'relative',
    zIndex: 10,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px',
    alignItems: 'center',
  },

  /* Left branding */
  brand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '48px',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '18px',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    boxShadow: '0 8px 28px rgba(124,58,237,0.35)',
  },
  logoText: {
    fontSize: '1.75rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    background: 'linear-gradient(135deg, #f0f0f5 60%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  brandTitle: {
    fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    color: '#f0f0f5',
  },
  brandGradient: {
    background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  brandDesc: {
    fontSize: '1.05rem',
    lineHeight: 1.7,
    color: 'rgba(240,240,245,0.45)',
    marginTop: '-32px',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '16px 18px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    transition: 'all 0.3s',
    cursor: 'default',
  },
  featureIcon: (color) => ({
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: color,
    color: '#fff',
    flexShrink: 0,
    boxShadow: `0 4px 14px ${color}55`,
  }),
  featureTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#f0f0f5',
    marginBottom: '2px',
  },
  featureDesc: {
    fontSize: '0.85rem',
    color: 'rgba(240,240,245,0.4)',
    lineHeight: 1.5,
  },

  /* Right form card */
  card: {
    borderRadius: '28px',
    padding: '44px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
  cardTitle: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#f0f0f5',
    marginBottom: '6px',
    letterSpacing: '-0.02em',
  },
  cardDesc: {
    fontSize: '0.95rem',
    color: 'rgba(240,240,245,0.45)',
    marginBottom: '32px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '28px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.06)',
  },
  dividerText: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'rgba(240,240,245,0.25)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  linkRow: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: 'rgba(240,240,245,0.45)',
  },
  link: {
    color: '#a78bfa',
    fontWeight: 700,
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
}

/* Injected hover styles */
const loginPageStyles = `
.pro-feature-item:hover {
  background: rgba(255,255,255,0.06) !important;
  border-color: rgba(255,255,255,0.1) !important;
  transform: translateX(4px);
}
.pro-signup-link:hover {
  color: #c4b5fd !important;
}
@media (max-width: 900px) {
  .pro-login-grid {
    grid-template-columns: 1fr !important;
    gap: 40px !important;
    max-width: 480px !important;
  }
  .pro-brand-side {
    display: none !important;
  }
}
`

export default function Login() {
  const { isAuthenticated } = useContext(AuthContext)

  useEffect(() => {
    const id = 'pro-login-page-styles'
    if (!document.getElementById(id)) {
      const el = document.createElement('style')
      el.id = id
      el.textContent = loginPageStyles
      document.head.appendChild(el)
    }
  }, [])

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  }

  const features = [
    { icon: <ZapIcon />, title: 'Lightning Fast', desc: 'Extract thousands of frames in seconds', color: 'rgba(251,191,36,0.8)' },
    { icon: <TargetIcon />, title: 'Precise Control', desc: 'Frame interval and quality settings', color: 'rgba(236,72,153,0.8)' },
    { icon: <ShieldIcon />, title: 'Completely Secure', desc: 'Your videos never leave your device', color: 'rgba(52,211,153,0.8)' },
    { icon: <GiftIcon />, title: 'Always Free', desc: 'No subscriptions, no hidden fees', color: 'rgba(124,58,237,0.8)' },
  ]

  return (
    <div style={s.page}>
      <div style={s.mesh} />
      <div style={s.grid} />

      <div style={s.container} className="pro-login-grid">
        {/* ─── Left: Brand + Features ─── */}
        <div style={s.brand} className="pro-brand-side">
          <div>
            <div style={s.logoRow}>
              <div style={s.logoIcon}><FilmIcon /></div>
              <span style={s.logoText}>FrameExtractor</span>
            </div>
          </div>

          <h1 style={s.brandTitle}>
            Extract frames with{' '}
            <span style={s.brandGradient}>effortless precision</span>
          </h1>

          <p style={s.brandDesc}>
            Professional-grade video frame extraction powered by FFmpeg and OpenCV.
          </p>

          <div style={s.features}>
            {features.map((f, i) => (
              <div key={i} style={s.featureItem} className="pro-feature-item">
                <div style={s.featureIcon(f.color)}>{f.icon}</div>
                <div>
                  <div style={s.featureTitle}>{f.title}</div>
                  <div style={s.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right: Form Card ─── */}
        <div>
          <div style={s.card}>
            <h2 style={s.cardTitle}>Welcome back</h2>
            <p style={s.cardDesc}>Sign in to your account to continue</p>

            <LoginForm />

            <div style={s.divider}>
              <div style={s.dividerLine} />
              <span style={s.dividerText}>or</span>
              <div style={s.dividerLine} />
            </div>

            <p style={s.linkRow}>
              Don't have an account?{' '}
              <Link to="/register" style={s.link} className="pro-signup-link">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
