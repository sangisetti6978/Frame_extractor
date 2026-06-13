import { createContext, useState, useEffect } from 'react'

export const ConfigContext = createContext()

export function ConfigProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState({
    folder_path: '',
    image_format: 'jpg',
    compression_quality: 85,
    min_blur_threshold: 0.5,
    auto_capture_enabled: false,
    capture_interval: 1000
  })

  // Load config from localStorage on mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('app_config')
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig))
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateConfig = async (newConfig) => {
    try {
      // TODO: Call API endpoint to save config to backend
      // For now, just save to localStorage
      const configToSave = {
        ...config,
        ...newConfig
      }
      setConfig(configToSave)
      localStorage.setItem('app_config', JSON.stringify(configToSave))
      return configToSave
    } catch (error) {
      throw new Error('Failed to update configuration')
    }
  }

  return (
    <ConfigContext.Provider value={{ config, setConfig, updateConfig, loading }}>
      {children}
    </ConfigContext.Provider>
  )
}
