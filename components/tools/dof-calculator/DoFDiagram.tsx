'use client'

import { useMemo } from 'react'
import type { DoFResult } from '@/lib/math/dof'
import styles from './DoFDiagram.module.css'

interface DoFDiagramProps {
  result: DoFResult
  distance: number
}

const W = 700
const H = 140
const PAD_L = 40
const PAD_R = 30
const STRIP_Y = 14
const STRIP_H = 52
const LABEL_Y = STRIP_Y + STRIP_H + 16
const AXIS_Y = LABEL_Y + 18

function distToX(dist: number): number {
  const minLog = Math.log(0.2)
  const maxLog = Math.log(150)
  const usable = W - PAD_L - PAD_R
  const t = (Math.log(Math.max(dist, 0.2)) - minLog) / (maxLog - minLog)
  return PAD_L + t * usable
}

function formatDist(m: number): string {
  if (!isFinite(m)) return '∞'
  if (m < 1) return `${(m * 100).toFixed(0)} cm`
  return `${m.toFixed(2)} m`
}

function formatDistShort(m: number): string {
  if (!isFinite(m)) return '∞'
  if (m < 1) return `${(m * 100).toFixed(0)}cm`
  if (m < 10) return `${m.toFixed(1)}m`
  return `${m.toFixed(0)}m`
}

export function DoFDiagram({ result, distance }: DoFDiagramProps) {
  const positions = useMemo(() => {
    const subjectX = distToX(distance)
    const nearX = distToX(result.nearFocus)
    const farX = isFinite(result.farFocus)
      ? distToX(result.farFocus)
      : W - PAD_R
    const farIsInfinity = !isFinite(result.farFocus)
    return { subjectX, nearX, farX, farIsInfinity }
  }, [result, distance])

  const { subjectX, nearX, farX, farIsInfinity } = positions
  const focusWidth = Math.max(2, farX - nearX)
  const midX = nearX + focusWidth / 2

  // When boundaries are close, merge into one combined label to prevent overlap.
  // "Near: 5.5m" is ~70px wide at font-size 10, so two side-by-side need ~150px gap.
  const labelsCollide = (farX - nearX) < 130

  const ticks = [0.3, 0.5, 1, 2, 3, 5, 10, 20, 50, 100]

  // Bokeh circles for blur zones
  const bokehNear = useMemo(() => {
    const circles: { cx: number; cy: number; r: number; o: number }[] = []
    const span = nearX - PAD_L
    if (span < 10) return circles
    for (let i = 0; i < 8; i++) {
      const t = (i + 0.5) / 8
      const x = PAD_L + t * span
      const edge = Math.min(t, 1 - t) * 2
      circles.push({
        cx: x,
        cy: STRIP_Y + 10 + (i % 3) * 16,
        r: 3 + (1 - edge) * 4,
        o: 0.06 + (1 - edge) * 0.08,
      })
    }
    return circles
  }, [nearX])

  const bokehFar = useMemo(() => {
    const circles: { cx: number; cy: number; r: number; o: number }[] = []
    const span = W - PAD_R - farX
    if (span < 10 || farIsInfinity) return circles
    for (let i = 0; i < 8; i++) {
      const t = (i + 0.5) / 8
      const x = farX + t * span
      const edge = Math.min(t, 1 - t) * 2
      circles.push({
        cx: x,
        cy: STRIP_Y + 8 + (i % 3) * 18,
        r: 3 + edge * 5,
        o: 0.06 + edge * 0.1,
      })
    }
    return circles
  }, [farX, farIsInfinity])

  return (
    <div className={styles.container}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.svg}
        role="img"
        aria-label={`Depth of field: ${formatDist(result.totalDoF)} from ${formatDist(result.nearFocus)} to ${formatDist(result.farFocus)}`}
      >
        <defs>
          <linearGradient id="dof-fade-near" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="dof-fade-far" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="dof-sharp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* ── Background strip ── */}
        <rect
          x={PAD_L}
          y={STRIP_Y}
          width={W - PAD_L - PAD_R}
          height={STRIP_H}
          rx="6"
          fill="var(--bg-primary)"
          opacity="0.5"
        />

        {/* ── Blur zone: near ── */}
        <rect
          x={PAD_L}
          y={STRIP_Y}
          width={Math.max(0, nearX - PAD_L)}
          height={STRIP_H}
          fill="url(#dof-fade-near)"
          rx="6"
        />
        {bokehNear.map((c, i) => (
          <circle
            key={`bn${i}`}
            cx={c.cx}
            cy={c.cy}
            r={c.r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="0.8"
            opacity={c.o}
          />
        ))}

        {/* ── In-focus zone ── */}
        <rect
          x={nearX}
          y={STRIP_Y}
          width={focusWidth}
          height={STRIP_H}
          fill="url(#dof-sharp)"
          rx="3"
        />
        {/* Edge accents */}
        <line x1={nearX} y1={STRIP_Y + 1} x2={nearX} y2={STRIP_Y + STRIP_H - 1} stroke="var(--accent)" strokeWidth="2" opacity="0.5" />
        <line x1={farX} y1={STRIP_Y + 1} x2={farX} y2={STRIP_Y + STRIP_H - 1} stroke="var(--accent)" strokeWidth="2" opacity="0.5" />

        {/* ── Blur zone: far ── */}
        {!farIsInfinity && (
          <rect
            x={farX}
            y={STRIP_Y}
            width={Math.max(0, W - PAD_R - farX)}
            height={STRIP_H}
            fill="url(#dof-fade-far)"
            rx="6"
          />
        )}
        {bokehFar.map((c, i) => (
          <circle
            key={`bf${i}`}
            cx={c.cx}
            cy={c.cy}
            r={c.r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="0.8"
            opacity={c.o}
          />
        ))}

        {/* ── Camera icon ── */}
        <g transform={`translate(${PAD_L - 2}, ${STRIP_Y + STRIP_H / 2})`}>
          <rect x="-12" y="-8" width="14" height="16" rx="2" fill="var(--text-secondary)" opacity="0.7" />
          <rect x="-8" y="-12" width="6" height="5" rx="1" fill="var(--text-secondary)" opacity="0.7" />
          <circle cx="-5" cy="0" r="4" fill="var(--bg-primary)" opacity="0.6" />
          <circle cx="-5" cy="0" r="2.5" fill="var(--text-secondary)" opacity="0.4" />
        </g>

        {/* ── Subject marker ── */}
        <line
          x1={subjectX}
          y1={STRIP_Y + 4}
          x2={subjectX}
          y2={STRIP_Y + STRIP_H - 4}
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={subjectX} cy={STRIP_Y + STRIP_H / 2} r="4" fill="var(--accent)" />
        <circle cx={subjectX} cy={STRIP_Y + STRIP_H / 2} r="2" fill="var(--bg-surface)" />

        {/* ── Labels below strip ── */}
        {labelsCollide ? (
          <>
            <line x1={midX} y1={LABEL_Y - 6} x2={midX} y2={STRIP_Y + STRIP_H} stroke="var(--accent)" strokeWidth="0.8" opacity="0.35" />
            <text x={midX} y={LABEL_Y} textAnchor="middle" className={styles.boundaryLabel}>
              {formatDistShort(result.nearFocus)} – {farIsInfinity ? '∞' : formatDistShort(result.farFocus)}
            </text>
          </>
        ) : (
          <>
            <line x1={nearX} y1={LABEL_Y - 6} x2={nearX} y2={STRIP_Y + STRIP_H} stroke="var(--accent)" strokeWidth="0.8" opacity="0.35" />
            <text x={nearX} y={LABEL_Y} textAnchor="middle" className={styles.boundaryLabel}>
              {formatDistShort(result.nearFocus)}
            </text>
            <line x1={farX} y1={LABEL_Y - 6} x2={farX} y2={STRIP_Y + STRIP_H} stroke="var(--accent)" strokeWidth="0.8" opacity="0.35" />
            <text x={farX} y={LABEL_Y} textAnchor="middle" className={styles.boundaryLabel}>
              {farIsInfinity ? '∞' : formatDistShort(result.farFocus)}
            </text>
          </>
        )}

        {/* ── Distance axis ── */}
        <line x1={PAD_L} y1={AXIS_Y} x2={W - PAD_R} y2={AXIS_Y} stroke="var(--border)" strokeWidth="1" />
        {ticks.map((t) => {
          const x = distToX(t)
          return (
            <g key={t}>
              <line x1={x} y1={AXIS_Y - 3} x2={x} y2={AXIS_Y + 3} stroke="var(--text-secondary)" strokeWidth="1" opacity="0.4" />
              <text x={x} y={AXIS_Y + 14} textAnchor="middle" className={styles.tickLabel}>
                {t >= 1 ? `${t}m` : `${t * 100}cm`}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
