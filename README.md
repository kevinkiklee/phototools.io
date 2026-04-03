# PhotoTools

Free photography calculators, simulators, and references — no ads, no sign-up, runs entirely in the browser.

**[Live Demo](https://phototools.io/)**

## Tools

| Tool | Category | Description |
|------|----------|-------------|
| **FOV Simulator** | Visualizer | Compare field of view across focal lengths and sensor sizes |
| **Exposure Triangle Simulator** | Visualizer | See how aperture, shutter speed, and ISO interact |
| **Depth of Field Calculator** | Calculator | Calculate near focus, far focus, and total depth of field |
| **Hyperfocal Distance Table** | Reference | Quick-reference hyperfocal distances for any lens and aperture |
| **Shutter Speed Guide** | Calculator | Find the minimum safe shutter speed for sharp handheld shots |
| **ND Filter Calculator** | Calculator | Calculate exposure time with any ND filter |
| **Diffraction Limit Calculator** | Calculator | Find the sharpest aperture for your sensor |
| **Star Trail Calculator** | Calculator | Calculate max exposure for sharp stars or plan star trail shots |
| **White Balance Visualizer** | Visualizer | See how color temperature affects your photos |
| **Color Harmony Picker** | Visualizer | Build color palettes for photography shoots |
| **EV Chart** | Reference | Interactive exposure value reference chart |
| **Sensor Size Comparison** | Visualizer | Compare camera sensor sizes visually |
| **EXIF Viewer** | File Tool | View photo metadata without uploading — 100% client-side |
| **Histogram Explainer** | File Tool | Understand your photo's histogram with annotations |
| **Glossary** | Reference | Photography terms and definitions |

Each tool includes an educational Learn panel with beginner/advanced explanations, pro tips, and interactive challenges.

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript 6
- Vitest + Testing Library
- CSS Modules + custom properties
- Canvas API + WebGL2
- Vercel

## Development

```bash
npm install
npm run dev
```

Dev server runs at `http://localhost:3000`. All tools (live + draft) are visible in development.

## Tool Visibility

Tools have a `status` field (`live` or `draft`) in `lib/data/tools.ts`:
- **Development**: all tools are visible regardless of status
- **Production**: only `live` tools appear in the homepage, nav, and footer
- Draft tools are still accessible by direct URL in production (with a draft banner)

To publish a tool, change its status to `'live'`.

## Testing

```bash
npm test            # single run (170 tests)
npm run test:watch  # watch mode
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Deployment

Push to `main` triggers:
1. GitHub Actions CI (audit, lint, test, build)
2. Vercel auto-deploy to production

Live at [phototools.io](https://phototools.io/).

## License

MIT
