import type { Metadata } from 'next'
import { Surface, Text } from '@language-lit/material3-expressive'
import { A2uiDemo } from '../ui/a2ui/A2uiDemo'
import { InstallCommand } from '../ui/InstallCommand'
import { LinkButton } from '../ui/LinkButton'
import { StructuredData, breadcrumbList } from '../ui/StructuredData'
import { absoluteUrl, openGraphFor } from '../content/site'
import { localeAlternates, localizePath, type Locale } from '../i18n/locales'
import {
  a2uiComponentMap,
  a2uiEcosystemListing,
  a2uiInstall,
  a2uiNpm,
  a2uiProject,
  a2uiReleases,
  a2uiRepository,
  a2uiSpecification,
  a2uiVersions,
} from '../content/a2ui'
import { a2uiDocPages, docPageCopy } from '../content/docs'
import { a2uiMessages } from '../i18n/messages/a2ui'
import '@language-lit/material3-expressive-a2ui/styles.css'
import './a2ui.css'

export function pageMetadata(locale: Locale): Metadata {
  const t = a2uiMessages[locale]
  return {
    // Already names React, so it opts out of the template that would repeat it.
    title: { absolute: `${t.title} · Material 3 Expressive` },
    description: t.description,
    alternates: localeAlternates(locale, '/a2ui/'),
    openGraph: { ...openGraphFor(locale), url: absoluteUrl(localizePath(locale, '/a2ui/')), title: t.title, description: t.description },
    twitter: { card: 'summary_large_image', title: t.title, description: t.description },
  }
}

const sample = `import { Material3Provider } from '@language-lit/material3-expressive'
import { A2uiSurface, useA2ui } from '@language-lit/material3-expressive-a2ui'

export function AgentPanel({ send }) {
  const { surfaces, processMessages } = useA2ui({
    onAction: (action) => send(action),
  })
  // Call processMessages(messages) with each batch your agent delivers.
  return (
    <Material3Provider>
      {surfaces.map((surface) => (
        <A2uiSurface key={surface.id} surface={surface} />
      ))}
    </Material3Provider>
  )
}`

export default function A2uiPage({ locale }: { locale: Locale }) {
  const t = a2uiMessages[locale]
  return (
    <main className="a2ui-page">
      <StructuredData data={breadcrumbList([{ name: t.title, path: '/a2ui/' }], locale)} />
      <section className="hero">
        <div className="section__inner a2ui-hero">
          <div>
            <p className="hero__eyebrow">{t.title}</p>
            <Text as="h1" variant="displayLarge" emphasis="emphasized" className="hero__title a2ui-hero__title">
              {t.heroTitleBefore}<span className="hero__accent">{t.heroTitleAccent}</span>
            </Text>
          </div>
          <div className="a2ui-hero__intro">
            <Text as="p" variant="bodyLarge">
              {t.intro[0]}
            </Text>
            <Text as="p" variant="bodyLarge">
              {t.intro[1]}
            </Text>
            <div className="hero__actions">
              <LinkButton href="#demo">{t.tryDemo}</LinkButton>
              <LinkButton href={localizePath(locale, '/docs/a2ui-getting-started/')} variant="outlined">{t.readDocs}</LinkButton>
            </div>
            <nav className="a2ui-links" aria-label={t.packageLabel}>
              <a href={a2uiNpm}>npm</a>
              <a href={a2uiRepository}>GitHub</a>
              <a href={a2uiReleases}>{t.releases}</a>
              <a href={a2uiSpecification}>{t.specification}</a>
              <a href={a2uiEcosystemListing}>{t.listedOn}</a>
            </nav>
          </div>
        </div>
      </section>

      <section className="section section--tinted a2ui-demo-section" id="demo" aria-labelledby="demo-title">
        <div className="section__inner">
          <div className="section__head a2ui-demo-section__head">
            <div>
              <p className="section__eyebrow">{t.tryItHere}</p>
              <Text as="h2" variant="headlineLarge" emphasis="emphasized" className="section__title" id="demo-title">
                {t.demoHeading}
              </Text>
            </div>
            <p className="a2ui-demo-label">{t.scriptedDemo}</p>
          </div>
          <A2uiDemo />
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="section__inner a2ui-how">
          <div className="section__head">
            <p className="section__eyebrow">{t.howItWorks}</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="how-title">
              {t.howHeading}
            </Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              {t.howLede}
            </Text>
          </div>
          <ol className="a2ui-steps">
            {t.steps.map((step, index) => (
              <li key={step.title}>
                <Surface color="surface-container-low" shape="large" className="a2ui-step">
                  <span className="a2ui-step__number" aria-hidden="true">{index + 1}</span>
                  <Text as="h3" variant="titleLarge">{step.title}</Text>
                  <Text as="p" variant="bodyMedium">{step.body}</Text>
                </Surface>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--tinted" id="components" aria-labelledby="components-title">
        <div className="section__inner a2ui-components">
          <div className="section__head">
            <p className="section__eyebrow">{t.supportedComponents}</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="components-title">
              {t.catalogHeading}
            </Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              {t.catalogLede(a2uiComponentMap.length, a2uiVersions.protocol)}
            </Text>
          </div>
          <div className="a2ui-table-wrap">
            <table className="a2ui-table">
              <thead>
                <tr>
                  {t.componentHeaders.map((header) => <th key={header} scope="col">{header}</th>)}
                </tr>
              </thead>
              <tbody>
                {t.componentRows.map((row) => (
                  <tr key={row.component}>
                    <th scope="row"><code>{row.component}</code></th>
                    <td>{row.renders}</td>
                    <td>{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a className="a2ui-inline-link" href={localizePath(locale, '/docs/a2ui-components/')}>{t.readComponentRules}</a>
        </div>
      </section>

      <section className="section" id="compatibility" aria-labelledby="compat-title">
        <div className="section__inner a2ui-compat">
          <div>
            <p className="section__eyebrow">{t.compatibility}</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="compat-title">
              {t.compatibilityHeading}
            </Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              {t.compatibilityLede}
            </Text>
            <div className="a2ui-table-wrap">
              <table className="a2ui-table">
              <caption className="a2ui-visually-hidden">{t.supportedVersions}</caption>
                <tbody>
                  {t.compatibilityRows(a2uiVersions).map(([name, value]) => (
                    <tr key={name}>
                      <th scope="row"><code>{name}</code></th>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Surface color="secondary-container" shape="extra-large" className="a2ui-compat__limits">
            <Text as="h3" variant="titleLarge">{t.knownLimits}</Text>
            <ul className="a2ui-list">
              {t.limits.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </Surface>
        </div>
      </section>

      <section className="section section--tinted" id="install" aria-labelledby="install-title">
        <div className="section__inner a2ui-install">
          <p className="section__eyebrow">{t.startBuilding}</p>
          <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="install-title">
            {t.installHeading}
          </Text>
          <Text as="p" variant="bodyLarge" className="section__lede">
            {t.installLede}
          </Text>
          <InstallCommand command={a2uiInstall} />
          <Text as="p" variant="bodyMedium">
            {t.installNote}
          </Text>
          <pre className="a2ui-code"><code>{`import '@language-lit/material3-expressive/styles.css'
import '@language-lit/material3-expressive-a2ui/styles.css'`}</code></pre>
          <pre className="a2ui-code"><code>{sample}</code></pre>
          <div className="a2ui-links">
            <a href={localizePath(locale, '/docs/a2ui-getting-started/')}>{t.setupGuide}</a>
            <a href={localizePath(locale, '/docs/getting-started/')}>{t.materialSetup}</a>
          </div>
          <Surface color="surface" shape="large" className="a2ui-official">
            <Text as="h3" variant="titleLarge">{t.officialTitle}</Text>
            <Text as="p" variant="bodyLarge">
              {t.officialBody}
            </Text>
            <a href={localizePath(locale, '/docs/a2ui-components/#use-the-catalog-under-googles-react-surface')}>{t.registerCatalog}</a>
          </Surface>
        </div>
      </section>

      <section className="section" aria-labelledby="a2ui-docs-title">
        <div className="section__inner">
          <div className="section__head">
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="a2ui-docs-title">{t.buildAgentSurfaces}</Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              {t.guidesLede}<a href={a2uiProject}>{t.projectName}</a>{t.sentenceEnd}
            </Text>
          </div>
          <div className="a2ui-guide-cards">
            {a2uiDocPages.map((page) => (
              <Surface key={page.slug} color="surface-container-low" shape="large">
                <Text as="h3" variant="titleLarge"><a href={localizePath(locale, `/docs/${page.slug}/`)}>{docPageCopy(page, locale).title}</a></Text>
                <Text as="p" variant="bodyMedium">{docPageCopy(page, locale).summary}</Text>
              </Surface>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
