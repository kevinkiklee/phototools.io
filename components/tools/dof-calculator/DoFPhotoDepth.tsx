'use client'

import { useRef, useEffect, useCallback } from 'react'
import { calcCircleOfConfusion } from '@/lib/math/exposure'
import type { SceneKey } from './DoFCanvas'

interface DoFPhotoDepthProps {
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

const BLUR_LEVELS = 8
const MAX_BLUR = 24

/**
 * Option C: Real photo with per-pixel depth-map blur.
 * Loads a photograph, generates a synthetic depth map (vertical gradient
 * with depth estimated from image position), pre-renders multiple blur
 * levels, then composites per-pixel using the depth map.
 */
export function DoFPhotoDepth({ focusDistance, aperture, scene, className }: DoFPhotoDepthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const currentSceneRef = useRef<SceneKey>(scene)

  const render = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return

    const rect = canvas.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    if (w === 0 || h === 0) return

    // Capped resolution for per-pixel work
    const maxDim = 600
    const aspect = w / h
    let pw: number, ph: number
    if (w > h) {
      pw = Math.min(Math.round(w), maxDim)
      ph = Math.round(pw / aspect)
    } else {
      ph = Math.min(Math.round(h), maxDim)
      pw = Math.round(ph * aspect)
    }

    canvas.width = pw
    canvas.height = ph
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw image to cover canvas
    const imgAspect = img.naturalWidth / img.naturalHeight
    const canvasAspect = pw / ph
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
    if (imgAspect > canvasAspect) {
      sw = img.naturalHeight * canvasAspect
      sx = (img.naturalWidth - sw) / 2
    } else {
      sh = img.naturalWidth / canvasAspect
      sy = (img.naturalHeight - sh) / 2
    }

    // 1. Render sharp photo
    const sharpCanvas = new OffscreenCanvas(pw, ph)
    const sharpCtx = sharpCanvas.getContext('2d')
    if (!sharpCtx) return
    sharpCtx.drawImage(img, sx, sy, sw, sh, 0, 0, pw, ph)

    // 2. Generate synthetic depth map (vertical gradient: top=far, bottom=near)
    const depthCanvas = new OffscreenCanvas(pw, ph)
    const depthCtx = depthCanvas.getContext('2d')
    if (!depthCtx) return
    const grad = depthCtx.createLinearGradient(0, 0, 0, ph)
    grad.addColorStop(0, '#ffffff')   // far
    grad.addColorStop(0.4, '#aaaaaa') // mid-far
    grad.addColorStop(0.6, '#666666') // mid-near
    grad.addColorStop(1, '#000000')   // near
    depthCtx.fillStyle = grad
    depthCtx.fillRect(0, 0, pw, ph)
    const depthData = depthCtx.getImageData(0, 0, pw, ph)

    // 3. Pre-render blur levels
    const blurDatas: ImageData[] = []
    for (let level = 0; level < BLUR_LEVELS; level++) {
      const blurAmount = (level / (BLUR_LEVELS - 1)) * MAX_BLUR
      const bc = new OffscreenCanvas(pw, ph)
      const bctx = bc.getContext('2d')
      if (!bctx) return
      if (blurAmount > 0.5) {
        bctx.filter = `blur(${blurAmount}px)`
      }
      bctx.drawImage(sharpCanvas, 0, 0)
      bctx.filter = 'none'
      blurDatas.push(bctx.getImageData(0, 0, pw, ph))
    }

    // 4. Per-pixel compositing
    const output = ctx.createImageData(pw, ph)
    const out = output.data
    const totalPixels = pw * ph

    for (let i = 0; i < totalPixels; i++) {
      const px = i * 4
      const depthValue = depthData.data[px] / 255

      const blur = calcCircleOfConfusion(depthValue, focusDistance, aperture, MAX_BLUR)
      const levelFrac = (blur / MAX_BLUR) * (BLUR_LEVELS - 1)
      const lo = Math.floor(levelFrac)
      const hi = Math.min(lo + 1, BLUR_LEVELS - 1)
      const frac = levelFrac - lo

      const loData = blurDatas[lo].data
      const hiData = blurDatas[hi].data
      out[px]     = loData[px]     + (hiData[px]     - loData[px])     * frac
      out[px + 1] = loData[px + 1] + (hiData[px + 1] - loData[px + 1]) * frac
      out[px + 2] = loData[px + 2] + (hiData[px + 2] - loData[px + 2]) * frac
      out[px + 3] = 255
    }

    ctx.putImageData(output, 0, 0)
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
