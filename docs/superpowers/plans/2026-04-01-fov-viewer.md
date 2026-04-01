# FOV Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static React app that lets photographers compare FOV across focal lengths and sensor sizes, deployed to GitHub Pages.

**Architecture:** React + TypeScript SPA built with Vite. All state lives in a single `useReducer` in App.tsx, synced bidirectionally with URL query params. Canvas element renders image + overlays. CSS custom properties handle theming.

**Tech Stack:** React 18, TypeScript, Vite, CSS custom properties, Canvas API, Clipboard API

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/data/sensors.ts` | Sensor preset definitions + types |
| `src/data/focalLengths.ts` | Focal length preset definitions + types |
| `src/utils/fov.ts` | FOV math: angles, frame width, crop ratios |
| `src/utils/export.ts` | Canvas → clipboard/PNG |
| `src/types.ts` | Shared types: AppState, LensConfig, ViewMode |
| `src/theme.css` | CSS custom properties for dark/light themes |
| `src/App.css` | Layout + component styles |
| `src/App.tsx` | Root: state reducer, layout, query sync |
| `src/main.tsx` | React entry point |
| `src/components/Canvas.tsx` | Image + overlay/side-by-side rendering |
| `src/components/LensPanel.tsx` | Focal length slider, presets, sensor select, FOV display |
| `src/components/Sidebar.tsx` | Desktop sidebar wrapper |
| `src/components/SceneStrip.tsx` | Image thumbnail selector |
| `src/components/FrameRuler.tsx` | Distance → frame width calculator |
| `src/components/ActionBar.tsx` | Copy image / Copy link buttons |
| `src/components/ModeToggle.tsx` | Overlay / Side-by-side toggle |
| `src/components/ThemeToggle.tsx` | Dark / Light toggle |
| `src/components/ShortcutOverlay.tsx` | Keyboard shortcut cheat sheet |
| `src/components/Toast.tsx` | Brief notification popup |
| `src/hooks/useQuerySync.ts` | Bidirectional state ↔ URL params |
| `src/hooks/useKeyboardShortcuts.ts` | Global keyboard handler |
| `index.html` | HTML shell |
| `vite.config.ts` | Vite config with base path |
| `tsconfig.json` | TypeScript config |
| `.github/workflows/deploy.yml` | GitHub Actions deploy |
| `public/404.html` | GitHub Pages SPA redirect |

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/App.css`, `src/theme.css`, `src/vite-env.d.ts`

- [ ] **Step 1: Initialize Vite React-TS project**

```bash
cd /Users/iser/workspace/fov-viewer
npm create vite@latest . -- --template react-ts
```

Accept overwriting existing files if prompted.

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

- [ ] **Step 3: Clean up boilerplate**

Delete default Vite boilerplate files:
- Delete `src/App.css` content (we'll rewrite)
- Delete `src/index.css`
- Delete `src/assets/react.svg`
- Delete `public/vite.svg`

Replace `src/App.tsx` with:

```tsx
import './theme.css'
import './App.css'

function App() {
  return <div className="app">FOV Viewer</div>
}

export default App
```

Replace `src/main.tsx` with:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 4: Create theme.css with CSS custom properties**

Create `src/theme.css`:

```css
:root,
[data-theme='dark'] {
  --bg: #0f0f14;
  --surface: #1a1a24;
  --border: #2a2a35;
  --text-primary: #e0e0e0;
  --text-secondary: #888888;
  --accent: #6366f1;
  --lens-a: #3b82f6;
  --lens-b: #f59e0b;
}

[data-theme='light'] {
  --bg: #f8f9fa;
  --surface: #ffffff;
  --border: #e2e4e8;
  --text-primary: #1a1a2e;
  --text-secondary: #6b7280;
  --accent: #6366f1;
  --lens-a: #3b82f6;
  --lens-b: #f59e0b;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text-primary);
  line-height: 1.5;
}
```

- [ ] **Step 5: Create App.css with layout skeleton**

Create `src/App.css`:

```css
.app {
  min-height: 100vh;
  display: flex;
}

.sidebar {
  width: 280px;
  min-width: 280px;
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.canvas-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.canvas-topbar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  gap: 8px;
}

.canvas-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.canvas-bottom {
  border-top: 1px solid var(--border);
  padding: 12px 16px;
}

/* Mobile layout */
@media (max-width: 1023px) {
  .app {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    min-width: 0;
    border-right: none;
    border-top: 1px solid var(--border);
  }

  .canvas-main {
    padding: 12px;
  }
}
```

- [ ] **Step 6: Update vite.config.ts for GitHub Pages**

Replace `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/fov-viewer/',
})
```

- [ ] **Step 7: Update index.html title**

Replace the `<title>` in `index.html`:

```html
<title>FOV Viewer — Focal Length Comparison Tool</title>
```

- [ ] **Step 8: Verify dev server starts**

```bash
npx vite --open
```

Expected: browser opens showing "FOV Viewer" text on dark background.

- [ ] **Step 9: Initialize git and commit**

```bash
git init
echo "node_modules\ndist\n.superpowers" > .gitignore
git add -A
git commit -m "feat: scaffold Vite + React + TypeScript project"
```

---

### Task 2: Data Layer — Sensors, Focal Lengths, Types

**Files:**
- Create: `src/types.ts`, `src/data/sensors.ts`, `src/data/focalLengths.ts`

- [ ] **Step 1: Create shared types**

Create `src/types.ts`:

```ts
export interface SensorPreset {
  id: string
  name: string
  cropFactor: number
}

export interface FocalLengthPreset {
  value: number
  label: string | null
}

export interface LensConfig {
  focalLength: number
  sensorId: string
}

export type ViewMode = 'overlay' | 'side'

export interface AppState {
  lensA: LensConfig
  lensB: LensConfig
  imageIndex: number
  mode: ViewMode
  distance: number
  theme: 'dark' | 'light'
  activeLens: 'a' | 'b'
  showShortcuts: boolean
}

export const DEFAULT_STATE: AppState = {
  lensA: { focalLength: 35, sensorId: 'ff' },
  lensB: { focalLength: 85, sensorId: 'ff' },
  imageIndex: 0,
  mode: 'overlay',
  distance: 10,
  theme: 'dark',
  activeLens: 'a',
  showShortcuts: false,
}
```

- [ ] **Step 2: Create sensor presets**

Create `src/data/sensors.ts`:

```ts
import type { SensorPreset } from '../types'

export const SENSORS: SensorPreset[] = [
  { id: 'mf', name: 'Medium Format', cropFactor: 0.79 },
  { id: 'ff', name: 'Full Frame', cropFactor: 1.0 },
  { id: 'apsc_n', name: 'APS-C (Nikon/Sony)', cropFactor: 1.5 },
  { id: 'apsc_c', name: 'APS-C (Canon)', cropFactor: 1.6 },
  { id: 'm43', name: 'Micro Four Thirds', cropFactor: 2.0 },
  { id: '1in', name: '1" Sensor', cropFactor: 2.7 },
  { id: 'phone', name: 'Smartphone', cropFactor: 6.0 },
]

export function getSensor(id: string): SensorPreset {
  return SENSORS.find((s) => s.id === id) ?? SENSORS[1]
}
```

- [ ] **Step 3: Create focal length presets**

Create `src/data/focalLengths.ts`:

```ts
import type { FocalLengthPreset } from '../types'

export const FOCAL_LENGTHS: FocalLengthPreset[] = [
  { value: 8, label: 'Fisheye' },
  { value: 14, label: 'Ultra-wide' },
  { value: 20, label: null },
  { value: 24, label: 'Wide' },
  { value: 35, label: null },
  { value: 50, label: 'Normal' },
  { value: 85, label: 'Portrait' },
  { value: 135, label: null },
  { value: 200, label: 'Tele' },
  { value: 400, label: 'Super-tele' },
  { value: 600, label: null },
  { value: 800, label: null },
]

export const FOCAL_MIN = 8
export const FOCAL_MAX = 800
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/data/
git commit -m "feat: add types, sensor presets, and focal length presets"
```

---

### Task 3: FOV Math Utilities

**Files:**
- Create: `src/utils/fov.ts`, `src/utils/fov.test.ts`

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Write FOV math tests**

Create `src/utils/fov.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { calcFOV, calcFrameWidth, calcEquivFocalLength, calcCropRatio } from './fov'

describe('calcFOV', () => {
  it('calculates FOV for 50mm full frame', () => {
    const fov = calcFOV(50, 1.0)
    expect(fov.horizontal).toBeCloseTo(39.6, 1)
    expect(fov.vertical).toBeCloseTo(27.0, 1)
  })

  it('calculates FOV for 35mm full frame', () => {
    const fov = calcFOV(35, 1.0)
    expect(fov.horizontal).toBeCloseTo(54.4, 1)
    expect(fov.vertical).toBeCloseTo(37.8, 1)
  })

  it('applies crop factor', () => {
    // 50mm on APS-C (1.5x) = same FOV as 75mm on FF
    const apsc = calcFOV(50, 1.5)
    const ff75 = calcFOV(75, 1.0)
    expect(apsc.horizontal).toBeCloseTo(ff75.horizontal, 1)
    expect(apsc.vertical).toBeCloseTo(ff75.vertical, 1)
  })
})

describe('calcFrameWidth', () => {
  it('calculates frame width at distance', () => {
    const fov = calcFOV(50, 1.0)
    const width = calcFrameWidth(fov.horizontal, 10)
    // At 10m with 50mm FF: about 7.3m wide
    expect(width).toBeCloseTo(7.3, 0)
  })
})

describe('calcEquivFocalLength', () => {
  it('returns equivalent focal length', () => {
    expect(calcEquivFocalLength(50, 1.5)).toBe(75)
  })

  it('returns same value for full frame', () => {
    expect(calcEquivFocalLength(50, 1.0)).toBe(50)
  })
})

describe('calcCropRatio', () => {
  it('returns 1 when both lenses have same FOV', () => {
    const fovA = calcFOV(50, 1.0)
    const fovB = calcFOV(50, 1.0)
    expect(calcCropRatio(fovA.horizontal, fovB.horizontal)).toBeCloseTo(1, 2)
  })

  it('returns ratio < 1 for narrower FOV', () => {
    const wide = calcFOV(35, 1.0)
    const tele = calcFOV(85, 1.0)
    const ratio = calcCropRatio(tele.horizontal, wide.horizontal)
    expect(ratio).toBeLessThan(1)
    expect(ratio).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npx vitest run
```

Expected: FAIL — module `./fov` not found.

- [ ] **Step 4: Implement FOV math**

Create `src/utils/fov.ts`:

```ts
const SENSOR_WIDTH = 36 // mm, full-frame
const SENSOR_HEIGHT = 24 // mm, full-frame
const RAD_TO_DEG = 180 / Math.PI

export interface FOVResult {
  horizontal: number // degrees
  vertical: number   // degrees
}

export function calcFOV(focalLength: number, cropFactor: number): FOVResult {
  const effective = focalLength * cropFactor
  return {
    horizontal: 2 * Math.atan(SENSOR_WIDTH / (2 * effective)) * RAD_TO_DEG,
    vertical: 2 * Math.atan(SENSOR_HEIGHT / (2 * effective)) * RAD_TO_DEG,
  }
}

export function calcFrameWidth(horizontalFOVDeg: number, distance: number): number {
  const halfAngleRad = (horizontalFOVDeg / 2) * (Math.PI / 180)
  return 2 * distance * Math.tan(halfAngleRad)
}

export function calcEquivFocalLength(focalLength: number, cropFactor: number): number {
  return Math.round(focalLength * cropFactor)
}

/**
 * Returns the ratio of narrowFOV to wideFOV (0..1).
 * Used to size the overlay rectangle relative to the canvas.
 */
export function calcCropRatio(narrowFOVDeg: number, wideFOVDeg: number): number {
  return Math.tan((narrowFOVDeg / 2) * (Math.PI / 180)) /
         Math.tan((wideFOVDeg / 2) * (Math.PI / 180))
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/utils/fov.ts src/utils/fov.test.ts package.json package-lock.json
git commit -m "feat: add FOV math utilities with tests"
```

---

### Task 4: Sample Images + Scene Data

**Files:**
- Create: `src/data/scenes.ts`, download 5 images into `src/assets/`

- [ ] **Step 1: Create scenes data**

Create `src/data/scenes.ts`:

```ts
import landscape from '../assets/landscape.jpg'
import person from '../assets/person.jpg'
import wildlife from '../assets/wildlife.jpg'
import city from '../assets/city.jpg'
import milkyway from '../assets/milkyway.jpg'

export interface Scene {
  id: string
  name: string
  src: string
}

export const SCENES: Scene[] = [
  { id: 'landscape', name: 'Landscape', src: landscape },
  { id: 'person', name: 'Person', src: person },
  { id: 'wildlife', name: 'Wildlife', src: wildlife },
  { id: 'city', name: 'City Street', src: city },
  { id: 'milkyway', name: 'Milky Way', src: milkyway },
]
```

- [ ] **Step 2: Download sample images**

Download 5 royalty-free images from Unsplash to `src/assets/`. Use `curl` with direct Unsplash download URLs. Choose images that are landscape-oriented (3:2 or wider) and resize to ~1920px wide for web performance.

```bash
mkdir -p src/assets
# Download landscape-oriented Unsplash images (specific IDs for reproducibility)
curl -L "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80" -o src/assets/landscape.jpg
curl -L "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1920&q=80" -o src/assets/person.jpg
curl -L "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=1920&q=80" -o src/assets/wildlife.jpg
curl -L "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80" -o src/assets/city.jpg
curl -L "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80" -o src/assets/milkyway.jpg
```

Note: If any URL fails, find an alternative landscape-oriented Unsplash image. The key requirement is 5 distinct photos: landscape, person in environment, wildlife/bird, city street, milky way/night sky.

- [ ] **Step 3: Verify images exist and scenes module compiles**

```bash
ls -la src/assets/*.jpg
npx tsc --noEmit
```

Expected: 5 jpg files listed, no TS errors.

- [ ] **Step 4: Commit**

```bash
git add src/assets/ src/data/scenes.ts
git commit -m "feat: add 5 sample scene images and scene data"
```

---

### Task 5: App State + Query Param Sync

**Files:**
- Create: `src/hooks/useQuerySync.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create useQuerySync hook**

Create `src/hooks/useQuerySync.ts`:

```ts
import { useEffect, useRef } from 'react'
import type { AppState } from '../types'
import { DEFAULT_STATE } from '../types'
import { SENSORS } from '../data/sensors'

const SENSOR_IDS = new Set(SENSORS.map((s) => s.id))

function clampFocal(v: number): number {
  return Math.max(8, Math.min(800, Math.round(v)))
}

export function parseQueryParams(): Partial<AppState> {
  const params = new URLSearchParams(window.location.search)
  const state: Partial<AppState> = {}

  const a = Number(params.get('a'))
  if (a && a >= 8 && a <= 800) state.lensA = { ...DEFAULT_STATE.lensA, focalLength: clampFocal(a) }

  const sa = params.get('sa')
  if (sa && SENSOR_IDS.has(sa)) state.lensA = { ...(state.lensA ?? DEFAULT_STATE.lensA), sensorId: sa }

  const b = Number(params.get('b'))
  if (b && b >= 8 && b <= 800) state.lensB = { ...DEFAULT_STATE.lensB, focalLength: clampFocal(b) }

  const sb = params.get('sb')
  if (sb && SENSOR_IDS.has(sb)) state.lensB = { ...(state.lensB ?? DEFAULT_STATE.lensB), sensorId: sb }

  const img = Number(params.get('img'))
  if (!isNaN(img) && img >= 0 && img <= 4) state.imageIndex = img

  const mode = params.get('mode')
  if (mode === 'overlay' || mode === 'side') state.mode = mode

  const d = Number(params.get('d'))
  if (d && d > 0 && d <= 10000) state.distance = d

  const theme = params.get('theme')
  if (theme === 'dark' || theme === 'light') state.theme = theme

  return state
}

export function stateToQueryString(state: AppState): string {
  const params = new URLSearchParams()
  params.set('a', String(state.lensA.focalLength))
  params.set('sa', state.lensA.sensorId)
  params.set('b', String(state.lensB.focalLength))
  params.set('sb', state.lensB.sensorId)
  params.set('img', String(state.imageIndex))
  params.set('mode', state.mode)
  params.set('d', String(state.distance))
  params.set('theme', state.theme)
  return params.toString()
}

export function useQuerySync(state: AppState): void {
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const qs = stateToQueryString(state)
    const newUrl = `${window.location.pathname}?${qs}`
    window.history.replaceState(null, '', newUrl)
  }, [state])
}
```

- [ ] **Step 2: Wire up App.tsx with useReducer + query sync**

Replace `src/App.tsx`:

```tsx
import { useReducer } from 'react'
import './theme.css'
import './App.css'
import type { AppState, LensConfig, ViewMode } from './types'
import { DEFAULT_STATE } from './types'
import { parseQueryParams, useQuerySync } from './hooks/useQuerySync'

type Action =
  | { type: 'SET_LENS_A'; payload: Partial<LensConfig> }
  | { type: 'SET_LENS_B'; payload: Partial<LensConfig> }
  | { type: 'SET_IMAGE'; payload: number }
  | { type: 'SET_MODE'; payload: ViewMode }
  | { type: 'SET_DISTANCE'; payload: number }
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'SET_ACTIVE_LENS'; payload: 'a' | 'b' }
  | { type: 'TOGGLE_SHORTCUTS' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LENS_A':
      return { ...state, lensA: { ...state.lensA, ...action.payload } }
    case 'SET_LENS_B':
      return { ...state, lensB: { ...state.lensB, ...action.payload } }
    case 'SET_IMAGE':
      return { ...state, imageIndex: action.payload }
    case 'SET_MODE':
      return { ...state, mode: action.payload }
    case 'SET_DISTANCE':
      return { ...state, distance: action.payload }
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    case 'SET_ACTIVE_LENS':
      return { ...state, activeLens: action.payload }
    case 'TOGGLE_SHORTCUTS':
      return { ...state, showShortcuts: !state.showShortcuts }
    default:
      return state
  }
}

function getInitialState(): AppState {
  const savedTheme = localStorage.getItem('fov-theme') as 'dark' | 'light' | null
  const queryOverrides = parseQueryParams()
  return {
    ...DEFAULT_STATE,
    ...(savedTheme ? { theme: savedTheme } : {}),
    ...queryOverrides,
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)

  useQuerySync(state)

  // Apply theme to document
  document.documentElement.setAttribute('data-theme', state.theme)
  localStorage.setItem('fov-theme', state.theme)

  return (
    <div className="app">
      <div className="sidebar">
        <p>Sidebar — Lens controls go here</p>
        <p>Theme: {state.theme}</p>
        <p>Lens A: {state.lensA.focalLength}mm</p>
        <p>Lens B: {state.lensB.focalLength}mm</p>
      </div>
      <div className="canvas-area">
        <div className="canvas-topbar">Mode: {state.mode}</div>
        <div className="canvas-main">Canvas goes here</div>
        <div className="canvas-bottom">Scene strip goes here</div>
      </div>
    </div>
  )
}

export default App
```

- [ ] **Step 3: Verify it compiles and renders**

```bash
npx tsc --noEmit
```

Expected: no errors. Dev server shows sidebar placeholder + canvas placeholder on dark background.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useQuerySync.ts src/App.tsx
git commit -m "feat: add app state reducer with URL query param sync"
```

---

### Task 6: Toast Component

**Files:**
- Create: `src/components/Toast.tsx`

- [ ] **Step 1: Create Toast component**

Create `src/components/Toast.tsx`:

```tsx
import { useEffect, useState } from 'react'

interface ToastProps {
  message: string | null
  onDone: () => void
}

export function Toast({ message, onDone }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) return
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300) // wait for fade out
    }, 2000)
    return () => clearTimeout(timer)
  }, [message, onDone])

  if (!message) return null

  return (
    <div className={`toast ${visible ? 'toast--visible' : ''}`}>
      {message}
    </div>
  )
}
```

- [ ] **Step 2: Add toast styles to App.css**

Append to `src/App.css`:

```css
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: none;
  z-index: 100;
}

.toast--visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Toast.tsx src/App.css
git commit -m "feat: add Toast notification component"
```

---

### Task 7: LensPanel Component

**Files:**
- Create: `src/components/LensPanel.tsx`

- [ ] **Step 1: Create LensPanel**

Create `src/components/LensPanel.tsx`:

```tsx
import type { LensConfig } from '../types'
import { FOCAL_LENGTHS, FOCAL_MIN, FOCAL_MAX } from '../data/focalLengths'
import { SENSORS, getSensor } from '../data/sensors'
import { calcFOV, calcEquivFocalLength } from '../utils/fov'

interface LensPanelProps {
  label: string
  color: string
  config: LensConfig
  isActive: boolean
  collapsed: boolean
  onChange: (updates: Partial<LensConfig>) => void
  onFocus: () => void
  onToggleCollapse: () => void
}

export function LensPanel({
  label,
  color,
  config,
  isActive,
  collapsed,
  onChange,
  onFocus,
  onToggleCollapse,
}: LensPanelProps) {
  const sensor = getSensor(config.sensorId)
  const fov = calcFOV(config.focalLength, sensor.cropFactor)
  const equiv = calcEquivFocalLength(config.focalLength, sensor.cropFactor)

  return (
    <div
      className={`lens-panel ${isActive ? 'lens-panel--active' : ''}`}
      style={{ borderLeftColor: color }}
      onClick={onFocus}
    >
      <div className="lens-panel__header" onClick={onToggleCollapse}>
        <span className="lens-panel__label" style={{ color }}>{label}</span>
        <span className="lens-panel__equiv">
          {sensor.cropFactor !== 1 ? `≡ ${equiv}mm equiv` : ''}
        </span>
      </div>

      <div className="lens-panel__focal">
        <div className="lens-panel__focal-row">
          <span className="lens-panel__sublabel">Focal length</span>
          <span className="lens-panel__value">{config.focalLength}mm</span>
        </div>
        <input
          type="range"
          className="lens-panel__slider"
          min={FOCAL_MIN}
          max={FOCAL_MAX}
          step={1}
          value={config.focalLength}
          onChange={(e) => onChange({ focalLength: Number(e.target.value) })}
          style={{ accentColor: color }}
        />
      </div>

      {!collapsed && (
        <>
          <div className="lens-panel__presets">
            {FOCAL_LENGTHS.map((fl) => (
              <button
                key={fl.value}
                className={`lens-panel__preset ${config.focalLength === fl.value ? 'lens-panel__preset--active' : ''}`}
                style={config.focalLength === fl.value ? { background: color, color: '#fff' } : undefined}
                onClick={(e) => { e.stopPropagation(); onChange({ focalLength: fl.value }) }}
              >
                {fl.value}
              </button>
            ))}
          </div>

          <div className="lens-panel__sensor-row">
            <span className="lens-panel__sublabel">Sensor</span>
            <select
              className="lens-panel__select"
              value={config.sensorId}
              onChange={(e) => onChange({ sensorId: e.target.value })}
              onClick={(e) => e.stopPropagation()}
            >
              {SENSORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.cropFactor}×)
                </option>
              ))}
            </select>
          </div>

          <div className="lens-panel__fov">
            FOV: {fov.horizontal.toFixed(1)}° × {fov.vertical.toFixed(1)}°
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add LensPanel styles to App.css**

Append to `src/App.css`:

```css
.lens-panel {
  background: var(--surface);
  border-radius: 10px;
  padding: 14px;
  border-left: 3px solid;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.lens-panel--active {
  box-shadow: 0 0 0 1px var(--accent);
}

.lens-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.lens-panel__label {
  font-weight: 600;
  font-size: 14px;
}

.lens-panel__equiv {
  font-size: 11px;
  color: var(--text-secondary);
}

.lens-panel__focal {
  margin-bottom: 8px;
}

.lens-panel__focal-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 4px;
}

.lens-panel__sublabel {
  color: var(--text-secondary);
}

.lens-panel__value {
  font-weight: 600;
}

.lens-panel__slider {
  width: 100%;
  height: 6px;
  cursor: pointer;
}

.lens-panel__presets {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.lens-panel__preset {
  padding: 3px 7px;
  background: var(--bg);
  border: none;
  border-radius: 4px;
  font-size: 11px;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.15s;
}

.lens-panel__preset:hover {
  background: var(--border);
}

.lens-panel__preset--active {
  color: #fff;
}

.lens-panel__sensor-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin-bottom: 4px;
}

.lens-panel__select {
  background: var(--bg);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
}

.lens-panel__fov {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/LensPanel.tsx src/App.css
git commit -m "feat: add LensPanel component with focal length slider, presets, and sensor select"
```

---

### Task 8: ModeToggle, ThemeToggle, SceneStrip, FrameRuler, ActionBar Components

**Files:**
- Create: `src/components/ModeToggle.tsx`, `src/components/ThemeToggle.tsx`, `src/components/SceneStrip.tsx`, `src/components/FrameRuler.tsx`, `src/components/ActionBar.tsx`

- [ ] **Step 1: Create ModeToggle**

Create `src/components/ModeToggle.tsx`:

```tsx
import type { ViewMode } from '../types'

interface ModeToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="mode-toggle">
      <button
        className={`mode-toggle__btn ${mode === 'overlay' ? 'mode-toggle__btn--active' : ''}`}
        onClick={() => onChange('overlay')}
      >
        Overlay
      </button>
      <button
        className={`mode-toggle__btn ${mode === 'side' ? 'mode-toggle__btn--active' : ''}`}
        onClick={() => onChange('side')}
      >
        Side by Side
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Create ThemeToggle**

Create `src/components/ThemeToggle.tsx`:

```tsx
interface ThemeToggleProps {
  theme: 'dark' | 'light'
  onChange: (theme: 'dark' | 'light') => void
}

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  return (
    <button
      className="icon-btn"
      onClick={() => onChange(theme === 'dark' ? 'light' : 'dark')}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
```

- [ ] **Step 3: Create SceneStrip**

Create `src/components/SceneStrip.tsx`:

```tsx
import { SCENES } from '../data/scenes'

interface SceneStripProps {
  selectedIndex: number
  onChange: (index: number) => void
}

export function SceneStrip({ selectedIndex, onChange }: SceneStripProps) {
  return (
    <div className="scene-strip">
      <span className="scene-strip__label">Scene:</span>
      {SCENES.map((scene, i) => (
        <button
          key={scene.id}
          className={`scene-strip__thumb ${i === selectedIndex ? 'scene-strip__thumb--active' : ''}`}
          onClick={() => onChange(i)}
          title={scene.name}
        >
          <img src={scene.src} alt={scene.name} />
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Create FrameRuler**

Create `src/components/FrameRuler.tsx`:

```tsx
import { calcFOV, calcFrameWidth } from '../utils/fov'
import { getSensor } from '../data/sensors'
import type { LensConfig } from '../types'

interface FrameRulerProps {
  lensA: LensConfig
  lensB: LensConfig
  distance: number
  onDistanceChange: (d: number) => void
}

export function FrameRuler({ lensA, lensB, distance, onDistanceChange }: FrameRulerProps) {
  const sensorA = getSensor(lensA.sensorId)
  const sensorB = getSensor(lensB.sensorId)
  const fovA = calcFOV(lensA.focalLength, sensorA.cropFactor)
  const fovB = calcFOV(lensB.focalLength, sensorB.cropFactor)
  const widthA = calcFrameWidth(fovA.horizontal, distance)
  const widthB = calcFrameWidth(fovB.horizontal, distance)

  return (
    <div className="frame-ruler">
      <div className="frame-ruler__title">Frame Width at Distance</div>
      <div className="frame-ruler__distance-row">
        <span className="frame-ruler__sublabel">Distance</span>
        <span className="frame-ruler__value">{distance}m</span>
      </div>
      <input
        type="range"
        className="frame-ruler__slider"
        min={1}
        max={1000}
        step={1}
        value={distance}
        onChange={(e) => onDistanceChange(Number(e.target.value))}
      />
      <div className="frame-ruler__results">
        <span style={{ color: 'var(--lens-a)' }}>A: {widthA.toFixed(1)}m wide</span>
        <span style={{ color: 'var(--lens-b)' }}>B: {widthB.toFixed(1)}m wide</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create ActionBar**

Create `src/components/ActionBar.tsx`:

```tsx
interface ActionBarProps {
  onCopyImage: () => void
  onCopyLink: () => void
}

export function ActionBar({ onCopyImage, onCopyLink }: ActionBarProps) {
  return (
    <div className="action-bar">
      <button className="action-bar__btn action-bar__btn--primary" onClick={onCopyImage}>
        Copy image
      </button>
      <button className="action-bar__btn" onClick={onCopyLink}>
        Copy link
      </button>
    </div>
  )
}
```

- [ ] **Step 6: Add styles for all new components**

Append to `src/App.css`:

```css
/* ModeToggle */
.mode-toggle {
  display: flex;
  gap: 6px;
}

.mode-toggle__btn {
  padding: 6px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}

.mode-toggle__btn--active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

/* Icon button (theme, shortcuts) */
.icon-btn {
  padding: 4px 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  line-height: 1;
}

/* SceneStrip */
.scene-strip {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  overflow-x: auto;
}

.scene-strip__label {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.scene-strip__thumb {
  width: 48px;
  height: 32px;
  border-radius: 4px;
  border: 2px solid transparent;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  background: none;
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.15s, border-color 0.15s;
}

.scene-strip__thumb--active {
  border-color: var(--accent);
  opacity: 1;
}

.scene-strip__thumb:hover {
  opacity: 1;
}

.scene-strip__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* FrameRuler */
.frame-ruler {
  background: var(--surface);
  border-radius: 10px;
  padding: 14px;
}

.frame-ruler__title {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
}

.frame-ruler__distance-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 4px;
}

.frame-ruler__sublabel {
  color: var(--text-secondary);
}

.frame-ruler__value {
  font-weight: 600;
}

.frame-ruler__slider {
  width: 100%;
  height: 6px;
  margin-bottom: 10px;
  cursor: pointer;
}

.frame-ruler__results {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

/* ActionBar */
.action-bar {
  background: var(--surface);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-bar__btn {
  padding: 8px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  text-align: center;
  transition: background 0.15s;
}

.action-bar__btn:hover {
  background: var(--border);
}

.action-bar__btn--primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.action-bar__btn--primary:hover {
  opacity: 0.9;
}
```

- [ ] **Step 7: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/ModeToggle.tsx src/components/ThemeToggle.tsx src/components/SceneStrip.tsx src/components/FrameRuler.tsx src/components/ActionBar.tsx src/App.css
git commit -m "feat: add ModeToggle, ThemeToggle, SceneStrip, FrameRuler, ActionBar components"
```

---

### Task 9: Canvas Component — Overlay Mode

**Files:**
- Create: `src/components/Canvas.tsx`

- [ ] **Step 1: Create Canvas component with overlay rendering**

Create `src/components/Canvas.tsx`:

```tsx
import { useRef, useEffect, useCallback } from 'react'
import type { LensConfig, ViewMode } from '../types'
import { calcFOV, calcCropRatio } from '../utils/fov'
import { getSensor } from '../data/sensors'
import { SCENES } from '../data/scenes'

interface CanvasProps {
  lensA: LensConfig
  lensB: LensConfig
  imageIndex: number
  mode: ViewMode
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

export function Canvas({ lensA, lensB, imageIndex, mode, canvasRef }: CanvasProps) {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const animFrameRef = useRef<number>(0)

  const sensorA = getSensor(lensA.sensorId)
  const sensorB = getSensor(lensB.sensorId)
  const fovA = calcFOV(lensA.focalLength, sensorA.cropFactor)
  const fovB = calcFOV(lensB.focalLength, sensorB.cropFactor)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img || !img.complete) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (mode === 'overlay') {
      drawOverlay(ctx, canvas, img, fovA, fovB)
    } else {
      drawSideBySide(ctx, canvas, img, fovA, fovB)
    }
  }, [canvasRef, mode, fovA, fovB])

  // Load image
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imageRef.current = img
      draw()
    }
    img.src = SCENES[imageIndex].src
  }, [imageIndex, draw])

  // Redraw on parameter changes
  useEffect(() => {
    cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = requestAnimationFrame(draw)
  }, [draw])

  // Resize canvas to fit container
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const observer = new ResizeObserver(() => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      // Maintain 3:2 aspect ratio
      let w = rect.width
      let h = w * (2 / 3)
      if (h > rect.height) {
        h = rect.height
        w = h * (3 / 2)
      }

      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      canvas.width = w * dpr
      canvas.height = h * dpr
      draw()
    })

    observer.observe(canvas.parentElement!)
    return () => observer.disconnect()
  }, [canvasRef, draw])

  return (
    <canvas
      ref={canvasRef}
      className="fov-canvas"
    />
  )
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  fovA: { horizontal: number; vertical: number },
  fovB: { horizontal: number; vertical: number },
) {
  const w = canvas.width
  const h = canvas.height

  // Draw full image
  ctx.drawImage(img, 0, 0, w, h)

  // Determine which FOV is wider
  const aWider = fovA.horizontal >= fovB.horizontal

  // The wider FOV fills the canvas; narrower gets a proportional rect
  const wideH = aWider ? fovA.horizontal : fovB.horizontal
  const wideV = aWider ? fovA.vertical : fovB.vertical
  const narrowH = aWider ? fovB.horizontal : fovA.horizontal
  const narrowV = aWider ? fovB.vertical : fovA.vertical

  const ratioH = calcCropRatio(narrowH, wideH)
  const ratioV = calcCropRatio(narrowV, wideV)

  const wideColor = aWider ? '#3b82f6' : '#f59e0b'
  const narrowColor = aWider ? '#f59e0b' : '#3b82f6'

  // Draw wide rect (full canvas border)
  ctx.strokeStyle = wideColor
  ctx.lineWidth = 3 * (window.devicePixelRatio || 1)
  ctx.strokeRect(2, 2, w - 4, h - 4)

  // Draw narrow rect (proportional)
  const nw = w * ratioH
  const nh = h * ratioV
  const nx = (w - nw) / 2
  const ny = (h - nh) / 2

  ctx.strokeStyle = narrowColor
  ctx.lineWidth = 3 * (window.devicePixelRatio || 1)
  ctx.strokeRect(nx, ny, nw, nh)

  // Dim area outside narrow rect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  // Top
  ctx.fillRect(0, 0, w, ny)
  // Bottom
  ctx.fillRect(0, ny + nh, w, h - ny - nh)
  // Left
  ctx.fillRect(0, ny, nx, nh)
  // Right
  ctx.fillRect(nx + nw, ny, w - nx - nw, nh)

  // Labels
  const dpr = window.devicePixelRatio || 1
  const fontSize = 12 * dpr
  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`

  // Wide label (top-left)
  const wideLabel = aWider
    ? `A — ${fovA.horizontal.toFixed(1)}° × ${fovA.vertical.toFixed(1)}°`
    : `B — ${fovB.horizontal.toFixed(1)}° × ${fovB.vertical.toFixed(1)}°`
  ctx.fillStyle = wideColor
  ctx.fillText(wideLabel, 8 * dpr, 20 * dpr)

  // Narrow label (inside narrow rect, bottom-right)
  const narrowLabel = aWider
    ? `B — ${fovB.horizontal.toFixed(1)}° × ${fovB.vertical.toFixed(1)}°`
    : `A — ${fovA.horizontal.toFixed(1)}° × ${fovA.vertical.toFixed(1)}°`
  ctx.fillStyle = narrowColor
  const metrics = ctx.measureText(narrowLabel)
  ctx.fillText(narrowLabel, nx + nw - metrics.width - 8 * dpr, ny + nh + 18 * dpr)
}

function drawSideBySide(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  fovA: { horizontal: number; vertical: number },
  fovB: { horizontal: number; vertical: number },
) {
  const w = canvas.width
  const h = canvas.height
  const dpr = window.devicePixelRatio || 1
  const gap = 8 * dpr

  // Each side gets half the canvas minus gap
  const halfW = (w - gap) / 2

  // Find the widest FOV to use as reference
  const maxH = Math.max(fovA.horizontal, fovB.horizontal)
  const maxV = Math.max(fovA.vertical, fovB.vertical)

  // Clear
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0f0f14'
  ctx.fillRect(0, 0, w, h)

  // Draw lens A crop
  drawCroppedView(ctx, img, 0, 0, halfW, h, fovA.horizontal, fovA.vertical, maxH, maxV)

  // Draw lens B crop
  drawCroppedView(ctx, img, halfW + gap, 0, halfW, h, fovB.horizontal, fovB.vertical, maxH, maxV)

  // Borders
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2 * dpr
  ctx.strokeRect(0, 0, halfW, h)

  ctx.strokeStyle = '#f59e0b'
  ctx.strokeRect(halfW + gap, 0, halfW, h)

  // Labels
  const fontSize = 12 * dpr
  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`

  ctx.fillStyle = '#3b82f6'
  ctx.fillText(`A — ${fovA.horizontal.toFixed(1)}° × ${fovA.vertical.toFixed(1)}°`, 8 * dpr, 20 * dpr)

  ctx.fillStyle = '#f59e0b'
  ctx.fillText(`B — ${fovB.horizontal.toFixed(1)}° × ${fovB.vertical.toFixed(1)}°`, halfW + gap + 8 * dpr, 20 * dpr)
}

function drawCroppedView(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number,
  hFov: number, vFov: number,
  maxHFov: number, maxVFov: number,
) {
  // Calculate source crop based on FOV ratio
  const ratioH = calcCropRatio(hFov, maxHFov)
  const ratioV = calcCropRatio(vFov, maxVFov)

  const sw = img.width * ratioH
  const sh = img.height * ratioV
  const sx = (img.width - sw) / 2
  const sy = (img.height - sh) / 2

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}
```

- [ ] **Step 2: Add canvas styles**

Append to `src/App.css`:

```css
.fov-canvas {
  display: block;
  max-width: 100%;
  border-radius: 8px;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Canvas.tsx src/App.css
git commit -m "feat: add Canvas component with overlay and side-by-side rendering"
```

---

### Task 10: Sidebar + ShortcutOverlay Components

**Files:**
- Create: `src/components/Sidebar.tsx`, `src/components/ShortcutOverlay.tsx`

- [ ] **Step 1: Create Sidebar wrapper**

Create `src/components/Sidebar.tsx`:

```tsx
import type { ReactNode } from 'react'

interface SidebarProps {
  children: ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  return <aside className="sidebar">{children}</aside>
}
```

- [ ] **Step 2: Create ShortcutOverlay**

Create `src/components/ShortcutOverlay.tsx`:

```tsx
interface ShortcutOverlayProps {
  visible: boolean
  onClose: () => void
}

const SHORTCUTS = [
  { key: 'Tab', description: 'Switch active lens (A / B)' },
  { key: '[', description: 'Previous focal length preset' },
  { key: ']', description: 'Next focal length preset' },
  { key: 'S', description: 'Toggle Overlay / Side by Side' },
  { key: 'T', description: 'Toggle Dark / Light theme' },
  { key: '?', description: 'Show / hide this cheat sheet' },
]

export function ShortcutOverlay({ visible, onClose }: ShortcutOverlayProps) {
  if (!visible) return null

  return (
    <div className="shortcut-overlay" onClick={onClose}>
      <div className="shortcut-overlay__card" onClick={(e) => e.stopPropagation()}>
        <div className="shortcut-overlay__header">
          <h3>Keyboard Shortcuts</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="shortcut-overlay__list">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="shortcut-overlay__row">
              <kbd className="shortcut-overlay__key">{s.key}</kbd>
              <span>{s.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add shortcut overlay styles**

Append to `src/App.css`:

```css
.shortcut-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.shortcut-overlay__card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  min-width: 320px;
  max-width: 400px;
}

.shortcut-overlay__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.shortcut-overlay__header h3 {
  font-size: 16px;
  font-weight: 600;
}

.shortcut-overlay__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shortcut-overlay__row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.shortcut-overlay__key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  padding: 4px 8px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Sidebar.tsx src/components/ShortcutOverlay.tsx src/App.css
git commit -m "feat: add Sidebar wrapper and ShortcutOverlay components"
```

---

### Task 11: Keyboard Shortcuts Hook

**Files:**
- Create: `src/hooks/useKeyboardShortcuts.ts`

- [ ] **Step 1: Create keyboard shortcuts hook**

Create `src/hooks/useKeyboardShortcuts.ts`:

```ts
import { useEffect } from 'react'
import type { AppState } from '../types'
import { FOCAL_LENGTHS } from '../data/focalLengths'

type Dispatch = (action: any) => void

export function useKeyboardShortcuts(state: AppState, dispatch: Dispatch): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return

      switch (e.key) {
        case 'Tab': {
          e.preventDefault()
          dispatch({ type: 'SET_ACTIVE_LENS', payload: state.activeLens === 'a' ? 'b' : 'a' })
          break
        }
        case '[': {
          e.preventDefault()
          nudgeFocalLength(state, dispatch, -1)
          break
        }
        case ']': {
          e.preventDefault()
          nudgeFocalLength(state, dispatch, 1)
          break
        }
        case 's':
        case 'S': {
          if (e.ctrlKey || e.metaKey) return // don't capture Ctrl+S
          e.preventDefault()
          dispatch({ type: 'SET_MODE', payload: state.mode === 'overlay' ? 'side' : 'overlay' })
          break
        }
        case 't':
        case 'T': {
          if (e.ctrlKey || e.metaKey) return
          e.preventDefault()
          dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' })
          break
        }
        case '?': {
          e.preventDefault()
          dispatch({ type: 'TOGGLE_SHORTCUTS' })
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state, dispatch])
}

function nudgeFocalLength(state: AppState, dispatch: Dispatch, direction: -1 | 1): void {
  const lens = state.activeLens === 'a' ? state.lensA : state.lensB
  const actionType = state.activeLens === 'a' ? 'SET_LENS_A' : 'SET_LENS_B'

  const presetValues = FOCAL_LENGTHS.map((fl) => fl.value)
  const currentIndex = presetValues.findIndex((v) => v >= lens.focalLength)

  let newIndex: number
  if (direction === -1) {
    newIndex = currentIndex <= 0 ? 0 : currentIndex - 1
  } else {
    newIndex = currentIndex >= presetValues.length - 1 ? presetValues.length - 1 : currentIndex + 1
  }

  dispatch({ type: actionType, payload: { focalLength: presetValues[newIndex] } })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useKeyboardShortcuts.ts
git commit -m "feat: add keyboard shortcuts hook"
```

---

### Task 12: Export Utility (Copy Image / Download PNG)

**Files:**
- Create: `src/utils/export.ts`

- [ ] **Step 1: Create export utility**

Create `src/utils/export.ts`:

```ts
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    )
    if (!blob) return false

    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      return true
    }

    // Fallback: download
    downloadBlob(blob, 'fov-comparison.png')
    return true
  } catch {
    return false
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function copyLinkToClipboard(): boolean {
  try {
    navigator.clipboard.writeText(window.location.href)
    return true
  } catch {
    return false
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/export.ts
git commit -m "feat: add export utilities for clipboard and PNG download"
```

---

### Task 13: Wire Everything Together in App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Assemble all components in App.tsx**

Replace `src/App.tsx` with the full wired-up version:

```tsx
import { useReducer, useRef, useCallback, useState } from 'react'
import './theme.css'
import './App.css'
import type { AppState, LensConfig, ViewMode } from './types'
import { DEFAULT_STATE } from './types'
import { parseQueryParams, useQuerySync } from './hooks/useQuerySync'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { copyCanvasToClipboard, copyLinkToClipboard } from './utils/export'
import { Sidebar } from './components/Sidebar'
import { LensPanel } from './components/LensPanel'
import { ModeToggle } from './components/ModeToggle'
import { ThemeToggle } from './components/ThemeToggle'
import { SceneStrip } from './components/SceneStrip'
import { FrameRuler } from './components/FrameRuler'
import { ActionBar } from './components/ActionBar'
import { Canvas } from './components/Canvas'
import { ShortcutOverlay } from './components/ShortcutOverlay'
import { Toast } from './components/Toast'

type Action =
  | { type: 'SET_LENS_A'; payload: Partial<LensConfig> }
  | { type: 'SET_LENS_B'; payload: Partial<LensConfig> }
  | { type: 'SET_IMAGE'; payload: number }
  | { type: 'SET_MODE'; payload: ViewMode }
  | { type: 'SET_DISTANCE'; payload: number }
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'SET_ACTIVE_LENS'; payload: 'a' | 'b' }
  | { type: 'TOGGLE_SHORTCUTS' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LENS_A':
      return { ...state, lensA: { ...state.lensA, ...action.payload } }
    case 'SET_LENS_B':
      return { ...state, lensB: { ...state.lensB, ...action.payload } }
    case 'SET_IMAGE':
      return { ...state, imageIndex: action.payload }
    case 'SET_MODE':
      return { ...state, mode: action.payload }
    case 'SET_DISTANCE':
      return { ...state, distance: action.payload }
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    case 'SET_ACTIVE_LENS':
      return { ...state, activeLens: action.payload }
    case 'TOGGLE_SHORTCUTS':
      return { ...state, showShortcuts: !state.showShortcuts }
    default:
      return state
  }
}

function getInitialState(): AppState {
  const savedTheme = localStorage.getItem('fov-theme') as 'dark' | 'light' | null
  const queryOverrides = parseQueryParams()
  return {
    ...DEFAULT_STATE,
    ...(savedTheme ? { theme: savedTheme } : {}),
    ...queryOverrides,
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)
  const [toast, setToast] = useState<string | null>(null)
  const [collapsedA, setCollapsedA] = useState(false)
  const [collapsedB, setCollapsedB] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useQuerySync(state)
  useKeyboardShortcuts(state, dispatch)

  document.documentElement.setAttribute('data-theme', state.theme)
  localStorage.setItem('fov-theme', state.theme)

  const handleCopyImage = useCallback(async () => {
    if (!canvasRef.current) return
    const success = await copyCanvasToClipboard(canvasRef.current)
    setToast(success ? 'Copied image!' : 'Failed to copy')
  }, [])

  const handleCopyLink = useCallback(() => {
    const success = copyLinkToClipboard()
    setToast(success ? 'Link copied!' : 'Failed to copy')
  }, [])

  return (
    <div className="app">
      <Sidebar>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="sidebar__logo-icon" />
            <span className="sidebar__logo-text">FOV Viewer</span>
          </div>
          <div className="sidebar__actions">
            <ThemeToggle
              theme={state.theme}
              onChange={(t) => dispatch({ type: 'SET_THEME', payload: t })}
            />
            <button className="icon-btn" onClick={() => dispatch({ type: 'TOGGLE_SHORTCUTS' })} title="Keyboard shortcuts">
              ⌨️
            </button>
          </div>
        </div>

        <LensPanel
          label="Lens A"
          color="var(--lens-a)"
          config={state.lensA}
          isActive={state.activeLens === 'a'}
          collapsed={collapsedA}
          onChange={(u) => dispatch({ type: 'SET_LENS_A', payload: u })}
          onFocus={() => dispatch({ type: 'SET_ACTIVE_LENS', payload: 'a' })}
          onToggleCollapse={() => setCollapsedA((v) => !v)}
        />

        <LensPanel
          label="Lens B"
          color="var(--lens-b)"
          config={state.lensB}
          isActive={state.activeLens === 'b'}
          collapsed={collapsedB}
          onChange={(u) => dispatch({ type: 'SET_LENS_B', payload: u })}
          onFocus={() => dispatch({ type: 'SET_ACTIVE_LENS', payload: 'b' })}
          onToggleCollapse={() => setCollapsedB((v) => !v)}
        />

        <FrameRuler
          lensA={state.lensA}
          lensB={state.lensB}
          distance={state.distance}
          onDistanceChange={(d) => dispatch({ type: 'SET_DISTANCE', payload: d })}
        />

        <ActionBar
          onCopyImage={handleCopyImage}
          onCopyLink={handleCopyLink}
        />
      </Sidebar>

      <div className="canvas-area">
        <div className="canvas-topbar">
          <ModeToggle
            mode={state.mode}
            onChange={(m) => dispatch({ type: 'SET_MODE', payload: m })}
          />
        </div>

        <div className="canvas-main">
          <Canvas
            lensA={state.lensA}
            lensB={state.lensB}
            imageIndex={state.imageIndex}
            mode={state.mode}
            canvasRef={canvasRef}
          />
        </div>

        <div className="canvas-bottom">
          <SceneStrip
            selectedIndex={state.imageIndex}
            onChange={(i) => dispatch({ type: 'SET_IMAGE', payload: i })}
          />
        </div>
      </div>

      <ShortcutOverlay
        visible={state.showShortcuts}
        onClose={() => dispatch({ type: 'TOGGLE_SHORTCUTS' })}
      />

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}

export default App
```

- [ ] **Step 2: Add sidebar header styles**

Append to `src/App.css`:

```css
.sidebar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar__logo-icon {
  width: 20px;
  height: 20px;
  background: var(--accent);
  border-radius: 4px;
}

.sidebar__logo-text {
  font-weight: 600;
  font-size: 15px;
}

.sidebar__actions {
  display: flex;
  gap: 6px;
}
```

- [ ] **Step 3: Verify everything compiles and renders**

```bash
npx tsc --noEmit
```

Expected: no errors. Dev server shows full layout with sidebar, canvas, all controls.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/App.css
git commit -m "feat: wire all components together in App.tsx"
```

---

### Task 14: Mobile Responsive Layout

**Files:**
- Modify: `src/App.css`

- [ ] **Step 1: Enhance mobile styles**

Add/update the mobile media query in `src/App.css`. Replace the existing `@media (max-width: 1023px)` block:

```css
@media (max-width: 1023px) {
  .app {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    min-width: 0;
    border-right: none;
    border-top: 1px solid var(--border);
    order: 2;
  }

  .canvas-area {
    order: 1;
  }

  .canvas-main {
    padding: 8px 12px;
  }

  .canvas-bottom {
    padding: 8px 12px;
  }

  .sidebar__header {
    padding-bottom: 8px;
  }

  .action-bar {
    flex-direction: row;
  }

  .action-bar__btn {
    flex: 1;
  }

  .scene-strip {
    justify-content: flex-start;
    padding-bottom: 4px;
  }
}
```

- [ ] **Step 2: Add viewport meta tag**

Ensure `index.html` has the viewport meta tag (Vite template usually includes it, but verify):

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

- [ ] **Step 3: Test at mobile width**

Open dev tools, toggle device toolbar, check at 375px wide and 768px wide. Verify:
- Layout stacks vertically
- Canvas fills width
- Lens panels are below the canvas
- Action buttons are side by side

- [ ] **Step 4: Commit**

```bash
git add src/App.css index.html
git commit -m "feat: add responsive mobile layout"
```

---

### Task 15: GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`, `public/404.html`

- [ ] **Step 1: Create GitHub Actions workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npm run build

      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Create 404.html for SPA routing**

Create `public/404.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>FOV Viewer</title>
  <script>
    // Redirect all 404s to index.html, preserving query params
    var path = window.location.pathname;
    var query = window.location.search;
    window.location.replace(
      window.location.origin + '/fov-viewer/' + query
    );
  </script>
</head>
<body></body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml public/404.html
git commit -m "feat: add GitHub Pages deployment workflow and SPA 404 redirect"
```

---

### Task 16: Final Polish + Smoke Test

**Files:**
- Modify: various (minor fixes)

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

Expected: all FOV math tests pass.

- [ ] **Step 2: Run the build**

```bash
npm run build
```

Expected: builds successfully, outputs to `dist/`.

- [ ] **Step 3: Preview the production build**

```bash
npx vite preview
```

Expected: opens in browser, full app functional — overlay mode, side-by-side mode, lens controls, scene switching, theme toggle, keyboard shortcuts, copy link, copy image.

- [ ] **Step 4: Test query param sharing**

Copy the URL with params (e.g. `?a=24&sa=m43&b=200&sb=ff&mode=side&img=4&d=50&theme=light`). Open in a new tab. Verify all settings are restored.

- [ ] **Step 5: Test keyboard shortcuts**

Press `Tab` (switch lens), `[`/`]` (nudge), `S` (mode toggle), `T` (theme), `?` (shortcuts overlay). Verify all work.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix: polish and smoke test fixes"
```

This step may have no changes if everything works — skip the commit in that case.
