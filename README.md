# PhotoTools

Free photography calculators, simulators, and references. No sign-up required — your photos never leave your browser.

**[www.phototools.io](https://www.phototools.io)**

## Tools

### Visualizers

- **FOV Simulator** — Compare field of view across up to four lens and sensor combinations, overlaid on real-world scenes. Plan lens purchases and understand how focal length and sensor size affect what you capture.
- **Color Scheme Generator** — Build harmonious color palettes using complementary, analogous, triadic, split-complementary, and tetradic relationships. Pick colors from uploaded photos or the color wheel to plan wardrobe, props, and set design.
- **Exposure Triangle Simulator** — Interactively adjust aperture, shutter speed, and ISO to see real-time effects on exposure, depth of field blur, motion blur, and noise through a WebGL preview.
- **White Balance Visualizer** — See how color temperature (1000K–12000K) shifts the look of different scenes. Compare presets from Candle to Blue Sky, or upload your own photo to preview white balance changes.
- **Sensor Size Comparison** — Visually compare camera sensor sizes from medium format down to smartphone. Overlay, side-by-side, and pixel density modes with per-sensor resolution and popular camera model data.
- **Hyperfocal Distance Simulator** — Learn where to focus for maximum sharpness from foreground to infinity. Includes a depth of field diagram, interactive 3D scene, and a mini reference table for quick field use.
- **Perspective Compression Simulator** — See how focal length affects background compression and apparent distance between subjects. WebGL-rendered scene demonstrates the effect at different focal lengths.

### Calculators

- **Depth of Field Calculator** — Calculate near focus, far focus, hyperfocal distance, and total depth of field for any lens, aperture, and subject distance. Includes an interactive DoF diagram and 3D visualization.
- **Shutter Speed Guide** — Find the minimum safe shutter speed for sharp handheld shots based on focal length, crop factor, and image stabilization stops. Accounts for both camera shake and subject motion.
- **Star Trail Calculator** — Calculate maximum exposure for pinpoint stars using the 500 Rule or the more accurate NPF Rule. Plan star trail stacking sessions with frame count and total duration estimates.
- **ND Filter Calculator** — Calculate the resulting shutter speed after attaching any ND filter (1–10 stops). Includes a quick-reference table for common base speeds and popular filter strengths.
- **Diffraction Limit Calculator** — Find the sharpest aperture for your specific sensor and resolution. Shows pixel pitch, Airy disk diameter, and a per-aperture sharpness assessment.

### File Tools

- **EXIF Viewer** — View EXIF metadata and histogram for any photo. Extracts camera, lens, exposure settings, GPS coordinates, and software info. Includes a privacy warning when location data is detected. 100% client-side — nothing is uploaded.

### Reference

- **Glossary** — 50+ photography terms with clear definitions, linked to relevant tools for hands-on learning.

Each tool includes an educational **Learn panel** with beginner and deeper explanations, key factors, pro tips, and interactive challenges.

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript 6
- Vitest + Testing Library (212 tests across 18 files)
- CSS Modules + CSS custom properties (design tokens)
- Canvas API + WebGL2 + GLSL shaders
- Vercel (deployment)

## Development

```bash
npm install
npm run dev
```

Dev server runs at `http://localhost:3000`. All tools are visible in development regardless of status.

## Tool Visibility

Each tool has separate `dev` and `prod` status fields (`'live'` or `'draft'`) in `src/lib/data/tools.ts`:

- **Development**: tools with `dev: 'live'` are fully accessible
- **Production**: tools with `prod: 'live'` are fully accessible; draft tools appear disabled with a "Coming Soon" badge
- Draft tools are still reachable by direct URL in production (shown with a draft banner)

## Testing

```bash
npm test            # single run (212 tests)
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
    tools/[slug]/
      page.tsx            Route entry point
      _components/        Tool-specific UI components
  components/
    layout/               Nav (mega-menu), Footer, ThemeProvider
    shared/               Reusable components (ToolPageShell, LearnPanel, ToolIcon, etc.)
  lib/
    math/                 Pure calculation modules with co-located tests
    data/                 Tool registry, education content, sensors, glossary, etc.
public/                   Images, icons, manifest
```

## Deployment

Push to `main` triggers:
1. GitHub Actions CI (audit, lint, test, build)
2. Vercel auto-deploy to production

Live at [www.phototools.io](https://www.phototools.io).

## License

MIT
