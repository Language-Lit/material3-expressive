import type { MetadataRoute } from 'next'
import { absoluteUrl, getSiteRoutes } from '../content/site'

/**
 * The export publishes forty-one routes and, before this file, advertised none
 * of them. A crawler that reached the home page had to discover the component
 * catalogue by following links through a client-rendered drawer; one that
 * reached a component page directly had no way to learn the other thirty-one
 * existed.
 *
 * `lastModified` is deliberately absent. A static export has no per-route
 * modification date to report, and stamping every URL with the build time would
 * tell crawlers the whole site changed on every deploy — a claim that earns
 * exactly one wasted recrawl before it stops being believed.
 */
export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await getSiteRoutes()

  return routes.map((route) => ({
    url: absoluteUrl(route.path),
    changeFrequency: 'monthly' as const,
    priority: route.priority,
  }))
}
