import { createContext, useState, useEffect } from 'react'
import authApi from '../services/authApi'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token')
    if (token) {
      setIsAuthenticated(true)
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    }
    setLoading(false)
  }, [])

  const register = async (username, email, password) => {
    try {
      const response = await authApi.register(username, email, password)
      const { user: userData, access, refresh } = response.data
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      setIsAuthenticated(true)
      return userData
    } catch (error) {
      console.error('Registration error:', error)
      console.error('Error response:', error.response?.data)
      const errorMsg = error.response?.data?.error || error.message || 'Registration failed'
      throw errorMsg
    }
  }

  const login = async (username, password) => {
    try {
      const response = await authApi.login(username, password)
      const { user: userData, access, refresh } = response.data
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      setIsAuthenticated(true)
      return userData
    } catch (error) {
      console.error('Login error:', error)
      console.error('Error response:', error.response?.data)
      const errorMsg = error.response?.data?.error || error.message || 'Login failed'
      throw errorMsg
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    authApi.logout()
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}
