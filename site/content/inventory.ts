import { readFile } from 'node:fs/promises'
import { inventoryPath } from './paths'
import { defaultLocale, type Locale } from '../i18n/locales'
import { shellMessages } from '../i18n/messages/shell'

export type ComponentKind =
  | 'foundation'
  | 'action'
  | 'containment'
  | 'input'
  | 'overlay'
  | 'feedback'
  | 'navigation'

export interface InventoryComponent {
  name: string
  kind: ComponentKind
  task: string
  path: string
  status: string
  dependencies: readonly string[]
  publicExports: readonly string[]
}

interface Inventory {
  schemaVersion: number
  components: InventoryComponent[]
}

let cached: Inventory | null = null

async function load(): Promise<Inventory> {
  if (!cached) cached = JSON.parse(await readFile(inventoryPath, 'utf8')) as Inventory
  return cached
}

/**
 * The site's component surface. Only `conformant` entries are routable: the
 * inventory is the single authority for what this package advertises, and
 * SPEC.md §4 forbids presenting anything beyond it.
 */
export async function getConformantComponents(): Promise<InventoryComponent[]> {
  const { components } = await load()
  return components
    .filter((component) => component.status === 'conformant')
    .sort((left, right) => left.name.localeCompare(right.name))
}

export async function getComponent(name: string): Promise<InventoryComponent | undefined> {
  const components = await getConformantComponents()
  return components.find((component) => component.name === name)
}

/** Display order for the sidebar: grouped by kind, then alphabetical. */
export const kindOrder: readonly ComponentKind[] = [
  'foundation',
  'action',
  'containment',
  'input',
  'overlay',
  'feedback',
  'navigation',
]

export const kindLabels: Record<ComponentKind, string> = shellMessages[defaultLocale].kinds

export async function getComponentsByKind(locale: Locale = defaultLocale): Promise<
  { kind: ComponentKind; label: string; components: InventoryComponent[] }[]
> {
  const components = await getConformantComponents()
  return kindOrder
    .map((kind) => ({
      kind,
      label: shellMessages[locale].kinds[kind],
      components: components.filter((component) => component.kind === kind),
    }))
    .filter((group) => group.components.length > 0)
}
