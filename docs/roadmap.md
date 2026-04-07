# PhotoTools.io — Technical Roadmap

**Last updated:** 2026-04-06
**Horizon:** 3–6 months (April – September 2026)

---

## Current State

### Live in Production (7 tools)

| Tool | Category | Tech |
|------|----------|------|
| FOV Simulator | Visualizer | WebGL2 + GLSL shaders |
| Color Scheme Generator | Visualizer | Canvas API |
| Star Trail Calculator | Visualizer | Canvas API |
| White Balance Visualizer | Visualizer | WebGL2 + GLSL shaders |
| Sensor Size Comparison | Visualizer | Canvas API |
| Frame Studio | File Tool | Canvas API |
| EXIF Viewer | File Tool | Client-side EXIF parsing + Canvas histogram |

### Dev-Only (7 tools)

| Tool | Category | Readiness | Blocker |
|------|----------|-----------|---------|
| Exposure Simulator | Visualizer | High | QA + production toggle |
| DoF Simulator | Visualizer | High | Recently redesigned, needs stabilization |
| Hyperfocal Simulator | Visualizer | High | Has spec + plan, needs final polish |
| Shutter Speed Visualizer | Visualizer | Medium | Needs UX polish |
| Focus Stacking Calculator | Calculator | Medium | Recent diagram fixes, needs testing |
| Equivalent Settings Calculator | Calculator | Medium | Functional, needs review |
| Perspective Compression Simulator | Visualizer | Medium | Functional, needs review |

### Draft (1 tool)

- **ND Filter Calculator** — partially built, needs full implementation

### Orphan Routes (not in tool registry)

- `color-harmony` — unclear status, not registered
- `histogram` — unclear status, not registered
- `hyperfocal-table` — unclear status, not registered

**Action required:** Audit each. Either register in `src/lib/data/tools.ts` or delete the route directory.

### Infrastructure

- **Framework:** Next.js 16 (App Router, Turbopack dev)
- **i18n:** 16 locales via next-intl 4.x
- **Testing:** 694 tests across 44 files (Vitest + Playwright)
- **CI/CD:** GitHub Actions → Vercel auto-deploy from main
- **Ads:** AdSense scaffolded (AdUnit, MobileAdBanner, AdScripts), feature-flagged, pending approval. CookieYes + GA4 Consent Mode v2 configured.
- **SEO:** Sitemap with hreflang, OG image generation, metadata helpers, FAQ JSON-LD schema on tool pages, og:title/og:description fixed on all 7 tool pages
- **Analytics:** GA4 active with custom events (tool_interaction, learn_panel_open, challenge_complete), Vercel Analytics enabled, Google Search Console set up

### Known Issues

- **Google indexing:** Only 1 of 7 live tool pages indexed. 2 pages flagged as not indexed. This is the highest-priority issue.
- **GA ↔ Search Console not linked.**
- **No Core Web Vitals data** in Search Console (insufficient traffic sample).

---

## Phase 1: Foundation (Weeks 1–6)

### 1.1 SEO & Indexing (Weeks 1–2)

**Goal:** Diagnose and fix the indexing problem. Get all live tool pages crawled and indexed.

| Task | Priority | Status | Notes |
|------|----------|--------|-------|
| ~~Fix og:title/og:description on tool pages~~ | P0 | Done | All 7 tool pages fixed |
| ~~Fix JSON-LD URLs with locale prefix~~ | P0 | Done | |
| ~~Add FAQ JSON-LD structured data~~ | P1 | Done | Data + component + i18n across 16 locales |
| ~~Submit sitemap to Search Console~~ | P0 | Done | |
| ~~Link GA4 ↔ Search Console~~ | P0 | Done | |
| Investigate 2 non-indexed pages | P0 | TODO | Use URL Inspection tool — check for noindex, crawl errors, redirect loops |
| Audit SSR output of tool pages | P0 | TODO | Ensure Googlebot sees meaningful text, not empty canvas. Run `curl` on each tool URL and verify HTML contains educational content |
| Add Breadcrumb JSON-LD schema | P2 | TODO | Site-wide navigation breadcrumbs |

**Technical concern:** Canvas/WebGL tools render visuals client-side. If the server-rendered HTML is mostly empty `<canvas>` elements, Googlebot may see thin content. The LearnPanel educational text must be present in the initial HTML response, not just hydrated client-side.

### 1.2 Analytics & Compliance (Weeks 1–2)

| Task | Priority | Status | Notes |
|------|----------|--------|-------|
| ~~Enable Vercel Analytics + Speed Insights~~ | P1 | Done | |
| ~~Configure CookieYes + GA4 Consent Mode v2~~ | P0 | Done | GDPR compliance for EU locales |
| ~~GA4 event tracking utility~~ | P1 | Done | `src/lib/analytics.ts` |
| ~~Instrument LearnPanel + ChallengeCard~~ | P1 | Done | `learn_panel_open`, `challenge_complete` events |
| Configure AdSense slot IDs | P1 | TODO | Once approval lands. Conservative placement: 1 mobile anchor, 1 desktop sidebar |
| Monitor CWV after ads launch | P1 | TODO | Check within 1 week. If LCP/CLS degrade to "Poor," reduce placements immediately |

### 1.3 Ship Batch 1 (Weeks 3–6)

**Tools:** Exposure Simulator, DoF Simulator, Hyperfocal Simulator

These three are the highest-readiness tools and cover core photography optics concepts with high search volume.

**Per-tool checklist:**

- [ ] Final QA pass (functionality, edge cases, responsive layout)
- [ ] Education content complete (LearnPanel + challenges)
- [ ] i18n strings present in all 16 locales
- [ ] E2E test coverage (at minimum: page loads, no console errors, basic interaction)
- [ ] OG image configured
- [ ] Set `prod: 'live'` in `src/lib/data/tools.ts`
- [ ] Verify indexing in Search Console within 2 weeks of deploy

**Phase 1 exit criteria:**
- 10+ pages indexed in Google (English locale)
- Ads serving (or rejection handled)
- Analytics pipeline operational
- 10 tools live in production

---

## Phase 2: Growth (Weeks 7–12)

### 2.1 Ship Batch 2

**Tools:** Focus Stacking Calculator, Equivalent Settings Calculator, Shutter Speed Visualizer

Same per-tool checklist as Batch 1.

### 2.2 SEO Enhancements

| Task | Priority | Notes |
|------|----------|-------|
| Internal cross-linking between related tools | P1 | DoF ↔ Hyperfocal ↔ Focus Stacking; Exposure ↔ ND Filter ↔ Shutter Speed; FOV ↔ Sensor Size ↔ Equiv Settings |
| Add FAQ sections to top 5 tool pages | P1 | Server-rendered, with FAQ JSON-LD schema |
| Add HowTo structured data | P2 | Where applicable (e.g., "How to calculate hyperfocal distance") |
| Expand glossary | P2 | 20+ new terms — each is a long-tail keyword landing page |

### 2.3 Cleanup & Maintenance

| Task | Priority | Notes |
|------|----------|-------|
| Audit orphan routes | P1 | `color-harmony`, `histogram`, `hyperfocal-table` — delete or register |
| Dependency updates | P2 | Allocate ~20% of weekly time to maintenance |
| Test coverage review | P2 | Ensure new tools have math + component tests |

**Phase 2 exit criteria:**
- 50+ pages indexed across locales
- 13 tools live in production
- Internal linking implemented
- Orphan routes resolved

---

## Phase 3: Optimize (Weeks 13–20)

### 3.1 Ship Remaining Tools

**Tools:** Perspective Compression Simulator, ND Filter Calculator

ND Filter Calculator is currently `draft` status — needs full implementation before shipping.

### 3.2 Affiliate Integration

| Task | Notes |
|------|-------|
| Build `RecommendedGear` shared component | Contextual product links per tool, subtle placement below controls |
| Add affiliate disclosure | FTC-required — inline near affiliate content + privacy policy update |
| Instrument `affiliate_click` GA4 event | Include tool slug + product params |
| Integrate with top 5 tools | Highest-traffic tools first |

**Component design:** `RecommendedGear` should accept a tool slug and current settings (e.g., selected focal length, sensor size) and render contextual product recommendations. Data source TBD — could be a static JSON mapping or a lightweight API.

### 3.3 UX Optimization

| Task | Notes |
|------|-------|
| Add Microsoft Clarity script | Heatmaps + session recording on top 3 tools |
| Mobile UX audit | Identify which tools work well on mobile vs. desktop-only |
| A/B test ad placements | Measure revenue vs. bounce rate impact |

### 3.4 Email Capture

| Task | Notes |
|------|-------|
| Add email signup component | Lightweight, footer of tool pages |
| Integrate with Buttondown or Mailchimp | Free tier |

**Phase 3 exit criteria:**
- All 15 tools live in production
- Affiliate component built and deployed on top tools
- CWV scores remain "Good"

---

## Phase 4: Scale (Weeks 21–26)

### 4.1 New Tool Exploration

Use Search Console query data to validate demand before building.

| Candidate | Complexity | Notes |
|-----------|-----------|-------|
| Print Size / DPI Calculator | Low | Form-based, no canvas needed |
| Lighting / Flash Calculator | Medium | Guide number math, could add visual |
| Timelapse Calculator | Low | Interval/duration/storage math |
| Lens Comparison (MTF charts) | High | Needs MTF data source, complex visualization |
| Sunrise/Sunset Planner | High | Geolocation API, map integration |

**Process:** Research top 3 candidates → spec the highest-signal tool → build.

### 4.2 Platform Improvements (Evaluate ROI)

| Candidate | Benefit | Cost | Decision Point |
|-----------|---------|------|---------------|
| PWA support | Offline use in field | Low | If return visitor rate > 20% |
| User accounts | Saved presets, favorites | High | If engagement data supports it |
| Performance pass | Bundle size, lazy loading, shader compilation | Medium | If CWV scores need improvement |
| Gear comparison pages | SEO + affiliate revenue | Medium | If affiliate CTR > 0.5% |

### 4.3 Locale Quality

| Task | Notes |
|------|-------|
| Translation quality review for Tier 1 locales (en, ja, de, es) | Manual review of key pages |
| Monitor bounce rate by locale | Deprioritize locales with consistently high bounce |

**Phase 4 exit criteria:**
- 20K monthly users
- Search Console showing click growth month-over-month
- Data-informed decision on next tool vs. content expansion

---

## Technical Debt & Maintenance

### Ongoing (20% of weekly time)

- Dependency updates (npm audit, major version bumps)
- Test maintenance (fix flaky tests, update snapshots)
- Build/deploy issues

### Quarterly

- Next.js version check and upgrade
- Security audit (CSP headers, dependency vulnerabilities)
- i18n coverage check (`node scripts/check-translations.mjs`)

### After Each Batch Ships

- 1 stabilization week: bug fixes, user feedback, test updates
- No new feature work during stabilization

---

## Architecture Decisions Ahead

| Decision | When | Options |
|----------|------|---------|
| Affiliate data source | Phase 3 | Static JSON mapping vs. lightweight API vs. third-party widget |
| Email service provider | Phase 3 | Buttondown (simple) vs. Mailchimp (more features) vs. Resend (developer-friendly) |
| Structured data approach | Phase 1 | Per-page JSON-LD components vs. centralized schema generator |
| Mobile strategy for WebGL tools | Phase 2–3 | Simplified mobile views vs. "learn on mobile, do on desktop" vs. responsive canvas |
| New tool data sources | Phase 4 | MTF chart data, geolocation APIs — may require server-side routes |

---

## Appendix: Tool Shipping Checklist

Standard checklist for promoting any tool from dev → production:

1. **Functionality:** All features working, edge cases handled
2. **Education:** LearnPanel content complete (beginner, deeper, key factors, pro tips, challenges)
3. **i18n:** Strings present in all 16 locale JSON files, `check-translations.mjs` passes
4. **Testing:** Math module tests + component integration tests + smoke e2e test
5. **SEO:** OG image, page metadata, FAQ structured data
6. **Accessibility:** Keyboard navigation, ARIA labels on interactive elements, color contrast
7. **Performance:** No layout shift, canvas renders without blocking main thread
8. **Mobile:** Responsive layout, usable on tablet at minimum
9. **Code review:** Files under 200 lines, no duplication, shared components reused
10. **Deploy:** Set `prod: 'live'` in tool registry, verify in production, confirm indexing
