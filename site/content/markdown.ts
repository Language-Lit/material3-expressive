import { Marked, type Tokens } from 'marked'
import { escapeHtml, highlight } from './highlight'
import { resolveDocLink } from './docs'

export interface Heading {
  id: string
  depth: number
  text: string
}

export interface RenderedMarkdown {
  html: string
  headings: Heading[]
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/** Strips the leading `# Title` so a page can render its own heading. */
export function stripLeadingHeading(source: string): { title: string | null; body: string } {
  const match = source.match(/^#\s+(.+)\n+/)
  if (!match) return { title: null, body: source }
  return { title: match[1].trim(), body: source.slice(match[0].length) }
}

/**
 * The opening prose of a document, flattened to one line.
 *
 * Every component document opens by saying what the component *is* — the one
 * passage on the page that distinguishes it from the other thirty-one. The
 * descriptions these pages used to publish were a fixed template with the name
 * slotted in ("Button — anatomy, variants, states…"), which is unique per page
 * and informative on none of them: it describes the shape of the document
 * rather than the component, so a search result or an assistant summarising the
 * page had nothing to quote that distinguished Button from SplitButton.
 */
export function leadParagraph(source: string): string | null {
  const { body } = stripLeadingHeading(source)

  for (const block of body.split(/\n\s*\n/)) {
    const text = block.trim()
    // Fences, tables, lists, quotes and subheadings are structure, not prose.
    if (!text || /^(```|~~~|\||[-*+>]\s|\d+\.\s|#)/.test(text)) continue

    const flattened = text
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_]{2}([^*_]+)[*_]{2}/g, '$1')
      // A hard-wrapped line ending in a slash is one token split across two
      // lines — "icon/title/\ncontent/actions". Collapsing every newline to a
      // space would publish "icon/title/ content/actions".
      .replace(/\/\n[ \t]*/g, '/')
      .replace(/\s+/g, ' ')
      .trim()

    if (flattened) return flattened
  }

  return null
}

/**
 * Trims prose to a length a search result will actually render.
 *
 * A sentence boundary is preferred over an ellipsis, but only past the halfway
 * mark — cutting a 160-character budget down to 20 because the lead opens with
 * "It is." would lose more than the truncation saves.
 */
export function truncateForMeta(text: string, limit = 160): string {
  if (text.length <= limit) return text

  const sentenceEnd = text.slice(0, limit + 1).lastIndexOf('. ')
  if (sentenceEnd >= limit * 0.5) return text.slice(0, sentenceEnd + 1)

  const wordEnd = text.slice(0, limit - 1).lastIndexOf(' ')
  return `${text.slice(0, wordEnd > 0 ? wordEnd : limit - 1).trimEnd()}…`
}

export function renderMarkdown(source: string): RenderedMarkdown {
  const headings: Heading[] = []
  const used = new Map<string, number>()
  // A link the repository can resolve but the site cannot is a real defect —
  // it would ship as a 404. Collect them and throw once, with every bad target
  // named, rather than failing on the first.
  const unresolved: string[] = []

  const marked = new Marked({ gfm: true })

  marked.use({
    renderer: {
      code({ text, lang }: Tokens.Code) {
        const language = (lang || 'tsx').trim().split(/\s+/)[0]
        return (
          `<figure class="code" data-language="${escapeHtml(language)}">` +
          `<pre class="code__pre"><code>${highlight(text, language)}</code></pre>` +
          `</figure>`
        )
      },

      heading({ tokens, depth }: Tokens.Heading) {
        const text = this.parser.parseInline(tokens)
        const plain = text.replace(/<[^>]+>/g, '')
        const base = slugify(plain)
        const seen = used.get(base) ?? 0
        used.set(base, seen + 1)
        const id = seen === 0 ? base : `${base}-${seen}`
        headings.push({ id, depth, text: plain })
        return `<h${depth} id="${id}" class="prose__heading">${text}</h${depth}>`
      },

      link({ href, title, tokens }: Tokens.Link) {
        const text = this.parser.parseInline(tokens)
        const resolved = resolveDocLink(href)
        if (resolved === null) {
          unresolved.push(href)
          return text
        }
        const external = /^https?:/.test(resolved)
        const attributes = [
          `href="${escapeHtml(resolved)}"`,
          title ? `title="${escapeHtml(title)}"` : '',
          external ? 'target="_blank" rel="noreferrer"' : '',
        ]
          .filter(Boolean)
          .join(' ')
        return `<a ${attributes}>${text}</a>`
      },

      table(token: Tokens.Table) {
        const head = token.header
          .map((cell) => `<th>${this.parser.parseInline(cell.tokens)}</th>`)
          .join('')
        const body = token.rows
          .map(
            (row) =>
              `<tr>${row
                .map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`)
                .join('')}</tr>`,
          )
          .join('')
        // Wide tables must scroll inside their own container rather than
        // widening the page.
        return (
          `<div class="prose__table-scroll"><table class="prose__table">` +
          `<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`
        )
      },
    },
  })

  const html = marked.parse(source, { async: false }) as string

  if (unresolved.length > 0) {
    throw new Error(
      `Markdown links have no site route: ${[...new Set(unresolved)].join(', ')}. ` +
        'Add a mapping in site/content/docs.ts or change the link.',
    )
  }

  return { html, headings }
}
