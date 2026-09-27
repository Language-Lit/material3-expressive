import { mcpAppsDescription } from './mcp-apps'
import { getConformantComponents } from './inventory'
import { docPages } from './docs'
import { agUiDescription } from './ag-ui'
import { a2uiDescription } from './a2ui'

/**
 * The canonical origin. Every absolute URL the site emits — canonical links,
 * Open Graph, the sitemap, robots, llms.txt, JSON-LD — derives from this one
 * constant, so a domain move cannot leave half the surface pointing at the old
 * host.
 */
export const siteUrl = 'https://m3e.language-lit.com'

export const siteName = 'Material 3 Expressive for React'

// Kept under the ~155 characters a search result shows before truncating, and
// led by the words people search with rather than by the tagline.
export const siteDescription =
  'Material 3 Expressive components for React 18 and 19. TypeScript, SSR-ready, accessible, themeable. Independent, MIT licensed, zero runtime dependencies.'

/**
 * The link-preview card `app/opengraph-image.tsx` renders. It lives here so the
 * pages that must name it explicitly (see `openGraphDefaults`) describe the same
 * image the route draws.
 */
export const socialImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'Google’s Material 3 Expressive. Built for React. An independent implementation.',
}

/**
 * The Open Graph fields every page shares. A page that declares `openGraph`
 * replaces its parent's object wholesale rather than merging with it, which
 * drops the root's generated card along with the site name and locale: every
 * page but the home page previewed as a bare title. Pages spread this and add
 * their own URL; their title and description are inherited from the page's own
 * metadata, template included.
 */
export const openGraphDefaults = {
  type: 'website' as const,
  siteName,
  locale: 'en_US',
  images: [socialImage],
}

export const packageName = '@language-lit/material3-expressive'

export const repositoryUrl = 'https://github.com/Language-Lit/material3-expressive'

export const npmUrl = `https://www.npmjs.com/package/${packageName}`

/**
 * Builds an absolute URL from a site-root path.
 *
 * `next.config.mjs` pins `trailingSlash`, so every route is emitted as
 * `<route>/index.html` and every route path here carries its trailing slash.
 * Emitting a canonical without it would point at a URL the export does not
 * serve, which is worse than emitting none at all.
 */
export function absoluteUrl(pathname: string): string {
  return new URL(pathname, siteUrl).href
}

export interface SiteRoute {
  path: string
  title: string
  summary: string
  /** Relative crawl priority, mirrored into the sitemap. */
  priority: number
  /**
   * The repository file whose content this route publishes, relative to the
   * repository root. The sitemap reads its commit date to date the URL. Index
   * routes name their own page component, because their content is the listing
   * that component renders.
   */
  source: string
}

/**
 * Every indexable route the export produces, in the order a reader would meet
 * them. This is the single enumeration behind the sitemap and llms.txt: both
 * read the inventory and the guide list rather than repeating a hand-written
 * URL table that drifts the moment a component ships.
 */
export async function getSiteRoutes(): Promise<SiteRoute[]> {
  const components = await getConformantComponents()

  return [
    {
      path: '/',
      title: siteName,
      summary: siteDescription,
      priority: 1,
      source: 'site/app/page.tsx',
    },
    {
      path: '/ag-ui/',
      title: 'AG-UI for React',
      summary: agUiDescription,
      priority: 0.9,
      source: 'site/app/ag-ui/page.tsx',
    },
    {
      path: '/a2ui/',
      title: 'A2UI for React',
      summary: a2uiDescription,
      priority: 0.9,
      source: 'site/app/a2ui/page.tsx',
    },
    {
      path: '/mcp-apps/',
      title: 'MCP Apps for React', summary: mcpAppsDescription, priority: 0.9, source: 'site/app/mcp-apps/page.tsx',
    },
    {
      path: '/docs/',
      title: 'Guides',
      summary: 'Installation, theming, server rendering, and migration guides.',
      priority: 0.9,
      source: 'site/app/docs/page.tsx',
    },
    ...docPages.map((page) => ({
      path: `/docs/${page.slug}/`,
      title: page.title,
      summary: page.summary,
      priority: 0.8,
      source: `docs/${page.file}`,
    })),
    {
      path: '/components/',
      title: 'Components',
      summary: `All ${components.length} conformant components, grouped by role.`,
      priority: 0.9,
      source: 'site/app/components/page.tsx',
    },
    ...components.map((component) => ({
      path: `/components/${component.name}/`,
      title: component.name,
      summary: `${component.name} — anatomy, variants, states, accessibility, and tokens.`,
      priority: 0.7,
      source: `docs/components/${component.name}.md`,
    })),
  ]
}
