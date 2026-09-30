import { getComponentsByKind } from './inventory'
import { a2uiDocPages, agUiDocPages, mcpAppsDocPages, docPages, docPageCopy, type DocPage } from './docs'
import { localizePath, type Locale } from '../i18n/locales'
import { shellMessages } from '../i18n/messages/shell'

export interface NavigationGroup {
  label: string
  links: { label: string; href: string }[]
}

/**
 * The site's full navigation tree, grouped the way the inventory groups
 * components. Shared by the desktop sidebar and the mobile drawer so the two
 * cannot present different destinations.
 */
export async function buildNavigationGroups(locale: Locale): Promise<NavigationGroup[]> {
  const byKind = await getComponentsByKind(locale)
  const t = shellMessages[locale]
  const guide = (page: DocPage) => ({ label: docPageCopy(page, locale).title, href: `/docs/${page.slug}/` })
  const groups: NavigationGroup[] = [
    {
      label: t.guides,
      links: docPages.filter((page) => !page.section).map(guide),
    },
    {
      label: 'AG-UI',
      links: [
        { label: t.interactiveDemo, href: '/ag-ui/' },
        ...agUiDocPages.map(guide),
      ],
    },
    {
      label: 'A2UI',
      links: [
        { label: t.interactiveDemo, href: '/a2ui/' },
        ...a2uiDocPages.map(guide),
      ],
    },
    {
      label: 'MCP Apps',
      links: [{ label: t.interactiveDemo, href: '/mcp-apps/' }, ...mcpAppsDocPages.map(guide)],
    },
    {
      label: t.overview,
      links: [
        { label: t.allComponents, href: '/components/' },
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
  return groups.map((group) => ({
    ...group,
    links: group.links.map((link) => ({ ...link, href: localizePath(locale, link.href) })),
  }))
}
