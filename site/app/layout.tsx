import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Roboto_Flex } from 'next/font/google'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { SiteProviders } from './providers'
import { SiteBar } from '../ui/SiteBar'
import { buildSearchIndex } from '../content/search'
import { buildNavigationGroups } from '../content/navigation'
import { repoRoot } from '../content/paths'
import { StructuredData } from '../ui/StructuredData'
import {
  npmUrl,
  packageName,
  repositoryUrl,
  siteDescription,
  siteName,
  siteUrl,
} from '../content/site'

// The library's complete stylesheet, imported once through its public entry —
// exactly the line the getting-started guide tells consumers to write.
import '@language-lit/material3-expressive/styles.css'
import './globals.css'

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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: '%s · Material 3 Expressive',
  },
  description: siteDescription,
  applicationName: siteName,
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
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
  },
}

async function getVersion(): Promise<string> {
  const packageJson = JSON.parse(
    await readFile(path.join(repoRoot, 'package.json'), 'utf8'),
  )
  return packageJson.version as string
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [version, index, groups] = await Promise.all([
    getVersion(),
    buildSearchIndex(),
    buildNavigationGroups(),
  ])

  return (
    <html lang="en" className={roboto.variable}>
      <body>
        <StructuredData
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteName,
            alternateName: packageName,
            url: siteUrl,
            description: siteDescription,
            inLanguage: 'en',
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
            Skip to content
          </a>
          <SiteBar version={version} index={index} groups={groups} />
          <div id="content">{children}</div>
          <footer className="footer">
            <div className="footer__inner">
              <span>
                MIT licensed. Material 3 Expressive is a Google design system;
                this is an independent implementation.
              </span>
              <nav className="footer__links" aria-label="Footer">
                <a href="https://github.com/romulloqueiroz/material3-expressive">
                  Repository
                </a>
                <a href="https://www.npmjs.com/package/@language-lit/material3-expressive">
                  npm
                </a>
                <a href="https://m3.material.io/">Material 3</a>
              </nav>
            </div>
          </footer>
        </SiteProviders>
      </body>
    </html>
  )
}
