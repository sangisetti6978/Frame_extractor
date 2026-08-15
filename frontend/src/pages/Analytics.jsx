import React, { useState, useEffect } from 'react'
import { videoApi } from '../services/videoApi'
import { BarChart3, TrendingUp, ImageIcon, Activity } from 'lucide-react'
import OnboardingStepTracker from '../components/common/OnboardingStepTracker'

export default function Analytics() {
  const [stats, setStats] = useState({ totalVideos: 0, totalFrames: 0, duration: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await videoApi.listVideos()
      const data = response.data.results || response.data || []
      
      let frames = 0
      let duration = 0
      data.forEach(v => {
        frames += (v.frames_extracted || 0)
        duration += (v.duration || 0)
      })

      setStats({
        totalVideos: data.length,
        totalFrames: frames,
        duration: duration
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Dummy data for charts
  const monthlyData = [
    { label: 'Jan', value: 45 },
    { label: 'Feb', value: 52 },
    { label: 'Mar', value: 38 },
    { label: 'Apr', value: 65 },
    { label: 'May', value: 85 },
    { label: 'Jun', value: Math.max(10, stats.totalVideos * 5) } // Make last month somewhat dynamic based on stats
  ]

  const maxVal = Math.max(...monthlyData.map(d => d.value))

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <OnboardingStepTracker step={4} />
      <div style={{ marginBottom: '32px' }}>
        <h1 className="h1" style={{ marginBottom: '8px' }}>Analytics & Usage</h1>
        <p className="body" style={{ margin: 0 }}>Track your extraction volume and AI processing trends.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* KPI Card 1 */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-cyan-dim)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon size={20} />
            </div>
            <div style={{ padding: '4px 8px', borderRadius: '999px', background: 'var(--success-dim)', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={12} /> +12%
            </div>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Frames Extracted</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            {loading ? '-' : stats.totalFrames.toLocaleString()}
          </div>
        </div>

        {/* KPI Card 2 */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} />
            </div>
            <div style={{ padding: '4px 8px', borderRadius: '999px', background: 'var(--success-dim)', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={12} /> +5%
            </div>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>AI Computations (mins)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            {loading ? '-' : (stats.duration / 60).toFixed(1)}
          </div>
        </div>

        {/* KPI Card 3 */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--warning-dim)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={20} />
            </div>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Storage Saved (GB)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            {loading ? '-' : ((stats.totalFrames * 2.5) / 1024).toFixed(2)}
          </div>
        </div>

      </div>

      {/* Chart Section */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 className="h3" style={{ marginBottom: '32px' }}>Extraction Volume (Last 6 Months)</h3>
        
        <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '24px', paddingTop: '24px' }}>
          {monthlyData.map((d, i) => {
            const heightPercent = (d.value / maxVal) * 100
            const isLast = i === monthlyData.length - 1
            return (
              <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', height: '100%' }}>
                <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{ 
                    width: '60%', 
                    height: `${heightPercent}%`, 
                    background: isLast ? 'var(--accent-cyan)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${isLast ? 'var(--accent-cyan)' : 'var(--border-strong)'}`,
                    borderRadius: '8px 8px 0 0',
                    transition: 'all var(--transition-normal)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = isLast ? 'var(--accent-cyan)' : 'var(--border-strong)'
                    e.currentTarget.style.transform = 'scaleY(1.02)'
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = isLast ? 'var(--accent-cyan)' : 'var(--bg-surface-elevated)'
                    e.currentTarget.style.transform = 'scaleY(1)'
                  }}>
                    {/* Tooltip value */}
                    <div style={{
                      position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)',
                      fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)',
                      background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '4px',
                      border: '1px solid var(--border-subtle)', opacity: 0, transition: 'opacity 0.2s',
                      pointerEvents: 'none',
                      className: 'chart-tooltip'
                    }}>
                      {d.value}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isLast ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {d.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      <style>{`
        .glass-panel:hover .chart-tooltip { opacity: 1 !important; } /* Simplistic hover effect */
      `}</style>
    </div>
  )
}
