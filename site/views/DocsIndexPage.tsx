import type { Metadata } from 'next'
import Link from 'next/link'
import { Surface, Text } from '@language-lit/material3-expressive'
import { a2uiDocPages, agUiDocPages, mcpAppsDocPages, docPageCopy, docPages } from '../content/docs'
import { DocsShell } from '../ui/DocsShell'
import { StructuredData, breadcrumbList } from '../ui/StructuredData'
import { absoluteUrl, openGraphFor } from '../content/site'
import { localeAlternates, localizePath, type Locale } from '../i18n/locales'
import { shellMessages } from '../i18n/messages/shell'

export function pageMetadata(locale: Locale): Metadata {
  const t = shellMessages[locale]
  return {
    title: t.guides,
    description: t.docsIndexDescription,
    alternates: localeAlternates(locale, '/docs/'),
    openGraph: { ...openGraphFor(locale), url: absoluteUrl(localizePath(locale, '/docs/')) },
  }
}

export default function DocsIndexPage({ locale }: { locale: Locale }) {
  const t = shellMessages[locale]
  return (
    <DocsShell locale={locale}>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: t.docsIndexListName,
          description: t.docsIndexDescription,
          numberOfItems: docPages.length,
          itemListOrder: 'https://schema.org/ItemListOrderAscending',
          itemListElement: docPages.map((page, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: docPageCopy(page, locale).title,
            description: docPageCopy(page, locale).summary,
            url: absoluteUrl(localizePath(locale, `/docs/${page.slug}/`)),
          })),
        }}
      />
      <StructuredData data={breadcrumbList([{ name: t.guides, path: '/docs/' }], locale)} />
      <div className="page-head">
        <span className="page-head__eyebrow">{t.guides}</span>
        <Text as="h1" variant="displaySmall" emphasis="emphasized" className="page-head__title">
          {t.guides}
        </Text>
        <Text as="p" variant="bodyLarge">
          {t.docsIndexLede}
        </Text>
      </div>

      <div className="catalog__grid">
        {docPages.filter((page) => !page.section).map((page) => (
          <Surface key={page.slug} as="article" color="surface-container-low" shape="large">
            <Link href={localizePath(locale, `/docs/${page.slug}/`)} className="catalog__card">
              <span className="catalog__name">{docPageCopy(page, locale).title}</span>
              <span className="claim__body" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                {docPageCopy(page, locale).summary}
              </span>
            </Link>
          </Surface>
        ))}
      </div>
      <section aria-labelledby="ag-ui-guides" style={{ marginBlockStart: '3rem' }}>
        <div className="page-head">
          <Text as="h2" variant="headlineMedium" id="ag-ui-guides">AG-UI</Text>
          <Text as="p" variant="bodyLarge">
            {t.docsIndexAgUi}
          </Text>
        </div>
        <div className="catalog__grid">
          {agUiDocPages.map((page) => (
            <Surface key={page.slug} as="article" color="surface-container-low" shape="large">
              <Link href={localizePath(locale, `/docs/${page.slug}/`)} className="catalog__card">
                <span className="catalog__name">{docPageCopy(page, locale).title}</span>
                <span className="claim__body" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>{docPageCopy(page, locale).summary}</span>
              </Link>
            </Surface>
          ))}
        </div>
      </section>
      <section aria-labelledby="a2ui-guides" style={{ marginBlockStart: '3rem' }}>
        <div className="page-head">
          <Text as="h2" variant="headlineMedium" id="a2ui-guides">A2UI</Text>
          <Text as="p" variant="bodyLarge">
            {t.docsIndexA2ui}
          </Text>
        </div>
        <div className="catalog__grid">
          {a2uiDocPages.map((page) => (
            <Surface key={page.slug} as="article" color="surface-container-low" shape="large">
              <Link href={localizePath(locale, `/docs/${page.slug}/`)} className="catalog__card">
                <span className="catalog__name">{docPageCopy(page, locale).title}</span>
                <span className="claim__body" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>{docPageCopy(page, locale).summary}</span>
              </Link>
            </Surface>
          ))}
        </div>
      </section>
      <section aria-labelledby="mcp-apps-guides" style={{ marginBlockStart: '3rem' }}>
        <div className="page-head"><Text as="h2" variant="headlineMedium" id="mcp-apps-guides">MCP Apps</Text><Text as="p" variant="bodyLarge">{t.docsIndexMcpApps}</Text></div>
        <div className="catalog__grid">{mcpAppsDocPages.map((page) => <Surface key={page.slug} as="article" color="surface-container-low" shape="large"><Link href={localizePath(locale, `/docs/${page.slug}/`)} className="catalog__card"><span className="catalog__name">{docPageCopy(page, locale).title}</span><span className="claim__body">{docPageCopy(page, locale).summary}</span></Link></Surface>)}</div>
      </section>
    </DocsShell>
  )
}
