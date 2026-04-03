# Photography Tools Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the FOV Viewer Vite app into a Next.js 16 multi-tool photography hub with 14 client-side tools, shared design system, ad slots, and tool visibility system.

**Architecture:** Next.js 16 App Router with `"use client"` tool components. Each tool page is a thin server component for SEO metadata wrapping a client-side interactive tool. Pure math modules in `lib/math/`, shared UI in `components/shared/`, tool-specific UI in `components/tools/<slug>/`. Tool registry in `lib/data/tools.ts` controls visibility (live/draft).

**Tech Stack:** Next.js 16, React 19, TypeScript 5.7+, CSS custom properties + CSS Modules, Vitest + Testing Library, Canvas API, Vercel deployment.

**Spec:** `docs/superpowers/specs/2026-04-02-photography-tools-hub-design.md`

---

## Plan Structure

This plan is split into phases:

- **Phase 0 (Tasks 1–4):** Next.js project scaffold, design tokens, shared components, CI/CD
- **Phase 1 (Task 5):** Migrate FOV Viewer into the new project
- **Phase 2 (Tasks 6–19):** Build each of the 14 new tools (independent — can be parallelized)
- **Phase 3 (Task 20):** Landing page, glossary, article migration

Each tool task follows the same pattern: math module with tests → client component → page route → integration test.

---

## Phase 0: Foundation

### Task 1: Scaffold Next.js 16 Project

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `eslint.config.js`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `.github/workflows/ci.yml`
- Create: `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

Run from a new directory (sibling to current fov-viewer):

```bash
npx create-next-app@latest phototools.io --typescript --eslint --app --no-tailwind --no-src-dir --turbopack
```

Select: No to Tailwind, Yes to App Router, Yes to TypeScript, Yes to ESLint, Yes to Turbopack, default import alias `@/*`.

- [ ] **Step 2: Install dev dependencies**

```bash
cd phototools.io
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': new URL('./', import.meta.url).pathname,
    },
  },
})
```

- [ ] **Step 4: Create test-setup.ts**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 5: Add test scripts to package.json**

Add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Configure next.config.ts with security headers**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'",
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

Note: CSP will be tightened and AdSense domains added when ads are integrated.

- [ ] **Step 7: Run build to verify scaffold**

```bash
npm run build
```

Expected: Successful build with default Next.js page.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 project with Vitest"
```

---

### Task 2: Design Tokens & Global Styles

**Files:**
- Create: `app/globals.css`

- [ ] **Step 1: Write globals.css with design tokens**

Replace the default `app/globals.css` with:

```css
/* ── Reset ─────────────────────────────────── */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* ── Design Tokens ─────────────────────────── */
:root,
[data-theme='dark'] {
  /* Colors */
  --bg-primary: #0f0f14;
  --bg-secondary: #1a1a24;
  --bg-surface: #1e1e2a;
  --text-primary: #e0e0e0;
  --text-secondary: #888888;
  --text-muted: #666666;
  --accent: #6366f1;
  --accent-hover: #818cf8;
  --border: #2a2a35;
  --border-subtle: #222230;

  /* Lens colors */
  --lens-a: #3b82f6;
  --lens-b: #f59e0b;
  --lens-c: #10b981;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;
  --text-xs: 11px;
  --text-sm: 13px;
  --text-md: 15px;
  --text-lg: 20px;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
}

[data-theme='light'] {
  --bg-primary: #f8f9fa;
  --bg-secondary: #ffffff;
  --bg-surface: #ffffff;
  --text-primary: #1a1a2e;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --accent: #6366f1;
  --accent-hover: #4f46e5;
  --border: #e2e4e8;
  --border-subtle: #f0f0f4;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
}

body {
  font-family: var(--font-sans);
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* ── Shared Utility Classes ────────────────── */
.mono {
  font-family: var(--font-mono);
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Builds successfully.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add design tokens and global styles"
```

---

### Task 3: Tool Registry & Shared Types

**Files:**
- Create: `lib/data/tools.ts`
- Create: `lib/types.ts`
- Create: `lib/data/sensors.ts`
- Create: `lib/data/focalLengths.ts`
- Create: `lib/data/tools.test.ts`

- [ ] **Step 1: Write the failing test for tool registry**

```ts
// lib/data/tools.test.ts
import { describe, it, expect } from 'vitest'
import { TOOLS, getToolBySlug, getLiveTools } from './tools'

describe('TOOLS registry', () => {
  it('contains at least one tool', () => {
    expect(TOOLS.length).toBeGreaterThan(0)
  })

  it('all tools have required fields', () => {
    for (const tool of TOOLS) {
      expect(tool.slug).toBeTruthy()
      expect(tool.name).toBeTruthy()
      expect(tool.description).toBeTruthy()
      expect(['live', 'draft']).toContain(tool.status)
      expect(['calculator', 'visualizer', 'reference', 'file-tool']).toContain(tool.category)
    }
  })

  it('slugs are unique', () => {
    const slugs = TOOLS.map((t) => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('getToolBySlug returns correct tool', () => {
    const tool = getToolBySlug('fov-viewer')
    expect(tool?.name).toBe('FOV Viewer')
  })

  it('getToolBySlug returns undefined for unknown slug', () => {
    expect(getToolBySlug('nonexistent')).toBeUndefined()
  })

  it('getLiveTools filters to live only', () => {
    const live = getLiveTools()
    for (const tool of live) {
      expect(tool.status).toBe('live')
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run lib/data/tools.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create lib/types.ts**

Copy shared types from current `src/types.ts`:

```ts
// lib/types.ts
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

export type ToolStatus = 'live' | 'draft'
export type ToolCategory = 'calculator' | 'visualizer' | 'reference' | 'file-tool'

export interface ToolDef {
  slug: string
  name: string
  description: string
  status: ToolStatus
  category: ToolCategory
}
```

- [ ] **Step 4: Create lib/data/sensors.ts**

Copy from current `src/data/sensors.ts`:

```ts
import type { SensorPreset } from '@/lib/types'

export const SENSORS: SensorPreset[] = [
  { id: 'mf', name: 'Medium Format', cropFactor: 0.79 },
  { id: 'ff', name: 'Full Frame', cropFactor: 1.0 },
  { id: 'apsc_n', name: 'APS-C (Nikon/Sony)', cropFactor: 1.5 },
  { id: 'apsc_c', name: 'APS-C (Canon)', cropFactor: 1.6 },
  { id: 'm43', name: 'Micro Four Thirds', cropFactor: 2.0 },
  { id: '1in', name: '1" Sensor', cropFactor: 2.7 },
]

export function getSensor(id: string): SensorPreset {
  return SENSORS.find((s) => s.id === id) ?? SENSORS[1]
}
```

- [ ] **Step 5: Create lib/data/focalLengths.ts**

Copy from current `src/data/focalLengths.ts`:

```ts
import type { FocalLengthPreset } from '@/lib/types'

export const FOCAL_LENGTHS: FocalLengthPreset[] = [
  { value: 8, label: 'Fisheye' },
  { value: 14, label: 'Ultra-wide' },
  { value: 20, label: null },
  { value: 24, label: 'Wide' },
  { value: 35, label: null },
  { value: 40, label: null },
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

- [ ] **Step 6: Create lib/data/tools.ts**

```ts
import type { ToolDef } from '@/lib/types'

export const TOOLS: ToolDef[] = [
  { slug: 'fov-viewer', name: 'FOV Viewer', description: 'Compare field of view across focal lengths and sensor sizes', status: 'live', category: 'visualizer' },
  { slug: 'exposure-simulator', name: 'Exposure Triangle Simulator', description: 'See how aperture, shutter speed, and ISO interact', status: 'draft', category: 'visualizer' },
  { slug: 'dof-calculator', name: 'Depth of Field Calculator', description: 'Calculate near focus, far focus, and total depth of field', status: 'draft', category: 'calculator' },
  { slug: 'hyperfocal-table', name: 'Hyperfocal Distance Table', description: 'Quick-reference hyperfocal distances for any lens and aperture', status: 'draft', category: 'reference' },
  { slug: 'shutter-speed-guide', name: 'Shutter Speed Guide', description: 'Find the minimum safe shutter speed for sharp handheld shots', status: 'draft', category: 'calculator' },
  { slug: 'nd-filter-calculator', name: 'ND Filter Calculator', description: 'Calculate exposure time with any ND filter', status: 'draft', category: 'calculator' },
  { slug: 'diffraction-limit', name: 'Diffraction Limit Calculator', description: 'Find the sharpest aperture for your sensor', status: 'draft', category: 'calculator' },
  { slug: 'star-trail-calculator', name: 'Star Trail Calculator', description: 'Calculate max exposure for sharp stars or plan star trail shots', status: 'draft', category: 'calculator' },
  { slug: 'white-balance', name: 'White Balance Visualizer', description: 'See how color temperature affects your photos', status: 'draft', category: 'visualizer' },
  { slug: 'color-harmony', name: 'Color Harmony Picker', description: 'Build color palettes for photography shoots', status: 'draft', category: 'visualizer' },
  { slug: 'ev-chart', name: 'EV Chart', description: 'Interactive exposure value reference chart', status: 'draft', category: 'reference' },
  { slug: 'sensor-size', name: 'Sensor Size Comparison', description: 'Compare camera sensor sizes visually', status: 'draft', category: 'visualizer' },
  { slug: 'exif-viewer', name: 'EXIF Viewer', description: 'View photo metadata without uploading — 100% client-side', status: 'draft', category: 'file-tool' },
  { slug: 'histogram', name: 'Histogram Explainer', description: 'Understand your photo\'s histogram with annotations', status: 'draft', category: 'file-tool' },
]

export function getToolBySlug(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug)
}

export function getLiveTools(): ToolDef[] {
  return TOOLS.filter((t) => t.status === 'live')
}
```

- [ ] **Step 7: Run tests**

```bash
npx vitest run lib/data/tools.test.ts
```

Expected: All 6 tests PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/ 
git commit -m "feat: add tool registry, shared types, sensor and focal length data"
```

---

### Task 4: Shared Layout Components

**Files:**
- Create: `components/layout/Nav.tsx`
- Create: `components/layout/Nav.module.css`
- Create: `components/layout/Footer.tsx`
- Create: `components/layout/Footer.module.css`
- Create: `components/layout/ThemeToggle.tsx`
- Create: `components/shared/Toast.tsx`
- Create: `components/shared/Toast.module.css`
- Create: `components/shared/AdSlot.tsx`
- Create: `components/shared/DraftBanner.tsx`
- Create: `components/shared/ToolPageShell.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create ThemeToggle component**

```tsx
// components/layout/ThemeToggle.tsx
'use client'

interface ThemeToggleProps {
  theme: string
  onChange: (theme: 'dark' | 'light') => void
}

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  return (
    <button
      onClick={() => onChange(theme === 'dark' ? 'light' : 'dark')}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 'var(--text-md)',
        color: 'var(--text-secondary)',
        padding: 'var(--space-xs)',
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
```

- [ ] **Step 2: Create Nav component**

```tsx
// components/layout/Nav.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { getLiveTools } from '@/lib/data/tools'
import { ThemeToggle } from './ThemeToggle'
import styles from './Nav.module.css'

interface NavProps {
  theme: string
  onThemeChange: (theme: 'dark' | 'light') => void
}

export function Nav({ theme, onThemeChange }: NavProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const liveTools = getLiveTools()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <Link href="/" className={styles.logo}>PhotoTools</Link>
        <div className={styles.dropdown} ref={ref}>
          <button className={styles.trigger} onClick={() => setOpen(!open)}>
            Tools <span className={styles.caret}>▼</span>
          </button>
          {open && (
            <div className={styles.menu}>
              {liveTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className={styles.menuItem}
                  onClick={() => setOpen(false)}
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={styles.right}>
        <ThemeToggle theme={theme} onChange={onThemeChange} />
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Create Nav.module.css**

```css
/* components/layout/Nav.module.css */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-md);
  height: 44px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.logo {
  font-weight: 700;
  font-size: var(--text-md);
  color: var(--text-primary);
  text-decoration: none;
}

.dropdown {
  position: relative;
}

.trigger {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-weight: 500;
}

.trigger:hover {
  color: var(--text-primary);
}

.caret {
  font-size: 10px;
  margin-left: 2px;
  opacity: 0.6;
}

.menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-xs) 0;
  min-width: 240px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 200;
  box-shadow: var(--shadow-md);
}

.menuItem {
  display: block;
  padding: var(--space-sm) 14px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-decoration: none;
}

.menuItem:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

- [ ] **Step 4: Create Footer component**

```tsx
// components/layout/Footer.tsx
import Link from 'next/link'
import { getLiveTools } from '@/lib/data/tools'
import styles from './Footer.module.css'

export function Footer() {
  const liveTools = getLiveTools()

  return (
    <footer className={styles.footer}>
      <div className={styles.links}>
        {liveTools.map((tool) => (
          <Link key={tool.slug} href={`/tools/${tool.slug}`} className={styles.link}>
            {tool.name}
          </Link>
        ))}
        <Link href="/learn/glossary" className={styles.link}>Glossary</Link>
      </div>
      <p className={styles.copy}>PhotoTools — Free photography calculators and references</p>
    </footer>
  )
}
```

```css
/* components/layout/Footer.module.css */
.footer {
  padding: var(--space-lg) var(--space-md);
  border-top: 1px solid var(--border);
  text-align: center;
}

.links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.link {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-decoration: none;
}

.link:hover {
  color: var(--text-primary);
}

.copy {
  font-size: var(--text-xs);
  color: var(--text-muted);
}
```

- [ ] **Step 5: Create AdSlot placeholder component**

```tsx
// components/shared/AdSlot.tsx
import type { CSSProperties } from 'react'

interface AdSlotProps {
  width: number
  height: number
  className?: string
}

export function AdSlot({ width, height, className }: AdSlotProps) {
  const style: CSSProperties = {
    minWidth: width,
    minHeight: height,
    maxWidth: '100%',
    margin: '0 auto',
  }

  return (
    <div className={className} style={style} data-ad-slot aria-hidden="true">
      {/* AdSense script injected here when ads are enabled */}
    </div>
  )
}
```

- [ ] **Step 6: Create DraftBanner component**

```tsx
// components/shared/DraftBanner.tsx
export function DraftBanner() {
  return (
    <div style={{
      background: '#f59e0b',
      color: '#000',
      textAlign: 'center',
      padding: '4px 8px',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
    }}>
      Preview — This tool is not yet public
    </div>
  )
}
```

- [ ] **Step 7: Create ToolPageShell component**

```tsx
// components/shared/ToolPageShell.tsx
'use client'

import { getToolBySlug } from '@/lib/data/tools'
import { DraftBanner } from './DraftBanner'
import type { ReactNode } from 'react'

interface ToolPageShellProps {
  slug: string
  children: ReactNode
}

export function ToolPageShell({ slug, children }: ToolPageShellProps) {
  const tool = getToolBySlug(slug)

  return (
    <>
      {tool?.status === 'draft' && <DraftBanner />}
      <div style={{ padding: 'var(--space-md)', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {tool && (
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{tool.name}</h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{tool.description}</p>
          </div>
        )}
        {children}
      </div>
    </>
  )
}
```

- [ ] **Step 8: Create Toast component**

Copy from current `src/components/Toast.tsx`, converting to CSS Module. Keep the same logic.

```tsx
// components/shared/Toast.tsx
'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string | null
  onDone: () => void
}

export function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDone, 2000)
    return () => clearTimeout(timer)
  }, [message, onDone])

  if (!message) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--bg-surface)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 16px',
      fontSize: 'var(--text-sm)',
      boxShadow: 'var(--shadow-md)',
      zIndex: 1000,
    }}>
      {message}
    </div>
  )
}
```

- [ ] **Step 9: Wire up root layout**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'

export const metadata: Metadata = {
  title: {
    default: 'PhotoTools — Free Photography Calculators & References',
    template: '%s | PhotoTools',
  },
  description: 'Free browser-based photography tools: FOV viewer, DoF calculator, exposure simulator, and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 10: Create ThemeProvider**

```tsx
// components/layout/ThemeProvider.tsx
'use client'

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { Nav } from './Nav'
import { Footer } from './Footer'

interface ThemeContextValue {
  theme: 'dark' | 'light'
  setTheme: (t: 'dark' | 'light') => void
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'dark', setTheme: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('phototools.io-theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('phototools.io-theme', theme)
  }, [theme])

  return (
    <ThemeContext value={{ theme, setTheme }}>
      <Nav theme={theme} onThemeChange={setTheme} />
      <main>{children}</main>
      <Footer />
    </ThemeContext>
  )
}
```

- [ ] **Step 11: Create a placeholder landing page**

```tsx
// app/page.tsx
import Link from 'next/link'
import { getLiveTools } from '@/lib/data/tools'

export default function HomePage() {
  const tools = getLiveTools()

  return (
    <div style={{ padding: 'var(--space-xl) var(--space-md)', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 'var(--space-sm)' }}>PhotoTools</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
        Free photography calculators, simulators, and references.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            style={{
              display: 'block',
              padding: 'var(--space-lg)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>{tool.name}</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 12: Build and verify**

```bash
npm run build
```

Expected: Successful build. Landing page renders with FOV Viewer card (only live tool).

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: add shared layout (Nav, Footer, ThemeProvider, ToolPageShell, AdSlot, Toast)"
```

---

## Phase 1: Migrate FOV Viewer

### Task 5: Migrate FOV Viewer

**Files:**
- Create: `lib/math/fov.ts` (copy from current `src/utils/fov.ts`)
- Create: `lib/math/fov.test.ts` (copy from current `src/utils/fov.test.ts`)
- Create: `lib/data/scenes.ts` (copy from current `src/data/scenes.ts`)
- Create: `lib/hooks/useQuerySync.ts` (adapt from current)
- Create: `lib/utils/export.ts` (copy from current `src/utils/export.ts`)
- Create: `components/tools/fov-viewer/FovViewer.tsx` (adapt from current `src/App.tsx`)
- Create: `components/tools/fov-viewer/Canvas.tsx` (copy from current)
- Create: `components/tools/fov-viewer/LensPanel.tsx` (copy from current)
- Create: `components/tools/fov-viewer/Sidebar.tsx` (copy from current)
- Create: `components/tools/fov-viewer/SceneStrip.tsx` (copy from current)
- Create: `components/tools/fov-viewer/ActionBar.tsx` (copy from current)
- Create: `components/tools/fov-viewer/ShareModal.tsx` (copy from current)
- Create: `components/tools/fov-viewer/FovViewer.module.css` (adapt from current App.css)
- Create: `app/tools/fov-viewer/page.tsx`
- Copy: scene images to `public/images/scenes/`

This is a large migration task. The strategy is:

1. Copy math/data modules verbatim — they have no React dependency
2. Copy components, adding `"use client"` directives and updating import paths
3. Move scene images from bundled imports to `public/` directory (use `<img>` or `next/image` instead of Vite `import`)
4. Adapt `useQuerySync` to work without `window` on server (guard with `typeof window !== 'undefined'`)
5. Wire into a Next.js page with SEO metadata

- [ ] **Step 1: Copy math modules**

Copy `src/utils/fov.ts` → `lib/math/fov.ts` (no changes needed — pure functions).
Copy `src/utils/fov.test.ts` → `lib/math/fov.test.ts` (update import path only).

- [ ] **Step 2: Run FOV math tests**

```bash
npx vitest run lib/math/fov.test.ts
```

Expected: All tests PASS.

- [ ] **Step 3: Copy scene images to public/**

```bash
mkdir -p public/images/scenes
cp src/assets/person.jpg public/images/scenes/
cp src/assets/portrait.jpg public/images/scenes/
cp src/assets/bird2.jpg public/images/scenes/
cp src/assets/city.jpg public/images/scenes/
cp src/assets/milkyway.jpg public/images/scenes/
```

- [ ] **Step 4: Update lib/data/scenes.ts to use public paths**

```ts
// lib/data/scenes.ts
export interface Scene {
  id: string
  name: string
  src: string
}

export const SCENES: Scene[] = [
  { id: 'person', name: 'Landscape', src: '/images/scenes/person.jpg' },
  { id: 'portrait', name: 'Portrait', src: '/images/scenes/portrait.jpg' },
  { id: 'bird', name: 'Bird', src: '/images/scenes/bird2.jpg' },
  { id: 'city', name: 'City Street', src: '/images/scenes/city.jpg' },
  { id: 'milkyway', name: 'Milky Way', src: '/images/scenes/milkyway.jpg' },
]
```

- [ ] **Step 5: Copy and adapt useQuerySync**

Copy `src/hooks/useQuerySync.ts` → `lib/hooks/useQuerySync.ts`. Update imports to use `@/lib/` paths. Guard `window` access:

```ts
export function parseQueryParams(): Partial<AppState> {
  if (typeof window === 'undefined') return {}
  // ... rest unchanged
}
```

The `AppState` type referenced here is FOV-viewer-specific. Keep it in `components/tools/fov-viewer/types.ts` since other tools will have their own state shapes.

- [ ] **Step 6: Copy utility modules**

Copy `src/utils/export.ts` → `lib/utils/export.ts` (no changes needed).

- [ ] **Step 7: Copy FOV Viewer components**

Copy each component from `src/components/` to `components/tools/fov-viewer/`:
- `Canvas.tsx` — add `'use client'` at top, update imports to `@/lib/` paths. Change `import img from '../assets/foo.jpg'` to use string paths from `SCENES`.
- `LensPanel.tsx` — add `'use client'`, update imports.
- `Sidebar.tsx` — add `'use client'`, update imports.
- `SceneStrip.tsx` — add `'use client'`, update imports. Update image references to use `<img src={scene.src}>` instead of bundled imports.
- `ActionBar.tsx` — add `'use client'`, update imports.
- `ShareModal.tsx` — add `'use client'`, update imports.

- [ ] **Step 8: Create FovViewer.tsx**

Adapt `src/App.tsx` into `components/tools/fov-viewer/FovViewer.tsx`:
- Add `'use client'` at top
- Remove CSS imports (will use CSS Module)
- Remove `TopNav` — handled by root layout
- Remove theme management — handled by ThemeProvider
- Keep the reducer, state, and all tool-specific UI
- Update all imports to `@/lib/` and `@/components/tools/fov-viewer/` paths

- [ ] **Step 9: Copy and adapt CSS**

Extract FOV-viewer-specific styles from `src/App.css` into `components/tools/fov-viewer/FovViewer.module.css`. The global theme tokens are already in `app/globals.css`. Convert BEM class names to CSS Module references.

- [ ] **Step 10: Create the page route**

```tsx
// app/tools/fov-viewer/page.tsx
import type { Metadata } from 'next'
import { ToolPageShell } from '@/components/shared/ToolPageShell'
import { FovViewer } from '@/components/tools/fov-viewer/FovViewer'

export const metadata: Metadata = {
  title: 'FOV Viewer — Compare Focal Lengths',
  description: 'Compare field of view across different focal lengths and sensor sizes. Free, interactive, shareable.',
}

export default function FovViewerPage() {
  return (
    <ToolPageShell slug="fov-viewer">
      <FovViewer />
    </ToolPageShell>
  )
}
```

- [ ] **Step 11: Verify build and dev server**

```bash
npm run build
npm run dev
```

Navigate to `http://localhost:3000/tools/fov-viewer`. Verify:
- Canvas renders with scene images
- Lens panels work (slider, presets, sensor select)
- Add/remove lens works
- Orientation toggle works
- Share/copy buttons work
- Theme toggle works
- URL params sync

- [ ] **Step 12: Run all migrated tests**

```bash
npx vitest run
```

Expected: All math tests pass. Component tests may need import path updates.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: migrate FOV Viewer to Next.js app"
```

---

## Phase 2: New Tools

Each tool follows this pattern:

1. **Math module** (`lib/math/<name>.ts`) — pure functions, no React
2. **Math tests** (`lib/math/<name>.test.ts`) — TDD, write tests first
3. **Client component** (`components/tools/<slug>/<Name>.tsx`) — `"use client"`, uses math module
4. **Page route** (`app/tools/<slug>/page.tsx`) — server component, SEO metadata, wraps client component in `ToolPageShell`

### Task 6: Depth of Field Calculator — Math Module

**Files:**
- Create: `lib/math/dof.ts`
- Create: `lib/math/dof.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// lib/math/dof.test.ts
import { describe, it, expect } from 'vitest'
import { calcDoF, calcHyperfocal } from './dof'

describe('calcDoF', () => {
  it('calculates DoF for 50mm f/2.8 at 3m on full frame', () => {
    const result = calcDoF({ focalLength: 50, aperture: 2.8, distance: 3, coc: 0.03 })
    expect(result.nearFocus).toBeCloseTo(2.73, 1)
    expect(result.farFocus).toBeCloseTo(3.33, 1)
    expect(result.totalDoF).toBeCloseTo(0.60, 1)
  })

  it('returns infinity for far focus when beyond hyperfocal', () => {
    const result = calcDoF({ focalLength: 24, aperture: 11, distance: 5, coc: 0.03 })
    expect(result.farFocus).toBe(Infinity)
  })

  it('narrow aperture gives deeper DoF than wide', () => {
    const wide = calcDoF({ focalLength: 50, aperture: 1.4, distance: 3, coc: 0.03 })
    const narrow = calcDoF({ focalLength: 50, aperture: 11, distance: 3, coc: 0.03 })
    expect(narrow.totalDoF).toBeGreaterThan(wide.totalDoF)
  })

  it('longer focal length gives shallower DoF', () => {
    const short = calcDoF({ focalLength: 35, aperture: 2.8, distance: 3, coc: 0.03 })
    const long = calcDoF({ focalLength: 85, aperture: 2.8, distance: 3, coc: 0.03 })
    expect(long.totalDoF).toBeLessThan(short.totalDoF)
  })

  it('closer distance gives shallower DoF', () => {
    const near = calcDoF({ focalLength: 50, aperture: 2.8, distance: 1, coc: 0.03 })
    const far = calcDoF({ focalLength: 50, aperture: 2.8, distance: 10, coc: 0.03 })
    expect(near.totalDoF).toBeLessThan(far.totalDoF)
  })
})

describe('calcHyperfocal', () => {
  it('calculates hyperfocal distance for 50mm f/8 full frame', () => {
    const h = calcHyperfocal(50, 8, 0.03)
    expect(h).toBeCloseTo(10.4, 0)
  })

  it('wider aperture gives longer hyperfocal distance', () => {
    const wide = calcHyperfocal(50, 2.8, 0.03)
    const narrow = calcHyperfocal(50, 16, 0.03)
    expect(wide).toBeGreaterThan(narrow)
  })

  it('longer focal length gives longer hyperfocal distance', () => {
    const short = calcHyperfocal(24, 8, 0.03)
    const long = calcHyperfocal(85, 8, 0.03)
    expect(long).toBeGreaterThan(short)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run lib/math/dof.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement dof.ts**

```ts
// lib/math/dof.ts
interface DoFInput {
  focalLength: number  // mm
  aperture: number     // f-number
  distance: number     // meters
  coc: number          // circle of confusion in mm (0.03 for full frame)
}

interface DoFResult {
  nearFocus: number    // meters
  farFocus: number     // meters (Infinity if past hyperfocal)
  totalDoF: number     // meters (Infinity if past hyperfocal)
  hyperfocal: number   // meters
}

export function calcHyperfocal(focalLength: number, aperture: number, coc: number): number {
  // H = f^2 / (N * c) + f  (in mm, convert to meters)
  const fMm = focalLength
  const hMm = (fMm * fMm) / (aperture * coc) + fMm
  return hMm / 1000
}

export function calcDoF(input: DoFInput): DoFResult {
  const { focalLength, aperture, distance, coc } = input
  const hyperfocal = calcHyperfocal(focalLength, aperture, coc)
  const hMm = hyperfocal * 1000
  const sMm = distance * 1000
  const fMm = focalLength

  const nearMm = (sMm * (hMm - fMm)) / (hMm + sMm - 2 * fMm)
  const nearFocus = Math.max(0, nearMm / 1000)

  let farFocus: number
  if (distance >= hyperfocal) {
    farFocus = Infinity
  } else {
    const farMm = (sMm * (hMm - fMm)) / (hMm - sMm)
    farFocus = farMm / 1000
  }

  const totalDoF = farFocus === Infinity ? Infinity : farFocus - nearFocus

  return { nearFocus, farFocus, totalDoF, hyperfocal }
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run lib/math/dof.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/math/dof.ts lib/math/dof.test.ts
git commit -m "feat: add depth of field math module with tests"
```

---

### Task 7: Depth of Field Calculator — UI Component & Page

**Files:**
- Create: `components/tools/dof-calculator/DofCalculator.tsx`
- Create: `components/tools/dof-calculator/DofCalculator.module.css`
- Create: `app/tools/dof-calculator/page.tsx`

- [ ] **Step 1: Create the client component**

```tsx
// components/tools/dof-calculator/DofCalculator.tsx
'use client'

import { useState, useMemo } from 'react'
import { calcDoF } from '@/lib/math/dof'
import { SENSORS, getSensor } from '@/lib/data/sensors'
import { FOCAL_LENGTHS } from '@/lib/data/focalLengths'
import styles from './DofCalculator.module.css'

// Circle of confusion lookup by sensor crop factor
function cocForCrop(cropFactor: number): number {
  return 0.03 / cropFactor
}

const APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22]

export function DofCalculator() {
  const [focalLength, setFocalLength] = useState(50)
  const [aperture, setAperture] = useState(2.8)
  const [distance, setDistance] = useState(3)
  const [sensorId, setSensorId] = useState('ff')

  const sensor = getSensor(sensorId)
  const coc = cocForCrop(sensor.cropFactor)

  const result = useMemo(
    () => calcDoF({ focalLength, aperture, distance, coc }),
    [focalLength, aperture, distance, coc],
  )

  function formatDistance(d: number): string {
    if (d === Infinity) return '∞'
    return d < 1 ? `${(d * 100).toFixed(0)} cm` : `${d.toFixed(2)} m`
  }

  return (
    <div className={styles.layout}>
      <div className={styles.controls}>
        <label className={styles.field}>
          <span className={styles.label}>Focal length</span>
          <select value={focalLength} onChange={(e) => setFocalLength(Number(e.target.value))} className={styles.select}>
            {FOCAL_LENGTHS.map((fl) => (
              <option key={fl.value} value={fl.value}>{fl.value}mm{fl.label ? ` (${fl.label})` : ''}</option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Aperture</span>
          <select value={aperture} onChange={(e) => setAperture(Number(e.target.value))} className={styles.select}>
            {APERTURES.map((a) => (
              <option key={a} value={a}>f/{a}</option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Subject distance</span>
          <input
            type="range"
            min={0.3}
            max={100}
            step={0.1}
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className={styles.slider}
          />
          <span className={styles.value}>{formatDistance(distance)}</span>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Sensor</span>
          <select value={sensorId} onChange={(e) => setSensorId(e.target.value)} className={styles.select}>
            {SENSORS.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.cropFactor}×)</option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.results}>
        <div className={styles.resultCard}>
          <span className={styles.resultLabel}>Near focus</span>
          <span className={styles.resultValue}>{formatDistance(result.nearFocus)}</span>
        </div>
        <div className={styles.resultCard}>
          <span className={styles.resultLabel}>Far focus</span>
          <span className={styles.resultValue}>{formatDistance(result.farFocus)}</span>
        </div>
        <div className={styles.resultCard}>
          <span className={styles.resultLabel}>Total DoF</span>
          <span className={styles.resultValue}>{formatDistance(result.totalDoF)}</span>
        </div>
        <div className={styles.resultCard}>
          <span className={styles.resultLabel}>Hyperfocal</span>
          <span className={styles.resultValue}>{formatDistance(result.hyperfocal)}</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create CSS Module**

```css
/* components/tools/dof-calculator/DofCalculator.module.css */
.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.select {
  padding: var(--space-sm);
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-family: inherit;
}

.slider {
  width: 100%;
  accent-color: var(--accent);
  height: 44px;
}

.value {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.results {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.resultCard {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: var(--space-md);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.resultLabel {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.resultValue {
  font-family: var(--font-mono);
  font-size: var(--text-lg);
  font-weight: 600;
}
```

- [ ] **Step 3: Create the page route**

```tsx
// app/tools/dof-calculator/page.tsx
import type { Metadata } from 'next'
import { ToolPageShell } from '@/components/shared/ToolPageShell'
import { DofCalculator } from '@/components/tools/dof-calculator/DofCalculator'

export const metadata: Metadata = {
  title: 'Depth of Field Calculator',
  description: 'Calculate near focus, far focus, total depth of field, and hyperfocal distance for any lens and sensor.',
}

export default function DofCalculatorPage() {
  return (
    <ToolPageShell slug="dof-calculator">
      <DofCalculator />
    </ToolPageShell>
  )
}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
npm run dev
```

Navigate to `http://localhost:3000/tools/dof-calculator`. Verify controls update results in real time.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add depth of field calculator tool"
```

---

### Task 8: ND Filter Calculator (math + UI + page)

Pattern: same as Tasks 6–7. Math module at `lib/math/exposure.ts` covering EV calculations, ND stop conversions, and shutter speed math. This module is shared by ND Filter Calculator, Shutter Speed Guide, Exposure Simulator, and EV Chart.

**Files:**
- Create: `lib/math/exposure.ts`
- Create: `lib/math/exposure.test.ts`
- Create: `components/tools/nd-filter-calculator/NdFilterCalculator.tsx`
- Create: `components/tools/nd-filter-calculator/NdFilterCalculator.module.css`
- Create: `app/tools/nd-filter-calculator/page.tsx`

Math module functions needed:

```ts
// lib/math/exposure.ts
export function calcEV(aperture: number, shutterSpeed: number, iso: number): number
export function shutterWithNd(baseShutter: number, ndStops: number): number
export function ndFactorToStops(factor: number): number
export function formatShutterSpeed(seconds: number): string
export function reciprocalRule(focalLength: number, stabStops: number): number
```

Follow the same test-first → implement → component → page → commit pattern.

---

### Task 9: Shutter Speed Guide (UI + page, reuses exposure.ts)

**Files:**
- Create: `components/tools/shutter-speed-guide/ShutterSpeedGuide.tsx`
- Create: `components/tools/shutter-speed-guide/ShutterSpeedGuide.module.css`
- Create: `app/tools/shutter-speed-guide/page.tsx`

Reuses `reciprocalRule` and `formatShutterSpeed` from `lib/math/exposure.ts`.

---

### Task 10: Hyperfocal Distance Table (UI + page, reuses dof.ts)

**Files:**
- Create: `components/tools/hyperfocal-table/HyperfocalTable.tsx`
- Create: `components/tools/hyperfocal-table/HyperfocalTable.module.css`
- Create: `app/tools/hyperfocal-table/page.tsx`

Renders a table using `calcHyperfocal` from `lib/math/dof.ts` for every combination of focal length × aperture.

---

### Task 11: Diffraction Limit Calculator (math + UI + page)

**Files:**
- Create: `lib/math/diffraction.ts`
- Create: `lib/math/diffraction.test.ts`
- Create: `components/tools/diffraction-limit/DiffractionLimit.tsx`
- Create: `components/tools/diffraction-limit/DiffractionLimit.module.css`
- Create: `app/tools/diffraction-limit/page.tsx`

Math:

```ts
// lib/math/diffraction.ts
export function pixelPitch(sensorWidthMm: number, resolutionMp: number, aspectRatio: number): number
export function diffractionLimitedAperture(pixelPitchUm: number): number
```

---

### Task 12: Star Trail Calculator (math + UI + page)

**Files:**
- Create: `lib/math/startrail.ts`
- Create: `lib/math/startrail.test.ts`
- Create: `components/tools/star-trail-calculator/StarTrailCalculator.tsx`
- Create: `components/tools/star-trail-calculator/StarTrailCalculator.module.css`
- Create: `app/tools/star-trail-calculator/page.tsx`

Math:

```ts
// lib/math/startrail.ts
export function rule500(focalLength: number, cropFactor: number): number  // max seconds
export function ruleNPF(aperture: number, focalLength: number, pixelPitchUm: number): number
export function stackingTime(exposurePerFrame: number, numFrames: number, gapSeconds: number): number
```

---

### Task 13: Exposure Triangle Simulator (math + Canvas UI + page)

**Files:**
- Reuses: `lib/math/exposure.ts` (calcEV, etc.)
- Create: `components/tools/exposure-simulator/ExposureSimulator.tsx`
- Create: `components/tools/exposure-simulator/ExposureCanvas.tsx`
- Create: `components/tools/exposure-simulator/ExposureSimulator.module.css`
- Create: `app/tools/exposure-simulator/page.tsx`

This is the most complex tool — three linked sliders that compensate each other. The Canvas renders a simulated photo preview with brightness, blur, and noise effects.

---

### Task 14: White Balance Visualizer (math + Canvas UI + page)

**Files:**
- Create: `lib/math/color.ts`
- Create: `lib/math/color.test.ts`
- Create: `components/tools/white-balance/WhiteBalance.tsx`
- Create: `components/tools/white-balance/WhiteBalance.module.css`
- Create: `app/tools/white-balance/page.tsx`

Math:

```ts
// lib/math/color.ts
export function kelvinToRgb(kelvin: number): { r: number; g: number; b: number }
```

Canvas draws a sample image with the Kelvin shift applied as a color filter.

---

### Task 15: Color Harmony Picker (math + UI + page)

**Files:**
- Reuses: `lib/math/color.ts` (extended with harmony functions)
- Create: `components/tools/color-harmony/ColorHarmony.tsx`
- Create: `components/tools/color-harmony/ColorHarmony.module.css`
- Create: `app/tools/color-harmony/page.tsx`

Add to `lib/math/color.ts`:

```ts
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number }
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number }
export function complementary(hue: number): number[]
export function analogous(hue: number): number[]
export function triadic(hue: number): number[]
export function splitComplementary(hue: number): number[]
```

---

### Task 16: EV Chart (UI + page, reuses exposure.ts)

**Files:**
- Create: `lib/data/ev-conditions.ts` (lighting conditions with EV values)
- Create: `components/tools/ev-chart/EvChart.tsx`
- Create: `components/tools/ev-chart/EvChart.module.css`
- Create: `app/tools/ev-chart/page.tsx`

Pure HTML grid — no canvas.

---

### Task 17: Camera Sensor Size Comparison (Canvas UI + page)

**Files:**
- Reuses: `lib/data/sensors.ts`
- Create: `components/tools/sensor-size/SensorSize.tsx`
- Create: `components/tools/sensor-size/SensorSizeCanvas.tsx`
- Create: `components/tools/sensor-size/SensorSize.module.css`
- Create: `app/tools/sensor-size/page.tsx`

Canvas draws sensor outlines to scale. Reuses SENSORS data. Add physical dimensions to sensor data:

```ts
// Add to lib/data/sensors.ts
export interface SensorDimensions {
  id: string
  widthMm: number
  heightMm: number
}

export const SENSOR_DIMENSIONS: SensorDimensions[] = [
  { id: 'mf', widthMm: 43.8, heightMm: 32.9 },
  { id: 'ff', widthMm: 36, heightMm: 24 },
  { id: 'apsc_n', widthMm: 23.5, heightMm: 15.6 },
  { id: 'apsc_c', widthMm: 22.3, heightMm: 14.9 },
  { id: 'm43', widthMm: 17.3, heightMm: 13.0 },
  { id: '1in', widthMm: 13.2, heightMm: 8.8 },
]
```

---

### Task 18: EXIF Viewer (file tool + page)

**Files:**
- Create: `components/tools/exif-viewer/ExifViewer.tsx`
- Create: `components/tools/exif-viewer/ExifViewer.module.css`
- Create: `components/shared/FileDropZone.tsx`
- Create: `components/shared/FileDropZone.module.css`
- Create: `app/tools/exif-viewer/page.tsx`

Install EXIF parser:

```bash
npm install exifreader
```

`FileDropZone` is a shared component used by both EXIF Viewer and Histogram. It handles drag-and-drop + file picker, reads the file as ArrayBuffer, and calls `onFile(file: File, buffer: ArrayBuffer)`.

---

### Task 19: Histogram Explainer (Canvas + file tool + page)

**Files:**
- Create: `lib/math/histogram.ts`
- Create: `lib/math/histogram.test.ts`
- Create: `components/tools/histogram/Histogram.tsx`
- Create: `components/tools/histogram/HistogramCanvas.tsx`
- Create: `components/tools/histogram/Histogram.module.css`
- Create: `app/tools/histogram/page.tsx`

Math:

```ts
// lib/math/histogram.ts
export interface HistogramData {
  r: number[]   // 256 bins
  g: number[]
  b: number[]
  luma: number[]
}

export function computeHistogram(imageData: ImageData): HistogramData
export function detectClipping(data: HistogramData, threshold: number): { blackClip: boolean; whiteClip: boolean }
```

Reuses `FileDropZone` from Task 18. Draws image on hidden canvas, extracts pixel data, computes histogram, renders annotated histogram on visible canvas.

---

## Phase 3: Content & Landing

### Task 20: Photography Glossary & Article Migration

**Files:**
- Create: `lib/data/glossary.ts`
- Create: `app/learn/glossary/page.tsx`
- Create: `components/tools/glossary/Glossary.tsx`
- Create: `components/tools/glossary/Glossary.module.css`
- Create: `content/articles/*.mdx` (migrate from current git history)
- Create: `app/learn/[slug]/page.tsx`

The glossary is a searchable list of 100+ photography terms. Each term has a definition and optionally links to a related tool.

```ts
// lib/data/glossary.ts
export interface GlossaryTerm {
  term: string
  definition: string
  relatedTool?: string  // slug from TOOLS registry
}

export const GLOSSARY: GlossaryTerm[] = [
  { term: 'Aperture', definition: 'The opening in a lens through which light passes...', relatedTool: 'exposure-simulator' },
  { term: 'Bokeh', definition: 'The aesthetic quality of out-of-focus areas...' },
  // ... 100+ terms
]
```

The article pages use MDX or static generation from `content/articles/`. Migrate the existing SEO articles from the current repo's git history.

---

## CI/CD Setup

The GitHub Actions workflow (`ci.yml` created in Task 1) should be updated as tools are added. Vercel auto-deploys from `main` — no additional config needed beyond connecting the repo to Vercel.

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| Phase 0 | 1–4 | Working Next.js scaffold with design system, shared components, CI |
| Phase 1 | 5 | FOV Viewer migrated and working at `/tools/fov-viewer` |
| Phase 2 | 6–19 | 14 new tools (all as `draft` status) |
| Phase 3 | 20 | Glossary + article pages |

Total: **20 tasks**. Phase 2 tasks are independent and can be parallelized.
