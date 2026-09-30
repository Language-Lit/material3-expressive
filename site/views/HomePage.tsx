import type { Metadata } from 'next'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Icon, Surface, Text } from '@language-lit/material3-expressive'
import { getConformantComponents } from '../content/inventory'
import { repoRoot, docsRoot } from '../content/paths'
import { Ramp, RampRule } from '../ui/Ramp'
import { HeroShowcase } from '../ui/HeroShowcase'
import { InstallCommand } from '../ui/InstallCommand'
import { LinkButton } from '../ui/LinkButton'
import { ThemeShowcase } from '../ui/ThemeShowcase'
import { StructuredData } from '../ui/StructuredData'
import {
  packageName,
  repositoryUrl,
  siteDescription,
  siteName,
  siteUrl,
} from '../content/site'
import { localeAlternates, localizePath, type Locale } from '../i18n/locales'
import { homeMessages } from '../i18n/messages/home'

/**
 * Package figures are read from the repository at build time. Google research
 * figures are separately attributed and linked in the research section.
 */
async function getFacts() {
  const [components, budgets, browsers, packageJson] = await Promise.all([
    getConformantComponents(),
    readFile(path.join(docsRoot, 'bundle-budgets.json'), 'utf8').then(JSON.parse),
    readFile(path.join(docsRoot, 'browser-support.json'), 'utf8').then(JSON.parse),
    readFile(path.join(repoRoot, 'package.json'), 'utf8').then(JSON.parse),
  ])

  const kilobytes = (bytes: number) => Math.round(bytes / 102.4) / 10

  return {
    componentCount: components.length,
    jsGzip: kilobytes(budgets.artifacts['dist/index.js'].baselineGzipBytes),
    cssGzip: kilobytes(budgets.artifacts['dist/styles.css'].baselineGzipBytes),
    runtimeDependencies: Object.keys(packageJson.dependencies ?? {}).length,
    browsers: browsers.browsers.map(
      (browser: { name: string; minimum: string }) =>
        `${browser.name} ${browser.minimum}`,
    ),
  }
}

export function pageMetadata(locale: Locale): Metadata {
  return { alternates: localeAlternates(locale, '/') }
}

export default async function HomePage({ locale }: { locale: Locale }) {
  const facts = await getFacts()
  const t = homeMessages[locale]

  return (
    // The docs routes get their `main` from `DocsShell`; the home page has no
    // shell, and without this the only landmark on it was `body`.
    <main>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: packageName,
          alternateName: siteName,
          description: siteDescription,
          url: siteUrl,
          codeRepository: repositoryUrl,
          programmingLanguage: ['TypeScript', 'JavaScript'],
          runtimePlatform: ['React 18', 'React 19'],
          license: 'https://opensource.org/licenses/MIT',
          author: { '@type': 'Person', name: 'Romullo Queiroz', url: repositoryUrl },
          // The figures below are the same build-time reads the page renders,
          // so the structured claim and the visible claim cannot disagree.
          keywords: [
            'Material 3 Expressive',
            'Material Design 3',
            'React components',
            'design tokens',
            `${facts.componentCount} components`,
            `${facts.runtimeDependencies} runtime dependencies`,
          ].join(', '),
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />
      <section className="hero">
        <div className="hero__grid">
          <div>
            <p className="hero__eyebrow">{t.heroEyebrow}</p>
            <Text as="h1" variant="displayLarge" emphasis="emphasized" className="hero__title">
              {t.heroTitle}<br />
              <span className="hero__accent">{t.heroTitleAccent}</span>
            </Text>
            <Text as="p" variant="bodyLarge" className="hero__lede">
              {t.heroLede}
            </Text>
            <div className="hero__actions">
              <LinkButton href={localizePath(locale, '/components/')} trailingIcon={<Icon source="arrow_forward" mirrored />}>
                {t.tryComponents}
              </LinkButton>
              <LinkButton href={localizePath(locale, '/docs/getting-started/')} variant="outlined">{t.getStarted}</LinkButton>
            </div>
            <ul className="hero__facts" aria-label={t.libraryAtGlance}>
              <li>{t.reactPeers}</li><li>TypeScript</li><li>{t.mitLicensed}</li>
              <li>{t.runtimeDependencies(facts.runtimeDependencies)}</li>
            </ul>
            <p className="hero__attribution">{t.independentAttribution}</p>
          </div>
          <HeroShowcase />
        </div>
      </section>

      <section className="section section--research">
        <div className="section__inner research">
          <div>
            <p className="section__eyebrow">{t.whyExpressive}</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title">
              {t.researchHeading}
            </Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              {t.researchLede}
            </Text>
            <a className="research__link" href="https://design.google/library/expressive-material-design-google-research">
              {t.researchLink} <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="research__evidence">
            <div className="research__numbers">
              <p><strong>46</strong><span>{t.researchStudies}</span></p>
              <p><strong>18,000+</strong><span>{t.participantsWorldwide}</span></p>
            </div>
            <p>{t.researchEvidence}</p>
          </div>
        </div>
      </section>

      <section className="section section--tinted" id="theming">
        <div className="section__inner">
          <div className="section__head">
            <p className="section__eyebrow">{t.builtAroundBrand}</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title">
              {t.themeHeading}
            </Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              {t.themeLede}
            </Text>
          </div>
          <ThemeShowcase />
          <details className="theme-details">
            <summary>{t.showPalettes}</summary>
            <figure className="ramp-readout">
              <Ramp />
              <figcaption><Text as="span" variant="bodySmall">
                {t.paletteCaption}
              </Text></figcaption>
            </figure>
          </details>
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <div className="section__head">
            <p className="section__eyebrow">{t.realReactApps}</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title">
              {t.webHeading}
            </Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              {t.webLede}
            </Text>
          </div>
          <div className="claims">
            <Surface as="article" color="primary-container" shape="extra-large" className="claim">
              <span className="claim__value">{facts.componentCount}</span>
              <Text as="h3" variant="titleMedium">{t.conformantComponents}</Text>
              <Text as="p" variant="bodyMedium" className="claim__body">
                {t.componentsClaim}
              </Text>
              <a href={localizePath(locale, '/components/')} className="claim__link">{t.browseComponents}</a>
            </Surface>
            <Surface as="article" color="tertiary-container" shape="large-increased" className="claim">
              <span className="claim__value">{facts.runtimeDependencies}</span>
              <Text as="h3" variant="titleMedium">{t.extraRuntimeDependencies}</Text>
              <Text as="p" variant="bodyMedium" className="claim__body">
                {t.runtimeClaim}
              </Text>
              <a href={localizePath(locale, '/docs/getting-started/')} className="claim__link">{t.seeSetup}</a>
            </Surface>
            <Surface as="article" color="secondary-container" shape="extra-large-increased" className="claim">
              <span className="claim__value">SSR</span>
              <Text as="h3" variant="titleMedium">{t.serverRendering}</Text>
              <Text as="p" variant="bodyMedium" className="claim__body">
                {t.ssrClaim}
              </Text>
              <a href={localizePath(locale, '/docs/ssr/')} className="claim__link">{t.readSsrGuide}</a>
            </Surface>
          </div>
          <div className="implementation-notes">
            <p>{t.adaptationsLead}<a href={localizePath(locale, '/docs/web-deviations/')}>{t.adaptationsLink}</a>.</p>
            <p>{t.bundleBaselines}{facts.jsGzip}{t.gzipJavaScript}{facts.cssGzip}{t.gzipCss}</p>
            <p>{t.supportedBrowsers}{facts.browsers.join(', ')}.</p>
          </div>
        </div>
      </section>

      <section className="section section--inverse">
        <div className="section__inner">
          <RampRule />
          <div className="getting-started">
            <div>
              <p className="section__eyebrow">{t.tryProject}</p>
              <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title">
                {t.firstComponent}
              </Text>
              <Text as="p" variant="bodyLarge" className="section__lede">
                {t.installLede}
              </Text>
              <InstallCommand command="npm install @language-lit/material3-expressive react react-dom" />
              <div className="hero__actions">
                <LinkButton href={localizePath(locale, '/docs/getting-started/')} variant="tonal">{t.installationGuide}</LinkButton>
                <LinkButton href={repositoryUrl} variant="text" external>{t.viewGitHub}</LinkButton>
              </div>
            </div>
            <div className="starter-code">
              <p className="starter-code__label">App.tsx</p>
              <pre tabIndex={0} aria-label={t.minimalReactSetup}><code>{`import {
  Button,
  Material3Provider,
} from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

export default function App() {
  return (
    <Material3Provider>
      <Button variant="filled">Get started</Button>
    </Material3Provider>
  )
}`}</code></pre>
              <p>{t.nextJsPrompt}
                <a href={localizePath(locale, '/docs/ssr/')}> {t.frameworkGuide}</a></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
