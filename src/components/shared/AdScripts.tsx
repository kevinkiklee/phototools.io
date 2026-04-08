// Loads the Google AdSense library globally. Rendered in layout.tsx <body>.
// The library auto-discovers <ins class="adsbygoogle"> elements on the page
// and fills them after each AdUnit pushes to window.adsbygoogle.
//
// Uses a native React 19 <script async> element rather than next/script so
// the tag ships with no extra attributes. AdSense's validator logs a console
// warning when it sees <script data-nscript="afterInteractive" ...> (which is
// what next/script injects) because its allowed-attribute list is narrow.
// React 19 auto-hoists <script async src> to <head> and de-duplicates it.

import { getAdsenseClient } from '@/lib/ads'

export function AdScripts() {
  const client = getAdsenseClient()

  if (!client) return null

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
    />
  )
}
