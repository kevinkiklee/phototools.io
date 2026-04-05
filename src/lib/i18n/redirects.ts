import type { Redirect } from 'next/dist/lib/load-custom-routes'

/**
 * Static redirects — consumed by next.config.ts `redirects()`.
 * Dynamic locale routing is handled by middleware (src/middleware.ts).
 */
export const staticRedirects: Redirect[] = [
  // Legacy /tools/* URLs → root-level (middleware will then add locale prefix)
  {
    source: '/tools/:slug',
    destination: '/:slug',
    permanent: true,
  },
  // Old domain redirect
  {
    source: '/',
    has: [{ type: 'host', value: 'fov-viewer.iser.io' }],
    destination: 'https://www.phototools.io/fov-simulator',
    permanent: true,
  },
  {
    source: '/:path*',
    has: [{ type: 'host', value: 'fov-viewer.iser.io' }],
    destination: 'https://www.phototools.io/fov-simulator',
    permanent: true,
  },
]
