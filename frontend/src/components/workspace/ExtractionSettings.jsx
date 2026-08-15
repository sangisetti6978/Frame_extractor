import React, { useState } from 'react'
import { Settings2, Cpu, Sliders, Image as ImageIcon } from 'lucide-react'

export default function ExtractionSettings({ settings, setSettings }) {
  const [activeTab, setActiveTab] = useState('interval')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 className="h3" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Settings2 size={20} /> Extraction Settings
        </h3>
        <p className="small">Configure how AI processes your video.</p>
      </div>

      <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Detection Mode */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>
            <Cpu size={16} /> Detection Mode
          </label>
          <div style={{ display: 'flex', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: '4px' }}>
            {['interval', 'scene'].map(mode => (
              <button
                key={mode}
                onClick={() => setActiveTab(mode)}
                style={{
                  flex: 1, padding: '8px 12px', fontSize: '0.85rem', fontWeight: 600,
                  borderRadius: 'var(--radius-sm)', textTransform: 'capitalize',
                  background: activeTab === mode ? 'var(--bg-surface-elevated)' : 'transparent',
                  color: activeTab === mode ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === mode ? 'var(--shadow-sm)' : 'none',
                  border: `1px solid ${activeTab === mode ? 'var(--border-strong)' : 'transparent'}`
                }}
              >
                {mode === 'interval' ? 'Interval' : 'AI Scene'}
              </button>
            ))}
          </div>
        </div>

        {/* Frames to Extract / Interval */}
        {activeTab === 'interval' && (
          <div className="animate-fade-in">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Sliders size={16} /> Extract Interval</span>
              <span style={{ color: 'var(--accent-cyan)' }}>{settings.interval} sec</span>
            </label>
            <input 
              type="range" 
              min="1" max="100" 
              value={settings.interval || 5}
              onChange={(e) => setSettings({ ...settings, interval: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              <span>1s</span>
              <span>50s</span>
              <span>100s</span>
            </div>
          </div>
        )}

        {/* Format */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>
            <ImageIcon size={16} /> Format
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {['JPG', 'PNG', 'WEBP'].map(format => (
              <button
                key={format}
                onClick={() => setSettings({ ...settings, format })}
                style={{
                  padding: '10px', fontSize: '0.85rem', fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  background: settings.format === format ? 'var(--accent-purple-dim)' : 'var(--bg-surface)',
                  color: settings.format === format ? 'var(--accent-purple)' : 'var(--text-muted)',
                  border: `1px solid ${settings.format === format ? 'var(--accent-purple)' : 'var(--border-subtle)'}`
                }}
              >
                {format}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { id: 'remove_duplicates', label: 'Remove Duplicate Frames', desc: 'AI filters identical scenes' },
            { id: 'smart_selection', label: 'Smart Selection', desc: 'Prioritize blurry-free frames' }
          ].map(toggle => (
            <label key={toggle.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{toggle.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{toggle.desc}</div>
              </div>
              <div style={{
                width: '40px', height: '24px', borderRadius: '12px',
                background: settings[toggle.id] ? 'var(--accent-cyan)' : 'var(--bg-surface-elevated)',
                border: `1px solid ${settings[toggle.id] ? 'var(--accent-cyan)' : 'var(--border-strong)'}`,
                position: 'relative', transition: 'all var(--transition-fast)'
              }}
              onClick={() => setSettings({ ...settings, [toggle.id]: !settings[toggle.id] })}>
                <div style={{
                  position: 'absolute', top: '2px', left: settings[toggle.id] ? '18px' : '2px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: '#fff', transition: 'left var(--transition-fast)'
                }} />
              </div>
            </label>
          ))}
        </div>

      </div>
    </div>
  )
}
