# CLAUDE.md

## Project Overview

PhotoTools is an educational photography application — free calculators, simulators, and references plus a glossary. Built as a Next.js 16 App Router hub with a tool registry system. Deployed to Vercel at `www.phototools.io`.

**Business model**: SEO-driven traffic + advertisement revenue. All decisions should consider SEO impact (shareable URLs, metadata, semantic HTML, page titles) and ad placement compatibility (clean layout with predictable content regions, no layout shift).

## Tech Stack

- Next.js 16 (App Router, Turbopack dev)
- React 19 + TypeScript 6
- Vitest + jsdom + @testing-library/react + @testing-library/jest-dom
- ESLint with typescript-eslint
- CSS Modules + CSS custom properties (design tokens)
- Canvas API for image rendering (FOV Simulator overlays)
- WebGL2 + GLSL shaders (Exposure Simulator image preview, White Balance Visualizer)
- Vercel (deployment)

## Commands

- `npm run dev` — start dev server with Turbopack at `http://localhost:3000`
- `npm run build` — production build via `next build`
- `npm run start` — serve production build locally
- `npm test` — run Vitest tests (212 tests across 18 files)
- `npm run test:watch` — run tests in watch mode
- `npm run lint` — run ESLint

## Architecture

All source code lives under `src/`, with `@/` aliased to `src/` in tsconfig.json and vitest.config.ts.

- **App Router**: all routes under `src/app/`. Homepage (`src/app/page.tsx`) is the tool hub. Each tool lives at `src/app/tools/[slug]/page.tsx` with co-located `_components/` for tool-specific UI. Glossary at `src/app/learn/glossary/page.tsx`.
- **Tool Co-location**: Each tool's components live in `src/app/tools/[slug]/_components/` alongside its `page.tsx`. The `_` prefix makes it a private folder (not a route segment). Page files import from `./_components/...` using relative paths.
- **Shared Components**: `src/components/` contains only shared/reusable code: `layout/` (Nav, Footer, ThemeProvider, ThemeToggle) and `shared/` (ToolPageShell, LearnPanel, ToolIcon, InfoTooltip, ShareModal, ToolActions, FileDropZone, PhotoUploadPanel, ScenePicker, CopyImageButton, DraftBanner, Toast, Breadcrumbs, JsonLd, DoFDiagram, DoFCanvas, Calculator.module.css).
- **Tool Registry**: `src/lib/data/tools.ts` defines all tools with slug, name, description, `dev`/`prod` status fields (`'live'`/`'draft'`), and category. `getLiveTools()` filters by the appropriate status per environment. `getToolBySlug()` looks up by slug. `getAllTools()` returns all tools regardless of status.
- **Education System**: `src/lib/data/education/` contains per-tool educational content (beginner/deeper explanations, key factors, pro tips, tooltips, challenges). `LearnPanel` renders as a right sidebar on every tool page.
- **Pure Math Modules**: `src/lib/math/` contains pure functions for FOV, DOF, exposure (including shader math for CoC, motion blur, noise), diffraction, star trails, color, and histogram calculations. Each has co-located `.test.ts` files. TDD approach — math is tested independently from UI.
- **Data**: `src/lib/data/` contains tool registry, education content, sensors (with dimensions/colors), focal lengths, scenes, glossary, camera settings (apertures/shutter speeds/ISOs), ND filters, and white balance presets — each with tests.

## Key Directories

```
src/
  app/                    Routes (homepage, tools, learn/glossary)
    tools/[slug]/
      page.tsx            Route entry point
      _components/        Tool-specific UI components (co-located)
  components/
    layout/               Nav (mega-menu), Footer, ThemeProvider, ThemeToggle
    shared/               ToolPageShell, LearnPanel, ToolIcon, InfoTooltip, ShareModal, ToolActions, etc.
  lib/
    math/                 Pure calculation modules (fov, dof, exposure, etc.)
    data/                 Tool registry, education content, sensors, focal lengths, scenes, glossary, camera, ndFilters, whiteBalance
    data/education/       Per-tool educational content, challenge definitions, types
    utils/                Export helpers
    types.ts              Shared TypeScript types
public/                   Images, icons, manifest, sitemap, robots.txt
```

## Tool Visibility

Each tool in `lib/data/tools.ts` has separate `dev` and `prod` status fields (`'live'` or `'draft'`). This allows independent control of visibility per environment.

- **Development** (`npm run dev`): tools with `dev: 'live'` appear in the homepage, nav mega-menu, and footer.
- **Production** (`npm run build`): tools with `prod: 'live'` appear.
- Draft tools are still accessible by direct URL (shown with a draft banner).
- To publish a tool, set its `prod` status to `'live'` in `lib/data/tools.ts`.

## Educational Layer

Each tool has a **LearnPanel** (right sidebar) with:
- **Beginner explanation** — 2-3 sentence intro for newcomers
- **Deeper explanation** — physics/optics/math behind the concept (plain string or array of `{ heading, text }` sections)
- **Key factors** — what controls the effect
- **Pro tips** — practical real-world advice (amber callout)
- **Challenges** — 3-5 progressive multiple-choice questions with pass/fail feedback, persisted to localStorage
- **Tooltips** — hover info icons on control labels (via `InfoTooltip` component)

Content is defined as structured data in `src/lib/data/education/content.ts` and `content2.ts`. To add education content for a new tool, add a `ToolEducation` entry matching the tool's slug.

## Design

- **No page scroll.** The application must fit within the viewport (100vh). The page never scrolls — only individual panels (controls, canvas, LearnPanel) scroll internally via `overflow-y: auto`. This is a hard constraint for all tool pages and the homepage.
- **FOV Simulator is the reference implementation.** All tools should match its look and feel: dark surface panels, compact controls, same spacing/typography tokens, and consistent use of `var(--accent)` for interactive elements.
- **Three-column layout**: ToolPageShell renders tool content (left/center) + LearnPanel (right sidebar, collapsible). Full-height tools (FOV Simulator, Color Harmony, Exposure Simulator, Sensor Size Comparison) manage their own layout but include LearnPanel directly.
- **Tool icons**: Each tool has an inline SVG icon (`components/shared/ToolIcon.tsx`) displayed on homepage cards, nav mega-menu items, and tool page headers. Icons are mapped by slug.
- **Nav mega-menu**: Tools dropdown groups tools by category (Visualizers, Calculators, Reference, File Tools) with icon + name + description per item.

## Security Headers

`next.config.ts` defines CSP, HSTS, and other security headers. `unsafe-eval` is included in CSP `script-src` only in development (React requires it for dev tooling). Never add `unsafe-eval` in production.

## Share & Embed

`components/shared/ShareModal.tsx` generates share/embed links with current query parameters via `window.location.search`. The FOV Simulator has its own ShareModal (`fov-simulator/_components/ShareModal.tsx`) using `stateToQueryString()`.

## Conventions

- **CSS Modules** for component styles (e.g. `Component.module.css`), design tokens via CSS custom properties
- **`'use client'`** directive on interactive components; server components by default
- **TDD for math**: all `lib/math/` modules have thorough unit tests
- **Named exports** for all components
- **No external UI libraries** — custom CSS only
- **Test files** co-located next to source files (`*.test.ts`)
- **18 test files, 212 tests** covering math, data, education, and integration

## Deployment

- Vercel auto-deploys from `main` branch
- GitHub Actions CI: `npm ci` → `npm audit` → `npm run lint` → `npm test` → `npm run build`
- Custom domain: `www.phototools.io` (apex `phototools.io` redirects to www)
- NEVER push to remote or deploy without explicit user instruction
