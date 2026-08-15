import React, { useRef, useState, useEffect } from 'react'

export default function VideoTimeline({ duration = 300, currentTime = 0, frames = [], scenes = [], onSeek }) {
  const timelineRef = useRef(null)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [hoverTime, setHoverTime] = useState(null)
  const [hoverX, setHoverX] = useState(0)

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handlePointerDown = (e) => {
    setIsScrubbing(true)
    handlePointerMove(e)
  }

  const handlePointerMove = (e) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    let x = e.clientX - rect.left
    if (x < 0) x = 0
    if (x > rect.width) x = rect.width
    
    setHoverX(x)
    const time = (x / rect.width) * duration
    setHoverTime(time)

    if (isScrubbing && onSeek) {
      onSeek(time)
    }
  }

  const handlePointerUp = () => {
    setIsScrubbing(false)
  }

  const handlePointerLeave = () => {
    if (!isScrubbing) {
      setHoverTime(null)
    }
  }

  useEffect(() => {
    if (isScrubbing) {
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('pointermove', handlePointerMove)
      return () => {
        window.removeEventListener('pointerup', handlePointerUp)
        window.removeEventListener('pointermove', handlePointerMove)
      }
    }
  }, [isScrubbing, handlePointerMove])

  const progressPercent = (currentTime / duration) * 100

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'monospace' }}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      
      <div 
        ref={timelineRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          position: 'relative',
          height: '40px',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          overflow: 'hidden'
        }}
      >
        {/* Progress Fill */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0,
          width: `${progressPercent}%`,
          background: 'var(--accent-cyan-dim)',
          borderRight: '2px solid var(--accent-cyan)',
          pointerEvents: 'none'
        }} />

        {/* Scene Markers (Subtle grey lines) */}
        {scenes.map((scene, i) => (
          <div key={`scene-${i}`} style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${(scene / duration) * 100}%`,
            width: '1px', background: 'var(--border-strong)',
            pointerEvents: 'none'
          }} />
        ))}

        {/* Frame Markers (Cyan dots) */}
        {frames.map((frame, i) => (
          <div key={`frame-${i}`} style={{
            position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
            left: `${(frame / duration) * 100}%`,
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--accent-cyan)',
            boxShadow: 'var(--shadow-glow)',
            pointerEvents: 'none'
          }} />
        ))}

        {/* Hover Tooltip */}
        {hoverTime !== null && (
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: hoverX, width: '1px', background: 'var(--text-primary)',
            pointerEvents: 'none'
          }}>
            <div style={{
              position: 'absolute', bottom: '100%', left: '50%', transform: 'translate(-50%, -4px)',
              padding: '4px 8px', borderRadius: '4px',
              background: 'var(--text-primary)', color: 'var(--bg-primary)',
              fontSize: '0.7rem', fontWeight: 600, fontFamily: 'monospace',
              whiteSpace: 'nowrap'
            }}>
              {formatTime(hoverTime)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
