import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Text } from '@language-lit/material3-expressive'
import { getComponent, getConformantComponents } from '../../../content/inventory'
import { componentDocsRoot } from '../../../content/paths'
import { componentsWithoutExample, hasExample, readExampleSource } from '../../../content/examples'
import { highlight } from '../../../content/highlight'
import { renderMarkdown, stripLeadingHeading } from '../../../content/markdown'
import { DocsShell } from '../../../ui/DocsShell'
import { DemoFrame } from '../../../ui/DemoFrame'
import { Prose } from '../../../ui/Prose'
import { StructuredData, breadcrumbList } from '../../../ui/StructuredData'
import { componentDescription, componentLead } from '../../../content/summaries'
import { absoluteUrl, packageName, siteName, siteUrl } from '../../../content/site'

interface PageProps {
  params: Promise<{ component: string }>
}

/**
 * One route per conformant component, and no others. The inventory is the only
 * input, so a component cannot be documented into existence here.
 */
export async function generateStaticParams() {
  const components = await getConformantComponents()
  return components.map((component) => ({ component: component.name }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { component: name } = await params
  const component = await getComponent(name)
  if (!component) return {}
  const description = await componentDescription(component.name)
  return {
    title: component.name,
    description,
    alternates: { canonical: `/components/${component.name}/` },
    openGraph: {
      type: 'article',
      url: absoluteUrl(`/components/${component.name}/`),
      title: component.name,
      description,
    },
  }
}

export default async function ComponentPage({ params }: PageProps) {
  const { component: name } = await params
  const component = await getComponent(name)
  if (!component) notFound()

  const markdown = await readFile(
    path.join(componentDocsRoot, `${component.name}.md`),
    'utf8',
  )
  const { body } = stripLeadingHeading(markdown)
  const { html } = renderMarkdown(body)

  const demonstrated = await hasExample(component.name)
  const exampleSource = demonstrated ? await readExampleSource(component.name) : null
  const summary = await componentLead(component.name)

  return (
    <DocsShell>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: `${component.name} — Material 3 Expressive for React`,
          description: summary,
          url: absoluteUrl(`/components/${component.name}/`),
          inLanguage: 'en',
          isPartOf: { '@type': 'WebSite', name: siteName, url: siteUrl },
          about: { '@type': 'SoftwareSourceCode', name: packageName },
          // The exports are the component's public surface, and naming them
          // here is what lets a retrieval system answer "what do I import for
          // a Button" without parsing a code block out of the page.
          keywords: component.publicExports.join(', '),
          author: { '@type': 'Person', name: 'Romullo Queiroz' },
          license: 'https://opensource.org/licenses/MIT',
        }}
      />
      <StructuredData
        data={breadcrumbList([
          { name: 'Components', path: '/components/' },
          { name: component.name, path: `/components/${component.name}/` },
        ])}
      />
      <article>
        <div className="page-head">
          <span className="page-head__eyebrow">
            {component.kind} · conformant
          </span>
          <Text
            as="h1"
            variant="displaySmall"
            emphasis="emphasized"
            className="page-head__title"
          >
            {component.name}
          </Text>
          <div className="page-head__exports">
            {component.publicExports.map((exported) => (
              <span key={exported} className="export-chip">
                {exported}
              </span>
            ))}
          </div>
        </div>

        {exampleSource ? (
          <DemoFrame
            component={component.name}
            source={exampleSource}
            sourceHtml={`<figure class="code"><pre class="code__pre"><code>${highlight(
              exampleSource,
              'tsx',
            )}</code></pre></figure>`}
          />
        ) : (
          <Text as="p" variant="bodyMedium" style={{ marginBlockEnd: '1.5rem' }}>
            {componentsWithoutExample[component.name]}
          </Text>
        )}

        <Prose html={html} />
      </article>
    </DocsShell>
  )
}
