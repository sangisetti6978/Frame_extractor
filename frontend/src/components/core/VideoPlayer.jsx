import { useRef, useState, useEffect, useContext } from 'react'
import { ConfigContext } from '../../context/ConfigContext'

// Browser-native video extensions that don't need transcoding
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
  const [videoSrc, setVideoSrc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!video) {
      setVideoSrc(null)
      return
    }

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
          const url = URL.createObjectURL(blob)
          setVideoSrc(url)
          setLoading(false)
        })
        .catch(err => {
          console.error('Stream error:', err)
          setError('Failed to load video. It may still be transcoding — please wait and try again.')
          setLoading(false)
        })
    }

    return () => {
      if (videoSrc && videoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(videoSrc)
      }
    }
  }, [video?.id])

  // Reset capture success indicator after 2 seconds
  useEffect(() => {
    if (captureSuccess) {
      const timer = setTimeout(() => setCaptureSuccess(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [captureSuccess])

  const handleCaptureFrame = async () => {
    const videoEl = videoRef.current
    if (!videoEl || !video || !onCaptureFrame) return

    // Pause the video first if playing
    if (!videoEl.paused) {
      videoEl.pause()
      setIsPlaying(false)
    }

    setCapturing(true)
    try {
      // Use an offscreen canvas at the video's native resolution for HD quality
      const canvas = canvasRef.current
      canvas.width = videoEl.videoWidth   // Native width (e.g. 1920)
      canvas.height = videoEl.videoHeight // Native height (e.g. 1080)
      
      const ctx = canvas.getContext('2d')
      // Draw the raw video frame — no UI overlays, no pause icons, just the frame
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
      
      // Use the configured image format and quality (defaults to PNG lossless)
      const imageFormat = config?.image_format || 'png'
      const mimeType = imageFormat === 'jpg' ? 'image/jpeg' : `image/${imageFormat}`
      const quality = config?.compression_quality ? config.compression_quality / 100 : 1.0
      
      // Convert to blob using configured settings
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, mimeType, quality)
      })
      
      const currentTime = videoEl.currentTime

      // Send to parent to upload
      await onCaptureFrame({
        blob,
        timestamp: currentTime,
        width: canvas.width,
        height: canvas.height,
        videoId: video.id,
        videoName: video.video_name,
        extension: imageFormat === 'jpg' ? 'jpg' : imageFormat,
      })

      setCaptureSuccess(true)
    } catch (err) {
      console.error('Frame capture failed:', err)
    } finally {
      setCapturing(false)
    }
  }

  if (!video) {
    return (
      <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
        <p className="text-gray-500">No video selected</p>
      </div>
    )
  }

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      {/* Hidden canvas for HD frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {loading ? (
        <div className="aspect-video flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Transcoding video for playback...</p>
            <p className="text-sm text-gray-400 mt-1">This may take a moment for the first time</p>
          </div>
        </div>
      ) : error ? (
        <div className="aspect-video flex items-center justify-center">
          <p className="text-red-400 text-center px-4">{error}</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="w-full"
          src={videoSrc}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          controls
          crossOrigin="anonymous"
        />
      )}
      <div className="flex gap-2 p-4 items-center">
        <button
          onClick={handleCaptureFrame}
          disabled={capturing || loading || !!error}
          className={`text-white px-5 py-2 rounded font-medium transition-all ${
            captureSuccess 
              ? 'bg-emerald-500' 
              : 'bg-green-600 hover:bg-green-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {capturing ? '📸 Capturing...' : captureSuccess ? '✅ Saved!' : '📸 Capture Frame'}
        </button>
        {!loading && !error && (
          <span className="text-gray-400 text-sm ml-2">
            Pause the video, then click to save the current frame in HD
          </span>
        )}
      </div>
    </div>
  )
}
