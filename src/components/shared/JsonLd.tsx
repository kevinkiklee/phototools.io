'use client'

import { usePathname } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { getToolBySlug } from '@/lib/data/tools'

export function JsonLd() {
  const pathname = usePathname()
  const toolsT = useTranslations('tools')
  const catT = useTranslations('common.nav.categories')

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
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        url: `https://www.phototools.io/${tool.slug}`,
      }

      const breadcrumbs = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.phototools.io',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: catT(tool.category),
            item: `https://www.phototools.io/#${tool.category}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: translatedName,
            item: `https://www.phototools.io/${tool.slug}`,
          },
        ],
      }

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
        </>
      )
    }
  }

  return null
}
