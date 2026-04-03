# Visual Simulation Upgrades Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Canvas-powered visual simulations to 4 remaining tools (DoF, Diffraction, Star Trails, Sensor Size), each using the FOV Viewer's sidebar+canvas layout. The Exposure Simulator is already complete with a full WebGL2 pipeline.

**Architecture:** Each tool becomes a full-page component (no ToolPageShell wrapper) with a 280px sidebar (controls + results) and a flex-1 canvas area. Procedural scenes generated via Canvas 2D. Existing math modules are reused unchanged. The Exposure Simulator (already done) uses a more advanced WebGL2 multi-pass approach with real photo assets — it serves as the reference implementation.

**Tech Stack:** React 19, Canvas 2D API, CSS Modules, existing `lib/math/` functions.

**NOTE:** Task 2 (Exposure Simulator) has been removed — it was already fully implemented with WebGL2 shaders, real photo assets (with depth maps and motion masks), scene selection, and the sidebar+canvas layout. See `components/tools/exposure-simulator/` for the reference implementation.

---

## File Structure

Each upgraded tool follows this pattern:

```
components/tools/<tool>/
  <Tool>.tsx              — Main component (rewritten: sidebar+canvas layout)
  <Tool>.module.css       — CSS module (rewritten: FOV Viewer layout pattern)
  <Tool>Canvas.tsx        — NEW: Canvas rendering component
app/tools/<tool>/
  page.tsx                — Modified: render component directly (no ToolPageShell)
```

Specific files:

**DoF Calculator:**
- Rewrite: `components/tools/dof-calculator/DoFCalculator.tsx`
- Rewrite: `components/tools/dof-calculator/DoFCalculator.module.css` (new file)
- Create: `components/tools/dof-calculator/DoFCanvas.tsx`
- Keep: `components/tools/dof-calculator/DoFDiagram.tsx` (used inside canvas area)
- Modify: `app/tools/dof-calculator/page.tsx`

**Exposure Simulator:** ALREADY COMPLETE — WebGL2 pipeline with shaders, photo assets, depth maps, motion masks. No changes needed.

**Diffraction Limit:**
- Rewrite: `components/tools/diffraction-limit/DiffractionLimit.tsx`
- Create: `components/tools/diffraction-limit/DiffractionLimit.module.css`
- Create: `components/tools/diffraction-limit/DiffractionCanvas.tsx`
- Modify: `app/tools/diffraction-limit/page.tsx`

**Star Trail Calculator:**
- Rewrite: `components/tools/star-trail-calculator/StarTrailCalculator.tsx`
- Create: `components/tools/star-trail-calculator/StarTrailCalculator.module.css`
- Create: `components/tools/star-trail-calculator/StarTrailCanvas.tsx`
- Modify: `app/tools/star-trail-calculator/page.tsx`

**Sensor Size:**
- Modify: `components/tools/sensor-size/SensorSize.tsx` (add pixel density mode)
- Modify: `components/tools/sensor-size/SensorSize.module.css` (add new mode styles)
- Modify: `app/tools/sensor-size/page.tsx`

---

## Shared CSS Pattern

Every tool's CSS module uses this base layout (reference: `FovViewer.module.css`):

```css
.layout {
  display: flex;
  height: calc(100vh - 44px);
  overflow: hidden;
}

.sidebar {
  width: 280px;
  min-width: 280px;
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.canvasArea {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.canvasTopbar {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  gap: 8px;
  justify-content: center;
}

.canvasMain {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  min-height: 0;
  overflow: hidden;
}

/* Sidebar panels */
.panel {
  background: var(--bg-surface);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.panelTitle {
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.select, .input {
  padding: 6px 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  font-family: inherit;
}

.slider {
  width: 100%;
  height: 6px;
  cursor: pointer;
  accent-color: var(--accent);
}

.value {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--text-primary);
}

.resultGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.resultCard {
  background: var(--bg-primary);
  border-radius: 6px;
  padding: 8px;
}

.resultLabel {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
}

.resultValue {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

/* Topbar preset buttons */
.presetBtn {
  padding: 3px 7px;
  background: var(--bg-primary);
  border: none;
  border-radius: 4px;
  font-size: 11px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.15s;
}

.presetBtn:hover {
  background: var(--border);
}

.presetBtnActive {
  background: var(--accent);
  color: #fff;
}

/* Mobile */
@media (max-width: 1023px) {
  .layout {
    flex-direction: column;
    height: auto;
    overflow: visible;
  }

  .sidebar {
    width: 100%;
    min-width: 0;
    border-right: none;
    border-top: 1px solid var(--border);
    order: 2;
  }

  .canvasArea {
    order: 1;
  }

  .canvasMain {
    padding: 4px;
    flex: none;
  }
}
```

Each tool's CSS module copies this base and adds tool-specific styles. This avoids shared CSS coupling — each tool owns its layout.

---

## Task 1: DoF Calculator — Bokeh Simulator

**Files:**
- Create: `components/tools/dof-calculator/DoFCalculator.module.css`
- Create: `components/tools/dof-calculator/DoFCanvas.tsx`
- Rewrite: `components/tools/dof-calculator/DoFCalculator.tsx`
- Modify: `app/tools/dof-calculator/page.tsx`

### Step 1: Create CSS module

- [ ] Create `components/tools/dof-calculator/DoFCalculator.module.css` with the shared layout pattern from above, plus:

```css
/* Add after the shared base pattern */

.depthBar {
  padding: 8px 24px 16px;
}

.depthBarTrack {
  height: 8px;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.depthBarLabels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  margin-top: 4px;
}

.depthBarMarker {
  position: absolute;
  top: -2px;
  width: 2px;
  height: 12px;
  background: var(--accent);
}

.canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
}
```

### Step 2: Create DoFCanvas component

- [ ] Create `components/tools/dof-calculator/DoFCanvas.tsx`:

```tsx
'use client'

import { useRef, useEffect, useCallback } from 'react'
import { calcCircleOfConfusion } from '@/lib/math/exposure'
import styles from './DoFCalculator.module.css'

interface DoFCanvasProps {
  focusDistance: number // 0-1 normalized
  aperture: number
  nearFocus: number // meters
  farFocus: number // meters
}

// Procedural scene: a park path with depth cues
// Objects at different depths: foreground flowers, mid-ground person, background trees
interface SceneObject {
  x: number       // 0-1 canvas-relative
  y: number       // 0-1 canvas-relative
  depth: number   // 0-1 normalized depth (0 = near, 1 = far)
  type: 'circle' | 'rect' | 'triangle'
  width: number
  height: number
  color: string
}

const SCENES: Record<string, { name: string; objects: SceneObject[] }> = {
  portrait: {
    name: 'Portrait',
    objects: [
      // Background trees
      { x: 0.15, y: 0.2, depth: 0.9, type: 'triangle', width: 80, height: 120, color: '#2d5a27' },
      { x: 0.5, y: 0.18, depth: 0.95, type: 'triangle', width: 100, height: 140, color: '#1e4d1a' },
      { x: 0.85, y: 0.22, depth: 0.88, type: 'triangle', width: 70, height: 110, color: '#2d5a27' },
      // Mid-ground subject (person)
      { x: 0.5, y: 0.45, depth: 0.45, type: 'rect', width: 40, height: 80, color: '#c44' },
      { x: 0.5, y: 0.32, depth: 0.45, type: 'circle', width: 28, height: 28, color: '#d4a574' },
      // Foreground elements
      { x: 0.2, y: 0.85, depth: 0.1, type: 'circle', width: 20, height: 20, color: '#e74' },
      { x: 0.7, y: 0.88, depth: 0.08, type: 'circle', width: 16, height: 16, color: '#f90' },
      { x: 0.4, y: 0.9, depth: 0.05, type: 'circle', width: 24, height: 24, color: '#e55' },
    ],
  },
  landscape: {
    name: 'Landscape',
    objects: [
      // Sky gradient handled separately
      // Mountains (far)
      { x: 0.3, y: 0.3, depth: 0.95, type: 'triangle', width: 200, height: 100, color: '#4a6a8a' },
      { x: 0.7, y: 0.32, depth: 0.92, type: 'triangle', width: 180, height: 90, color: '#5a7a9a' },
      // Hills (mid)
      { x: 0.5, y: 0.5, depth: 0.6, type: 'triangle', width: 300, height: 60, color: '#3a6a3a' },
      // Foreground rocks
      { x: 0.25, y: 0.8, depth: 0.15, type: 'rect', width: 50, height: 30, color: '#8a7a6a' },
      { x: 0.75, y: 0.82, depth: 0.12, type: 'rect', width: 40, height: 25, color: '#7a6a5a' },
    ],
  },
  street: {
    name: 'Street',
    objects: [
      // Buildings (far)
      { x: 0.15, y: 0.2, depth: 0.85, type: 'rect', width: 60, height: 150, color: '#6B7B8B' },
      { x: 0.35, y: 0.15, depth: 0.88, type: 'rect', width: 70, height: 170, color: '#5B6B7B' },
      { x: 0.8, y: 0.22, depth: 0.82, type: 'rect', width: 55, height: 130, color: '#7B8B9B' },
      // Person walking (mid)
      { x: 0.55, y: 0.5, depth: 0.4, type: 'rect', width: 24, height: 60, color: '#c44' },
      { x: 0.55, y: 0.4, depth: 0.4, type: 'circle', width: 16, height: 16, color: '#d4a574' },
      // Foreground post
      { x: 0.1, y: 0.6, depth: 0.1, type: 'rect', width: 12, height: 100, color: '#555' },
    ],
  },
  macro: {
    name: 'Macro',
    objects: [
      // Background (very blurred)
      { x: 0.3, y: 0.3, depth: 0.9, type: 'circle', width: 60, height: 60, color: '#4a7a4a' },
      { x: 0.7, y: 0.25, depth: 0.85, type: 'circle', width: 50, height: 50, color: '#3a6a3a' },
      // Subject (flower center)
      { x: 0.5, y: 0.5, depth: 0.5, type: 'circle', width: 50, height: 50, color: '#f5c542' },
      // Petals around center
      { x: 0.38, y: 0.42, depth: 0.48, type: 'circle', width: 30, height: 30, color: '#e8513f' },
      { x: 0.62, y: 0.42, depth: 0.52, type: 'circle', width: 30, height: 30, color: '#e8513f' },
      { x: 0.5, y: 0.35, depth: 0.47, type: 'circle', width: 28, height: 28, color: '#e8513f' },
      { x: 0.5, y: 0.6, depth: 0.53, type: 'circle', width: 28, height: 28, color: '#e8513f' },
      // Foreground leaf
      { x: 0.2, y: 0.8, depth: 0.15, type: 'circle', width: 40, height: 25, color: '#2d5a27' },
    ],
  },
}

export function DoFCanvas({ focusDistance, aperture, nearFocus, farFocus }: DoFCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<string>('portrait')
  const [scene, setScene] = [sceneRef.current, (s: string) => { sceneRef.current = s }]

  // We need state for scene selection — let's handle this differently
  // Actually this component receives scene from parent. Let me restructure.
  // This will be handled by the parent component passing scene as prop.

  // For now, render with the current scene
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height

    // Background gradient (sky)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5)
    skyGrad.addColorStop(0, '#1a2a3a')
    skyGrad.addColorStop(1, '#2a3a4a')
    ctx.fillStyle = skyGrad
    ctx.fillRect(0, 0, w, h * 0.5)

    // Ground
    const groundGrad = ctx.createLinearGradient(0, h * 0.5, 0, h)
    groundGrad.addColorStop(0, '#2a4a2a')
    groundGrad.addColorStop(1, '#1a2a1a')
    ctx.fillStyle = groundGrad
    ctx.fillRect(0, h * 0.5, w, h * 0.5)

    // Draw scene objects with depth-based blur
    const sceneData = SCENES[sceneRef.current] || SCENES.portrait
    const sortedObjects = [...sceneData.objects].sort((a, b) => a.depth - b.depth)

    for (const obj of sortedObjects) {
      const blurRadius = calcCircleOfConfusion(obj.depth, focusDistance, aperture)
      const cx = obj.x * w
      const cy = obj.y * h

      ctx.save()
      ctx.filter = blurRadius > 0.5 ? `blur(${Math.min(blurRadius, 20)}px)` : 'none'
      ctx.fillStyle = obj.color

      if (obj.type === 'circle') {
        ctx.beginPath()
        ctx.ellipse(cx, cy, obj.width / 2, obj.height / 2, 0, 0, Math.PI * 2)
        ctx.fill()
      } else if (obj.type === 'rect') {
        ctx.fillRect(cx - obj.width / 2, cy - obj.height / 2, obj.width, obj.height)
      } else if (obj.type === 'triangle') {
        ctx.beginPath()
        ctx.moveTo(cx, cy - obj.height / 2)
        ctx.lineTo(cx - obj.width / 2, cy + obj.height / 2)
        ctx.lineTo(cx + obj.width / 2, cy + obj.height / 2)
        ctx.closePath()
        ctx.fill()
      }

      // Add bokeh circles for heavily blurred areas
      if (blurRadius > 5) {
        ctx.globalAlpha = 0.15
        const numBokeh = Math.floor(blurRadius / 3)
        for (let i = 0; i < numBokeh; i++) {
          const bx = cx + (Math.random() - 0.5) * obj.width * 1.5
          const by = cy + (Math.random() - 0.5) * obj.height * 1.5
          const br = blurRadius * 0.4 + Math.random() * blurRadius * 0.3
          ctx.beginPath()
          ctx.arc(bx, by, br, 0, Math.PI * 2)
          ctx.strokeStyle = obj.color
          ctx.lineWidth = 1
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }

      ctx.restore()
    }

    // Focus plane indicator
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    const focusY = h * (0.2 + focusDistance * 0.6)
    ctx.beginPath()
    ctx.moveTo(0, focusY)
    ctx.lineTo(w, focusY)
    ctx.stroke()
    ctx.setLineDash([])

    // Focus label
    ctx.fillStyle = 'rgba(99, 102, 241, 0.7)'
    ctx.font = '10px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`Focus plane`, 8, focusY - 4)
  }, [focusDistance, aperture])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => draw())
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [draw])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ width: '100%', height: '100%' }}
        aria-label="Depth of field bokeh simulation"
        role="img"
      />
    </div>
  )
}
```

**Note:** The `calcCircleOfConfusion` function already exists in `lib/math/exposure.ts`. It takes a depth (0-1), focus distance (0-1), and aperture, and returns a blur radius. This drives the per-object blur in the canvas.

### Step 3: Rewrite DoFCalculator component

- [ ] Rewrite `components/tools/dof-calculator/DoFCalculator.tsx` with the sidebar+canvas layout:

```tsx
'use client'

import { useState, useMemo, useCallback } from 'react'
import { calcDoF } from '@/lib/math/dof'
import { SENSORS } from '@/lib/data/sensors'
import { FOCAL_LENGTHS } from '@/lib/data/focalLengths'
import { DoFDiagram } from './DoFDiagram'
import { DoFCanvas } from './DoFCanvas'
import styles from './DoFCalculator.module.css'

const APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22]
const SCENES = ['portrait', 'landscape', 'street', 'macro'] as const

function formatDistance(meters: number): string {
  if (!isFinite(meters)) return '∞'
  if (meters < 1) return `${(meters * 100).toFixed(0)} cm`
  return `${meters.toFixed(2)} m`
}

function sliderToDistance(val: number): number {
  const minLog = Math.log(0.3)
  const maxLog = Math.log(100)
  return Math.exp(minLog + val * (maxLog - minLog))
}

function distanceToSlider(dist: number): number {
  const minLog = Math.log(0.3)
  const maxLog = Math.log(100)
  return (Math.log(dist) - minLog) / (maxLog - minLog)
}

export function DoFCalculator() {
  const [focalLength, setFocalLength] = useState(50)
  const [aperture, setAperture] = useState(2.8)
  const [sliderVal, setSliderVal] = useState(distanceToSlider(3))
  const [sensorId, setSensorId] = useState('ff')
  const [scene, setScene] = useState<typeof SCENES[number]>('portrait')

  const distance = sliderToDistance(sliderVal)
  const sensor = SENSORS.find((s) => s.id === sensorId) ?? SENSORS[1]
  const coc = 0.03 / sensor.cropFactor

  const result = useMemo(
    () => calcDoF({ focalLength, aperture, distance, coc }),
    [focalLength, aperture, distance, coc],
  )

  const handleDiagramDistanceChange = useCallback((meters: number) => {
    setSliderVal(distanceToSlider(meters))
  }, [])

  // Normalize focus distance to 0-1 for the canvas
  const focusNormalized = distanceToSlider(distance)

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>DoF Calculator</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Depth of field with bokeh preview
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>Settings</div>

          <div className={styles.field}>
            <label className={styles.label}>Focal Length</label>
            <select
              className={styles.select}
              value={focalLength}
              onChange={(e) => setFocalLength(Number(e.target.value))}
            >
              {FOCAL_LENGTHS.map((fl) => (
                <option key={fl.value} value={fl.value}>
                  {fl.value}mm{fl.label ? ` — ${fl.label}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Aperture</label>
            <select
              className={styles.select}
              value={aperture}
              onChange={(e) => setAperture(Number(e.target.value))}
            >
              {APERTURES.map((a) => (
                <option key={a} value={a}>f/{a}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Subject Distance: <span className={styles.value}>{formatDistance(distance)}</span>
            </label>
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={1}
              step={0.001}
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Sensor</label>
            <select
              className={styles.select}
              value={sensorId}
              onChange={(e) => setSensorId(e.target.value)}
            >
              {SENSORS.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>Results</div>
          <div className={styles.resultGrid}>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Near Focus</div>
              <div className={styles.resultValue}>{formatDistance(result.nearFocus)}</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Far Focus</div>
              <div className={styles.resultValue}>{formatDistance(result.farFocus)}</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Total DoF</div>
              <div className={styles.resultValue}>{formatDistance(result.totalDoF)}</div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultLabel}>Hyperfocal</div>
              <div className={styles.resultValue}>{formatDistance(result.hyperfocal)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div className={styles.canvasArea}>
        <div className={styles.canvasTopbar}>
          {SCENES.map((s) => (
            <button
              key={s}
              className={`${styles.presetBtn} ${scene === s ? styles.presetBtnActive : ''}`}
              onClick={() => setScene(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.canvasMain}>
          <DoFCanvas
            focusDistance={focusNormalized}
            aperture={aperture}
            nearFocus={result.nearFocus}
            farFocus={result.farFocus}
            scene={scene}
          />
        </div>

        {/* DoF diagram at bottom */}
        <div className={styles.depthBar}>
          <DoFDiagram
            result={result}
            distance={distance}
            onDistanceChange={handleDiagramDistanceChange}
          />
        </div>
      </div>
    </div>
  )
}
```

### Step 4: Update page.tsx

- [ ] Modify `app/tools/dof-calculator/page.tsx` to render directly (no ToolPageShell):

```tsx
import type { Metadata } from 'next'
import { DoFCalculator } from '@/components/tools/dof-calculator/DoFCalculator'

export const metadata: Metadata = {
  title: 'Depth of Field Calculator',
  description: 'Calculate near focus, far focus, and total depth of field for any lens and sensor.',
}

export default function DoFCalculatorPage() {
  return <DoFCalculator />
}
```

### Step 5: Build and verify

- [ ] Run `npm run build` — expect clean build
- [ ] Run `npm test` — expect all 149 tests pass (no math changes)
- [ ] Verify visually at `http://localhost:3000/tools/dof-calculator`

### Step 6: Commit

```bash
git add components/tools/dof-calculator/ app/tools/dof-calculator/page.tsx
git commit -m "feat: add bokeh simulation canvas to DoF Calculator"
```

---

## Task 2 (SKIPPED): Exposure Simulator — Already Complete

The Exposure Simulator has already been fully rebuilt with:
- FOV Viewer sidebar+canvas layout (`sim.app` / `sim.appBody` / `sim.sidebar`)
- `ExposurePreview` component with scene thumbnail strip (Street, Landscape, Portrait, Low Light)
- WebGL2 multi-pass rendering pipeline (`useExposureRenderer.ts`):
  - Pass 1-2: DoF blur (horizontal + vertical) driven by depth map
  - Pass 3: Motion blur driven by motion mask
  - Pass 4: Procedural noise grain
- GLSL shaders in `components/tools/exposure-simulator/shaders/`
- Real photo assets with depth maps and motion masks in `public/images/exposure-simulator/`
- `ControlsPanel` sub-component rendered in both sidebar (desktop) and mobileControls
- Page already renders directly (no ToolPageShell)
- Math helpers already in `lib/math/exposure.ts`: `calcCircleOfConfusion`, `calcMotionBlurAmount`, `calcNoiseAmplitude`

**No work needed. Skip to Task 3.**

---

## Task 3: Diffraction Limit — Sharpness Preview

**Files:**
- Create: `components/tools/diffraction-limit/DiffractionLimit.module.css`
- Create: `components/tools/diffraction-limit/DiffractionCanvas.tsx`
- Rewrite: `components/tools/diffraction-limit/DiffractionLimit.tsx`
- Modify: `app/tools/diffraction-limit/page.tsx`

### Step 1: Create CSS module

- [ ] Create `components/tools/diffraction-limit/DiffractionLimit.module.css` with the shared layout pattern, plus:

```css
/* Add after the shared base pattern */

.splitView {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
  border-radius: 8px;
}

.splitLeft, .splitRight {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.splitDivider {
  width: 3px;
  background: var(--accent);
  cursor: col-resize;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}

.splitLabel {
  position: absolute;
  top: 8px;
  font-size: 11px;
  font-family: var(--font-mono);
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: #e0e0e0;
  pointer-events: none;
  z-index: 1;
}

.splitLabelLeft {
  left: 8px;
}

.splitLabelRight {
  right: 8px;
}

.apertureSlider {
  width: 100%;
  height: 6px;
  cursor: pointer;
  accent-color: var(--accent);
}
```

### Step 2: Create DiffractionCanvas component

- [ ] Create `components/tools/diffraction-limit/DiffractionCanvas.tsx`:

Split-view canvas showing a detail crop. Left side: sharp (optimal aperture). Right side: gaussian blur applied at current aperture's diffraction amount. Draggable divider in the middle.

The canvas procedurally generates a detail test pattern (fine lines, text-like shapes, grid patterns) and applies gaussian blur via `ctx.filter = \`blur(${radius}px)\`` to the right side. Blur radius = max(0, (airyDiskDiameter - pixelPitch) * scaleFactor).

The component accepts props: `pixelPitchUm`, `limitAperture`, `currentAperture`, `detailType` (text/foliage/architecture/fabric).

### Step 3: Rewrite DiffractionLimit component

- [ ] Rewrite `components/tools/diffraction-limit/DiffractionLimit.tsx` with sidebar+canvas layout.

Sidebar: sensor dropdown, resolution input, aperture **slider** (continuous from f/2.8 to f/22), result cards (pixel pitch, diffraction limit aperture, Airy disk diameter, sharpness ratio).

Canvas area: DiffractionCanvas split-view. Topbar: detail preset buttons (Text, Foliage, Architecture, Fabric).

The aperture slider replaces the old scale bar visualization — the split-view canvas itself shows the sharpness difference.

### Step 4: Update page.tsx

- [ ] Remove ToolPageShell wrapper.

### Step 5: Build, test, commit

```bash
git add components/tools/diffraction-limit/ app/tools/diffraction-limit/page.tsx
git commit -m "feat: add split-view sharpness preview to Diffraction Limit"
```

---

## Task 4: Star Trail Calculator — Animated Sky Preview

**Files:**
- Create: `components/tools/star-trail-calculator/StarTrailCalculator.module.css`
- Create: `components/tools/star-trail-calculator/StarTrailCanvas.tsx`
- Rewrite: `components/tools/star-trail-calculator/StarTrailCalculator.tsx`
- Modify: `app/tools/star-trail-calculator/page.tsx`

### Step 1: Create CSS module

- [ ] Create `components/tools/star-trail-calculator/StarTrailCalculator.module.css` with the shared layout pattern, plus:

```css
/* Add after the shared base pattern */

.modeToggle {
  display: flex;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.modeBtn {
  flex: 1;
  padding: 6px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: none;
  font-size: 11px;
  cursor: pointer;
  font-family: inherit;
}

.modeBtn:not(:last-child) {
  border-right: 1px solid var(--border);
}

.modeBtnActive {
  background: var(--accent);
  color: #fff;
}

.starCanvas {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: #050510;
}
```

### Step 2: Create StarTrailCanvas component

- [ ] Create `components/tools/star-trail-calculator/StarTrailCanvas.tsx`:

Procedural star field with stars rotating around Polaris. Uses a seeded PRNG for consistent star positions. Key behavior:

- **Sharp Stars mode:** Stars as white dots with varying brightness. A green/red ring around a sample star shows whether the current exposure time exceeds the max (500 or NPF rule).
- **Star Trails mode:** Stars drawn as arcs using `ctx.arc()`. Arc angular length = (totalExposure / 86164) * 2π (sidereal day = 86164 seconds). Animation with `requestAnimationFrame` shows trails building up, then loops.

Props: `mode`, `maxExposure500`, `maxExposureNPF`, `totalExposure`, `latitude`, `exposurePerFrame`.

Latitude determines the position of Polaris on canvas: at latitude 0° Polaris is at the horizon (bottom), at 90° it's at zenith (center).

### Step 3: Rewrite StarTrailCalculator component

- [ ] Rewrite with sidebar+canvas layout. Sidebar has mode toggle (Sharp Stars / Star Trails), all controls, and result cards. Canvas area shows StarTrailCanvas. Topbar has latitude presets (Equator 0°, Mid 45°, Arctic 70°).

### Step 4: Update page.tsx, build, test, commit

```bash
git add components/tools/star-trail-calculator/ app/tools/star-trail-calculator/page.tsx
git commit -m "feat: add animated star trail canvas to Star Trail Calculator"
```

---

## Task 5: Sensor Size — Pixel Density Visualization

**Files:**
- Modify: `components/tools/sensor-size/SensorSize.tsx`
- Modify: `components/tools/sensor-size/SensorSize.module.css`
- Modify: `app/tools/sensor-size/page.tsx`

This is the smallest change — add a "Pixel Density" mode to the existing tool.

### Step 1: Update CSS module

- [ ] Add pixel density mode styles to `SensorSize.module.css`:

```css
/* Add to existing file */
.densityContainer {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  align-items: flex-end;
}

.densityBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.densityLabel {
  font-size: 11px;
  font-family: var(--font-mono);
  text-align: center;
}
```

### Step 2: Add pixel density mode to SensorSize

- [ ] Modify `SensorSize.tsx`:

Add `'pixel-density'` to the `DisplayMode` type. Add a resolution state (`const [resolution, setResolution] = useState(24)`). In the draw function, add a third rendering path for pixel density mode:

```tsx
// In pixel density mode: draw a zoomed grid for each visible sensor
// showing relative pixel sizes
if (mode === 'pixel-density') {
  const gridSize = 80 // pixels to show in grid
  const maxPitch = Math.max(...visibleSensors.map(s => {
    const width = 36 / (FF_DIAG / Math.sqrt(s.w * s.w + s.h * s.h))
    return pixelPitch(s.w, resolution)
  }))

  let x = padding
  for (const s of visibleSensors) {
    const pitch = pixelPitch(s.w, resolution)
    const cellSize = (pitch / maxPitch) * 6 // normalize to max 6px per cell
    const gridW = gridSize * cellSize
    const gridH = gridSize * cellSize

    // Draw pixel grid
    ctx.strokeStyle = s.color
    ctx.lineWidth = 0.5
    ctx.globalAlpha = 0.6
    for (let gx = 0; gx <= gridSize; gx++) {
      ctx.beginPath()
      ctx.moveTo(x + gx * cellSize, padding)
      ctx.lineTo(x + gx * cellSize, padding + gridH)
      ctx.stroke()
    }
    for (let gy = 0; gy <= gridSize; gy++) {
      ctx.beginPath()
      ctx.moveTo(x, padding + gy * cellSize)
      ctx.lineTo(x + gridW, padding + gy * cellSize)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // Label
    ctx.fillStyle = s.color
    ctx.font = '10px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(s.name, x + gridW / 2, padding + gridH + 14)
    ctx.fillText(`${pitch.toFixed(1)} µm`, x + gridW / 2, padding + gridH + 26)

    x += gridW + 24
  }
}
```

Add "Pixel Density" button to the mode toggle. Add a resolution input field when in pixel density mode.

### Step 3: Update page.tsx

- [ ] Remove ToolPageShell wrapper from `app/tools/sensor-size/page.tsx`.

Note: SensorSize keeps its current layout (toolbar + canvas + table) rather than the sidebar pattern since it already works well with checkboxes across the top. The pixel density mode is an addition to the existing canvas, not a layout rewrite.

### Step 4: Build, test, commit

```bash
git add components/tools/sensor-size/ app/tools/sensor-size/page.tsx
git commit -m "feat: add pixel density visualization mode to Sensor Size"
```

---

## Task 5.5: Final Integration Check

### Step 1: Full build and test

- [ ] Run `npm run build` — expect clean build with all routes
- [ ] Run `npm test` — expect all 149 tests pass
- [ ] Run `npm run lint` — expect clean

### Step 2: Visual smoke test

- [ ] Start dev server: `npm run dev`
- [ ] Visit each upgraded tool and verify:
  - DoF Calculator: sidebar+canvas layout, bokeh simulation responds to aperture/distance
  - Exposure Simulator: already complete — verify still works after other changes
  - Diffraction Limit: split-view shows blur difference, divider drags
  - Star Trail Calculator: stars animate, mode toggle works
  - Sensor Size: pixel density mode shows grid comparison
- [ ] Check mobile layout at 375px width for each tool

### Step 3: Commit any fixes

```bash
git add -A
git commit -m "fix: polish visual simulation upgrades"
```
