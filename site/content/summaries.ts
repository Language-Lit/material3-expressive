import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { componentDocsRoot } from './paths'
import { leadParagraph, truncateForMeta } from './markdown'

/**
 * Component leads, read once per component per build. `generateMetadata`, the
 * page body and `/llms.txt` all want this string, and Next calls each of them
 * separately.
 */
const cache = new Map<string, Promise<string>>()

/** The template that stood in before the documents themselves were read. */
function fallback(name: string): string {
  return `${name} — anatomy, variants, states, accessibility, and tokens in the Material 3 Expressive React package.`
}

async function read(name: string): Promise<string> {
  try {
    const source = await readFile(path.join(componentDocsRoot, `${name}.md`), 'utf8')
    return leadParagraph(source) ?? fallback(name)
  } catch {
    return fallback(name)
  }
}

/**
 * A component's opening prose, in full.
 *
 * The fallback is not dead code — a new component's document is written after
 * its inventory entry lands, and a page that briefly describes itself
 * generically beats a build that fails on a missing paragraph.
 */
export function componentLead(name: string): Promise<string> {
  let pending = cache.get(name)

  if (!pending) {
    pending = read(name)
    cache.set(name, pending)
  }

  return pending
}

/**
 * The same prose, trimmed to what a search result will render.
 *
 * Only `<meta name="description">` takes this. `/llms.txt` publishes the lead
 * whole: its budget is the reader's context window, not a snippet width, and a
 * line reading "…without mutating the document root or… Exports X, Y" spends an
 * ellipsis to save forty characters from an audience that came for the detail.
 */
export async function componentDescription(name: string): Promise<string> {
  return truncateForMeta(await componentLead(name))
}
