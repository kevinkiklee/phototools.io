/**
 * Shared scene rendering used by DoFPhotoBands and DoFPhotoDepth.
 * Draws scenes without any blur (sharp), and also renders depth maps.
 */
import type { SceneKey } from './DoFCanvas'

interface SceneObject {
  depth: number
  type: 'circle' | 'rect' | 'person' | 'tree' | 'flower'
  x: number
  y: number
  size: number
  color: string
}

interface SceneDef {
  background: string
  groundColor: string
  skyColor: string
  objects: SceneObject[]
}

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

const SCENES: Record<SceneKey, SceneDef> = {
  portrait: {
    background: '#2d5a27',
    groundColor: '#3a6b33',
    skyColor: '#87CEEB',
    objects: [
      { depth: 0.95, type: 'tree', x: 0.15, y: 0.35, size: 80, color: '#2d5a27' },
      { depth: 0.9, type: 'tree', x: 0.85, y: 0.35, size: 70, color: '#347a2c' },
      { depth: 0.85, type: 'tree', x: 0.5, y: 0.3, size: 60, color: '#3a8a32' },
      { depth: 0.8, type: 'circle', x: 0.3, y: 0.5, size: 12, color: '#e8a060' },
      { depth: 0.75, type: 'circle', x: 0.7, y: 0.45, size: 10, color: '#d4a574' },
      { depth: 0.35, type: 'person', x: 0.5, y: 0.55, size: 100, color: '#d4956a' },
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
      { depth: 1.0, type: 'rect', x: 0.3, y: 0.25, size: 200, color: '#8090a0' },
      { depth: 0.95, type: 'rect', x: 0.7, y: 0.28, size: 180, color: '#7a8a9a' },
      { depth: 0.6, type: 'tree', x: 0.25, y: 0.4, size: 50, color: '#3a7a2a' },
      { depth: 0.55, type: 'tree', x: 0.65, y: 0.42, size: 45, color: '#4a8a3a' },
      { depth: 0.5, type: 'tree', x: 0.45, y: 0.45, size: 40, color: '#5a9a4a' },
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
      { depth: 0.95, type: 'rect', x: 0.15, y: 0.3, size: 120, color: '#6a6a7a' },
      { depth: 0.9, type: 'rect', x: 0.85, y: 0.25, size: 130, color: '#5a5a6a' },
      { depth: 0.7, type: 'circle', x: 0.35, y: 0.2, size: 14, color: '#ffdd88' },
      { depth: 0.75, type: 'circle', x: 0.65, y: 0.22, size: 12, color: '#ffcc66' },
      { depth: 0.4, type: 'person', x: 0.5, y: 0.6, size: 80, color: '#8a7060' },
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
      { depth: 1.0, type: 'circle', x: 0.3, y: 0.3, size: 40, color: '#80c060' },
      { depth: 0.95, type: 'circle', x: 0.7, y: 0.25, size: 35, color: '#90d070' },
      { depth: 0.85, type: 'circle', x: 0.5, y: 0.35, size: 30, color: '#a0e080' },
      { depth: 0.25, type: 'flower', x: 0.5, y: 0.5, size: 60, color: '#e06080' },
      { depth: 0.25, type: 'circle', x: 0.5, y: 0.48, size: 12, color: '#ffcc00' },
      { depth: 0.05, type: 'circle', x: 0.2, y: 0.7, size: 30, color: '#60a040' },
      { depth: 0.02, type: 'circle', x: 0.8, y: 0.75, size: 25, color: '#70b050' },
      { depth: 0.0, type: 'circle', x: 0.4, y: 0.9, size: 35, color: '#50a030' },
    ],
  },
}

export function getSceneDef(key: SceneKey): SceneDef {
  return SCENES[key]
}

export function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((num >> 16) & 0xff) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return `rgb(${r},${g},${b})`
}

function drawTree(ctx: Ctx, cx: number, cy: number, size: number, color: string) {
  ctx.fillStyle = '#5a4030'
  ctx.fillRect(cx - size * 0.06, cy, size * 0.12, size * 0.4)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx, cy - size * 0.1, size * 0.35, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = lighten(color, 20)
  ctx.beginPath()
  ctx.arc(cx - size * 0.08, cy - size * 0.18, size * 0.18, 0, Math.PI * 2)
  ctx.fill()
}

function drawPerson(ctx: Ctx, cx: number, cy: number, size: number, color: string) {
  const headR = size * 0.1
  ctx.fillStyle = '#555566'
  ctx.beginPath()
  ctx.ellipse(cx, cy + size * 0.1, size * 0.15, size * 0.3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx, cy - size * 0.25, headR, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#3a2a1a'
  ctx.beginPath()
  ctx.arc(cx, cy - size * 0.28, headR * 0.9, Math.PI, Math.PI * 2)
  ctx.fill()
}

function drawFlower(ctx: Ctx, cx: number, cy: number, size: number, color: string) {
  ctx.strokeStyle = '#4a8a3a'
  ctx.lineWidth = size * 0.06
  ctx.beginPath()
  ctx.moveTo(cx, cy + size * 0.3)
  ctx.lineTo(cx, cy + size * 0.8)
  ctx.stroke()
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    const px = cx + Math.cos(angle) * size * 0.25
    const py = cy + Math.sin(angle) * size * 0.25
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(px, py, size * 0.15, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#ffcc00'
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.1, 0, Math.PI * 2)
  ctx.fill()
}

function drawObject(ctx: Ctx, obj: SceneObject, w: number, h: number) {
  const px = obj.x * w
  const py = obj.y * h
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
}

/** Draw the full scene with all objects, no blur applied. */
export function drawSceneSharp(ctx: Ctx, w: number, h: number, sceneKey: SceneKey) {
  const scene = SCENES[sceneKey]

  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5)
  skyGrad.addColorStop(0, scene.skyColor)
  skyGrad.addColorStop(1, lighten(scene.skyColor, -30))
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, w, h * 0.55)

  const groundGrad = ctx.createLinearGradient(0, h * 0.5, 0, h)
  groundGrad.addColorStop(0, scene.groundColor)
  groundGrad.addColorStop(1, lighten(scene.groundColor, -20))
  ctx.fillStyle = groundGrad
  ctx.fillRect(0, h * 0.5, w, h * 0.5)

  const sorted = [...scene.objects].sort((a, b) => b.depth - a.depth)
  for (const obj of sorted) {
    drawObject(ctx, obj, w, h)
  }
}

/**
 * Render a grayscale depth map.
 * White (255) = far (depth 1.0), Black (0) = near (depth 0.0).
 */
export function drawDepthMap(ctx: Ctx, w: number, h: number, sceneKey: SceneKey) {
  const scene = SCENES[sceneKey]

  // Sky = far
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55)
  skyGrad.addColorStop(0, '#ffffff')
  skyGrad.addColorStop(1, '#cccccc')
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, w, h * 0.55)

  // Ground = mid to near
  const groundGrad = ctx.createLinearGradient(0, h * 0.5, 0, h)
  groundGrad.addColorStop(0, '#808080')
  groundGrad.addColorStop(1, '#000000')
  ctx.fillStyle = groundGrad
  ctx.fillRect(0, h * 0.5, w, h * 0.5)

  // Objects drawn as solid gray at their depth brightness
  const sorted = [...scene.objects].sort((a, b) => b.depth - a.depth)
  for (const obj of sorted) {
    const v = Math.round(obj.depth * 255)
    const depthObj: SceneObject = { ...obj, color: `rgb(${v},${v},${v})` }
    drawObject(ctx, depthObj, w, h)
  }
}
