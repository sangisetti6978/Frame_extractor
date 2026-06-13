import { useState, useEffect } from 'react'

export default function NotificationToast({ message, type = 'info', duration = 3000 }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(timer)
  }, [duration])

  if (!visible) return null

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[type]

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded ${bgColor} text-white`}>
      {message}
    </div>
  )
}
