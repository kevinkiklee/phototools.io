'use client'

import { usePathname } from '@/lib/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { getToolBySlug } from '@/lib/data/tools'
import { getFaqsBySlug } from '@/lib/data/faq'

export function JsonLd() {
  const pathname = usePathname()
  const locale = useLocale()
  const toolsT = useTranslations('tools')
  const catT = useTranslations('common.nav.categories')
  const toolUIT = useTranslations('toolUI')
  const breadcrumbT = useTranslations('common.breadcrumb')

  if (!pathname) return null

  {
    const slug = pathname.slice(1) // remove leading /
    if (!slug || slug.includes('/')) return null
    const tool = getToolBySlug(slug)

    if (tool) {
      const translatedName = toolsT(`${slug}.name`)
      const translatedDesc = toolsT(`${slug}.description`)

      const softwareApp = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: translatedName,
        description: translatedDesc,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        inLanguage: locale,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        url: `https://www.phototools.io/${locale}/${tool.slug}`,
      }

      const breadcrumbs = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        inLanguage: locale,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: breadcrumbT('home'),
            item: `https://www.phototools.io/${locale}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: catT(tool.category),
            item: `https://www.phototools.io/${locale}#${tool.category}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: translatedName,
            item: `https://www.phototools.io/${locale}/${tool.slug}`,
          },
        ],
      }

      const faqs = getFaqsBySlug(slug)
      const faqJsonLd = faqs && faqs.questions.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        inLanguage: locale,
        mainEntity: faqs.questions.map((q) => ({
          '@type': 'Question',
          name: toolUIT(`${slug}.faq.${q.id}.question`),
          acceptedAnswer: {
            '@type': 'Answer',
            text: toolUIT(`${slug}.faq.${q.id}.answer`),
          },
        })),
      } : null

      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
          />
          {faqJsonLd && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
          )}
        </>
      )
    }
  }

  return null
}
