'use client'

import { useRef, useEffect, useCallback } from 'react'
import { calcCircleOfConfusion } from '@/lib/math/exposure'

export type SceneKey = 'portrait' | 'landscape' | 'street' | 'macro'

interface DoFCanvasProps {
  focusDistance: number // 0–1 normalized
  aperture: number     // f-number
  scene: SceneKey
  className?: string
}

interface SceneObject {
  depth: number     // 0 = near, 1 = far
  type: 'circle' | 'rect' | 'person' | 'tree' | 'flower'
  x: number         // 0–1 normalized x position
  y: number         // 0–1 normalized y position
  size: number      // base size in px
  color: string
  label?: string
}

interface SceneDef {
  background: string
  groundColor: string
  skyColor: string
  objects: SceneObject[]
}

const SCENES: Record<SceneKey, SceneDef> = {
  portrait: {
    background: '#2d5a27',
    groundColor: '#3a6b33',
    skyColor: '#87CEEB',
    objects: [
      // Background trees
      { depth: 0.95, type: 'tree', x: 0.15, y: 0.35, size: 80, color: '#2d5a27' },
      { depth: 0.9, type: 'tree', x: 0.85, y: 0.35, size: 70, color: '#347a2c' },
      { depth: 0.85, type: 'tree', x: 0.5, y: 0.3, size: 60, color: '#3a8a32' },
      // Background elements
      { depth: 0.8, type: 'circle', x: 0.3, y: 0.5, size: 12, color: '#e8a060' },
      { depth: 0.75, type: 'circle', x: 0.7, y: 0.45, size: 10, color: '#d4a574' },
      // Subject (portrait person)
      { depth: 0.35, type: 'person', x: 0.5, y: 0.55, size: 100, color: '#d4956a' },
      // Foreground flowers
      { depth: 0.1, type: 'flower', x: 0.2, y: 0.85, size: 20, color: '#e06080' },
      { depth: 0.08, type: 'flower', x: 0.75, y: 0.88, size: 16, color: '#f0a0c0' },
      { depth: 0.05, type: 'circle', x: 0.1, y: 0.9, size: 8, color: '#80c060' },
    ],
  },
  landscape: {
    background: '#4a7a3a',
    groundColor: '#5a8a4a',
    skyColor: '#6CB4EE',
    objects: [
      // Distant mountains
      { depth: 1.0, type: 'rect', x: 0.3, y: 0.25, size: 200, color: '#8090a0' },
      { depth: 0.95, type: 'rect', x: 0.7, y: 0.28, size: 180, color: '#7a8a9a' },
      // Mid-ground trees
      { depth: 0.6, type: 'tree', x: 0.25, y: 0.4, size: 50, color: '#3a7a2a' },
      { depth: 0.55, type: 'tree', x: 0.65, y: 0.42, size: 45, color: '#4a8a3a' },
      { depth: 0.5, type: 'tree', x: 0.45, y: 0.45, size: 40, color: '#5a9a4a' },
      // Foreground rocks
      { depth: 0.15, type: 'rect', x: 0.2, y: 0.78, size: 30, color: '#8a7a6a' },
      { depth: 0.1, type: 'rect', x: 0.7, y: 0.82, size: 25, color: '#9a8a7a' },
      { depth: 0.05, type: 'circle', x: 0.5, y: 0.9, size: 20, color: '#7a6a5a' },
    ],
  },
  street: {
    background: '#555555',
    groundColor: '#444444',
    skyColor: '#b0c0d0',
    objects: [
      // Background buildings
      { depth: 0.95, type: 'rect', x: 0.15, y: 0.3, size: 120, color: '#6a6a7a' },
      { depth: 0.9, type: 'rect', x: 0.85, y: 0.25, size: 130, color: '#5a5a6a' },
      // Street lights
      { depth: 0.7, type: 'circle', x: 0.35, y: 0.2, size: 14, color: '#ffdd88' },
      { depth: 0.75, type: 'circle', x: 0.65, y: 0.22, size: 12, color: '#ffcc66' },
      // Subject (walking person)
      { depth: 0.4, type: 'person', x: 0.5, y: 0.6, size: 80, color: '#8a7060' },
      // Foreground elements
      { depth: 0.15, type: 'rect', x: 0.1, y: 0.75, size: 40, color: '#4a4a5a' },
      { depth: 0.1, type: 'circle', x: 0.85, y: 0.8, size: 18, color: '#ff6644' },
      { depth: 0.05, type: 'rect', x: 0.05, y: 0.85, size: 30, color: '#3a3a4a' },
    ],
  },
  macro: {
    background: '#3a5a2a',
    groundColor: '#4a6a3a',
    skyColor: '#90b870',
    objects: [
      // Far background (very blurred)
      { depth: 1.0, type: 'circle', x: 0.3, y: 0.3, size: 40, color: '#80c060' },
      { depth: 0.95, type: 'circle', x: 0.7, y: 0.25, size: 35, color: '#90d070' },
      { depth: 0.85, type: 'circle', x: 0.5, y: 0.35, size: 30, color: '#a0e080' },
      // Subject (macro flower/insect)
      { depth: 0.25, type: 'flower', x: 0.5, y: 0.5, size: 60, color: '#e06080' },
      { depth: 0.25, type: 'circle', x: 0.5, y: 0.48, size: 12, color: '#ffcc00' },
      // Very near foreground (heavily blurred)
      { depth: 0.05, type: 'circle', x: 0.2, y: 0.7, size: 30, color: '#60a040' },
      { depth: 0.02, type: 'circle', x: 0.8, y: 0.75, size: 25, color: '#70b050' },
      { depth: 0.0, type: 'circle', x: 0.4, y: 0.9, size: 35, color: '#50a030' },
    ],
  },
}

function drawTree(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  // Trunk
  ctx.fillStyle = '#5a4030'
  ctx.fillRect(cx - size * 0.06, cy, size * 0.12, size * 0.4)
  // Canopy
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx, cy - size * 0.1, size * 0.35, 0, Math.PI * 2)
  ctx.fill()
  // Lighter highlight
  ctx.fillStyle = lighten(color, 20)
  ctx.beginPath()
  ctx.arc(cx - size * 0.08, cy - size * 0.18, size * 0.18, 0, Math.PI * 2)
  ctx.fill()
}

function drawPerson(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  const headR = size * 0.1
  // Body
  ctx.fillStyle = '#555566'
  ctx.beginPath()
  ctx.ellipse(cx, cy + size * 0.1, size * 0.15, size * 0.3, 0, 0, Math.PI * 2)
  ctx.fill()
  // Head
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx, cy - size * 0.25, headR, 0, Math.PI * 2)
  ctx.fill()
  // Hair
  ctx.fillStyle = '#3a2a1a'
  ctx.beginPath()
  ctx.arc(cx, cy - size * 0.28, headR * 0.9, Math.PI, Math.PI * 2)
  ctx.fill()
}

function drawFlower(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  // Stem
  ctx.strokeStyle = '#4a8a3a'
  ctx.lineWidth = size * 0.06
  ctx.beginPath()
  ctx.moveTo(cx, cy + size * 0.3)
  ctx.lineTo(cx, cy + size * 0.8)
  ctx.stroke()
  // Petals
  const petalCount = 6
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2
    const px = cx + Math.cos(angle) * size * 0.25
    const py = cy + Math.sin(angle) * size * 0.25
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(px, py, size * 0.15, 0, Math.PI * 2)
    ctx.fill()
  }
  // Center
  ctx.fillStyle = '#ffcc00'
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.1, 0, Math.PI * 2)
  ctx.fill()
}

function drawBokehCircles(ctx: CanvasRenderingContext2D, cx: number, cy: number, blurRadius: number, color: string) {
  const count = Math.min(Math.floor(blurRadius / 2), 8)
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + blurRadius * 0.1
    const dist = blurRadius * 0.6 + Math.sin(i * 1.5) * blurRadius * 0.3
    const bx = cx + Math.cos(angle) * dist
    const by = cy + Math.sin(angle) * dist
    const r = blurRadius * 0.3 + Math.sin(i * 2.3) * blurRadius * 0.15
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.globalAlpha = 0.12 + Math.sin(i * 1.7) * 0.05
    ctx.beginPath()
    ctx.arc(bx, by, Math.max(r, 2), 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((num >> 16) & 0xff) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return `rgb(${r},${g},${b})`
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  focusDistance: number,
  aperture: number,
  sceneKey: SceneKey,
) {
  const scene = SCENES[sceneKey]

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5)
  skyGrad.addColorStop(0, scene.skyColor)
  skyGrad.addColorStop(1, lighten(scene.skyColor, -30))
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, w, h * 0.55)

  // Ground
  const groundGrad = ctx.createLinearGradient(0, h * 0.5, 0, h)
  groundGrad.addColorStop(0, scene.groundColor)
  groundGrad.addColorStop(1, lighten(scene.groundColor, -20))
  ctx.fillStyle = groundGrad
  ctx.fillRect(0, h * 0.5, w, h * 0.5)

  // Focus plane indicator
  const focusY = h * 0.1 + (1 - focusDistance) * h * 0.8
  ctx.save()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
  ctx.lineWidth = 1
  ctx.setLineDash([6, 4])
  ctx.beginPath()
  ctx.moveTo(0, focusY)
  ctx.lineTo(w, focusY)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()

  // Sort objects back-to-front (highest depth first)
  const sorted = [...scene.objects].sort((a, b) => b.depth - a.depth)

  for (const obj of sorted) {
    const blur = calcCircleOfConfusion(obj.depth, focusDistance, aperture, 20)
    const px = obj.x * w
    const py = obj.y * h

    ctx.save()

    // Apply CSS blur filter
    if (blur > 0.5) {
      ctx.filter = `blur(${blur}px)`
    }

    switch (obj.type) {
      case 'circle':
        ctx.fillStyle = obj.color
        ctx.beginPath()
        ctx.arc(px, py, obj.size, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'rect':
        ctx.fillStyle = obj.color
        ctx.fillRect(px - obj.size * 0.5, py - obj.size * 0.3, obj.size, obj.size * 0.6)
        break
      case 'tree':
        drawTree(ctx, px, py, obj.size, obj.color)
        break
      case 'person':
        drawPerson(ctx, px, py, obj.size, obj.color)
        break
      case 'flower':
        drawFlower(ctx, px, py, obj.size, obj.color)
        break
    }

    ctx.filter = 'none'

    // Add decorative bokeh circles for heavily blurred objects
    if (blur > 5) {
      drawBokehCircles(ctx, px, py, blur, obj.color)
    }

    ctx.restore()
  }
}

export function DoFCanvas({ focusDistance, aperture, scene, className }: DoFCanvasProps) {
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
    ctx.clearRect(0, 0, w, h)

    drawScene(ctx, w, h, focusDistance, aperture, scene)
  }, [focusDistance, aperture, scene])

  useEffect(() => {
    render()

    const container = containerRef.current
    if (!container) return

    const ro = new ResizeObserver(() => {
      render()
    })
    ro.observe(container)

    return () => ro.disconnect()
  }, [render])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        className={className}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
