import { readFile } from 'node:fs/promises'
import { getConformantComponents } from './inventory'
import { componentDocPath, docPageCopy, docPages, localizedDocPath } from './docs'
import { localizePath, type Locale } from '../i18n/locales'
import { shellMessages } from '../i18n/messages/shell'
import { agUiMessages } from '../i18n/messages/agUi'
import { a2uiMessages } from '../i18n/messages/a2ui'
import { mcpAppsMessages } from '../i18n/messages/mcpApps'

export interface SearchEntry {
  title: string
  href: string
  group: string
  /** Lowercased haystack: title, exported symbol names, and a prose excerpt. */
  terms: string
  excerpt: string
}

/** The first paragraph of a Markdown document, flattened to plain text. */
function firstParagraph(source: string): string {
  const body = source.replace(/^#\s+.+\n+/, '')
  const paragraph = body.split(/\n\s*\n/).find((block) => {
    const trimmed = block.trim()
    return trimmed.length > 0 && !trimmed.startsWith('```') && !trimmed.startsWith('|')
  })
  return (paragraph ?? '')
    .replace(/`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Builds the client search index at build time.
 *
 * A static export has no server to query, and the site takes no search
 * dependency, so the index ships as data and is filtered in the browser. It
 * stays small because it indexes titles, exported symbols, and one excerpt per
 * page rather than full document text.
 */
export async function buildSearchIndex(locale: Locale): Promise<SearchEntry[]> {
  const components = await getConformantComponents()
  const t = shellMessages[locale]

  const componentEntries = await Promise.all(
    components.map(async (component): Promise<SearchEntry> => {
      const source = await readFile(componentDocPath(locale, component.name), 'utf8')
      const excerpt = firstParagraph(source)
      return {
        title: component.name,
        href: localizePath(locale, `/components/${component.name}/`),
        group: t.kinds[component.kind],
        terms: [component.name, ...component.publicExports, excerpt]
          .join(' ')
          .toLowerCase(),
        excerpt,
      }
    }),
  )

  const docEntries = await Promise.all(
    docPages.map(async (page): Promise<SearchEntry> => {
      const source = await readFile(localizedDocPath(locale, page.file), 'utf8')
      const { title, summary } = docPageCopy(page, locale)
      const excerpt = summary || firstParagraph(source)
      return {
        title,
        href: localizePath(locale, `/docs/${page.slug}/`),
        group: page.section ?? t.guides,
        // The English title stays searchable, so "theming" finds テーマ設定.
        terms: [title, page.title, summary, firstParagraph(source)].join(' ').toLowerCase(),
        excerpt,
      }
    }),
  )

  const demo = (
    messages: { description: string; searchTitle: string },
    href: string,
    keywords: string,
  ): SearchEntry => ({
    title: messages.searchTitle,
    href: localizePath(locale, href),
    group: t.demos,
    terms: `${keywords} ${messages.searchTitle} ${messages.description}`.toLowerCase(),
    excerpt: messages.description,
  })

  return [
    demo(agUiMessages[locale], '/ag-ui/', 'ag-ui agents ai streaming reasoning tools weather approval interrupts copilotkit'),
    demo(a2uiMessages[locale], '/a2ui/', 'a2ui google agents generative ui surfaces catalog renderer data binding validation actions streaming'),
    demo(mcpAppsMessages[locale], '/mcp-apps/', 'mcp apps tools iframe host provider model context'),
    ...docEntries,
    ...componentEntries,
  ]
}
