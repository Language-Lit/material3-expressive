import type { Metadata } from 'next'
import Link from 'next/link'
import { Surface, Text } from '@language-lit/material3-expressive'
import { a2uiDocPages, agUiDocPages, mcpAppsDocPages, docPages } from '../../content/docs'
import { DocsShell } from '../../ui/DocsShell'
import { StructuredData, breadcrumbList } from '../../ui/StructuredData'
import { absoluteUrl } from '../../content/site'

const description =
  'Guides to Material 3 Expressive and its AG-UI, A2UI, and MCP Apps companions: installation, theming, agent conversations, agent-generated surfaces, and component composition.'

export const metadata: Metadata = {
  title: 'Guides',
  description,
  alternates: { canonical: '/docs/' },
  openGraph: { url: absoluteUrl('/docs/'), title: 'Guides', description },
}

export default function DocsIndexPage() {
  return (
    <DocsShell>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Material 3 Expressive for React guides',
          description,
          numberOfItems: docPages.length,
          itemListOrder: 'https://schema.org/ItemListOrderAscending',
          itemListElement: docPages.map((page, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: page.title,
            description: page.summary,
            url: absoluteUrl(`/docs/${page.slug}/`),
          })),
        }}
      />
      <StructuredData data={breadcrumbList([{ name: 'Guides', path: '/docs/' }])} />
      <div className="page-head">
        <span className="page-head__eyebrow">Guides</span>
        <Text as="h1" variant="displaySmall" emphasis="emphasized" className="page-head__title">
          Guides
        </Text>
        <Text as="p" variant="bodyLarge">
          Set up Material 3 Expressive, customize your theme, add an agent
          conversation with the AG-UI companion, or render agent-generated
          surfaces with A2UI, or embed interactive tools with MCP Apps.
        </Text>
      </div>

      <div className="catalog__grid">
        {docPages.filter((page) => !page.section).map((page) => (
          <Surface key={page.slug} as="article" color="surface-container-low" shape="large">
            <Link href={`/docs/${page.slug}/`} className="catalog__card">
              <span className="catalog__name">{page.title}</span>
              <span className="claim__body" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                {page.summary}
              </span>
            </Link>
          </Surface>
        ))}
      </div>
      <section aria-labelledby="ag-ui-guides" style={{ marginBlockStart: '3rem' }}>
        <div className="page-head">
          <Text as="h2" variant="headlineMedium" id="ag-ui-guides">AG-UI</Text>
          <Text as="p" variant="bodyLarge">
            Build agent conversations with the Material 3 Expressive companion.
          </Text>
        </div>
        <div className="catalog__grid">
          {agUiDocPages.map((page) => (
            <Surface key={page.slug} as="article" color="surface-container-low" shape="large">
              <Link href={`/docs/${page.slug}/`} className="catalog__card">
                <span className="catalog__name">{page.title}</span>
                <span className="claim__body" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>{page.summary}</span>
              </Link>
            </Surface>
          ))}
        </div>
      </section>
      <section aria-labelledby="a2ui-guides" style={{ marginBlockStart: '3rem' }}>
        <div className="page-head">
          <Text as="h2" variant="headlineMedium" id="a2ui-guides">A2UI</Text>
          <Text as="p" variant="bodyLarge">
            Render Google A2UI surfaces with the Material 3 Expressive companion.
          </Text>
        </div>
        <div className="catalog__grid">
          {a2uiDocPages.map((page) => (
            <Surface key={page.slug} as="article" color="surface-container-low" shape="large">
              <Link href={`/docs/${page.slug}/`} className="catalog__card">
                <span className="catalog__name">{page.title}</span>
                <span className="claim__body" style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>{page.summary}</span>
              </Link>
            </Surface>
          ))}
        </div>
      </section>
      <section aria-labelledby="mcp-apps-guides" style={{ marginBlockStart: '3rem' }}>
        <div className="page-head"><Text as="h2" variant="headlineMedium" id="mcp-apps-guides">MCP Apps</Text><Text as="p" variant="bodyLarge">Host interactive tools and build apps with Material components.</Text></div>
        <div className="catalog__grid">{mcpAppsDocPages.map((page) => <Surface key={page.slug} as="article" color="surface-container-low" shape="large"><Link href={`/docs/${page.slug}/`} className="catalog__card"><span className="catalog__name">{page.title}</span><span className="claim__body">{page.summary}</span></Link></Surface>)}</div>
      </section>
    </DocsShell>
  )
}
