import { readFile } from 'node:fs/promises'
import { componentDocPath } from './docs'
import { defaultLocale, type Locale } from '../i18n/locales'
import { shellMessages } from '../i18n/messages/shell'
import { leadParagraph, truncateForMeta } from './markdown'

/**
 * Component leads, read once per component per build. `generateMetadata`, the
 * page body and `/llms.txt` all want this string, and Next calls each of them
 * separately.
 */
const cache = new Map<string, Promise<string>>()

async function read(name: string, locale: Locale): Promise<string> {
  // The template that stood in before the documents themselves were read.
  const fallback = shellMessages[locale].componentFallback(name)
  try {
    const source = await readFile(componentDocPath(locale, name), 'utf8')
    return leadParagraph(source) ?? fallback
  } catch {
    return fallback
  }
}

/**
 * A component's opening prose, in full.
 *
 * The fallback is not dead code — a new component's document is written after
 * its inventory entry lands, and a page that briefly describes itself
 * generically beats a build that fails on a missing paragraph.
 */
export function componentLead(name: string, locale: Locale = defaultLocale): Promise<string> {
  const key = `${locale}:${name}`
  let pending = cache.get(key)

  if (!pending) {
    pending = read(name, locale)
    cache.set(key, pending)
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
export async function componentDescription(name: string, locale: Locale = defaultLocale): Promise<string> {
  // A Japanese character fills about twice the width of a Latin one in a
  // result snippet, so the same pixel budget holds fewer of them.
  return truncateForMeta(await componentLead(name, locale), locale === 'ja' ? 110 : 160)
}
