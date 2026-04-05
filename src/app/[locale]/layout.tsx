import type { Metadata } from 'next'
import { ViewTransition } from 'react'
import Script from 'next/script'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale, getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { JsonLd } from '@/components/shared/JsonLd'
import { AdScripts } from '@/components/shared/AdScripts'
import { routing, localeOpenGraph } from '@/lib/i18n/routing'
import type { Locale } from '@/lib/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata.site' })
  const description = t('description')
  const ogTitle = t('ogTitle')
  const ogLocale = localeOpenGraph[locale as Locale] || 'en_US'
  return {
    metadataBase: new URL('https://www.phototools.io'),
    title: { default: t('defaultTitle'), template: t('titleTemplate') },
    description,
    openGraph: {
      title: ogTitle,
      description,
      url: `https://www.phototools.io/${locale}`,
      siteName: 'PhotoTools',
      locale: ogLocale,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description },
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}`])
      ),
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  const siteT = await getTranslations({ locale, namespace: 'metadata.site' })
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PhotoTools',
    url: 'https://www.phototools.io',
    description: siteT('description'),
  }

  return (
    <>
      <AdScripts />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NextIntlClientProvider messages={messages}>
        <JsonLd />
        <ThemeProvider>
          <ViewTransition>
            {children}
          </ViewTransition>
        </ThemeProvider>
      </NextIntlClientProvider>

      <SpeedInsights />
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-B0QND42GRG"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-B0QND42GRG');`}
      </Script>
    </>
  )
}
