# FOV Simulator Educational Upgrades — Design Spec

**Date:** 2026-04-02
**Scope:** Add educational overlays, lens distortion simulation, perspective compression visualization, and crop comparison to the FOV Simulator. All features live inside the existing tool; split into separate tools later if complexity warrants it.

---

## 1. Overview

Four feature groups enhance the FOV Simulator from a pure FOV rectangle comparison tool into a comprehensive focal length education tool:

1. **Educational Overlays** (Canvas 2D) — frame width info, "what fits in frame" markers, enhanced equiv focal length display, crop comparison strip
2. **Lens Distortion** (WebGL) — barrel/pincushion distortion applied to scene images with grid overlay
3. **Perspective Compression** (WebGL 3D) — interactive 3D pillars scene + geometric diagram
4. **Crop Comparison Strip** (Canvas 2D) — side-by-side thumbnails of what each lens captures

---

## 2. Educational Overlays (Canvas 2D)

### 2.1 Frame Info Panel

New sidebar panel below the lens panels, above the action bar.

**Distance slider:**
- Range: 3ft–100ft, logarithmic scale (same pattern as focal length slider)
- Presets: 5ft, 10ft, 25ft, 50ft buttons
- Default: 10ft
- Persisted in URL as `dist` param (integer, feet)

**Frame width readout:**
- For each active lens, display: `A 24mm: 14.0ft wide` (horizontal frame width at the selected distance)
- Uses existing `calcFrameWidth(horizontalFOV, distance)` from `lib/math/fov.ts`
- Color-coded to match lens colors (blue/amber/green)

### 2.2 "What Fits in Frame" Markers

Drawn on the canvas as subtle horizontal reference indicators along the left edge of each FOV rect.

**Subject references (approximate heights):**
- Full body: 5.5ft (168cm)
- Waist-up: 3.0ft (91cm)
- Head & shoulders: 1.5ft (46cm)
- Tight headshot: 0.8ft (24cm)

**Logic:**
- Calculate vertical frame height at the selected distance using `calcFrameWidth(verticalFOV, distance)`
- For each subject reference, if the subject height fits within the vertical frame height, show the marker
- Markers appear as semi-transparent labels on the left interior edge of the active lens's FOV rect
- Small horizontal tick line + text label (e.g., "— full body")

**Toggle:** Checkbox in the Frame Info panel: "Show framing guides". Default off — keeps the UI clean until the user wants it.

### 2.3 Enhanced Equivalent Focal Length

When a lens uses a crop sensor (not full frame), the canvas label changes from:
- Current: `A — 50mm`
- New: `A — 50mm (75mm eq)`

The LensPanel already shows equiv focal length; this makes it visible on the canvas too.

### 2.4 Crop Comparison Strip

Collapsible strip below the canvas area, above the footer.

**Layout:**
- Height: ~60px when expanded, 0 when collapsed
- One thumbnail per active lens, side by side
- Each thumbnail crops the scene image to show exactly what that lens captures (based on FOV ratio)
- Aspect ratio matches canvas orientation (3:2 or 2:3)
- Color-coded border matching lens color
- Label: "A — 24mm" overlay at bottom-left

**Toggle:** Small expand/collapse chevron. Default expanded on desktop, collapsed on mobile.

**Interaction:** Clicking a thumbnail sets that lens as active.

---

## 3. Lens Distortion (WebGL)

### 3.1 View Mode Toggle

New sidebar panel: three-segment toggle button.
- **FOV** (default) — existing behavior, Canvas 2D overlays
- **Distortion** — WebGL shader warps the scene image
- **Compression** — WebGL 3D pillars scene

Only one mode active at a time. Switching modes swaps the canvas rendering pipeline.

### 3.2 Distortion Rendering

When Distortion mode is active:
- The scene image is rendered via a WebGL2 fragment shader
- The shader applies a radial distortion model based on the active lens's focal length
- Barrel distortion for wide angles (< ~35mm), pincushion for telephoto (> ~70mm), minimal distortion in the normal range

**Distortion model (Brown-Conrady simplified):**
```
k1 coefficient derived from focal length:
  k1 = -0.4 * (1 - focalLength/50)  // negative = barrel, positive = pincushion
  Clamped to [-0.5, 0.3] range

For each fragment:
  r = distance from center (normalized 0-1)
  r_distorted = r * (1 + k1 * r^2)
  Sample texture at distorted coordinates
```

This is a simplified educational model, not physically accurate — the goal is to show the concept clearly.

**Grid overlay:**
- When "Show grid" checkbox is on, draw a rectilinear grid (white, semi-transparent) over the distorted image
- Grid: 10x10 evenly spaced lines, also distorted by the same shader
- The grid makes distortion patterns immediately visible

**Multi-lens display:**
- Only the active lens's distortion is shown (not all lenses simultaneously)
- Switching active lens updates the distortion in real-time
- FOV overlay rectangles are hidden in Distortion mode (they'd be confusing)

### 3.3 WebGL Setup

- Single `<canvas>` element with WebGL2 context, replacing the 2D canvas when in Distortion or Compression mode
- Fallback: if WebGL2 not available, show a message "WebGL2 required for distortion preview" and keep FOV mode
- Scene images loaded as WebGL textures (same JPEG assets)
- Shader program compiled once, uniforms updated on focal length / grid toggle changes

---

## 4. Perspective Compression (WebGL 3D)

### 4.1 3D Pillars Scene

A special scene accessible from the scene strip (added as a 6th thumbnail with a "3D" icon/label).

**Scene contents:**
- Ground plane (subtle grid texture, extends to horizon)
- 5 vertical cylindrical posts/pillars, evenly spaced at 5ft intervals (at 5ft, 10ft, 15ft, 20ft, 25ft from camera)
- Each pillar is the same height and diameter
- Simple lighting (directional + ambient) for depth cues
- Sky gradient background

**Camera behavior:**
- Camera focal length matches the active lens's focal length
- Camera distance auto-adjusts so the nearest pillar stays the same apparent size regardless of focal length
- This is the key educational insight: same subject size, different background compression

**Rendering:**
- WebGL2, simple vertex + fragment shaders
- No complex materials — flat colored pillars with basic shading
- 60fps target, lightweight geometry

### 4.2 Geometric Diagram

When the 3D pillars scene is selected, a diagram appears below the 3D canvas (in place of the crop comparison strip).

**Diagram contents (Canvas 2D):**
- Top-down view showing: camera position (triangle icon), 5 pillars (circles), sight lines from camera through pillars
- Camera position moves left/right as focal length changes (matching the 3D view's camera distance)
- Sight line angles narrow with longer focal lengths — visually shows why compression occurs
- Labels: focal length, camera distance, "narrow angle = compressed background"

**Layout:** ~80px tall strip, same position as the crop comparison strip. Only visible when 3D scene is active.

### 4.3 Interaction with Distance Slider

The Frame Info panel's distance slider serves double duty:
- In photo scenes: controls the "what fits in frame" calculations
- In 3D scene: controls the distance to the reference (nearest) pillar, which affects how dramatic the compression effect is

---

## 5. State & URL Persistence

New URL params:
- `dist` — distance in feet (integer, default 10)
- `mode` — view mode: `fov` (default), `dist` (distortion), `comp` (compression)
- `grid` — grid overlay: `1` or omitted (default off)
- `guides` — framing guides: `1` or omitted (default off)

These extend the existing `a`, `b`, `c`, `sa`, `sb`, `sc`, `img` params.

---

## 6. File Structure

New files:
```
components/tools/fov-simulator/
  FrameInfoPanel.tsx          — distance slider + frame width readout
  FrameInfoPanel.module.css
  CropStrip.tsx               — crop comparison thumbnails
  CropStrip.module.css
  DistortionCanvas.tsx        — WebGL distortion rendering
  DistortionCanvas.module.css
  CompressionScene.tsx        — WebGL 3D pillars + diagram
  CompressionScene.module.css
  ViewModeToggle.tsx          — FOV/Distortion/Compression toggle
  shaders/
    distortion.vert           — passthrough vertex shader
    distortion.frag           — barrel/pincushion fragment shader
lib/math/
  distortion.ts               — distortion coefficient calculation
  distortion.test.ts
  compression.ts              — camera distance for constant subject size
  compression.test.ts
```

Modified files:
```
components/tools/fov-simulator/
  FovSimulator.tsx            — add view mode state, wire new panels
  FovSimulator.module.css     — crop strip, diagram area styles
  Sidebar.tsx                 — render FrameInfoPanel + ViewModeToggle
  Canvas.tsx                  — add framing guides, equiv label enhancement
  types.ts                    — add distance, viewMode, grid, guides to state
  querySync.ts                — persist new params
lib/data/scenes.ts            — add 3D compression "scene" entry
```

---

## 7. Mobile Considerations

- Frame Info panel renders in the mobile controls section (below canvas, same as lens panels)
- View Mode toggle renders in the mobile toolbar
- Crop strip defaults to collapsed on mobile
- 3D compression scene works on mobile (WebGL2 supported on modern mobile browsers) but may use simplified geometry (fewer pillars) for performance
- Framing guides hidden on mobile by default (too small to read)

---

## 8. Performance

- WebGL context created lazily — only when user switches to Distortion or Compression mode
- Scene textures shared between 2D canvas and WebGL (loaded once)
- 3D compression scene uses <100 triangles total — no performance concern
- Distortion shader is a single fullscreen quad — trivial GPU cost
- All calculations in `lib/math/` are pure functions, no allocations in render loops

---

## 9. Accessibility

- View Mode toggle uses `role="radiogroup"` with `aria-label`
- Distance slider uses standard `<input type="range">` with `aria-label` and `aria-valuetext` ("10 feet")
- Grid toggle is a standard checkbox with label
- Framing guides toggle is a standard checkbox with label
- 3D scene has `aria-label` describing what's shown ("Perspective compression demonstration with 5 pillars")
- All new text meets WCAG AA contrast (same tokens as existing UI)
