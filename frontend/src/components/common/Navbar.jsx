import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useContext, useState, useEffect, useRef } from 'react'
import { AuthContext } from '../../context/AuthContext'

/* ─── Premium Navbar CSS ─── */
const navCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* ── Navbar aurora border animation ── */
@keyframes navAuroraShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes navLogoGlow {
  0%, 100% { box-shadow: 0 4px 16px rgba(124,58,237,0.35), 0 0 0 0 rgba(124,58,237,0); }
  50%       { box-shadow: 0 4px 20px rgba(124,58,237,0.5), 0 0 0 6px rgba(124,58,237,0.06); }
}

@keyframes navPillSlide {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes navDrawerIn {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes avatarPulseRing {
  0%   { transform: scale(0.9); opacity: 1; }
  100% { transform: scale(1.6); opacity: 0; }
}

/* ── Logo ── */
.pnav-logo-icon {
  animation: navLogoGlow 3s ease-in-out infinite;
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
.pnav-logo-wrap:hover .pnav-logo-icon {
  transform: rotate(-8deg) scale(1.08) !important;
  box-shadow: 0 8px 28px rgba(124,58,237,0.55), 0 0 0 6px rgba(124,58,237,0.08) !important;
}
.pnav-logo-text {
  transition: all 0.3s;
}
.pnav-logo-wrap:hover .pnav-logo-text {
  background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

/* ── Nav Links ── */
.pnav-link {
  position: relative;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.pnav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, #7c3aed, #60a5fa);
  transition: width 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}
.pnav-link:hover::after,
.pnav-link.active::after {
  width: 60%;
}
.pnav-link:hover {
  color: #ffffff !important;
  background: rgba(255,255,255,0.06) !important;
  transform: translateY(-1px);
}
.pnav-link.active {
  color: #ffffff !important;
  background: rgba(124,58,237,0.15) !important;
  border-color: rgba(124,58,237,0.3) !important;
}
.pnav-link .pnav-link-icon {
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}
.pnav-link:hover .pnav-link-icon {
  transform: scale(1.15);
}

/* ── Auth Buttons ── */
.pnav-btn-login {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.pnav-btn-login:hover {
  color: #fff !important;
  background: rgba(255,255,255,0.08) !important;
  border-color: rgba(255,255,255,0.2) !important;
  transform: translateY(-1px);
}

.pnav-btn-signup {
  position: relative;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
}
.pnav-btn-signup::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0));
  opacity: 0;
  transition: opacity 0.3s;
}
.pnav-btn-signup:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 10px 28px rgba(124,58,237,0.55), inset 0 1px 0 rgba(255,255,255,0.25) !important;
}
.pnav-btn-signup:hover::before {
  opacity: 1;
}

/* ── User Pill ── */
.pnav-user-pill {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.pnav-user-pill:hover {
  background: rgba(255,255,255,0.08) !important;
  border-color: rgba(124,58,237,0.25) !important;
  transform: translateY(-1px);
}

/* ── Logout Button ── */
.pnav-btn-logout {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.pnav-btn-logout:hover {
  color: #fff !important;
  background: rgba(239,68,68,0.2) !important;
  border-color: rgba(239,68,68,0.45) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(239,68,68,0.2);
}

/* ── Hamburger ── */
.pnav-hamburger {
  transition: all 0.25s;
}
.pnav-hamburger:hover {
  background: rgba(255,255,255,0.1) !important;
  border-color: rgba(255,255,255,0.15) !important;
  color: #fff !important;
}

/* ── Mobile Drawer Links ── */
.pnav-drawer-link {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.pnav-drawer-link:hover {
  background: rgba(255,255,255,0.06) !important;
  border-color: rgba(255,255,255,0.1) !important;
  color: #fff !important;
  transform: translateX(4px);
}
.pnav-drawer-link.active {
  background: rgba(124,58,237,0.15) !important;
  border-color: rgba(124,58,237,0.3) !important;
  color: #fff !important;
}

/* ── Drawer Buttons ── */
.pnav-drawer-btn-login:hover {
  background: rgba(255,255,255,0.08) !important;
  color: #fff !important;
}
.pnav-drawer-btn-signup:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(124,58,237,0.45) !important;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .pnav-desktop-links,
  .pnav-desktop-auth {
    display: none !important;
  }
  .pnav-hamburger {
    display: flex !important;
  }
}
`

/* ─── SVG Film Reel Logo ─── */
function FilmReelIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18"/>
      <line x1="7" y1="2" x2="7" y2="22"/>
      <line x1="17" y1="2" x2="17" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="2" y1="7" x2="7" y2="7"/>
      <line x1="2" y1="17" x2="7" y2="17"/>
      <line x1="17" y1="7" x2="22" y2="7"/>
      <line x1="17" y1="17" x2="22" y2="17"/>
    </svg>
  )
}

const NavIcons = {
  Home: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Dashboard: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Gallery: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
    </svg>
  ),
  Setup: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  ),
  Logout: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Shield: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
}

const iconMap = {
  Home: NavIcons.Home,
  Dashboard: NavIcons.Dashboard,
  Gallery: NavIcons.Gallery,
  Setup: NavIcons.Setup,
  'Admin Panel': NavIcons.Shield,
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  /* Inject CSS once */
  useEffect(() => {
    const id = 'pnav-premium-styles'
    if (!document.getElementById(id)) {
      const el = document.createElement('style')
      el.id = id
      el.textContent = navCSS
      document.head.appendChild(el)
    }
  }, [])

  /* Scroll listener */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      const docH = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docH > 0 ? (window.scrollY / docH) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Close drawer on route change */
  useEffect(() => { setIsOpen(false) }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    ...(isAuthenticated ? [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/gallery', label: 'Gallery' },
      { to: '/setup', label: 'Setup' },
      ...((user?.is_staff || user?.is_superuser) ? [{ to: '/admin-panel', label: 'Admin Panel' }] : [])
    ] : [])
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* ── Main Nav ── */}
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 clamp(16px, 4vw, 48px)',
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        background: scrolled
          ? 'rgba(5,5,16,0.88)'
          : 'rgba(5,5,16,0.4)',
        backdropFilter: 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
        borderBottom: scrolled
          ? '1px solid rgba(255,255,255,0.07)'
          : '1px solid rgba(255,255,255,0.03)',
        boxShadow: scrolled
          ? '0 8px 40px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.04)'
          : 'none',
      }}>
        <div style={{
          width: '100%', maxWidth: '1300px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* ── Logo ── */}
          <Link
            to="/"
            className="pnav-logo-wrap"
            style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none' }}
          >
            <div
              className="pnav-logo-icon"
              style={{
                width: '36px', height: '36px', borderRadius: '11px',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', flexShrink: 0,
              }}
            >
              <FilmReelIcon />
            </div>
            <span
              className="pnav-logo-text"
              style={{
                fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.035em',
                background: 'linear-gradient(135deg, #f0f0f5 60%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >
              FrameExtractor
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <ul className="pnav-desktop-links" style={{
            display: 'flex', alignItems: 'center', gap: '2px',
            listStyle: 'none', margin: 0, padding: 0,
          }}>
            {navLinks.map((link) => {
              const Icon = iconMap[link.label]
              const active = isActive(link.to)
              return (
                <li key={link.to} style={{ listStyle: 'none' }}>
                  <Link
                    to={link.to}
                    className={`pnav-link${active ? ' active' : ''}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '7px 14px', borderRadius: '9px',
                      fontSize: '0.855rem', fontWeight: 600, letterSpacing: '0.005em',
                      color: active ? '#fff' : 'rgba(237,237,242,0.55)',
                      background: active ? 'rgba(124,58,237,0.14)' : 'transparent',
                      border: active ? '1px solid rgba(124,58,237,0.28)' : '1px solid transparent',
                      textDecoration: 'none', cursor: 'pointer',
                    }}
                  >
                    {Icon && <span className="pnav-link-icon"><Icon /></span>}
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* ── Desktop Auth ── */}
          <div className="pnav-desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isAuthenticated ? (
              <>
                {/* User pill */}
                <div
                  className="pnav-user-pill"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '9px',
                    padding: '5px 12px 5px 5px', borderRadius: '11px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'default',
                  }}
                >
                  {/* Avatar with ring */}
                  <div style={{ position: 'relative', width: '30px', height: '30px' }}>
                    <div style={{
                      position: 'absolute', inset: '-2px', borderRadius: '9px',
                      background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                      opacity: 0.5,
                    }} />
                    <div style={{
                      position: 'relative',
                      width: '30px', height: '30px', borderRadius: '8px',
                      background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '0.75rem',
                      boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
                    }}>
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(237,237,242,0.85)' }}>
                    {user?.username}
                  </span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="pnav-btn-logout"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '7px 16px', borderRadius: '9px',
                    fontSize: '0.78rem', fontWeight: 600, color: '#fca5a5',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.18)',
                    cursor: 'pointer',
                  }}
                >
                  <NavIcons.Logout /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="pnav-btn-login"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 18px', borderRadius: '9px',
                    fontSize: '0.855rem', fontWeight: 600,
                    color: 'rgba(237,237,242,0.7)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    textDecoration: 'none',
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="pnav-btn-signup"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '8px 20px', borderRadius: '9px',
                    fontSize: '0.855rem', fontWeight: 700, color: '#fff',
                    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                    border: 'none', textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.18)',
                  }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ── Hamburger ── */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="pnav-hamburger"
            aria-label="Toggle menu"
            style={{
              display: 'none', padding: '8px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', color: 'rgba(237,237,242,0.75)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              {isOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="16" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Progress Bar ── */}
      <div style={{
        position: 'fixed', top: '68px', left: 0, right: 0, height: '2px',
        zIndex: 999, pointerEvents: 'none',
      }}>
        <div style={{
          height: '100%', width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
          transition: 'width 0.1s linear',
          boxShadow: '0 0 8px rgba(124,58,237,0.6)',
        }} />
      </div>

      {/* ── Mobile Drawer ── */}
      <div style={{
        position: 'fixed', top: '68px', left: 0, right: 0,
        background: 'rgba(5,5,16,0.97)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: isOpen ? '20px 24px 36px' : '0 24px',
        maxHeight: isOpen ? '100vh' : '0',
        overflow: 'hidden',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        opacity: isOpen ? 1 : 0,
        zIndex: 999,
      }}>
        {/* Nav Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
          {navLinks.map((link) => {
            const Icon = iconMap[link.label]
            const active = isActive(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`pnav-drawer-link${active ? ' active' : ''}`}
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '13px 16px', borderRadius: '12px',
                  fontSize: '0.95rem', fontWeight: 600,
                  color: active ? '#fff' : 'rgba(237,237,242,0.6)',
                  background: active ? 'rgba(124,58,237,0.14)' : 'transparent',
                  border: active ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
                  textDecoration: 'none',
                }}
              >
                {Icon && <Icon />}
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)',
          margin: '12px 0',
        }} />

        {/* Auth section */}
        {isAuthenticated ? (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              marginBottom: '10px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '9px',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                boxShadow: '0 2px 8px rgba(124,58,237,0.35)',
              }}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(237,237,242,0.85)' }}>
                {user?.username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="pnav-btn-logout"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '13px',
                borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600,
                color: '#fca5a5', background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.18)',
                cursor: 'pointer',
              }}
            >
              <NavIcons.Logout /> Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="pnav-drawer-btn-login"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'block', textAlign: 'center', width: '100%',
                padding: '13px', borderRadius: '12px', marginBottom: '10px',
                fontSize: '0.95rem', fontWeight: 600,
                color: 'rgba(237,237,242,0.8)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="pnav-drawer-btn-signup"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'block', textAlign: 'center', width: '100%',
                padding: '13px', borderRadius: '12px',
                fontSize: '0.95rem', fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                border: 'none', textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
                transition: 'all 0.2s',
              }}
            >
              Get Started →
            </Link>
          </>
        )}
      </div>
    </>
  )
}
