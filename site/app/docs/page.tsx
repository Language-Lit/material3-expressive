import type { Metadata } from 'next'
import Link from 'next/link'
import { Surface, Text } from '@language-lit/material3-expressive'
import { agUiDocPages, docPages } from '../../content/docs'
import { DocsShell } from '../../ui/DocsShell'
import { StructuredData, breadcrumbList } from '../../ui/StructuredData'
import { absoluteUrl } from '../../content/site'

const description =
  'Guides to Material 3 Expressive and its AG-UI companion: installation, theming, agent conversations, and component composition.'

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
          Set up Material 3 Expressive, customize your theme, or add an agent
          conversation with the AG-UI companion.
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
    </DocsShell>
  )
}
