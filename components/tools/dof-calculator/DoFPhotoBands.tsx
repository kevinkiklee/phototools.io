'use client'

import { useRef, useEffect, useCallback } from 'react'
import { calcCircleOfConfusion } from '@/lib/math/exposure'
import type { SceneKey } from './DoFCanvas'
import { drawSceneSharp, getSceneDef, lighten } from './sceneRenderer'

interface DoFPhotoBandsProps {
  focusDistance: number
  aperture: number
  scene: SceneKey
  className?: string
}

const NUM_BANDS = 12

/**
 * Option A: Depth-band blur.
 * Renders the scene sharp, slices into horizontal bands,
 * and blurs each band based on its estimated depth.
 */
export function DoFPhotoBands({ focusDistance, aperture, scene, className }: DoFPhotoBandsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
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

    // 1. Render the entire scene sharp to an offscreen canvas
    const offscreen = new OffscreenCanvas(Math.round(w * dpr), Math.round(h * dpr))
    const offCtx = offscreen.getContext('2d')
    if (!offCtx) return
    offCtx.scale(dpr, dpr)
    drawSceneSharp(offCtx, w, h, scene)

    // 2. Slice into depth bands and blur each
    const sceneDef = getSceneDef(scene)
    const groundLine = h * 0.55

    for (let i = 0; i < NUM_BANDS; i++) {
      const bandTop = (i / NUM_BANDS) * h
      const bandBottom = ((i + 1) / NUM_BANDS) * h
      const bandH = bandBottom - bandTop
      const bandMid = bandTop + bandH / 2

      // Map band position to depth: top = far (1), bottom = near (0)
      let depth: number
      if (bandMid < groundLine) {
        depth = 1.0 - (bandMid / groundLine) * 0.5
      } else {
        depth = 0.5 * (1 - (bandMid - groundLine) / (h - groundLine))
      }

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

      // Bokeh overlay for heavily blurred bands
      if (blur > 8) {
        const opacity = Math.min((blur - 8) / 20, 0.15)
        ctx.globalAlpha = opacity
        for (let b = 0; b < 3; b++) {
          const bx = ((i * 7 + b * 137) % 100) / 100 * w
          const by = bandTop + ((b * 47 + i * 23) % 100) / 100 * bandH
          const r = blur * 0.4 + b * 2
          ctx.strokeStyle = lighten(sceneDef.skyColor, 40)
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(bx, by, r, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }

      ctx.restore()
    }
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
