# Top Navigation Bar Design Spec

## Goal

Add a persistent top navigation bar to the FOV Viewer React app that links to all user-facing pages (Tool, Compare, Learn) and prepares for the app becoming a suite of photography tools.

## Architecture

A new `TopNav` React component renders a fixed horizontal bar above the existing sidebar + canvas layout. The current sidebar header (logo + mobile action buttons) is removed. Theme toggle moves to the top nav. Rotate/Center buttons become visible on all breakpoints in the canvas topbar.

## Design

### Layout

- **Fixed bar** at the top of the viewport, full width, ~44px height
- **Left:** "FOV Viewer" text linking to `/` (the tool home)
- **Center-left:** Page links — "Tool" (active on `/`), "Compare" (`/compare/`), "Learn" (`/learn/`)
- **Right:** Theme toggle button
- **Below nav:** Existing sidebar + canvas layout shifts down by nav height
- Styling matches the static content pages' `.site-header` for visual consistency

### Mobile Behavior

- Same nav bar on mobile — logo + page links + theme toggle
- Page links use compact styling (smaller font, tighter gaps)
- Sidebar header (`sidebar__header` with logo, Rotate, Center, ThemeToggle) is removed entirely
- Rotate and Center buttons show on all breakpoints in the canvas topbar (remove `desktop-only` wrapper, remove `mobile-only` sidebar actions)

### Changes

1. **Create `src/components/TopNav.tsx`** — New component. Props: `theme`, `onToggleTheme`. Renders the nav bar with logo, page links, and theme toggle.

2. **Modify `src/App.tsx`:**
   - Add `<TopNav>` at the top of the app div (before Sidebar)
   - Remove the entire `sidebar__header` block (logo + mobile actions)
   - Remove the `desktop-only` wrapper around Rotate/Center/ThemeToggle in canvas topbar
   - Remove ThemeToggle from canvas topbar (now in TopNav)
   - Keep Rotate and Center buttons in canvas topbar, visible on all breakpoints

3. **Modify `src/App.css`:**
   - Add `.top-nav` styles (flex row, border-bottom, fixed height)
   - Adjust `.app` layout to account for nav height (e.g., `padding-top` or adjust grid)
   - Remove `.sidebar__header` styles
   - Remove `.mobile-only` / `.desktop-only` logic for Rotate/Center buttons
   - Ensure mobile layout still works with the new structure

4. **Update static content pages** (`public/compare/`, `public/learn/`, `public/404.html`):
   - Update `.site-header` styling in `content-styles.css` to visually match the new React nav bar
   - No structural changes needed — the content pages already have Tool/Compare/Learn links

## What This Does NOT Include

- Tool switcher dropdown (future — when more tools exist)
- Suite-level branding change (stays "FOV Viewer" for now)
- Hamburger menu on mobile (links are short enough to fit inline)
