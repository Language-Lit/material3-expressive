import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { componentDocsRoot, docsRoot } from './paths'
import { defaultLocale, localizePath, type Locale } from '../i18n/locales'
import { docPageText } from '../i18n/messages/docPages'

export interface DocPage {
  slug: string
  file: string
  title: string
  summary: string
  section?: 'AG-UI' | 'A2UI' | 'MCP Apps'
}

export const agUiDocPages: readonly DocPage[] = [
  {
    slug: 'ag-ui-getting-started',
    file: 'AG_UI_GETTING_STARTED.md',
    title: 'Getting started with AG-UI',
    summary: 'Install the companion, connect an agent, and add a conversation to your app.',
    section: 'AG-UI',
  },
  {
    slug: 'ag-ui-components',
    file: 'AG_UI_COMPONENTS.md',
    title: 'AG-UI components and tool renderers',
    summary: 'Compose a thread, render tools as components, share state, and handle approvals.',
    section: 'AG-UI',
  },
  {
    slug: 'ag-ui-copilotkit',
    file: 'AG_UI_COPILOTKIT.md',
    title: 'AG-UI with CopilotKit',
    summary: 'Use the Material adapter with CopilotKit 1.71.x v1.',
    section: 'AG-UI',
  },
]

export const a2uiDocPages: readonly DocPage[] = [
  {
    slug: 'a2ui-getting-started',
    file: 'A2UI_GETTING_STARTED.md',
    title: 'Getting started with A2UI',
    summary: 'Install the renderer, stream A2UI messages into surfaces, and send actions back to the agent.',
    section: 'A2UI',
  },
  {
    slug: 'a2ui-components',
    file: 'A2UI_COMPONENTS.md',
    title: 'A2UI components and rendering rules',
    summary: 'How each basic-catalog component renders, plus binding, validation, templates, theming, and catalog extension.',
    section: 'A2UI',
  },
]

export const mcpAppsDocPages: readonly DocPage[] = [
  { slug: 'mcp-apps-getting-started', file: 'MCP_APPS_GETTING_STARTED.md', title: 'Getting started with MCP Apps', summary: 'Install the companion, register an app resource, and connect a Material app to its host.', section: 'MCP Apps' },
  { slug: 'mcp-apps-hosting', file: 'MCP_APPS_HOSTING.md', title: 'Hosting and theming MCP Apps', summary: 'Embed apps, pass tool results, configure capabilities and sandbox policy, and share host styles.', section: 'MCP Apps' },
]

/**
 * The long-form documents published as site routes, in reading order.
 *
 * Contributor-facing documents — the specification, architecture, ADRs, release
 * readiness — are deliberately absent. They describe how the library is built
 * rather than how it is used, and they link to repository paths that have no
 * meaning on the site. `repositoryOnlyDocs` routes them to GitHub instead.
 */
export const docPages: readonly DocPage[] = [
  {
    slug: 'getting-started',
    file: 'GETTING_STARTED.md',
    title: 'Getting started',
    summary: 'Install the package, render a provider, and load the stylesheet.',
  },
  {
    slug: 'theming',
    file: 'THEMING.md',
    title: 'Theming',
    summary: 'Create themes, override tokens, and nest theme scopes.',
  },
  {
    slug: 'ssr',
    file: 'SSR.md',
    title: 'SSR and color mode',
    summary: 'Server rendering, hydration, and the system color-mode path.',
  },
  {
    slug: 'web-deviations',
    file: 'WEB_DEVIATIONS.md',
    title: 'Web deviations',
    summary: 'Where this implementation departs from the platform APIs, and why.',
  },
  {
    slug: 'migration',
    file: 'MIGRATION.md',
    title: 'Migrating from 0.3',
    summary: 'The 0.3 to 1.0 API, token, and stylesheet moves.',
  },
  {
    slug: 'release-notes',
    file: 'RELEASE_NOTES.md',
    title: 'Release notes',
    summary: 'Versioned changes and breaking changes.',
  },
  ...agUiDocPages,
  ...a2uiDocPages,
  ...mcpAppsDocPages,
]

const repositoryBlob =
  'https://github.com/Language-Lit/material3-expressive/blob/main/docs'

/** Documents that stay in the repository; links to them leave the site. */
const repositoryOnlyDocs: Record<string, string> = {
  'ARCHITECTURE.md': `${repositoryBlob}/ARCHITECTURE.md`,
  'SPEC.md': `${repositoryBlob}/SPEC.md`,
  'RELEASE_READINESS.md': `${repositoryBlob}/RELEASE_READINESS.md`,
  'TOKEN_PROVENANCE.md': `${repositoryBlob}/TOKEN_PROVENANCE.md`,
  'BROWSER_SUPPORT.md': `${repositoryBlob}/BROWSER_SUPPORT.md`,
}

/**
 * Rewrites a repository-relative Markdown link to its site route. Returns null
 * when the target has no site route and no repository fallback, so the caller
 * can fail rather than emit a link that 404s on the published site.
 */
export function resolveDocLink(href: string, locale: Locale = defaultLocale): string | null {
  if (/^(https?:)?\/\//.test(href) || href.startsWith('#')) return href
  const route = resolveDocRoute(href)
  return route?.startsWith('/') ? localizePath(locale, route) : route
}

function resolveDocRoute(href: string): string | null {

  const [target, hash = ''] = href.split('#')
  const suffix = hash ? `#${hash}` : ''
  const file = path.basename(target)

  if (file === 'SUPPORTED_COMPONENTS.md') return `/components/${suffix}`
  if (file === 'README.md') return `/docs/${suffix}`

  const page = docPages.find((candidate) => candidate.file === file)
  if (page) return `/docs/${page.slug}/${suffix}`

  if (target.startsWith('components/') || target.includes('/components/')) {
    const component = path.basename(target, '.md')
    return `/components/${component}/${suffix}`
  }

  const repositoryDoc = repositoryOnlyDocs[file]
  if (repositoryDoc) return `${repositoryDoc}${suffix}`

  return null
}

export function getDocPage(slug: string): DocPage | undefined {
  return docPages.find((page) => page.slug === slug)
}

/**
 * Where a published Markdown source lives in `locale`. Translations mirror the
 * English layout under `docs/<locale>/` (ADR 0045).
 */
export function localizedDocPath(locale: Locale, relativePath: string): string {
  return locale === defaultLocale
    ? path.join(docsRoot, relativePath)
    : path.join(docsRoot, locale, relativePath)
}

export function componentDocPath(locale: Locale, name: string): string {
  return locale === defaultLocale
    ? path.join(componentDocsRoot, `${name}.md`)
    : localizedDocPath(locale, path.join('components', `${name}.md`))
}

/** A guide's title and summary in `locale`. A missing translation fails the build. */
export function docPageCopy(page: DocPage, locale: Locale): { title: string; summary: string } {
  if (locale === defaultLocale) return page
  const copy = docPageText[locale]?.[page.slug]
  if (!copy) throw new Error(`Missing ${locale} title and summary for guide "${page.slug}".`)
  return copy
}

export async function readDocSource(page: DocPage, locale: Locale = defaultLocale): Promise<string> {
  return readFile(localizedDocPath(locale, page.file), 'utf8')
}
