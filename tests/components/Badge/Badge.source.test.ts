import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defaultTokenSet } from '../../../src/tokens'

const read = (path: string) =>
  readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8')

const badgeSource = read('../../../src/components/Badge/Badge.tsx')
const anchorSource = read('../../../src/components/Badge/BadgeAnchor.tsx')
const css = read('../../../src/components/Badge/Badge.css')
const drawerCss = read('../../../src/components/NavigationDrawer/NavigationDrawer.css')
const split = (source: string) => source.trim().split(/\s+/)

/**
 * Git blob hashes of the pinned AndroidX files at revision
 * `a90df2fc27e026b9ad2ed569f203a260c1041fab`, the revision T40 and T42 already
 * pin. All three ledgers therefore describe one upstream snapshot.
 */
const pinnedFiles = {
  'Badge.kt': 'bce545ee63216779e5a3b3b5b655f6475173842e',
  'BadgeTokens.kt': '97c4e3d92de650350e58a93e722a0803c07ef4a7',
  'BadgeTest.kt': '52e2b235f4db54b12264995629e06d99e1b68af5',
  'BadgeScreenshotTest.kt': '9b4909b933d0fba43e1b77a26ccc10128a36b2ce',
} as const

/** Every declaration in the generated `BadgeTokens.kt` (VERSION v0_103). */
const tokenDeclarations = split(`
  Color LargeColor LargeLabelTextColor LargeLabelTextFont LargeShape LargeSize
  Shape Size
`)

/** The six the pinned `Badge.kt` reads, `Color` through `BadgeDefaults`. */
const tokenReads = split(`
  Color LargeLabelTextFont LargeShape LargeSize Shape Size
`)

/**
 * `LargeColor` repeats `Color`'s `Error`, and `LargeLabelTextColor` repeats
 * what `contentColorFor(Error)` already resolves, so neither unread role
 * contradicts the code — unlike the `Tabs` divider role T42 corrected.
 */
const tokenUnread = split(`
  LargeColor LargeLabelTextColor
`)

const currentSurface = split(`
  BadgedBox BadgedBox.badge BadgedBox.modifier BadgedBox.content Badge
  Badge.modifier Badge.containerColor Badge.contentColor Badge.content
  BadgeDefaults BadgeDefaults.containerColor
`)

/** Geometry the source keeps as internal `Dp` values with no generated role. */
const internalGeometry = split(`
  BadgeWithContentHorizontalPadding BadgeWithContentHorizontalOffset
  BadgeWithContentVerticalOffset BadgeOffset BadgeTopRuler BadgeEndRuler
  badgeBounds
`)

/**
 * Every `Modifier.badgeBounds()` call site in the pinned `commonMain`. These
 * clamp a badge to the item's bounds; none of them exposes a `badge` parameter,
 * because the application passes a `BadgedBox` through the icon slot.
 */
const clampCallSites = split(`
  NavigationBar.kt:535 NavigationItem.kt:460 NavigationItem.kt:512
  NavigationRail.kt:541 Tab.kt:113
`)

const behaviorTests = split(`
  badge_noContent_size badge_shortContent_size badge_longContent_size
  badge_shortContent_customSizeModifier_size badge_noContent_shape
  badgeBox_noContent_position badgeBox_shortContent_position
  badgeBox_longContent_position
  badge_notMergingDescendants_withOwnContentDescription badgeBox_size
  badgeBox_smallGreatGrandParentAndLargeAnchor_adjustedBadge
`)

const screenshotTests = split(`
  lightTheme_noContent darkTheme_noContent lightTheme_withContent
  darkTheme_withContent
`)

const implementationAnomalies = split(`
  generated-LargeColor-duplicates-Color-so-one-container-color-serves-both-variants
  generated-LargeLabelTextColor-is-unread-because-contentColorFor-resolves-the-same-onError
  navigation-drawer-badge-is-a-trailing-label-not-the-anchored-error-pill
  navigation-drawer-LargeBadgeLabelColor-is-unread-and-wrong-for-the-selected-state
  badgeBox_shortContent_position-and-badgeBox_longContent_position-assert-identically
  labelled-position-tests-fold-in-the-content-padding-so-they-measure-the-label-not-the-container
  badgeBox_shortContent_position-is-suppressed-above-sdk-34-for-b-384973010
  generated-token-file-is-v0_103-older-than-every-other-family-this-revision-pins
`)

describe('Badge pinned-source completeness ledger', () => {
  it('freezes every pinned source file identity', () => {
    expect(Object.keys(pinnedFiles)).toHaveLength(4)
    expect(new Set(Object.values(pinnedFiles)).size).toBe(4)
    expect(Object.values(pinnedFiles).every((blob) => /^[0-9a-f]{40}$/.test(blob))).toBe(true)
  })

  it('classifies every generated BadgeTokens declaration as read or unread', () => {
    expect(tokenDeclarations).toHaveLength(8)
    expect(new Set(tokenDeclarations).size).toBe(8)
    expect(tokenReads).toHaveLength(6)
    expect(tokenUnread).toHaveLength(2)
    expect(tokenReads.every((role) => tokenDeclarations.includes(role))).toBe(true)
    expect(tokenDeclarations.filter((role) => !tokenReads.includes(role))).toEqual(tokenUnread)
  })

  it('registers the read roles plus the internal geometry the anchor needs', () => {
    const registration = defaultTokenSet.componentTokens.find(
      (candidate) => candidate.component === 'badge',
    )

    expect(registration?.task).toBe('T43')
    expect(registration?.source.revision).toBe('a90df2fc27e026b9ad2ed569f203a260c1041fab')
    expect(Object.keys(registration?.tokens ?? {}).sort()).toEqual([
      'color',
      'label-color',
      'large-horizontal-offset',
      'large-horizontal-padding',
      'large-size',
      'large-vertical-offset',
      'offset',
      'shape',
      'size',
    ])
    expect(registration?.tokens.color.value).toEqual({ $ref: 'sys.color.error' })
    expect(registration?.tokens['label-color'].value).toEqual({ $ref: 'sys.color.onError' })
    expect(registration?.tokens.size.value).toBe('6px')
    expect(registration?.tokens['large-size'].value).toBe('16px')
    expect(registration?.tokens['large-horizontal-padding'].value).toBe('4px')
    expect(registration?.tokens.offset.value).toBe('6px')
    expect(registration?.tokens['large-horizontal-offset'].value).toBe('12px')
    expect(registration?.tokens['large-vertical-offset'].value).toBe('14px')
  })

  it('accounts for the current surface, internal geometry, and clamp call sites', () => {
    expect(currentSurface).toHaveLength(11)
    expect(internalGeometry).toHaveLength(7)
    expect(clampCallSites).toHaveLength(5)
    expect(implementationAnomalies).toHaveLength(8)
  })

  it('selects the variant by content rather than by a prop, as the source does', () => {
    // `val size = if (content != null) BadgeTokens.LargeSize else BadgeTokens.Size`
    expect(badgeSource).toContain("children != null ? 'large' : 'small'")
    expect(badgeSource).toContain('data-m3e-variant={variant}')
    expect(badgeSource).not.toContain('size=')
    expect(badgeSource).not.toContain('variant?:')
  })

  it('adapts the containerColor and contentColor parameters to scoped custom properties', () => {
    expect(css).toContain('var(--m3e-comp-badge-color)')
    expect(css).toContain('var(--m3e-comp-badge-label-color)')
    expect(badgeSource).not.toContain('containerColor')
    expect(badgeSource).not.toContain('style={{')
    expect(anchorSource).not.toContain('style={{')
  })

  it('places the badge with the sourced offsets, relative so RTL mirrors it', () => {
    expect(css).toContain('inset-inline-start: calc(100% - var(--m3e-comp-badge-offset))')
    expect(css).toContain(
      'inset-inline-start: calc(100% - var(--m3e-comp-badge-large-horizontal-offset))',
    )
    // The source's `y = -badge.height + verticalOffset` for each variant.
    expect(css).toContain('var(--m3e-comp-badge-offset) - var(--m3e-comp-badge-size)')
    expect(css).toContain(
      'var(--m3e-comp-badge-large-vertical-offset) - var(--m3e-comp-badge-large-size)',
    )
    expect(css).not.toContain('inset-inline-end')
    expect(css).not.toContain('left:')
  })

  it('sizes both variants by a minimum, matching defaultMinSize rather than a fixed size', () => {
    expect(css).toContain('min-block-size: var(--m3e-comp-badge-size)')
    expect(css).toContain('min-inline-size: var(--m3e-comp-badge-size)')
    expect(css).toContain('min-block-size: var(--m3e-comp-badge-large-size)')
    expect(css).toContain('min-inline-size: var(--m3e-comp-badge-large-size)')
    // The inline padding applies only with content, as `Modifier.padding` does.
    expect(css).toContain('padding-inline: var(--m3e-comp-badge-large-horizontal-padding)')
  })

  it('freezes all 11 behavior and 4 screenshot cases as audited inputs', () => {
    expect(behaviorTests).toHaveLength(11)
    expect(screenshotTests).toHaveLength(4)
    expect(new Set(behaviorTests).size).toBe(11)
    expect(new Set(screenshotTests).size).toBe(4)
    // Screenshot coverage is symmetric here, unlike the divider's.
    expect(screenshotTests.filter((name) => name.startsWith('light'))).toHaveLength(2)
    expect(screenshotTests.filter((name) => name.startsWith('dark'))).toHaveLength(2)
  })

  it('keeps the drawer badge on the read color path rather than the unread generated role', () => {
    // `badgeColor(selected)` defaults to the item's own text colors; the
    // generated `LargeBadgeLabelColor` is `OnSurfaceVariant`, which is only
    // correct while the item is unselected.
    expect(drawerCss).toContain(
      'color: var(--m3e-comp-navigation-drawer-item-inactive-label-color)',
    )
    expect(drawerCss).toContain('color: var(--m3e-comp-navigation-drawer-item-active-label-color)')
    expect(drawerCss).not.toContain('large-badge-label-color')

    const drawer = defaultTokenSet.componentTokens.find(
      (candidate) => candidate.component === 'navigation-drawer',
    )
    expect(Object.keys(drawer?.tokens ?? {}).some((role) => role.includes('badge'))).toBe(false)
  })
})
