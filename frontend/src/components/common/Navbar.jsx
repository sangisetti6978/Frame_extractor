import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../../context/AuthContext'

/* ─── Inline styles for the pro navbar ─── */
const s = {
  nav: (scrolled) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 clamp(16px, 4vw, 48px)',
    transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
    background: scrolled
      ? 'rgba(8,8,18,0.82)'
      : 'rgba(8,8,18,0.45)',
    backdropFilter: 'blur(20px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
    borderBottom: scrolled
      ? '1px solid rgba(255,255,255,0.08)'
      : '1px solid rgba(255,255,255,0.04)',
    boxShadow: scrolled
      ? '0 8px 32px rgba(0,0,0,0.35)'
      : 'none',
  }),
  inner: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  /* Logo */
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    transition: 'transform 0.3s',
  },
  logoIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
    transition: 'all 0.3s',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    background: 'linear-gradient(135deg, #f0f0f5 60%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  /* Nav links */
  linksRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  navLink: (active) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontWeight: 600,
    letterSpacing: '0.01em',
    color: active ? '#fff' : 'rgba(240,240,245,0.6)',
    background: active ? 'rgba(124,58,237,0.18)' : 'transparent',
    border: active ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
    textDecoration: 'none',
    transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
    cursor: 'pointer',
    position: 'relative',
  }),

  /* Auth buttons */
  authRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  btnLogin: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 20px',
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'rgba(240,240,245,0.75)',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.25s',
  },
  btnSignup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 22px',
    borderRadius: '10px',
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#fff',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    border: 'none',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.25s',
    boxShadow: '0 4px 16px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
  },

  /* User pill */
  userPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 14px 6px 6px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    transition: 'all 0.25s',
    cursor: 'default',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '9px',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.8rem',
    boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'rgba(240,240,245,0.85)',
  },
  btnLogout: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 18px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#fca5a5',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    cursor: 'pointer',
    transition: 'all 0.25s',
  },

  /* Mobile hamburger */
  hamburger: {
    display: 'none',
    padding: '8px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer',
    transition: 'all 0.25s',
    color: 'rgba(240,240,245,0.8)',
  },

  /* Mobile drawer */
  drawer: (open) => ({
    position: 'fixed',
    top: '72px',
    left: 0,
    right: 0,
    bottom: open ? 0 : 'auto',
    background: 'rgba(8,8,18,0.95)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    padding: open ? '16px 24px 32px' : '0 24px',
    maxHeight: open ? '100vh' : '0',
    overflow: 'hidden',
    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
    opacity: open ? 1 : 0,
    zIndex: 999,
  }),
  drawerLink: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 600,
    color: active ? '#fff' : 'rgba(240,240,245,0.65)',
    background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
    border: active ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
    textDecoration: 'none',
    transition: 'all 0.2s',
    marginBottom: '4px',
  }),
  drawerDivider: {
    height: '1px',
    background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)',
    margin: '12px 0',
  },
  drawerBtnLogin: {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'rgba(240,240,245,0.8)',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    textDecoration: 'none',
    transition: 'all 0.2s',
    marginBottom: '8px',
  },
  drawerBtnSignup: {
    display: 'block',
    width: '100%',
    textAlign: 'center',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#fff',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    border: 'none',
    textDecoration: 'none',
    transition: 'all 0.2s',
    boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
  },
}

/* ─── Navbar style injection (hover effects + responsive) ─── */
const navStyleSheet = `
.pro-nav-link:hover {
  color: #fff !important;
  background: rgba(255,255,255,0.06) !important;
}
.pro-logo-wrap:hover {
  transform: scale(1.02);
}
.pro-logo-wrap:hover .pro-logo-icon {
  box-shadow: 0 6px 24px rgba(124,58,237,0.5) !important;
  transform: rotate(-4deg);
}
.pro-btn-login:hover {
  color: #fff !important;
  background: rgba(255,255,255,0.1) !important;
  border-color: rgba(255,255,255,0.18) !important;
}
.pro-btn-signup:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.2) !important;
}
.pro-btn-logout:hover {
  color: #fef2f2 !important;
  background: rgba(239,68,68,0.2) !important;
  border-color: rgba(239,68,68,0.35) !important;
}
.pro-user-pill:hover {
  background: rgba(255,255,255,0.09) !important;
  border-color: rgba(255,255,255,0.12) !important;
}
.pro-hamburger:hover {
  background: rgba(255,255,255,0.1) !important;
  color: #fff !important;
}
.pro-drawer-link:hover {
  color: #fff !important;
  background: rgba(255,255,255,0.06) !important;
}
.pro-drawer-btn-login:hover {
  background: rgba(255,255,255,0.1) !important;
  color: #fff !important;
}
.pro-drawer-btn-signup:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(124,58,237,0.45) !important;
}

@media (max-width: 768px) {
  .pro-desktop-links,
  .pro-desktop-auth {
    display: none !important;
  }
  .pro-hamburger {
    display: flex !important;
  }
}
`

/* ─── Nav link icons ─── */
const NavIcons = {
  Home: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Dashboard: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Gallery: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
    </svg>
  ),
  Setup: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  ),
  Film: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/>
    </svg>
  ),
  Logout: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
}

const iconMap = {
  Home: NavIcons.Home,
  Dashboard: NavIcons.Dashboard,
  Gallery: NavIcons.Gallery,
  Setup: NavIcons.Setup,
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  /* Inject styles once */
  useEffect(() => {
    const id = 'pro-navbar-styles'
    if (!document.getElementById(id)) {
      const el = document.createElement('style')
      el.id = id
      el.textContent = navStyleSheet
      document.head.appendChild(el)
    }
  }, [])

  /* Scroll listener */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Close drawer on route change */
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

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
      { to: '/setup', label: 'Setup' }
    ] : [])
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      <nav style={s.nav(scrolled)}>
        <div style={s.inner}>
          {/* ─── Logo ─── */}
          <Link to="/" style={s.logoWrap} className="pro-logo-wrap">
            <div style={s.logoIcon} className="pro-logo-icon">
              <NavIcons.Film />
            </div>
            <span style={s.logoText}>FrameExtractor</span>
          </Link>

          {/* ─── Desktop Nav Links ─── */}
          <ul style={s.linksRow} className="pro-desktop-links">
            {navLinks.map((link) => {
              const Icon = iconMap[link.label]
              return (
                <li key={link.to} style={{ listStyle: 'none' }}>
                  <Link
                    to={link.to}
                    style={s.navLink(isActive(link.to))}
                    className="pro-nav-link"
                  >
                    {Icon && <Icon />}
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* ─── Desktop Auth ─── */}
          <div style={s.authRow} className="pro-desktop-auth">
            {isAuthenticated ? (
              <>
                <div style={s.userPill} className="pro-user-pill">
                  <div style={s.userAvatar}>
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span style={s.userName}>{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  style={s.btnLogout}
                  className="pro-btn-logout"
                >
                  <NavIcons.Logout /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={s.btnLogin} className="pro-btn-login">
                  Login
                </Link>
                <Link to="/register" style={s.btnSignup} className="pro-btn-signup">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ─── Hamburger (mobile) ─── */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={s.hamburger}
            className="pro-hamburger"
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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

      {/* ─── Mobile Drawer ─── */}
      <div style={s.drawer(isOpen)}>
        {navLinks.map((link) => {
          const Icon = iconMap[link.label]
          return (
            <Link
              key={link.to}
              to={link.to}
              style={s.drawerLink(isActive(link.to))}
              className="pro-drawer-link"
              onClick={() => setIsOpen(false)}
            >
              {Icon && <Icon />}
              {link.label}
            </Link>
          )
        })}

        <div style={s.drawerDivider} />

        {isAuthenticated ? (
          <>
            <div style={{ ...s.userPill, margin: '8px 0 12px', padding: '12px 16px' }} className="pro-user-pill">
              <div style={s.userAvatar}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span style={s.userName}>{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              style={{ ...s.btnLogout, width: '100%', justifyContent: 'center', padding: '14px' }}
              className="pro-btn-logout"
            >
              <NavIcons.Logout /> Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={s.drawerBtnLogin}
              className="pro-drawer-btn-login"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              style={s.drawerBtnSignup}
              className="pro-drawer-btn-signup"
              onClick={() => setIsOpen(false)}
            >
              Get Started →
            </Link>
          </>
        )}
      </div>
    </>
  )
}
