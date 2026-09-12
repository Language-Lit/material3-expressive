import { getComponentsByKind } from './inventory'
import { a2uiDocPages, agUiDocPages, mcpAppsDocPages, docPages } from './docs'

export interface NavigationGroup {
  label: string
  links: { label: string; href: string }[]
}

/**
 * The site's full navigation tree, grouped the way the inventory groups
 * components. Shared by the desktop sidebar and the mobile drawer so the two
 * cannot present different destinations.
 */
export async function buildNavigationGroups(): Promise<NavigationGroup[]> {
  const byKind = await getComponentsByKind()
  return [
    {
      label: 'Guides',
      links: docPages.filter((page) => !page.section).map((page) => ({
        label: page.title,
        href: `/docs/${page.slug}/`,
      })),
    },
    {
      label: 'AG-UI',
      links: [
        { label: 'Interactive demo', href: '/ag-ui/' },
        ...agUiDocPages.map((page) => ({ label: page.title, href: `/docs/${page.slug}/` })),
      ],
    },
    {
      label: 'A2UI',
      links: [
        { label: 'Interactive demo', href: '/a2ui/' },
        ...a2uiDocPages.map((page) => ({ label: page.title, href: `/docs/${page.slug}/` })),
      ],
    },
    {
      label: 'MCP Apps',
      links: [{ label: 'Interactive demo', href: '/mcp-apps/' }, ...mcpAppsDocPages.map((page) => ({ label: page.title, href: `/docs/${page.slug}/` }))],
    },
    {
      label: 'Overview',
      links: [
        { label: 'All components', href: '/components/' },
      ],
    },
    ...byKind.map((group) => ({
      label: group.label,
      links: group.components.map((component) => ({
        label: component.name,
        href: `/components/${component.name}/`,
      })),
    })),
  ]
}
