import type { Metadata } from 'next'
import { Surface, Text } from '@language-lit/material3-expressive'
import { McpAppsDemo } from '../ui/mcp-apps/McpAppsDemo'
import { LinkButton } from '../ui/LinkButton'
import { StructuredData, breadcrumbList } from '../ui/StructuredData'
import { absoluteUrl, openGraphFor } from '../content/site'
import { localeAlternates, localizePath, type Locale } from '../i18n/locales'
import { mcpAppsSpecification, mcpAppsVersions } from '../content/mcp-apps'
import { docPageCopy, mcpAppsDocPages } from '../content/docs'
import { mcpAppsMessages } from '../i18n/messages/mcpApps'
import '@language-lit/material3-expressive-mcp-apps/styles.css'
import './mcp-apps.css'

export function pageMetadata(locale: Locale): Metadata {
  const t = mcpAppsMessages[locale]
  return {
    // Already names React, so it opts out of the template that would repeat it.
    title: { absolute: `${t.title} · Material 3 Expressive` },
    description: t.description,
    alternates: localeAlternates(locale, '/mcp-apps/'),
    openGraph: { ...openGraphFor(locale), url: absoluteUrl(localizePath(locale, '/mcp-apps/')), title: t.title, description: t.description },
    twitter: { card: 'summary_large_image', title: t.title, description: t.description },
  }
}

const sample = `import { Material3Provider } from '@language-lit/material3-expressive'
import { McpAppFrame, useMcpAppResource } from
  '@language-lit/material3-expressive-mcp-apps'

export function ToolApp({ client, uri, toolResult }) {
  const { resource, error } = useMcpAppResource(client, uri)
  if (error) return <p role="alert">{error.message}</p>
  return <Material3Provider>
    {resource && <McpAppFrame client={client} resource={resource}
      toolResult={toolResult} title="Tool app" sandboxUrl={sandboxUrl}
      onAuthorizeToolCall={authorizeToolCall} />}
  </Material3Provider>
}`

export default function McpAppsPage({ locale }: { locale: Locale }) {
  const t = mcpAppsMessages[locale]
  return (
    <main className="mcp-page">
      <StructuredData data={breadcrumbList([{ name: 'MCP Apps', path: '/mcp-apps/' }], locale)} />
      <section className="hero">
        <div className="section__inner mcp-hero">
          <div>
            <p className="hero__eyebrow">{t.title}</p>
            <Text as="h1" variant="displayLarge" emphasis="emphasized" className="hero__title mcp-hero__title">
              {t.heroPrefix}<span className="hero__accent">{t.heroAccent}</span>
            </Text>
          </div>
          <div className="mcp-hero__intro">
            <Text as="p" variant="bodyLarge">
              {t.intro}
            </Text>
            <Text as="p" variant="bodyLarge">
              {t.companion}
            </Text>
            <div className="hero__actions">
              <LinkButton href="#demo">{t.tryDemo}</LinkButton>
              <LinkButton href={localizePath(locale, '/docs/mcp-apps-getting-started/')} variant="outlined">{t.readDocs}</LinkButton>
            </div>
            <nav className="mcp-links" aria-label={t.references}>
              <a href={mcpAppsSpecification}>{t.specification}</a>
              <span className="mcp-links__note">{t.companionVersion} {mcpAppsVersions.companion}</span>
            </nav>
          </div>
        </div>
      </section>

      <section className="section section--tinted mcp-demo-section" id="demo" aria-labelledby="demo-title">
        <div className="section__inner">
          <div className="section__head mcp-demo-section__head">
            <div>
              <p className="section__eyebrow">{t.tryHere}</p>
              <Text as="h2" variant="headlineLarge" emphasis="emphasized" className="section__title" id="demo-title">
                {t.toolResult}
              </Text>
              <Text as="p" variant="bodyLarge" className="section__lede">
                {t.demoDescription}
              </Text>
            </div>
            <p className="mcp-demo-label">{t.scripted}</p>
          </div>
          <McpAppsDemo />
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="section__inner">
          <div className="section__head">
            <p className="section__eyebrow">{t.howWorks}</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="how-title">
              {t.toolToApp}
            </Text>
          </div>
          <ol className="mcp-steps">
            {t.steps.map((step, index) => (
              <li key={step.title}>
                <Surface color="surface-container-low" shape="large" className="mcp-step">
                  <span className="mcp-step__number" aria-hidden="true">{index + 1}</span>
                  <Text as="h3" variant="titleLarge">{step.title}</Text>
                  <Text as="p" variant="bodyMedium">{step.body}</Text>
                </Surface>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--tinted" id="install" aria-labelledby="sides-title">
        <div className="section__inner mcp-install">
          <div className="section__head">
          <p className="section__eyebrow">{t.startBuilding}</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="sides-title">
              {t.oneCompanion}
            </Text>
          </div>
          <div className="mcp-sides">
            <Surface as="article" color="primary-container" shape="large" className="mcp-card">
              <Text as="h3" variant="titleLarge">{t.hostApp}</Text>
              <Text as="p" variant="bodyMedium">
                {t.hostBody}
              </Text>
            </Surface>
            <Surface as="article" color="tertiary-container" shape="large" className="mcp-card">
              <Text as="h3" variant="titleLarge">{t.materialApp}</Text>
              <Text as="p" variant="bodyMedium">
                {t.materialBody}
              </Text>
            </Surface>
          </div>
          <pre className="mcp-code"><code>{sample}</code></pre>
          <Text as="p" variant="bodyMedium">
            {t.stylesBody}
          </Text>
        </div>
      </section>

      <section className="section" id="compatibility" aria-labelledby="compat-title">
        <div className="section__inner mcp-compat">
          <div className="mcp-compat__intro">
            <div className="section__head">
              <p className="section__eyebrow">{t.compatibility}</p>
              <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="compat-title">
                {t.compatibilityTitle}
              </Text>
              <Text as="p" variant="bodyLarge" className="section__lede">
                {t.compatibilityBody}{mcpAppsVersions.sdk}{t.compatibilityMiddle}{mcpAppsVersions.core}{t.compatibilityEnd}
              </Text>
            </div>
            <Text as="p" variant="bodyMedium">
              {t.compatibilityNote}
            </Text>
            <nav className="mcp-actions" aria-label={t.guidesLabel}>
              {mcpAppsDocPages.map((page) => (
                <LinkButton key={page.slug} href={localizePath(locale, `/docs/${page.slug}/`)} variant="outlined">{docPageCopy(page, locale).title}</LinkButton>
              ))}
            </nav>
          </div>
          <Surface color="secondary-container" shape="extra-large" className="mcp-compat__policy">
            <Text as="h3" variant="titleLarge">{t.hostCharge}</Text>
            <ul className="mcp-list">
              {t.policy.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </Surface>
        </div>
      </section>
    </main>
  )
}
