'use client'

interface FocusTargetProps {
  isInFocus: boolean  // whether subject distance is within DOF
  distance: number    // meters
}

const SIZE = 120
const CENTER = SIZE / 2

/** Camera-style focus reticle SVG overlay. */
export function FocusTarget({ isInFocus, distance }: FocusTargetProps) {
  const color = isInFocus ? '#22c55e' : '#f59e0b'
  const statusLabel = isInFocus ? 'IN FOCUS' : 'OUT OF FOCUS'
  const statusBg = isInFocus ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)'

  return (
    <svg
      width={SIZE}
      height={SIZE + 48}
      viewBox={`0 0 ${SIZE} ${SIZE + 48}`}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}
    >
      {/* Status badge above reticle */}
      <rect
        x={CENTER - 40}
        y={0}
        width={80}
        height={18}
        rx={9}
        fill={statusBg}
        stroke={color}
        strokeWidth={1}
      />
      <text
        x={CENTER}
        y={12}
        textAnchor="middle"
        fill={color}
        fontSize={9}
        fontWeight={700}
        fontFamily="var(--font-mono)"
      >
        {statusLabel}
      </text>

      {/* Concentric circles */}
      <circle cx={CENTER} cy={CENTER + 24} r={50} fill="none" stroke={color} strokeWidth={1} opacity={0.25} />
      <circle cx={CENTER} cy={CENTER + 24} r={35} fill="none" stroke={color} strokeWidth={1} opacity={0.4} />
      <circle cx={CENTER} cy={CENTER + 24} r={20} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6} />

      {/* Crosshair lines */}
      {/* Top */}
      <line x1={CENTER} y1={CENTER + 24 - 50} x2={CENTER} y2={CENTER + 24 - 22} stroke={color} strokeWidth={1} opacity={0.6} />
      {/* Bottom */}
      <line x1={CENTER} y1={CENTER + 24 + 22} x2={CENTER} y2={CENTER + 24 + 50} stroke={color} strokeWidth={1} opacity={0.6} />
      {/* Left */}
      <line x1={CENTER - 50} y1={CENTER + 24} x2={CENTER - 22} y2={CENTER + 24} stroke={color} strokeWidth={1} opacity={0.6} />
      {/* Right */}
      <line x1={CENTER + 22} y1={CENTER + 24} x2={CENTER + 50} y2={CENTER + 24} stroke={color} strokeWidth={1} opacity={0.6} />

      {/* Center dot */}
      <circle cx={CENTER} cy={CENTER + 24} r={2.5} fill={color} opacity={0.9} />

      {/* Distance label below reticle */}
      <text
        x={CENTER}
        y={SIZE + 42}
        textAnchor="middle"
        fill={color}
        fontSize={12}
        fontWeight={600}
        fontFamily="var(--font-mono)"
      >
        {distance.toFixed(2)}m
      </text>
    </svg>
  )
}
