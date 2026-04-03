'use client'

import { useRef, useEffect } from 'react'
import type { LensConfig } from '@/lib/types'
import type { Orientation } from './types'
import { LENS_COLORS, LENS_LABELS } from './types'
import { calcFOV, calcCropRatio } from '@/lib/math/fov'
import { getSensor } from '@/lib/data/sensors'
import { SCENES } from '@/lib/data/scenes'
import styles from './CropStrip.module.css'

// Reference FOV: 14mm on full frame — same reference as Canvas.tsx
const REF_FOV = calcFOV(14, 1.0)

interface CropThumbProps {
  lens: LensConfig
  imageIndex: number
  orientation: Orientation
  color: string
  label: string
  lensIndex: number
  isActive: boolean
  onSelect: () => void
}

function CropThumb({ lens, imageIndex, orientation, color, label, lensIndex, isActive, onSelect }: CropThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const displayW = canvas.offsetWidth || 160
    const displayH = canvas.offsetHeight || 48
    canvas.width = displayW * dpr
    canvas.height = displayH * dpr

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)

    const img = new Image()
    img.src = SCENES[imageIndex]?.src ?? SCENES[0].src
    img.onload = () => {
      const sensor = getSensor(lens.sensorId)
      const lenseFOV = calcFOV(lens.focalLength, sensor.cropFactor)

      // Compute crop ratio relative to reference FOV
      const refFovDim = orientation === 'landscape' ? REF_FOV.horizontal : REF_FOV.vertical
      const lensFovDim = orientation === 'landscape' ? lenseFOV.horizontal : lenseFOV.vertical
      const cropRatio = calcCropRatio(lensFovDim, refFovDim)

      // Compute the cropped region in image-space (center crop by cropRatio)
      const srcW = img.width * cropRatio
      const srcH = img.height * cropRatio
      const srcX = (img.width - srcW) / 2
      const srcY = (img.height - srcH) / 2

      ctx.clearRect(0, 0, displayW, displayH)
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, displayW, displayH)
    }
  }, [lens, imageIndex, orientation])

  const focalLabel = `${LENS_LABELS[lensIndex]} — ${lens.focalLength}mm`

  return (
    <button
      className={styles.thumb}
      style={{ borderColor: color, opacity: isActive ? 1 : 0.6 }}
      onClick={onSelect}
      title={label}
    >
      <canvas ref={canvasRef} />
      <span className={styles.thumbLabel}>{focalLabel}</span>
    </button>
  )
}

interface CropStripProps {
  lenses: LensConfig[]
  imageIndex: number
  orientation: Orientation
  activeLens: number
  onSelectLens: (index: number) => void
}

export function CropStrip({ lenses, imageIndex, orientation, activeLens, onSelectLens }: CropStripProps) {
  return (
    <div className={styles.strip}>
      <span className={styles.label}>Crop view:</span>
      <div className={styles.thumbs}>
        {lenses.map((lens, i) => (
          <CropThumb
            key={i}
            lens={lens}
            imageIndex={imageIndex}
            orientation={orientation}
            color={LENS_COLORS[i]}
            label={`Lens ${LENS_LABELS[i]} — ${lens.focalLength}mm`}
            lensIndex={i}
            isActive={activeLens === i}
            onSelect={() => onSelectLens(i)}
          />
        ))}
      </div>
    </div>
  )
}
