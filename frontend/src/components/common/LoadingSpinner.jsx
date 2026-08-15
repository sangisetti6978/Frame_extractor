export default function LoadingSpinner({ size = 60, message = '' }) {
  const css = `
    @keyframes lsRotate1 {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes lsRotate2 {
      from { transform: rotate(0deg); }
      to   { transform: rotate(-360deg); }
    }
    @keyframes lsRotate3 {
      from { transform: rotate(45deg); }
      to   { transform: rotate(405deg); }
    }
    @keyframes lsPulseCore {
      0%, 100% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.7; box-shadow: 0 0 12px rgba(124,58,237,0.6); }
      50%       { transform: translate(-50%, -50%) scale(1.15); opacity: 1; box-shadow: 0 0 28px rgba(124,58,237,1), 0 0 60px rgba(37,99,235,0.4); }
    }
    @keyframes lsFadeIn {
      from { opacity: 0; transform: translateY(16px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes lsShimmerText {
      0%   { background-position: -300% center; }
      100% { background-position: 300% center; }
    }
    @keyframes lsGlowOrb {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
      50%       { transform: translate(-50%, -50%) scale(1.3); opacity: 0.7; }
    }
    .ls-ring-1 { animation: lsRotate1 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
    .ls-ring-2 { animation: lsRotate2 1.0s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
    .ls-ring-3 { animation: lsRotate3 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
    .ls-core-dot { animation: lsPulseCore 1.6s ease-in-out infinite; }
    .ls-glow-orb { animation: lsGlowOrb 2s ease-in-out infinite; }
    .ls-wrap { animation: lsFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .ls-msg {
      background: linear-gradient(90deg, rgba(167,139,250,0.5) 0%, rgba(96,165,250,1) 40%, rgba(6,182,212,0.8) 60%, rgba(167,139,250,0.5) 100%);
      background-size: 300% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: lsShimmerText 3s linear infinite;
    }
  `

  const outerR = size / 2 - 3
  const midR = size / 2 - 3
  const innerR = size / 2 - 3

  // Dash array for partial arc
  const dashOuter = `${outerR * 2 * Math.PI * 0.7} ${outerR * 2 * Math.PI * 0.3}`
  const dashMid = `${midR * 2 * Math.PI * 0.5} ${midR * 2 * Math.PI * 0.5}`
  const dashInner = `${innerR * 2 * Math.PI * 0.3} ${innerR * 2 * Math.PI * 0.7}`

  return (
    <>
      <style>{css}</style>
      <div
        className="ls-wrap"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
        }}
      >
        {/* Spinner stack */}
        <div style={{ position: 'relative', width: size, height: size }}>

          {/* Ambient glow orb */}
          <div className="ls-glow-orb" style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: size * 1.6, height: size * 1.6,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, rgba(37,99,235,0.08) 50%, transparent 70%)',
            filter: 'blur(16px)',
            zIndex: 0,
          }} />

          {/* Outer ring */}
          <svg
            className="ls-ring-1"
            width={size} height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
          >
            <defs>
              <linearGradient id="lsGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle cx={size/2} cy={size/2} r={outerR} fill="none" stroke="rgba(124,58,237,0.1)" strokeWidth="2.5" />
            {/* Arc */}
            <circle
              cx={size/2} cy={size/2} r={outerR}
              fill="none" stroke="url(#lsGrad1)" strokeWidth="2.5"
              strokeLinecap="round" strokeDasharray={dashOuter}
            />
          </svg>

          {/* Mid ring (slightly inset) */}
          <svg
            className="ls-ring-2"
            width={size - 14} height={size - 14}
            viewBox={`0 0 ${size - 14} ${size - 14}`}
            style={{ position: 'absolute', top: 7, left: 7, zIndex: 2 }}
          >
            <defs>
              <linearGradient id="lsGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <circle cx={(size-14)/2} cy={(size-14)/2} r={(size-14)/2 - 3} fill="none" stroke="rgba(37,99,235,0.08)" strokeWidth="2" />
            <circle
              cx={(size-14)/2} cy={(size-14)/2} r={(size-14)/2 - 3}
              fill="none" stroke="url(#lsGrad2)" strokeWidth="2"
              strokeLinecap="round" strokeDasharray={dashMid}
            />
          </svg>

          {/* Inner ring */}
          <svg
            className="ls-ring-3"
            width={size - 28} height={size - 28}
            viewBox={`0 0 ${size - 28} ${size - 28}`}
            style={{ position: 'absolute', top: 14, left: 14, zIndex: 3 }}
          >
            <defs>
              <linearGradient id="lsGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <circle cx={(size-28)/2} cy={(size-28)/2} r={(size-28)/2 - 2} fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="1.5" />
            <circle
              cx={(size-28)/2} cy={(size-28)/2} r={(size-28)/2 - 2}
              fill="none" stroke="url(#lsGrad3)" strokeWidth="1.5"
              strokeLinecap="round" strokeDasharray={dashInner}
            />
          </svg>

          {/* Core pulsing dot */}
          <div
            className="ls-core-dot"
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: size * 0.18, height: size * 0.18,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              zIndex: 4,
            }}
          />
        </div>

        {/* Message */}
        {message && (
          <p className="ls-msg" style={{
            fontSize: '0.78rem', fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            margin: 0,
          }}>
            {message}
          </p>
        )}
      </div>
    </>
  )
}
