import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Roboto_Flex } from 'next/font/google'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { SiteProviders } from '../app/providers'
import { SiteBar } from '../ui/SiteBar'
import { buildSearchIndex } from '../content/search'
import { buildNavigationGroups } from '../content/navigation'
import { repoRoot } from '../content/paths'
import { StructuredData } from '../ui/StructuredData'
import { localeAlternates, localizePath, ogLocaleFields, type Locale } from '../i18n/locales'
import { shellMessages } from '../i18n/messages/shell'
import {
  absoluteUrl,
  npmUrl,
  packageName,
  repositoryUrl,
  siteUrl,
  socialImage,
} from '../content/site'

// The library's complete stylesheet, imported once through its public entry —
// exactly the line the getting-started guide tells consumers to write.
import '@language-lit/material3-expressive/styles.css'
import '../app/globals.css'

/*
 * The library ships no fonts by design. The typeface tokens name Roboto without
 * providing it, so the site self-hosts it here; the Material Symbols subset is
 * declared in globals.css from a font this repository vendors. Neither costs
 * the published site a third-party request at runtime.
 *
 * `wdth` is requested explicitly because the default is to ship weight only.
 * Every typescale role the library emits carries a `wdth` value in its
 * `font-variation-settings`, and against a weight-only font it is inert — a
 * measurable one, too: `wdth 25` and `wdth 151` rendered at identical widths
 * before this line existed. Asking for the axis is what lets the site set an
 * expressive display voice out of the family the tokens already name, instead
 * of importing a second typeface the design system never calls for.
 *
 * `opsz` and `GRAD` are deliberately not requested. The latin subset measures
 * 34kB at weight only, 60kB with `wdth`, 196kB once `opsz` joins it, and 241kB
 * with `GRAD` as well. `GRAD` buys nothing at any price — every role in the
 * scale sets it to 0 — and 136kB of optical sizing is not a trade this site
 * should make while claiming a 50kB bundle two screens further down. The 25kB
 * that buys the width axis is the one that carries the design.
 */
const roboto = Roboto_Flex({
  subsets: ['latin'],
  display: 'swap',
  axes: ['wdth'],
  variable: '--site-font-sans',
})

export function rootMetadata(locale: Locale): Metadata {
  const t = shellMessages[locale]
  return {
  metadataBase: new URL(siteUrl),
  title: {
    default: t.siteName,
    template: t.titleTemplate,
  },
  description: t.siteDescription,
  applicationName: t.siteName,
  authors: [{ name: 'Romullo Queiroz', url: repositoryUrl }],
  creator: 'Romullo Queiroz',
  keywords: [
    'Material 3 Expressive',
    'Material Design 3',
    'React component library',
    'design system',
    'M3 Expressive React',
    packageName,
    'design tokens',
    'theming',
    'accessible components',
  ],
  // The export is one canonical host, so every route names itself. Without
  // this, a page reached through a preview deployment or a trailing-slash
  // variant has nothing pointing back at the URL that should be indexed.
  alternates: localeAlternates(locale, '/'),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    url: absoluteUrl(localizePath(locale, '/')),
    siteName: t.siteName,
    title: t.siteName,
    description: t.siteDescription,
    ...ogLocaleFields(locale),
    // Named explicitly: the generated card lives beside the route groups,
    // outside either root layout, so it is not inherited.
    images: [socialImage],
  },
  // Only the card type. An explicit title or description here is inherited by
  // every page and stops Next from filling them in from the page's own Open
  // Graph fields, so each page would preview under the home page's title.
  twitter: {
    card: 'summary_large_image',
  },
  // Search Console and Bing Webmaster Tools each prove ownership by reading a
  // token out of the home page. Both come from the environment: a token is
  // account state rather than source, rotating one should not be a commit, and
  // an unset variable emits no tag at all — an empty `content` is a tag both
  // validators reject, which reads as a broken site rather than an unclaimed
  // one. `output: 'export'` resolves these at build time, so a token added in
  // the Vercel project settings takes effect on the next deploy.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
  }
}

async function getVersion(): Promise<string> {
  const packageJson = JSON.parse(
    await readFile(path.join(repoRoot, 'package.json'), 'utf8'),
  )
  return packageJson.version as string
}

export default async function RootLayout({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = shellMessages[locale]
  const [version, index, groups] = await Promise.all([
    getVersion(),
    buildSearchIndex(locale),
    buildNavigationGroups(locale),
  ])

  return (
    <html lang={locale} className={roboto.variable}>
      <body>
        <StructuredData
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: t.siteName,
            alternateName: packageName,
            url: absoluteUrl(localizePath(locale, '/')),
            description: t.siteDescription,
            inLanguage: locale,
            license: 'https://opensource.org/licenses/MIT',
            publisher: {
              '@type': 'Person',
              name: 'Romullo Queiroz',
              url: repositoryUrl,
            },
            sameAs: [repositoryUrl, npmUrl],
          }}
        />
        <SiteProviders>
          <a href="#content" className="visually-hidden">
            {t.skipToContent}
          </a>
          <SiteBar
            version={version}
            index={index}
            groups={groups}
            repositoryUrl={repositoryUrl}
          />
          <div id="content">{children}</div>
          <footer className="footer">
            <div className="footer__inner">
              <span>{t.footerNotice}</span>
              <nav className="footer__links" aria-label={t.footerLabel}>
                <a href={repositoryUrl}>{t.footerRepository}</a>
                <a href={npmUrl}>npm</a>
                <a href="https://m3.material.io/">Material 3</a>
              </nav>
            </div>
          </footer>
        </SiteProviders>
      </body>
    </html>
  )
}
