import { useState, useEffect, useContext } from 'react'
import { imageApi } from '../services/videoApi'
import { ConfigContext } from '../context/ConfigContext'
import { Check, Download, Trash2, Maximize2, Filter, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react'
import OnboardingStepTracker from '../components/common/OnboardingStepTracker'

export default function Gallery() {
  const { config } = useContext(ConfigContext)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [filterBlurred, setFilterBlurred] = useState(false)
  const [viewImage, setViewImage] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchImages()
  }, [page, filterBlurred])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && viewImage) setViewImage(null)
      if (viewImage) {
        if (e.key === 'ArrowLeft') navigateImage(-1)
        if (e.key === 'ArrowRight') navigateImage(1)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [viewImage, images])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await imageApi.listImages(page)
      let imagesList = response.data.results || response.data
      if (filterBlurred) {
        imagesList = imagesList.filter(img => !img.is_blurred)
      }
      setImages(imagesList)
      setError('')
    } catch (err) {
      setError('Failed to load images')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteImage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this frame?')) return
    try {
      await imageApi.deleteImage(id)
      setImages(images.filter(img => img.id !== id))
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n })
      if (viewImage?.id === id) setViewImage(null)
    } catch (err) {
      console.error(err)
    }
  }

  const navigateImage = (direction) => {
    if (!viewImage) return
    const currentIndex = images.findIndex(img => img.id === viewImage.id)
    const nextIndex = currentIndex + direction
    if (nextIndex >= 0 && nextIndex < images.length) {
      setViewImage(images[nextIndex])
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => setSelectedIds(new Set(images.map(img => img.id)))
  const deselectAll = () => setSelectedIds(new Set())

  const handleExport = async (ids) => {
    setExporting(true)
    try {
      const response = await imageApi.exportToFolder(ids)
      const { exported, folder_path } = response.data
      if (exported > 0) {
        setImages(prev => prev.map(img =>
          ids.includes(img.id) ? { ...img, is_exported: true } : img
        ))
        if (viewImage && ids.includes(viewImage.id)) {
          setViewImage(prev => ({ ...prev, is_exported: true }))
        }
        setSelectedIds(new Set())
        alert(`✅ ${exported} frame(s) saved to:\n${folder_path}`)
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Export failed'
      alert(`❌ ${msg}`)
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const totalImages = images.length
  const clearCount = totalImages - (images.filter(img => img.is_blurred).length)
  const selectedCount = selectedIds.size

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--border-strong)', borderTopColor: 'var(--accent-cyan)', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <OnboardingStepTracker step={3} />
      {/* Header & Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', gap: '16px' }}>
        <div>
          <h1 className="h1" style={{ marginBottom: '8px' }}>Extracted Frames</h1>
          <p className="body" style={{ margin: 0 }}>
            {totalImages} key moments detected by AI ({clearCount} clear)
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
            <button
              onClick={() => { setFilterBlurred(!filterBlurred); setPage(1) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', fontSize: '0.85rem', fontWeight: 600,
                borderRadius: 'var(--radius-sm)',
                background: filterBlurred ? 'var(--bg-surface-elevated)' : 'transparent',
                color: filterBlurred ? 'var(--text-primary)' : 'var(--text-muted)'
              }}
            >
              <Filter size={14} /> Clear Only
            </button>
            <button
              onClick={fetchImages}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', fontSize: '0.85rem', fontWeight: 600,
                borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)'
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Toolbar when items are selected */}
      {selectedCount > 0 && (
        <div className="animate-slide-up" style={{
          position: 'sticky', top: '16px', zIndex: 30,
          background: 'rgba(34, 211, 238, 0.1)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--accent-cyan)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 20px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-cyan)', fontWeight: 600 }}>
            <Check size={18} /> {selectedCount} frames selected
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={selectedCount === totalImages ? deselectAll : selectAll} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {selectedCount === totalImages ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={() => handleExport(Array.from(selectedIds))}
              disabled={exporting}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-cyan)', color: 'var(--bg-primary)',
                fontWeight: 600, fontSize: '0.85rem'
              }}
            >
              <Download size={14} /> Export Selected
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {images.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p className="body">No frames found. Process a video to start extracting.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px'
        }}>
          {images.map((image) => {
            const isSelected = selectedIds.has(image.id)
            return (
              <div key={image.id} className="glass-panel" style={{
                overflow: 'hidden', cursor: 'pointer', transition: 'all var(--transition-normal)',
                borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                boxShadow: isSelected ? '0 0 0 1px var(--accent-cyan), var(--shadow-sm)' : 'var(--shadow-sm)'
              }}
              onClick={() => toggleSelect(image.id)}
              onMouseOver={e => !isSelected && (e.currentTarget.style.borderColor = 'var(--border-strong)')}
              onMouseOut={e => !isSelected && (e.currentTarget.style.borderColor = 'var(--border-subtle)')}>
                
                <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000' }}>
                  <img src={image.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Frame" />
                  
                  {/* Select indicator */}
                  <div style={{
                    position: 'absolute', top: '12px', left: '12px',
                    width: '24px', height: '24px', borderRadius: '6px',
                    background: isSelected ? 'var(--accent-cyan)' : 'rgba(0,0,0,0.5)',
                    border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--bg-primary)'
                  }}>
                    {isSelected && <Check size={14} />}
                  </div>

                  {/* Badges */}
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {image.is_blurred && (
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--danger)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Blurred</span>
                    )}
                    {image.is_exported && (
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--success)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Saved</span>
                    )}
                  </div>
                  
                  {/* Hover action overlay */}
                  <div className="hover-actions" onClick={e => { e.stopPropagation(); setViewImage(image) }} style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity var(--transition-fast)'
                  }}>
                    <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', borderRadius: 'var(--radius-full)', color: '#fff', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Maximize2 size={14} /> Preview
                    </div>
                  </div>
                </div>

                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {image.timestamp.toFixed(2)}s
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatBytes(image.file_size)}
                    </div>
                  </div>
                  {image.blur_score != null && (() => {
                    const clarity = Math.round(image.blur_score * 100)
                    const blur = 100 - clarity
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600, width: '52px' }}>Clarity</span>
                          <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--bg-surface)', overflow: 'hidden' }}>
                            <div style={{ width: `${clarity}%`, height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #10b981, #34d399)', transition: 'width 0.4s ease' }} />
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700, width: '32px', textAlign: 'right' }}>{clarity}%</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.7rem', color: image.is_blurred ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 600, width: '52px' }}>Blur</span>
                          <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--bg-surface)', overflow: 'hidden' }}>
                            <div style={{ width: `${blur}%`, height: '100%', borderRadius: '3px', background: image.is_blurred ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #6b7280, #9ca3af)', transition: 'width 0.4s ease' }} />
                          </div>
                          <span style={{ fontSize: '0.7rem', color: image.is_blurred ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 700, width: '32px', textAlign: 'right' }}>{blur}%</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ===== Full-Screen Image Preview Modal ===== */}
      {viewImage && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setViewImage(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setViewImage(null)}
            style={{
              position: 'absolute', top: '1.5rem', right: '1.5rem',
              width: '44px', height: '44px', borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white', fontSize: '1.25rem',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'all 300ms',
              zIndex: 110,
            }}
            onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.2)'; e.target.style.transform = 'scale(1.1)' }}
            onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.transform = 'scale(1)' }}
          >
            ✕
          </button>

          {/* Navigation Arrows */}
          {images.findIndex(img => img.id === viewImage.id) > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); navigateImage(-1) }}
              style={{
                position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)',
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white', fontSize: '1.5rem',
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 300ms', zIndex: 110,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              ‹
            </button>
          )}
          {images.findIndex(img => img.id === viewImage.id) < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); navigateImage(1) }}
              style={{
                position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)',
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white', fontSize: '1.5rem',
                cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 300ms', zIndex: 110,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              ›
            </button>
          )}

          {/* Modal Content */}
          <div
            style={{
              maxWidth: '1100px', width: '95%', maxHeight: '92vh',
              display: 'flex', flexDirection: 'column',
              animation: 'scaleIn 0.25s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <img
                src={viewImage.image_url}
                alt={`Frame at ${viewImage.timestamp}s`}
                style={{
                  maxWidth: '100%', maxHeight: '72vh',
                  objectFit: 'contain', borderRadius: '1rem',
                  boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
                }}
              />
            </div>

            {/* Bottom Info Bar */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '1rem',
              padding: '1.25rem 1.75rem',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '1rem',
            }}>
              {/* Left: Info */}
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Source</div>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>{viewImage.source_video}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Timestamp</div>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>{viewImage.timestamp.toFixed(2)}s</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Resolution</div>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>{viewImage.width}×{viewImage.height}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Size</div>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>{formatBytes(viewImage.file_size)}</div>
                </div>
                {viewImage.is_blurred && (
                  <span style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white', padding: '4px 12px', borderRadius: '8px',
                    fontSize: '0.75rem', fontWeight: '700',
                  }}>
                    BLURRED
                  </span>
                )}
                {viewImage.is_exported && (
                  <span style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white', padding: '4px 12px', borderRadius: '8px',
                    fontSize: '0.75rem', fontWeight: '700',
                  }}>
                    ✓ SAVED TO PC
                  </span>
                )}
              </div>

              {/* Right: Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => handleExport([viewImage.id])}
                  disabled={exporting || viewImage.is_exported}
                  style={{
                    background: viewImage.is_exported
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'linear-gradient(135deg, #10b981, #059669)',
                    color: viewImage.is_exported ? '#6ee7b7' : 'white',
                    padding: '0.65rem 1.5rem',
                    borderRadius: '0.75rem', fontWeight: '700',
                    fontSize: '0.85rem',
                    border: viewImage.is_exported ? '1px solid rgba(16,185,129,0.3)' : 'none',
                    transition: 'all 300ms', display: 'flex',
                    alignItems: 'center', gap: '0.4rem',
                    boxShadow: viewImage.is_exported ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)',
                    cursor: (exporting || viewImage.is_exported) ? 'default' : 'pointer',
                  }}
                  onMouseEnter={(e) => { if (!viewImage.is_exported) e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {viewImage.is_exported ? '✓ Saved to PC' : exporting ? '⏳ Saving...' : '💾 Save to PC'}
                </button>
                <button
                  onClick={() => handleDeleteImage(viewImage.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#fca5a5', padding: '0.65rem 1.25rem',
                    borderRadius: '0.75rem', fontWeight: '600',
                    fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.3)',
                    cursor: 'pointer', transition: 'all 300ms',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                  }}
                  onMouseEnter={(e) => { e.target.style.background = '#dc2626'; e.target.style.color = 'white' }}
                  onMouseLeave={(e) => { e.target.style.background = 'rgba(239,68,68,0.15)'; e.target.style.color = '#fca5a5' }}
                >
                  🗑 Delete
                </button>
              </div>
            </div>

            {/* Image counter */}
            <div style={{
              textAlign: 'center', marginTop: '0.75rem',
              color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem',
            }}>
              {images.findIndex(img => img.id === viewImage.id) + 1} of {images.length} • Use ← → arrow keys to navigate
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
