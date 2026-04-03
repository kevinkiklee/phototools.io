# PhotoTools Project Context

PhotoTools is a high-performance, educational photography application providing free calculators, simulators, and references. It is built as a Next.js 16 App Router application with a focus on SEO-driven traffic and advertisement compatibility.

## Core Design Philosophy

- **No Page Scroll**: This is a **hard constraint**. The application MUST fit within 100vh. The page never scrolls; only individual panels (controls, results, sidebars) scroll internally via `overflow-y: auto`.
- **Vanilla CSS Only**: No external UI libraries (MUI, Shadcn, etc.) or Tailwind CSS. Use CSS Modules and existing design tokens.
- **Reference Implementation**: The FOV Simulator (`components/tools/fov-simulator/`) is the gold-standard. All new tools must mirror its layout, spacing, and interactive patterns.
- **SEO & Ads**: Layouts must be clean, semantic, and have predictable content regions for ad placement without layout shifts (CLS).

## Architecture & Core Systems

### 1. Tool Registry (`lib/data/tools.ts`)
Central source of truth for all tools.
- **Status**: `live` (visible in production) or `draft` (hidden in production, accessible via direct URL with `DraftBanner`).
- **Visibility**: In `development`, all tools are visible regardless of status.

### 2. Pure Math Modules (`lib/math/`)
Core photography logic is isolated into pure TypeScript modules.
- **TDD Requirement**: Every math module MUST have a co-located `*.test.ts` file with 100% coverage.
- **UI Integration**: Components should be thin wrappers around these math functions.

### 3. Education System (`lib/data/education/`)
Every tool features a `LearnPanel` (right sidebar) defined in `content.ts` and `content2.ts`:
- **Beginner/Deeper Explanations**: Multi-level educational content.
- **Key Factors & Pro Tips**: Bulleted lists and practical advice.
- **Interactive Challenges**: 3-5 multiple-choice questions with persistence to `localStorage`.
- **Tooltips**: Use `InfoTooltip` on control labels for quick definitions.

### 4. Layout Shell (`components/shared/ToolPageShell.tsx`)
Standard three-column layout (Controls | Main Visualizer | LearnPanel). Provides consistent header actions (Share, Export, Info).

## Engineering Standards

- **Tech Stack**: Next.js 16, React 19, TypeScript 6, Vitest, CSS Modules, Canvas/WebGL2.
- **Components**: Use **named exports** and the `'use client'` directive for interactive elements.
- **Testing**: Co-locate test files next to source files (`*.test.ts` or `*.test.tsx`).
- **Build & Run**:
  - `npm run dev`: Start dev server with Turbopack.
  - `npm run build`: Production build.
  - `npm test`: Run all unit and integration tests (170+ tests).
  - `npm run lint`: Run ESLint.

## Directory Mapping

- `app/`: Routes (Home, Tools, Glossary).
- `components/layout/`: Global Nav (mega-menu), Footer, Theme providers.
- `components/shared/`: Reusable tool UI components (Shell, LearnPanel, Tooltips).
- `components/tools/`: Tool-specific implementations.
- `lib/math/`: Pure calculation logic + tests.
- `lib/data/`: Static data (Sensors, Focal Lengths, Tool Registry, Education).
- `public/`: Images, icons, manifest, sitemap, robots.txt.

## Deployment & CI

- **GitHub Actions**: Runs `npm ci` → `npm audit` → `npm run lint` → `npm test` → `npm run build`.
- **Vercel**: Auto-deploys from the `main` branch to `phototools.io`.
