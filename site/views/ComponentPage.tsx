import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { readFile } from 'node:fs/promises'
import { Text } from '@language-lit/material3-expressive'
import { getComponent, getConformantComponents } from '../content/inventory'
import { componentDocPath } from '../content/docs'
import { componentsWithoutExample, hasExample, readExampleSource } from '../content/examples'
import { highlight } from '../content/highlight'
import { renderMarkdown, stripLeadingHeading } from '../content/markdown'
import { DocsShell } from '../ui/DocsShell'
import { DemoFrame } from '../ui/DemoFrame'
import { Prose } from '../ui/Prose'
import { StructuredData, breadcrumbList } from '../ui/StructuredData'
import { componentDescription, componentLead } from '../content/summaries'
import { absoluteUrl, openGraphFor, packageName, siteUrl } from '../content/site'
import { localeAlternates, localizePath, type Locale } from '../i18n/locales'
import { componentsWithoutExampleText, shellMessages } from '../i18n/messages/shell'

/**
 * One route per conformant component, and no others. The inventory is the only
 * input, so a component cannot be documented into existence here.
 */
export async function staticParams() {
  const components = await getConformantComponents()
  return components.map((component) => ({ component: component.name }))
}

export async function pageMetadata(locale: Locale, name: string): Promise<Metadata> {
  const component = await getComponent(name)
  if (!component) return {}
  const description = await componentDescription(component.name, locale)
  const pathname = `/components/${component.name}/`
  return {
    title: component.name,
    description,
    alternates: localeAlternates(locale, pathname),
    openGraph: {
      ...openGraphFor(locale),
      type: 'article',
      url: absoluteUrl(localizePath(locale, pathname)),
    },
  }
}

export default async function ComponentPage({ locale, param: name }: { locale: Locale; param: string }) {
  const component = await getComponent(name)
  if (!component) notFound()

  const t = shellMessages[locale]
  const pathname = `/components/${component.name}/`
  const markdown = await readFile(componentDocPath(locale, component.name), 'utf8')
  const { body } = stripLeadingHeading(markdown)
  const { html } = renderMarkdown(body, locale)

  const demonstrated = await hasExample(component.name)
  const exampleSource = demonstrated ? await readExampleSource(component.name) : null
  const summary = await componentLead(component.name, locale)

  return (
    <DocsShell locale={locale}>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: t.componentHeadline(component.name),
          description: summary,
          url: absoluteUrl(localizePath(locale, pathname)),
          inLanguage: locale,
          isPartOf: { '@type': 'WebSite', name: t.siteName, url: siteUrl },
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
        data={breadcrumbList(
          [
            { name: t.components, path: '/components/' },
            { name: component.name, path: pathname },
          ],
          locale,
        )}
      />
      <article>
        <div className="page-head">
          <span className="page-head__eyebrow">
            {t.kinds[component.kind]} · {t.conformant}
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
            {componentsWithoutExampleText[locale]?.[component.name] ?? componentsWithoutExample[component.name]}
          </Text>
        )}

        <Prose html={html} />
      </article>
    </DocsShell>
  )
}
