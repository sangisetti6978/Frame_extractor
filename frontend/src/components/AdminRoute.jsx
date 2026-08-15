import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

/**
 * AdminRoute — protects routes that only staff/superuser can access.
 * Any other authenticated user is silently redirected to the home page.
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useContext(AuthContext)

  if (loading) return null

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (!user?.is_staff && !user?.is_superuser) return <Navigate to="/" replace />

  return children
}
