import React, { useState, useEffect } from 'react'
import { videoApi } from '../services/videoApi'
import { CheckCircle2, AlertCircle, Clock, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function History() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await videoApi.listVideos()
      const data = response.data.results || response.data || []
      setLogs(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="h1" style={{ marginBottom: '8px' }}>Processing History</h1>
        <p className="body" style={{ margin: 0 }}>Log of all videos analyzed and frames extracted.</p>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-hover)', borderBottom: '1px solid var(--border-strong)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Video Name</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Date</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Duration</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Frames Extracted</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--border-strong)', borderTopColor: 'var(--accent-cyan)', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No processing history found.
                  </td>
                </tr>
              ) : logs.map((log, i) => (
                <tr key={log.id} style={{ 
                  borderBottom: i === logs.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                  transition: 'background var(--transition-fast)'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-surface-elevated)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', borderRadius: '4px', background: log.frames_extracted ? 'var(--success-dim)' : 'var(--warning-dim)', color: log.frames_extracted ? 'var(--success)' : 'var(--warning)', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content' }}>
                      {log.frames_extracted ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      {log.frames_extracted ? 'COMPLETED' : 'PENDING'}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {log.video_name || 'Untitled Video'}
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} /> {new Date(log.uploaded_at).toLocaleString()}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                    {formatTime(log.duration || 0)}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    {log.frames_extracted || 0}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Link to="/gallery" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, padding: '6px 12px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', transition: 'all var(--transition-fast)' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}>
                      View <ExternalLink size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
