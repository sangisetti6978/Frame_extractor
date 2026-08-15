import { useContext, useEffect, useRef, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

/* ═══════════════════════════════════════════
   GLOBAL KEYFRAMES & PREMIUM STYLES
   ═══════════════════════════════════════════ */
const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');

/* ─── Core Animations ─── */
@keyframes cubeSpin {
  0%   { transform: rotateX(-20deg) rotateY(0deg); }
  100% { transform: rotateX(-20deg) rotateY(360deg); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px) rotateX(8deg) rotateY(-8deg); }
  50%      { transform: translateY(-20px) rotateX(8deg) rotateY(-8deg); }
}
@keyframes floatSlow {
  0%, 100% { transform: translateY(0px); }
  50%      { transform: translateY(-14px); }
}
@keyframes floatReverse {
  0%, 100% { transform: translateY(0px); }
  50%      { transform: translateY(14px); }
}

/* ─── Aurora Background ─── */
@keyframes auroraShift {
  0%, 100% { background-position: 0% 50%; }
  33%      { background-position: 100% 50%; }
  66%      { background-position: 50% 0%; }
}

/* ─── Orbs ─── */
@keyframes orbDrift1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(70px, -50px) scale(1.12); }
  66%      { transform: translate(-40px, 35px) scale(0.93); }
}
@keyframes orbDrift2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%      { transform: translate(-60px, 55px) scale(1.08); }
  66%      { transform: translate(50px, -25px) scale(0.88); }
}
@keyframes orbDrift3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(35px, 65px) scale(1.18); }
}
@keyframes orbDrift4 {
  0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
  50%      { transform: translate(-45px, -35px) scale(1.1) rotate(180deg); }
}

/* ─── Entrance ─── */
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(60px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.88) translateY(24px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* ─── Shimmer ─── */
@keyframes shimmerText {
  0%   { background-position: -300% center; }
  100% { background-position: 300% center; }
}
@keyframes shimmerGlow {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}

/* ─── Marquee ─── */
@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ─── Pulse Ring ─── */
@keyframes pulseRingBig {
  0%   { transform: scale(0.85); opacity: 1; }
  100% { transform: scale(2.8); opacity: 0; }
}

/* ─── Particle Float ─── */
@keyframes particleDrift {
  0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
  25%       { transform: translateY(-30px) translateX(15px); opacity: 0.7; }
  50%       { transform: translateY(-60px) translateX(-10px); opacity: 0.4; }
  75%       { transform: translateY(-40px) translateX(20px); opacity: 0.6; }
}

/* ─── Badge scanline ─── */
@keyframes badgeScan {
  0%   { left: -30%; }
  100% { left: 130%; }
}

/* ─── 3D Card Tilt ─── */
.h3d-card-tilt {
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.5s ease;
}
.h3d-card-tilt:hover {
  transform: perspective(900px) rotateY(-5deg) rotateX(4deg) translateZ(24px) scale(1.03) !important;
  box-shadow: 0 35px 70px rgba(0,0,0,0.45), 0 0 50px rgba(124,58,237,0.18) !important;
}

/* ─── Button Hovers ─── */
.h3d-btn-primary {
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1) !important;
}
.h3d-btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0));
  opacity: 0;
  transition: opacity 0.3s;
}
.h3d-btn-primary:hover {
  transform: translateY(-4px) scale(1.04);
  box-shadow: 0 20px 48px rgba(124,58,237,0.55), 0 0 100px rgba(124,58,237,0.12) !important;
}
.h3d-btn-primary:hover::before { opacity: 1; }

.h3d-btn-secondary {
  transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1) !important;
}
.h3d-btn-secondary:hover {
  background: rgba(255,255,255,0.1) !important;
  border-color: rgba(255,255,255,0.28) !important;
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.3) !important;
}

.h3d-btn-glass {
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1) !important;
}
.h3d-btn-glass::before {
  content: '';
  position: absolute;
  top: 0; left: -100%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
  transition: left 0.5s;
}
.h3d-btn-glass:hover::before { left: 160%; }
.h3d-btn-glass:hover {
  background: rgba(255,255,255,0.1) !important;
  border-color: rgba(255,255,255,0.15) !important;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 16px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15) !important;
}

/* ─── Feature Cards ─── */
.h3d-feature {
  position: relative;
  overflow: hidden;
  transition: all 0.45s cubic-bezier(0.23, 1, 0.32, 1) !important;
}
.h3d-feature::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 60% at 50% 0%, rgba(124,58,237,0.08), transparent);
  opacity: 0;
  transition: opacity 0.4s;
}
.h3d-feature:hover {
  background: rgba(255,255,255,0.06) !important;
  border-color: rgba(124,58,237,0.35) !important;
  transform: translateY(-8px) !important;
  box-shadow: 0 24px 48px rgba(0,0,0,0.35), 0 0 40px rgba(124,58,237,0.08) !important;
}
.h3d-feature:hover::before { opacity: 1; }
.h3d-feature:hover .h3d-feature-icon {
  transform: scale(1.18) rotateZ(-8deg);
  box-shadow: 0 10px 30px rgba(124,58,237,0.4) !important;
}
.h3d-feature-icon {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1) !important;
}

/* ─── Workspace Cards ─── */
.h3d-ws-card {
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1) !important;
}
.h3d-ws-card:hover {
  transform: perspective(900px) rotateY(-4deg) rotateX(3deg) translateZ(32px) scale(1.03) !important;
  box-shadow: 0 40px 80px rgba(0,0,0,0.45), 0 0 60px rgba(124,58,237,0.18) !important;
  border-color: rgba(124,58,237,0.5) !important;
}
.h3d-ws-card:hover .h3d-ws-icon {
  transform: scale(1.22) rotateZ(-10deg);
  box-shadow: 0 10px 36px rgba(124,58,237,0.5) !important;
}
.h3d-ws-icon {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1) !important;
}
.h3d-ws-card:hover .h3d-ws-arrow {
  transform: translateX(8px) !important;
  opacity: 1 !important;
}
.h3d-ws-arrow {
  transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1) !important;
}

/* ─── Stat Cards ─── */
.h3d-stat:hover {
  background: rgba(255,255,255,0.05) !important;
  transform: translateY(-6px) !important;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important;
}

/* ─── Step Cards ─── */
.h3d-step:hover {
  background: rgba(255,255,255,0.06) !important;
  border-color: rgba(96,165,250,0.3) !important;
  transform: translateY(-6px) !important;
}

/* ─── Responsive ─── */
@media (max-width: 1024px) {
  .h3d-workspace-grid { grid-template-columns: 1fr !important; max-width: 480px !important; }
  .h3d-hero-split { grid-template-columns: 1fr !important; text-align: center !important; }
  .h3d-cube-wrap { display: none !important; }
  .h3d-hero-text { align-items: center !important; }
}
@media (max-width: 768px) {
  .h3d-features-grid { grid-template-columns: 1fr !important; }
  .h3d-stats-grid { grid-template-columns: 1fr !important; }
  .h3d-btn-row { flex-direction: column !important; align-items: stretch !important; }
  .h3d-steps-grid { grid-template-columns: 1fr 1fr !important; }
}
@media (max-width: 480px) {
  .h3d-steps-grid { grid-template-columns: 1fr !important; }
}
`

/* ═══════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════ */
function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])
  return { ref, visible }
}

function useCounter(target, duration = 2200) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const startTime = performance.now()
          const step = (now) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 4)
            setCount(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])
  return { count, ref }
}

function useTilt(maxDeg = 10) {
  const ref = useRef(null)
  const handleMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${x * maxDeg * 2}deg) rotateX(${-y * maxDeg}deg) translateZ(12px)`
  }, [maxDeg])
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = ''
  }, [])
  return { ref, onMouseMove: handleMove, onMouseLeave: handleLeave }
}

/* ═══════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════ */
const Icons = {
  Sparkles: ({ size = 26 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/>
    </svg>
  ),
  Eye: ({ size = 26 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.062 12.348a1 1 0 010-.696 10.75 10.75 0 0119.876 0 1 1 0 010 .696 10.75 10.75 0 01-19.876 0"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Grid: ({ size = 26 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Sliders: ({ size = 26 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
      <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
      <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
    </svg>
  ),
  Cloud: ({ size = 26 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 110-14 7.1 7.1 0 015.7 2.8A5 5 0 0121 13a4.5 4.5 0 01-3.5 6z"/>
    </svg>
  ),
  Zap: ({ size = 26 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Play: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  Dashboard: ({ size = 30 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Gallery: ({ size = 30 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
    </svg>
  ),
  Setup: ({ size = 30 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  ),
  Film: ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
      <line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Profile: ({ size = 30 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Star: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
}

/* ═══════════════════════════════════════════
   3D CUBE
   ═══════════════════════════════════════════ */
function Cube3D() {
  const faceStyle = (bg, transform) => ({
    position: 'absolute',
    width: '160px', height: '160px', borderRadius: '22px',
    background: bg,
    border: '1px solid rgba(255,255,255,0.12)',
    backdropFilter: 'blur(10px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'rgba(255,255,255,0.85)',
    transform,
    boxShadow: 'inset 0 0 40px rgba(255,255,255,0.04)',
  })
  return (
    <div style={{ perspective: '1100px', width: '160px', height: '160px', margin: '0 auto' }}>
      <div style={{
        width: '160px', height: '160px', position: 'relative',
        transformStyle: 'preserve-3d',
        animation: 'cubeSpin 14s linear infinite',
      }}>
        <div style={faceStyle('linear-gradient(135deg, rgba(124,58,237,0.55), rgba(37,99,235,0.55))', 'translateZ(80px)')}><Icons.Film size={36} /></div>
        <div style={faceStyle('linear-gradient(135deg, rgba(37,99,235,0.55), rgba(6,182,212,0.55))', 'rotateY(90deg) translateZ(80px)')}><Icons.Sparkles /></div>
        <div style={faceStyle('linear-gradient(135deg, rgba(6,182,212,0.45), rgba(124,58,237,0.45))', 'rotateY(180deg) translateZ(80px)')}><Icons.Eye /></div>
        <div style={faceStyle('linear-gradient(135deg, rgba(168,85,247,0.45), rgba(59,130,246,0.45))', 'rotateY(-90deg) translateZ(80px)')}><Icons.Zap /></div>
        <div style={faceStyle('linear-gradient(135deg, rgba(124,58,237,0.35), rgba(6,182,212,0.35))', 'rotateX(90deg) translateZ(80px)')}><Icons.Grid /></div>
        <div style={faceStyle('linear-gradient(135deg, rgba(59,130,246,0.35), rgba(168,85,247,0.35))', 'rotateX(-90deg) translateZ(80px)')}><Icons.Cloud /></div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   FLOATING GLASS CARD
   ═══════════════════════════════════════════ */
function FloatingCard({ children, style, animation = 'floatSlow', duration = '6s', delay = '0s' }) {
  return (
    <div style={{
      padding: '16px 22px', borderRadius: '18px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.09)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 10px 36px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
      animation: `${animation} ${duration} ease-in-out infinite`,
      animationDelay: delay,
      ...style,
    }}>
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════
   REVEAL HELPER
   ═══════════════════════════════════════════ */
const reveal = (visible, delay = 0) => ({
  opacity: visible ? 1 : 0,
  transform: visible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.97)',
  transition: `opacity 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
})

/* ═══════════════════════════════════════════
   PARTICLE BACKGROUND
   ═══════════════════════════════════════════ */
function Particles({ count = 20 }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: `${Math.random() * 8 + 6}s`,
      delay: `${Math.random() * 8}s`,
      color: ['rgba(124,58,237,0.6)', 'rgba(96,165,250,0.6)', 'rgba(6,182,212,0.5)'][Math.floor(Math.random() * 3)],
    }))
  ).current

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          top: p.top, left: p.left,
          width: p.size, height: p.size,
          borderRadius: '50%',
          background: p.color,
          animation: `particleDrift ${p.duration} ease-in-out infinite`,
          animationDelay: p.delay,
          boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
        }} />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════
   SECTION DIVIDER
   ═══════════════════════════════════════════ */
function SectionDivider() {
  return (
    <div style={{
      width: '100%', height: '1px',
      background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.3), rgba(96,165,250,0.2), transparent)',
    }} />
  )
}

/* ═══════════════════════════════════════════
   MAIN HOME COMPONENT
   ═══════════════════════════════════════════ */
export default function Home() {
  const { isAuthenticated, user } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    const id = 'h3d-global-styles'
    if (!document.getElementById(id)) {
      const el = document.createElement('style')
      el.id = id
      el.textContent = globalCSS
      document.head.appendChild(el)
    }
  }, [])

  return isAuthenticated ? <AuthenticatedHome user={user} navigate={navigate} /> : <UnauthenticatedHome />
}

/* ╔═══════════════════════════════════════════════╗
   ║  UNAUTHENTICATED LANDING PAGE                ║
   ╚═══════════════════════════════════════════════╝ */
function UnauthenticatedHome() {
  const feat = useReveal()
  const howIt = useReveal()
  const cta = useReveal()

  const features = [
    {
      icon: <Icons.Sparkles />, title: 'Auto-Capture',
      desc: 'Capture frames automatically when pausing. Zero clicks, maximum efficiency.',
      gradient: 'linear-gradient(135deg, #7c3aed, #6366f1)',
      glow: 'rgba(124,58,237,0.35)',
    },
    {
      icon: <Icons.Eye />, title: 'Blur Detection',
      desc: 'ML-powered rejection of motion blur ensures only pristine, sharp frames survive.',
      gradient: 'linear-gradient(135deg, #2563eb, #06b6d4)',
      glow: 'rgba(37,99,235,0.35)',
    },
    {
      icon: <Icons.Grid />, title: 'Gallery Management',
      desc: 'Organize, curate, and batch-export your frames with an intuitive visual interface.',
      gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
      glow: 'rgba(139,92,246,0.35)',
    },
    {
      icon: <Icons.Sliders />, title: 'Custom Config',
      desc: 'Control formats, quality thresholds, and extraction timing down to the millisecond.',
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      glow: 'rgba(245,158,11,0.35)',
    },
    {
      icon: <Icons.Cloud />, title: 'Cloud Persistence',
      desc: 'Your library is safely stored and accessible anywhere, anytime, any device.',
      gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
      glow: 'rgba(16,185,129,0.35)',
    },
    {
      icon: <Icons.Zap />, title: 'Realtime Pipeline',
      desc: 'Engineered for blistering speed with FFmpeg + OpenCV under the hood.',
      gradient: 'linear-gradient(135deg, #f43f5e, #a855f7)',
      glow: 'rgba(244,63,94,0.35)',
    },
  ]

  const steps = [
    { num: '01', title: 'Register', desc: 'Create your secure workspace in seconds.', color: '#7c3aed' },
    { num: '02', title: 'Configure', desc: 'Set your extraction rules and quality thresholds.', color: '#2563eb' },
    { num: '03', title: 'Upload', desc: 'Drop in your raw footage — any format.', color: '#06b6d4' },
    { num: '04', title: 'Extract', desc: 'Watch your gallery build itself, frame by frame.', color: '#10b981' },
  ]

  const marqueeItems = ['FFmpeg Powered', 'OpenCV ML', 'HD Extraction', 'Blur Detection', 'Cloud Storage', 'Multi-Format', 'Auto-Capture', 'Batch Processing', '4K Ready', 'AI Filter']

  return (
    <div style={{
      minHeight: '100vh',
      background: '#030308',
      color: '#ededf2',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflowX: 'hidden',
    }}>

      {/* ══════════ ANIMATED BACKGROUND ORBS ══════════ */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 68%)',
          top: '-15%', left: '-12%', filter: 'blur(70px)',
          animation: 'orbDrift1 22s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 68%)',
          top: '25%', right: '-8%', filter: 'blur(90px)',
          animation: 'orbDrift2 28s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: '450px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 68%)',
          bottom: '8%', left: '18%', filter: 'blur(80px)',
          animation: 'orbDrift3 20s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,63,94,0.1) 0%, transparent 68%)',
          top: '55%', left: '50%', filter: 'blur(80px)',
          animation: 'orbDrift4 32s ease-in-out infinite',
        }} />
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 20%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 20%, black, transparent)',
        }} />
      </div>

      {/* ══════════ NAVBAR ══════════ */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 5%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0, boxShadow: '0 4px 12px rgba(124,58,237,0.3)'
          }}>
            <Icons.Film size={20} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
            AutoFrame
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/login" style={{
            fontSize: '0.95rem', fontWeight: 600, color: 'rgba(237,237,242,0.8)',
            textDecoration: 'none', transition: 'color 0.2s'
          }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = 'rgba(237,237,242,0.8)'}>
            Sign In
          </Link>
          <Link to="/register" style={{
            padding: '10px 24px', borderRadius: '12px',
            fontSize: '0.95rem', fontWeight: 600, color: '#fff',
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }} onMouseOver={e => { e.target.style.background = 'rgba(255,255,255,0.15)'; e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)' }} onMouseOut={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '120px 24px 100px',
      }}>
        <Particles count={18} />

        <div className="h3d-hero-split" style={{
          maxWidth: '1200px', width: '100%', margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '80px', alignItems: 'center', position: 'relative', zIndex: 10,
        }}>
          {/* Left: Text */}
          <div className="h3d-hero-text" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            animation: 'heroFadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',
          }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '7px 18px', borderRadius: '999px',
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.22)',
              fontSize: '0.72rem', fontWeight: 700, color: '#c4b5fd',
              marginBottom: '36px', letterSpacing: '0.12em', textTransform: 'uppercase',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, bottom: 0,
                width: '30%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                animation: 'badgeScan 3s ease-in-out infinite',
              }} />
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#c4b5fd', display: 'inline-block',
                boxShadow: '0 0 10px rgba(196,181,253,0.8)',
                animation: 'shimmerGlow 2s ease-in-out infinite',
              }} />
              Professional Video Workspace
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(2.8rem, 6vw, 4.8rem)', fontWeight: 900,
              lineHeight: 1.06, marginBottom: '28px', letterSpacing: '-0.045em',
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            }}>
              Extract{' '}
              <span style={{
                background: 'linear-gradient(135deg, #c4b5fd 0%, #93c5fd 45%, #67e8f9 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                backgroundSize: '200% auto',
                animation: 'shimmerText 4s linear infinite',
                display: 'inline-block',
              }}>pristine</span>
              <br />frames from video.
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.18rem)', lineHeight: 1.75,
              color: 'rgba(237,237,242,0.48)', maxWidth: '460px', marginBottom: '44px',
            }}>
              The professional tool for curating high-fidelity still images from video.
              Powered by intelligent blur detection and streamlined workflows.
            </p>

            {/* Rating */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px',
            }}>
              <div style={{ display: 'flex', gap: '3px', color: '#fbbf24' }}>
                {[...Array(5)].map((_, i) => <Icons.Star key={i} />)}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'rgba(237,237,242,0.45)', fontWeight: 500 }}>
                Trusted by 10,000+ creators
              </span>
            </div>

            <div className="h3d-btn-row" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/register" className="h3d-btn-primary" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '15px 36px', borderRadius: '14px',
                fontSize: '1rem', fontWeight: 700, color: '#fff',
                background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                border: 'none', textDecoration: 'none', cursor: 'pointer',
                boxShadow: '0 10px 32px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}>
                Get Started <Icons.ArrowRight />
              </Link>
              <Link to="/login" className="h3d-btn-secondary" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '15px 36px', borderRadius: '14px',
                fontSize: '1rem', fontWeight: 600, color: 'rgba(237,237,242,0.78)',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.11)',
                textDecoration: 'none', cursor: 'pointer',
              }}>
                <Icons.Play /> Sign In
              </Link>
            </div>
          </div>

          {/* Right: 3D Cube + Floating Cards */}
          <div className="h3d-cube-wrap" style={{
            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '480px',
            animation: 'fadeInScale 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
          }}>
            {/* Large glow behind cube */}
            <div style={{
              position: 'absolute', width: '360px', height: '360px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, rgba(37,99,235,0.1) 50%, transparent 70%)',
              filter: 'blur(50px)',
            }} />
            <Cube3D />

            <FloatingCard style={{ position: 'absolute', top: '8px', right: '-24px', minWidth: '140px' }} delay="0s" duration="5s">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px rgba(52,211,153,0.6)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(237,237,242,0.8)' }}>4K Ready</span>
              </div>
            </FloatingCard>

            <FloatingCard style={{ position: 'absolute', bottom: '28px', left: '-44px', minWidth: '160px' }} animation="floatReverse" delay="1.2s" duration="7s">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icons.Zap size={18} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(237,237,242,0.8)' }}>FFmpeg Powered</span>
              </div>
            </FloatingCard>

            <FloatingCard style={{ position: 'absolute', top: '58%', right: '-52px', minWidth: '140px' }} delay="2.2s" duration="6.5s">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 10px rgba(96,165,250,0.6)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(237,237,242,0.8)' }}>AI Blur Filter</span>
              </div>
            </FloatingCard>

            <FloatingCard style={{ position: 'absolute', top: '-12px', left: '-10px', minWidth: '130px' }} delay="0.8s" duration="5.5s">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f472b6', boxShadow: '0 0 10px rgba(244,114,182,0.6)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(237,237,242,0.8)' }}>OpenCV ML</span>
              </div>
            </FloatingCard>
          </div>
        </div>
      </section>

      {/* ══════════ MARQUEE ══════════ */}
      <div style={{
        padding: '26px 0', overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(255,255,255,0.01)', position: 'relative', zIndex: 1,
      }}>
        <div style={{
          display: 'flex', gap: '80px',
          animation: 'marquee 28s linear infinite', whiteSpace: 'nowrap',
        }}>
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} style={{
              fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.18)',
              letterSpacing: '0.22em', textTransform: 'uppercase', flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.7), rgba(96,165,250,0.7))',
                boxShadow: '0 0 6px rgba(124,58,237,0.4)',
              }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════ FEATURES ══════════ */}
      <section ref={feat.ref} style={{
        padding: '140px 24px', position: 'relative', zIndex: 1,
      }}>
        <SectionDivider />
        <div style={{ maxWidth: '1140px', margin: '0 auto', paddingTop: '80px' }}>
          <div style={reveal(feat.visible)}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '5px 16px', borderRadius: '999px',
              background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
              fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: '24px',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa' }} />
              Features
            </div>
            <h2 style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)', fontWeight: 800,
              lineHeight: 1.08, marginBottom: '20px', letterSpacing: '-0.04em',
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            }}>
              Engineered for{' '}
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>precision</span>.
            </h2>
            <p style={{
              fontSize: '1.1rem', lineHeight: 1.65, color: 'rgba(237,237,242,0.42)',
              maxWidth: '520px', marginBottom: '64px',
            }}>
              Everything required for professional curation, zero clutter.
            </p>
          </div>

          <div className="h3d-features-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
            background: 'rgba(255,255,255,0.07)', borderRadius: '28px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.09)',
          }}>
            {features.map((f, i) => (
              <div key={i} className="h3d-feature" style={{
                padding: '44px 36px', background: '#0d0d1a',
                cursor: 'default', display: 'flex', flexDirection: 'column',
                ...reveal(feat.visible, 80 + i * 90),
              }}>
                <div className="h3d-feature-icon" style={{
                  width: '54px', height: '54px', borderRadius: '18px',
                  background: f.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', marginBottom: '26px',
                  boxShadow: `0 8px 24px ${f.glow}`,
                }}>
                  {f.icon}
                </div>
                <h3 style={{
                  fontSize: '1.18rem', fontWeight: 700, marginBottom: '10px',
                  color: '#ededf2', letterSpacing: '-0.025em',
                }}>{f.title}</h3>
                <p style={{
                  fontSize: '0.9rem', lineHeight: 1.7, color: 'rgba(237,237,242,0.38)',
                }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section ref={howIt.ref} style={{
        padding: '0 24px 140px', position: 'relative', zIndex: 1,
      }}>
        <SectionDivider />
        <div style={{ maxWidth: '1140px', margin: '0 auto', paddingTop: '80px' }}>
          <div style={reveal(howIt.visible)}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '5px 16px', borderRadius: '999px',
              background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)',
              fontSize: '0.7rem', fontWeight: 700, color: '#93c5fd',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              marginBottom: '24px',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#93c5fd' }} />
              How It Works
            </div>
            <h2 style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)', fontWeight: 800,
              lineHeight: 1.08, marginBottom: '20px', letterSpacing: '-0.04em',
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            }}>
              Streamlined{' '}
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa, #06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>workflow</span>.
            </h2>
            <p style={{
              fontSize: '1.1rem', lineHeight: 1.65, color: 'rgba(237,237,242,0.42)',
              maxWidth: '520px', marginBottom: '64px',
            }}>
              A frictionless path from raw footage to a curated gallery.
            </p>
          </div>

          <div className="h3d-steps-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px',
          }}>
            {steps.map((s, i) => (
              <div key={i} className="h3d-step" style={{
                padding: '40px 28px 36px', borderRadius: '24px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'default',
                transition: 'all 0.45s cubic-bezier(0.23, 1, 0.32, 1)',
                position: 'relative', overflow: 'hidden',
                ...reveal(howIt.visible, 120 + i * 130),
              }}>
                {/* Number with glow */}
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: `${s.color}18`,
                  border: `1px solid ${s.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '24px',
                }}>
                  <span style={{
                    fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.04em',
                    color: s.color, fontFamily: 'monospace',
                    textShadow: `0 0 20px ${s.color}80`,
                  }}>{s.num}</span>
                </div>
                <h3 style={{
                  fontSize: '1.18rem', fontWeight: 700, marginBottom: '10px',
                  color: '#ededf2', letterSpacing: '-0.025em',
                }}>{s.title}</h3>
                <p style={{
                  fontSize: '0.9rem', color: 'rgba(237,237,242,0.4)', lineHeight: 1.6,
                }}>{s.desc}</p>
                {/* Bottom accent line */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
                  background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)`,
                }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section ref={cta.ref} style={{
        padding: '160px 24px', textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <SectionDivider />

        {/* Aurora CTA background */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', width: '600px', height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, rgba(37,99,235,0.08) 40%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', ...reveal(cta.visible), paddingTop: '80px' }}>
          {/* PRO badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '8px 22px', borderRadius: '999px',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.15))',
            border: '1px solid rgba(124,58,237,0.3)',
            fontSize: '0.72rem', fontWeight: 700, color: '#c4b5fd',
            marginBottom: '36px', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: '#c4b5fd',
              boxShadow: '0 0 10px rgba(196,181,253,0.7)',
              animation: 'shimmerGlow 2s ease-in-out infinite',
            }} />
            Start for Free
          </div>

          <h2 style={{
            fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 900,
            lineHeight: 1.06, marginBottom: '24px', letterSpacing: '-0.048em',
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
          }}>
            Begin{' '}
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa, #60a5fa, #67e8f9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              backgroundSize: '200% auto',
              animation: 'shimmerText 4s linear infinite',
              display: 'inline-block',
            }}>curating</span>.
          </h2>
          <p style={{
            fontSize: '1.2rem', color: 'rgba(237,237,242,0.4)',
            maxWidth: '500px', margin: '0 auto 52px', lineHeight: 1.7,
          }}>
            Join the professionals trusting FrameExtractor for their workflow.
          </p>
          <Link to="/register" className="h3d-btn-primary" style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            padding: '18px 48px', borderRadius: '16px',
            fontSize: '1.08rem', fontWeight: 700, color: '#fff',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            border: 'none', textDecoration: 'none', cursor: 'pointer',
            boxShadow: '0 12px 36px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.18)',
          }}>
            Create Your Workspace <Icons.ArrowRight />
          </Link>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{
        padding: '48px 24px', textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        position: 'relative', zIndex: 1,
      }}>
        <p style={{ fontSize: '0.78rem', color: 'rgba(237,237,242,0.2)', letterSpacing: '0.02em' }}>
          © {new Date().getFullYear()} FrameExtractor Studio — Built with precision.
        </p>
      </footer>
    </div>
  )
}

/* ╔═══════════════════════════════════════════════════╗
   ║  AUTHENTICATED HOME                             ║
   ╚═══════════════════════════════════════════════════╝ */
function AuthenticatedHome({ user, navigate }) {
  const cards = useReveal()
  const stats = useReveal()
  const quick = useReveal()
  const tilt1 = useTilt(8)
  const tilt2 = useTilt(8)
  const tilt3 = useTilt(8)
  const tilts = [tilt1, tilt2, tilt3]

  const c1 = useCounter(10000)
  const c2 = useCounter(50000)
  const c3 = useCounter(5000)

  const workspaceCards = [
    {
      title: 'Dashboard',
      desc: 'Upload videos, monitor extraction progress, and manage your pipeline in real-time.',
      icon: <Icons.Dashboard />,
      path: '/dashboard',
      gradient: 'linear-gradient(135deg, #7c3aed, #6366f1)',
      shadow: 'rgba(124,58,237,0.35)',
      accentColor: '#7c3aed',
    },
    {
      title: 'Gallery',
      desc: 'Browse, curate, and export your extracted frames with powerful visual tools.',
      icon: <Icons.Gallery />,
      path: '/gallery',
      gradient: 'linear-gradient(135deg, #2563eb, #06b6d4)',
      shadow: 'rgba(37,99,235,0.35)',
      accentColor: '#2563eb',
    },
    {
      title: 'Setup',
      desc: 'Configure extraction parameters, quality thresholds, and output formats.',
      icon: <Icons.Setup />,
      path: '/setup',
      gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
      shadow: 'rgba(139,92,246,0.35)',
      accentColor: '#8b5cf6',
    },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#030308',
      color: '#ededf2',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflowX: 'hidden',
    }}>
      {/* Animated Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)',
          top: '-8%', right: '8%', filter: 'blur(90px)',
          animation: 'orbDrift1 24s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)',
          bottom: '12%', left: '3%', filter: 'blur(80px)',
          animation: 'orbDrift2 30s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
        }} />
      </div>

      {/* ══════════ WELCOME HERO ══════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '140px 24px 60px',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: '820px', margin: '0 auto',
          animation: 'heroFadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}>
          {/* Status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '8px 22px', borderRadius: '999px',
            background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.22)',
            fontSize: '0.75rem', fontWeight: 700, color: '#34d399',
            marginBottom: '36px', letterSpacing: '0.08em',
          }}>
            <span style={{
              position: 'relative', width: 8, height: 8,
            }}>
              <span style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: '#34d399',
                animation: 'pulseRingBig 2.2s ease-out infinite',
              }} />
              <span style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: '#34d399',
              }} />
            </span>
            Workspace Active
          </div>

          <h1 style={{
            fontSize: 'clamp(2.6rem, 5.5vw, 4.4rem)', fontWeight: 900,
            lineHeight: 1.08, marginBottom: '18px', letterSpacing: '-0.045em',
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
          }}>
            {greeting},{' '}
            <span style={{
              background: 'linear-gradient(135deg, #c4b5fd, #93c5fd, #67e8f9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              backgroundSize: '200% auto',
              animation: 'shimmerText 4s linear infinite',
              display: 'inline-block',
            }}>{user?.username || 'Creator'}</span>
          </h1>
          <p style={{
            fontSize: '1.12rem', color: 'rgba(237,237,242,0.4)',
            maxWidth: '480px', margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Your professional frame extraction workspace awaits.
          </p>
        </div>
      </section>

      {/* ══════════ WORKSPACE CARDS ══════════ */}
      <section ref={cards.ref} style={{
        padding: '20px 24px 80px', position: 'relative', zIndex: 1,
      }}>
        <div className="h3d-workspace-grid" style={{
          maxWidth: '1140px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px',
        }}>
          {workspaceCards.map((card, i) => (
            <div
              key={card.title}
              ref={tilts[i].ref}
              onMouseMove={tilts[i].onMouseMove}
              onMouseLeave={tilts[i].onMouseLeave}
              className="h3d-ws-card"
              onClick={() => navigate(card.path)}
              style={{
                padding: '44px 36px 40px',
                borderRadius: '26px',
                background: 'rgba(255,255,255,0.045)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                transformStyle: 'preserve-3d', position: 'relative', overflow: 'hidden',
                ...reveal(cards.visible, 100 + i * 160),
              }}
            >
              {/* Corner glow */}
              <div style={{
                position: 'absolute', top: '-40px', right: '-40px',
                width: '140px', height: '140px', borderRadius: '50%',
                background: `radial-gradient(circle, ${card.accentColor}30 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              {/* Icon */}
              <div className="h3d-ws-icon" style={{
                width: '64px', height: '64px', borderRadius: '20px',
                background: card.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', marginBottom: '28px',
                boxShadow: `0 8px 28px ${card.shadow}`,
              }}>
                {card.icon}
              </div>

              {/* Title + Arrow */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '12px',
              }}>
                <h3 style={{
                  fontSize: '1.38rem', fontWeight: 700, letterSpacing: '-0.025em',
                }}>{card.title}</h3>
                <div className="h3d-ws-arrow" style={{
                  color: 'rgba(237,237,242,0.35)', opacity: 0.5,
                }}>
                  <Icons.ChevronRight />
                </div>
              </div>

              <p style={{
                fontSize: '0.93rem', lineHeight: 1.7,
                color: 'rgba(237,237,242,0.38)', flex: 1,
              }}>{card.desc}</p>

              {/* Bottom shimmer line */}
              <div style={{
                marginTop: '24px', height: '1.5px', borderRadius: '1px',
                background: `linear-gradient(90deg, transparent, ${card.accentColor}55, transparent)`,
              }} />
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ QUICK ACTIONS ══════════ */}
      <section ref={quick.ref} style={{
        padding: '40px 24px 80px', position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={reveal(quick.visible)}>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 700,
              marginBottom: '36px', letterSpacing: '-0.03em',
            }}>
              Quick Actions
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
          }}>
            {[
              { label: 'Upload Video', icon: <Icons.Cloud size={20} />, path: '/dashboard', gradient: 'linear-gradient(135deg, #7c3aed, #6366f1)', glow: 'rgba(124,58,237,0.25)' },
              { label: 'Browse Gallery', icon: <Icons.Grid size={20} />, path: '/gallery', gradient: 'linear-gradient(135deg, #2563eb, #06b6d4)', glow: 'rgba(37,99,235,0.25)' },
              { label: 'Configure', icon: <Icons.Sliders size={20} />, path: '/setup', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', glow: 'rgba(245,158,11,0.25)' },
              { label: 'Profile', icon: <Icons.Profile size={20} />, path: '/profile', gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)', glow: 'rgba(139,92,246,0.25)' },
            ].map((action, i) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="h3d-btn-glass"
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '18px 22px', borderRadius: '16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#ededf2', cursor: 'pointer',
                  textAlign: 'left', width: '100%',
                  ...reveal(quick.visible, 80 + i * 100),
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '13px',
                  background: action.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', flexShrink: 0,
                  boxShadow: `0 6px 18px ${action.glow}`,
                }}>
                  {action.icon}
                </div>
                <span style={{ fontSize: '0.94rem', fontWeight: 600 }}>{action.label}</span>
                <div style={{ marginLeft: 'auto', color: 'rgba(237,237,242,0.28)' }}>
                  <Icons.ChevronRight />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section ref={stats.ref} style={{
        padding: '60px 24px 120px', position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={reveal(stats.visible)}>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 700,
              marginBottom: '40px', letterSpacing: '-0.03em',
            }}>
              Platform Stats
            </h2>
          </div>

          <div className="h3d-stats-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px',
            background: 'rgba(255,255,255,0.07)', borderRadius: '24px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {[
              { counter: c1, suffix: '+', label: 'Videos Processed', color: '#a78bfa' },
              { counter: c2, suffix: '+', label: 'Frames Extracted', color: '#60a5fa' },
              { counter: c3, suffix: '+', label: 'Active Sessions', color: '#34d399' },
            ].map((s, i) => (
              <div
                key={i}
                ref={s.counter.ref}
                className="h3d-stat"
                style={{
                  textAlign: 'center', padding: '56px 28px',
                  background: '#0d0d1a',
                  transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                  ...reveal(stats.visible, 180 + i * 160),
                }}
              >
                <div style={{
                  fontSize: 'clamp(2.4rem, 4vw, 3.5rem)', fontWeight: 800,
                  letterSpacing: '-0.045em', marginBottom: '10px',
                  background: `linear-gradient(135deg, ${s.color}, #fff)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  {s.counter.count.toLocaleString()}{s.suffix}
                </div>
                <p style={{
                  fontSize: '0.75rem', fontWeight: 700, color: 'rgba(237,237,242,0.3)',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{
        padding: '48px 24px', textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        position: 'relative', zIndex: 1,
      }}>
        <p style={{ fontSize: '0.78rem', color: 'rgba(237,237,242,0.2)', letterSpacing: '0.02em' }}>
          © {new Date().getFullYear()} FrameExtractor Studio — Built with precision.
        </p>
      </footer>
    </div>
  )
}
