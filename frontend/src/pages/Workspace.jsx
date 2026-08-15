import React, { useState, useEffect, useCallback } from 'react'
import UploadZone from '../components/workspace/UploadZone'
import VideoPlayer from '../components/core/VideoPlayer'
import VideoTimeline from '../components/workspace/VideoTimeline'
import ExtractionSettings from '../components/workspace/ExtractionSettings'
import ProcessingProgress from '../components/workspace/ProcessingProgress'
import { videoApi, imageApi } from '../services/videoApi'
import { Link } from 'react-router-dom'
import { ArrowLeft, Video, Trash2, CheckCircle2, Clock, RefreshCw, Plus } from 'lucide-react'
import OnboardingStepTracker from '../components/common/OnboardingStepTracker'

function formatDuration(secs) {
  if (!secs) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function Workspace() {
  const [video, setVideo] = useState(null)
  const [videos, setVideos] = useState([])
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadZone, setShowUploadZone] = useState(false)
  const [stage, setStage] = useState('idle')
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStage, setProcessingStage] = useState(0)
  const [extractedCount, setExtractedCount] = useState(0)
  const [settings, setSettings] = useState({
    interval: 5, format: 'PNG', remove_duplicates: true, smart_selection: false
  })

  const fetchVideos = useCallback(async () => {
    setLoadingVideos(true)
    try {
      const res = await videoApi.listVideos()
      setVideos(res.data.results || res.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingVideos(false)
    }
  }, [])

  useEffect(() => { fetchVideos() }, [fetchVideos])

  const handleSelectVideo = (v) => {
    setVideo(v)
    setStage('settings')
    setShowUploadZone(false)
  }

  const handleUpload = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const response = await videoApi.uploadVideo(file, (e) => {
        setUploadProgress(Math.round((e.loaded / e.total) * 100))
      })
      const newVideo = response.data
      setVideos(prev => [newVideo, ...prev])
      setVideo(newVideo)
      setStage('settings')
      setShowUploadZone(false)
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDeleteVideo = async (e, v) => {
    e.stopPropagation()
    if (!window.confirm(`Delete "${v.video_name}"?`)) return
    try {
      await videoApi.deleteVideo(v.id)
      setVideos(prev => prev.filter(x => x.id !== v.id))
      if (video && video.id === v.id) { setVideo(null); setStage('idle') }
    } catch (err) { console.error(err) }
  }

  const syncToLocalDirectory = async (videoObj) => {
    try {
      const { get } = await import('idb-keyval');
      const dirHandle = await get('outputDirectoryHandle');
      if (!dirHandle) return;

      const res = await imageApi.filterByVideo(videoObj.video_name);
      const images = res.data;
      if (!images || images.length === 0) return;

      for (const img of images) {
        try {
          // Fetch blob using axios so headers/base URL are applied correctly
          const { default: api } = await import('../services/api');
          const blobRes = await api.get(img.image, { responseType: 'blob' });
          const blob = blobRes.data;
          
          const filename = img.file_name || `frame_${img.id}.png`;
          const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (imgErr) {
          console.error(`Failed to sync ${img.file_name}:`, imgErr);
        }
      }
    } catch (e) {
      console.error("Local sync failed", e);
    }
  }

  const startProcessing = async () => {
    if (!video) return
    setStage('processing')
    setProcessingProgress(0)
    setProcessingStage(1)
    try {
      // Convert interval (seconds between frames) to fps
      const fps = 1 / (settings.interval || 5)
      const format = (settings.format || 'PNG').toLowerCase()
      await videoApi.extractFrames(video.id, { fps, format })
      const poll = setInterval(async () => {
        setProcessingProgress(prev => {
          const next = prev + (100 - prev) * 0.04
          if (next > 20) setProcessingStage(2)
          if (next > 55) setProcessingStage(3)
          if (next > 80) setProcessingStage(4)
          return Math.min(next, 92)
        })
        try {
          const res = await videoApi.getVideo(video.id)
          const updated = res.data
          if (updated.status === 'completed' || updated.status === 'failed') {
            clearInterval(poll)
            setExtractedCount(updated.frames_extracted || 0)
            setVideos(prev => prev.map(v => v.id === updated.id ? updated : v))
            setProcessingProgress(100)
            setProcessingStage(4)
            setTimeout(() => setStage('completed'), 600)
            
            if (updated.status === 'completed') {
              // Trigger sync in background
              syncToLocalDirectory(updated);
            }
          }
        } catch (_) {}
      }, 2000)
    } catch (err) {
      console.error('Extraction failed:', err)
      setStage('settings')
    }
  }

  const handleCaptureFrame = async (frameData) => {
    try {
      // 1. Save to backend database
      await imageApi.captureFrame(frameData)
      
      // 2. Save directly to local hard drive (if authorized)
      try {
        const { get } = await import('idb-keyval');
        const dirHandle = await get('outputDirectoryHandle');
        if (dirHandle) {
          // Format filename: video_name_timestamp.png
          const cleanName = (frameData.videoName || 'video').replace(/[^a-z0-9]/gi, '_').toLowerCase()
          const filename = `${cleanName}_${Math.round(frameData.timestamp * 1000)}.${frameData.extension || 'png'}`
          
          const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(frameData.blob);
          await writable.close();
          console.log(`Saved locally: ${filename}`);
        }
      } catch (localSaveErr) {
        console.error('Failed to save to local folder:', localSaveErr);
        // We don't throw here, because backend save succeeded
      }

      // Update the video's frame count in the sidebar
      if (video) {
        setVideos(prev => prev.map(v =>
          v.id === video.id
            ? { ...v, frames_extracted: (v.frames_extracted || 0) + 1 }
            : v
        ))
        setVideo(prev => prev ? { ...prev, frames_extracted: (prev.frames_extracted || 0) + 1 } : prev)
      }
    } catch (err) {
      console.error('Failed to save captured frame:', err)
    }
  }

  const resetToList = () => {
    setVideo(null)
    setStage('idle')
    setShowUploadZone(false)
    setProcessingProgress(0)
    fetchVideos()
  }

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - var(--topbar-height) - 64px)', display: 'flex', gap: '24px' }}>
      <OnboardingStepTracker step={2} />

      {/* Left Panel: Video List */}
      <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>My Videos</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={fetchVideos} title="Refresh" style={{ color: 'var(--text-muted)', display: 'flex' }}>
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => { setShowUploadZone(true); setVideo(null); setStage('idle') }}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-cyan)', color: 'var(--bg-primary)', fontWeight: 700, fontSize: '0.75rem' }}
            >
              <Plus size={12} /> New
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {loadingVideos ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--border-strong)', borderTopColor: 'var(--accent-cyan)', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          ) : videos.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <Video size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>No videos yet.<br />Upload one to get started.</p>
            </div>
          ) : videos.map(v => {
            const isActive = video && video.id === v.id
            return (
              <div
                key={v.id}
                onClick={() => handleSelectVideo(v)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer', marginBottom: '4px', background: isActive ? 'rgba(34,211,238,0.1)' : 'transparent', border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'transparent'}`, transition: 'all var(--transition-fast)', position: 'relative' }}
                onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-surface-elevated)' }}
                onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ width: '44px', height: '30px', borderRadius: '6px', flexShrink: 0, background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Video size={16} style={{ color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isActive ? 'var(--accent-cyan)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {v.video_name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                    <span>{formatDuration(v.duration)}</span>
                    {v.frames_extracted > 0 && <span style={{ color: 'var(--success)' }}>✓ {v.frames_extracted} frames</span>}
                    {v.status === 'processing' && <span style={{ color: 'var(--warning)' }}>⟳ Processing</span>}
                  </div>
                </div>
                {v.frames_extracted > 0 && <CheckCircle2 size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />}
                <button
                  onClick={(e) => handleDeleteVideo(e, v)}
                  title="Delete"
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', opacity: 0, color: 'var(--danger)', padding: '4px', borderRadius: '4px', background: 'var(--danger-dim)', transition: 'opacity var(--transition-fast)', display: 'flex' }}
                  onMouseOver={e => e.currentTarget.style.opacity = '1'}
                  onMouseOut={e => e.currentTarget.style.opacity = '0'}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {(stage === 'idle' || showUploadZone) && (
          <UploadZone onUpload={handleUpload} uploading={uploading} uploadProgress={uploadProgress} />
        )}

        {stage === 'settings' && video && !showUploadZone && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="glass-panel" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="h2" style={{ marginBottom: '4px' }}>{video.video_name || 'Video Preview'}</h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                    <span>{formatDuration(video.duration)}</span>
                    <span>{formatBytes(video.video_size)}</span>
                    {video.width > 0 && <span>{video.width}x{video.height}</span>}
                  </div>
                </div>
                <button onClick={resetToList} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                  <ArrowLeft size={16} /> Back
                </button>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <VideoPlayer video={video} onCaptureFrame={handleCaptureFrame} />
                <VideoTimeline duration={video.duration || 300} currentTime={0} frames={[20, 45, 120, 200]} scenes={[60, 180]} />
              </div>
            </div>
          </div>
        )}

        {stage === 'processing' && (
          <ProcessingProgress progress={processingProgress} stage={processingStage} />
        )}

        {stage === 'completed' && (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', maxWidth: '500px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--success-dim)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle2 size={40} />
              </div>
              <h2 className="h2" style={{ marginBottom: '12px' }}>Extraction Complete!</h2>
              <p className="body" style={{ marginBottom: '8px' }}>
                Successfully extracted <strong style={{ color: 'var(--accent-cyan)' }}>{extractedCount} frames</strong> from
              </p>
              <p className="body" style={{ marginBottom: '32px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {video && video.video_name}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={resetToList} style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                  Process Another
                </button>
                <Link to="/gallery" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'var(--accent-cyan)', color: 'var(--bg-primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
                  View in Gallery
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Side Panel */}
      {(stage === 'settings' || stage === 'processing' || stage === 'completed') && !showUploadZone && (
        <div style={{ width: '320px', flexShrink: 0 }}>
          <div className="glass-panel" style={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
            {stage === 'settings' ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <ExtractionSettings settings={settings} setSettings={setSettings} />
                <div style={{ padding: '24px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button onClick={startProcessing} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--text-primary)', color: 'var(--bg-primary)', fontWeight: 600, fontSize: '0.95rem', transition: 'transform var(--transition-fast)' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    Start AI Extraction
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px', opacity: 0.5, pointerEvents: 'none' }}>
                <ExtractionSettings settings={settings} setSettings={setSettings} />
              </div>
            )}
            {(stage === 'processing' || stage === 'completed') && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(17,19,24,0.6)' }} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
