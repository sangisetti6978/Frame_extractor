import { useState, useEffect, useCallback, useRef } from 'react'
import { videoApi, imageApi } from '../services/videoApi'
import VideoPlayer from '../components/core/VideoPlayer'
import LoadingSpinner from '../components/common/LoadingSpinner'
import NotificationToast from '../components/common/NotificationToast'
import { formatBytes } from '../utils/formatBytes'

export default function Dashboard() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [notification, setNotification] = useState({ message: '', type: 'info' })
  const [showNotification, setShowNotification] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const response = await videoApi.listVideos()
      setVideos(response.data.results || response.data || [])
    } catch (err) {
      console.error('Failed to load videos:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to load videos'
      setNotification({ message: errorMsg, type: 'error' })
      setShowNotification(true)
      setVideos([]) // Set empty array so page can still be viewed
    } finally {
      setLoading(false)
    }
  }

  // Shared upload logic used by both the file input and drag-and-drop
  const uploadFile = useCallback(async (file) => {
    if (!file) return

    // Validate it's a video file
    if (!file.type.startsWith('video/')) {
      setNotification({ message: 'Please drop a video file', type: 'error' })
      setShowNotification(true)
      return
    }

    // Validate file size (2GB max)
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setNotification({ message: 'File size exceeds 2GB limit', type: 'error' })
      setShowNotification(true)
      return
    }

    setUploading(true)
    try {
      const response = await videoApi.uploadVideo(file, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
        setUploadProgress(progress)
      })
      const uploadedVideo = response.data
      setVideos(prev => [uploadedVideo, ...prev])
      setSelectedVideo(uploadedVideo) // Auto-select the newly uploaded video
      setNotification({ message: 'Video uploaded successfully!', type: 'success' })
      setShowNotification(true)
    } catch (err) {
      console.error('Upload failed:', err)
      setNotification({ message: 'Failed to upload video', type: 'error' })
      setShowNotification(true)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [])

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
      e.target.value = '' // Reset file input
    }
  }

  // --- Drag-and-drop handlers for the entire page ---
  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current += 1
    if (e.dataTransfer.types && e.dataTransfer.types.indexOf('Files') !== -1) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      uploadFile(files[0])
    }
  }, [uploadFile])

  const handleCaptureFrame = async (frameData) => {
    try {
      const response = await imageApi.captureFrame(frameData)
      setNotification({ message: '📸 Frame captured and saved in HD!', type: 'success' })
      setShowNotification(true)
      // Update frame count on the video
      if (selectedVideo) {
        const updatedCount = (selectedVideo.frames_extracted || 0) + 1
        const updatedVideo = { ...selectedVideo, frames_extracted: updatedCount }
        setSelectedVideo(updatedVideo)
        setVideos(prev => prev.map(v => v.id === selectedVideo.id ? updatedVideo : v))
      }
    } catch (err) {
      console.error('Capture failed:', err)
      const errorMsg = err.response?.data?.error || err.message || 'Failed to capture frame'
      setNotification({ message: errorMsg, type: 'error' })
      setShowNotification(true)
    }
  }

  const handleDeleteVideo = async (id) => {
    if (!window.confirm('Delete this video?')) return

    try {
      await videoApi.deleteVideo(id)
      setVideos(videos.filter(v => v.id !== id))
      if (selectedVideo?.id === id) {
        setSelectedVideo(null)
      }
      setNotification({ message: 'Video deleted', type: 'success' })
      setShowNotification(true)
    } catch (err) {
      setNotification({ message: 'Failed to delete video', type: 'error' })
      setShowNotification(true)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div
      className="max-w-7xl mx-auto px-4 py-8"
      style={{ position: 'relative', minHeight: '80vh' }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Full-page drag overlay */}
      {isDragging && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(37, 99, 235, 0.12)',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.2s',
          }}
        >
          <div
            style={{
              border: '3px dashed #2563eb',
              borderRadius: '1.5rem',
              padding: '3rem 4rem',
              background: 'rgba(255,255,255,0.95)',
              boxShadow: '0 8px 32px rgba(37,99,235,0.18)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📁 ➜ 🎬</div>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#2563eb' }}>
              Drop your video here to upload
            </p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Supports all video formats up to 2 GB
            </p>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Video Player */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            {selectedVideo ? (
              <div>
                <h2 className="text-xl font-bold mb-4">{selectedVideo.video_name}</h2>
                <VideoPlayer video={selectedVideo} onCaptureFrame={handleCaptureFrame} />
                <div className="mt-4 text-sm text-gray-600">
                  <p>Duration: {selectedVideo.duration?.toFixed(2)}s</p>
                  <p>Resolution: {selectedVideo.width}x{selectedVideo.height}</p>
                  <p>FPS: {selectedVideo.fps?.toFixed(2)}</p>
                  <p>Status: {selectedVideo.status}</p>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 flex items-center justify-center rounded">
                <p className="text-gray-500">Select a video to play</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">Upload Video</h3>
            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-gray-50">
              <span className="text-4xl mb-2">📹</span>
              <span className="text-sm text-gray-600">Click to upload or drag &amp; drop anywhere</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            {uploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">{uploadProgress}%</p>
              </div>
            )}
          </div>

          {/* Videos List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4">Your Videos</h3>
            {videos.length === 0 ? (
              <p className="text-gray-500 text-sm">No videos yet. Upload one!</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className={`p-3 rounded border-2 cursor-pointer transition ${selectedVideo?.id === video.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <p className="font-medium text-sm truncate">{video.video_name}</p>
                    <p className="text-xs text-gray-600">{formatBytes(video.video_size)}</p>
                    <p className="text-xs text-gray-600">Frames: {video.frames_extracted}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteVideo(video.id)
                        }}
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showNotification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          duration={3000}
        />
      )}
    </div>
  )
}
