import { mcpAppsDescription } from '../../content/mcp-apps'
import { getComponentsByKind } from '../../content/inventory'
import { a2uiDocPages, agUiDocPages, mcpAppsDocPages, docPages } from '../../content/docs'
import { componentLead } from '../../content/summaries'
import { agUiDescription } from '../../content/ag-ui'
import { a2uiDescription } from '../../content/a2ui'
import {
  absoluteUrl,
  npmUrl,
  packageName,
  repositoryUrl,
  siteName,
} from '../../content/site'

/**
 * `/llms.txt`, per the llmstxt.org convention: one plain-text index that states
 * what this package is and lists every guide and component page as an absolute
 * URL with a one-line description.
 *
 * The site's own navigation is a client component — a crawler that does not run
 * JavaScript sees the links, but only after several kilobytes of theme-control
 * and drawer markup. This file is the same map with none of the chrome, which
 * is the difference between an assistant summarising the library and an
 * assistant summarising the navigation.
 */
export const dynamic = 'force-static'

export async function GET() {
  const groups = await getComponentsByKind()
  const total = groups.reduce((sum, group) => sum + group.components.length, 0)

  const lines: string[] = [
    `# ${siteName}`,
    '',
    `> ${packageName} is a React implementation of Google's Material 3`,
    `> Expressive design system: ${total} conformant components with native web`,
    '> semantics, precompiled CSS, typed theme and token APIs, and no runtime',
    '> dependencies. It supports React 18 and 19, server rendering, and',
    '> light/dark/system color modes.',
    '',
    '- Install: `npm install ' + packageName + '`',
    `- Package: ${npmUrl}`,
    `- Source: ${repositoryUrl}`,
    '- License: MIT. This is an independent implementation; Material 3 is a',
    '  Google design system.',
    '',
    `- Japanese: every page below also exists in Japanese under ${absoluteUrl('/ja/')} (same paths after the prefix).`,
    '',
    '## Companion libraries',
    '',
    `- [AG-UI demo](${absoluteUrl('/ag-ui/')}): ${agUiDescription} No LLM or API key required.`,
    ...agUiDocPages.map((page) => `- [${page.title}](${absoluteUrl(`/docs/${page.slug}/`)}): ${page.summary}`),
    `- [A2UI demo](${absoluteUrl('/a2ui/')}): ${a2uiDescription} No LLM or API key required.`,
    ...a2uiDocPages.map((page) => `- [${page.title}](${absoluteUrl(`/docs/${page.slug}/`)}): ${page.summary}`),
    '',
    `- [MCP Apps demo](${absoluteUrl('/mcp-apps/')}): ${mcpAppsDescription}` ,
    ...mcpAppsDocPages.map((page) => `- [${page.title}](${absoluteUrl(`/docs/${page.slug}/`)}): ${page.summary}`),
    '',
    '## Guides',
    '',
    ...docPages.filter((page) => !page.section).map(
      (page) => `- [${page.title}](${absoluteUrl(`/docs/${page.slug}/`)}): ${page.summary}`,
    ),
    '',
    '## Components',
    '',
    `- [All components](${absoluteUrl('/components/')}): the complete catalogue, grouped by role.`,
    '',
  ]

  for (const group of groups) {
    lines.push(`### ${group.label}`, '')
    for (const component of group.components) {
      // The component's own opening sentence, not a description of the page's
      // section headings. This index exists to be read instead of the site, so
      // a line that says "anatomy, variants, states" for all thirty-two of them
      // costs a reader the entire distinction between one component and the next.
      const summary = await componentLead(component.name)
      lines.push(
        `- [${component.name}](${absoluteUrl(`/components/${component.name}/`)}): ` +
          `${summary} ` +
          `Exports ${component.publicExports.join(', ')}.`,
      )
    }
    lines.push('')
  }

  lines.push(
    '## Optional',
    '',
    `- [Full documentation as one file](${absoluteUrl('/llms-full.txt')}): every`,
    '  guide and component document concatenated, for ingesting in a single fetch.',
    '',
  )

  return new Response(lines.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
    },
  })
}
