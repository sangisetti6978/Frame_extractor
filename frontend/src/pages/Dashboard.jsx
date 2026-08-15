import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { videoApi } from '../services/videoApi'
import { Video, ImageIcon, Activity, Clock, PlayCircle, Plus } from 'lucide-react'

export default function Dashboard() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await videoApi.listVideos()
      setVideos(response.data.results || response.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalFrames = videos.reduce((sum, v) => sum + (v.frames_extracted || 0), 0)
  const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0)

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Hero Section */}
      <div style={{
        position: 'relative',
        padding: '60px 40px',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        marginBottom: '40px'
      }}>
        {/* Subtle radial gradient background */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '100%',
          background: 'radial-gradient(ellipse at top, rgba(34,211,238,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <h1 className="h1" style={{ marginBottom: '16px' }}>
            Turn Videos Into <br />
            <span className="text-gradient">Important Moments</span>
          </h1>
          <p className="body" style={{ fontSize: '1.1rem', marginBottom: '32px', color: 'var(--text-secondary)' }}>
            Let AI automatically detect, analyze, and extract the most meaningful frames from your videos.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/workspace" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: 'var(--radius-md)',
              background: 'var(--text-primary)', color: 'var(--bg-primary)',
              fontWeight: 600, fontSize: '0.95rem',
              transition: 'transform var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <Plus size={18} /> Upload Video
            </Link>
            <Link to="/projects" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem',
              transition: 'background var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}>
              View Projects
            </Link>
          </div>
        </div>

        {/* Video Processing Visualization */}
        <div style={{
          position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', gap: '16px', opacity: 0.6
        }}>
          {['VIDEO', 'AI ANALYSIS', 'SCENE DETECTION', 'KEY FRAME EXTRACTION'].map((text, i) => (
            <div key={text} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{
                padding: '8px 16px', borderRadius: 'var(--radius-full)',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
                fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
                color: i === 3 ? 'var(--accent-cyan)' : 'var(--text-muted)',
                boxShadow: i === 3 ? '0 0 20px rgba(34,211,238,0.2)' : 'none'
              }}>
                {text}
              </div>
              {i < 3 && <div style={{ width: '2px', height: '16px', background: 'var(--border-strong)' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {[
          { label: 'Videos Processed', value: videos.length, icon: Video, color: 'var(--accent-purple)' },
          { label: 'Frames Extracted', value: totalFrames, icon: ImageIcon, color: 'var(--accent-cyan)' },
          { label: 'Scenes Detected', value: Math.floor(totalFrames / 3) || 0, icon: Activity, color: 'var(--success)' },
          { label: 'Total Duration', value: `${(totalDuration / 60).toFixed(1)} min`, icon: Clock, color: 'var(--warning)' }
        ].map((stat, i) => (
          <div key={stat.label} className="glass-panel" style={{ 
            padding: '24px', 
            transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)' 
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)'
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: `color-mix(in srgb, ${stat.color} 15%, transparent)`,
                color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <stat.icon size={18} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {loading ? '-' : stat.value}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
