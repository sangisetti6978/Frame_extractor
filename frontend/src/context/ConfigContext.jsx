import { createContext, useState, useEffect } from 'react'
import api from '../services/api'

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

  // Load config from backend on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await api.get('/config/')
        const configs = response.data.configs
        if (configs && configs.length > 0) {
          const activeConfig = configs.find(c => c.is_active) || configs[0]
          
          const mappedConfig = {
            folder_path: activeConfig.folder_path || '',
            image_format: activeConfig.image_format || 'jpg',
            compression_quality: activeConfig.compression_quality || 85,
            min_blur_threshold: 0.5,
            auto_capture_enabled: false,
            capture_interval: 1000
          }
          
          const localStr = localStorage.getItem('app_config')
          if (localStr) {
            const local = JSON.parse(localStr)
            mappedConfig.min_blur_threshold = local.min_blur_threshold || 0.5
            mappedConfig.auto_capture_enabled = local.auto_capture_enabled || false
            mappedConfig.capture_interval = local.capture_interval || 1000
          }

          setConfig(mappedConfig)
          localStorage.setItem('app_config', JSON.stringify(mappedConfig))
        } else {
          const savedConfig = localStorage.getItem('app_config')
          if (savedConfig) setConfig(JSON.parse(savedConfig))
        }
      } catch (error) {
        console.error('Failed to load config from backend:', error)
        try {
          const savedConfig = localStorage.getItem('app_config')
          if (savedConfig) setConfig(JSON.parse(savedConfig))
        } catch (e) {}
      } finally {
        setLoading(false)
      }
    }
    
    if (localStorage.getItem('access_token')) {
      loadConfig()
    } else {
      setLoading(false)
    }
  }, [])

  const updateConfig = async (newConfig) => {
    try {
      const configToSave = {
        ...config,
        ...newConfig
      }
      
      // Save to backend
      if (localStorage.getItem('access_token')) {
        await api.post('/config/create_config/', {
          folder_name: 'Default',
          folder_path: configToSave.folder_path,
          image_format: configToSave.image_format,
          compression_quality: configToSave.compression_quality,
          auto_blur_detection: true,
          is_active: true
        })
      }
      
      setConfig(configToSave)
      localStorage.setItem('app_config', JSON.stringify(configToSave))
      return configToSave
    } catch (error) {
      console.error('Failed to save config to backend:', error)
      throw new Error('Failed to update configuration')
    }
  }

  return (
    <ConfigContext.Provider value={{ config, setConfig, updateConfig, loading }}>
      {children}
    </ConfigContext.Provider>
  )
}
