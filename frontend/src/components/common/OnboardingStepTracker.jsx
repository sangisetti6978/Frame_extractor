/**
 * OnboardingStepTracker - Invisible component that advances onboarding step when a page is visited.
 * Import and use at the top of each gated page.
 *
 * Usage: <OnboardingStepTracker step={1} />
 *
 * Steps:
 *  0 = T&C accepted (Configuration unlocked)
 *  1 = Configuration visited (Upload Video unlocked)
 *  2 = Upload Video visited (Gallery unlocked)
 *  3 = Gallery visited (Analytics unlocked)
 *  4 = All unlocked
 */
import { useEffect, useContext } from 'react'
import { OnboardingContext } from '../../context/OnboardingContext'

export default function OnboardingStepTracker({ step }) {
  const ctx = useContext(OnboardingContext)
  useEffect(() => {
    if (ctx && ctx.advanceStep) {
      ctx.advanceStep(step)
    }
  }, [step])
  return null
}
