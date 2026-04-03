# Exposure Triangle Simulator — Image Preview Enhancement

**Date:** 2026-04-03
**Status:** Approved

## Overview

Enhance the Exposure Triangle Simulator with a real-time WebGL image preview that visually demonstrates the effect of aperture, shutter speed, and ISO changes. Users see an actual photograph update in real-time as they adjust sliders, making the exposure triangle tangible and educational.

## Architecture

WebGL shader pipeline running entirely on the frontend. A `<canvas>` element renders the selected scene photo through a multi-pass GLSL shader that simulates three photographic effects based on slider state:

- **Pass 1 — Depth of Field:** Gaussian blur weighted by a per-image depth map. Aperture controls blur radius (wide aperture = shallow DOF = strong background blur, narrow = everything sharp).
- **Pass 2 — Motion Blur:** Directional blur weighted by a per-image motion mask. Shutter speed controls blur intensity (slow shutter = heavy blur on moving regions, fast = frozen).
- **Pass 3 — Noise:** Procedural film grain generated in the shader, scaled by ISO value (low ISO = clean, high ISO = heavy grain with color noise).

Each scene ships as 3 assets: the base photo, a grayscale depth map, and a grayscale motion mask. All loaded as WebGL textures.

## Scenes

Four selectable scenes, displayed as a scene strip (thumbnail row matching FOV Viewer's pattern):

| Scene | Subject | DOF Demo | Motion Demo |
|-------|---------|----------|-------------|
| **Street** (default) | Person walking on sidewalk, buildings behind | Subject vs background separation | Walking figure blurs |
| **Landscape** | Mountains with foreground rocks/flowers | Near-far depth range | Flowing stream/clouds |
| **Portrait** | Close-up subject, bokeh-friendly background | Creamy background blur | Subtle hair/fabric motion |
| **Low Light** | Night street with neon/streetlights | Light sources bokeh | Car headlight trails |

Images sourced from Unsplash (royalty-free), resized to ~1200x800 for fast loading. Depth maps and motion masks created as companion grayscale PNGs.

## Layout

Matches the FOV Viewer's sidebar + canvas pattern:

```
┌─────────────────────────────────────────────────────┐
│  Scene Strip (thumbnails)          [Rotate] [Reset] │  ← top bar
├──────────────┬──────────────────────────────────────┤
│  Controls    │                                      │
│  ───────     │                                      │
│  Lock: [A][S]│[I]                                   │
│              │      WebGL Canvas                    │
│  Aperture    │      (image preview with             │
│  ──●──────── │       real-time effects)             │
│  Shutter     │                                      │
│  ────●────── │                                      │
│  ISO         │                                      │
│  ●────────── │                                      │
│              │                                      │
│  ┌─────────┐ │                                      │
│  │ EV: 11.9│ │                                      │
│  └─────────┘ │                                      │
│  DOF  ███░░  │                                      │
│  Motion █░░  │                                      │
│  Noise  ░░░  │                                      │
└──────────────┴──────────────────────────────────────┘
```

- **Left sidebar** (280px fixed): Lock toggles, 3 sliders, EV result card, effect bars — all using FOV Viewer's panel styling (`var(--bg-surface)`, 14px padding, 10px border-radius)
- **Top bar**: Scene strip with 48x32 thumbnails (same as FOV Viewer's scene selector)
- **Canvas area** (`flex: 1`): WebGL canvas centered with 24px padding, `border-radius: 8px`
- **Mobile** (<1024px): Sidebar collapses, controls move below canvas

### FOV Viewer Style Matching

The UI must match the FOV Viewer's visual language:

- **Sidebar**: 280px fixed width, `var(--bg-surface)` background, 16px padding, `overflow-y: auto`
- **Panels**: `var(--bg-surface)` background, 14px padding, 10px border-radius
- **Sliders**: Full width, 6px height, `accent-color: var(--accent)`
- **Labels**: 12px font-size, `var(--text-secondary)` color
- **Scene strip**: 48x32 thumbnails, 2px border (transparent default, `var(--accent)` active), 4px border-radius, 0.6 opacity default / 1.0 on hover/active
- **Canvas area**: `flex: 1`, centered content, 24px padding, `min-height: 0; min-width: 0`
- **Canvas element**: `max-width: 100%; max-height: 100%`, 8px border-radius
- **Top bar**: `display: flex; align-items: center`, 10px 16px padding, bottom border
- **Design tokens**: `--border`, `--bg-surface`, `--bg-primary`, `--text-primary`, `--text-secondary`, `--accent`

## WebGL Shader Details

### Depth of Field (dof.frag)

- Samples the depth map (0=near, 1=far) at each pixel
- Computes circle-of-confusion radius from `aperture` and `focusDistance` (fixed at subject depth ~0.3)
- CoC formula: `coc = abs(depth - focusDistance) * apertureScale` where `apertureScale` maps f/1.4→large to f/22→zero
- Applies variable-radius Gaussian blur — pixels far from focus plane get more blur
- Uses separable blur (horizontal + vertical passes) for performance
- Max blur radius capped at ~20px for performance

### Motion Blur (motion.frag)

- Samples the motion mask (white = moving, black = static)
- Applies directional blur along a horizontal motion vector (walking/cars)
- Blur kernel size: `kernelSize = motionMask * maxBlur / shutterSpeed`
- Longer exposure (slower shutter) = more blur on masked regions
- Static regions (mask=0) remain sharp regardless of shutter speed
- Kernel samples: 16 taps along the motion direction

### Noise (noise.frag)

- Procedural noise using `fract(sin(dot(...)))` pattern with per-frame seed
- Luminance noise + chrominance noise (realistic sensor behavior)
- Noise amplitude: `amplitude = noiseBase * log2(ISO / 100)` — zero at ISO 100, increasing logarithmically
- Shadow-weighted: slightly more noise in darker regions (multiply by `1.0 - luminance * 0.3`)
- At ISO 100: clean image. At ISO 25600: heavy visible grain with color fringing.

### Render Pipeline

1. Load base photo, depth map, and motion mask as WebGL textures
2. Render base photo to framebuffer A
3. DOF horizontal blur pass: framebuffer A → framebuffer B (using depth map)
4. DOF vertical blur pass: framebuffer B → framebuffer A (using depth map)
5. Motion blur pass: framebuffer A → framebuffer B (using motion mask)
6. Noise pass: framebuffer B → screen (procedural noise overlay)

Re-render on every slider change. Use `requestAnimationFrame` only when parameters change (not continuous loop).

## Component Structure

```
components/tools/exposure-simulator/
├── ExposureSimulator.tsx          (existing — refactored layout to sidebar+canvas)
├── ExposureSimulator.module.css   (existing — rewritten for FOV-Viewer-style layout)
├── ExposurePreview.tsx            (new — WebGL canvas + scene selector)
├── ExposurePreview.module.css     (new — canvas area styles)
├── shaders/
│   ├── dof.frag.ts                (DOF fragment shader as exported string)
│   ├── motion.frag.ts             (motion blur fragment shader as exported string)
│   ├── noise.frag.ts              (noise/grain fragment shader as exported string)
│   └── passthrough.vert.ts        (shared vertex shader as exported string)
└── useExposureRenderer.ts         (new — WebGL setup, texture loading, render loop)
```

### ExposureSimulator.tsx (refactored)

- Layout changes from 2-column grid to FOV-Viewer-style flex layout (sidebar + canvas area)
- Controls (lock toggles, sliders, EV card, effect bars) move into the sidebar
- Scene strip and canvas area rendered via `ExposurePreview`
- All existing state management and exposure math unchanged
- Passes `aperture`, `shutterSpeed`, `iso` as props to `ExposurePreview`

### ExposurePreview.tsx (new)

- Manages scene selection state (which of the 4 scenes is active)
- Renders the scene strip (thumbnail bar) and the WebGL `<canvas>`
- Calls `useExposureRenderer` hook with current scene + exposure parameters
- Handles canvas resize on window resize

### useExposureRenderer.ts (new)

- Custom hook: `useExposureRenderer(canvasRef, scene, aperture, shutterSpeed, iso)`
- Initializes WebGL2 context on mount
- Compiles and links shader programs (DOF, motion, noise, passthrough vertex)
- Loads textures for current scene (photo, depth map, motion mask) — caches loaded textures
- Creates framebuffers for multi-pass rendering
- Runs render pipeline on parameter change via `useEffect`
- Cleans up WebGL resources on unmount
- Returns `{ isLoading, error }` for UI feedback

### Shader files as TypeScript

GLSL shaders stored as exported template literal strings in `.ts` files (not raw `.glsl` files) to avoid build configuration for raw imports:

```typescript
// shaders/dof.frag.ts
export const dofFragmentShader = `
  precision highp float;
  // ... GLSL code
`;
```

## Image Assets

```
public/images/exposure-simulator/
├── street.jpg           (~1200x800, ~150KB)
├── street-depth.png     (~1200x800, grayscale, ~80KB)
├── street-motion.png    (~1200x800, grayscale, ~40KB)
├── landscape.jpg
├── landscape-depth.png
├── landscape-motion.png
├── portrait.jpg
├── portrait-depth.png
├── portrait-motion.png
├── lowlight.jpg
├── lowlight-depth.png
└── lowlight-motion.png
```

12 assets total. Depth maps are grayscale PNGs where white=near, black=far. Motion masks are grayscale PNGs where white=moving, black=static. All same dimensions as their corresponding photo.

## Testing

- **Shader math unit tests**: Extract pure functions for CoC calculation, blur kernel sizing, noise amplitude mapping into `lib/math/exposure.ts`. Test these independently.
- **Component tests**: Verify scene switching updates textures, slider changes trigger re-render, WebGL context cleanup on unmount.
- **Fallback**: If WebGL2 is unavailable, show the base photo as a static `<img>` with a message: "Your browser doesn't support WebGL2. Image effects preview is unavailable."

## Mobile Behavior

- Below 1024px: sidebar collapses, controls move below the canvas (matching FOV Viewer's mobile pattern)
- Scene strip moves to a mobile toolbar area
- Canvas fills full width
- Touch-friendly: all sliders have 44px touch targets (existing behavior preserved)
