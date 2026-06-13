import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

export default function RegisterForm() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()

  const calculatePasswordStrength = (password) => {
    if (!password) return 0
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    return Math.min(strength, 4)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await register(formData.username, formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = () => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500']
    return colors[passwordStrength - 1] || 'bg-gray-500'
  }

  const getStrengthText = () => {
    const texts = ['Weak', 'Fair', 'Good', 'Strong']
    return texts[passwordStrength - 1] || 'Too short'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="animate-shake bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-100 p-4 rounded-xl text-sm flex items-start gap-3 shadow-lg">
          <span className="text-lg mt-0.5">⚠️</span>
          <div>
            <p className="font-semibold">Registration Error</p>
            <p className="text-red-200/80">{error}</p>
          </div>
        </div>
      )}
      
      {/* Username Field */}
      <div className="group">
        <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">Username</label>
        <div className={`relative transition-all duration-300 ${focusedField === 'username' ? 'scale-105' : ''}`}>
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 text-purple-300 group-focus-within:text-purple-400 transition-colors">
            👤
          </div>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
            disabled={loading}
            required
            minLength="3"
            placeholder="Choose a unique username"
            className="w-full bg-gradient-to-r from-white/10 to-white/5 border border-white/20 hover:border-white/30 rounded-xl px-4 pl-12 py-3 text-white placeholder-purple-200/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="group">
        <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">Email Address</label>
        <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-105' : ''}`}>
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 text-purple-300 group-focus-within:text-purple-400 transition-colors">
            ✉️
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            disabled={loading}
            required
            placeholder="your@email.com"
            className="w-full bg-gradient-to-r from-white/10 to-white/5 border border-white/20 hover:border-white/30 rounded-xl px-4 pl-12 py-3 text-white placeholder-purple-200/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="group">
        <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">Password</label>
        <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-105' : ''}`}>
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 text-purple-300 group-focus-within:text-purple-400 transition-colors">
            🔐
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            disabled={loading}
            required
            minLength="8"
            placeholder="At least 8 characters"
            className="w-full bg-gradient-to-r from-white/10 to-white/5 border border-white/20 hover:border-white/30 rounded-xl px-4 pl-12 pr-12 py-3 text-white placeholder-purple-200/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-0 bottom-0 flex items-center pr-4 text-purple-300 hover:text-purple-200 transition-colors"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="mt-2.5 space-y-1.5 animate-fade-in">
            <div className="flex justify-between items-center">
              <span className="text-xs text-purple-200/70">Password Strength</span>
              <span className={`text-xs font-bold ${passwordStrength >= 3 ? 'text-lime-400' : passwordStrength === 2 ? 'text-yellow-400' : 'text-orange-400'}`}>
                {getStrengthText()}
              </span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${getStrengthColor()} transition-all duration-300 rounded-full shadow-lg`}
                style={{ width: `${(passwordStrength / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="group">
        <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">Confirm Password</label>
        <div className={`relative transition-all duration-300 ${focusedField === 'confirmPassword' ? 'scale-105' : ''}`}>
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 text-purple-300 group-focus-within:text-purple-400 transition-colors">
            ✓
          </div>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onFocus={() => setFocusedField('confirmPassword')}
            onBlur={() => setFocusedField(null)}
            disabled={loading}
            required
            placeholder="Re-enter your password"
            className="w-full bg-gradient-to-r from-white/10 to-white/5 border border-white/20 hover:border-white/30 rounded-xl px-4 pl-12 py-3 text-white placeholder-purple-200/40 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm"
          />
        </div>
        {formData.confirmPassword && (
          <div className="mt-1.5 text-xs">
            {formData.password === formData.confirmPassword ? (
              <span className="text-lime-400 font-semibold flex items-center gap-1">✓ Passwords match</span>
            ) : (
              <span className="text-orange-400 font-semibold flex items-center gap-1">⚠ Passwords don't match</span>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !formData.username || !formData.email || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
        className="w-full mt-8 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:via-purple-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0 backdrop-blur-sm border border-purple-400/20 hover:border-purple-300/40"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-purple-200 border-t-white rounded-full animate-spin"></span>
            Creating Account...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            🚀 Create Account
          </span>
        )}
      </button>

      {/* Terms */}
      <p className="text-center text-xs text-purple-200/60 leading-relaxed">
        By signing up, you agree to our<br />
        <span className="text-purple-300 hover:text-purple-200 cursor-pointer transition-colors">Terms & Conditions</span>
      </p>
    </form>
  )
}
