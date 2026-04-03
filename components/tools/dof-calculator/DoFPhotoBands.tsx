'use client'

import { useRef, useEffect, useCallback } from 'react'
import { calcCircleOfConfusion } from '@/lib/math/exposure'
import type { SceneKey } from './DoFCanvas'

interface DoFPhotoBandsProps {
  focusDistance: number
  aperture: number
  scene: SceneKey
  className?: string
}

const PHOTO_URLS: Record<SceneKey, string> = {
  portrait: '/images/dof/portrait.jpg',
  landscape: '/images/dof/landscape.jpg',
  street: '/images/dof/street.jpg',
  macro: '/images/dof/macro.jpg',
}

const NUM_BANDS = 16

/**
 * Option A: Real photo with depth-band blur.
 * Loads a photograph, slices it into horizontal bands, and applies
 * varying blur to each band based on estimated depth.
 */
export function DoFPhotoBands({ focusDistance, aperture, scene, className }: DoFPhotoBandsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const currentSceneRef = useRef<SceneKey>(scene)

  const render = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    if (w === 0 || h === 0) return

    canvas.width = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    // Draw image to cover the canvas (object-fit: cover)
    const imgAspect = img.naturalWidth / img.naturalHeight
    const canvasAspect = w / h
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
    if (imgAspect > canvasAspect) {
      sw = img.naturalHeight * canvasAspect
      sx = (img.naturalWidth - sw) / 2
    } else {
      sh = img.naturalWidth / canvasAspect
      sy = (img.naturalHeight - sh) / 2
    }

    // Draw sharp image to offscreen canvas
    const offscreen = new OffscreenCanvas(Math.round(w * dpr), Math.round(h * dpr))
    const offCtx = offscreen.getContext('2d')
    if (!offCtx) return
    offCtx.drawImage(img, sx, sy, sw, sh, 0, 0, Math.round(w * dpr), Math.round(h * dpr))

    // Slice into bands and blur each
    for (let i = 0; i < NUM_BANDS; i++) {
      const bandTop = (i / NUM_BANDS) * h
      const bandH = h / NUM_BANDS
      const bandMid = bandTop + bandH / 2

      // Depth estimate: top of image = far (1.0), bottom = near (0.0)
      const depth = 1.0 - bandMid / h

      const blur = calcCircleOfConfusion(depth, focusDistance, aperture, 20)

      ctx.save()
      ctx.beginPath()
      ctx.rect(0, Math.max(0, bandTop - 1), w, bandH + 2)
      ctx.clip()

      if (blur > 0.5) {
        ctx.filter = `blur(${blur}px)`
      }
      ctx.drawImage(offscreen, 0, 0, Math.round(w * dpr), Math.round(h * dpr), 0, 0, w, h)
      ctx.filter = 'none'
      ctx.restore()
    }
  }, [focusDistance, aperture, scene])

  useEffect(() => {
    const loadAndRender = () => {
      if (!imgRef.current || currentSceneRef.current !== scene) {
        currentSceneRef.current = scene
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          imgRef.current = img
          render()
        }
        img.src = PHOTO_URLS[scene]
      } else {
        render()
      }
    }

    loadAndRender()

    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => render())
    ro.observe(container)
    return () => ro.disconnect()
  }, [render, scene])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
