/**
 * The site's languages. English is served from the root and every other
 * locale from its own prefix, so an existing English URL never moves (ADR 0045).
 */
export const locales = ['en', 'ja'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/**
 * Set when a reader picks a language. The Vercel redirect that sends visitors
 * in Japan to `/ja/` skips anyone carrying it, so a choice outlives the guess.
 * `vercel.json` names the same cookie.
 */
export const localeCookie = 'm3e-locale'

/** Open Graph `og:locale` values. */
export const ogLocales: Record<Locale, string> = { en: 'en_US', ja: 'ja_JP' }

/** `og:locale` for this page plus `og:locale:alternate` for every other language. */
export function ogLocaleFields(locale: Locale) {
  return {
    locale: ogLocales[locale],
    alternateLocale: locales.filter((each) => each !== locale).map((each) => ogLocales[each]),
  }
}

/** The name of each language, written in that language, for the switcher. */
export const localeNames: Record<Locale, string> = { en: 'English', ja: '日本語' }

/** Prefixes a site-root path for `locale`: `/docs/` becomes `/ja/docs/`. */
export function localizePath(locale: Locale, pathname: string): string {
  if (locale === defaultLocale || !pathname.startsWith('/')) return pathname
  return `/${locale}${pathname}`
}

/** Splits a localized path into its locale and the unprefixed site path. */
export function parseLocalePath(pathname: string): { locale: Locale; path: string } {
  for (const locale of locales) {
    if (locale === defaultLocale) continue
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return { locale, path: pathname.slice(locale.length + 1) || '/' }
    }
  }
  return { locale: defaultLocale, path: pathname }
}

/**
 * `alternates` for page metadata: the canonical URL in `locale`, plus the
 * hreflang set naming every translation of the same page.
 */
export function localeAlternates(locale: Locale, pathname: string) {
  return {
    canonical: localizePath(locale, pathname),
    languages: {
      ...Object.fromEntries(locales.map((each) => [each, localizePath(each, pathname)])),
      'x-default': pathname,
    },
  }
}
