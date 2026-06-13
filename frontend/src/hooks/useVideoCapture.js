import { useCallback, useState } from 'react'

export function useVideoCapture() {
  const [capturedFrames, setCapturedFrames] = useState([])
  const [isCapturing, setIsCapturing] = useState(false)

  const captureFrame = useCallback(async (videoElement, timestamp) => {
    if (!videoElement) return

    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoElement, 0, 0)

    const frameData = {
      timestamp,
      data: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height
    }

    setCapturedFrames((prev) => [...prev, frameData])
  }, [])

  return {
    capturedFrames,
    isCapturing,
    setIsCapturing,
    captureFrame,
    clearFrames: () => setCapturedFrames([])
  }
}
