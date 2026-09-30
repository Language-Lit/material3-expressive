import { mcpAppsPackage } from '../content/mcp-apps'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Text } from '@language-lit/material3-expressive'
import { docPageCopy, docPages, getDocPage, readDocSource } from '../content/docs'
import { renderMarkdown, stripLeadingHeading } from '../content/markdown'
import { DocsShell } from '../ui/DocsShell'
import { Prose } from '../ui/Prose'
import { StructuredData, breadcrumbList } from '../ui/StructuredData'
import { absoluteUrl, openGraphFor, packageName, siteUrl } from '../content/site'
import { localeAlternates, localizePath, type Locale } from '../i18n/locales'
import { shellMessages } from '../i18n/messages/shell'
import { agUiPackage } from '../content/ag-ui'
import { a2uiPackage } from '../content/a2ui'

const companionPackages: Record<string, string> = { 'AG-UI': agUiPackage, A2UI: a2uiPackage, 'MCP Apps': mcpAppsPackage }

export async function staticParams() {
  return docPages.map((page) => ({ slug: page.slug }))
}

export async function pageMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const page = getDocPage(slug)
  if (!page) return {}
  const { title, summary } = docPageCopy(page, locale)
  const pathname = `/docs/${page.slug}/`
  return {
    title,
    description: summary,
    alternates: localeAlternates(locale, pathname),
    openGraph: {
      ...openGraphFor(locale),
      type: 'article',
      url: absoluteUrl(localizePath(locale, pathname)),
    },
  }
}

export default async function DocPage({ locale, param: slug }: { locale: Locale; param: string }) {
  const page = getDocPage(slug)
  if (!page) notFound()

  const t = shellMessages[locale]
  const copy = docPageCopy(page, locale)
  const pathname = `/docs/${page.slug}/`
  const source = await readDocSource(page, locale)
  const { title, body } = stripLeadingHeading(source)
  const { html } = renderMarkdown(body, locale)

  return (
    <DocsShell locale={locale}>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: title ?? copy.title,
          description: copy.summary,
          url: absoluteUrl(localizePath(locale, pathname)),
          inLanguage: locale,
          isPartOf: { '@type': 'WebSite', name: t.siteName, url: siteUrl },
          about: { '@type': 'SoftwareSourceCode', name: (page.section && companionPackages[page.section]) || packageName },
          author: { '@type': 'Person', name: 'Romullo Queiroz' },
          license: 'https://opensource.org/licenses/MIT',
        }}
      />
      <StructuredData
        data={breadcrumbList(
          [
            { name: t.guides, path: '/docs/' },
            { name: copy.title, path: pathname },
          ],
          locale,
        )}
      />
      <article>
        <div className="page-head">
          <span className="page-head__eyebrow">{page.section ? t.sectionGuide(page.section) : t.guide}</span>
          <Text
            as="h1"
            variant="displaySmall"
            emphasis="emphasized"
            className="page-head__title"
          >
            {title ?? copy.title}
          </Text>
          <Text as="p" variant="bodyLarge">
            {copy.summary}
          </Text>
        </div>
        <Prose html={html} />
      </article>
    </DocsShell>
  )
}
