import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, set } from 'idb-keyval'
import { ConfigContext } from '../context/ConfigContext'
import { OnboardingContext } from '../context/OnboardingContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

/* ─── SVG Icons ─── */
const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
  </svg>
)
const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
)
const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
)
const RotateCcwIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
  </svg>
)

const s = {
  page: { minHeight: '100vh', background: '#06060e', color: '#f0f0f5', padding: '120px 24px 80px', fontFamily: "'Inter', sans-serif", position: 'relative' },
  mesh: { position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,0.1) 0%, transparent 80%)`, pointerEvents: 'none' },
  container: { maxWidth: '760px', margin: '0 auto', position: 'relative', zIndex: 10 },
  headerRow: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' },
  headerIcon: { width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', boxShadow: '0 4px 20px rgba(124,58,237,0.2)' },
  title: { fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' },
  subtitle: { fontSize: '1rem', color: 'rgba(240,240,245,0.5)', marginBottom: '40px', marginLeft: '64px' },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '36px', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' },
  section: { marginBottom: '32px' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  label: { fontSize: '0.85rem', fontWeight: 600, color: 'rgba(240,240,245,0.8)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  valueDisplay: { fontSize: '0.9rem', fontWeight: 700, color: '#a78bfa' },
  desc: { fontSize: '0.8rem', color: 'rgba(240,240,245,0.4)', marginTop: '6px' },
  inputRow: { display: 'flex', gap: '12px' },
  input: { flex: 1, padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s' },
  select: { width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.95rem', outline: 'none', appearance: 'none' },
  btnBrowse: { padding: '0 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' },
  range: { width: '100%', height: '6px', WebkitAppearance: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', outline: 'none' },
  switchRow: { display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' },
  checkbox: { width: '20px', height: '20px', borderRadius: '6px', accentColor: '#7c3aed', cursor: 'pointer' },
  actionRow: { display: 'flex', gap: '16px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '16px' },
  btnSave: { flex: 2, padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(124,58,237,0.3)', transition: 'all 0.2s' },
  btnReset: { flex: 1, padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#f0f0f5', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' },
  tipsBox: { marginTop: '32px', padding: '24px', borderRadius: '20px', background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)' },
  tipsTitle: { fontSize: '1rem', fontWeight: 700, color: '#c4b5fd', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
  alert: (type) => ({ padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: 600, background: type === 'success' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${type === 'success' ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'}`, color: type === 'success' ? '#6ee7b7' : '#fca5a5' })
}

const customCSS = `
.pro-input:focus, .pro-select:focus { border-color: rgba(124,58,237,0.5) !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.1) !important; background: rgba(255,255,255,0.08) !important; }
.pro-btn-browse:hover { background: rgba(255,255,255,0.12) !important; }
.pro-range::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #a78bfa; cursor: pointer; box-shadow: 0 0 10px rgba(167,139,250,0.5); transition: transform 0.1s; }
.pro-range::-webkit-slider-thumb:hover { transform: scale(1.2); }
.pro-btn-save:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(124,58,237,0.4) !important; }
.pro-btn-reset:hover { background: rgba(255,255,255,0.1) !important; }
.pro-select option { background: #0f0f16; color: #fff; }
`

export default function Setup() {
  const { config, updateConfig, loading } = useContext(ConfigContext)
  const { advanceStep } = useContext(OnboardingContext)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    folder_path: config?.folder_path || '',
    image_format: config?.image_format || 'jpg',
    compression_quality: config?.compression_quality || 85,
    min_blur_threshold: config?.min_blur_threshold || 0.5,
    auto_capture_enabled: config?.auto_capture_enabled || false,
    capture_interval: config?.capture_interval || 1000
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [localDirName, setLocalDirName] = useState('')

  useEffect(() => {
    const id = 'pro-setup-css'
    if (!document.getElementById(id)) {
      const el = document.createElement('style')
      el.id = id
      el.textContent = customCSS
      document.head.appendChild(el)
    }

    // Check if we already have a directory handle
    get('outputDirectoryHandle').then(handle => {
      if (handle) {
        setLocalDirName(handle.name)
        setFormData(prev => ({ ...prev, folder_path: '<Local File System>' }))
      }
    })
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    })
  }

  const handleSelectLocalFolder = async () => {
    if (!('showDirectoryPicker' in window)) {
      setMessage({ type: 'error', text: 'Your browser does not support local folder access. Please use Chrome or Edge on Desktop.' })
      return
    }
    try {
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      await set('outputDirectoryHandle', dirHandle);
      setLocalDirName(dirHandle.name);
      setFormData(prev => ({ ...prev, folder_path: '<Local File System>' }));
      setMessage({ type: 'success', text: `Granted access to local folder: ${dirHandle.name}` })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessage({ type: 'error', text: 'Failed to request local folder access.' })
      }
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Send a dummy path to backend so it doesn't break, local save ignores it
      const configToSave = { ...formData, folder_path: formData.folder_path === '<Local File System>' ? 'local_save_mode' : formData.folder_path }
      await updateConfig(configToSave)
      advanceStep(1)
      setMessage({ type: 'success', text: 'Configuration saved successfully!' })
      setTimeout(() => {
        setMessage(null)
        navigate('/dashboard')
      }, 1500)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to save configuration' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><LoadingSpinner /></div>
  }

  return (
    <div style={s.page}>
      <div style={s.mesh} />
      
      <div style={s.container}>
        <div style={s.headerRow}>
          <div style={s.headerIcon}><SettingsIcon /></div>
          <h1 style={s.title}>Configuration</h1>
        </div>
        <p style={s.subtitle}>Customize how your video frames are extracted and processed.</p>

        {message && (
          <div style={s.alert(message.type)}>
            {message.type === 'success' ? '✓ ' : '⚠️ '} {message.text}
          </div>
        )}

        <div style={s.card}>
          {/* Output Folder */}
          <div style={s.section}>
            <div style={s.labelRow}><label style={s.label}>Output Folder Path</label></div>
            <div style={s.inputRow}>
              <div style={{...s.input, display: 'flex', alignItems: 'center', background: localDirName ? 'rgba(52,211,153,0.1)' : s.input.background, color: localDirName ? '#6ee7b7' : s.input.color, border: localDirName ? '1px solid rgba(52,211,153,0.3)' : s.input.border}}>
                {localDirName ? `Local Folder Linked: ${localDirName}` : 'No local folder selected'}
              </div>
              <button type="button" onClick={handleSelectLocalFolder} style={s.btnBrowse} className="pro-btn-browse">
                <FolderIcon /> Select Local Folder
              </button>
            </div>
            <p style={s.desc}>
              Frames will be saved directly to this folder on your computer using the File System Access API.
            </p>
          </div>

          {/* Image Format */}
          <div style={s.section}>
            <div style={s.labelRow}><label style={s.label}>Image Format</label></div>
            <div style={{ position: 'relative' }}>
              <select name="image_format" value={formData.image_format} onChange={handleChange} style={s.select} className="pro-select">
                <option value="jpg">JPEG (Balanced)</option>
                <option value="png">PNG (Lossless)</option>
                <option value="webp">WebP (Modern)</option>
                <option value="bmp">BMP (Raw)</option>
              </select>
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.4)' }}>▼</div>
            </div>
          </div>

          {/* Compression Quality */}
          <div style={s.section}>
            <div style={s.labelRow}>
              <label style={s.label}>Compression Quality</label>
              <span style={s.valueDisplay}>{formData.compression_quality}%</span>
            </div>
            <input type="range" name="compression_quality" min="10" max="100" step="5"
              value={formData.compression_quality} onChange={handleChange} style={s.range} className="pro-range" />
            <p style={s.desc}>Higher values equal better quality but larger file sizes.</p>
          </div>

          {/* Blur Threshold */}
          <div style={s.section}>
            <div style={s.labelRow}>
              <label style={s.label}>Blur Detection Threshold</label>
              <span style={s.valueDisplay}>{formData.min_blur_threshold.toFixed(2)}</span>
            </div>
            <input type="range" name="min_blur_threshold" min="0" max="1" step="0.05"
              value={formData.min_blur_threshold} onChange={handleChange} style={s.range} className="pro-range" />
            <p style={s.desc}>0 = very strict (rejects slight blur), 1 = very loose (allows anything).</p>
          </div>

          {/* Auto Capture */}
          <div style={s.switchRow}>
            <input type="checkbox" name="auto_capture_enabled" id="auto_capture"
              checked={formData.auto_capture_enabled} onChange={handleChange} style={s.checkbox} />
            <div>
              <label htmlFor="auto_capture" style={{...s.label, color: '#f0f0f5', marginBottom: 0, cursor: 'pointer'}}>Enable Auto Capture</label>
              <p style={{...s.desc, marginTop: '2px'}}>Automatically capture frames at regular intervals.</p>
            </div>
          </div>

          {/* Capture Interval */}
          {formData.auto_capture_enabled && (
            <div style={s.section}>
              <div style={s.labelRow}>
                <label style={s.label}>Capture Interval</label>
                <span style={s.valueDisplay}>{formData.capture_interval}ms</span>
              </div>
              <input type="range" name="capture_interval" min="500" max="5000" step="100"
                value={formData.capture_interval} onChange={handleChange} style={s.range} className="pro-range" />
              <p style={s.desc}>How often to automatically capture a frame (in milliseconds).</p>
            </div>
          )}

          {/* Actions */}
          <div style={s.actionRow}>
            <button onClick={() => setFormData({
              folder_path: config?.folder_path || '', image_format: config?.image_format || 'jpg',
              compression_quality: config?.compression_quality || 85, min_blur_threshold: config?.min_blur_threshold || 0.5,
              auto_capture_enabled: config?.auto_capture_enabled || false, capture_interval: config?.capture_interval || 1000
            })} style={s.btnReset} className="pro-btn-reset">
              <RotateCcwIcon /> Reset
            </button>
            <button onClick={handleSave} disabled={saving} style={s.btnSave} className="pro-btn-save">
              <SaveIcon /> {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
