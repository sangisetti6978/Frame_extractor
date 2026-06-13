import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

/* ─── SVG icons ─── */
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)
const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const SpinnerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
    <path d="M21 12a9 9 0 11-6.219-8.56"/>
  </svg>
)

const st = {
  inputWrap: {
    position: 'relative',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'rgba(240,240,245,0.55)',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  iconLeft: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(240,240,245,0.35)',
    pointerEvents: 'none',
    transition: 'color 0.25s',
  },
  input: {
    width: '100%',
    padding: '14px 48px 14px 48px',
    borderRadius: '14px',
    border: '1.5px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    color: '#f0f0f5',
    fontSize: '0.95rem',
    fontWeight: 500,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'rgba(240,240,245,0.35)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    transition: 'color 0.2s',
  },
  error: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#f87171',
    marginTop: '6px',
  },
  rememberRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '4px',
  },
  checkWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    borderRadius: '5px',
    accentColor: '#7c3aed',
    cursor: 'pointer',
  },
  checkLabel: {
    fontSize: '0.85rem',
    color: 'rgba(240,240,245,0.5)',
    cursor: 'pointer',
  },
  forgot: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#a78bfa',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s',
    textDecoration: 'none',
  },
  submitBtn: {
    width: '100%',
    padding: '15px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 8px 28px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
    marginTop: '8px',
  },
  submitError: {
    padding: '12px 16px',
    borderRadius: '12px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#fca5a5',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  terms: {
    fontSize: '0.75rem',
    color: 'rgba(240,240,245,0.3)',
    textAlign: 'center',
    lineHeight: 1.6,
    marginTop: '16px',
  },
}

/* Injected styles */
const formStyleSheet = `
.pro-input:focus {
  border-color: rgba(124,58,237,0.5) !important;
  background: rgba(255,255,255,0.07) !important;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important;
}
.pro-input::placeholder {
  color: rgba(240,240,245,0.25);
}
.pro-input:focus ~ .pro-input-icon {
  color: #a78bfa !important;
}
.pro-eye-btn:hover {
  color: rgba(240,240,245,0.7) !important;
}
.pro-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 36px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.2) !important;
}
.pro-submit-btn:active:not(:disabled) {
  transform: translateY(0);
}
.pro-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.pro-forgot:hover {
  color: #c4b5fd !important;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
`

export default function LoginForm() {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    const id = 'pro-form-styles'
    if (!document.getElementById(id)) {
      const el = document.createElement('style')
      el.id = id
      el.textContent = formStyleSheet
      document.head.appendChild(el)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (!formData.password) newErrors.password = 'Password is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      console.log('Attempting login with:', formData.username)
      const userData = await login(formData.username, formData.password)
      console.log('Login successful, user:', userData)
      // Give the context a moment to update before navigating
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('Navigating to setup...')
      navigate('/setup')
    } catch (err) {
      console.error('Login error caught:', err)
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Login failed. Please check your credentials.'
      setErrors({ submit: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Username */}
      <div>
        <label style={st.label}>Username</label>
        <div style={st.inputWrap}>
          <div style={st.iconLeft} className="pro-input-icon"><UserIcon /></div>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            style={st.input}
            className="pro-input"
            placeholder="Enter your username"
          />
        </div>
        {errors.username && <p style={st.error}>{errors.username}</p>}
      </div>

      {/* Password */}
      <div>
        <div style={st.rememberRow}>
          <label style={st.label}>Password</label>
          <a href="#" style={st.forgot} className="pro-forgot">Forgot password?</a>
        </div>
        <div style={st.inputWrap}>
          <div style={st.iconLeft} className="pro-input-icon"><LockIcon /></div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={st.input}
            className="pro-input"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={st.eyeBtn}
            className="pro-eye-btn"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {errors.password && <p style={st.error}>{errors.password}</p>}
      </div>

      {/* Remember me */}
      <div style={st.checkWrap}>
        <input type="checkbox" id="remember" style={st.checkbox} />
        <label htmlFor="remember" style={st.checkLabel}>Remember me for 30 days</label>
      </div>

      {/* Submit error */}
      {errors.submit && <div style={st.submitError}>{errors.submit}</div>}

      {/* Submit */}
      <button type="submit" disabled={loading} style={st.submitBtn} className="pro-submit-btn">
        {loading ? (
          <><SpinnerIcon /> Signing in...</>
        ) : (
          <>Sign In <ArrowIcon /></>
        )}
      </button>

      <p style={st.terms}>
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  )
}
