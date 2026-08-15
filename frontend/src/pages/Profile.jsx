import { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import LoadingSpinner from '../components/common/LoadingSpinner'

const CSS_ID = 'pro-profile-css'
const profileCSS = `
@keyframes profFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.prof-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 24px;
  padding: 32px;
  backdrop-filter: blur(20px);
  transition: border-color 0.3s;
}
.prof-card:hover {
  border-color: rgba(255,255,255,0.1);
}
.prof-input {
  width: 100%;
  padding: 13px 16px;
  border-radius: 14px;
  border: 1.5px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: #f0f0f5;
  font-size: 0.95rem;
  font-family: 'Inter', -apple-system, sans-serif;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
}
.prof-input:focus {
  border-color: rgba(124,58,237,0.5) !important;
  background: rgba(255,255,255,0.07) !important;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important;
}
.prof-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.prof-input::placeholder {
  color: rgba(240,240,245,0.25);
}
.prof-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', -apple-system, sans-serif;
  box-shadow: 0 6px 20px rgba(124,58,237,0.35);
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
}
.prof-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(124,58,237,0.5) !important;
}
.prof-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: rgba(240,240,245,0.7);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Inter', -apple-system, sans-serif;
  transition: all 0.25s;
}
.prof-btn-secondary:hover {
  background: rgba(255,255,255,0.09) !important;
  color: #f0f0f5 !important;
}
`

function injectCSS() {
  if (typeof document !== 'undefined' && !document.getElementById(CSS_ID)) {
    const el = document.createElement('style')
    el.id = CSS_ID
    el.textContent = profileCSS
    document.head.appendChild(el)
  }
}

export default function Profile() {
  injectCSS()
  const { user, loading } = useContext(AuthContext)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    // TODO: Implement profile update API call
    setEditMode(false)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#050510',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <LoadingSpinner size={60} message="Loading Profile…" />
      </div>
    )
  }

  const initials = (user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 80% 70% at 50% -10%, rgba(124,58,237,0.1) 0%, #050510 60%)',
      color: '#f0f0f5',
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: '110px 24px 60px',
      animation: 'profFadeIn 0.6s ease both',
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '4px 12px', borderRadius: '999px',
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
            fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 6px rgba(167,139,250,0.8)' }} />
            Account
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>
            Profile
          </h1>
          <p style={{ color: 'rgba(240,240,245,0.4)', fontSize: '0.9rem', marginTop: '8px', marginBottom: 0 }}>
            Manage your account information and settings.
          </p>
        </div>

        {/* Avatar Card */}
        <div className="prof-card" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '22px', flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: 800, color: '#fff',
            boxShadow: '0 8px 28px rgba(124,58,237,0.4)',
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f0f0f5' }}>{displayName}</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(240,240,245,0.4)', marginTop: '4px' }}>{user?.email || 'No email set'}</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              marginTop: '8px', padding: '3px 10px', borderRadius: '999px',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
              fontSize: '0.72rem', fontWeight: 700, color: '#10b981',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
              Active
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="prof-card">
          <div style={{
            fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: '24px', paddingBottom: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            Account Details
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { label: 'Username', name: 'username', value: user?.username, disabled: true, type: 'text' },
              { label: 'Email', name: 'email', value: user?.email, disabled: true, type: 'email' },
              { label: 'First Name', name: 'first_name', value: formData.first_name, disabled: !editMode, type: 'text' },
              { label: 'Last Name', name: 'last_name', value: formData.last_name, disabled: !editMode, type: 'text' },
              { label: 'Phone', name: 'phone', value: formData.phone, disabled: !editMode, type: 'tel' },
            ].map(field => (
              <div key={field.name}>
                <label style={{
                  display: 'block', fontSize: '0.75rem', fontWeight: 700,
                  color: 'rgba(240,240,245,0.45)', textTransform: 'uppercase',
                  letterSpacing: '0.08em', marginBottom: '8px',
                }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={field.value || ''}
                  onChange={handleChange}
                  disabled={field.disabled}
                  className="prof-input"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </div>
            ))}

            {user?.created_at && (
              <div>
                <div style={{
                  fontSize: '0.75rem', fontWeight: 700,
                  color: 'rgba(240,240,245,0.45)', textTransform: 'uppercase',
                  letterSpacing: '0.08em', marginBottom: '8px',
                }}>
                  Member Since
                </div>
                <div style={{
                  padding: '13px 16px', borderRadius: '14px',
                  background: 'rgba(255,255,255,0.02)', border: '1.5px solid rgba(255,255,255,0.06)',
                  fontSize: '0.95rem', color: 'rgba(240,240,245,0.5)',
                }}>
                  {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{
              display: 'flex', gap: '12px', paddingTop: '8px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              {!editMode ? (
                <button className="prof-btn-primary" onClick={() => setEditMode(true)}>
                  ✏ Edit Profile
                </button>
              ) : (
                <>
                  <button className="prof-btn-primary" onClick={handleSave}>
                    ✓ Save Changes
                  </button>
                  <button className="prof-btn-secondary" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
