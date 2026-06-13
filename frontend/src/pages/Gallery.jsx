import { useState, useEffect } from 'react'
import { imageApi } from '../services/videoApi'
import LoadingSpinner from '../components/common/LoadingSpinner'
import NotificationToast from '../components/common/NotificationToast'
import { formatBytes } from '../utils/formatBytes'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [filterBlurred, setFilterBlurred] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notification, setNotification] = useState({ message: '', type: 'info' })
  const [viewImage, setViewImage] = useState(null)

  useEffect(() => {
    fetchImages()
  }, [page, filterBlurred])

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setViewImage(null)
    }
    if (viewImage) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [viewImage])

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
      if (viewImage?.id === id) setViewImage(null)
      setNotification({ message: 'Frame deleted successfully', type: 'success' })
      setShowNotification(true)
    } catch (err) {
      setNotification({ message: 'Failed to delete frame', type: 'error' })
      setShowNotification(true)
    }
  }

  // Navigate images in modal
  const navigateImage = (direction) => {
    if (!viewImage) return
    const currentIndex = images.findIndex(img => img.id === viewImage.id)
    const nextIndex = currentIndex + direction
    if (nextIndex >= 0 && nextIndex < images.length) {
      setViewImage(images[nextIndex])
    }
  }

  useEffect(() => {
    const handleArrowKeys = (e) => {
      if (!viewImage) return
      if (e.key === 'ArrowLeft') navigateImage(-1)
      if (e.key === 'ArrowRight') navigateImage(1)
    }
    document.addEventListener('keydown', handleArrowKeys)
    return () => document.removeEventListener('keydown', handleArrowKeys)
  }, [viewImage, images])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '70px' }}>
        <LoadingSpinner />
      </div>
    )
  }

  const totalImages = images.length
  const blurredCount = images.filter(img => img.is_blurred).count
  const clearCount = totalImages - (images.filter(img => img.is_blurred).length)

  return (
    <div style={{ paddingTop: '90px', paddingBottom: '3rem', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 2rem',
      }}>
        {/* Title Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem',
          }}>
            Frame Gallery
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.05rem' }}>
            Browse and manage your captured video frames
          </p>
        </div>

        {/* Stats + Filter Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '1rem',
          padding: '1.25rem 1.5rem',
          border: '1px solid rgba(229, 231, 235, 0.6)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        }}>
          {/* Stats */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '700', fontSize: '0.85rem',
              }}>
                {totalImages}
              </div>
              <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: '500' }}>Total Frames</span>
            </div>
            <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: '#10b981',
              }} />
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{clearCount} Clear</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: '#ef4444',
              }} />
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{totalImages - clearCount} Blurred</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: filterBlurred ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f3f4f6',
              color: filterBlurred ? 'white' : '#4b5563',
              padding: '0.5rem 1rem',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600',
              transition: 'all 300ms',
              border: filterBlurred ? 'none' : '1px solid #e5e7eb',
            }}>
              <input
                type="checkbox"
                checked={filterBlurred}
                onChange={(e) => {
                  setFilterBlurred(e.target.checked)
                  setPage(1)
                }}
                style={{ display: 'none' }}
              />
              {filterBlurred ? '✓ ' : ''}Hide Blurred
            </label>
            <button
              onClick={fetchImages}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1.25rem',
                borderRadius: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 300ms',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2, #fff1f2)',
            color: '#dc2626',
            padding: '1rem 1.5rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            border: '1px solid #fecaca',
            fontWeight: '500',
          }}>
            {error}
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '1.5rem',
            border: '2px dashed #d1d5db',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🖼️</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#374151', marginBottom: '0.5rem' }}>
              No frames captured yet
            </h3>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Upload a video on the Dashboard, then use the capture button to save frames
            </p>
          </div>
        ) : (
          /* Image Grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {images.map((image, index) => (
              <div
                key={image.id}
                style={{
                  background: 'white',
                  borderRadius: '1.25rem',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(229, 231, 235, 0.6)',
                  transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  animation: `fadeInUp 0.5s ease ${index * 0.05}s both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(102, 126, 234, 0.2)'
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(229, 231, 235, 0.6)'
                }}
                onClick={() => setViewImage(image)}
              >
                {/* Image Thumbnail */}
                <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                  <img
                    src={image.image_url}
                    alt={`Frame at ${image.timestamp}s`}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      transition: 'transform 500ms',
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22%23e5e7eb%22%3E%3Crect width=%22100%25%22 height=%22100%25%22/%3E%3C/svg%3E'
                    }}
                  />
                  {/* Blurred badge */}
                  {image.is_blurred && (
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                    }}>
                      Blurred
                    </div>
                  )}
                  {/* Resolution badge */}
                  <div style={{
                    position: 'absolute', bottom: '12px', left: '12px',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                    color: 'white',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                  }}>
                    {image.width}×{image.height}
                  </div>
                  {/* Hover overlay with View icon */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(102, 126, 234, 0.4), transparent)',
                    opacity: 0,
                    transition: 'opacity 300ms',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                    className="hover-overlay"
                  >
                    <div style={{
                      width: '50px', height: '50px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.9)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.25rem',
                    }}>
                      👁
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.8rem', fontWeight: '700', color: '#667eea',
                      background: 'rgba(102, 126, 234, 0.08)',
                      padding: '2px 8px', borderRadius: '6px',
                    }}>
                      ⏱ {image.timestamp.toFixed(2)}s
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: '500' }}>
                      {formatBytes(image.file_size)}
                    </span>
                  </div>
                  {image.blur_score != null && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Clarity</span>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: '600',
                          color: image.is_blurred ? '#ef4444' : '#10b981',
                        }}>
                          {((1 - image.blur_score) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div style={{
                        width: '100%', height: '4px', borderRadius: '2px',
                        background: '#f3f4f6', overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${(1 - image.blur_score) * 100}%`,
                          height: '100%', borderRadius: '2px',
                          background: image.is_blurred
                            ? 'linear-gradient(90deg, #ef4444, #f97316)'
                            : 'linear-gradient(90deg, #10b981, #34d399)',
                          transition: 'width 500ms',
                        }} />
                      </div>
                    </div>
                  )}
                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setViewImage(image) }}
                      style={{
                        flex: 1, padding: '0.5rem',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white', border: 'none', borderRadius: '0.6rem',
                        fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                        transition: 'all 300ms',
                        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.target.style.opacity = '1'}
                    >
                      👁 View
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteImage(image.id) }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: '#fef2f2', color: '#dc2626',
                        border: '1px solid #fecaca', borderRadius: '0.6rem',
                        fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                        transition: 'all 300ms',
                      }}
                      onMouseEnter={(e) => { e.target.style.background = '#dc2626'; e.target.style.color = 'white' }}
                      onMouseLeave={(e) => { e.target.style.background = '#fef2f2'; e.target.style.color = '#dc2626' }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {images.length > 0 && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: '0.75rem', marginTop: '3rem',
          }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                background: page === 1 ? '#f9fafb' : 'white',
                color: page === 1 ? '#d1d5db' : '#374151',
                fontWeight: '600', fontSize: '0.85rem',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 300ms',
              }}
            >
              ← Previous
            </button>
            <div style={{
              padding: '0.6rem 1.25rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white', borderRadius: '0.75rem',
              fontWeight: '700', fontSize: '0.85rem',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            }}>
              Page {page}
            </div>
            <button
              onClick={() => setPage(page + 1)}
              disabled={images.length < 20}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                background: images.length < 20 ? '#f9fafb' : 'white',
                color: images.length < 20 ? '#d1d5db' : '#374151',
                fontWeight: '600', fontSize: '0.85rem',
                cursor: images.length < 20 ? 'not-allowed' : 'pointer',
                transition: 'all 300ms',
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

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
              </div>

              {/* Right: Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <a
                  href={viewImage.image_url}
                  download={`frame_${viewImage.timestamp.toFixed(2)}s.png`}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white', padding: '0.65rem 1.5rem',
                    borderRadius: '0.75rem', fontWeight: '700',
                    fontSize: '0.85rem', textDecoration: 'none',
                    transition: 'all 300ms', display: 'flex',
                    alignItems: 'center', gap: '0.4rem',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  ⬇ Download HD
                </a>
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

      {showNotification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          duration={3000}
        />
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
      `}</style>
    </div>
  )
}
