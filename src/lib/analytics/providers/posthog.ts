import posthog from 'posthog-js'

let initialized = false

export function initPostHog(): void {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
  if (!key || !host) return

  posthog.init(key, {
    api_host: host,
    persistence: 'memory',
    autocapture: true,
    capture_pageview: false,
    capture_pageleave: true,
    disable_session_recording: true,
    mask_all_element_attributes: false,
    session_recording: {
      maskAllInputs: false,
    },
  })
  initialized = true
}

export function trackPostHog(eventName: string, properties: Record<string, unknown>): void {
  if (!initialized) return
  posthog.capture(eventName, properties)
}

export function upgradePostHog(): void {
  if (!initialized) return
  posthog.opt_in_capturing()
  posthog.set_config({ persistence: 'localStorage+cookie' })
  posthog.startSessionRecording()
}

export function downgradePostHog(): void {
  if (!initialized) return
  posthog.opt_out_capturing()
  posthog.stopSessionRecording()
}

export function getPostHogInstance() {
  return initialized ? posthog : null
}

export function resetPostHog(): void {
  initialized = false
}
