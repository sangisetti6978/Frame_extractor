import { useState, useEffect, useRef } from 'react'

const toastCSS = `
@keyframes toastSlideIn {
  from { opacity: 0; transform: translateX(100%) scale(0.9); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes toastSlideOut {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to   { opacity: 0; transform: translateX(120%) scale(0.9); }
}
@keyframes toastProgress {
  from { width: 100%; }
  to   { width: 0%; }
}
.toast-enter { animation: toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
.toast-exit  { animation: toastSlideOut 0.35s cubic-bezier(0.4, 0, 1, 1) both; }
.toast-bar   { animation: toastProgress linear both; }
`

const ICONS = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
}

const CONFIG = {
  success: {
    accent: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
    glow: 'rgba(16,185,129,0.15)',
    iconBg: 'rgba(16,185,129,0.15)',
  },
  error: {
    accent: '#f43f5e',
    bg: 'rgba(244,63,94,0.08)',
    border: 'rgba(244,63,94,0.25)',
    glow: 'rgba(244,63,94,0.15)',
    iconBg: 'rgba(244,63,94,0.15)',
  },
  info: {
    accent: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.25)',
    glow: 'rgba(96,165,250,0.15)',
    iconBg: 'rgba(96,165,250,0.15)',
  },
  warning: {
    accent: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    glow: 'rgba(245,158,11,0.15)',
    iconBg: 'rgba(245,158,11,0.15)',
  },
}

export default function NotificationToast({ message, type = 'info', duration = 3500, onClose }) {
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef(null)
  const cfg = CONFIG[type] || CONFIG.info

  // Inject styles once
  useEffect(() => {
    const id = 'notif-toast-styles'
    if (!document.getElementById(id)) {
      const el = document.createElement('style')
      el.id = id
      el.textContent = toastCSS
      document.head.appendChild(el)
    }
  }, [])

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onClose?.(), 380)
    }, duration)
    return () => clearTimeout(timerRef.current)
  }, [duration, onClose])

  const handleClose = () => {
    clearTimeout(timerRef.current)
    setExiting(true)
    setTimeout(() => onClose?.(), 380)
  }

  return (
    <div
      className={exiting ? 'toast-exit' : 'toast-enter'}
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 99999,
        maxWidth: '400px',
        minWidth: '280px',
        borderRadius: '18px',
        padding: '16px 18px',
        background: `rgba(10,10,20,0.85)`,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Glow accent */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '2px',
        background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)`,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Icon */}
        <div style={{
          flexShrink: 0,
          width: '38px', height: '38px',
          borderRadius: '12px',
          background: cfg.iconBg,
          border: `1px solid ${cfg.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: cfg.accent,
        }}>
          {ICONS[type] || ICONS.info}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: '1px' }}>
          <p style={{
            margin: 0,
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#f0f0f5',
            lineHeight: 1.5,
            wordBreak: 'break-word',
          }}>
            {message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            flexShrink: 0,
            width: '28px', height: '28px',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(240,240,245,0.4)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            marginTop: '2px',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#f0f0f5' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(240,240,245,0.4)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0,
        height: '2px',
        background: 'rgba(255,255,255,0.06)',
        width: '100%',
      }}>
        <div
          className="toast-bar"
          style={{
            height: '100%',
            background: cfg.accent,
            animationDuration: `${duration}ms`,
          }}
        />
      </div>
    </div>
  )
}
