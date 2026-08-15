import React, { useCallback, useState } from 'react'
import { UploadCloud } from 'lucide-react'

export default function UploadZone({ onUpload, uploading, uploadProgress }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files?.length > 0) onUpload(files[0])
  }, [onUpload])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
      e.target.value = ''
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <label
        onDragEnter={handleDragEnter}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          width: '100%',
          maxWidth: '600px',
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          borderRadius: 'var(--radius-xl)',
          border: `2px dashed ${isDragging ? 'var(--accent-cyan)' : 'var(--border-strong)'}`,
          background: isDragging ? 'var(--accent-cyan-dim)' : 'var(--bg-surface-elevated)',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all var(--transition-normal)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseOver={(e) => {
          if (!uploading && !isDragging) {
            e.currentTarget.style.borderColor = 'var(--accent-purple)'
            e.currentTarget.style.background = 'var(--accent-purple-dim)'
          }
        }}
        onMouseOut={(e) => {
          if (!uploading && !isDragging) {
            e.currentTarget.style.borderColor = 'var(--border-strong)'
            e.currentTarget.style.background = 'var(--bg-surface-elevated)'
          }
        }}
      >
        <input type="file" accept="video/*" onChange={handleFileChange} disabled={uploading} style={{ display: 'none' }} />
        
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isDragging ? 'var(--accent-cyan)' : 'var(--text-primary)',
          transition: 'color var(--transition-fast)'
        }}>
          <UploadCloud size={32} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 className="h3" style={{ marginBottom: '8px' }}>
            {uploading ? 'Uploading Video...' : (isDragging ? 'Drop video here' : 'Drop your video here')}
          </h3>
          <p className="body" style={{ color: 'var(--text-muted)' }}>
            {!uploading && (
              <>
                or <span style={{ color: 'var(--accent-cyan)' }}>browse files</span><br />
                MP4 · MOV · AVI · WEBM
              </>
            )}
          </p>
        </div>

        {uploading && (
          <div style={{ width: '100%', maxWidth: '300px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Uploading</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{uploadProgress}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${uploadProgress}%`, height: '100%', 
                background: 'var(--grad-primary)', borderRadius: '99px',
                transition: 'width 0.2s ease',
                boxShadow: 'var(--shadow-glow)'
              }} />
            </div>
          </div>
        )}

        {/* Hover subtle radial gradient */}
        <div style={{
          position: 'absolute', inset: 0, 
          background: 'radial-gradient(circle at center, rgba(139,92,246,0.1) 0%, transparent 70%)',
          opacity: isDragging ? 1 : 0, transition: 'opacity var(--transition-normal)', pointerEvents: 'none'
        }} />
      </label>
    </div>
  )
}
