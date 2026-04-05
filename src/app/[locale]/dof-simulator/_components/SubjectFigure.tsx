'use client'

import { useMemo } from 'react'
import { FIGURE_DEPTH_ZONES } from '@/lib/data/dofSimulator'

interface SubjectFigureProps {
  subjectDistance: number   // meters
  focalLength: number       // mm
  sensorHeight: number      // mm
  viewportHeight: number    // px
  focalResult: { nearFocus: number; farFocus: number }
}

/** Color constants for depth zone rendering */
const COLOR_SHARP = '#22c55e'   // green — in focus
const COLOR_FRONT = '#06b6d4'   // cyan — in front of focus
const COLOR_BEHIND = '#f59e0b'  // amber — behind focus

/** Full body height in mm for figure scaling */
const FULL_BODY_MM = 1700

/**
 * Determine zone color and opacity based on DOF range.
 * Zones within nearFocus..farFocus are sharp (green).
 * Zones in front get cyan tint; zones behind get amber tint.
 * Opacity scales with how far the zone is from the DOF boundary.
 */
function getZoneStyle(
  offsetMm: number,
  subjectDistance: number,
  nearFocus: number,
  farFocus: number,
): { fill: string; opacity: number } {
  const zoneDistanceM = subjectDistance + offsetMm / 1000
  const dofRange = farFocus - nearFocus

  if (zoneDistanceM >= nearFocus && zoneDistanceM <= farFocus) {
    return { fill: COLOR_SHARP, opacity: 0.7 }
  }

  if (zoneDistanceM < nearFocus) {
    // In front of focus plane
    const overshoot = nearFocus - zoneDistanceM
    const ratio = dofRange > 0 ? Math.min(overshoot / dofRange, 1) : 1
    return { fill: COLOR_FRONT, opacity: 0.3 + ratio * 0.5 }
  }

  // Behind focus plane
  const overshoot = zoneDistanceM - farFocus
  const ratio = dofRange > 0 ? Math.min(overshoot / dofRange, 1) : 1
  return { fill: COLOR_BEHIND, opacity: 0.3 + ratio * 0.5 }
}

/**
 * SVG overlay showing a depth-layered human figure.
 * Positioned absolutely over the viewport to illustrate
 * which body parts fall within the depth of field.
 */
export function SubjectFigure({
  subjectDistance,
  focalLength,
  sensorHeight,
  viewportHeight,
  focalResult,
}: SubjectFigureProps) {
  const figureHeightPx = useMemo(() => {
    const fovHeightMm = subjectDistance * (sensorHeight / focalLength) * 1000
    if (fovHeightMm <= 0) return 0
    return viewportHeight * (FULL_BODY_MM / fovHeightMm)
  }, [subjectDistance, sensorHeight, focalLength, viewportHeight])

  const zones = useMemo(() => {
    return FIGURE_DEPTH_ZONES.map((zone) => ({
      ...zone,
      style: getZoneStyle(zone.offsetMm, subjectDistance, focalResult.nearFocus, focalResult.farFocus),
    }))
  }, [subjectDistance, focalResult.nearFocus, focalResult.farFocus])

  if (figureHeightPx <= 0) return null

  // Clamp figure size to reasonable bounds
  const clampedHeight = Math.min(Math.max(figureHeightPx, 40), viewportHeight * 1.2)
  const svgWidth = clampedHeight * 0.4
  const svgHeight = clampedHeight

  // Body proportions (fractions of total height, from top)
  const headY = 0
  const headH = 0.13
  const neckY = headH
  const neckH = 0.03
  const torsoY = neckY + neckH
  const torsoH = 0.32
  const legY = torsoY + torsoH
  const legH = 1 - legY

  // Zone-to-body-part mapping
  const zoneMap: Record<string, { y: number; h: number; width: number }> = {
    nose:  { y: headY,   h: headH * 0.4, width: 0.25 },
    face:  { y: headY,   h: headH * 0.7, width: 0.35 },
    eyes:  { y: headY,   h: headH,       width: 0.4  },
    ears:  { y: headY + headH * 0.2, h: headH * 0.5, width: 0.5  },
    body:  { y: torsoY,  h: torsoH + legH, width: 0.55 },
  }

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}
    >
      {/* Base silhouette outline */}
      <ellipse
        cx={svgWidth / 2}
        cy={svgHeight * (headY + headH / 2)}
        rx={svgWidth * 0.18}
        ry={svgHeight * headH * 0.5}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />
      <line
        x1={svgWidth / 2} y1={svgHeight * neckY}
        x2={svgWidth / 2} y2={svgHeight * (neckY + neckH)}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />
      <rect
        x={svgWidth * 0.22}
        y={svgHeight * torsoY}
        width={svgWidth * 0.56}
        height={svgHeight * torsoH}
        rx={svgWidth * 0.08}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />
      <rect
        x={svgWidth * 0.28}
        y={svgHeight * legY}
        width={svgWidth * 0.18}
        height={svgHeight * legH}
        rx={svgWidth * 0.04}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />
      <rect
        x={svgWidth * 0.54}
        y={svgHeight * legY}
        width={svgWidth * 0.18}
        height={svgHeight * legH}
        rx={svgWidth * 0.04}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1}
      />

      {/* Depth zone overlays */}
      {zones.map((zone) => {
        const mapping = zoneMap[zone.key]
        if (!mapping) return null
        const zw = svgWidth * mapping.width
        const zh = svgHeight * mapping.h
        const zx = (svgWidth - zw) / 2
        const zy = svgHeight * mapping.y

        return (
          <g key={zone.key}>
            {zone.key === 'eyes' || zone.key === 'face' || zone.key === 'nose' || zone.key === 'ears' ? (
              <ellipse
                cx={svgWidth / 2}
                cy={zy + zh / 2}
                rx={zw / 2}
                ry={zh / 2}
                fill={zone.style.fill}
                opacity={zone.style.opacity}
              />
            ) : (
              <rect
                x={zx}
                y={zy}
                width={zw}
                height={zh}
                rx={4}
                fill={zone.style.fill}
                opacity={zone.style.opacity}
              />
            )}
            <text
              x={svgWidth / 2}
              y={zy + zh / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#fff"
              fontSize={Math.max(9, Math.min(12, svgHeight * 0.02))}
              fontFamily="var(--font-mono)"
              opacity={0.9}
              style={{ pointerEvents: 'none' }}
            >
              {zone.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
