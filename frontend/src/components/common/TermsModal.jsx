import React, { useState, useEffect } from 'react'
import { CheckCircle, Shield, AlertCircle } from 'lucide-react'

const TERMS_TEXT = `AUTOFRAME EXTRACTOR — TERMS & CONDITIONS

Last updated: August 2026

1. ACCEPTANCE OF TERMS
By accessing and using AutoFrame Extractor ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree, you may not use the Platform.

2. DESCRIPTION OF SERVICE
AutoFrame Extractor is a professional video frame extraction tool powered by FFmpeg and OpenCV ML. The Platform allows users to upload video content, automatically extract and analyze frames, apply blur detection, and manage a personal frame library.

3. USER ACCOUNTS & RESPONSIBILITY
• You are responsible for maintaining the confidentiality of your login credentials.
• You must not share your account with others.
• You are solely responsible for all activities under your account.
• You must notify us immediately of any unauthorized account use.

4. ACCEPTABLE USE POLICY
You agree NOT to:
• Upload content that infringes on copyrights, trademarks, or intellectual property rights of third parties.
• Use the Platform for any unlawful, harmful, or malicious purpose.
• Attempt to reverse-engineer, disassemble, or tamper with the Platform's code or algorithms.
• Upload malicious files, scripts, or content that could harm other users or the system.
• Use automated bots or scripts to interact with the Platform in unauthorized ways.

5. INTELLECTUAL PROPERTY
All extracted frames, project data, and content you create remain your property. The Platform retains no ownership of your uploaded videos or generated frames. AutoFrame Extractor's interface, algorithms, and design are proprietary.

6. DATA PRIVACY & STORAGE
• Your videos and extracted frames are stored securely on our servers.
• We do not sell or share your personal data with third parties.
• You may request deletion of your data at any time from your account settings.
• Usage analytics may be collected in an anonymized form to improve the Platform.

7. LIMITATIONS OF LIABILITY
The Platform is provided "as is" without warranties of any kind. AutoFrame Extractor is not liable for:
• Data loss or corruption due to system errors.
• Inaccuracies in the AI-powered blur detection algorithm.
• Interruptions in service availability.

8. MODIFICATIONS TO SERVICE
We reserve the right to modify, suspend, or discontinue any part of the Platform at any time, with or without notice.

9. GOVERNING LAW
These Terms are governed by applicable laws. Any disputes shall be resolved through binding arbitration or the appropriate courts of jurisdiction.

10. CONTACT
For questions about these Terms, contact us through the Help Desk within the Platform.

By checking the box below and clicking "I Accept & Continue", you confirm that you have READ, UNDERSTOOD, and AGREE to all of these Terms and Conditions.`

export default function TermsModal({ onAccept }) {
  const [scrolled, setScrolled] = useState(false)
  const [checked, setChecked] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const handleScroll = (e) => {
    const el = e.target
    const progress = el.scrollTop / (el.scrollHeight - el.clientHeight)
    setScrollProgress(Math.min(progress * 100, 100))
    if (progress > 0.85) setScrolled(true)
  }

  const canAccept = scrolled && checked

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        width: '100%', maxWidth: '680px', maxHeight: '92vh',
        background: 'linear-gradient(160deg, #0e0e1a 0%, #0a0a14 100%)',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: '24px',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(124,58,237,0.08)',
        overflow: 'hidden',
        animation: 'termsSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}>

        {/* Header */}
        <div style={{ padding: '32px 36px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}>
              <Shield size={22} style={{ color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                Terms & Conditions
              </h1>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                Please read carefully before continuing
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Reading progress</span>
              <span style={{ fontSize: '0.72rem', color: scrolled ? '#10b981' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                {scrolled ? '✓ Fully read' : `${Math.round(scrollProgress)}%`}
              </span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${scrollProgress}%`, borderRadius: '99px', background: scrolled ? '#10b981' : 'linear-gradient(90deg, #7c3aed, #2563eb)', transition: 'width 0.3s, background 0.5s' }} />
            </div>
          </div>

          {!scrolled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '8px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px' }}>
              <AlertCircle size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
              <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Please scroll through and read all terms before accepting</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: 'auto', padding: '28px 36px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, whiteSpace: 'pre-wrap', fontFamily: "'Inter', sans-serif", scrollbarWidth: 'thin', scrollbarColor: 'rgba(124,58,237,0.4) transparent' }}
        >
          {TERMS_TEXT}
        </div>

        {/* Footer */}
        <div style={{ padding: '24px 36px 28px', borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)' }}>
          {/* Checkbox */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: scrolled ? 'pointer' : 'not-allowed', marginBottom: '20px' }}>
            <div
              onClick={() => scrolled && setChecked(!checked)}
              style={{
                width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, marginTop: '1px',
                border: `2px solid ${checked ? '#7c3aed' : scrolled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'}`,
                background: checked ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s', cursor: scrolled ? 'pointer' : 'not-allowed',
                opacity: scrolled ? 1 : 0.4,
              }}
            >
              {checked && <CheckCircle size={14} style={{ color: '#fff' }} />}
            </div>
            <span style={{ fontSize: '0.85rem', color: scrolled ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)', lineHeight: 1.5, transition: 'color 0.3s' }}>
              I have read and agree to the AutoFrame Extractor Terms & Conditions and Privacy Policy.
              {!scrolled && <span style={{ color: 'rgba(245,158,11,0.7)', display: 'block', fontSize: '0.75rem', marginTop: '4px' }}>↑ Scroll to the bottom first to enable this checkbox</span>}
            </span>
          </label>

          {/* Accept Button */}
          <button
            onClick={() => canAccept && onAccept()}
            disabled={!canAccept}
            style={{
              width: '100%', padding: '15px', borderRadius: '14px',
              background: canAccept ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'rgba(255,255,255,0.05)',
              color: canAccept ? '#fff' : 'rgba(255,255,255,0.25)',
              fontWeight: 700, fontSize: '1rem', border: canAccept ? 'none' : '1px solid rgba(255,255,255,0.08)',
              cursor: canAccept ? 'pointer' : 'not-allowed',
              transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
              boxShadow: canAccept ? '0 8px 24px rgba(124,58,237,0.4)' : 'none',
              transform: canAccept ? 'translateY(0)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}
            onMouseOver={e => { if (canAccept) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(124,58,237,0.5)' }}}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = canAccept ? '0 8px 24px rgba(124,58,237,0.4)' : 'none' }}
          >
            {canAccept ? (
              <><CheckCircle size={18} /> I Accept & Continue</>
            ) : (
              <>{scrolled && !checked ? '☐ Check the box above to continue' : '↑ Please read all terms to continue'}</>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes termsSlideIn {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
