import React, { useContext, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { OnboardingContext } from '../../context/OnboardingContext'
import {
  LayoutDashboard,
  Video,
  Image as ImageIcon,
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Lock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

const STEP_FOR_PATH = {
  '/dashboard': -1,  // always available
  '/setup': 0,
  '/workspace': 1,
  '/gallery': 2,
  '/analytics': 3,
  '/ai-help': -1, // always available
  '/admin-panel': -1, // admin always available
}

const STEP_LABELS = {
  '/setup': 'Accept Terms & Conditions first',
  '/workspace': 'Complete Configuration first',
  '/gallery': 'Upload a video first',
  '/analytics': 'Visit the Gallery first',
}

export default function Sidebar({ isCollapsed, setIsCollapsed, onClose }) {
  const { user, logout, isAuthenticated } = useContext(AuthContext)
  const { isPathUnlocked, currentStep, setShowTerms } = useContext(OnboardingContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [lockedToast, setLockedToast] = useState(null)
  const isAdmin = user?.is_staff || user?.is_superuser

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Configuration', icon: Settings, path: '/setup' },
    { label: 'Upload Video', icon: Video, path: '/workspace' },
    { label: 'Gallery', icon: ImageIcon, path: '/gallery' },
    { label: 'Analytics', icon: Activity, path: '/analytics' },
    { label: 'AI Help', icon: Sparkles, path: '/ai-help' },
  ]

  if (user?.is_staff || user?.is_superuser) {
    navItems.push({ label: 'Admin Portal', icon: ShieldAlert, path: '/admin-panel' })
  }

  const handleLogout = () => {
    logout()
    if (onClose) onClose()
  }

  const handleNavClick = (e, item) => {
    if (!isPathUnlocked(item.path)) {
      e.preventDefault()
      const msg = currentStep === -1
        ? 'Please accept Terms & Conditions first'
        : STEP_LABELS[item.path] || 'Complete the previous step first'
      setLockedToast(msg)
      setTimeout(() => setLockedToast(null), 3000)

      // If T&C not accepted, show terms modal
      if (currentStep === -1) {
        setTimeout(() => setShowTerms(true), 300)
      }
    } else {
      if (window.innerWidth < 1024 && onClose) onClose()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo Area */}
      <div style={{
        height: 'var(--topbar-height)',
        display: 'flex',
        alignItems: 'center',
        padding: isCollapsed ? '0 16px' : '0 24px',
        borderBottom: '1px solid var(--border-subtle)',
        justifyContent: isCollapsed ? 'center' : 'space-between'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'var(--grad-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0
          }}>
            <Video size={18} />
          </div>
          {!isCollapsed && (
            <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              AutoFrame
            </span>
          )}
        </Link>
        {!isCollapsed && window.innerWidth >= 1024 && (
          <button
            onClick={() => setIsCollapsed(true)}
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {/* Locked Toast */}
      {lockedToast && (
        <div style={{
          margin: '12px 12px 0',
          padding: '10px 14px',
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '10px',
          fontSize: '0.75rem',
          color: '#fca5a5',
          display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'slideDown 0.3s ease',
        }}>
          <Lock size={12} style={{ flexShrink: 0 }} />
          {lockedToast}
        </div>
      )}

      {/* Onboarding progress indicator */}
      {!isAdmin && !isCollapsed && currentStep >= 0 && currentStep < 4 && (
        <div style={{ margin: '16px 16px 0', padding: '12px 14px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Setup Progress</div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((currentStep + 1) / 5) * 100}%`, background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', borderRadius: '99px', transition: 'width 0.6s ease' }} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>
            Step {currentStep + 1} of 5 complete
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const unlocked = isPathUnlocked(item.path)
          const stepRequired = STEP_FOR_PATH[item.path]
          const isCompleted = !isAdmin && currentStep > stepRequired && stepRequired >= 0

          return (
            <Link
              key={item.path}
              to={unlocked ? item.path : '#'}
              onClick={(e) => handleNavClick(e, item)}
              title={!unlocked ? (STEP_LABELS[item.path] || 'Locked') : item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                color: !unlocked ? 'rgba(255,255,255,0.2)' : isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive && unlocked ? 'var(--bg-surface-hover)' : 'transparent',
                borderLeft: isActive && unlocked ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                cursor: unlocked ? 'pointer' : 'not-allowed',
                opacity: unlocked ? 1 : 0.55,
                position: 'relative',
              }}
            >
              <item.icon
                size={20}
                style={{ color: !unlocked ? 'rgba(255,255,255,0.2)' : isActive ? 'var(--accent-cyan)' : 'inherit', flexShrink: 0 }}
              />
              {!isCollapsed && (
                <>
                  <span style={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 500, flex: 1 }}>
                    {item.label}
                  </span>
                  {/* Lock / Check icon */}
                  {!isAdmin && (
                    unlocked ? (
                      isCompleted ? (
                        <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                      ) : null
                    ) : (
                      <Lock size={13} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                    )
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Bottom */}
      {isAuthenticated && (
        <div style={{
          padding: '20px 16px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: isCollapsed ? 0 : '16px',
            justifyContent: isCollapsed ? 'center' : 'flex-start'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--grad-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, flexShrink: 0
            }}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {user?.username}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {isAdmin ? 'Admin Account' : 'Creator Account'}
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 500,
                background: 'var(--danger-dim)', transition: 'background var(--transition-fast)'
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          )}
          {isCollapsed && window.innerWidth >= 1024 && (
            <button
              onClick={() => setIsCollapsed(false)}
              style={{ color: 'var(--text-muted)', marginTop: '16px', width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
