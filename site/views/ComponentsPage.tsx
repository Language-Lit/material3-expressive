import type { Metadata } from 'next'
import Link from 'next/link'
import { Surface, Text } from '@language-lit/material3-expressive'
import {
  getComponentsByKind,
  getConformantComponents,
  type ComponentKind,
} from '../../content/inventory'
import { DocsShell } from '../../ui/DocsShell'
import { ShapeGlyph } from '../../ui/ShapeField'
import type { ShapeName } from '../../theme/shapes'
import { StructuredData, breadcrumbList } from '../../ui/StructuredData'
import { absoluteUrl, openGraphDefaults } from '../../content/site'

const description =
  'Every conformant component in the package, grouped by role. Only components that pass the release gates appear here.'

export const metadata: Metadata = {
  title: 'Components',
  description,
  alternates: { canonical: '/components/' },
  openGraph: { ...openGraphDefaults, url: absoluteUrl('/components/') },
}

/**
 * A mark per category, drawn from the same generated vocabulary the home page
 * uses for its imagery.
 *
 * The mark is a landmark for the heading, so a reader scrolling for navigation
 * components can find the group by its silhouette instead of reading seven
 * headings in order. The silhouettes are chosen to stay distinguishable at
 * glyph size — a scalloped disc against a diamond against a clover — and the
 * pairing is fixed, because a mark that moved between visits would teach the
 * reader nothing.
 *
 * The mark is not repeated on the cards. Inside a group every card would carry
 * the same one, which adds thirty-two marks and no information.
 */
const kindMarks: Record<
  ComponentKind,
  { shape: ShapeName; family: 'primary' | 'tertiary' }
> = {
  foundation: { shape: 'square', family: 'primary' },
  action: { shape: 'pill', family: 'tertiary' },
  containment: { shape: 'arch', family: 'primary' },
  input: { shape: 'diamond', family: 'tertiary' },
  overlay: { shape: 'circle', family: 'primary' },
  feedback: { shape: 'sunny', family: 'tertiary' },
  navigation: { shape: 'clover4', family: 'primary' },
}

export default async function ComponentsPage() {
  const [groups, all] = await Promise.all([
    getComponentsByKind(),
    getConformantComponents(),
  ])

  return (
    <DocsShell>
      {/*
       * The catalogue as data, not just as links. A retrieval system asking
       * "which components does this library ship" gets the full list and each
       * component's URL from one page, in order, without crawling all 32.
       */}
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `Material 3 Expressive React components`,
          description,
          numberOfItems: all.length,
          itemListOrder: 'https://schema.org/ItemListOrderAscending',
          itemListElement: all.map((component, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: component.name,
            url: absoluteUrl(`/components/${component.name}/`),
          })),
        }}
      />
      <StructuredData data={breadcrumbList([{ name: 'Components', path: '/components/' }])} />
      <div className="page-head">
        <span className="page-head__eyebrow">Components</span>
        <Text as="h1" variant="displaySmall" emphasis="emphasized" className="page-head__title">
          {all.length} conformant components
        </Text>
        <Text as="p" variant="bodyLarge">
          A component appears here only after it passes the package's release
          gates. The list is generated from the same inventory that produces the
          supported-component matrix, so it cannot claim more than the library
          delivers.
        </Text>
      </div>

      <div className="catalog">
        {groups.map((group) => {
          const mark = kindMarks[group.kind]

          return (
            <section key={group.kind} aria-labelledby={`kind-${group.kind}`}>
              <div className="catalog__head">
                <ShapeGlyph shape={mark.shape} family={mark.family} />
                <Text
                  as="h2"
                  id={`kind-${group.kind}`}
                  variant="titleLarge"
                  emphasis="emphasized"
                  className="catalog__title"
                >
                  {group.label}
                </Text>
                <span className="catalog__count">{group.components.length}</span>
              </div>
              <div className="catalog__grid">
                {group.components.map((component) => (
                  <Surface
                    key={component.name}
                    as="article"
                    color="surface-container-low"
                    shape="large-increased"
                  >
                    <Link href={`/components/${component.name}/`} className="catalog__card">
                      <span className="catalog__name">{component.name}</span>
                      <span className="catalog__meta">
                        {component.publicExports.length} exports
                        {component.dependencies.length > 0 &&
                          ` · builds on ${component.dependencies.join(', ')}`}
                      </span>
                    </Link>
                  </Surface>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </DocsShell>
  )
}
