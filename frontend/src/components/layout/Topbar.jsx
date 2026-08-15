import React, { useContext, useState, useRef, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { Search, Bell, HelpCircle, Menu, User, Settings, LogOut, Pencil, X, Upload, Bot, Send, Play, FileText, MessageCircle } from 'lucide-react'
import adminApi from '../../services/adminApi'

/* ─── Chatbot Brain ─── */
const BOT_ROUTES = {
  gallery: '/gallery',
  'extracted frames': '/gallery',
  frames: '/gallery',
  images: '/gallery',
  upload: '/workspace',
  'upload video': '/workspace',
  workspace: '/workspace',
  video: '/workspace',
  overview: '/dashboard',
  dashboard: '/dashboard',
  home: '/dashboard',
  analytics: '/analytics',
  stats: '/analytics',
  configuration: '/setup',
  settings: '/setup',
  setup: '/setup',
  config: '/setup',
  admin: '/admin-panel',
  'admin panel': '/admin-panel',
  'admin portal': '/admin-panel',
}

const BOT_RESPONSES = [
  { keys: ['hello', 'hi', 'hey'], reply: "Hi there! 👋 I'm AutoFrame Assistant. Ask me anything about the platform, or say things like 'open gallery' or 'go to settings' to navigate!" },
  { keys: ['what can you do', 'help me', 'how do you work'], reply: "I can help you navigate the app, explain features, and answer questions about AutoFrame Extractor. Try asking me to 'show gallery', 'open upload', or 'what is blur detection'?" },
  { keys: ['blur', 'blur detection'], reply: "🔍 **Blur Detection** uses OpenCV-powered ML scoring to automatically flag motion-blurred frames. A score closer to 0 = sharper. You can set your quality threshold in Configuration." },
  { keys: ['extract', 'how to extract', 'extraction'], reply: "🎬 To extract frames: go to **Upload Video**, upload your footage, configure your settings, then hit Extract. Your frames will appear in the **Gallery**!" },
  { keys: ['export', 'download', 'save'], reply: "💾 You can export frames directly from the **Gallery** page. Select frames and click 'Export Selected', or open a frame and click 'Save to PC'." },
  { keys: ['format', 'supported formats', 'file types'], reply: "📁 AutoFrame supports most common video formats: **MP4, AVI, MOV, MKV, WebM**, and more via FFmpeg." },
  { keys: ['thank', 'thanks', 'awesome', 'great'], reply: "You're welcome! 🚀 Let me know if you need anything else." },
]

function getBotReply(message, navigate, setShowHelp) {
  const lower = message.toLowerCase().trim()

  // Navigation intent
  const navPhrases = ['open', 'go to', 'show me', 'navigate to', 'take me to', 'show']
  for (const phrase of navPhrases) {
    if (lower.startsWith(phrase)) {
      const target = lower.replace(phrase, '').trim()
      for (const [key, path] of Object.entries(BOT_ROUTES)) {
        if (target.includes(key)) {
          setTimeout(() => { navigate(path); setShowHelp(false) }, 700)
          return `Sure! Taking you to **${key}** now... 🚀`
        }
      }
    }
  }

  // Direct keyword match for routes
  for (const [key, path] of Object.entries(BOT_ROUTES)) {
    if (lower.includes(key)) {
      if (lower.includes('open') || lower.includes('go') || lower.includes('show') || lower.includes('navigate')) {
        setTimeout(() => { navigate(path); setShowHelp(false) }, 700)
        return `Opening **${key}** for you! 🚀`
      }
    }
  }

  // Knowledge base
  for (const { keys, reply } of BOT_RESPONSES) {
    if (keys.some(k => lower.includes(k))) return reply
  }

  return "🤔 I'm not sure about that. Try asking me to navigate somewhere, or ask about features like 'blur detection', 'export', or 'supported formats'. You can also ask me to 'open gallery'!"
}

/* ─── Edit Modal for Help Sections ─── */
function EditHelpModal({ section, current, onSave, onClose, loading }) {
  const sectionLabels = { documentation: 'Documentation', video_tutorial: 'Video Tutorial', faq: 'FAQ' }
  const [title, setTitle] = useState(current?.title || '')
  const [content, setContent] = useState(current?.content || '')
  const [videoFile, setVideoFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState(current?.video_url || '')
  const fileRef = useRef()
  const [dragging, setDragging] = useState(false)

  const handleSubmit = () => {
    const fd = new FormData()
    fd.append('title', title)
    fd.append('content', content)
    if (videoFile) fd.append('video_file', videoFile)
    else if (videoUrl) fd.append('video_url', videoUrl)
    onSave(section, fd)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-surface-elevated, #111)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '32px', width: '500px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            ✏️ Edit {sectionLabels[section]}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder={`${sectionLabels[section]} title...`} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Content / Description</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="Write content here..." style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>

          {section === 'video_tutorial' && (
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Video File (upload MP4)</label>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setVideoFile(f) }}
                onClick={() => fileRef.current.click()}
                style={{ border: `2px dashed ${dragging ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.15)'}`, borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'border 0.2s', background: dragging ? 'rgba(34,211,238,0.06)' : 'rgba(255,255,255,0.02)' }}
              >
                <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {videoFile ? `✅ ${videoFile.name}` : current?.video_url ? `Current: video uploaded` : 'Drag & drop or click to upload .mp4'}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="video/mp4,video/*" style={{ display: 'none' }} onChange={e => setVideoFile(e.target.files[0])} />
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Or paste a video URL</label>
                <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={onClose} style={{ padding: '12px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: 600 }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Video Player Modal ─── */
function VideoModal({ url, title, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ maxWidth: '900px', width: '95vw' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>▶ {title}</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
        </div>
        <video controls autoPlay style={{ width: '100%', borderRadius: '16px', maxHeight: '75vh', background: '#000', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }} src={url}>
          Your browser does not support video playback.
        </video>
      </div>
    </div>
  )
}

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = user?.is_staff || user?.is_superuser

  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [activeHelpTab, setActiveHelpTab] = useState('menu') // 'menu' | 'chat' | 'doc' | 'video' | 'faq'

  const [helpContent, setHelpContent] = useState({})
  const [editModal, setEditModal] = useState(null) // section string or null
  const [videoModal, setVideoModal] = useState(null) // { url, title }
  const [saving, setSaving] = useState(false)

  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { from: 'bot', text: "👋 Hi! I'm the AutoFrame AI Assistant. Ask me anything, or say things like 'open gallery' or 'go to settings' to navigate instantly!" }
  ])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef()

  const notifRef = useRef()
  const profileRef = useRef()
  const helpRef = useRef()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false)
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false)
      if (helpRef.current && !helpRef.current.contains(event.target)) { setShowHelp(false); setActiveHelpTab('menu') }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch help content when panel opens
  useEffect(() => {
    if (showHelp) {
      adminApi.getHelpContent().then(res => {
        const map = {}
        res.data.items.forEach(item => { map[item.section] = item })
        setHelpContent(map)
      }).catch(() => {})
    }
  }, [showHelp])

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const getTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Overview'
      case '/workspace': return 'Video Workspace'
      case '/gallery': return 'Gallery'
      case '/analytics': return 'Analytics'
      case '/setup': return 'Configuration'
      case '/admin-panel': return 'Admin Portal'
      default: return 'AutoFrame Extractor'
    }
  }

  const notifications = [
    { id: 1, title: 'Extraction Complete', desc: 'Finished processing "Project_Alpha.mp4". 45 frames extracted.', time: '2m ago', unread: true },
    { id: 2, title: 'Welcome to AutoFrame', desc: 'Get started by uploading your first video.', time: '1h ago', unread: false },
  ]

  const handleLogout = () => { setShowProfile(false); logout(); navigate('/login') }

  const handleSaveHelp = async (section, formData) => {
    setSaving(true)
    try {
      const res = await adminApi.updateHelpContent(section, formData)
      setHelpContent(prev => ({ ...prev, [section]: res.data }))
      setEditModal(null)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  const sendChat = useCallback(() => {
    const msg = chatInput.trim()
    if (!msg) return
    setChatMessages(prev => [...prev, { from: 'user', text: msg }])
    setChatInput('')
    setTimeout(() => {
      const reply = getBotReply(msg, navigate, setShowHelp)
      setChatMessages(prev => [...prev, { from: 'bot', text: reply }])
    }, 400)
  }, [chatInput, navigate])

  const helpItems = [
    { key: 'documentation', label: 'Documentation', icon: FileText, section: 'documentation' },
    { key: 'video_tutorial', label: 'Video Tutorials', icon: Play, section: 'video_tutorial' },
    { key: 'faq', label: 'FAQ', icon: MessageCircle, section: 'faq' },
    { key: 'chatbot', label: 'AI Assistant', icon: Bot, section: null },
  ]

  const handleHelpItemClick = (item) => {
    if (item.key === 'chatbot') { setActiveHelpTab('chat'); return }
    const content = helpContent[item.section]
    if (item.section === 'video_tutorial' && content?.video_url) {
      setVideoModal({ url: content.video_url, title: content.title || 'Video Tutorial' })
      return
    }
    setActiveHelpTab(item.section)
  }

  const panelStyle = {
    position: 'absolute', top: 'calc(100% + 12px)', right: -10,
    zIndex: 100, overflow: 'hidden',
    background: 'rgba(16,16,24,0.97)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    backdropFilter: 'blur(20px)',
  }

  return (
    <header className="layout-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={onMenuClick} style={{ display: window.innerWidth < 1024 ? 'block' : 'none', color: 'var(--text-primary)' }}>
          <Menu size={24} />
        </button>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>{getTitle()}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Search */}
        <div style={{ position: 'relative', display: window.innerWidth < 768 ? 'none' : 'block' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search..." style={{ padding: '8px 16px 8px 36px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', width: '200px', color: 'var(--text-primary)', outline: 'none' }} />
        </div>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); setShowHelp(false) }}
            style={{ color: showNotifications ? 'var(--accent-cyan)' : 'var(--text-secondary)', position: 'relative', transition: 'color var(--transition-fast)' }}>
            <Bell size={20} />
            <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: 'var(--accent-cyan)', borderRadius: '50%', boxShadow: 'var(--shadow-glow)' }} />
          </button>
          {showNotifications && (
            <div className="animate-scale-in" style={{ ...panelStyle, width: '320px', padding: 0 }}>
              <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Notifications</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', cursor: 'pointer' }}>Mark all as read</span>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: n.unread ? 'rgba(34,211,238,0.05)' : 'transparent', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseOut={e => e.currentTarget.style.background = n.unread ? 'rgba(34,211,238,0.05)' : 'transparent'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: n.unread ? 700 : 500, color: 'var(--text-primary)' }}>{n.title}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{n.desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}>View all notifications</span>
              </div>
            </div>
          )}
        </div>

        {/* Help Desk */}
        <div ref={helpRef} style={{ position: 'relative' }}>
          <button onClick={() => { setShowHelp(!showHelp); setShowNotifications(false); setShowProfile(false) }}
            style={{ color: showHelp ? 'var(--accent-cyan)' : 'var(--text-secondary)', transition: 'color var(--transition-fast)' }}>
            <HelpCircle size={20} />
          </button>

          {showHelp && (
            <div className="animate-scale-in" style={{ ...panelStyle, width: '340px', padding: 0 }}>
              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {activeHelpTab !== 'menu' && (
                  <button onClick={() => setActiveHelpTab('menu')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px 6px 2px 0' }}>
                    ← 
                  </button>
                )}
                <HelpCircle size={16} style={{ color: 'var(--accent-cyan)' }} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Help & Resources</h3>
              </div>

              {/* Menu View */}
              {activeHelpTab === 'menu' && (
                <div style={{ padding: '8px' }}>
                  {helpItems.map(item => {
                    const hasContent = item.section && (helpContent[item.section]?.content || helpContent[item.section]?.video_url)
                    return (
                      <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px', borderRadius: '8px' }}>
                        <button
                          onClick={() => handleHelpItemClick(item)}
                          style={{ flex: 1, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', background: 'transparent', border: 'none', textAlign: 'left' }}
                          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                        >
                          <item.icon size={16} style={{ flexShrink: 0, color: item.key === 'chatbot' ? '#7c3aed' : 'inherit' }} />
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {hasContent && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} title="Content available" />}
                          {item.key === 'chatbot' && (
                            <span style={{ fontSize: '0.65rem', background: 'rgba(124,58,237,0.2)', color: '#a78bfa', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>AI</span>
                          )}
                        </button>
                        {/* Admin edit button — only visible to admin users */}
                        {isAdmin && item.section && (
                          <button
                            onClick={() => setEditModal(item.section)}
                            title={`Edit ${item.label}`}
                            style={{ padding: '6px', borderRadius: '6px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s', flexShrink: 0 }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.3)'; e.currentTarget.style.color = '#c4b5fd' }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; e.currentTarget.style.color = '#a78bfa' }}
                          >
                            <Pencil size={13} />
                          </button>
                        )}
                      </div>
                    )
                  })}

                  <div style={{ margin: '8px 6px 4px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                    <button
                      onClick={() => { setShowHelp(false); navigate('/setup') }}
                      style={{ width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', background: 'transparent', border: 'none', textAlign: 'left' }}
                      onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                      onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                    >
                      <Settings size={16} /> Contact Support
                    </button>
                  </div>
                </div>
              )}

              {/* Content View (Documentation / FAQ) */}
              {(activeHelpTab === 'documentation' || activeHelpTab === 'faq') && (
                <div style={{ padding: '20px' }}>
                  <h4 style={{ margin: '0 0 12px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>
                    {helpContent[activeHelpTab]?.title || (activeHelpTab === 'documentation' ? 'Documentation' : 'FAQ')}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxHeight: '280px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                    {helpContent[activeHelpTab]?.content || (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {isAdmin ? 'No content yet. Click the ✏️ edit button to add content.' : 'Content coming soon.'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Video Tutorial View */}
              {activeHelpTab === 'video_tutorial' && (
                <div style={{ padding: '20px' }}>
                  <h4 style={{ margin: '0 0 12px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>
                    {helpContent['video_tutorial']?.title || 'Video Tutorial'}
                  </h4>
                  {helpContent['video_tutorial']?.video_url ? (
                    <>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 16px' }}>{helpContent['video_tutorial']?.content}</p>
                      <button onClick={() => setVideoModal({ url: helpContent['video_tutorial'].video_url, title: helpContent['video_tutorial']?.title || 'Video Tutorial' })} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Play size={18} /> Watch Tutorial
                      </button>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                      {isAdmin ? 'No video uploaded yet. Click ✏️ to upload a tutorial video.' : 'Tutorial video coming soon!'}
                    </div>
                  )}
                </div>
              )}

              {/* AI Chatbot */}
              {activeHelpTab === 'chat' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '380px' }}>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {chatMessages.map((msg, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                        {msg.from === 'bot' && (
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '8px' }}>
                            <Bot size={14} style={{ color: '#fff' }} />
                          </div>
                        )}
                        <div style={{ maxWidth: '78%', padding: '10px 14px', borderRadius: msg.from === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px', background: msg.from === 'user' ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '0.82rem', lineHeight: 1.55, border: msg.from === 'bot' ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '8px' }}>
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') sendChat() }}
                      placeholder="Ask me anything..."
                      style={{ flex: 1, padding: '9px 14px', borderRadius: '20px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', fontSize: '0.83rem', outline: 'none' }}
                    />
                    <button onClick={sendChat} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        {user && (
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setShowHelp(false) }}
              style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--grad-primary)', border: showProfile ? '2px solid var(--accent-cyan)' : '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#fff', transition: 'border var(--transition-fast)', cursor: 'pointer' }}>
              {user.username.charAt(0).toUpperCase()}
            </button>
            {showProfile && (
              <div className="animate-scale-in" style={{ ...panelStyle, width: '240px', padding: 0 }}>
                <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>{isAdmin ? 'Admin Account' : 'Creator Account'}</div>
                  </div>
                </div>
                <div style={{ padding: '8px' }}>
                  <button onClick={() => { setShowProfile(false); navigate('/setup') }} style={{ width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', background: 'transparent', border: 'none' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-primary)' }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                    <User size={16} /> My Profile
                  </button>
                  <button onClick={() => { setShowProfile(false); navigate('/setup') }} style={{ width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', background: 'transparent', border: 'none' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-primary)' }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                    <Settings size={16} /> Account Settings
                  </button>
                </div>
                <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <button onClick={handleLogout} style={{ width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--danger)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', background: 'transparent', border: 'none' }} onMouseOver={e => e.currentTarget.style.background = 'var(--danger-dim)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal for Help Sections */}
      {editModal && (
        <EditHelpModal
          section={editModal}
          current={helpContent[editModal]}
          onSave={handleSaveHelp}
          onClose={() => setEditModal(null)}
          loading={saving}
        />
      )}

      {/* Video Playback Modal */}
      {videoModal && (
        <VideoModal url={videoModal.url} title={videoModal.title} onClose={() => setVideoModal(null)} />
      )}

      <style>{`
        .animate-scale-in {
          animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: top right;
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </header>
  )
}
