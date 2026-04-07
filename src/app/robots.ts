import { type MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/phog/',
    },
    sitemap: 'https://www.phototools.io/sitemap.xml',
  }
}
