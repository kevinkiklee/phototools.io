export type AdFormat = 'rectangle' | 'leaderboard' | 'mobile-banner'

export const AD_FORMATS: Record<AdFormat, { width: number; height: number }> = {
  rectangle: { width: 300, height: 250 },
  leaderboard: { width: 728, height: 90 },
  'mobile-banner': { width: 320, height: 50 },
}

export function getAdsenseClient(): string | undefined {
  return process.env.NEXT_PUBLIC_ADSENSE_CLIENT
}

export function getCookieyesId(): string | undefined {
  return process.env.NEXT_PUBLIC_COOKIEYES_ID
}

export function isAdsEnabled(): boolean {
  return Boolean(getAdsenseClient()) && Boolean(getCookieyesId())
}
