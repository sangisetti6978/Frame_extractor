import { useRef, useState, useEffect, useContext } from 'react'
import { ConfigContext } from '../../context/ConfigContext'
import { Camera, CheckCircle2, Video } from 'lucide-react'

const NATIVE_EXTENSIONS = new Set(['.mp4', '.webm', '.ogg', '.ogv'])

function getExtension(filename) {
  const idx = filename.lastIndexOf('.')
  return idx >= 0 ? filename.substring(idx).toLowerCase() : ''
}

export default function VideoPlayer({ video, onCaptureFrame }) {
  const { config } = useContext(ConfigContext)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [captureSuccess, setCaptureSuccess] = useState(false)
  const [showFlash, setShowFlash] = useState(false)
  const [videoSrc, setVideoSrc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [resolution, setResolution] = useState({ w: 0, h: 0 })

  useEffect(() => {
    if (!video) { setVideoSrc(null); return }

    const ext = getExtension(video.video_name || '')

    if (NATIVE_EXTENSIONS.has(ext)) {
      setVideoSrc(video.video_url || `/media/${video.video_path}`)
      setError(null)
      setLoading(false)
    } else {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('access_token')
      fetch(video.stream_url || `/stream/${video.id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error(`Stream failed: ${res.status}`)
          return res.blob()
        })
        .then(blob => {
          setVideoSrc(URL.createObjectURL(blob))
          setLoading(false)
        })
        .catch(err => {
          console.error('Stream error:', err)
          setError('Failed to load video. It may still be transcoding — please wait and try again.')
          setLoading(false)
        })
    }

    return () => {
      if (videoSrc && videoSrc.startsWith('blob:')) URL.revokeObjectURL(videoSrc)
    }
  }, [video?.id])

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
      canvas.width  = nativeW
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

      const currentTime = videoEl.currentTime

      await onCaptureFrame({
        blob,
        timestamp: currentTime,
        width:  nativeW,
        height: nativeH,
        videoId:   video.id,
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

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#000', border: '1px solid var(--border-subtle)' }}>
        {loading ? (
          <div style={{ aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'var(--bg-primary)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--border-strong)', borderTopColor: 'var(--accent-cyan)', animation: 'spin 1s linear infinite' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>Transcoding video…</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '6px' }}>This may take a moment</p>
            </div>
          </div>
        ) : error ? (
          <div style={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
            <p style={{ color: 'var(--danger)', textAlign: 'center', padding: '0 24px', fontSize: '0.9rem' }}>{error}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              style={{ width: '100%', display: 'block' }}
              src={videoSrc}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onLoadedMetadata={handleVideoMetadata}
              controls
              crossOrigin="anonymous"
            />
            {showFlash && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)',
                pointerEvents: 'none', animation: 'fadeOut 0.4s ease-out forwards'
              }} />
            )}
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '16px 0' }}>
        <button
          onClick={handleCaptureFrame}
          disabled={capturing || loading || !!error}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: 'var(--radius-md)',
            fontWeight: 600, fontSize: '0.9rem',
            background: captureSuccess ? 'var(--success)' : (capturing || loading || error ? 'var(--bg-surface-elevated)' : 'var(--accent-cyan)'),
            color: captureSuccess ? '#fff' : (capturing || loading || error ? 'var(--text-muted)' : 'var(--bg-primary)'),
            cursor: (capturing || loading || error) ? 'not-allowed' : 'pointer',
            border: `1px solid ${(capturing || loading || error) ? 'var(--border-strong)' : 'transparent'}`,
            transition: 'all var(--transition-fast)'
          }}
        >
          {capturing ? (
            <>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--text-muted)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
              Capturing…
            </>
          ) : captureSuccess ? (
            <>
              <CheckCircle2 size={18} /> Saved!
            </>
          ) : (
            <>
              <Camera size={18} /> Capture Frame
            </>
          )}
        </button>

        {!loading && !error && resolution.w > 0 && (
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
      `}</style>
    </div>
  )
}

