import { useRef, useState, useEffect, useContext, useCallback } from 'react'
import { ConfigContext } from '../../context/ConfigContext'
import api, { BACKEND_URL } from '../../services/api'
import { Camera, CheckCircle2, Video, AlertTriangle } from 'lucide-react'

// Formats the browser can play natively without transcoding
const NATIVE_EXTENSIONS = new Set(['.mp4', '.webm', '.ogg', '.ogv'])

// How often to poll the backend for a completed transcode (ms)
const TRANSCODE_POLL_INTERVAL = 3000

function getExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx >= 0 ? filename.substring(idx).toLowerCase() : ''
}

/**
 * Resolve the playable URL for a video object.
 * Returns { url, needsTranscoding } where needsTranscoding=true means
 * the backend must FFmpeg-transcode the file first.
 */
function resolveVideoUrl(video) {
  if (!video) return { url: null, needsTranscoding: false }

  const ext = getExtension(video.video_name || '')
  const isNative = NATIVE_EXTENSIONS.has(ext)

  // Backend already provided a ready-to-play URL (transcoded or native)
  if (video.stream_url) {
    const url = video.stream_url.startsWith('http')
      ? video.stream_url
      : `${BACKEND_URL}${video.stream_url}`
    return { url, needsTranscoding: false }
  }

  if (isNative) {
    // Serve the original file directly
    const url = video.video_url || `${BACKEND_URL}/media/${video.video_path}`
    return { url, needsTranscoding: false }
  }

  // Non-native format — needs backend transcoding
  // The stream endpoint triggers FFmpeg and returns transcoded MP4
  const streamUrl = `${BACKEND_URL}/stream/${video.id}/`
  return { url: streamUrl, needsTranscoding: true }
}

export default function VideoPlayer({ video, onCaptureFrame }) {
  const { config } = useContext(ConfigContext)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const pollRef = useRef(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [captureSuccess, setCaptureSuccess] = useState(false)
  const [showFlash, setShowFlash] = useState(false)

  // 'transcoding'  — waiting for FFmpeg on the backend
  // 'buffering'    — video element is loading/buffering
  // 'ready'        — playing fine
  // 'error'        — unrecoverable error
  const [status, setStatus] = useState('buffering')
  const [errorMsg, setErrorMsg] = useState(null)
  const [videoSrc, setVideoSrc] = useState(null)
  const [resolution, setResolution] = useState({ w: 0, h: 0 })
  const [transcodeProgress, setTranscodeProgress] = useState(0)

  // Poll backend until transcoding completes (stream_url appears)
  const startTranscodePolling = useCallback((videoObj) => {
    let tick = 0
    // Immediately trigger the transcode by fetching the stream endpoint once
    fetch(`${BACKEND_URL}/stream/${videoObj.id}/`, { method: 'GET' }).catch(() => {})

    pollRef.current = setInterval(async () => {
      tick++
      // Animate a fake progress bar (0→90% over time)
      setTranscodeProgress(prev => Math.min(prev + (90 - prev) * 0.08, 90))

      try {
        const res = await api.get(`/videos/${videoObj.id}/`)
        const updated = res.data

        if (updated.stream_url) {
          // Transcoding done!
          clearInterval(pollRef.current)
          pollRef.current = null
          setTranscodeProgress(100)
          const fullUrl = updated.stream_url.startsWith('http')
            ? updated.stream_url
            : `${BACKEND_URL}${updated.stream_url}`
          setVideoSrc(fullUrl)
          setStatus('buffering')
        } else if (tick >= 1 && !BACKEND_URL) {
          // No backend configured at all — fail early with helpful message
          clearInterval(pollRef.current)
          pollRef.current = null
          setErrorMsg(
            `No backend configured. Set VITE_API_URL to your backend URL in Vercel environment variables (e.g. https://your-backend.onrender.com/api).`
          )
          setStatus('error')
        }
      } catch (err) {
        // If backend is completely unreachable after a few attempts
        if (tick >= 4) {
          clearInterval(pollRef.current)
          pollRef.current = null
          setErrorMsg(
            `Backend unreachable. The .${getExtension(videoObj.video_name || '').replace('.', '')} format requires server-side transcoding. ` +
            `Ensure VITE_API_URL is set to your backend URL in Vercel settings.`
          )
          setStatus('error')
        }
      }
    }, TRANSCODE_POLL_INTERVAL)
  }, [])

  // Main effect: resolve URL when video changes
  useEffect(() => {
    // Clear any active polling
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }

    if (!video) {
      setVideoSrc(null)
      setStatus('buffering')
      setErrorMsg(null)
      setResolution({ w: 0, h: 0 })
      return
    }

    setErrorMsg(null)
    setResolution({ w: 0, h: 0 })
    setTranscodeProgress(0)

    const { url, needsTranscoding } = resolveVideoUrl(video)

    if (needsTranscoding) {
      // Don't set videoSrc yet — show transcoding UI while polling
      setVideoSrc(null)
      setStatus('transcoding')
      startTranscodePolling(video)
    } else {
      setVideoSrc(url)
      setStatus('buffering')
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
      // Revoke any blob URLs
      if (videoSrc && videoSrc.startsWith('blob:')) URL.revokeObjectURL(videoSrc)
    }
  }, [video?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-clear capture success badge
  useEffect(() => {
    if (captureSuccess) {
      const t = setTimeout(() => setCaptureSuccess(false), 2500)
      return () => clearTimeout(t)
    }
  }, [captureSuccess])

  const handleVideoMetadata = () => {
    const el = videoRef.current
    if (el) setResolution({ w: el.videoWidth, h: el.videoHeight })
  }

  const handleVideoError = (e) => {
    console.error('Video element error:', e.target?.error)
    const code = e.target?.error?.code
    let msg = 'Unknown playback error.'
    if (code === 1) msg = 'Playback aborted.'
    else if (code === 2) msg = 'Network error — possible CORS or mixed-content issue. Check that VITE_API_URL uses HTTPS.'
    else if (code === 3) msg = 'Decode error — the file may be corrupted.'
    else if (code === 4) {
      const ext = getExtension(video?.video_name || '').replace('.', '').toUpperCase()
      msg = `${ext || 'This'} format is not supported by your browser. ` +
            `The backend should transcode it — check that the backend service is running and VITE_API_URL is correct.`
    }
    setErrorMsg(msg)
    setStatus('error')
  }

  const handleCaptureFrame = async () => {
    const videoEl = videoRef.current
    if (!videoEl || !video || !onCaptureFrame) return

    if (!videoEl.paused) {
      videoEl.pause()
      setIsPlaying(false)
    }

    setCapturing(true)
    try {
      const canvas = canvasRef.current
      const nativeW = videoEl.videoWidth
      const nativeH = videoEl.videoHeight
      canvas.width = nativeW
      canvas.height = nativeH

      const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false })
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(videoEl, 0, 0, nativeW, nativeH)

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => b ? resolve(b) : reject(new Error('Canvas toBlob returned null')),
          'image/png'
        )
      })

      await onCaptureFrame({
        blob,
        timestamp: videoEl.currentTime,
        width: nativeW,
        height: nativeH,
        videoId: video.id,
        videoName: video.video_name,
        extension: 'png',
      })

      setShowFlash(true)
      setTimeout(() => setShowFlash(false), 400)
      setCaptureSuccess(true)
    } catch (err) {
      console.error('Frame capture failed:', err)
    } finally {
      setCapturing(false)
    }
  }

  if (!video) return null

  const is4K = resolution.w >= 3840
  const isHD = resolution.w >= 1920
  const resLabel = resolution.w > 0
    ? is4K ? '4K UHD' : isHD ? 'Full HD' : `${resolution.w}×${resolution.h}`
    : null

  // Fix mixed-content: upgrade http → https when on https page
  const safeSrc = videoSrc && window.location.protocol === 'https:' && videoSrc.startsWith('http:')
    ? videoSrc.replace('http:', 'https:')
    : videoSrc

  // Append #t=0.001 to force first-frame thumbnail (avoids blank black screen)
  const finalSrc = safeSrc
    ? safeSrc + (safeSrc.includes('#') ? '' : '#t=0.001')
    : null

  const isDisabled = capturing || status === 'transcoding' || status === 'buffering' || status === 'error'

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Video area */}
      <div style={{
        position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        background: '#000', border: '1px solid var(--border-subtle)'
      }}>

        {/* ── Transcoding overlay ── */}
        {status === 'transcoding' && (
          <div style={{
            aspectRatio: '16/9', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '20px',
            background: 'var(--bg-primary)'
          }}>
            {/* Spinning ring */}
            <div style={{ position: 'relative', width: '64px', height: '64px' }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '3px solid var(--border-strong)',
                borderTopColor: 'var(--accent-cyan)',
                animation: 'spin 1s linear infinite'
              }} />
              <div style={{
                position: 'absolute', inset: '12px', borderRadius: '50%',
                border: '2px solid var(--border-subtle)',
                borderBottomColor: 'var(--accent-purple)',
                animation: 'spin 1.5s linear infinite reverse'
              }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 700, fontSize: '1rem' }}>
                Transcoding video…
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px', marginBottom: '16px' }}>
                Converting {getExtension(video.video_name || '').toUpperCase()} → MP4 via FFmpeg
              </p>
              {/* Progress bar */}
              <div style={{
                width: '240px', height: '4px', borderRadius: '2px',
                background: 'var(--border-strong)', overflow: 'hidden', margin: '0 auto'
              }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
                  width: `${transcodeProgress}%`,
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '10px' }}>
                This may take 10–60 seconds for large files
              </p>
            </div>
          </div>
        )}

        {/* ── Error overlay ── */}
        {status === 'error' && (
          <div style={{
            aspectRatio: '16/9', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '16px',
            background: 'var(--bg-primary)', padding: '32px'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <AlertTriangle size={24} style={{ color: 'var(--danger)' }} />
            </div>
            <p style={{
              color: 'var(--danger)', textAlign: 'center',
              fontSize: '0.85rem', margin: 0, maxWidth: '420px', lineHeight: 1.6
            }}>
              {errorMsg}
            </p>
            <button
              onClick={() => {
                setStatus('transcoding')
                setErrorMsg(null)
                setTranscodeProgress(0)
                startTranscodePolling(video)
              }}
              style={{
                padding: '8px 20px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
                color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Retry Transcoding
            </button>
          </div>
        )}

        {/* ── Buffering overlay (shown on top of video while it loads) ── */}
        {status === 'buffering' && !finalSrc && (
          <div style={{
            aspectRatio: '16/9', display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'var(--bg-primary)'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              border: '2px solid var(--border-strong)', borderTopColor: 'var(--accent-cyan)',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        )}

        {/* ── The actual video element ── */}
        {/* Render when we have a src (even while buffering — browser handles it) */}
        {finalSrc && status !== 'transcoding' && (
          <>
            {/* Thin buffering bar */}
            {status === 'buffering' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                zIndex: 5, overflow: 'hidden', background: 'var(--border-strong)'
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
                  animation: 'indeterminate 1.5s ease-in-out infinite'
                }} />
              </div>
            )}

            <video
              ref={videoRef}
              style={{ width: '100%', display: 'block' }}
              src={finalSrc}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onCanPlay={() => setStatus('ready')}
              onLoadedMetadata={handleVideoMetadata}
              onError={handleVideoError}
              controls
              crossOrigin="anonymous"
            />

            {/* Flash overlay on capture */}
            {showFlash && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(255,255,255,0.8)',
                pointerEvents: 'none',
                animation: 'fadeOut 0.4s ease-out forwards'
              }} />
            )}
          </>
        )}
      </div>

      {/* ── Controls row ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        flexWrap: 'wrap', padding: '16px 0'
      }}>
        <button
          onClick={handleCaptureFrame}
          disabled={isDisabled}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: 'var(--radius-md)',
            fontWeight: 600, fontSize: '0.9rem',
            background: captureSuccess
              ? 'var(--success)'
              : isDisabled
                ? 'var(--bg-surface-elevated)'
                : 'var(--accent-cyan)',
            color: captureSuccess
              ? '#fff'
              : isDisabled
                ? 'var(--text-muted)'
                : 'var(--bg-primary)',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            border: `1px solid ${isDisabled ? 'var(--border-strong)' : 'transparent'}`,
            transition: 'all var(--transition-fast)'
          }}
        >
          {capturing ? (
            <>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%',
                border: '2px solid var(--text-muted)', borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite'
              }} />
              Capturing…
            </>
          ) : captureSuccess ? (
            <><CheckCircle2 size={18} /> Saved!</>
          ) : (
            <><Camera size={18} /> Capture Frame</>
          )}
        </button>

        {status === 'ready' && resolution.w > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 14px', background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem', color: 'var(--text-secondary)'
          }}>
            <Video size={14} />
            <span>{resolution.w} × {resolution.h}</span>
            {resLabel && (
              <span style={{
                padding: '2px 8px', borderRadius: '999px', fontWeight: 600,
                background: is4K ? 'var(--success-dim)' : isHD ? 'var(--accent-cyan-dim)' : 'var(--bg-surface-elevated)',
                color: is4K ? 'var(--success)' : isHD ? 'var(--accent-cyan)' : 'var(--text-muted)'
              }}>
                {resLabel}
              </span>
            )}
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>Lossless PNG</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeOut { from { opacity: 0.6; } to { opacity: 0; } }
        @keyframes indeterminate {
          0%   { transform: translateX(-100%) scaleX(0.3); }
          40%  { transform: translateX(0%) scaleX(0.7); }
          100% { transform: translateX(100%) scaleX(0.3); }
        }
      `}</style>
    </div>
  )
}
