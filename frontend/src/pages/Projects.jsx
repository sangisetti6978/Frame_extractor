import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { videoApi } from '../services/videoApi'
import { Folder, MoreVertical, Play, Clock, Video } from 'lucide-react'

export default function Projects() {
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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 className="h1" style={{ marginBottom: '8px' }}>Your Projects</h1>
          <p className="body" style={{ margin: 0 }}>Manage your uploaded videos and processing sessions.</p>
        </div>
        <Link to="/workspace" style={{
          padding: '10px 20px', borderRadius: 'var(--radius-md)',
          background: 'var(--text-primary)', color: 'var(--bg-primary)',
          fontWeight: 600, fontSize: '0.9rem', display: 'inline-block',
          textDecoration: 'none'
        }}>
          New Project
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--border-strong)', borderTopColor: 'var(--accent-cyan)', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      ) : videos.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <Folder size={48} style={{ color: 'var(--border-strong)', margin: '0 auto 16px' }} />
          <h3 className="h3" style={{ marginBottom: '8px' }}>No projects yet</h3>
          <p className="body" style={{ marginBottom: '24px' }}>Upload a video to start your first processing project.</p>
          <Link to="/workspace" style={{
            padding: '10px 20px', borderRadius: 'var(--radius-md)',
            background: 'var(--accent-cyan)', color: 'var(--bg-primary)',
            fontWeight: 600, fontSize: '0.9rem', display: 'inline-block', textDecoration: 'none'
          }}>
            Upload Video
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {videos.map(video => (
            <div key={video.id} className="glass-panel" style={{ 
              overflow: 'hidden', transition: 'transform var(--transition-normal)',
              cursor: 'pointer'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              
              {/* Thumbnail Area */}
              <div style={{ position: 'relative', aspectRatio: '16/9', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Video size={48} style={{ color: 'var(--border-strong)' }} />
                
                {/* Overlay Play */}
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0, transition: 'opacity var(--transition-fast)'
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '1'}
                onMouseOut={e => e.currentTarget.style.opacity = '0'}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-cyan)', color: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Play size={24} style={{ marginLeft: '4px' }} />
                  </div>
                </div>

                {/* Duration Badge */}
                <div style={{
                  position: 'absolute', bottom: '12px', right: '12px',
                  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                  padding: '2px 6px', borderRadius: '4px', color: '#fff',
                  fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace'
                }}>
                  {formatTime(video.duration || 0)}
                </div>
              </div>

              {/* Info Area */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 className="h3" style={{ fontSize: '1.1rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, paddingRight: '12px' }}>
                    {video.video_name || 'Untitled Video'}
                  </h3>
                  <button style={{ color: 'var(--text-muted)' }}><MoreVertical size={16} /></button>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> {new Date(video.uploaded_at).toLocaleDateString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: video.frames_extracted ? 'var(--success)' : 'var(--warning)' }} />
                    {video.frames_extracted ? `${video.frames_extracted} frames` : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
