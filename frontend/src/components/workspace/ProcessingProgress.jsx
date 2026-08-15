import React from 'react'
import { BrainCircuit, CheckCircle2, CircleDashed } from 'lucide-react'

export default function ProcessingProgress({ progress = 0, stage = 0 }) {
  const stages = [
    { label: 'Video uploaded', index: 0 },
    { label: 'Frames analyzed', index: 1 },
    { label: 'Detecting scenes', index: 2 },
    { label: 'Selecting key frames', index: 3 },
    { label: 'Preparing results', index: 4 }
  ]

  return (
    <div style={{
      width: '100%', height: '100%', minHeight: '400px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden'
    }}>
      
      {/* Background Scanning Effect */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, transparent, rgba(34,211,238,0.05), transparent)',
        height: '200%', width: '100%',
        animation: 'slideUp 3s linear infinite',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'var(--accent-cyan-dim)', border: '1px solid var(--accent-cyan)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent-cyan)', marginBottom: '24px',
        boxShadow: 'var(--shadow-glow)', position: 'relative'
      }}>
        <BrainCircuit size={40} className="animate-pulse" />
        {/* Spinner ring */}
        <svg style={{ position: 'absolute', inset: '-10px', width: '100px', height: '100px', animation: 'spin 2s linear infinite' }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="none" stroke="var(--border-strong)" strokeWidth="2" />
          <circle cx="50" cy="50" r="48" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeDasharray="75 300" strokeLinecap="round" />
        </svg>
      </div>

      <h2 className="h2" style={{ marginBottom: '8px' }}>Analyzing Video</h2>
      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '32px', fontFamily: 'monospace' }}>
        {Math.round(progress)}%
      </div>

      <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {stages.map((s, i) => {
          const isCompleted = i < stage
          const isCurrent = i === stage
          return (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: isCompleted || isCurrent ? 1 : 0.4 }}>
              {isCompleted ? (
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
              ) : isCurrent ? (
                <CircleDashed size={18} style={{ color: 'var(--accent-cyan)', animation: 'spin 3s linear infinite' }} />
              ) : (
                <CircleDashed size={18} style={{ color: 'var(--text-muted)' }} />
              )}
              <span style={{ fontSize: '0.9rem', fontWeight: isCurrent ? 600 : 500, color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
      
      <div style={{ marginTop: '32px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <span>{Math.floor(progress * 26.4)} / 2,640 frames analyzed</span>
        <span>Estimated time: {Math.max(1, Math.round((100 - progress) / 10))} seconds</span>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
    </div>
  )
}
