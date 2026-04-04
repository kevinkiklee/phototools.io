import Script from 'next/script'
import { getAdsenseClient } from '@/lib/ads'

export function AdScripts() {
  const client = getAdsenseClient()

  if (!client) return null

  return (
    <Script
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  )
}
