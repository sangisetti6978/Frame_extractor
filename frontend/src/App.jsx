import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { UserProvider } from './context/UserContext'
import { ConfigProvider } from './context/ConfigContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AppLayout from './components/layout/AppLayout'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Workspace from './pages/Workspace'
import Projects from './pages/Projects'
import Gallery from './pages/Gallery'
import History from './pages/History'
import Analytics from './pages/Analytics'
import Setup from './pages/Setup'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import AiHelp from './pages/AiHelp'

// Wrapper for protected routes to include layout
const ProtectedLayout = () => (
  <ProtectedRoute>
    <AppLayout>
      <Outlet />
    </AppLayout>
  </ProtectedRoute>
)

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <ConfigProvider>
            <Routes>
              {/* Public Routes (No Sidebar) */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes (With Sidebar Layout) */}
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/workspace" element={<Workspace />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/history" element={<History />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/setup" element={<Setup />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/ai-help" element={<AiHelp />} />
              </Route>
              
              {/* Admin Routes */}
              <Route
                path="/admin-panel"
                element={
                  <AdminRoute>
                    <AppLayout>
                      <AdminPanel />
                    </AppLayout>
                  </AdminRoute>
                }
              />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </ConfigProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
