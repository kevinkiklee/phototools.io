# PhotoTools

Free photography calculators, simulators, and references. No sign-up required — your photos never leave your browser.

**[www.phototools.io](https://www.phototools.io)**

## Tools

### Live in Production

- **FOV Simulator** — Compare field of view across up to four lens and sensor combinations, overlaid on real-world scenes. Plan lens purchases and understand how focal length and sensor size affect what you capture.
- **Color Scheme Generator** — Build harmonious color palettes using complementary, analogous, triadic, split-complementary, and tetradic relationships. Pick colors from uploaded photos or the color wheel to plan wardrobe, props, and set design.
- **Star Trail Calculator** — Calculate maximum exposure for pinpoint stars using the 500 Rule or the more accurate NPF Rule. Plan star trail stacking sessions with frame count and total duration estimates. Animated canvas preview with sky gradient, star glow, and terrain.
- **White Balance Visualizer** — See how color temperature (1000K–12000K) shifts the look of different scenes. Compare presets from Candle to Blue Sky, or upload your own photo to preview white balance changes via WebGL.
- **Sensor Size Comparison** — Visually compare camera sensor sizes from medium format down to smartphone. Overlay, side-by-side, and pixel density modes with per-sensor resolution and popular camera model data.
- **EXIF Viewer** — View EXIF metadata and histogram for any photo. Extracts camera, lens, exposure settings, GPS coordinates, and software info. Includes a privacy warning when location data is detected. 100% client-side — nothing is uploaded.

### In Development

- **Exposure Triangle Simulator** — Interactively adjust aperture, shutter speed, and ISO to see real-time effects on exposure, depth of field blur, motion blur, and noise through a WebGL preview.
- **Depth of Field Calculator** — Calculate near focus, far focus, hyperfocal distance, and total depth of field for any lens, aperture, and subject distance. Includes an interactive DoF diagram.
- **Hyperfocal Distance Simulator** — Learn where to focus for maximum sharpness from foreground to infinity. Includes a depth of field diagram and a mini reference table for quick field use.
- **Shutter Speed Visualizer** — Find the minimum safe shutter speed for sharp handheld shots based on focal length, crop factor, and image stabilization stops.
- **Perspective Compression Simulator** — See how focal length affects background compression and apparent distance between subjects.
- **ND Filter Calculator** — Calculate the resulting shutter speed after attaching any ND filter (1–10 stops).

### Reference

- **Glossary** — 50+ photography terms with clear definitions, linked to relevant tools for hands-on learning.

Each tool includes an educational **Learn panel** with beginner and deeper explanations, key factors, pro tips, and interactive challenges with try-again and reset functionality.

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript 6
- Vitest + Testing Library (235 tests across 18 files)
- CSS Modules + CSS custom properties (design tokens)
- Canvas API + WebGL2 + GLSL shaders
- Vercel (deployment)

## Development

```bash
npm install
npm run dev
```

Dev server runs at `http://localhost:3000`. All tools are visible in development regardless of production status.

## Tool Visibility

Each tool in `src/lib/data/tools.ts` has separate `dev` and `prod` status fields with three states:

- **`live`** — fully accessible, appears in nav, homepage, and footer
- **`draft`** — appears in nav/homepage as "Coming Soon" (disabled); still reachable by direct URL with a draft banner
- **`disabled`** — hidden from all menus, not shown anywhere in production

Helper functions: `getLiveTools()` (live only), `getVisibleTools()` (live + draft), `getAllTools()` (everything).

## Testing

```bash
npm test            # single run (235 tests)
npm run test:watch  # watch mode
```

## Build & Lint

```bash
npm run build
npm run lint
```

## Project Structure

```
src/
  app/                    Routes (homepage, tools, learn/glossary)
    [slug]/               Each tool at top-level URL (e.g. /fov-simulator)
      page.tsx            Route entry point
      _components/        Tool-specific UI components (co-located)
  components/
    layout/               Nav (mega-menu), Footer, ThemeProvider, ThemeToggle
    shared/               Reusable components (ToolPageShell, LearnPanel, ControlPanel, ToolIcon, etc.)
  lib/
    math/                 Pure calculation modules with co-located tests
    data/                 Tool registry, education content, sensors, glossary, etc.
    data/education/       Per-tool educational content, challenge definitions, types
    utils/                Query sync, export helpers
    types.ts              Shared TypeScript types
public/                   Images, icons, manifest, sitemap, robots.txt
```

## Deployment

Push to `main` triggers:
1. GitHub Actions CI (audit, lint, test, build)
2. Vercel auto-deploy to production

Live at [www.phototools.io](https://www.phototools.io).

## License

MIT
