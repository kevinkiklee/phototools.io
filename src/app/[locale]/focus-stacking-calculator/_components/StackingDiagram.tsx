'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import type { StackingResult } from '@/lib/math/dof'

interface StackingDiagramProps {
  result: StackingResult
  nearLimit: number
  farLimit: number
}

const BAND_COLORS = [
  'var(--lens-a, #3b82f6)', // blue
  'var(--lens-b, #ef4444)', // red
  'var(--lens-c, #22c55e)', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
]

const PADDING_LEFT = 70
const PADDING_RIGHT = 24
const PADDING_TOP = 32
const PADDING_BOTTOM = 40
const BAND_HEIGHT = 20
const BAND_GAP = 4
const SVG_MIN_HEIGHT = 200

function distToX(d: number, logMin: number, logRange: number, drawWidth: number): number {
  return PADDING_LEFT + ((Math.log(d) - logMin) / logRange) * drawWidth
}

function generateTicks(min: number, max: number): number[] {
  const ticks: number[] = []
  const decades = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100]
  for (const d of decades) {
    if (d >= min * 0.9 && d <= max * 1.1) ticks.push(d)
  }
  return ticks
}

export function StackingDiagram({ result, nearLimit, farLimit }: StackingDiagramProps) {
  const t = useTranslations('toolUI.focus-stacking-calculator')
  const { shots } = result

  const diagramData = useMemo(() => {
    // Determine log scale bounds with some padding
    const allDistances = shots.flatMap((s) => [s.nearFocus, s.farFocus])
    allDistances.push(nearLimit, farLimit)
    const minD = Math.max(0.05, Math.min(...allDistances) * 0.8)
    const maxD = Math.max(...allDistances) * 1.2

    const logMin = Math.log(minD)
    const logMax = Math.log(maxD)
    const logRange = logMax - logMin

    const bandsHeight = shots.length * (BAND_HEIGHT + BAND_GAP)
    const svgHeight = Math.max(SVG_MIN_HEIGHT, PADDING_TOP + bandsHeight + PADDING_BOTTOM)

    const ticks = generateTicks(minD, maxD)

    return { logMin, logRange, svgHeight, ticks, minD, maxD }
  }, [shots, nearLimit, farLimit])

  const { logMin, logRange, svgHeight, ticks } = diagramData

  // We use viewBox for responsiveness; drawWidth is in viewBox units
  const viewBoxWidth = 800
  const drawWidth = viewBoxWidth - PADDING_LEFT - PADDING_RIGHT

  const nearX = distToX(nearLimit, logMin, logRange, drawWidth)
  const farX = distToX(farLimit, logMin, logRange, drawWidth)

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${svgHeight}`}
      width="100%"
      style={{ maxWidth: 900, height: 'auto' }}
      role="img"
      aria-label={t('diagram')}
    >
      {/* Background */}
      <rect x={0} y={0} width={viewBoxWidth} height={svgHeight} fill="var(--bg-surface)" rx={8} />

      {/* Near/far limit dashed lines */}
      <line
        x1={nearX} y1={PADDING_TOP - 12}
        x2={nearX} y2={svgHeight - PADDING_BOTTOM + 8}
        stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7}
      />
      <text
        x={nearX} y={PADDING_TOP - 16}
        fill="var(--accent)" fontSize={10} textAnchor="middle" fontWeight={600}
      >
        {t('diagramNear')}
      </text>
      <line
        x1={farX} y1={PADDING_TOP - 12}
        x2={farX} y2={svgHeight - PADDING_BOTTOM + 8}
        stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7}
      />
      <text
        x={farX} y={PADDING_TOP - 16}
        fill="var(--accent)" fontSize={10} textAnchor="middle" fontWeight={600}
      >
        {t('diagramFar')}
      </text>

      {/* Camera icon (simple representation) */}
      <text
        x={PADDING_LEFT - 10} y={PADDING_TOP + (shots.length * (BAND_HEIGHT + BAND_GAP)) / 2 + 4}
        fill="var(--text-secondary)" fontSize={20} textAnchor="end"
      >
        {'\uD83D\uDCF7'}
      </text>

      {/* Shot bands */}
      {shots.map((shot, i) => {
        const color = BAND_COLORS[i % BAND_COLORS.length]
        const y = PADDING_TOP + i * (BAND_HEIGHT + BAND_GAP)
        const x1 = distToX(shot.nearFocus, logMin, logRange, drawWidth)
        const x2 = distToX(shot.farFocus, logMin, logRange, drawWidth)
        const bandWidth = Math.max(2, x2 - x1)

        // Overlap zone with previous shot
        let overlapX1 = 0
        let overlapWidth = 0
        if (i > 0) {
          const prev = shots[i - 1]
          if (prev.farFocus > shot.nearFocus) {
            overlapX1 = x1
            const overlapX2 = distToX(
              Math.min(prev.farFocus, shot.farFocus),
              logMin, logRange, drawWidth,
            )
            overlapWidth = Math.max(0, overlapX2 - overlapX1)
          }
        }

        return (
          <g key={shot.number}>
            {/* Main band */}
            <rect
              x={x1} y={y}
              width={bandWidth} height={BAND_HEIGHT}
              fill={color} opacity={0.35} rx={3}
            />
            <rect
              x={x1} y={y}
              width={bandWidth} height={BAND_HEIGHT}
              fill="none" stroke={color} strokeWidth={1.5} rx={3}
            />

            {/* Overlap zone highlight */}
            {overlapWidth > 0 && (
              <rect
                x={overlapX1} y={y}
                width={overlapWidth} height={BAND_HEIGHT}
                fill={color} opacity={0.15} rx={2}
              />
            )}

            {/* Focus point marker */}
            {(() => {
              const fx = distToX(shot.focusDistance, logMin, logRange, drawWidth)
              return (
                <circle cx={fx} cy={y + BAND_HEIGHT / 2} r={3} fill={color} />
              )
            })()}

            {/* Shot number label */}
            <text
              x={x1 - 6} y={y + BAND_HEIGHT / 2 + 4}
              fill="var(--text-secondary)" fontSize={10} textAnchor="end"
              fontWeight={500}
            >
              {shot.number}
            </text>
          </g>
        )
      })}

      {/* Distance scale at bottom */}
      {ticks.map((d) => {
        const x = distToX(d, logMin, logRange, drawWidth)
        if (x < PADDING_LEFT || x > viewBoxWidth - PADDING_RIGHT) return null
        const label = d >= 1 ? `${d}m` : `${Math.round(d * 100)}cm`
        return (
          <g key={d}>
            <line
              x1={x} y1={svgHeight - PADDING_BOTTOM}
              x2={x} y2={svgHeight - PADDING_BOTTOM + 6}
              stroke="var(--text-secondary)" strokeWidth={1} opacity={0.5}
            />
            <text
              x={x} y={svgHeight - PADDING_BOTTOM + 18}
              fill="var(--text-secondary)" fontSize={10} textAnchor="middle"
            >
              {label}
            </text>
          </g>
        )
      })}

      {/* Axis line */}
      <line
        x1={PADDING_LEFT} y1={svgHeight - PADDING_BOTTOM}
        x2={viewBoxWidth - PADDING_RIGHT} y2={svgHeight - PADDING_BOTTOM}
        stroke="var(--border)" strokeWidth={1}
      />
    </svg>
  )
}
