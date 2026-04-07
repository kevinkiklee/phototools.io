# Analytics Instrumentation Design

**Date:** 2026-04-06
**Status:** Approved
**Scope:** Comprehensive user behavior tracking across PhotoTools.io

## Overview

Add deep analytics instrumentation to PhotoTools.io using three platforms:

- **GA4** — acquisition, SEO metrics, Search Console integration (existing, expanded)
- **PostHog** — product behavior, session replays, heatmaps, autocapture (new)
- **Meta Pixel** — paid social attribution, retargeting audiences (new)

Architecture: centralized analytics service with typed event taxonomy, tiered consent, and provider fan-out.

## Decisions

| Decision | Choice |
|----------|--------|
| Platforms | GA4 (acquisition/SEO) + PostHog (behavior) + Meta Pixel (attribution) |
| Consent model | Tiered — PostHog cookieless pre-consent, GA4 + Meta consent-gated |
| Architecture | Centralized analytics service with provider fan-out |
| Tool tracking | Debounced sliders (500ms) + immediate discrete controls + exit snapshot |
| Autocapture | Hybrid — PostHog autocapture ON + manual semantic events |
| Meta conversions | PageView, ViewContent, Search, ToolEngaged, ShareClick, ChallengeCompleted |
| Event taxonomy | Shared names across providers, auto-enriched global properties |
| Dashboards | Separate native UIs, shared event taxonomy for cross-referencing |
| PostHog hosting | EU (eu.i.posthog.com) for GDPR compliance |
| Ad blocker bypass | Reverse proxy through `/phog/*` rewrites |
| Session replays | Enabled from day one (consent-gated) |

---

## 1. Architecture

### System Diagram

```
┌──────────────────────────────────────────────────────┐
│  Components (call semantic tracking functions)        │
│  e.g. trackToolInteraction(), trackScrollDepth()      │
└───────────────────────┬──────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────┐
│  Analytics Service  (src/lib/analytics/)              │
│  ┌──────────────┐ ┌───────────────┐ ┌─────────────┐  │
│  │ Event         │ │ Consent       │ │ Provider    │  │
│  │ Taxonomy      │ │ Manager       │ │ Registry    │  │
│  │ (types +      │ │ (reads        │ │ (PostHog,   │  │
│  │  semantic     │ │  CookieYes    │ │  GA4, Meta) │  │
│  │  functions)   │ │  state)       │ │             │  │
│  └──────────────┘ └───────────────┘ └─────────────┘  │
│                                                       │
│  ┌──────────────┐ ┌───────────────┐                   │
│  │ Global Prop   │ │ Debug Logger  │                   │
│  │ Enrichment    │ │ (dev only)    │                   │
│  └──────────────┘ └───────────────┘                   │
└───────────────────────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
    ┌─────────┐   ┌─────────┐   ┌──────────┐
    │ PostHog │   │  GA4    │   │  Meta    │
    │(always*)│   │(consent)│   │ (consent)│
    └─────────┘   └─────────┘   └──────────┘
    * cookieless pre-consent, full post-consent
```

### File Structure

```
src/lib/analytics/
  index.ts              Public API — semantic track functions, dispatch logic, re-exports
  types.ts              Event taxonomy — all event names and typed properties
  consent.ts            Reads CookieYes state, emits consent tier changes (grant + revoke)
  debug.ts              Console logger for dev mode (disabled in production)
  error-tracking.ts     Global error handlers + trackError() with recursion guard
  providers/
    posthog.ts          Init (cookieless default), upgrade/downgrade on consent, track()
    ga4.ts              Init + track(), consent-gated
    meta.ts             Init + track(), consent-gated
  hooks/
    useDebouncedTracker.ts   Debounced tool interaction tracking, flushes on unmount
    useScrollDepth.ts        Scroll tracking (rAF-throttled scroll listener)
    useToolSession.ts        Time on tool, interaction count, exit snapshot, 30s engagement
  components/
    AnalyticsProvider.tsx    SDK init, consent listener, SPA pageview tracking, error boundaries
    AnalyticsErrorBoundary.tsx  React error boundary that tracks render errors
```

The existing `src/lib/analytics.ts` is replaced by this module. Existing call sites (`trackLearnPanelOpen`, `trackChallengeComplete`) update their import path from `@/lib/analytics` — same function signatures preserved.

### Global Property Enrichment

The dispatcher auto-enriches every event with these properties. Components never pass them manually:

| Property | Source |
|----------|--------|
| `locale` | Set by AnalyticsProvider from `useLocale()` into module-scoped object |
| `page_path` | Set by AnalyticsProvider from `usePathname()` |
| `viewport_type` | `mobile` (<768px) / `desktop` (>=768px), computed from `window.innerWidth` |
| `tool_slug` | Extracted from path, validated against tool registry. `null` on non-tool pages |
| `tool_category` | Looked up from tool registry if `tool_slug` is present |

AnalyticsProvider maintains a module-scoped `globalProperties` object updated on every route change. The dispatcher reads from this object — no hooks in the dispatcher module.

### Graceful Degradation

Each provider's `init()` early-returns if its env var is missing. All `track()` calls no-op. Same pattern as `isAdsEnabled()` in `src/lib/ads.ts`. Missing env vars = silent no-op, no console errors, no broken pages.

---

## 2. Consent Flow

### Initialization Sequence

```
On AnalyticsProvider mount:
  1. Init PostHog (cookieless mode — persistence: 'memory', no cookies)
  2. Check CookieYes existing consent state (returning users)
     → If analytics already granted: upgrade PostHog + activate GA4
     → If marketing already granted: load Meta Pixel
  3. Register listener for future consent changes via
     document.addEventListener('cookieyes_consent_update', ...)

On consent change (grant):
  → Analytics consent: PostHog opt_in + localStorage persistence + session replay,
                        gtag('consent', 'update', { analytics_storage: 'granted' })
  → Marketing consent: Render Meta Pixel <Script>, fbq('init'), fbq('track', 'PageView'),
                        gtag('consent', 'update', { ad_storage: 'granted',
                        ad_user_data: 'granted', ad_personalization: 'granted' })

On consent change (revoke):
  → Analytics revoked: PostHog opt_out + stop recording,
                        gtag('consent', 'update', { analytics_storage: 'denied' })
  → Marketing revoked: Set metaEnabled flag to false (fbq calls no-op),
                        gtag('consent', 'update', { ad_storage: 'denied',
                        ad_user_data: 'denied', ad_personalization: 'denied' })
```

### Consent Categories (independent)

| CookieYes category | Providers affected | Behavior |
|--------------------|-------------------|----------|
| `analytics` | PostHog (upgrade), GA4 (activate) | Grant: full tracking. Revoke: PostHog opts out, GA4 denies |
| `marketing` | Meta Pixel | Grant: script loads + fires. Revoke: fbq calls no-op |

A user can grant analytics but deny marketing, or vice versa.

### Pre-consent State

- **PostHog:** Fires events anonymously (cookieless, no persistent identity, no session replay, no cookies/localStorage). Autocapture active. Covers ~100% of visitors.
- **GA4:** Loaded but consent-default is `denied`. Sends cookieless modeled pings (Google's default behavior with consent mode — no PII, considered GDPR-compliant). This is a conscious decision.
- **Meta Pixel:** Script NOT loaded. Zero tracking.

### Dev-mode Consent Simulation

In development, support query param: `?analytics_consent=analytics,marketing` (comma-separated categories). AnalyticsProvider checks this on mount and treats it as pre-existing consent. Also expose `window.__analytics`:

```
window.__analytics.grantConsent('analytics')
window.__analytics.grantConsent('marketing')
window.__analytics.revokeConsent('analytics')
window.__analytics.getState()   // { analytics: true, marketing: false, providers: {...} }
```

Only attached when `NODE_ENV !== 'production'`.

---

## 3. Event Taxonomy

### Automatic Events

| Event | Trigger | PostHog | GA4 | Meta |
|-------|---------|---------|-----|------|
| `page_view` | Route change (SPA) + initial load | Auto (SPA mode) | Yes | `PageView` |
| `$autocapture` | Any click/input (PostHog only) | Auto | — | — |
| `$pageleave` | User leaves page (PostHog only) | Auto | — | — |
| `js_error` | `window.addEventListener('error')` | Yes | Yes | — |

### Tool Interaction Events

Debounced at 500ms for sliders, immediate for discrete controls (select, toggle, button, scene-picker, text-input).

| Event | Properties | PostHog | GA4 | Meta |
|-------|-----------|---------|-----|------|
| `tool_interaction` | `param_name`, `param_value`, `input_type` (slider/select/toggle/button/scene-picker/text-input) | Yes | Yes | — |
| `tool_engaged` | `tool_slug`, `duration_seconds` (fires at 30s threshold) | Yes | Yes | `ToolEngaged` |
| `tool_session_summary` | `tool_slug`, `duration_seconds`, `interaction_count`, `final_params` (PostHog only — JSON), `param_count` (GA4), `primary_param` (GA4) | Yes | Yes (truncated) | — |

`tool_session_summary` fires on unmount via `navigator.sendBeacon` (SPA navigation) and `beforeunload` (page close).

### Engagement Events

| Event | Properties | PostHog | GA4 | Meta |
|-------|-----------|---------|-----|------|
| `page_scroll_depth` | `depth_percent` (25/50/75/100), `viewport_type` | Yes (mobile only) | Yes | — |
| `learn_panel_scroll_depth` | `depth_percent` (25/50/75/100) | Yes | Yes | — |
| `learn_panel_open` | (none — tool_slug auto-enriched) | Yes | Yes | — |
| `learn_panel_section_view` | `section` (beginner/deeper/factors/tips) | Yes | Yes | — |
| `challenge_start` | `challenge_id`, `difficulty` | Yes | Yes | — |
| `challenge_complete` | `challenge_id`, `difficulty`, `correct`, `attempt_number` | Yes | Yes | `ChallengeCompleted` (custom, correct only) |

### Navigation & UI Events

| Event | Properties | PostHog | GA4 | Meta |
|-------|-----------|---------|-----|------|
| `nav_click` | `target` (tool slug/about/contact/etc.), `source` (mega-menu/footer/homepage-card) | Yes | Yes | — |
| `share_click` | `method` (copy-link/embed/twitter/facebook) | Yes | Yes | `ShareClick` (custom) |
| `language_switch` | `from_locale`, `to_locale` | Yes | Yes | — |
| `theme_toggle` | `new_theme` (light/dark) | Yes | — | — |
| `outbound_click` | `url`, `link_text`, `source` (learn-panel/footer/nav) | Yes | Yes | — |
| `mobile_menu_toggle` | `action` (open/close) | Yes | — | — |
| `mobile_controls_toggle` | `action` (open/close) | Yes | — | — |
| `glossary_search` | `search_term`, `results_count` | Yes | Yes | `Search` |
| `glossary_entry_view` | `term_id` | Yes | Yes | — |
| `contact_form_submit` | (none) | Yes | Yes | — |

### File & Media Events

| Event | Properties | PostHog | GA4 | Meta |
|-------|-----------|---------|-----|------|
| `file_upload` | `file_type`, `file_size_kb` | Yes | Yes | — |
| `file_upload_error` | `error_type`, `file_type` | Yes | Yes | — |

### Error Events

| Event | Properties | PostHog | GA4 | Meta |
|-------|-----------|---------|-----|------|
| `js_error` | `message`, `source`, `line`, `column` | Yes | Yes | — |
| `webgl_error` | `error_type` (context_lost/shader_compile/etc.) | Yes | Yes | — |
| `capability_check` | `feature` (webgl2/canvas), `supported` (boolean) | Yes | Yes | — |

### Ad Events

| Event | Properties | PostHog | GA4 | Meta |
|-------|-----------|---------|-----|------|
| `ad_slot_visible` | `slot_id`, `format`, `viewport_type` | Yes | Yes | — |
| `mobile_ad_dismiss` | `time_before_dismiss_seconds` | Yes | Yes | — |

### Meta Pixel Conversion Events (marketing consent required)

| Meta Event | Trigger | Params |
|------------|---------|--------|
| `PageView` | Every page load / SPA navigation | — |
| `ViewContent` | Tool page load | `content_name`: tool slug, `content_category`: tool category |
| `Search` | Glossary search | `search_string`: query |
| `ToolEngaged` (custom) | Tool interaction >30s | `tool_slug`, `duration` |
| `ShareClick` (custom) | Share button clicked | `tool_slug`, `method` |
| `ChallengeCompleted` (custom) | Challenge answered correctly | `tool_slug`, `difficulty` |

### Property Conventions

- `tool_slug` — always English URL slug (e.g., `fov-simulator`)
- `page_path` — locale-prefixed (e.g., `/ja/fov-simulator`)
- All string values lowercase
- `viewport_type` — `mobile` (<768px), `desktop` (>=768px)
- `tool_slug` validated against tool registry before enrichment — pages like `/en/about` produce `null`
- GA4: property values truncated at 100 characters. `final_params` JSON sent to PostHog only; GA4 gets `param_count` + `primary_param`

### Key Funnels (build dashboards for these)

- **Discovery -> Engagement:** `page_view` -> `tool_interaction` -> `tool_session_summary (duration > 30s)`
- **Education:** `learn_panel_open` -> `learn_panel_section_view` -> `challenge_start` -> `challenge_complete (correct)`
- **Virality:** `tool_interaction` -> `share_click`
- **Cross-tool:** `page_view (tool A)` -> `nav_click` -> `page_view (tool B)`

---

## 4. Provider Implementation

### PostHog

**Initialization (pre-consent):**

```
posthog.init(POSTHOG_KEY, {
  api_host: '/phog/ingest'              // Reverse proxy (ad blocker bypass)
  persistence: 'memory'                 // No cookies pre-consent
  autocapture: true                     // Captures clicks, inputs, pageviews
  capture_pageview: false               // We handle SPA pageviews in AnalyticsProvider
  capture_pageleave: true               // Automatic page leave events
  disable_session_recording: true       // Enabled only after consent
  mask_all_element_attributes: false
  session_recording: {
    maskAllInputs: false                // Tool controls are non-PII educational data
  }
})
```

Contact form container gets `data-ph-no-capture` attribute to mask PII fields in replays.

**On analytics consent grant:**
```
posthog.opt_in_capturing()
posthog.set_config({ persistence: 'localStorage+cookie' })
posthog.startSessionRecording()
```

**On analytics consent revoke:**
```
posthog.opt_out_capturing()
posthog.stopSessionRecording()
```

**Autocapture enrichment:** Add `data-ph-capture-attribute-*` to key elements (nav items, homepage cards, footer links) so autocaptured clicks include structured context.

**Bundle size:** posthog-js is ~30-45KB gzipped. Session replay adds ~20KB but only loads post-consent (dynamic import).

### GA4

Keeps existing setup (measurement ID `G-B0QND42GRG`). Changes:

- Move inline `<Script>` tags from `[locale]/layout.tsx` into AnalyticsProvider
- Consent default stays as-is (all denied)
- On consent grant/revoke: `gtag('consent', 'update', { ... })` with correct category mapping
- SPA pageviews: `gtag('event', 'page_view', { page_path, page_title })` on route change
- Custom events: `gtag('event', eventName, properties)` with 100-char value limit enforced

**Optional refactor (separate scope):** Move hardcoded `G-B0QND42GRG` to `NEXT_PUBLIC_GA4_ID` env var. Not blocking for this project.

### Meta Pixel

**Not loaded until marketing consent.** AnalyticsProvider holds `metaConsentGranted` state that conditionally renders the `<Script>` tag.

**On marketing consent grant:**
```
fbq('init', META_PIXEL_ID)
fbq('track', 'PageView')
```

**SPA pageviews:** `fbq('track', 'PageView')` on route change.

**Standard events:** `ViewContent`, `Search` (see taxonomy above).

**Custom events:** `fbq('trackCustom', 'ToolEngaged', { ... })` etc.

**On marketing consent revoke:** Set internal `metaEnabled = false`. All `fbq()` calls check flag and no-op. Script stays loaded (can't unload) but sends nothing.

### Environment Variables (new)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key (EU project) |
| `NEXT_PUBLIC_POSTHOG_HOST` | `/phog/ingest` (after proxy configured) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel ID |

Existing vars unchanged: `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_COOKIEYES_ID`.

---

## 5. Component Integration Patterns

### Pattern 1: Direct tracking calls

Components import semantic functions from `@/lib/analytics`. Global properties (locale, tool_slug, etc.) are auto-enriched — never passed by components.

```tsx
import { trackShareClick, trackLanguageSwitch } from '@/lib/analytics'

trackShareClick({ method: 'copy-link' })
trackLanguageSwitch({ from_locale: 'en', to_locale: 'ja' })
```

Components never import PostHog, gtag, or fbq directly.

### Pattern 2: useDebouncedTracker hook

Returns a tracking function that debounces slider changes at 500ms. Flushes pending events on unmount so the last interaction is never lost.

```tsx
const trackParam = useDebouncedTracker()

// Slider onChange — debounced:
trackParam({ param_name: 'focal_length', param_value: '85', input_type: 'slider' })

// Select onChange — immediate (not debounced):
trackToolInteraction({ param_name: 'sensor', param_value: 'full-frame', input_type: 'select' })
```

### Pattern 3: useScrollDepth hook

Uses rAF-throttled scroll listener. Calculates `scrollTop / (scrollHeight - clientHeight) * 100`. Fires each threshold (25/50/75/100) once per page view.

```tsx
// LearnPanel:
const scrollRef = useScrollDepth({ event: 'learn_panel_scroll_depth' })
return <div ref={scrollRef}>{...content}</div>

// Mobile tool pages:
const pageRef = useScrollDepth({ event: 'page_scroll_depth' })
```

### Pattern 4: useToolSession hook

Mounted once per tool page. Returns wrapped tracking function that counts interactions.

```tsx
const { trackParam, paramsRef } = useToolSession()
paramsRef.current = currentParams  // Updated on every param change

// trackParam wraps trackToolInteraction + increments interaction counter
// Hook automatically:
//   - Fires tool_engaged at 30s
//   - Fires tool_session_summary on unmount (sendBeacon)
//   - Fires tool_session_summary on beforeunload
```

### Pattern 5: Data attributes for autocapture

```tsx
// Homepage card:
<a href={...} data-ph-capture-attribute-source="homepage-card"
              data-ph-capture-attribute-tool-slug={tool.slug}>

// Nav mega-menu:
<a href={...} data-ph-capture-attribute-source="mega-menu"
              data-ph-capture-attribute-tool-slug={tool.slug}>

// Footer:
<a href={...} data-ph-capture-attribute-source="footer">
```

PostHog autocapture picks these up automatically. For GA4, add explicit `trackNavClick()` calls in Nav/Footer click handlers (finite set of elements — no delegation needed).

### Pattern 6: Error tracking

```tsx
// Global — set up once in AnalyticsProvider via addEventListener (no clobbering):
window.addEventListener('error', (event) => trackJsError({ ... }))
window.addEventListener('unhandledrejection', (event) => trackJsError({ ... }))

// Recursion guard: module-level isTrackingError flag prevents infinite loops

// Component-level:
trackWebGLError({ error_type: 'context_creation_failed' })
trackCapabilityCheck({ feature: 'webgl2', supported: false })
trackFileUploadError({ error_type: 'invalid_format', file_type: 'bmp' })

// Analytics network failures are filtered out — errors from /phog/, posthog,
// facebook, googletagmanager are skipped to avoid noise
```

### Pattern 7: AnalyticsErrorBoundary

Wraps app inside AnalyticsProvider. Catches React render errors via `componentDidCatch` and sends to `trackJsError()`.

### Components Requiring Changes

| Component | Changes |
|-----------|---------|
| **AnalyticsProvider** (new) | Init all providers, consent management, SPA pageviews, error handlers, global property updates |
| **AnalyticsErrorBoundary** (new) | React error boundary wrapping app |
| `[locale]/layout.tsx` | Wrap children in AnalyticsProvider + ErrorBoundary, remove inline GA4 `<Script>` tags |
| Each tool `page.tsx` / main component | Add `useToolSession` hook + `paramsRef` |
| Each tool's slider/control handlers | Use `trackParam` from `useToolSession` for sliders, `trackToolInteraction` for discrete |
| `LearnPanel` | Add `useScrollDepth` ref, add `learn_panel_section_view` tracking |
| `ChallengeCard` | Add `challenge_start` event, add `attempt_number` to `challenge_complete` |
| `ShareModal` | Add `trackShareClick` |
| `Nav` | Add `data-ph-capture-attribute-*` to mega-menu items, add `trackNavClick` calls |
| `Footer` | Add `data-ph-capture-attribute-*` to links, add `trackNavClick` calls |
| Homepage tool cards | Add `data-ph-capture-attribute-*` |
| `LanguageSwitcher` | Add `trackLanguageSwitch` |
| `ThemeToggle` | Add `trackThemeToggle` |
| `FileDropZone` | Add `file_upload` and `file_upload_error` tracking |
| `PhotoUploadPanel` | Add `file_upload` on success |
| `MobileAdBanner` | Add `mobile_ad_dismiss` tracking |
| `AdUnit` | Add `ad_slot_visible` via IntersectionObserver |
| `ScenePicker` | Add `tool_interaction` with `input_type: 'scene-picker'` |
| Glossary page | Add `trackGlossarySearch`, `trackGlossaryEntryView` |
| Contact form | Add `trackContactFormSubmit`, add `data-ph-no-capture` to form container |
| WebGL tool components | Add `trackCapabilityCheck` on init, `trackWebGLError` on failure |

---

## 6. CSP & Security Updates

### Content Security Policy (next.config.ts)

| Directive | Add | Why |
|-----------|-----|-----|
| `script-src` | `https://eu-assets.i.posthog.com` | PostHog JS SDK (fallback if proxy fails) |
| | `https://connect.facebook.net` | Meta Pixel SDK |
| `connect-src` | `https://eu.i.posthog.com` | PostHog ingestion (fallback before proxy) |
| | `https://www.facebook.com` | Meta Pixel event delivery |
| `img-src` | `https://www.facebook.com` | Meta Pixel image beacon |
| `frame-src` | `https://www.facebook.com` | Meta Pixel hidden iframes |

Once the reverse proxy is active, `connect-src` for `eu.i.posthog.com` can be removed (traffic routes through `'self'`). Keep `eu-assets.i.posthog.com` in `script-src` as fallback.

### Reverse Proxy (next.config.ts rewrites)

```ts
async rewrites() {
  return [
    { source: '/phog/ingest/:path*', destination: 'https://eu.i.posthog.com/:path*' },
    { source: '/phog/assets/:path*', destination: 'https://eu-assets.i.posthog.com/:path*' },
  ]
}
```

PostHog init uses `api_host: '/phog/ingest'`. Traffic routes through `www.phototools.io`, invisible to ad blockers.

**Cost:** Vercel rewrites are handled at the edge/routing layer, not as function invocations. No function execution cost. Bandwidth usage scales with event volume — acceptable trade-off.

### robots.txt

Add `Disallow: /phog/` to `src/app/robots.ts` to prevent crawlers from hitting proxy endpoints.

### Privacy

| Concern | Mitigation |
|---------|-----------|
| Session replay captures screen | `maskAllInputs: false` (tool controls are non-PII). Contact form gets `data-ph-no-capture` attribute |
| PostHog receives user IP | Enable "Discard client IP data" in PostHog project settings (manual, one-time) |
| Meta Pixel cross-site tracking | Only loads after explicit marketing consent |
| Analytics network failures create noise | Error tracking filters out analytics domains/paths |
| Supply chain risk | Pin posthog-js to specific npm version. Meta Pixel gated behind consent |

### Privacy Policy Update

The privacy page needs updates to disclose PostHog, session replay, and Meta Pixel. **This requires legal review before translation.** Treated as a separate workstream — not part of the technical implementation.

---

## 7. Testing & Debug

### Debug Mode (development)

Every event logs to console with provider status:
```
[Analytics] tool_interaction -> PostHog OK, GA4 OK, Meta blocked (no consent)
  { param_name: 'aperture', param_value: 'f/2.8', ... }
```

PostHog's built-in `debug: true` is NOT enabled (we use our own logging to avoid double output). Enable manually via `window.__analytics.enablePostHogDebug()` if needed.

### Unit Tests (Vitest)

| Module | Key test cases |
|--------|---------------|
| `consent.ts` | Reads CookieYes state; handles missing CookieYes (no-op); partial consent; revocation; pre-existing consent on mount |
| `providers/posthog.ts` | No-ops when key missing; cookieless init; upgrade on consent; opt-out on revoke |
| `providers/ga4.ts` | No-ops when gtag undefined; correct event format; consent gating; value truncation at 100 chars |
| `providers/meta.ts` | No-ops when pixel ID missing; no-ops before marketing consent; correct standard/custom events; stops on revoke |
| `index.ts` (dispatcher) | Enriches with global properties; routes to correct providers by consent; graceful degradation |
| `error-tracking.ts` | Captures error details; includes tool_slug on tool pages; recursion guard prevents infinite loop; filters analytics network errors |
| `debug.ts` | Logs in development; silent in production |

Mock strategy: mock provider SDKs at module level. Each provider exports `init()` and `track()` — tests mock `posthog`, `window.gtag`, `window.fbq`.

### Hook Tests (Vitest + Testing Library)

All time-dependent tests use `vi.useFakeTimers()`.

| Hook | Key test cases |
|------|---------------|
| `useDebouncedTracker` | Debounces rapid calls at 500ms; flushes on unmount; fires immediately for discrete input types |
| `useScrollDepth` | Fires each threshold once; no duplicates on scroll up/down. Note: jsdom has no real layout — mock `scrollHeight`/`scrollTop`/`clientHeight` via `Object.defineProperty` |
| `useToolSession` | Starts timer on mount; fires `tool_engaged` at 30s; fires `tool_session_summary` on unmount with correct duration/count; uses sendBeacon on beforeunload |

### AnalyticsProvider Tests

| Test | Assertion |
|------|-----------|
| Mounts without env vars | No errors, all providers no-op |
| Route change fires pageviews | Pathname change triggers page_view to active providers |
| Consent grant upgrades | PostHog opts in, GA4 consent updates, Meta script renders |
| Consent revoke downgrades | PostHog opts out, GA4 denies, Meta stops |
| Global properties enriched | Events include locale, page_path, viewport_type |
| tool_slug validation | `/en/about` produces null, `/en/fov-simulator` produces `fov-simulator` |

### Integration Verification (post-deploy, manual)

- [ ] PostHog live event stream: pageviews, autocapture, tool interactions, session replay
- [ ] GA4 DebugView (Chrome extension): events arrive with correct names/properties
- [ ] Meta Pixel Helper (Chrome extension): PageView, ViewContent, custom events
- [ ] Verify no cookies set pre-consent (DevTools → Application → Cookies)
- [ ] Verify consent grant/revoke toggles providers correctly

### Performance Verification

- [ ] Lighthouse on 3 tool pages before and after analytics deployment
- [ ] LCP, CLS, TBT must not degrade by more than 10%
- [ ] Session replay must not cause visible jank on WebGL tools

### Smoke Test Updates

Add PostHog and Meta Pixel domains to the benign console error filter in `src/e2e/smoke/all-pages.spec.ts`.

---

## 8. Non-Code Setup Checklist

These steps are manual/external — not part of the codebase:

- [ ] Create PostHog project in EU region, get API key
- [ ] Enable "Discard client IP data" in PostHog project settings
- [ ] Create Meta Pixel in Meta Events Manager, get Pixel ID
- [ ] Add `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_META_PIXEL_ID` to Vercel env vars
- [ ] Legal review of privacy policy updates before translation to 31 locales
- [ ] After deploy: verify events in PostHog live stream, GA4 DebugView, Meta Pixel Helper
- [ ] After deploy: Lighthouse CWV comparison (pre vs post analytics)
- [ ] Build PostHog dashboards for key funnels (discovery, education, virality, cross-tool)
