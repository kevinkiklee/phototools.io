import { MetadataRoute } from 'next'
import { getLiveTools } from '@/lib/data/tools'
import { locales, defaultLocale } from '@/lib/i18n/routing'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.phototools.io'

  const staticPaths = [
    { path: '', changeFrequency: 'weekly' as const, priority: 1 },
    { path: '/learn/glossary', changeFrequency: 'monthly' as const, priority: 0.8 },
  ]

  const tools = getLiveTools()
  const toolPaths = tools.map((tool) => ({
    path: `/${tool.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  const allPaths = [...staticPaths, ...toolPaths]

  return allPaths.flatMap(({ path, changeFrequency, priority }) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries([
          ...locales.map((l) => [l, `${baseUrl}/${l}${path}`]),
          ['x-default', `${baseUrl}/${defaultLocale}${path}`],
        ]),
      },
    }))
  )
}
