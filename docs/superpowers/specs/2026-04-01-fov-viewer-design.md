# FOV Viewer — Design Spec

A GitHub Pages application that helps photographers visualize and compare field of view across different focal lengths and sensor sizes. Educational focus — designed for learners understanding how focal length and crop factor affect framing.

## Tech Stack

- **React 18 + TypeScript** via Vite
- Static output deployed to **GitHub Pages** (no server)
- No component library — custom CSS with CSS custom properties for theming
- Zero runtime dependencies beyond React

## Core Concept

Two "lenses" (A and B) are configured independently with focal length + sensor/crop factor. A sample image shows what each lens would see, in one of two modes:

1. **Overlay mode** — single image with two color-coded rectangles showing each lens's FOV
2. **Side-by-side mode** — the image shown twice, each cropped to what that lens sees

## Layout

### Desktop (≥1024px)
- **Left sidebar** (280px): Logo/theme toggles, Lens A card, Lens B card, Frame Ruler, Action buttons
- **Right canvas** (flex): Mode toggle centered top, image with overlays, scene strip at bottom

### Mobile (<1024px)
- Stacked: header → mode toggle → image canvas → scene strip → collapsible lens cards → action buttons
- Side-by-side mode stacks the two views vertically on mobile
- Lens cards collapsed by default (show slider + value), tap to expand presets/sensor/FOV

### Breakpoint
- Single breakpoint at 1024px switches sidebar ↔ stacked

## Sample Images

5 built-in images (no user upload), ordered:

1. **Landscape** (default) — mountains/lake, shows perspective compression
2. **Person in environment** — portrait compression and background separation
3. **Wildlife/bird** — why long telephoto matters
4. **City street** — street photography framing
5. **Milky way / night sky** — ultra-wide vs telephoto for astrophotography

Images sourced from Unsplash (free license), stored in `src/assets/`, optimized for web.

## Focal Length Presets

Labeled buttons + continuous slider (8mm–800mm):

| Value | Label |
|-------|-------|
| 8mm | Fisheye |
| 14mm | Ultra-wide |
| 20mm | — |
| 24mm | Wide |
| 35mm | — |
| 50mm | Normal |
| 85mm | Portrait |
| 135mm | — |
| 200mm | Tele |
| 400mm | Super-tele |
| 600mm | — |
| 800mm | — |

Slider is continuous (range 8–800mm, step 1mm) — presets are quick-jump buttons, not the only options.

## Sensor Presets

Named presets (no custom input):

| Name | Crop Factor |
|------|------------|
| Medium Format | 0.79× |
| Full Frame | 1.0× |
| APS-C (Nikon/Sony) | 1.5× |
| APS-C (Canon) | 1.6× |
| Micro Four Thirds | 2.0× |
| 1" Sensor | 2.7× |
| Smartphone | ~6.0× |

Displayed as a dropdown/select in each lens card.

## FOV Calculation

Standard rectilinear projection:

```
effectiveFocalLength = focalLength × cropFactor
horizontalFOV = 2 × atan(36 / (2 × effectiveFocalLength)) — in degrees
verticalFOV = 2 × atan(24 / (2 × effectiveFocalLength)) — in degrees
```

Baseline: 36mm × 24mm full-frame sensor dimensions.

Equivalent focal length displayed as: `≡ {focalLength × cropFactor}mm equiv`

## Overlay Rendering

### Overlay Mode
- The lens with the wider FOV fills the canvas
- The narrower lens is drawn as a proportionally smaller rectangle inside
- Rectangle colors: **Blue (#3b82f6)** for Lens A, **Amber (#f59e0b)** for Lens B
- Labels on rectangles show: lens name, focal length, sensor, FOV degrees

### Side-by-Side Mode
- Two views of the same image, each cropped to their lens's FOV
- Desktop: horizontal split
- Mobile: vertical stack
- Each view bordered in its lens color, labeled above

### Rendering Approach
- Use `<canvas>` element for the image + overlays
- Overlay rectangles are calculated as percentage of canvas based on FOV ratio
- For side-by-side: compute crop rect from FOV ratio, draw the relevant portion of the source image

## Features

### Copy Image to Clipboard
- Render current view (overlay or side-by-side) to an offscreen `<canvas>`
- `canvas.toBlob()` → `navigator.clipboard.write()` as PNG
- Toast notification "Copied!" on success
- Fallback: download as PNG if clipboard API unavailable

### Shareable Link (Query Params)
- URL encodes all state: `?a=35&sa=ff&b=85&sb=apsc_n&img=0&mode=overlay&d=10&theme=dark`
- Param key mapping:
  - `a` / `b` — focal lengths (number)
  - `sa` / `sb` — sensor codes: `mf`, `ff`, `apsc_n`, `apsc_c`, `m43`, `1in`, `phone`
  - `img` — image index (0-4)
  - `mode` — `overlay` or `side`
  - `d` — distance in meters for frame ruler
  - `theme` — `dark` or `light`
- URL updated silently via `history.replaceState()` on every state change
- "Copy link" button copies current URL to clipboard with toast

### FOV Angle Display
- Shown in each lens card: `63.4° × 44.2°`
- Also labeled directly on overlay rectangles

### Equivalent Focal Length
- Shown in lens card header: `≡ 52.5mm equiv` (when using non-FF sensor)

### Animated Transitions
- Overlay rectangles animate size changes: CSS transition ~300ms ease-out
- Side-by-side crop animates zoom smoothly
- No animation during slider drag (real-time update), animation only on preset click or keyboard nudge

### Keyboard Shortcuts
- `Tab` — switch active lens (A ↔ B)
- `[` / `]` — nudge focal length down/up (to nearest preset)
- `S` — toggle overlay / side-by-side
- `T` — toggle theme
- `?` — show/hide shortcut cheat sheet overlay
- Active lens indicated with a subtle glow on its card

### Dark/Light Theme
- Dark theme default
- Toggle in header
- Persisted to `localStorage`
- Also readable from `theme` query param (for shared links)
- Implemented via CSS custom properties on `:root`

### Frame Width Ruler
- User sets a distance (slider, default 10m)
- Shows how wide the frame is at that distance for each lens
- Formula: `frameWidth = 2 × distance × tan(horizontalFOV / 2)`
- Displayed as: `Lens A: 12.3m wide` / `Lens B: 4.2m wide`

## Project Structure

```
fov-viewer/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── components/
│   │   ├── Canvas.tsx              # Image + overlay/side-by-side rendering
│   │   ├── LensPanel.tsx           # Single lens control card (focal length, sensor, FOV)
│   │   ├── Sidebar.tsx             # Desktop sidebar wrapper
│   │   ├── SceneStrip.tsx          # Image selector thumbnails
│   │   ├── FrameRuler.tsx          # Distance → frame width tool
│   │   ├── ActionBar.tsx           # Copy image / Copy link buttons
│   │   ├── ModeToggle.tsx          # Overlay / Side-by-side toggle
│   │   ├── ThemeToggle.tsx         # Dark/light toggle
│   │   ├── ShortcutOverlay.tsx     # Keyboard shortcut cheat sheet
│   │   └── Toast.tsx               # Brief notification popup
│   ├── hooks/
│   │   ├── useQuerySync.ts         # Bidirectional sync: state ↔ URL query params
│   │   └── useKeyboardShortcuts.ts # Global keyboard shortcut handler
│   ├── utils/
│   │   ├── fov.ts                  # FOV math: angles, frame width, equivalents
│   │   └── export.ts               # Canvas → clipboard/PNG export
│   ├── data/
│   │   ├── sensors.ts              # Sensor presets array
│   │   └── focalLengths.ts         # Focal length presets + labels
│   └── assets/
│       ├── landscape.jpg
│       ├── person.jpg
│       ├── wildlife.jpg
│       ├── city.jpg
│       └── milkyway.jpg
├── public/
│   └── 404.html                    # GitHub Pages SPA redirect
└── .github/
    └── workflows/
        └── deploy.yml              # GitHub Actions → GitHub Pages
```

## Deployment

- Vite build outputs static files to `dist/`
- GitHub Actions workflow: on push to `main`, build and deploy to GitHub Pages
- `vite.config.ts` sets `base` to repo name for correct asset paths

## Color Palette

### Dark Theme
- Background: `#0f0f14`
- Surface: `#1a1a24`
- Border: `#2a2a35`
- Text primary: `#e0e0e0`
- Text secondary: `#888`
- Accent: `#6366f1` (indigo)
- Lens A: `#3b82f6` (blue)
- Lens B: `#f59e0b` (amber)

### Light Theme
- Background: `#f8f9fa`
- Surface: `#ffffff`
- Border: `#e2e4e8`
- Text primary: `#1a1a2e`
- Text secondary: `#6b7280`
- Accent, Lens A, Lens B: same as dark
