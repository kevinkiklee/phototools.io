declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const GA4_VALUE_LIMIT = 100

function truncateValues(props: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string' && value.length > GA4_VALUE_LIMIT) {
      result[key] = value.slice(0, GA4_VALUE_LIMIT)
    } else {
      result[key] = value
    }
  }
  return result
}

export function trackGA4(eventName: string, properties: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', eventName, truncateValues(properties))
}

export function updateGA4Consent(category: 'analytics' | 'marketing', granted: boolean): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  const value = granted ? 'granted' : 'denied'
  if (category === 'analytics') {
    window.gtag('consent', 'update', { analytics_storage: value })
  } else {
    window.gtag('consent', 'update', {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
    })
  }
}

export function trackGA4PageView(pagePath: string, pageTitle: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', { page_path: pagePath, page_title: pageTitle })
}
