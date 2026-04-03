/**
 * Generate placeholder images for the EV simulator.
 * Run with: node scripts/generate-ev-placeholders.mjs
 */
import { createCanvas } from 'canvas'
import { mkdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WIDTH = 1200
const HEIGHT = 800
const OUT = join(__dirname, '..', 'public', 'images', 'exposure-simulator')

mkdirSync(OUT, { recursive: true })

const scenes = [
  { name: 'street', bgColor: '#2a2a3e', fgColor: '#5a7a9a' },
  { name: 'landscape', bgColor: '#1a3a2a', fgColor: '#4a8a5a' },
  { name: 'portrait', bgColor: '#3a2a2a', fgColor: '#9a6a5a' },
  { name: 'lowlight', bgColor: '#0a0a1e', fgColor: '#3a3a5e' },
]

for (const scene of scenes) {
  // Base photo
  const photoCanvas = createCanvas(WIDTH, HEIGHT)
  const pCtx = photoCanvas.getContext('2d')
  const grad = pCtx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  grad.addColorStop(0, scene.bgColor)
  grad.addColorStop(1, scene.fgColor)
  pCtx.fillStyle = grad
  pCtx.fillRect(0, 0, WIDTH, HEIGHT)
  pCtx.fillStyle = '#ffffff40'
  pCtx.fillRect(WIDTH * 0.35, HEIGHT * 0.2, WIDTH * 0.3, HEIGHT * 0.6)
  pCtx.fillStyle = '#ffffff80'
  pCtx.font = '48px sans-serif'
  pCtx.textAlign = 'center'
  pCtx.fillText(scene.name.toUpperCase(), WIDTH / 2, HEIGHT / 2)
  writeFileSync(join(OUT, `${scene.name}.jpg`), photoCanvas.toBuffer('image/jpeg', { quality: 0.85 }))

  // Depth map
  const depthCanvas = createCanvas(WIDTH, HEIGHT)
  const dCtx = depthCanvas.getContext('2d')
  const dGrad = dCtx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 0, WIDTH / 2, HEIGHT / 2, WIDTH / 2)
  dGrad.addColorStop(0, '#ffffff')
  dGrad.addColorStop(0.3, '#cccccc')
  dGrad.addColorStop(1, '#000000')
  dCtx.fillStyle = dGrad
  dCtx.fillRect(0, 0, WIDTH, HEIGHT)
  writeFileSync(join(OUT, `${scene.name}-depth.png`), depthCanvas.toBuffer('image/png'))

  // Motion mask
  const motionCanvas = createCanvas(WIDTH, HEIGHT)
  const mCtx = motionCanvas.getContext('2d')
  mCtx.fillStyle = '#000000'
  mCtx.fillRect(0, 0, WIDTH, HEIGHT)
  mCtx.fillStyle = '#ffffff'
  mCtx.fillRect(WIDTH * 0.4, HEIGHT * 0.1, WIDTH * 0.2, HEIGHT * 0.8)
  const leftGrad = mCtx.createLinearGradient(WIDTH * 0.35, 0, WIDTH * 0.4, 0)
  leftGrad.addColorStop(0, '#000000')
  leftGrad.addColorStop(1, '#ffffff')
  mCtx.fillStyle = leftGrad
  mCtx.fillRect(WIDTH * 0.35, HEIGHT * 0.1, WIDTH * 0.05, HEIGHT * 0.8)
  const rightGrad = mCtx.createLinearGradient(WIDTH * 0.6, 0, WIDTH * 0.65, 0)
  rightGrad.addColorStop(0, '#ffffff')
  rightGrad.addColorStop(1, '#000000')
  mCtx.fillStyle = rightGrad
  mCtx.fillRect(WIDTH * 0.6, HEIGHT * 0.1, WIDTH * 0.05, HEIGHT * 0.8)
  writeFileSync(join(OUT, `${scene.name}-motion.png`), motionCanvas.toBuffer('image/png'))
}

console.log(`Generated ${scenes.length * 3} placeholder images in ${OUT}`)
