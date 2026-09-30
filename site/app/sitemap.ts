import type { MetadataRoute } from 'next'
import { absoluteUrl, getSiteRoutes } from '../content/site'
import { lastCommitDate } from '../content/lastmod'
import { defaultLocale, localizePath, locales } from '../i18n/locales'

/**
 * The export publishes forty-one routes and, before this file, advertised none
 * of them. A crawler that reached the home page had to discover the component
 * catalogue by following links through a client-rendered drawer; one that
 * reached a component page directly had no way to learn the other thirty-one
 * existed.
 *
 * `lastModified` comes from the commit date of the repository file each route
 * publishes, never from the build clock. See `content/lastmod.ts` for why a
 * route may carry no date at all, and why that is the correct answer rather
 * than a gap to fill.
 */
export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await getSiteRoutes()

  // Every route in every language, each naming all of its translations.
  const entries = await Promise.all(
    routes.flatMap((route) =>
      locales.map(async (locale) => {
        // A translated document dates from its own commit, not the English one.
        const source =
          locale === defaultLocale || !route.source.startsWith('docs/')
            ? route.source
            : route.source.replace(/^docs\//, `docs/${locale}/`)
        const lastModified = await lastCommitDate(source)

        return {
          url: absoluteUrl(localizePath(locale, route.path)),
          changeFrequency: 'monthly' as const,
          priority: route.priority,
          alternates: {
            languages: Object.fromEntries(
              locales.map((each) => [each, absoluteUrl(localizePath(each, route.path))]),
            ),
          },
          ...(lastModified ? { lastModified } : {}),
        }
      }),
    ),
  )

  return entries
}
