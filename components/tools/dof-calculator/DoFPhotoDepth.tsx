'use client'

import { useRef, useEffect, useCallback } from 'react'
import { calcCircleOfConfusion } from '@/lib/math/exposure'
import type { SceneKey } from './DoFCanvas'
import { drawSceneSharp, drawDepthMap } from './sceneRenderer'

interface DoFPhotoDepthProps {
  focusDistance: number
  aperture: number
  scene: SceneKey
  className?: string
}

const BLUR_LEVELS = 8
const MAX_BLUR = 24

/**
 * Option C: Per-pixel depth-map blur.
 * Renders the scene sharp + grayscale depth map, pre-renders multiple
 * blur levels, then composites using the depth map to select the
 * correct blur amount at each pixel. Interpolates between adjacent
 * blur levels for smooth transitions.
 */
export function DoFPhotoDepth({ focusDistance, aperture, scene, className }: DoFPhotoDepthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    if (w === 0 || h === 0) return

    // Use capped resolution for performance (per-pixel loop is expensive)
    const maxDim = 600
    const aspect = w / h
    const pw = w > h ? Math.min(Math.round(w), maxDim) : Math.round(Math.min(h, maxDim) * aspect)
    const ph = w > h ? Math.round(Math.min(w, maxDim) / aspect) : Math.min(Math.round(h), maxDim)

    canvas.width = pw
    canvas.height = ph
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 1. Render sharp scene
    const sharpCanvas = new OffscreenCanvas(pw, ph)
    const sharpCtx = sharpCanvas.getContext('2d')
    if (!sharpCtx) return
    sharpCtx.scale(pw / w, ph / h)
    drawSceneSharp(sharpCtx, w, h, scene)

    // 2. Render depth map
    const depthCanvas = new OffscreenCanvas(pw, ph)
    const depthCtx = depthCanvas.getContext('2d')
    if (!depthCtx) return
    depthCtx.scale(pw / w, ph / h)
    drawDepthMap(depthCtx, w, h, scene)

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

    // 4. Composite: per-pixel blur selection based on depth
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
    render()
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => render())
    ro.observe(container)
    return () => ro.disconnect()
  }, [render])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} className={className} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
