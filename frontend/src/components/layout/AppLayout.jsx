import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import TermsModal from '../common/TermsModal'
import { OnboardingProvider, OnboardingContext } from '../../context/OnboardingContext'

function AppLayoutInner({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { showTerms, acceptTerms } = useContext(OnboardingContext)

  return (
    <div className="layout-container">
      {/* Terms & Conditions Gate */}
      {showTerms && <TermsModal onAccept={acceptTerms} />}

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 40 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className="layout-sidebar"
        style={{
          width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          position: window.innerWidth < 1024 ? 'fixed' : 'relative',
          transform: window.innerWidth < 1024 && !isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="layout-main">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AppLayout({ children }) {
  return (
    <OnboardingProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </OnboardingProvider>
  )
}
