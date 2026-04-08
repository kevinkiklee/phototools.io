# Observability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-grade observability via Sentry (errors), Axiom (logs), and BetterStack (uptime) with structured logging, health endpoint, and alert routing.

**Architecture:** Three external services layered onto the existing analytics stack. Sentry captures client + server errors with context enrichment. A structured server-only logger writes JSON to stdout, picked up by Axiom via Vercel log drain. BetterStack pings a health endpoint and homepage for uptime monitoring. Alert routing: critical (site down) → email + Discord; non-critical (error spikes) → Sentry dashboard.

**Tech Stack:** `@sentry/nextjs`, `server-only`, Vercel log drain → Axiom (zero-code), BetterStack (external)

**Spec:** `docs/superpowers/specs/2026-04-07-observability-design.md`

---

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `src/lib/logger.ts` | Structured server-only logger (JSON in prod, pretty-print in dev) |
| `src/lib/logger.test.ts` | Logger unit tests |
| `src/app/api/health/route.ts` | Health check endpoint for BetterStack |
| `src/app/api/health/route.test.ts` | Health endpoint unit test |
| `sentry.client.config.ts` | Sentry client-side init (DSN, tunnel, sample rates, context enrichment) |
| `sentry.server.config.ts` | Sentry server-side init (DSN, sample rates) |
| `src/instrumentation.ts` | Next.js instrumentation hook — imports Sentry server config, exports `onRequestError` |

### Modified Files
| File | Change |
|------|--------|
| `package.json` | Add `@sentry/nextjs` and `server-only` dependencies |
| `next.config.ts` | Wrap with `withSentryConfig()` for source maps + tunnel |
| `src/proxy.ts` | Add `monitoring` to matcher exclusion (Sentry tunnel route) |
| `src/lib/analytics/components/AnalyticsProvider.tsx` | Replace `AnalyticsErrorBoundary` with `Sentry.ErrorBoundary`, remove `setupGlobalErrorHandlers` |
| `src/app/[locale]/error.tsx` | Add `Sentry.captureException(error)` |
| `src/app/api/contact/route.ts` | Replace `console.*` with structured logger |
| `.env.example` | Add Sentry variable placeholders |
| `src/e2e/smoke/all-pages.spec.ts` | Add Sentry to benign console error filter |
| `test-setup.ts` | Mock `server-only` for Vitest |
| `vitest.config.ts` | Add `server-only` resolve alias |

### Removed Files
| File | Reason |
|------|--------|
| `src/lib/analytics/error-tracking.ts` | Sentry replaces global error handlers |
| `src/lib/analytics/error-tracking.test.ts` | Test for removed file |
| `src/lib/analytics/components/AnalyticsErrorBoundary.tsx` | Replaced by `Sentry.ErrorBoundary` |

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install @sentry/nextjs and server-only**

```bash
cd /Users/iser/workspace/photo-tools
npm install @sentry/nextjs server-only
```

Expected: packages added to `dependencies` in `package.json`, `node_modules` updated.

- [ ] **Step 2: Verify installation**

```bash
cd /Users/iser/workspace/photo-tools
node -e "require('@sentry/nextjs'); console.log('sentry OK')"
node -e "require('server-only'); console.log('server-only OK')"
```

Expected: both print OK without errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/iser/workspace/photo-tools
git add package.json package-lock.json
git commit -m "chore: install @sentry/nextjs and server-only"
```

---

## Task 2: Structured Logger (TDD)

**Files:**
- Create: `src/lib/logger.ts`
- Create: `src/lib/logger.test.ts`
- Modify: `test-setup.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Add server-only mock to test infrastructure**

The logger uses `import 'server-only'` which throws in non-server environments. Vitest runs in jsdom, so we need to resolve it to an empty module.

Add to `vitest.config.ts` — add `'server-only'` to the resolve aliases:

```typescript
resolve: {
  alias: {
    '@': new URL('./src/', import.meta.url).pathname,
    'server-only': new URL('./test-setup-server-only.ts', import.meta.url).pathname,
  },
},
```

Create `test-setup-server-only.ts` in the project root (empty file — the import just needs to not throw):

```typescript
// Vitest mock for 'server-only' package — allows testing server-only modules in jsdom
export {}
```

- [ ] **Step 2: Write failing tests for the logger**

Create `src/lib/logger.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from './logger'

describe('logger', () => {
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    process.env.NODE_ENV = originalEnv
    delete process.env.VERCEL_ENV
  })

  describe('production mode (JSON output)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
    })

    it('outputs valid JSON for info level', () => {
      logger.info('health', 'OK')
      expect(console.log).toHaveBeenCalledOnce()
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed.level).toBe('info')
      expect(parsed.module).toBe('health')
      expect(parsed.message).toBe('OK')
      expect(parsed.timestamp).toBeDefined()
    })

    it('outputs valid JSON for warn level', () => {
      logger.warn('contact', 'Rate limited', { ip: '1.2.3.4' })
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed.level).toBe('warn')
      expect(parsed.module).toBe('contact')
      expect(parsed.ip).toBe('1.2.3.4')
    })

    it('outputs valid JSON for error level', () => {
      logger.error('contact', 'Send failed', { ip: '1.2.3.4' })
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed.level).toBe('error')
    })

    it('extracts Error objects into message and stack', () => {
      const err = new Error('timeout')
      logger.error('contact', 'API failed', { error: err })
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed.error).toBe('timeout')
      expect(parsed.stack).toContain('Error: timeout')
    })

    it('includes env from VERCEL_ENV', () => {
      process.env.VERCEL_ENV = 'production'
      logger.info('health', 'OK')
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed.env).toBe('production')
    })

    it('includes extra metadata fields', () => {
      logger.info('contact', 'Sent', { subject: 'Test', requestId: 'abc123' })
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const parsed = JSON.parse(output)
      expect(parsed.subject).toBe('Test')
      expect(parsed.requestId).toBe('abc123')
    })
  })

  describe('development mode (pretty-print)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('outputs human-readable format', () => {
      logger.info('health', 'OK')
      expect(console.log).toHaveBeenCalledOnce()
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(output).toContain('[INFO]')
      expect(output).toContain('health')
      expect(output).toContain('OK')
    })

    it('includes metadata in pretty-print', () => {
      logger.warn('contact', 'Rate limited', { ip: '1.2.3.4' })
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(output).toContain('[WARN]')
      expect(output).toContain('1.2.3.4')
    })

    it('does not output JSON in development', () => {
      logger.info('health', 'OK')
      const output = (console.log as ReturnType<typeof vi.fn>).mock.calls[0][0]
      // Should not be parseable as JSON with a "level" field
      try {
        const parsed = JSON.parse(output)
        expect(parsed.level).toBeUndefined()
      } catch {
        // Not JSON at all — correct behavior
      }
    })
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd /Users/iser/workspace/photo-tools
npx vitest run src/lib/logger.test.ts
```

Expected: FAIL — `./logger` module does not exist yet.

- [ ] **Step 4: Implement the logger**

Create `src/lib/logger.ts`:

```typescript
import 'server-only'

type LogLevel = 'info' | 'warn' | 'error'

function serializeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (value instanceof Error) {
      result[key] = value.message
      if (value.stack) result.stack = value.stack
    } else {
      result[key] = value
    }
  }
  return result
}

function log(level: LogLevel, module: string, message: string, metadata?: Record<string, unknown>): void {
  const serialized = metadata ? serializeMetadata(metadata) : {}

  if (process.env.NODE_ENV !== 'production') {
    const label = level.toUpperCase()
    const meta = metadata ? ` ${JSON.stringify(serialized)}` : ''
    console.log(`[${label}] ${module}: ${message}${meta}`)
    return
  }

  const entry = {
    level,
    module,
    message,
    timestamp: new Date().toISOString(),
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    ...serialized,
  }
  console.log(JSON.stringify(entry))
}

export const logger = {
  info: (module: string, message: string, metadata?: Record<string, unknown>) =>
    log('info', module, message, metadata),
  warn: (module: string, message: string, metadata?: Record<string, unknown>) =>
    log('warn', module, message, metadata),
  error: (module: string, message: string, metadata?: Record<string, unknown>) =>
    log('error', module, message, metadata),
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /Users/iser/workspace/photo-tools
npx vitest run src/lib/logger.test.ts
```

Expected: all 9 tests PASS.

- [ ] **Step 6: Run full test suite to verify no regressions**

```bash
cd /Users/iser/workspace/photo-tools
npm test
```

Expected: all existing tests still pass (the `server-only` alias doesn't break anything).

- [ ] **Step 7: Commit**

```bash
cd /Users/iser/workspace/photo-tools
git add test-setup-server-only.ts vitest.config.ts src/lib/logger.ts src/lib/logger.test.ts
git commit -m "feat(observability): add structured server-only logger with TDD"
```

---

## Task 3: Health Check Endpoint (TDD)

**Files:**
- Create: `src/app/api/health/route.ts`
- Create: `src/app/api/health/route.test.ts`

- [ ] **Step 1: Write failing test for health endpoint**

Create `src/app/api/health/route.test.ts`:

```typescript
import { describe, it, expect, afterEach } from 'vitest'
import { GET } from './route'

describe('/api/health', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('returns 200 with status ok', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.status).toBe('ok')
  })

  it('includes timestamp in ISO format', async () => {
    const response = await GET()
    const body = await response.json()
    expect(body.timestamp).toBeDefined()
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
  })

  it('includes version from VERCEL_GIT_COMMIT_SHA', async () => {
    process.env.VERCEL_GIT_COMMIT_SHA = 'abc123f'
    const response = await GET()
    const body = await response.json()
    expect(body.version).toBe('abc123f')
  })

  it('includes env from VERCEL_ENV', async () => {
    process.env.VERCEL_ENV = 'production'
    const response = await GET()
    const body = await response.json()
    expect(body.env).toBe('production')
  })

  it('defaults version to unknown when env var is missing', async () => {
    delete process.env.VERCEL_GIT_COMMIT_SHA
    const response = await GET()
    const body = await response.json()
    expect(body.version).toBe('unknown')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/iser/workspace/photo-tools
npx vitest run src/app/api/health/route.test.ts
```

Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement health endpoint**

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/iser/workspace/photo-tools
npx vitest run src/app/api/health/route.test.ts
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/iser/workspace/photo-tools
git add src/app/api/health/route.ts src/app/api/health/route.test.ts
git commit -m "feat(observability): add /api/health endpoint with TDD"
```

---

## Task 4: Sentry Configuration Files

**Files:**
- Create: `sentry.client.config.ts` (project root)
- Create: `sentry.server.config.ts` (project root)
- Create: `src/instrumentation.ts`

- [ ] **Step 1: Create Sentry client config**

Create `sentry.client.config.ts` in the project root:

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Capture all errors (5K/month free tier)
  sampleRate: 1.0,

  // Performance: 10% in production, 1% in preview
  tracesSampleRate:
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 0.1 : 0.01,

  // Session replay disabled — PostHog covers this (5K/month free)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
})

// Instrument App Router navigations
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
```

- [ ] **Step 2: Create Sentry server config**

Create `sentry.server.config.ts` in the project root:

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Capture all errors
  sampleRate: 1.0,

  // Performance: 10% in production, 1% in preview
  tracesSampleRate:
    process.env.VERCEL_ENV === 'production' ? 0.1 : 0.01,
})
```

- [ ] **Step 3: Create instrumentation hook**

Create `src/instrumentation.ts`:

```typescript
import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.server.config')
  }
}

export const onRequestError = Sentry.captureRequestError
```

- [ ] **Step 4: Commit**

```bash
cd /Users/iser/workspace/photo-tools
git add sentry.client.config.ts sentry.server.config.ts src/instrumentation.ts
git commit -m "feat(observability): add Sentry client, server, and instrumentation configs"
```

---

## Task 5: Integrate Sentry into Next.js Config

**Files:**
- Modify: `next.config.ts`
- Modify: `src/proxy.ts`

- [ ] **Step 1: Wrap next.config.ts with withSentryConfig**

Update `next.config.ts`. The existing export `export default withBundleAnalyzer(withNextIntl(nextConfig))` becomes wrapped with `withSentryConfig`. Add the import and wrap the outermost layer:

Replace the import section and export in `next.config.ts`:

```typescript
import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'
import createNextIntlPlugin from 'next-intl/plugin'
import bundleAnalyzer from '@next/bundle-analyzer'
import { staticRedirects } from './src/lib/i18n/redirects'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

const nextConfig: NextConfig = {
  // ... existing config stays exactly the same ...
}

export default withSentryConfig(withBundleAnalyzer(withNextIntl(nextConfig)), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Route browser Sentry events through our server (bypasses ad blockers)
  tunnelRoute: '/monitoring',

  // Suppress source map upload logs except in CI
  silent: !process.env.CI,

  // Don't serve source maps to browsers
  hideSourceMaps: true,

  // Widen file upload for better stack traces
  widenClientFileUpload: true,
})
```

- [ ] **Step 2: Update proxy matcher to exclude tunnel route**

The Sentry tunnel at `/monitoring` must not be intercepted by the i18n proxy. Update the matcher in `src/proxy.ts`:

Change line 21 from:

```typescript
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
```

to:

```typescript
  matcher: '/((?!api|trpc|monitoring|_next|_vercel|.*\\..*).*)',
```

- [ ] **Step 3: Verify build works**

```bash
cd /Users/iser/workspace/photo-tools
npm run build 2>&1 | tail -20
```

Expected: build succeeds. Sentry source map upload will be skipped (no auth token locally) — this is expected.

- [ ] **Step 4: Commit**

```bash
cd /Users/iser/workspace/photo-tools
git add next.config.ts src/proxy.ts
git commit -m "feat(observability): integrate Sentry into Next.js config with tunnel route"
```

---

## Task 6: Replace Error Boundary and Remove Legacy Error Tracking

**Files:**
- Modify: `src/lib/analytics/components/AnalyticsProvider.tsx`
- Modify: `src/app/[locale]/error.tsx`
- Delete: `src/lib/analytics/error-tracking.ts`
- Delete: `src/lib/analytics/error-tracking.test.ts`
- Delete: `src/lib/analytics/components/AnalyticsErrorBoundary.tsx`

- [ ] **Step 1: Update AnalyticsProvider.tsx**

Three changes to `src/lib/analytics/components/AnalyticsProvider.tsx`:

**a) Replace imports** — remove `AnalyticsErrorBoundary` and `setupGlobalErrorHandlers`, add Sentry:

Remove these two import lines:

```typescript
import { setupGlobalErrorHandlers } from '../error-tracking'
import { AnalyticsErrorBoundary } from './AnalyticsErrorBoundary'
```

Add this import:

```typescript
import * as Sentry from '@sentry/nextjs'
```

**b) Remove the `setupGlobalErrorHandlers` call** — in the `useEffect` that runs on `enabled`, remove:

```typescript
    const cleanupErrors = setupGlobalErrorHandlers(dispatch)
```

And in the cleanup return, change:

```typescript
    return () => {
      cleanupErrors()
      cleanupConsent()
    }
```

to:

```typescript
    return () => {
      cleanupConsent()
    }
```

**c) Add Sentry context enrichment** — in the `useEffect` that calls `setGlobalProperties(props)` (around line 119-131), add a `Sentry.setContext` call right after `setGlobalProperties(props)`:

```typescript
    setGlobalProperties(props)
    Sentry.setContext('phototools', {
      tool_slug: toolSlug,
      tool_category: tool?.category || null,
      locale,
      viewport_type: getViewportType(),
    })
```

This ensures every Sentry error includes tool/locale/viewport context. The context updates on every route change (same as analytics global properties).

**d) Replace error boundary in JSX** — change the return at the bottom from:

```tsx
    <AnalyticsErrorBoundary>
      {children}
      <SpeedInsights />
      <Analytics />
      {/* ... scripts ... */}
    </AnalyticsErrorBoundary>
```

to:

```tsx
    <Sentry.ErrorBoundary fallback={<>{children}</>}>
      {children}
      <SpeedInsights />
      <Analytics />
      {/* ... scripts ... */}
    </Sentry.ErrorBoundary>
```

- [ ] **Step 2: Update error.tsx to capture with Sentry**

In `src/app/[locale]/error.tsx`, add the Sentry import and replace the console.error with `Sentry.captureException`:

```tsx
'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-primary, #e0e0e0)' }}>
      <h2>Something went wrong</h2>
      <p style={{ color: 'var(--text-secondary, #999)', marginBottom: '1rem' }}>
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        style={{
          padding: '0.5rem 1.5rem',
          background: 'var(--accent, #3b82f6)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        Try again
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Delete legacy error tracking files**

```bash
cd /Users/iser/workspace/photo-tools
rm src/lib/analytics/error-tracking.ts
rm src/lib/analytics/error-tracking.test.ts
rm src/lib/analytics/components/AnalyticsErrorBoundary.tsx
```

- [ ] **Step 4: Run tests to verify no regressions**

```bash
cd /Users/iser/workspace/photo-tools
npm test
```

Expected: all tests pass. The deleted `error-tracking.test.ts` is gone, so its 7 tests are no longer counted. No other test imports from `error-tracking.ts` or `AnalyticsErrorBoundary.tsx`.

- [ ] **Step 5: Commit**

```bash
cd /Users/iser/workspace/photo-tools
git add -A src/lib/analytics/error-tracking.ts src/lib/analytics/error-tracking.test.ts src/lib/analytics/components/AnalyticsErrorBoundary.tsx src/lib/analytics/components/AnalyticsProvider.tsx src/app/[locale]/error.tsx
git commit -m "feat(observability): replace PostHog error tracking with Sentry

- Remove error-tracking.ts (global handlers) — Sentry handles this
- Remove AnalyticsErrorBoundary — replaced by Sentry.ErrorBoundary
- Add Sentry.captureException to error.tsx
- Keep trackJsError/trackWebGLError in index.ts for PostHog dashboards"
```

---

## Task 7: Migrate Contact Route to Structured Logger

**Files:**
- Modify: `src/app/api/contact/route.ts`

- [ ] **Step 1: Replace console calls with logger**

In `src/app/api/contact/route.ts`, add the logger import at the top (after existing imports):

```typescript
import { logger } from '@/lib/logger'
```

Then replace the three `console.*` calls:

**Line 65** — replace:
```typescript
    console.info('[contact] honeypot triggered', { ip: getRateLimitKey(request) })
```
with:
```typescript
    logger.info('contact', 'Honeypot triggered', { ip: getRateLimitKey(request) })
```

**Line 71** — replace:
```typescript
    console.warn('[contact] rate limited', { ip })
```
with:
```typescript
    logger.warn('contact', 'Rate limited', { ip })
```

**Line 114** — replace:
```typescript
    console.info('[contact] sent', { ip, subject: subject.slice(0, 50) })
```
with:
```typescript
    logger.info('contact', 'Email sent', { ip, subject: subject.slice(0, 50) })
```

**Line 117** — replace:
```typescript
    console.error('[contact] send failed', { ip, error: err instanceof Error ? err.message : 'unknown' })
```
with:
```typescript
    logger.error('contact', 'Send failed', { ip, error: err instanceof Error ? err : String(err) })
```

- [ ] **Step 2: Run tests**

```bash
cd /Users/iser/workspace/photo-tools
npm test
```

Expected: all tests pass. The contact route doesn't have unit tests that check console output, so this is a safe refactor.

- [ ] **Step 3: Commit**

```bash
cd /Users/iser/workspace/photo-tools
git add src/app/api/contact/route.ts
git commit -m "refactor(contact): migrate console calls to structured logger"
```

---

## Task 8: Update .env.example

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Add Sentry environment variable placeholders**

Append to `.env.example`:

```
# Sentry error tracking — required for production
# DSN is safe to expose publicly (scoped to ingest, not read)
NEXT_PUBLIC_SENTRY_DSN=

# Sentry source map upload — build-time only, never reaches client
# Generate at https://sentry.io/settings/auth-tokens/
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

- [ ] **Step 2: Commit**

```bash
cd /Users/iser/workspace/photo-tools
git add .env.example
git commit -m "docs: add Sentry env var placeholders to .env.example"
```

---

## Task 9: Update E2E Smoke Tests

**Files:**
- Modify: `src/e2e/smoke/all-pages.spec.ts`

- [ ] **Step 1: Add Sentry to benign console error filter**

In `src/e2e/smoke/all-pages.spec.ts`, in the `realErrors` filter (around line 29), add Sentry-related patterns. Add these lines after the existing `!e.includes('facebook.com')` line:

```typescript
          !e.includes('sentry') &&
          !e.includes('monitoring') &&
```

The full filter block becomes:

```typescript
      const realErrors = consoleErrors.filter(
        (e) =>
          !e.includes('favicon') &&
          !e.includes('the server responded with a status of 404') &&
          !e.includes('cookieyes') &&
          !e.includes('adsense') &&
          !e.includes('adsbygoogle') &&
          !e.includes('_vercel/speed-insights') &&
          !e.includes('posthog') &&
          !e.includes('eu.i.posthog.com') &&
          !e.includes('eu-assets.i.posthog.com') &&
          !e.includes('/phog/') &&
          !e.includes('connect.facebook.net') &&
          !e.includes('fbevents.js') &&
          !e.includes('facebook.com') &&
          !e.includes('sentry') &&
          !e.includes('monitoring')
      )
```

- [ ] **Step 2: Commit**

```bash
cd /Users/iser/workspace/photo-tools
git add src/e2e/smoke/all-pages.spec.ts
git commit -m "test(e2e): add Sentry to benign console error filter"
```

---

## Task 10: Final Verification and CLAUDE.md Update

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Run full test suite**

```bash
cd /Users/iser/workspace/photo-tools
npm test
```

Expected: all tests pass. Count the tests — should be approximately 717+ (724 original minus 7 from deleted error-tracking.test.ts, plus ~14 new from logger + health tests).

- [ ] **Step 2: Run build**

```bash
cd /Users/iser/workspace/photo-tools
npm run build 2>&1 | tail -30
```

Expected: build succeeds. Sentry source map upload will be skipped (no auth token) — expected for local builds.

- [ ] **Step 3: Run lint**

```bash
cd /Users/iser/workspace/photo-tools
npm run lint
```

Expected: no lint errors from new files.

- [ ] **Step 4: Update CLAUDE.md test counts**

Update the test count references in `CLAUDE.md`:

Find the line `- `npm test` — run Vitest tests (724 tests across 44 files)` and update with the actual numbers from Step 1.

Find `- **44 test files, 724 tests**` and update similarly.

- [ ] **Step 5: Add observability section to CLAUDE.md**

Add a new section after the existing "Advertising" section:

```markdown
## Observability

Three external services provide production monitoring:

- **Sentry** (`@sentry/nextjs`) — client + server error tracking, performance tracing. Config: `sentry.client.config.ts`, `sentry.server.config.ts`, `src/instrumentation.ts`. Tunnel via `/monitoring` route (bypasses ad blockers). Source maps uploaded at build time via `withSentryConfig()`.
- **Axiom** — log aggregation via Vercel Marketplace log drain (zero code). Receives structured JSON from `src/lib/logger.ts` (server-only). 10-day retention on free tier.
- **BetterStack** — uptime monitoring. Pings `/api/health` and homepage every 3 minutes. Critical alerts → email + Discord.

**Structured Logger** (`src/lib/logger.ts`): server-only, `import 'server-only'` enforced. Three levels: `info`, `warn`, `error`. Required `module` param for Axiom filtering. JSON in production, pretty-print in development. See `src/lib/logger.test.ts` for usage patterns.

**Environment variables** (Vercel, Production + Preview only): `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`.
```

- [ ] **Step 6: Commit**

```bash
cd /Users/iser/workspace/photo-tools
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with observability section and test counts"
```

---

## Task 11: External Service Setup (Manual — Not Code)

These steps happen outside the codebase, in browser dashboards. No code changes.

- [ ] **Step 1: Create Sentry project**

1. Go to https://sentry.io and create a free account (or log in)
2. Create a new project: Platform = Next.js, name = `phototools`
3. Copy the DSN from the project settings
4. Generate an auth token at Settings → Auth Tokens
5. In Vercel dashboard → Project Settings → Environment Variables, add:
   - `NEXT_PUBLIC_SENTRY_DSN` = (DSN from step 3) — Production + Preview
   - `SENTRY_AUTH_TOKEN` = (token from step 4) — Production + Preview
   - `SENTRY_ORG` = (your org slug) — Production + Preview
   - `SENTRY_PROJECT` = `phototools` — Production + Preview
6. Set up alert rules in Sentry:
   - "First new issue" → email notification
   - "Error spike > 10 in 5 min" → email notification
   - Weekly digest → email

- [ ] **Step 2: Set up Axiom via Vercel Marketplace**

1. In Vercel dashboard → Marketplace → search "Axiom" → Install
2. Axiom auto-creates a log drain — all function logs stream automatically
3. Verify: deploy and hit `www.phototools.io/api/health`, check Axiom for the log entry
4. Create two dashboards in Axiom UI:
   - **API Health**: request volume, error rate, P50/P95 duration (filter: `VERCEL_ENV=production`)
   - **Server Overview**: log volume by level, errors by module, top error messages (filter: `VERCEL_ENV=production`)

- [ ] **Step 3: Set up BetterStack**

1. Go to https://betterstack.com and create a free account
2. Create three monitors:
   - `www.phototools.io/api/health` — HTTP, 3-min interval
   - `www.phototools.io` — HTTP, 3-min interval
   - `www.phototools.io` — keyword check (use text from homepage hero heading)
3. Set response time alert threshold: 5 seconds on health endpoint
4. Configure alert contacts: email + Discord webhook

- [ ] **Step 4: Set up Discord webhook**

1. In your Discord server, create `#phototools-alerts` channel
2. Channel Settings → Integrations → Webhooks → New Webhook
3. Name: "PhotoTools Alerts", copy URL
4. Paste URL into BetterStack alerting settings

- [ ] **Step 5: Verify end-to-end**

1. Deploy to Vercel preview
2. Open the preview URL — check Sentry for any initialization events
3. Open browser console and run `throw new Error('Sentry test')` — verify it appears in Sentry within 30 seconds
4. Check Axiom for the deploy's function logs
5. Confirm BetterStack shows all 3 monitors as "Up"
