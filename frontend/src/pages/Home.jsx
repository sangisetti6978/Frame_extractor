import { useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

/* ─── Animated Counter Hook ─── */
function useCounter(target, duration = 2000) {
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
            const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
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

/* ─── Scroll Reveal Hook ─── */
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

/* ─── SVG Icon Components ─── */
const Icons = {
  Sparkles: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/>
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4" opacity="0.5"/>
    </svg>
  ),
  Eye: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.062 12.348a1 1 0 010-.696 10.75 10.75 0 0119.876 0 1 1 0 010 .696 10.75 10.75 0 01-19.876 0"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Grid: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Sliders: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
      <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
      <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
    </svg>
  ),
  Cloud: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 110-14 7.1 7.1 0 015.7 2.8A5 5 0 0121 13a4.5 4.5 0 01-3.5 6z"/>
      <path d="M12 13v6M9.5 16.5L12 19l2.5-2.5"/>
    </svg>
  ),
  Zap: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Play: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
}

/* ─── Inline Style Objects ─── */
const styles = {
  /* page */
  page: {
    minHeight: '100vh',
    background: '#06060e',
    color: '#f0f0f5',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    overflowX: 'hidden',
  },

  /* Hero */
  hero: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '120px 24px 80px',
    overflow: 'hidden',
  },
  heroMesh: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120,80,255,0.35) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 50%, rgba(0,200,255,0.2) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 20% 60%, rgba(255,60,170,0.18) 0%, transparent 60%)
    `,
    animation: 'heroMeshMove 12s ease-in-out infinite alternate',
  },
  heroGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)',
    WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    maxWidth: '900px',
    margin: '0 auto',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 18px',
    borderRadius: '999px',
    border: '1px solid rgba(120,80,255,0.4)',
    background: 'rgba(120,80,255,0.12)',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#c4b5fd',
    marginBottom: '32px',
    backdropFilter: 'blur(10px)',
    letterSpacing: '0.5px',
  },
  heroTitle: {
    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
    fontWeight: 800,
    lineHeight: 1.08,
    marginBottom: '24px',
    letterSpacing: '-0.03em',
  },
  heroTitleGradient: {
    background: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 40%, #34d399 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroDesc: {
    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
    lineHeight: 1.7,
    color: 'rgba(240,240,245,0.65)',
    maxWidth: '600px',
    margin: '0 auto 48px',
  },
  heroBtnRow: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  heroGlow: {
    position: 'absolute',
    bottom: '-200px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '400px',
    background: 'radial-gradient(ellipse, rgba(120,80,255,0.2) 0%, transparent 70%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },

  /* Buttons */
  btnGradient: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 32px',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#fff',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: '0 8px 30px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
    textDecoration: 'none',
    position: 'relative',
    overflow: 'hidden',
  },
  btnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 32px',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#c4b5fd',
    background: 'transparent',
    border: '1.5px solid rgba(196,181,253,0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    textDecoration: 'none',
    backdropFilter: 'blur(8px)',
  },
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'rgba(240,240,245,0.7)',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer',
    transition: 'all 0.3s',
    textDecoration: 'none',
  },
  btnPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    borderRadius: '999px',
    fontSize: '0.875rem',
    fontWeight: 700,
    letterSpacing: '0.3px',
    background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(96,165,250,0.15))',
    color: '#6ee7b7',
    border: '1px solid rgba(110,231,183,0.25)',
    cursor: 'pointer',
    transition: 'all 0.3s',
    textDecoration: 'none',
  },
  btnShimmer: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 40px',
    borderRadius: '16px',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#fff',
    background: 'linear-gradient(135deg, #7c3aed, #ec4899, #7c3aed)',
    backgroundSize: '200% 200%',
    animation: 'shimmerBtn 3s ease-in-out infinite',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 10px 40px rgba(236,72,153,0.35)',
    textDecoration: 'none',
  },
  btnWhiteSolid: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 40px',
    borderRadius: '16px',
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#0f0a2a',
    background: '#fff',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 8px 30px rgba(255,255,255,0.15)',
    textDecoration: 'none',
  },

  /* Section */
  section: {
    padding: '120px 24px',
    position: 'relative',
  },
  sectionInner: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    marginBottom: '16px',
    letterSpacing: '-0.02em',
  },
  sectionDesc: {
    fontSize: '1.1rem',
    lineHeight: 1.7,
    color: 'rgba(240,240,245,0.55)',
    maxWidth: '560px',
    marginBottom: '60px',
  },

  /* Feature Bento Grid */
  bentoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: 'minmax(220px, auto)',
    gap: '20px',
  },
  bentoCard: (accent) => ({
    position: 'relative',
    borderRadius: '24px',
    padding: '36px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    backdropFilter: 'blur(12px)',
    transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
    cursor: 'default',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  }),
  bentoCardGlow: (accent) => ({
    position: 'absolute',
    top: '-40px',
    right: '-40px',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: accent,
    filter: 'blur(70px)',
    opacity: 0.25,
    transition: 'opacity 0.4s',
    pointerEvents: 'none',
  }),
  bentoIcon: (accent) => ({
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: accent,
    color: '#fff',
    marginBottom: '20px',
    boxShadow: `0 8px 24px ${accent}55`,
  }),
  bentoTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '8px',
    color: '#fff',
  },
  bentoDesc: {
    fontSize: '0.9rem',
    lineHeight: 1.6,
    color: 'rgba(240,240,245,0.5)',
  },

  /* How it works */
  stepsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    position: 'relative',
  },
  stepCard: {
    textAlign: 'center',
    padding: '40px 24px',
    borderRadius: '24px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    transition: 'all 0.3s',
    position: 'relative',
  },
  stepNumber: {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    color: '#fff',
    margin: '0 auto 20px',
    boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
  },
  stepTitle: {
    fontSize: '1.125rem',
    fontWeight: 700,
    marginBottom: '6px',
    color: '#fff',
  },
  stepDesc: {
    fontSize: '0.875rem',
    color: 'rgba(240,240,245,0.5)',
    lineHeight: 1.5,
  },

  /* Stats */
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  statCard: {
    textAlign: 'center',
    padding: '48px 24px',
    borderRadius: '24px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    transition: 'all 0.3s',
  },
  statNumber: {
    fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
    fontWeight: 800,
    letterSpacing: '-0.03em',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '0.95rem',
    fontWeight: 500,
    color: 'rgba(240,240,245,0.5)',
  },

  /* Marquee / Trust Bar */
  marqueeOuter: {
    padding: '40px 0',
    overflow: 'hidden',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  marqueeInner: {
    display: 'flex',
    gap: '60px',
    animation: 'marquee 25s linear infinite',
    whiteSpace: 'nowrap',
  },
  marqueeItem: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'rgba(240,240,245,0.3)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  /* CTA */
  cta: {
    position: 'relative',
    padding: '120px 24px',
    textAlign: 'center',
    overflow: 'hidden',
  },
  ctaBg: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.25) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 30% 60%, rgba(236,72,153,0.15) 0%, transparent 60%)
    `,
    filter: 'blur(30px)',
    pointerEvents: 'none',
  },
  ctaTitle: {
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    marginBottom: '20px',
    letterSpacing: '-0.02em',
    position: 'relative',
    zIndex: 2,
  },
  ctaDesc: {
    fontSize: '1.15rem',
    lineHeight: 1.7,
    color: 'rgba(240,240,245,0.55)',
    maxWidth: '560px',
    margin: '0 auto 48px',
    position: 'relative',
    zIndex: 2,
  },

  /* Footer */
  footer: {
    padding: '40px 24px',
    textAlign: 'center',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  footerText: {
    fontSize: '0.8rem',
    color: 'rgba(240,240,245,0.3)',
  },

  /* Reveal wrappers */
  reveal: (visible, delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(40px)',
    transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  }),
}

/* ─── Keyframe injection (once) ─── */
const styleSheet = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

@keyframes heroMeshMove {
  0%   { transform: scale(1) translate(0,0); }
  100% { transform: scale(1.15) translate(-3%,5%); }
}
@keyframes shimmerBtn {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes floatOrb {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.home-bento-card:hover {
  transform: translateY(-6px) !important;
  border-color: rgba(255,255,255,0.12) !important;
  background: rgba(255,255,255,0.06) !important;
}
.home-bento-card:hover .bento-glow {
  opacity: 0.45 !important;
}

.home-step-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
}

.home-stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(124,58,237,0.3);
  background: rgba(124,58,237,0.06);
}

.home-btn-gradient:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(124,58,237,0.55), inset 0 1px 0 rgba(255,255,255,0.2) !important;
}

.home-btn-outline:hover {
  background: rgba(196,181,253,0.08) !important;
  border-color: rgba(196,181,253,0.5) !important;
  transform: translateY(-2px);
}

.home-btn-ghost:hover {
  background: rgba(255,255,255,0.08) !important;
  color: #fff !important;
}

.home-btn-pill:hover {
  background: rgba(52,211,153,0.2) !important;
  border-color: rgba(110,231,183,0.4) !important;
  transform: translateY(-2px);
}

.home-btn-shimmer:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 50px rgba(236,72,153,0.5) !important;
}

.home-btn-white:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(255,255,255,0.25) !important;
}

@media (max-width: 900px) {
  .home-bento-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  .home-bento-span2 {
    grid-column: span 1 !important;
  }
  .home-steps-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  .home-stats-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}
@media (max-width: 600px) {
  .home-bento-grid,
  .home-steps-grid,
  .home-stats-grid {
    grid-template-columns: 1fr !important;
  }
}
`

export default function Home() {
  const { isAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()

  /* Inject keyframes */
  useEffect(() => {
    const id = 'home-page-styles'
    if (!document.getElementById(id)) {
      const el = document.createElement('style')
      el.id = id
      el.textContent = styleSheet
      document.head.appendChild(el)
    }
  }, [])

  /* Scroll reveals */
  const feat = useReveal()
  const steps = useReveal()
  const stats = useReveal()
  const cta = useReveal()

  /* Animated counters */
  const c1 = useCounter(10000)
  const c2 = useCounter(50000)
  const c3 = useCounter(5000)

  const features = [
    {
      icon: <Icons.Sparkles />,
      title: 'Auto-Capture',
      desc: 'Automatically capture frames when you pause — zero clicks, pure workflow.',
      accent: 'rgba(124,58,237,0.8)',
      span: false,
    },
    {
      icon: <Icons.Eye />,
      title: 'Blur Detection',
      desc: 'Intelligent blur detection using OpenCV + ML rejects bad frames instantly.',
      accent: 'rgba(96,165,250,0.8)',
      span: true,
    },
    {
      icon: <Icons.Grid />,
      title: 'Gallery Management',
      desc: 'Organize, tag, and export your extracted frames with ease.',
      accent: 'rgba(236,72,153,0.8)',
      span: true,
    },
    {
      icon: <Icons.Sliders />,
      title: 'Customization',
      desc: 'Output format, quality, and detection thresholds — all configurable.',
      accent: 'rgba(251,191,36,0.8)',
      span: false,
    },
    {
      icon: <Icons.Cloud />,
      title: 'Cloud Backup',
      desc: 'Save frames to MongoDB for secure, always-accessible storage.',
      accent: 'rgba(52,211,153,0.8)',
      span: false,
    },
    {
      icon: <Icons.Zap />,
      title: 'Fast Processing',
      desc: 'Optimized FFmpeg + OpenCV pipeline for near-realtime extraction.',
      accent: 'rgba(239,68,68,0.8)',
      span: false,
    },
  ]

  const howItWorks = [
    { num: '01', title: 'Register', desc: 'Create your free account in seconds' },
    { num: '02', title: 'Configure', desc: 'Set formats, quality & detection' },
    { num: '03', title: 'Upload', desc: 'Drag or drop your video file' },
    { num: '04', title: 'Extract', desc: 'Capture & manage your frames' },
  ]

  const marqueeItems = [
    'FFmpeg Powered', 'OpenCV ML', 'HD Extraction', 'Blur Detection',
    'Cloud Storage', 'Multi-Format', 'Auto-Capture', 'Batch Processing',
  ]

  return (
    <div style={styles.page}>
      {/* ══════════ HERO ══════════ */}
      <section style={styles.hero}>
        <div style={styles.heroMesh} />
        <div style={styles.heroGrid} />

        <div style={styles.heroContent}>
          {/* Badge */}
          <div style={styles.heroBadge}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'floatOrb 2s ease-in-out infinite' }} />
            Now with AI-Powered Blur Detection
          </div>

          {/* Title */}
          <h1 style={styles.heroTitle}>
            Extract Perfect Frames{' '}
            <span style={styles.heroTitleGradient}>from Any Video</span>
          </h1>

          {/* Description */}
          <p style={styles.heroDesc}>
            Professional-grade frame extraction with intelligent blur detection,
            auto-capture on pause, and cloud-backed gallery management.
          </p>

          {/* Button Row — showcases different button types */}
          {isAuthenticated ? (
            <div style={styles.heroBtnRow}>
              <button
                onClick={() => navigate('/dashboard')}
                className="home-btn-gradient"
                style={styles.btnGradient}
              >
                Go to Dashboard <Icons.ArrowRight />
              </button>
              <button
                onClick={() => navigate('/gallery')}
                className="home-btn-outline"
                style={styles.btnOutline}
              >
                <Icons.Grid /> View Gallery
              </button>
            </div>
          ) : (
            <div style={styles.heroBtnRow}>
              <Link to="/register" className="home-btn-gradient" style={styles.btnGradient}>
                Get Started Free <Icons.ArrowRight />
              </Link>
              <Link to="/login" className="home-btn-outline" style={styles.btnOutline}>
                <Icons.Play /> Sign In
              </Link>
              <Link to="/register" className="home-btn-ghost" style={styles.btnGhost}>
                Learn More <Icons.ChevronRight />
              </Link>
            </div>
          )}
        </div>

        <div style={styles.heroGlow} />
      </section>

      {/* ══════════ MARQUEE TRUST BAR ══════════ */}
      <div style={styles.marqueeOuter}>
        <div style={styles.marqueeInner} className="home-marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} style={styles.marqueeItem}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(124,58,237,0.6)', display: 'inline-block' }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════ FEATURES — BENTO GRID ══════════ */}
      <section style={styles.section} ref={feat.ref}>
        <div style={styles.sectionInner}>
          <div style={styles.reveal(feat.visible)}>
            <div style={{ ...styles.sectionLabel, background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.25)' }}>
              <Icons.Sparkles /> Features
            </div>
            <h2 style={styles.sectionTitle}>
              Everything you need,{' '}
              <span style={styles.heroTitleGradient}>nothing you don't</span>
            </h2>
            <p style={styles.sectionDesc}>
              A complete toolkit for professional video frame extraction — from intelligent detection to cloud management.
            </p>
          </div>

          <div style={styles.bentoGrid} className="home-bento-grid">
            {features.map((f, i) => (
              <div
                key={i}
                className={`home-bento-card ${f.span ? 'home-bento-span2' : ''}`}
                style={{
                  ...styles.bentoCard(f.accent),
                  gridColumn: f.span ? 'span 2' : 'span 1',
                  ...styles.reveal(feat.visible, 100 + i * 80),
                }}
              >
                <div className="bento-glow" style={styles.bentoCardGlow(f.accent)} />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={styles.bentoIcon(f.accent)}>{f.icon}</div>
                  <h3 style={styles.bentoTitle}>{f.title}</h3>
                  <p style={styles.bentoDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section style={{ ...styles.section, background: 'rgba(255,255,255,0.01)' }} ref={steps.ref}>
        <div style={styles.sectionInner}>
          <div style={styles.reveal(steps.visible)}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...styles.sectionLabel, background: 'rgba(52,211,153,0.12)', color: '#6ee7b7', border: '1px solid rgba(52,211,153,0.25)', margin: '0 auto 20px' }}>
                How It Works
              </div>
              <h2 style={{ ...styles.sectionTitle, textAlign: 'center' }}>
                From video to frames in{' '}
                <span style={{ ...styles.heroTitleGradient, background: 'linear-gradient(135deg, #6ee7b7, #60a5fa)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>4 easy steps</span>
              </h2>
              <p style={{ ...styles.sectionDesc, textAlign: 'center', margin: '0 auto 60px' }}>
                No complicated setup. No learning curve. Just upload and extract.
              </p>
            </div>
          </div>

          <div style={styles.stepsRow} className="home-steps-grid">
            {howItWorks.map((s, i) => (
              <div
                key={i}
                className="home-step-card"
                style={{
                  ...styles.stepCard,
                  ...styles.reveal(steps.visible, 150 + i * 100),
                }}
              >
                <div style={styles.stepNumber}>{s.num}</div>
                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Button showcase: Pill button */}
          <div style={{ textAlign: 'center', marginTop: '48px', ...styles.reveal(steps.visible, 600) }}>
            {isAuthenticated ? (
              <button onClick={() => navigate('/setup')} className="home-btn-pill" style={styles.btnPill}>
                <Icons.Check /> Configure Settings
              </button>
            ) : (
              <Link to="/register" className="home-btn-pill" style={styles.btnPill}>
                <Icons.Check /> Start for Free — No Credit Card
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section style={styles.section} ref={stats.ref}>
        <div style={styles.sectionInner}>
          <div style={{ textAlign: 'center', ...styles.reveal(stats.visible) }}>
            <div style={{ ...styles.sectionLabel, background: 'rgba(96,165,250,0.12)', color: '#93c5fd', border: '1px solid rgba(96,165,250,0.25)', margin: '0 auto 20px' }}>
              Trusted Platform
            </div>
            <h2 style={{ ...styles.sectionTitle, textAlign: 'center' }}>
              Numbers that{' '}
              <span style={{ ...styles.heroTitleGradient, background: 'linear-gradient(135deg, #93c5fd, #c4b5fd)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>speak for themselves</span>
            </h2>
          </div>

          <div style={{ ...styles.statsGrid, marginTop: '60px' }} className="home-stats-grid">
            {[
              { counter: c1, suffix: '+', label: 'Videos Processed', gradient: 'linear-gradient(135deg, #a78bfa, #60a5fa)' },
              { counter: c2, suffix: '+', label: 'Frames Extracted', gradient: 'linear-gradient(135deg, #f472b6, #c084fc)' },
              { counter: c3, suffix: '+', label: 'Active Users', gradient: 'linear-gradient(135deg, #6ee7b7, #60a5fa)' },
            ].map((s, i) => (
              <div
                key={i}
                className="home-stat-card"
                ref={s.counter.ref}
                style={{
                  ...styles.statCard,
                  ...styles.reveal(stats.visible, 200 + i * 120),
                }}
              >
                <div style={{ ...styles.statNumber, background: s.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {s.counter.count.toLocaleString()}{s.suffix}
                </div>
                <p style={styles.statLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section style={styles.cta} ref={cta.ref}>
        <div style={styles.ctaBg} />

        <div style={styles.reveal(cta.visible)}>
          <h2 style={styles.ctaTitle}>
            Ready to extract{' '}
            <span style={styles.heroTitleGradient}>perfect frames?</span>
          </h2>
          <p style={styles.ctaDesc}>
            Join thousands of creators and professionals who trust FrameExtractor for their video processing workflows.
          </p>

          {/* Button showcase: Shimmer + White Solid */}
          {!isAuthenticated ? (
            <div style={{ ...styles.heroBtnRow, position: 'relative', zIndex: 2 }}>
              <Link to="/register" className="home-btn-shimmer" style={styles.btnShimmer}>
                Create Free Account <Icons.ArrowRight />
              </Link>
              <Link to="/login" className="home-btn-white" style={styles.btnWhiteSolid}>
                Sign In
              </Link>
            </div>
          ) : (
            <div style={{ position: 'relative', zIndex: 2 }}>
              <button onClick={() => navigate('/dashboard')} className="home-btn-shimmer" style={styles.btnShimmer}>
                Open Dashboard <Icons.ArrowRight />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © {new Date().getFullYear()} FrameExtractor — Built with FFmpeg, OpenCV & React
        </p>
      </footer>
    </div>
  )
}
