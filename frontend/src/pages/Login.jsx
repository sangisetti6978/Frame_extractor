import { useContext, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import LoginForm from '../components/auth/LoginForm'

/* ─── SVG Icons ─── */
const ZapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
)
const TargetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
)
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const GiftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
  </svg>
)
const FilmIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18"/>
    <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

/* ─── Injected page styles ─── */
const loginPageStyles = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

@keyframes loginOrbDrift1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(60px, -40px) scale(1.12); }
  66%       { transform: translate(-30px, 30px) scale(0.9); }
}
@keyframes loginOrbDrift2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(-50px, 50px) scale(1.08); }
  66%       { transform: translate(40px, -20px) scale(0.88); }
}
@keyframes loginFadeUp {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes loginShimmerText {
  0%   { background-position: -300% center; }
  100% { background-position: 300% center; }
}
@keyframes loginBadgeScan {
  0%   { left: -30%; }
  100% { left: 130%; }
}

.pro-login-feature:hover {
  background: rgba(255,255,255,0.06) !important;
  border-color: rgba(255,255,255,0.1) !important;
  transform: translateX(6px) !important;
}
.pro-login-feature:hover .pro-login-feature-icon {
  transform: scale(1.12) rotateZ(-6deg);
}
.pro-login-feature-icon {
  transition: transform 0.35s cubic-bezier(0.23, 1, 0.32, 1);
}

.pro-signup-link:hover {
  color: #c4b5fd !important;
}
.pro-login-submit-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 16px 36px rgba(124,58,237,0.55), inset 0 1px 0 rgba(255,255,255,0.25) !important;
}

@media (max-width: 900px) {
  .pro-login-grid {
    grid-template-columns: 1fr !important;
    gap: 40px !important;
    max-width: 480px !important;
    margin: 0 auto !important;
  }
  .pro-brand-side {
    display: none !important;
  }
}
`

export default function Login() {
  const { isAuthenticated } = useContext(AuthContext)

  useEffect(() => {
    const id = 'pro-login-page-styles-v2'
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
    {
      icon: <ZapIcon />, title: 'Lightning Fast',
      desc: 'Extract thousands of frames in seconds',
      color: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      glow: 'rgba(245,158,11,0.3)',
    },
    {
      icon: <TargetIcon />, title: 'Precise Control',
      desc: 'Frame interval and quality settings',
      color: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
      glow: 'rgba(236,72,153,0.3)',
    },
    {
      icon: <ShieldIcon />, title: 'Completely Secure',
      desc: 'Your videos never leave your device',
      color: 'linear-gradient(135deg, #10b981, #06b6d4)',
      glow: 'rgba(16,185,129,0.3)',
    },
    {
      icon: <GiftIcon />, title: 'Always Free',
      desc: 'No subscriptions, no hidden fees',
      color: 'linear-gradient(135deg, #7c3aed, #2563eb)',
      glow: 'rgba(124,58,237,0.3)',
    },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#030308',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '100px 24px 60px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* ── Background Orbs ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 68%)',
          top: '-15%', left: '-10%', filter: 'blur(80px)',
          animation: 'loginOrbDrift1 22s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 68%)',
          bottom: '-10%', right: '-8%', filter: 'blur(90px)',
          animation: 'loginOrbDrift2 28s ease-in-out infinite',
        }} />
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)',
        }} />
      </div>

      <div
        style={{
          width: '100%', maxWidth: '1100px',
          position: 'relative', zIndex: 10,
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '80px', alignItems: 'center',
          animation: 'loginFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}
        className="pro-login-grid"
      >
        {/* ─── Left: Brand + Features ─── */}
        <div className="pro-brand-side" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {/* Logo */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px' }}>
              <div style={{
                width: '54px', height: '54px', borderRadius: '18px',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 10px 32px rgba(124,58,237,0.4)',
              }}>
                <FilmIcon />
              </div>
              <span style={{
                fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.035em',
                background: 'linear-gradient(135deg, #f0f0f5 60%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              }}>
                FrameExtractor
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 800,
              lineHeight: 1.14, letterSpacing: '-0.038em', color: '#ededf2',
              marginBottom: '18px',
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            }}>
              Extract frames with{' '}
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #67e8f9 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                backgroundSize: '200% auto',
                animation: 'loginShimmerText 4s linear infinite',
                display: 'inline-block',
              }}>effortless precision</span>
            </h1>

            <p style={{
              fontSize: '1.02rem', lineHeight: 1.72, color: 'rgba(237,237,242,0.42)',
            }}>
              Professional-grade video frame extraction powered by FFmpeg and OpenCV.
            </p>
          </div>

          {/* Features list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {features.map((f, i) => (
              <div
                key={i}
                className="pro-login-feature"
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  padding: '16px 18px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
                  cursor: 'default',
                }}
              >
                <div
                  className="pro-login-feature-icon"
                  style={{
                    width: '40px', height: '40px', borderRadius: '13px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: f.color, color: '#fff', flexShrink: 0,
                    boxShadow: `0 6px 18px ${f.glow}`,
                  }}
                >
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ededf2', marginBottom: '3px' }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'rgba(237,237,242,0.38)', lineHeight: 1.5 }}>
                    {f.desc}
                  </div>
                </div>
                <div style={{
                  marginLeft: 'auto', flexShrink: 0,
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#34d399',
                }}>
                  <CheckIcon />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right: Form Card ─── */}
        <div>
          <div style={{
            borderRadius: '28px',
            padding: '48px 44px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Card inner glow */}
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: '60%', height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(96,165,250,0.4), transparent)',
            }} />

            <h2 style={{
              fontSize: '1.7rem', fontWeight: 800, color: '#ededf2',
              marginBottom: '6px', letterSpacing: '-0.03em',
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            }}>Welcome back</h2>
            <p style={{
              fontSize: '0.92rem', color: 'rgba(237,237,242,0.4)',
              marginBottom: '36px',
            }}>Sign in to your account to continue</p>

            <LoginForm />

            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              margin: '28px 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <span style={{
                fontSize: '0.75rem', fontWeight: 600,
                color: 'rgba(237,237,242,0.22)',
                textTransform: 'uppercase', letterSpacing: '1px',
              }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'rgba(237,237,242,0.42)' }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="pro-signup-link"
                style={{ color: '#a78bfa', fontWeight: 700, textDecoration: 'none', transition: 'color 0.2s' }}
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
