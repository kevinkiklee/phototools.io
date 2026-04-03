'use client'

import { useRef, useEffect } from 'react'
import type { LensConfig } from '@/lib/types'
import type { Orientation } from './types'
import type { OverlayOffsets } from './Canvas'
import { LENS_COLORS, LENS_LABELS } from './types'
import { calcFOV, calcCropRatio } from '@/lib/math/fov'
import { getSensor } from '@/lib/data/sensors'
import { SCENES } from '@/lib/data/scenes'
import styles from './CropStrip.module.css'

const REF_FOV = calcFOV(14, 1.0)

interface CropThumbProps {
  lens: LensConfig
  imageIndex: number
  orientation: Orientation
  color: string
  lensIndex: number
  isActive: boolean
  onSelect: () => void
  offset: { dx: number; dy: number }
}

function CropThumb({ lens, imageIndex, orientation, color, lensIndex, isActive, onSelect, offset }: CropThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const dpr = window.devicePixelRatio || 1
    const displayW = parent.offsetWidth
    const displayH = parent.offsetHeight
    canvas.width = displayW * dpr
    canvas.height = displayH * dpr

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = SCENES[imageIndex]?.src ?? SCENES[0].src
    img.onload = () => {
      const sensor = getSensor(lens.sensorId)
      const fov = calcFOV(lens.focalLength, sensor.cropFactor)
      const isPortrait = orientation === 'portrait'

      const ratioW = calcCropRatio(
        isPortrait ? fov.vertical : fov.horizontal,
        isPortrait ? REF_FOV.vertical : REF_FOV.horizontal,
      )
      const ratioH = calcCropRatio(
        isPortrait ? fov.horizontal : fov.vertical,
        isPortrait ? REF_FOV.horizontal : REF_FOV.vertical,
      )

      const cropW = img.width * ratioW
      const cropH = img.height * ratioH

      // Convert canvas-pixel offset to image-space offset by reading the main canvas size
      const mainCanvas = document.querySelector('canvas[aria-label="Field of view comparison"]') as HTMLCanvasElement | null
      const mainW = mainCanvas?.width ?? canvas.width
      const mainH = mainCanvas?.height ?? canvas.height

      const imgDx = (offset.dx / mainW) * img.width
      const imgDy = (offset.dy / mainH) * img.height

      const centerX = (img.width - cropW) / 2
      const centerY = (img.height - cropH) / 2
      const srcX = Math.max(0, Math.min(img.width - cropW, centerX + imgDx))
      const srcY = Math.max(0, Math.min(img.height - cropH, centerY + imgDy))

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, srcX, srcY, cropW, cropH, 0, 0, canvas.width, canvas.height)
    }
  }, [lens, imageIndex, orientation, offset])

  return (
    <button
      className={styles.thumb}
      style={{ borderColor: color, opacity: isActive ? 1 : 0.6 }}
      onClick={onSelect}
      title={`Lens ${LENS_LABELS[lensIndex]} — ${lens.focalLength}mm`}
    >
      <canvas ref={canvasRef} />
      <span className={styles.thumbLabel}>{LENS_LABELS[lensIndex]} — {lens.focalLength}mm</span>
    </button>
  )
}

interface CropStripProps {
  lenses: LensConfig[]
  imageIndex: number
  orientation: Orientation
  activeLens: number
  onSelectLens: (index: number) => void
  offsets: OverlayOffsets
  expanded: boolean
  onToggleExpand: () => void
}

export function CropStrip({ lenses, imageIndex, orientation, activeLens, onSelectLens, offsets, expanded, onToggleExpand }: CropStripProps) {
  return (
    <div className={`${styles.strip} ${expanded ? styles.stripExpanded : ''}`}>
      <div className={styles.stripHeader}>
        <span className={styles.label}>Crop view:</span>
        <button className={styles.expandBtn} onClick={onToggleExpand} title={expanded ? 'Collapse' : 'Expand'}>
          {expanded ? '▾' : '▴'}
        </button>
      </div>
      <div className={styles.thumbs}>
        {lenses.map((lens, i) => (
          <CropThumb
            key={i}
            lens={lens}
            imageIndex={imageIndex}
            orientation={orientation}
            color={LENS_COLORS[i]}
            lensIndex={i}
            isActive={activeLens === i}
            onSelect={() => onSelectLens(i)}
            offset={offsets[i] ?? { dx: 0, dy: 0 }}
          />
        ))}
      </div>
    </div>
  )
}
