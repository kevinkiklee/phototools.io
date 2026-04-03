# Photography Tools Hub — Design Spec

**Date:** 2026-04-02
**Status:** Approved
**Scope:** Migrate FOV Viewer into a multi-tool photography hub with 14 client-side tools, ad monetization, and a foundation for future AI/subscription features.

---

## 1. Vision

A free, browser-based suite of photography tools that photographers bookmark and revisit. Monetized with ads. All tools are client-side — no server required for the initial 14 tools. The architecture supports adding backend-powered AI tools and subscriptions later.

**Target audience:** Beginners, enthusiasts, and working professionals — all levels.

---

## 2. Tool List (Phase 1 — 14 tools)

| # | Tool | Category | Rendering |
|---|------|----------|-----------|
| 1 | Exposure Triangle Simulator | Interactive visualizer | Canvas |
| 2 | Depth of Field Calculator | Calculator | HTML + diagram |
| 3 | Hyperfocal Distance Table | Reference table | HTML table |
| 4 | Shutter Speed Guide | Calculator | HTML |
| 5 | ND Filter Calculator | Calculator | HTML |
| 6 | Diffraction Limit Calculator | Calculator | HTML + scale visual |
| 7 | Star Trail Calculator | Calculator | HTML + preview |
| 8 | White Balance / Color Temp Visualizer | Interactive visualizer | Canvas |
| 9 | Color Harmony Picker | Interactive visualizer | Canvas/SVG |
| 10 | EV Chart / Exposure Value Reference | Reference table | HTML grid |
| 11 | Camera Sensor Size Comparison | Interactive visualizer | Canvas |
| 12 | Photography Glossary | Reference | Static HTML |
| 13 | EXIF Viewer | File tool | HTML (drag-and-drop) |
| 14 | Histogram Explainer | File tool | Canvas (drag-and-drop) |

Plus the existing **FOV Viewer** (migrated).

---

## 3. Tech Stack

| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Next.js (App Router) | 16 |
| React | react + react-dom | 19 |
| Language | TypeScript | 5.7+ |
| Styling | CSS custom properties + CSS Modules | — |
| Linting | ESLint CLI + typescript-eslint | Latest |
| Testing | Vitest + @testing-library/react + jsdom | Latest |
| Canvas | Browser native Canvas API | — |
| Dev server | Turbopack (Next.js 16 default) | — |
| Deploy | Vercel | — |
| Ads | Google AdSense | — |

**No Tailwind CSS. No component library. Zero runtime dependencies beyond React + Next.js.** One exception: a lightweight EXIF parser for the EXIF Viewer tool.

---

## 4. Routing

```
/                               Landing page (hero + tool grid)
/tools/fov-viewer               FOV Viewer (migrated)
/tools/exposure-simulator       Exposure Triangle Simulator
/tools/dof-calculator           Depth of Field Calculator
/tools/hyperfocal-table         Hyperfocal Distance Table
/tools/shutter-speed-guide      Shutter Speed Guide
/tools/nd-filter-calculator     ND Filter Calculator
/tools/diffraction-limit        Diffraction Limit Calculator
/tools/star-trail-calculator    Star Trail Calculator
/tools/white-balance            White Balance Visualizer
/tools/color-harmony            Color Harmony Picker
/tools/ev-chart                 EV Chart
/tools/sensor-size              Sensor Size Comparison
/tools/exif-viewer              EXIF Viewer
/tools/histogram                Histogram Explainer
/learn/glossary                 Photography Glossary
/learn/[slug]                   SEO articles (MDX or static)
```

Each tool page is statically generated with metadata (title, description, OG image) for SEO. The interactive tool itself is a `"use client"` component.

---

## 5. Tool Visibility System

Each tool has a `status` flag in a central registry:

```ts
// lib/data/tools.ts
export const TOOLS = [
  { slug: 'fov-viewer', name: 'FOV Viewer', status: 'live', ... },
  { slug: 'dof-calculator', name: 'DoF Calculator', status: 'draft', ... },
  // ...
] as const
```

- **`live`** — visible in landing page grid, navigation, and sitemap.
- **`draft`** — hidden from navigation and landing page. Accessible by direct URL for testing. Shows a "Preview" banner. Excluded from sitemap.

The landing page and nav filter to `status === 'live'`. Flipping a tool to live is a one-line config change + deploy.

---

## 6. Project Structure

```
phototools.io/
├── app/
│   ├── layout.tsx              # Root layout (nav, footer, theme, ad slots)
│   ├── page.tsx                # Landing page — tool grid
│   ├── tools/
│   │   ├── fov-viewer/
│   │   │   └── page.tsx        # Server component: metadata + "use client" tool
│   │   ├── exposure-simulator/
│   │   │   └── page.tsx
│   │   ├── dof-calculator/
│   │   │   └── page.tsx
│   │   ├── hyperfocal-table/
│   │   │   └── page.tsx
│   │   ├── shutter-speed-guide/
│   │   │   └── page.tsx
│   │   ├── nd-filter-calculator/
│   │   │   └── page.tsx
│   │   ├── diffraction-limit/
│   │   │   └── page.tsx
│   │   ├── star-trail-calculator/
│   │   │   └── page.tsx
│   │   ├── white-balance/
│   │   │   └── page.tsx
│   │   ├── color-harmony/
│   │   │   └── page.tsx
│   │   ├── ev-chart/
│   │   │   └── page.tsx
│   │   ├── sensor-size/
│   │   │   └── page.tsx
│   │   ├── exif-viewer/
│   │   │   └── page.tsx
│   │   └── histogram/
│   │       └── page.tsx
│   └── learn/
│       ├── glossary/
│       │   └── page.tsx
│       └── [slug]/
│           └── page.tsx        # SEO articles
├── components/
│   ├── layout/                 # Nav, Footer, Sidebar, ThemeToggle
│   ├── tools/                  # One folder per tool's client components
│   │   ├── fov-viewer/         # Canvas, LensPanel, SceneStrip, etc.
│   │   ├── exposure-simulator/
│   │   ├── dof-calculator/
│   │   └── ...
│   └── shared/                 # Toast, AdSlot, SliderInput, ResultCard, etc.
├── lib/
│   ├── math/                   # Pure calculation modules
│   ├── data/                   # sensors.ts, focalLengths.ts, tools.ts, glossary.ts
│   └── hooks/                  # useQuerySync, useCanvas, useDropzone
├── content/
│   └── articles/               # MDX files for /learn/[slug]
├── public/
│   └── images/                 # Scene images, OG images
├── __tests__/                  # Integration tests
├── next.config.ts
├── vitest.config.ts
└── package.json
```

Key decisions:
- **`app/` pages are thin** — server component that sets metadata, renders `"use client"` tool component.
- **`lib/math/`** — pure calculation functions, no React. Testable in isolation.
- **`lib/data/`** — static data (sensors, focal lengths, glossary terms, EV tables, tool registry).
- **`components/shared/`** — reusable UI across tools (slider inputs, result cards, file drop zones, ad slots).
- **Scene images in `public/images/`** — served statically by Next.js, not bundled via imports.

---

## 7. Tool Design Summaries

### Calculators (form → computed result)

**Depth of Field Calculator** — Inputs: focal length, aperture, subject distance, sensor size. Outputs: near focus limit, far focus limit, total DoF, hyperfocal distance. Visual: side-view diagram showing the in-focus zone as a colored band.

**Hyperfocal Distance Table** — Inputs: sensor size, circle of confusion. Output: table of focal lengths x apertures with hyperfocal distances. Printable. No canvas — pure HTML table with sticky headers.

**Shutter Speed Guide** — Inputs: focal length, stabilization type (none/OIS/IBIS), subject motion (still/walking/running/vehicle). Output: recommended minimum shutter speed with explanation of the rule applied.

**ND Filter Calculator** — Inputs: base shutter speed, ND filter strength (ND2–ND1000 or enter stops). Output: resulting shutter speed in seconds/minutes. Quick-reference table for common combinations.

**Diffraction Limit Calculator** — Inputs: sensor resolution (MP or camera preset), pixel pitch. Output: diffraction-limited aperture with visual scale showing "sharp zone" vs "diffraction zone" across f-stops.

**Star Trail Calculator** — Inputs: focal length, sensor size, desired result (points vs trails). Outputs: max exposure for sharp stars (500 rule + NPF rule), total stacking time for trails. Visual: simple preview of point vs trail vs circle.

### Interactive Visualizers (canvas or rich UI)

**Exposure Triangle Simulator** — Three linked sliders (aperture, shutter, ISO). Move one, the others compensate. Canvas shows simulated photo preview: brightness, depth of field blur, motion blur, noise grain. The hero tool of the site.

**White Balance / Color Temperature Visualizer** — Slider from 2000K to 10000K. Canvas renders a sample photo with color temperature shift in real time. Labeled presets on the scale (candlelight, tungsten, daylight, shade).

**Color Harmony Picker** — Interactive color wheel. Select base color, choose harmony type (complementary, analogous, triadic, split-complementary). Shows palette with hex/RGB. Photography-focused suggestions (wardrobe, backdrop, golden hour tones).

**EV Chart** — Interactive grid: rows = shutter speeds, columns = apertures. Click a cell to see EV value and ISO combinations. Click a lighting condition to highlight matching EV row. Pure HTML/CSS grid.

**Camera Sensor Size Comparison** — Canvas drawing sensor outlines to scale: Medium Format through smartphone. Toggle overlay vs side-by-side. Show pixel pitch and total area. Reuses sensor data from `lib/data/sensors.ts`.

### File/Image Tools (drag-and-drop)

**EXIF Viewer** — Drag-and-drop or file picker. Reads EXIF client-side (lightweight parser). Displays: camera, lens, settings, date, GPS. No server upload. Privacy-first.

**Histogram Explainer** — Drag-and-drop or file picker. Draws image on hidden canvas, reads pixel data, computes RGB + luminance histograms. Annotated with "shadows", "midtones", "highlights", clipping warnings.

### Reference (static content)

**Photography Glossary** — Searchable list of 100+ terms. Each term links to related tools. SSG page. Data in `lib/data/glossary.ts`.

---

## 8. Privacy & Security

**Core principle: nothing leaves the browser unless absolutely necessary.**

- **No server uploads** — EXIF Viewer and Histogram process images entirely client-side using Canvas API and FileReader. Images never leave the device. Surfaced in the UI: "Your photos never leave your device."
- **No tracking beyond ads** — Google AdSense is the only third-party script. No analytics SDK at launch. If added later, use Vercel Analytics (first-party, cookie-free).
- **No user accounts** — no auth, no database, no PII for the initial 14 tools.
- **CSP headers** — configured in `next.config.ts` via `headers()`. Scripts restricted to self + AdSense domain. Images restricted to self + data/blob URIs.
- **Referrer policy** — `no-referrer` on all pages.
- **Dependency audit** — `npm audit --omit=dev` in CI. Minimal dependencies — only new runtime dep is an EXIF parser.
- **No eval/innerHTML** — all rendering through React or Canvas API.

---

## 9. UX Strategy

### Information hierarchy
- Tool first, chrome second. 90%+ of the viewport is the tool. Navigation is a slim top bar with site name and tool switcher dropdown.
- Results are immediate. Every input change updates output in real time — no "Calculate" buttons.
- Shareable state. Every tool syncs state to URL query params via `useQuerySync`.

### Progressive disclosure
- Tools start with sensible defaults (e.g., DoF Calculator: 50mm f/2.8 at 3m on full frame).
- Advanced options collapsed by default (circle of confusion override, NPF rule toggle).
- Tooltips on technical terms link to the glossary.

### Feedback
- Toast notifications for clipboard actions.
- CSS transitions on result value changes.
- No loading spinners — everything computes instantly client-side.

### Onboarding
- One-line description below each tool's title.
- Tools load with realistic working defaults — never an empty form.

---

## 10. Mobile UX Strategy

### Layout
- **Single breakpoint at 1024px.**
- **Desktop (>=1024px)**: controls on left, visualization/results on right.
- **Mobile (<1024px)**: stacked — visualization/results on top, controls below. User sees output first, scrolls to adjust.
- Canvas tools use full viewport width on mobile.

### Touch
- Native `<input type="range">` with 44px+ touch targets.
- Touch-draggable elements (FOV Viewer overlays) use pointer events.
- Tooltips activate on tap, not hover.
- Native `<select>` on mobile (OS picker).

### Performance
- Lazy-loaded per route — only active tool's JS loads.
- `next/image` with responsive `sizes` and WebP.
- No heavy JS libraries.

---

## 11. Ad Placement Strategy

**Principle: ads generate revenue without degrading the tool experience.**

### Placement rules
- Never between input and output.
- Never on top of interactive elements.
- Predictable, consistent locations.

### Desktop (>=1024px)

```
┌─────────────────────────────────────────────────┐
│  Top bar (nav)                                  │
├─────────────────────────────────────────────────┤
│  Leaderboard ad (728x90)                        │
├─────────────────────┬───────────────────────────┤
│  Tool controls      │  Tool visualization /     │
│                     │  results                  │
├─────────────────────┴───────────────────────────┤
│  Educational content below the tool             │
│  ┌─────────────┐                                │
│  │ In-content   │  (between paragraphs,         │
│  │ ad (336x280) │   NOT in the tool itself)     │
│  └─────────────┘                                │
├─────────────────────────────────────────────────┤
│  Footer + leaderboard ad (728x90)               │
└─────────────────────────────────────────────────┘
```

### Mobile (<1024px)

```
┌─────────────────────┐
│  Top bar (nav)      │
├─────────────────────┤
│  Tool visualization │
├─────────────────────┤
│  Anchor ad (320x50) │  ← sticky bottom
├─────────────────────┤
│  Tool controls      │
├─────────────────────┤
│  Educational content│
│  + in-content ads   │
├─────────────────────┤
│  Footer             │
└─────────────────────┘
```

### Implementation
- `AdSlot` shared component with fixed dimensions to prevent layout shift.
- Google AdSense Auto Ads for initial launch, then review and override.
- Below-fold ads lazy-loaded on scroll.
- Interactive tool pages: lower ad density. Reference/article pages: higher ad density.

---

## 12. Core Web Vitals Strategy

**Target: 90+ Lighthouse score on every page, mobile and desktop.**

### LCP (Largest Contentful Paint) — target < 2.5s

| Threat | Mitigation |
|--------|------------|
| Large images | `next/image` with `priority` on above-fold. WebP, responsive `sizes`. |
| Canvas tools | Preload scene images with `<link rel="preload">`. |
| Ad scripts | Load AdSense `async`. Never in critical path. |
| JS bundle | Code-split per route (automatic in App Router). |
| Fonts | System font stack for sans-serif. Preload monospace font only. |

### CLS (Cumulative Layout Shift) — target < 0.1

| Threat | Mitigation |
|--------|------------|
| Ads loading | Fixed-dimension `AdSlot` containers with `min-height` + `width`. |
| Images | Explicit `width`/`height` on all `next/image`. |
| Canvas resize | Set dimensions on mount. Use `ResizeObserver`, update in single frame. |
| Dynamic results | Fixed-width result containers. Numbers update in-place. |
| Font swap | `font-display: swap` with matched fallback, or system fonts only. |

### INP (Interaction to Next Paint) — target < 200ms

| Threat | Mitigation |
|--------|------------|
| Slider recomputation | All math is O(1) — simple formulas. |
| Canvas redraw | Batch with `requestAnimationFrame`. |
| File processing | Web Worker for files >5MB. |
| Ad scripts | Async load. Defer initialization with `requestIdleCallback` if needed. |

### Performance budget

| Metric | Budget |
|--------|--------|
| First load JS (per route) | < 100KB gzipped |
| LCP | < 2.5s on 3G |
| CLS | < 0.1 |
| INP | < 200ms |
| Page weight (excl. ads) | < 500KB calculators, < 2MB canvas tools |

### Monitoring
- Lighthouse CI in GitHub Actions on key pages per PR. Fail build on regression.
- Manual spot-checks with Chrome DevTools before flipping tools to `live`.
- Vercel Analytics (if added) for real-user CWV data.

---

## 13. CI/CD & Deployment

### Pipeline (every push)

```
npm ci → npm audit --omit=dev → npm run lint → npm test → next build → Vercel deploy
```

| Stage | Blocks deploy? |
|-------|---------------|
| `npm ci` | Yes |
| `npm audit --omit=dev` | Yes |
| `npm run lint` | Yes |
| `npm test` | Yes |
| `next build` (includes tsc) | Yes |
| Vercel deploy | — |

### Environments

| Branch | Environment | URL |
|--------|-------------|-----|
| `main` | Production | Custom domain |
| Feature branches | Preview | `*.vercel.app` auto-generated |

### Release workflow for tools
1. Build tool on feature branch.
2. PR → preview deploy → test on preview URL.
3. Merge to `main` → deploys with `status: 'draft'`.
4. Test on production URL directly.
5. Flip `status: 'live'` in `lib/data/tools.ts` → commit → deploy.

---

## 14. Testing Strategy

### Unit tests (`lib/math/`)

Every calculation module gets thorough tests. Wrong math = useless tool.

| Module | Coverage |
|--------|----------|
| `fov.ts` | Migrated as-is (20 tests) |
| `dof.ts` | Near/far focus, total DoF, hyperfocal. Edge cases: infinity, macro, extreme apertures. |
| `exposure.ts` | EV calculation, stop conversions, reciprocal rule, ND filter math. |
| `diffraction.ts` | Diffraction-limited aperture for various pixel pitches. |
| `startrail.ts` | 500 rule, NPF rule, stacking time. |
| `color.ts` | Kelvin to RGB, color harmony generation. |
| `histogram.ts` | Pixel data to bins, clipping detection. |

Pattern: pure functions, expected values, no DOM/React.

### Component tests (`components/tools/`)

Testing Library + jsdom:
- Slider changes update displayed results.
- Preset buttons set correct values.
- URL query param round-trips.
- File drop triggers processing (EXIF, Histogram).
- Canvas renders without errors (mock context).

### Integration tests

- All sensor presets produce valid results in every calculator.
- All focal length presets produce valid results across tools.
- State serialization round-trips.
- Tool registry: every `TOOLS` entry has a corresponding page route.

### Not tested
- Visual canvas correctness (would need screenshot comparison).
- Ad rendering (third-party).
- Vercel deployment infrastructure.

---

## 15. Consistent Look & Feel

### Design tokens (CSS custom properties)

```css
/* Spacing */
--space-xs, --space-sm, --space-md, --space-lg, --space-xl

/* Typography */
--font-mono (numbers/values), --font-sans (labels/text)
--text-xs, --text-sm, --text-md, --text-lg

/* Colors */
--bg-primary, --bg-secondary, --bg-surface
--text-primary, --text-secondary, --text-muted
--accent, --accent-hover
--border, --border-subtle

/* Shadows & radii */
--radius-sm, --radius-md
--shadow-sm, --shadow-md
```

Dark/light themes via `[data-theme]` attribute, persisted to localStorage.

### Shared UI patterns

| Pattern | Description |
|---------|-------------|
| Tool page shell | Title + description + tool + "Share" button |
| Slider input | Label, value, range input, optional presets. Shared component. |
| Result card | Labeled value with unit. Monospace numbers, muted unit text. |
| Sensor select | Dropdown of sensor presets. Shared across FOV, DoF, Star Trail, etc. |
| Focal length input | Log-scale slider with snap. Already built — reused. |
| Data table | Striped rows, sticky header, sortable. Hyperfocal, EV Chart, Glossary. |
| File drop zone | Dashed border, "Drop image here or click to browse". EXIF + Histogram. |
| Canvas container | Responsive canvas with consistent border/background. |
| Ad slot | Fixed-dimension container. Prevents CLS. |

### Navigation
- **Top bar** on every page: site logo (links to `/`), tool switcher dropdown, theme toggle.
- **No sidebar ads** — sidebar is for tool controls only.
- **Footer**: links to all live tools, glossary, articles.

### Typography
- Numbers in results: monospace font.
- Units: muted color, displayed adjacent to number (not concatenated).
- Labels: sans-serif, sentence case.

---

## 16. Migration Plan (FOV Viewer → Hub)

The existing FOV Viewer code migrates into the new project:

| Current location | New location |
|-----------------|--------------|
| `src/App.tsx` (reducer) | `components/tools/fov-viewer/FovViewer.tsx` |
| `src/components/Canvas.tsx` | `components/tools/fov-viewer/Canvas.tsx` |
| `src/components/LensPanel.tsx` | `components/tools/fov-viewer/LensPanel.tsx` |
| `src/components/*.tsx` | `components/tools/fov-viewer/` or `components/shared/` |
| `src/utils/fov.ts` | `lib/math/fov.ts` |
| `src/utils/export.ts` | `lib/hooks/useExport.ts` or `lib/utils/export.ts` |
| `src/data/sensors.ts` | `lib/data/sensors.ts` |
| `src/data/focalLengths.ts` | `lib/data/focalLengths.ts` |
| `src/data/scenes.ts` | `lib/data/scenes.ts` |
| `src/hooks/useQuerySync.ts` | `lib/hooks/useQuerySync.ts` |
| `src/assets/*.jpg` | `public/images/scenes/` |
| `src/**/*.test.ts` | Co-located or `__tests__/` |
| SEO articles (git history) | `content/articles/` as MDX |
| `theme.css` + `App.css` | `app/globals.css` + CSS Modules per component |

The FOV Viewer becomes `/tools/fov-viewer` with `status: 'live'` from day one.

---

## 17. Future Expansion (Out of Scope for Phase 1)

Documented here for architectural awareness — these should not influence Phase 1 implementation beyond keeping the door open.

- **AI-powered tools** (photo critique, background removal, style transfer, shot list generator) — require API routes, auth, Stripe, usage metering.
- **User accounts** — gear tracker, saved calculations, shoot planner.
- **Community features** — lens reviews, photo challenges.
- **Domain change** — `fov-viewer.iser.io` will redirect to a broader domain.
