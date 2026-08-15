import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { aiApi } from '../services/videoApi'

export default function AiHelp() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi there! I am the FrameExtractor AI Assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await aiApi.askQuestion(userMessage)
      setMessages(prev => [...prev, { role: 'ai', content: response.data.answer }])
    } catch (err) {
      console.error('AI Error:', err)
      const errorMsg = err.response?.data?.error || err.response?.data?.answer || 'Failed to connect to the AI service. Please check your backend settings.'
      setMessages(prev => [...prev, { role: 'error', content: errorMsg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <div style={{ padding: '32px 0 24px' }}>
        <h1 className="h1" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sparkles className="icon-gradient" size={32} />
          AI Assistant
        </h1>
        <p className="subtitle">Ask anything about FrameExtractor Studio and how to use it.</p>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(23, 23, 30, 0.4)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        
        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}>
              {/* Avatar */}
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: msg.role === 'ai' ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : 
                            msg.role === 'user' ? 'var(--bg-surface-elevated)' : '#ef4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                border: '1px solid var(--border-strong)'
              }}>
                {msg.role === 'ai' && <Bot size={18} color="#fff" />}
                {msg.role === 'user' && <User size={18} color="var(--text-secondary)" />}
                {msg.role === 'error' && <AlertCircle size={18} color="#fff" />}
              </div>

              {/* Message Bubble */}
              <div style={{
                maxWidth: '75%',
                padding: '12px 18px',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                background: msg.role === 'user' ? 'var(--accent-purple)' : 
                            msg.role === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-surface)',
                color: msg.role === 'user' ? '#fff' : 
                       msg.role === 'error' ? 'var(--danger)' : 'var(--text-primary)',
                border: msg.role === 'error' ? '1px solid rgba(239, 68, 68, 0.3)' : 
                        msg.role !== 'user' ? '1px solid var(--border-subtle)' : 'none',
                boxShadow: msg.role === 'user' ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none'
              }}>
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} style={{ margin: i > 0 ? '8px 0 0' : 0 }}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Bot size={18} color="#fff" />
              </div>
              <div style={{
                background: 'var(--bg-surface)', padding: '12px 18px', borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <Loader2 size={16} className="animate-spin" color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: '16px 24px',
          background: 'var(--bg-surface-elevated)',
          borderTop: '1px solid var(--border-strong)'
        }}>
          <form onSubmit={handleSubmit} style={{
            display: 'flex', gap: '12px', background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-full)', padding: '6px 6px 6px 20px',
            border: '1px solid var(--border-strong)',
            transition: 'border-color var(--transition-fast)'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me how to extract frames, where files are saved, etc..."
              disabled={loading}
              style={{
                flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)',
                fontSize: '0.95rem', outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: input.trim() && !loading ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)' : 'var(--bg-surface-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: input.trim() && !loading ? '#fff' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                border: 'none'
              }}
            >
              <Send size={18} style={{ marginLeft: '2px' }} />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
