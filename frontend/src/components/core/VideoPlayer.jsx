import { useRef, useState, useEffect, useContext } from 'react'
import { ConfigContext } from '../../context/ConfigContext'
import { BACKEND_URL } from '../../services/api'
import { Camera, CheckCircle2, Video, AlertTriangle } from 'lucide-react'

// Formats the browser can play natively — no server transcoding needed
const NATIVE_EXTENSIONS = new Set(['.mp4', '.webm', '.ogg', '.ogv'])

function getExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx >= 0 ? filename.substring(idx).toLowerCase() : ''
}

export default function VideoPlayer({ video, onCaptureFrame }) {
  const { config } = useContext(ConfigContext)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const [isPlaying, setIsPlaying]       = useState(false)
  const [capturing, setCapturing]       = useState(false)
  const [captureSuccess, setCaptureSuccess] = useState(false)
  const [showFlash, setShowFlash]       = useState(false)
  const [buffering, setBuffering]       = useState(true)   // waiting for first bytes
  const [error, setError]               = useState(null)
  const [resolution, setResolution]     = useState({ w: 0, h: 0 })

  // Resolve the playable URL whenever the video changes
  const videoSrc = (() => {
    if (!video) return null
    // Prefer the backend stream URL — it handles native files, cached transcodes,
    // AND live FFmpeg pipe streaming all in one endpoint.
    if (video.stream_url) {
      const url = video.stream_url.startsWith('http')
        ? video.stream_url
        : `${BACKEND_URL}${video.stream_url}`
      // Upgrade http → https on HTTPS pages to avoid mixed-content block
      return window.location.protocol === 'https:' && url.startsWith('http:')
        ? url.replace('http:', 'https:')
        : url
    }
    // Fallback: native formats can be served directly
    const ext = getExtension(video.video_name || '')
    if (NATIVE_EXTENSIONS.has(ext)) {
      const raw = video.video_url || `${BACKEND_URL}/media/${video.video_path}`
      return window.location.protocol === 'https:' && raw.startsWith('http:')
        ? raw.replace('http:', 'https:')
        : raw
    }
    // Non-native with no stream_url yet — construct stream URL manually
    return `${BACKEND_URL}/stream/${video.id}/`
  })()

  // Reset state when the selected video changes
  useEffect(() => {
    setBuffering(true)
    setError(null)
    setResolution({ w: 0, h: 0 })
    setIsPlaying(false)
  }, [video?.id])

  // Clear the capture-success badge after 2.5s
  useEffect(() => {
    if (!captureSuccess) return
    const t = setTimeout(() => setCaptureSuccess(false), 2500)
    return () => clearTimeout(t)
  }, [captureSuccess])

  const handleVideoMetadata = () => {
    const el = videoRef.current
    if (el) setResolution({ w: el.videoWidth, h: el.videoHeight })
  }

  const handleVideoError = (e) => {
    const code = e.target?.error?.code
    let msg = 'Unknown playback error.'
    if (code === 1) msg = 'Playback aborted.'
    else if (code === 2) msg = 'Network error — possible CORS or mixed-content issue.'
    else if (code === 3) msg = 'Decode error — the file may be corrupted.'
    else if (code === 4) {
      const ext = getExtension(video?.video_name || '').replace('.', '').toUpperCase()
      msg = `${ext || 'This'} format could not be played. ` +
            `Ensure VITE_API_URL points to your running backend (e.g. https://your-backend.onrender.com/api).`
    }
    setError(msg)
    setBuffering(false)
  }

  const handleCaptureFrame = async () => {
    const videoEl = videoRef.current
    if (!videoEl || !video || !onCaptureFrame) return

    if (!videoEl.paused) { videoEl.pause(); setIsPlaying(false) }

    setCapturing(true)
    try {
      const canvas  = canvasRef.current
      const nativeW = videoEl.videoWidth
      const nativeH = videoEl.videoHeight
      canvas.width  = nativeW
      canvas.height = nativeH

      const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false })
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(videoEl, 0, 0, nativeW, nativeH)

      const blob = await new Promise((res, rej) =>
        canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob null')), 'image/png')
      ).catch(err => {
        // SecurityError = video is cross-origin without CORS headers on the canvas
        if (err?.name === 'SecurityError') throw new Error(
          'Canvas capture blocked: the video stream must include CORS headers. ' +
          'Ensure CORS_ALLOW_ALL_ORIGINS=True is set on the backend.'
        )
        throw err
      })

      await onCaptureFrame({
        blob, timestamp: videoEl.currentTime,
        width: nativeW, height: nativeH,
        videoId: video.id, videoName: video.video_name, extension: 'png',
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

  const is4K    = resolution.w >= 3840
  const isHD    = resolution.w >= 1920
  const resLabel = resolution.w > 0
    ? is4K ? '4K UHD' : isHD ? 'Full HD' : `${resolution.w}×${resolution.h}`
    : null

  const isDisabled = capturing || !!error

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ── Video container ── */}
      <div style={{
        position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        background: '#000', border: '1px solid var(--border-subtle)'
      }}>

        {/* Thin animated bar while the first bytes arrive */}
        {buffering && !error && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            zIndex: 10, overflow: 'hidden', background: 'var(--border-strong)'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
              animation: 'buffering 1.4s ease-in-out infinite'
            }} />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{
            aspectRatio: '16/9', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '16px',
            background: 'var(--bg-primary)', padding: '32px'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(239,68,68,0.12)', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <AlertTriangle size={24} style={{ color: 'var(--danger)' }} />
            </div>
            <p style={{
              color: 'var(--danger)', textAlign: 'center',
              fontSize: '0.85rem', margin: 0, maxWidth: '400px', lineHeight: 1.6
            }}>{error}</p>
            <button
              onClick={() => { setError(null); setBuffering(true) }}
              style={{
                padding: '8px 20px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
                color: 'var(--text-secondary)', fontSize: '0.8rem',
                fontWeight: 600, cursor: 'pointer'
              }}
            >Retry</button>
          </div>
        )}

        {/* The video element — always mounted so the browser starts buffering immediately */}
        {videoSrc && !error && (
          <>
            <video
              key={video.id}          /* remount when video changes */
              ref={videoRef}
              style={{ width: '100%', display: 'block' }}
              src={videoSrc}
              onLoadStart={() => setBuffering(true)}
              onCanPlay={() => setBuffering(false)}
              onPlaying={() => setBuffering(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onLoadedMetadata={handleVideoMetadata}
              onError={handleVideoError}
              controls
              crossOrigin="anonymous"
              preload="auto"
            />
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
              : isDisabled ? 'var(--text-muted)' : 'var(--bg-primary)',
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

        {!buffering && !error && resolution.w > 0 && (
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
              }}>{resLabel}</span>
            )}
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>Lossless PNG</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeOut    { from { opacity: 0.6; } to { opacity: 0; } }
        @keyframes buffering  {
          0%   { transform: translateX(-100%) scaleX(0.4); }
          50%  { transform: translateX(30%)   scaleX(0.6); }
          100% { transform: translateX(120%)  scaleX(0.4); }
        }
      `}</style>
    </div>
  )
}
