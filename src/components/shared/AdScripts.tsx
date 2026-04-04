import Script from 'next/script'
import { getAdsenseClient, getCookieyesId, isAdsEnabled } from '@/lib/ads'

export function AdScripts() {
  const client = getAdsenseClient()
  const cookieyesId = getCookieyesId()
  const consentEnabled = isAdsEnabled()

  // AdSense script loads when publisher ID is set (needed for verification + serving)
  if (!client) return null

  return (
    <>
      {/* Consent Mode + CookieYes only load when both env vars are set */}
      {consentEnabled && (
        <>
          <Script id="consent-mode-defaults" strategy="beforeInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});gtag('set','ads_data_redaction',true);`}
          </Script>
          <Script
            id="cookieyes"
            src={`https://cdn-cookieyes.com/client_data/${cookieyesId}/script.js`}
            strategy="beforeInteractive"
          />
        </>
      )}

      {/* Google AdSense — loads when publisher ID is set */}
      <Script
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
    </>
  )
}
