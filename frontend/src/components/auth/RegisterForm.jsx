import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

/* ─── SVG icons ─── */
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/>
  </svg>
)
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)
const ShieldCheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
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
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const st = {
  inputWrap: { position: 'relative' },
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
  success: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#6ee7b7',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
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
  strengthRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px',
  },
  strengthBar: {
    flex: 1,
    height: '4px',
    borderRadius: '4px',
    background: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  strengthFill: (pct, color) => ({
    height: '100%',
    width: `${pct}%`,
    borderRadius: '4px',
    background: color,
    transition: 'all 0.3s',
  }),
  strengthText: (color) => ({
    fontSize: '0.75rem',
    fontWeight: 700,
    color,
    minWidth: '50px',
  }),
  requirements: {
    fontSize: '0.75rem',
    color: 'rgba(240,240,245,0.35)',
    marginTop: '8px',
    lineHeight: 1.8,
  },
  reqMet: { color: '#6ee7b7' },
  reqNotMet: { color: 'rgba(240,240,245,0.25)' },
  terms: {
    fontSize: '0.75rem',
    color: 'rgba(240,240,245,0.3)',
    textAlign: 'center',
    lineHeight: 1.6,
    marginTop: '16px',
  },
}

/* Style injection */
const formStyleSheet = `
.pro-input:focus {
  border-color: rgba(124,58,237,0.5) !important;
  background: rgba(255,255,255,0.07) !important;
  box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important;
}
.pro-input::placeholder {
  color: rgba(240,240,245,0.25);
}
.pro-input.pro-input-match:focus {
  border-color: rgba(52,211,153,0.5) !important;
  box-shadow: 0 0 0 3px rgba(52,211,153,0.12) !important;
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
@keyframes spin {
  to { transform: rotate(360deg); }
}
`

export default function RegisterForm() {
  const navigate = useNavigate()
  const { register } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  useEffect(() => {
    const id = 'pro-form-styles'
    if (!document.getElementById(id)) {
      const el = document.createElement('style')
      el.id = id
      el.textContent = formStyleSheet
      document.head.appendChild(el)
    }
  }, [])

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[!@#$%^&*]/.test(password)) strength++
    return Math.min(strength, 4)
  }

  const getStrengthColor = () => {
    const colors = ['#f87171', '#fb923c', '#fbbf24', '#6ee7b7']
    return colors[passwordStrength - 1] || 'rgba(255,255,255,0.1)'
  }

  const getStrengthText = () => {
    const texts = ['Weak', 'Fair', 'Good', 'Strong']
    return texts[passwordStrength - 1] || ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required'
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
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
      console.log('Attempting registration with:', { username: formData.username, email: formData.email })
      const response = await register(formData.username, formData.email, formData.password)
      console.log('Registration successful:', response)
      // Give the context a moment to update before navigating
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('Navigating to setup...')
      navigate('/setup')
    } catch (err) {
      console.error('Registration error caught:', err)
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Registration failed. Please try again.'
      setErrors({ submit: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  const pwMatch = formData.confirmPassword && formData.password === formData.confirmPassword
  const pwMismatch = formData.confirmPassword && formData.password !== formData.confirmPassword

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Username */}
      <div>
        <label style={st.label}>Username</label>
        <div style={st.inputWrap}>
          <div style={st.iconLeft}><UserIcon /></div>
          <input type="text" name="username" value={formData.username} onChange={handleChange}
            style={st.input} className="pro-input" placeholder="Choose your username" />
        </div>
        {errors.username && <p style={st.error}>{errors.username}</p>}
      </div>

      {/* Email */}
      <div>
        <label style={st.label}>Email</label>
        <div style={st.inputWrap}>
          <div style={st.iconLeft}><MailIcon /></div>
          <input type="email" name="email" value={formData.email} onChange={handleChange}
            style={st.input} className="pro-input" placeholder="your@email.com" />
        </div>
        {errors.email && <p style={st.error}>{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label style={st.label}>Password</label>
        <div style={st.inputWrap}>
          <div style={st.iconLeft}><LockIcon /></div>
          <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
            onChange={handleChange} style={st.input} className="pro-input" placeholder="Create a strong password" />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            style={st.eyeBtn} className="pro-eye-btn">
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

        {formData.password && (
          <>
            <div style={st.strengthRow}>
              <div style={st.strengthBar}>
                <div style={st.strengthFill((passwordStrength / 4) * 100, getStrengthColor())} />
              </div>
              <span style={st.strengthText(getStrengthColor())}>{getStrengthText()}</span>
            </div>
            <div style={st.requirements}>
              <span style={formData.password.length >= 8 ? st.reqMet : st.reqNotMet}>
                {formData.password.length >= 8 ? '✓' : '○'} 8+ chars
              </span>
              {' · '}
              <span style={/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? st.reqMet : st.reqNotMet}>
                {/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? '✓' : '○'} Mixed case
              </span>
              {' · '}
              <span style={/[0-9]/.test(formData.password) ? st.reqMet : st.reqNotMet}>
                {/[0-9]/.test(formData.password) ? '✓' : '○'} Number
              </span>
              {' · '}
              <span style={/[!@#$%^&*]/.test(formData.password) ? st.reqMet : st.reqNotMet}>
                {/[!@#$%^&*]/.test(formData.password) ? '✓' : '○'} Special
              </span>
            </div>
          </>
        )}
        {errors.password && <p style={st.error}>{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label style={st.label}>Confirm Password</label>
        <div style={st.inputWrap}>
          <div style={st.iconLeft}>
            {pwMatch ? <ShieldCheckIcon /> : <LockIcon />}
          </div>
          <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
            value={formData.confirmPassword} onChange={handleChange}
            style={{
              ...st.input,
              ...(pwMatch ? { borderColor: 'rgba(52,211,153,0.4)' } : {}),
            }}
            className={`pro-input ${pwMatch ? 'pro-input-match' : ''}`}
            placeholder="Re-enter your password" />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={st.eyeBtn} className="pro-eye-btn">
            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {pwMatch && <p style={st.success}><CheckIcon /> Passwords match</p>}
        {pwMismatch && <p style={st.error}>Passwords do not match</p>}
        {errors.confirmPassword && <p style={st.error}>{errors.confirmPassword}</p>}
      </div>

      {/* Submit error */}
      {errors.submit && <div style={st.submitError}>{errors.submit}</div>}

      {/* Submit */}
      <button type="submit" disabled={loading} style={st.submitBtn} className="pro-submit-btn">
        {loading ? (
          <><SpinnerIcon /> Creating account...</>
        ) : (
          <>Create Account <ArrowIcon /></>
        )}
      </button>

      <p style={st.terms}>
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  )
}
