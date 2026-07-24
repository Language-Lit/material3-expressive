import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defaultTokenSet } from '../../../src/tokens'

const componentSource = readFileSync(
  fileURLToPath(new URL('../../../src/components/Divider/Divider.tsx', import.meta.url)),
  'utf8',
)
const css = readFileSync(
  fileURLToPath(new URL('../../../src/components/Divider/Divider.css', import.meta.url)),
  'utf8',
)
const split = (source: string) => source.trim().split(/\s+/)

/**
 * Git blob hashes of the pinned AndroidX files at revision
 * `a90df2fc27e026b9ad2ed569f203a260c1041fab`, the same revision T40 pinned.
 * Sharing it is deliberate: `ListTokens` declares four `Divider*Space` roles,
 * so the two ledgers must describe one upstream snapshot to stay comparable.
 */
const pinnedFiles = {
  'Divider.kt': '680a5061c2dc4ee36278f0be935762ce71ee85d4',
  'DividerTokens.kt': 'df21b7d9919ff4a0d5ff046c253c5fbad052fa20',
  'DividerTest.kt': '387eefefa64167bc2d239949dee2b170efc28724',
  'DividerScreenshotTest.kt': '3813cd1ab892d1a0fae7f89a80b3ffd056f6048f',
} as const

/** Every declaration in the generated `DividerTokens.kt` (VERSION v0_117). */
const tokenDeclarations = split(`
  Color Thickness
`)

/** The pinned `Divider.kt` reads both, so there is no unread remainder. */
const tokenReads = split(`
  Color Thickness
`)

const currentSurface = split(`
  HorizontalDivider HorizontalDivider.modifier HorizontalDivider.thickness
  HorizontalDivider.color VerticalDivider VerticalDivider.modifier
  VerticalDivider.thickness VerticalDivider.color DividerDefaults
  DividerDefaults.Thickness DividerDefaults.color
`)

const deprecatedSurface = split(`
  Divider Divider.modifier Divider.thickness Divider.color
`)

const behaviorTests = split(`
  horizontalDivider_defaultSize horizontalDivider_customSize
  verticalDivider_defaultSize verticalDivider_customSize
  divider_withIndent_doesNotChangeSize divider_hairlineThickness
`)

const screenshotTests = split(`
  horizontalDivider_lightTheme horizontalDivider_darkTheme
  verticalDivider_lightTheme horizontalDivider_hairlineThickness
`)

const implementationAnomalies = split(`
  kdoc-promises-hairline-single-pixel-but-modern-composables-lay-out-at-zero
  deprecated-Divider-fills-a-background-box-while-current-ones-stroke-a-canvas
  generated-token-file-is-v0_117-while-the-shared-revision-list-tokens-are-29_0_0
  screenshot-coverage-omits-verticalDivider-darkTheme
`)

describe('Divider pinned-source completeness ledger', () => {
  it('freezes every pinned source file identity', () => {
    expect(Object.keys(pinnedFiles)).toHaveLength(4)
    expect(new Set(Object.values(pinnedFiles)).size).toBe(4)
    expect(Object.values(pinnedFiles).every((blob) => /^[0-9a-f]{40}$/.test(blob))).toBe(true)
  })

  it('classifies every generated DividerTokens declaration as read or unread', () => {
    expect(tokenDeclarations).toHaveLength(2)
    expect(new Set(tokenDeclarations).size).toBe(2)
    expect(tokenReads.every((role) => tokenDeclarations.includes(role))).toBe(true)
    expect(tokenDeclarations.filter((role) => !tokenReads.includes(role))).toHaveLength(0)
  })

  it('registers one component token per read generated role', () => {
    const registration = defaultTokenSet.componentTokens.find(
      (candidate) => candidate.component === 'divider',
    )

    expect(registration?.task).toBe('T42')
    expect(registration?.source.revision).toBe('a90df2fc27e026b9ad2ed569f203a260c1041fab')
    expect(Object.keys(registration?.tokens ?? {}).sort()).toEqual(['color', 'thickness'])
    expect(registration?.tokens.color.value).toEqual({ $ref: 'sys.color.outlineVariant' })
    expect(registration?.tokens.thickness.value).toBe('1px')
  })

  it('accounts for current, deprecated, and anomalous source paths', () => {
    expect(currentSurface).toHaveLength(11)
    expect(deprecatedSurface).toHaveLength(4)
    expect(implementationAnomalies).toHaveLength(4)
  })

  it('maps both current composables onto one orientation prop rather than two exports', () => {
    expect(componentSource).toContain("orientation = 'horizontal'")
    expect(componentSource).toContain("data-m3e-orientation={orientation}")
    expect(componentSource).not.toContain('HorizontalDivider')
    expect(componentSource).not.toContain('VerticalDivider')
  })

  it('adapts the source thickness and color parameters to scoped custom properties', () => {
    expect(css).toContain('var(--m3e-comp-divider-thickness)')
    expect(css).toContain('var(--m3e-comp-divider-color)')
    expect(componentSource).not.toContain('thickness')
    expect(componentSource).not.toContain('style={{')
  })

  it('freezes all 6 behavior and 4 screenshot cases as audited inputs', () => {
    expect(behaviorTests).toHaveLength(6)
    expect(screenshotTests).toHaveLength(4)
    expect(new Set(behaviorTests).size).toBe(6)
    expect(new Set(screenshotTests).size).toBe(4)
    expect(screenshotTests).not.toContain('verticalDivider_darkTheme')
  })

  it('excludes the hairline parameter, which has no CSS equivalent', () => {
    // `Dp.Hairline` exists to escape density scaling and paint exactly one
    // physical pixel. A CSS pixel is already density-independent, and the
    // pinned `divider_hairlineThickness` test asserts the modern composables
    // lay out at zero height, so there is no size to reproduce either.
    expect(componentSource).not.toContain('hairline')
    expect(css).not.toContain('hairline')
  })
})
