import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { AuthContext } from './AuthContext'

export const OnboardingContext = createContext(null)

/*
  STEP PROGRESSION:
  -1  = T&C not yet accepted (everything locked except Overview)
   0  = T&C accepted → Configuration unlocked
   1  = Configuration visited → Upload Video unlocked
   2  = Video uploaded/Upload page visited → Gallery unlocked
   3  = Gallery visited → Analytics unlocked
   4  = All complete (fully unlocked)
*/

const STORAGE_KEY = (username) => `onboarding_${username}`

const DEFAULT_STATE = { step: -1, termsAccepted: false }

export function OnboardingProvider({ children }) {
  const { user } = useContext(AuthContext)
  const [onboarding, setOnboarding] = useState(DEFAULT_STATE)
  const [showTerms, setShowTerms] = useState(false)

  // Load saved state whenever user changes
  useEffect(() => {
    if (!user?.username) return
    
    // Admins skip onboarding entirely
    if (user.is_staff || user.is_superuser) {
      setOnboarding({ step: 4, termsAccepted: true })
      setShowTerms(false)
      return
    }

    const saved = localStorage.getItem(STORAGE_KEY(user.username))
    if (saved) {
      const parsed = JSON.parse(saved)
      setOnboarding(parsed)
      setShowTerms(!parsed.termsAccepted)
    } else {
      setOnboarding(DEFAULT_STATE)
      setShowTerms(true)
    }
  }, [user?.username])

  const persist = useCallback((state) => {
    if (user?.username) {
      localStorage.setItem(STORAGE_KEY(user.username), JSON.stringify(state))
    }
  }, [user?.username])

  const acceptTerms = useCallback(() => {
    const next = { step: 0, termsAccepted: true }
    setOnboarding(next)
    setShowTerms(false)
    persist(next)
  }, [persist])

  const advanceStep = useCallback((toStep) => {
    setOnboarding(prev => {
      if (toStep > prev.step) {
        const next = { ...prev, step: toStep }
        persist(next)
        return next
      }
      return prev
    })
  }, [persist])

  // Determine which paths are unlocked based on current step
  const unlockedPaths = (step) => {
    const base = ['/dashboard']  // always unlocked
    if (step >= 0) base.push('/setup')
    if (step >= 1) base.push('/workspace')
    if (step >= 2) base.push('/gallery')
    if (step >= 3) base.push('/analytics')
    return base
  }

  const isPathUnlocked = useCallback((path) => {
    // Admin: always unlocked
    if (user?.is_staff || user?.is_superuser) return true
    return unlockedPaths(onboarding.step).includes(path)
  }, [onboarding.step, user])

  const currentStep = onboarding.step
  const termsAccepted = onboarding.termsAccepted

  return (
    <OnboardingContext.Provider value={{ currentStep, termsAccepted, showTerms, isPathUnlocked, acceptTerms, advanceStep, setShowTerms }}>
      {children}
    </OnboardingContext.Provider>
  )
}
