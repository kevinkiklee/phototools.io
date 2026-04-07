declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

type ToolInteractionEvent = {
  tool_slug: string
  action: string
  label?: string
}

type LearnPanelEvent = {
  tool_slug: string
}

type ChallengeCompleteEvent = {
  tool_slug: string
  challenge_id: string
  difficulty: string
  correct: boolean
}

export function trackToolInteraction(data: ToolInteractionEvent): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'tool_interaction', data)
  }
}

export function trackLearnPanelOpen(data: LearnPanelEvent): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'learn_panel_open', data)
  }
}

export function trackChallengeComplete(data: ChallengeCompleteEvent): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'challenge_complete', data)
  }
}
