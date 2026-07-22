import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Text } from '@language-lit/material3-expressive'
import { docPages, getDocPage, readDocSource } from '../../../content/docs'
import { renderMarkdown, stripLeadingHeading } from '../../../content/markdown'
import { DocsShell } from '../../../ui/DocsShell'
import { Prose } from '../../../ui/Prose'
import { StructuredData, breadcrumbList } from '../../../ui/StructuredData'
import { absoluteUrl, packageName, siteName, siteUrl } from '../../../content/site'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return docPages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = getDocPage(slug)
  if (!page) return {}
  return {
    title: page.title,
    description: page.summary,
    alternates: { canonical: `/docs/${page.slug}/` },
    openGraph: {
      type: 'article',
      url: absoluteUrl(`/docs/${page.slug}/`),
      title: page.title,
      description: page.summary,
    },
  }
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params
  const page = getDocPage(slug)
  if (!page) notFound()

  const source = await readDocSource(page)
  const { title, body } = stripLeadingHeading(source)
  const { html } = renderMarkdown(body)

  return (
    <DocsShell>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: title ?? page.title,
          description: page.summary,
          url: absoluteUrl(`/docs/${page.slug}/`),
          inLanguage: 'en',
          isPartOf: { '@type': 'WebSite', name: siteName, url: siteUrl },
          about: { '@type': 'SoftwareSourceCode', name: packageName },
          author: { '@type': 'Person', name: 'Romullo Queiroz' },
          license: 'https://opensource.org/licenses/MIT',
        }}
      />
      <StructuredData
        data={breadcrumbList([
          { name: 'Guides', path: '/docs/' },
          { name: page.title, path: `/docs/${page.slug}/` },
        ])}
      />
      <article>
        <div className="page-head">
          <span className="page-head__eyebrow">Guide</span>
          <Text
            as="h1"
            variant="displaySmall"
            emphasis="emphasized"
            className="page-head__title"
          >
            {title ?? page.title}
          </Text>
          <Text as="p" variant="bodyLarge">
            {page.summary}
          </Text>
        </div>
        <Prose html={html} />
      </article>
    </DocsShell>
  )
}
