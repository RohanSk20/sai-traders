import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/cart', '/search', '/api/*'],
      },
    ],
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  }
}
