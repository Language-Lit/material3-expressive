import type { Metadata } from 'next'
import { Surface, Text } from '@language-lit/material3-expressive'
import { AgUiDemo } from '../ui/ag-ui/AgUiDemo'
import { InstallCommand } from '../ui/InstallCommand'
import { LinkButton } from '../ui/LinkButton'
import { StructuredData, breadcrumbList } from '../ui/StructuredData'
import { absoluteUrl, openGraphFor } from '../content/site'
import { localeAlternates, localizePath, type Locale } from '../i18n/locales'
import { agUiInstall, agUiNpm, agUiPackage, agUiReleases, agUiRepository } from '../content/ag-ui'
import { agUiDocPages, docPageCopy } from '../content/docs'
import { agUiMessages } from '../i18n/messages/agUi'
import '@language-lit/material3-expressive-ag-ui/styles.css'
import './ag-ui.css'

export function pageMetadata(locale: Locale): Metadata {
  const t = agUiMessages[locale]
  return {
    // Already names React, so it opts out of the template that would repeat it.
    title: { absolute: `${t.title} · Material 3 Expressive` },
    description: t.description,
    alternates: localeAlternates(locale, '/ag-ui/'),
    openGraph: { ...openGraphFor(locale), url: absoluteUrl(localizePath(locale, '/ag-ui/')), title: t.title, description: t.description },
    twitter: { card: 'summary_large_image', title: t.title, description: t.description },
  }
}

export default function AgUiPage({ locale }: { locale: Locale }) {
  const t = agUiMessages[locale]
  return (
    <main className="agui-page">
      <StructuredData data={breadcrumbList([{ name: 'AG-UI', path: '/ag-ui/' }], locale)} />
      <section className="hero">
        <div className="section__inner agui-hero">
          <div>
            <p className="hero__eyebrow">{t.title}</p>
            <Text as="h1" variant="displayLarge" emphasis="emphasized" className="hero__title agui-hero__title">
              {t.heroPrefix}<span className="hero__accent">{t.heroAccent}</span>
            </Text>
          </div>
          <div className="agui-hero__intro">
            <Text as="p" variant="bodyLarge">
              {t.intro}
            </Text>
            <Text as="p" variant="bodyLarge">
              {t.companion}
            </Text>
            <div className="hero__actions">
              <LinkButton href="#demo">{t.tryDemo}</LinkButton>
              <LinkButton href={localizePath(locale, '/docs/ag-ui-getting-started/')} variant="outlined">{t.readDocs}</LinkButton>
            </div>
            <nav className="agui-links" aria-label={t.package}>
              <a href={agUiNpm}>npm</a>
              <a href={agUiRepository}>GitHub</a>
              <a href={agUiReleases}>Releases</a>
            </nav>
          </div>
        </div>
      </section>

      <section className="section section--tinted agui-demo-section" id="demo" aria-labelledby="demo-title">
        <div className="section__inner">
          <div className="section__head agui-demo-section__head">
            <div>
              <p className="section__eyebrow">{t.tryHere}</p>
              <Text as="h2" variant="headlineLarge" emphasis="emphasized" className="section__title" id="demo-title">
                {t.conversation}
              </Text>
            </div>
            <p className="agui-demo-label">{t.scripted}</p>
          </div>
          <AgUiDemo />
        </div>
      </section>

      <section className="section" aria-labelledby="design-title">
        <div className="section__inner agui-about">
          <div>
            <p className="section__eyebrow">{t.oneSystem}</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="design-title">
              {t.matchApp}
            </Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              {t.sharedTheme}
            </Text>
            <LinkButton href={localizePath(locale, '/components/')} variant="outlined">{t.browseComponents}</LinkButton>
          </div>
          <Surface color="secondary-container" shape="extra-large" className="agui-about__detail">
            <Text as="h3" variant="titleLarge">{t.wholeChat}</Text>
            <Text as="p" variant="bodyLarge">
              {t.wholeChatBody}
            </Text>
            <Text as="p" variant="bodyMedium">
              {t.packageBody}
            </Text>
          </Surface>
        </div>
      </section>

      <section className="section section--tinted" id="install" aria-labelledby="install-title">
        <div className="section__inner agui-install">
          <p className="section__eyebrow">{t.startBuilding}</p>
          <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="install-title">
            {t.addAgUi}
          </Text>
          <Text as="p" variant="bodyLarge" className="section__lede">
            {t.installBody}
          </Text>
          <InstallCommand command={agUiInstall} />
          <Text as="p" variant="bodyMedium">
            {t.stylesBody}
          </Text>
          <pre className="agui-code"><code>{`import '@language-lit/material3-expressive/styles.css'
import '@language-lit/material3-expressive-ag-ui/styles.css'`}</code></pre>
          <div className="agui-links">
            <a href={localizePath(locale, '/docs/ag-ui-getting-started/')}>{t.setupGuide}</a>
            <a href={localizePath(locale, '/docs/getting-started/')}>{t.materialGuide}</a>
          </div>
          <Surface color="surface" shape="large" className="agui-copilot">
            <Text as="h3" variant="titleLarge">{t.usingCopilot}</Text>
            <Text as="p" variant="bodyLarge">
              {t.copilotBefore}<strong>{t.copilotVersion}</strong>{t.copilotAfter}<code>{agUiPackage}/copilotkit</code>{t.copilotEnd}
            </Text>
            <a href={localizePath(locale, '/docs/ag-ui-copilotkit/')}>{t.copilotGuide}</a>
          </Surface>
        </div>
      </section>
      <section className="section" aria-labelledby="agui-docs-title">
        <div className="section__inner">
          <div className="section__head">
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="agui-docs-title">{t.buildInterface}</Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              {t.guidesBody}
            </Text>
          </div>
          <div className="agui-guide-cards">
            {agUiDocPages.map((page) => (
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
