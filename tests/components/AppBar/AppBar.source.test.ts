import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defaultTokenSet } from '../../../src/tokens'

const componentSource = readFileSync(
  fileURLToPath(new URL('../../../src/components/AppBar/AppBar.tsx', import.meta.url)),
  'utf8',
)
const primitiveSource = readFileSync(
  fileURLToPath(new URL('../../../src/internal/useAppBarScroll.ts', import.meta.url)),
  'utf8',
)
const css = readFileSync(
  fileURLToPath(new URL('../../../src/components/AppBar/AppBar.css', import.meta.url)),
  'utf8',
)
const barrel = readFileSync(
  fileURLToPath(new URL('../../../src/components/AppBar/index.ts', import.meta.url)),
  'utf8',
)
const split = (source: string) => source.trim().split(/\s+/)

/**
 * Git blob hashes of the pinned AndroidX files at revision
 * `a90df2fc27e026b9ad2ed569f203a260c1041fab`, the reference snapshot T44
 * adopted and T45 extended. All eighteen files were fetched at that revision
 * and at `androidx-main` HEAD (`477f94858de4569261d2ba58329e928d2683b7eb`,
 * committed 2026-07-24) and compared byte-for-byte: every one is identical,
 * so the family joins the unified snapshot.
 */
const pinnedFiles = {
  'AppBar.kt': 'd5093b138debf8937c4788e0a3d50bad84822ebd',
  'AppBarRow.kt': 'cf0cff93de86e3168ffc0e750fd55ad011f60923',
  'AppBarColumn.kt': '9abb991659d91ab14e15dc3f2475529191963404',
  'AppBarDsl.kt': '287f01d810a87b9265adcd1dab797e56024f6364',
  'AppBarTokens.kt': '6fa1382d1fbfe9120bbf74b88286837e4f69380a',
  'AppBarSmallTokens.kt': '73a16241be2a2949a4f5e37c8e02da6434c9b3c3',
  'AppBarMediumTokens.kt': '64759427b84f9a7a9aa70f7b2a7b9256ba13dcc3',
  'AppBarMediumFlexibleTokens.kt': 'fd1dda4eec7c00d681a5f90cc2652c58f5e4bd9a',
  'AppBarLargeTokens.kt': '2295347bdc434506f4641c6f4a023862a60755ba',
  'AppBarLargeFlexibleTokens.kt': '48df916252871f72bef053e115daec5134861558',
  'BottomAppBarTokens.kt': '5d650cd5725f76bedc490e43bc741b1e927427a1',
  'DockedToolbarTokens.kt': '5b7830117d859a8850f3feb862c4d1ce6a4c1f58',
  'AppBarTest.kt': '84046d2a78c048bd1e9033e3522c71d970b100c3',
  'AppBarScreenshotTest.kt': '8441477abfa2f0576e633d6be608af213a70a12b',
  'AppBarRowTest.kt': '25a2bc38a9d14468bb9f384a5df5ee495901bf93',
  'AppBarRowScreenshotTest.kt': 'c48c83f8f402740b6f019071d6cd06b49ced6e0a',
  'AppBarColumnTest.kt': 'a7f81d642784f6ce2b96d4ee1236baca5088a5fa',
  'AppBarColumnScreenshotTest.kt': '452804c17b2935263f1062750994c7e685c2913a',
} as const

/** Every declaration in the generated `AppBarTokens.kt` (VERSION 14_0_0). */
const sharedTokenDeclarations = split(`
  AvatarSize ContainerColor ContainerElevation ContainerShape IconButtonSpace
  IconSize LeadingIconColor LeadingSpace OnScrollContainerColor
  OnScrollContainerElevation SubtitleColor TitleColor TrailingIconColor
  TrailingSpace
`)

/** The six roles the pinned top-bar composables resolve (`topAppBarColors`). */
const sharedTokenReads = split(`
  ContainerColor OnScrollContainerColor LeadingIconColor TitleColor
  TrailingIconColor SubtitleColor
`)

/**
 * Read only by `FlexibleBottomAppBar`, which the current design index files
 * under Toolbars (catalog row 35); travels with that disposition.
 */
const sharedTokenBottomBarReads = split(`
  ContainerElevation
`)

/** Declared but resolved by nothing in the pinned file. */
const sharedTokenUnread = split(`
  AvatarSize ContainerShape IconButtonSpace IconSize LeadingSpace
  OnScrollContainerElevation TrailingSpace
`)

/** Tier-file declarations: every one is read. */
const tierTokenReads = {
  AppBarSmallTokens: split('ContainerHeight TitleFont SubtitleFont'),
  AppBarMediumTokens: split('ContainerHeight TitleFont'),
  AppBarMediumFlexibleTokens: split(
    'ContainerHeight LargeContainerHeight TitleFont SubtitleFont',
  ),
  AppBarLargeTokens: split('ContainerHeight TitleFont'),
  AppBarLargeFlexibleTokens: split(
    'ContainerHeight LargeContainerHeight TitleFont SubtitleFont',
  ),
} as const

/**
 * In-scope current surface at parameter granularity: the six top-bar
 * composables, the generic two-row builder, the scroll-behavior contract,
 * state, colors, and every `TopAppBarDefaults` member.
 */
const currentSurface = split(`
  TopAppBar TopAppBar.title TopAppBar.subtitle TopAppBar.modifier
  TopAppBar.navigationIcon TopAppBar.actions TopAppBar.titleHorizontalAlignment
  TopAppBar.expandedHeight TopAppBar.windowInsets TopAppBar.colors
  TopAppBar.scrollBehavior TopAppBar.contentPadding
  CenterAlignedTopAppBar CenterAlignedTopAppBar.title
  CenterAlignedTopAppBar.modifier CenterAlignedTopAppBar.navigationIcon
  CenterAlignedTopAppBar.actions CenterAlignedTopAppBar.expandedHeight
  CenterAlignedTopAppBar.windowInsets CenterAlignedTopAppBar.colors
  CenterAlignedTopAppBar.scrollBehavior CenterAlignedTopAppBar.contentPadding
  MediumTopAppBar MediumTopAppBar.title MediumTopAppBar.modifier
  MediumTopAppBar.navigationIcon MediumTopAppBar.actions
  MediumTopAppBar.collapsedHeight MediumTopAppBar.expandedHeight
  MediumTopAppBar.windowInsets MediumTopAppBar.colors
  MediumTopAppBar.scrollBehavior
  MediumFlexibleTopAppBar MediumFlexibleTopAppBar.title
  MediumFlexibleTopAppBar.modifier MediumFlexibleTopAppBar.subtitle
  MediumFlexibleTopAppBar.navigationIcon MediumFlexibleTopAppBar.actions
  MediumFlexibleTopAppBar.titleHorizontalAlignment
  MediumFlexibleTopAppBar.collapsedHeight MediumFlexibleTopAppBar.expandedHeight
  MediumFlexibleTopAppBar.windowInsets MediumFlexibleTopAppBar.colors
  MediumFlexibleTopAppBar.scrollBehavior
  LargeTopAppBar LargeTopAppBar.title LargeTopAppBar.modifier
  LargeTopAppBar.navigationIcon LargeTopAppBar.actions
  LargeTopAppBar.collapsedHeight LargeTopAppBar.expandedHeight
  LargeTopAppBar.windowInsets LargeTopAppBar.colors LargeTopAppBar.scrollBehavior
  LargeFlexibleTopAppBar LargeFlexibleTopAppBar.title
  LargeFlexibleTopAppBar.modifier LargeFlexibleTopAppBar.subtitle
  LargeFlexibleTopAppBar.navigationIcon LargeFlexibleTopAppBar.actions
  LargeFlexibleTopAppBar.titleHorizontalAlignment
  LargeFlexibleTopAppBar.collapsedHeight LargeFlexibleTopAppBar.expandedHeight
  LargeFlexibleTopAppBar.windowInsets LargeFlexibleTopAppBar.colors
  LargeFlexibleTopAppBar.scrollBehavior
  TwoRowsTopAppBar TwoRowsTopAppBar.title TwoRowsTopAppBar.modifier
  TwoRowsTopAppBar.subtitle TwoRowsTopAppBar.titleHorizontalAlignment
  TwoRowsTopAppBar.navigationIcon TwoRowsTopAppBar.actions
  TwoRowsTopAppBar.collapsedHeight TwoRowsTopAppBar.expandedHeight
  TwoRowsTopAppBar.windowInsets TwoRowsTopAppBar.colors
  TwoRowsTopAppBar.scrollBehavior
  TopAppBarScrollBehavior TopAppBarScrollBehavior.state
  TopAppBarScrollBehavior.isPinned TopAppBarScrollBehavior.snapAnimationSpec
  TopAppBarScrollBehavior.flingAnimationSpec
  TopAppBarScrollBehavior.nestedScrollConnection
  TopAppBarState TopAppBarState.heightOffsetLimit TopAppBarState.heightOffset
  TopAppBarState.contentOffset TopAppBarState.collapsedFraction
  TopAppBarState.overlappedFraction TopAppBarState.Saver
  rememberTopAppBarState rememberTopAppBarState.initialHeightOffsetLimit
  rememberTopAppBarState.initialHeightOffset
  rememberTopAppBarState.initialContentOffset
  TopAppBarColors TopAppBarColors.containerColor
  TopAppBarColors.scrolledContainerColor
  TopAppBarColors.navigationIconContentColor TopAppBarColors.titleContentColor
  TopAppBarColors.actionIconContentColor TopAppBarColors.subtitleContentColor
  TopAppBarColors.copy
  TopAppBarDefaults TopAppBarDefaults.topAppBarColors
  TopAppBarDefaults.ContentPadding TopAppBarDefaults.windowInsets
  TopAppBarDefaults.snapAnimationSpec TopAppBarDefaults.flingAnimationSpec
  TopAppBarDefaults.pinnedScrollBehavior
  TopAppBarDefaults.enterAlwaysScrollBehavior
  TopAppBarDefaults.exitUntilCollapsedScrollBehavior
  TopAppBarDefaults.TopAppBarExpandedHeight
  TopAppBarDefaults.MediumAppBarCollapsedHeight
  TopAppBarDefaults.MediumAppBarExpandedHeight
  TopAppBarDefaults.MediumFlexibleAppBarWithoutSubtitleExpandedHeight
  TopAppBarDefaults.MediumFlexibleAppBarWithSubtitleExpandedHeight
  TopAppBarDefaults.LargeAppBarCollapsedHeight
  TopAppBarDefaults.LargeAppBarExpandedHeight
  TopAppBarDefaults.LargeFlexibleAppBarWithoutSubtitleExpandedHeight
  TopAppBarDefaults.LargeFlexibleAppBarWithSubtitleExpandedHeight
`)

/**
 * Current entries in the pinned files whose catalog row is not this one,
 * accounted at composable granularity. The bottom bars belong to row 35
 * (Toolbars, where the current design index files them); the overflow-action
 * system is the named follow-up that keeps row 1 Partial.
 */
const dispositionedSurface = {
  toolbars: split(`
    BottomAppBar FlexibleBottomAppBar BottomAppBarDefaults
    BottomAppBarScrollBehavior BottomAppBarState BottomAppBarStateFactory
    rememberBottomAppBarState
  `),
  overflowFollowUp: split(`
    AppBarRow AppBarColumn AppBarRowScope AppBarColumnScope
    AppBarScope.clickableItem AppBarScope.toggleableItem AppBarScope.customItem
    AppBarMenuState AppBarOverflowIndicator
  `),
} as const

/**
 * The ten deprecated entries: five hidden binary-compatibility overloads and
 * five warning-level migrations (the per-variant color factories and the
 * legacy scroll-behavior overloads). The two hidden `BottomAppBar` overloads
 * travel with the row-35 disposition.
 */
const deprecatedSurface = split(`
  TopAppBar.hidden-overload CenterAlignedTopAppBar.hidden-overload
  topAppBarColors.hidden-5-arg BottomAppBar.hidden-overload-actions
  BottomAppBar.hidden-overload-content centerAlignedTopAppBarColors
  mediumTopAppBarColors largeTopAppBarColors
  pinnedScrollBehavior.legacy-overload enterAlwaysScrollBehavior.legacy-overload
`)

const appBarBehaviorTests = split(`
  smallTopAppBar_expandsToScreen smallTopAppBar_withTitle
  smallTopAppBar_withSubtitle smallTopAppBar_withSubtitleAndCustomColors
  smallTopAppBar_default_positioning smallTopAppBar_noNavigationIcon_positioning
  smallTopAppBar_centeredWithSubtitle_positioning
  smallTopAppBar_centeredWithSubtitle_multiActions_positioning
  smallTopAppBar_titleDefaultStyle smallTopAppBar_subtitleDefaultStyle
  smallTopAppBar_contentColor smallTopAppBar_scrolledContentColor
  smallTopAppBar_scrolledPositioning smallTopAppBar_customHeight
  smallTopAppBar_fitsTextIfHeightTooSmall smallTopAppBar_transparentContainerColor
  smallTopAppBar_longTitle_doesNotOverlapActions
  centerAlignedTopAppBar_expandsToScreen centerAlignedTopAppBar_withTitle
  centerAlignedTopAppBar_withSubtitle centerAlignedTopAppBar_default_positioning
  centerAlignedTopAppBar_default_positioning_respectsWindowInsets
  centerAlignedTopAppBar_noNavigationIcon_positioning
  centerAlignedTopAppBar_longTextDoesNotOverflowToActions
  centerAlignedTopAppBar_longTextDoesNotOverflowToNavigation
  centerAlignedTopAppBar_titleDefaultStyle
  centerAlignedTopAppBar_subtitleDefaultStyle
  centerAlignedTopAppBar_measureWithNonZeroMinWidth
  centerAlignedTopAppBar_contentColor centerAlignedTopAppBar_scrolledContentColor
  mediumTopAppBar_expandsToScreen mediumTopAppBar_expanded_positioning
  mediumTopAppBar_customHeight_expanded_positioning
  mediumFlexibleTopAppBar_fitsTextIfHeightTooSmall_expanded
  mediumFlexibleTopAppBar_fitsTextIfHeightTooSmall_collapsed
  mediumTopAppBar_scrolled_positioning
  mediumTopAppBar_customHeight_scrolled_positioning
  mediumTopAppBar_scrolledContainerColor
  mediumTopAppBar_scrolledColorsWithCustomTitleTextColor
  mediumFlexibleTopAppBar_scrolledColorsWithCustomTitleAndSubtitleTextColor
  mediumFlexibleTopAppBar_scrolledColorsWithCustomTitleAndWithoutSubtitleTextColor
  topAppBarColors_noNameParams mediumTopAppBar_semantics
  mediumFlexibleTopAppBar_withSubtitle_semantics largeTopAppBar_semantics
  largeFlexibleTopAppBar_withSubtitle_semantics largeTopAppBar_expandsToScreen
  largeTopAppBar_expanded_positioning
  largeTopAppBar_customHeight_expanded_positioning
  largeFlexibleTopAppBar_fitsTextIfHeightTooSmall_expanded
  largeFlexibleTopAppBar_fitsTextIfHeightTooSmall_collapsed
  largeTopAppBar_scrolled_positioning
  largeTopAppBar_customHeight_scrolled_positioning
  largeTopAppBar_scrolledContainerColor
  largeTopAppBar_scrolledColorsWithCustomTitleTextColor
  largeFlexibleTopAppBar_scrolledColorsWithCustomTitleAndSubtitleTextColor
  largeFlexibleTopAppBar_scrolledColorsWithCustomTitleAndWithoutSubtitleTextColor
  topAppBar_enterAlways_allowHorizontalScroll
  topAppBar_exitUntilCollapsed_allowHorizontalScroll
  topAppBar_pinned_allowHorizontalScroll topAppBar_smallPinnedDraggedAppBar
  topAppBar_mediumDraggedAppBar topAppBar_dragSnapToCollapsed
  topAppBar_dragWithSnapDisabled topAppBar_enterAlways_scrollingAndContentMovement
  topAppBar_enterAlways_reverseLayout_scrollingAndLazyColumnMovement
  state_restoresTopAppBarState topAppBar_intrinsicHeight topAppBar_intrinsicWidth
  topAppBar_customTwoRows_expanded topAppBar_customTwoRows_scrolled_positioning
  topAppBar_correctlyPadsWhenParentHandlesInsetsAndContentPaddingIsUsed
  topAppBar_enterAlways_changeColors_scrolledLazyColumn_setIsAtStart
  topAppBar_enterAlways_changeColors_reverseLayout_scrolledLazyColumn_setIsAtStart
  topAppBar_enterAlways_changeColors_reverseLayout_preScrolledLazyColumn
  topAppBar_pinned_changeColors_reverseLayout_scrolledLazyColumn
  topAppBar_pinned_changeColors_reverseLayout_preScrolledLazyGrid
  topAppBar_pinned_changeColors_reverseLayout_scrolledLazyGrid
  topAppBar_pinned_changeColors_scrolledLazyGrid
  topAppBar_enterAlways_changeColors_scrolledLazyGrid
  topAppBar_enterAlways_changeColors_reversedLayout_scrolledLazyGrid
  topAppBar_enterAlways_changeColors_reverseLayout_preScrolledLazyGrid
  topAppBar_enterAlways_changeColors_scrolledColumn_setIsAtStart
  topAppBar_enterAlways_changeColors_reverseLayout_scrolledColumn_setIsAtStart
  topAppBar_enterAlways_changeColors_reverseLayout_preScrolledColumn
  topAppBar_pinned_changeColors_reverseLayout_preScrolledLazyColumn
  topAppBar_pinned_changeColors_scrolledLazyColumn
  topAppBar_pinned_changeColors_preScrolledLazyColumn
  topAppBar_pinned_changeColors_reverseLayout_scrolledColumn
  topAppBar_pinned_changeColors_scrolledColumn
  topAppBar_pinned_changeColors_reverseLayout_preScrolledColumn
  topAppBar_pinned_changeColors_preScrolledColumn
`)

const bottomAppBarBehaviorTests = split(`
  bottomAppBarWithFAB_heightIsFromSpec
  bottomAppBarWithCustomArrangement_heightIsFromSpec bottomAppBarWithCustomHeight
  bottomAppBarWithFAB_respectsWindowInsets
  bottomAppBar_FABShown_whenActionsOverflowRow bottomAppBar_widthExpandsToScreen
  bottomAppBar_default_positioning
  bottomAppBar_default_positioning_respectsContentPadding
  bottomAppBarWithFAB_default_positioning
  bottomAppBar_exitAlways_scaffoldWithFAB_default_positioning
  bottomAppBar_exitAlways_scaffoldWithFAB_scrolled_positioning
  bottomAppBar_exitAlways_allowHorizontalScroll
  bottomAppBar_exitAlways_outOfRangeOffsetHandled
`)

const appBarScreenshotTests = split(`
  smallAppBar_lightTheme smallAppBar_withSubtitle_lightTheme
  smallAppBar_withoutSubtitle_lightTheme
  smallAppBar_lightTheme_clipsWhenCollapsedWithInsets smallAppBar_darkTheme
  centerAlignedAppBar_lightTheme centerAlignedAppBar_withSubtitle_lightTheme
  centerAlignedAppBar_withoutSubtitle_lightTheme centerAlignedAppBar_darkTheme
  mediumAppBar_lightTheme mediumFlexibleAppBar_centerAligned_withSubtitle_lightTheme
  mediumFlexibleAppBar_centerAligned_withoutSubtitle_lightTheme
  mediumFlexibleAppBar_startAligned_withSubtitle_darkTheme mediumAppBar_darkTheme
  largeAppBar_lightTheme largeFlexibleAppBar_centerAligned_withSubtitle_lightTheme
  largeFlexibleAppBar_centerAligned_withoutSubtitle_lightTheme
  largeFlexibleAppBar_startAligned_withSubtitle_darkTheme largeAppBar_darkTheme
`)

const bottomAppBarScreenshotTests = split(`
  bottomAppBarWithFAB_lightTheme bottomAppBarWithFAB_darkTheme
  bottomAppBarSpacedAround_lightTheme bottomAppBarSpacedBetween_lightTheme
  bottomAppBarSpacedEvenly_lightTheme bottomAppBarFixed_lightTheme
  bottomAppBarFixed_darkTheme
`)

const overflowTests = split(`
  appbarRow_itemsDisplayed_noOverflow appbarRow_maxCount_itemsDisplayed
  appbarRow_maxCount_itemsDisplayed_lastItemShows
  appbarRow_itemsOverflow_overflowIndicatorDisplayed
  appbarRow_overflowMenu_opensAndCloses appbarRow_clickableItem_onClickCalled
  appbarRow_toggleableItem_onCheckedChangeCalled
  appbarRow_overflowMenu_itemClickClosesMenu
  appBarRow_fullWidth appBarRow_withOverflow appBarRow_withOverflow_menu
  appbarColumn_itemsDisplayed_noOverflow appbarColumn_maxCount_itemsDisplayed
  appbarColumn_maxCount_itemsDisplayed_lastItemShows
  appbarColumn_itemsOverflow_overflowIndicatorDisplayed
  appbarColumn_overflowMenu_opensAndCloses appbarColumn_clickableItem_onClickCalled
  appbarColumn_toggleableItem_onCheckedChangeCalled
  appbarColumn_overflowMenu_itemClickClosesMenu
  appBarColumn_fullHeight appBarColumn_withOverflow appBarColumn_withOverflow_menu
`)

/** Every source concern deliberately not ported, each with its reason. */
const exclusions = split(`
  bar-drag-resize-is-a-touch-affordance-the-web-reserves-for-scrolling
  velocity-fling-settle-replaced-by-an-idle-snap
  exit-until-collapsed-snap-has-no-independent-state-once-fraction-is-position-derived
  touch-exploration-auto-disable-is-an-android-service-query
  content-padding-defaults-to-zero-and-exists-for-compose-inset-composition
  kotlin-binary-compatibility-shims-have-no-web-equivalent-to-preserve
`)

/** Behaviours answered by a native web mechanism instead of ported code. */
const nativeWebAdaptations = split(`
  pinning-becomes-position-sticky
  nested-scroll-connection-becomes-an-explicit-scroll-container
  scrolled-color-overlay-alpha-composites-the-sourced-lerp
  banner-landmark-and-slot-title-replace-pane-semantics
  focus-within-reveal-satisfies-maintain-access-when-scrolled
`)

/** Implementation anomalies recorded rather than smoothed over. */
const implementationAnomalies = split(`
  leading-and-trailing-space-roles-are-shadowed-by-a-hand-tuned-4dp-constant
  on-scroll-container-elevation-is-declared-but-color-not-elevation-changes-on-scroll
  bottom-app-bar-tokens-still-generate-at-v0_210-while-app-bar-tokens-are-14_0_0
  flexible-bottom-app-bar-reads-the-docked-toolbar-token-family
  no-small-flexible-variant-exists-despite-the-spec-site-noting-small-improvements
`)

describe('AppBar pinned-source completeness ledger', () => {
  it('freezes every pinned source file identity', () => {
    expect(Object.keys(pinnedFiles)).toHaveLength(18)
    expect(new Set(Object.values(pinnedFiles)).size).toBe(18)
    expect(Object.values(pinnedFiles).every((blob) => /^[0-9a-f]{40}$/.test(blob))).toBe(true)
  })

  it('classifies every shared AppBarTokens declaration', () => {
    expect(sharedTokenDeclarations).toHaveLength(14)
    expect(new Set(sharedTokenDeclarations).size).toBe(14)
    expect(sharedTokenReads).toHaveLength(6)
    expect(sharedTokenBottomBarReads).toHaveLength(1)
    expect(sharedTokenUnread).toHaveLength(7)
    expect(
      [...sharedTokenReads, ...sharedTokenBottomBarReads, ...sharedTokenUnread].sort(),
    ).toEqual([...sharedTokenDeclarations].sort())
  })

  it('reads every tier-file declaration', () => {
    const total = Object.values(tierTokenReads).reduce((sum, roles) => sum + roles.length, 0)
    expect(total).toBe(15)
    expect(Object.keys(tierTokenReads)).toHaveLength(5)
  })

  it('registers a component token for every top-bar-read role and no unread one', () => {
    const registration = defaultTokenSet.componentTokens.find(
      (candidate) => candidate.component === 'app-bar',
    )

    expect(registration?.task).toBe('T46')
    expect(registration?.source.revision).toBe('a90df2fc27e026b9ad2ed569f203a260c1041fab')
    expect(registration?.tokens['container-color'].value).toEqual({
      $ref: 'sys.color.surface',
    })
    expect(registration?.tokens['on-scroll-container-color'].value).toEqual({
      $ref: 'sys.color.surfaceContainer',
    })
    expect(registration?.tokens['leading-icon-color'].value).toEqual({
      $ref: 'sys.color.onSurface',
    })
    expect(registration?.tokens['trailing-icon-color'].value).toEqual({
      $ref: 'sys.color.onSurfaceVariant',
    })
    expect(registration?.tokens['container-height'].value).toBe('64px')
    expect(registration?.tokens['medium-container-height'].value).toBe('112px')
    expect(registration?.tokens['medium-flexible-subtitle-container-height'].value).toBe('136px')
    expect(registration?.tokens['large-container-height'].value).toBe('152px')
    expect(registration?.tokens['large-flexible-container-height'].value).toBe('120px')
    expect(registration?.tokens['large-flexible-subtitle-container-height'].value).toBe('152px')
    // The unread elevation and shape roles are recorded, not registered.
    expect(Object.keys(registration?.tokens ?? {})).not.toContain('on-scroll-container-elevation')
    expect(Object.keys(registration?.tokens ?? {})).not.toContain('container-shape')
  })

  it('accounts for every current, dispositioned, and deprecated source entry', () => {
    expect(currentSurface).toHaveLength(121)
    expect(new Set(currentSurface).size).toBe(121)
    expect(dispositionedSurface.toolbars).toHaveLength(7)
    expect(dispositionedSurface.overflowFollowUp).toHaveLength(9)
    expect(deprecatedSurface).toHaveLength(10)
    expect(new Set(deprecatedSurface).size).toBe(10)
  })

  it('freezes all 153 pinned test cases, partitioned by disposition', () => {
    const all = [
      ...appBarBehaviorTests,
      ...bottomAppBarBehaviorTests,
      ...appBarScreenshotTests,
      ...bottomAppBarScreenshotTests,
      ...overflowTests,
    ]

    expect(appBarBehaviorTests).toHaveLength(92)
    expect(bottomAppBarBehaviorTests).toHaveLength(13)
    expect(appBarBehaviorTests.length + bottomAppBarBehaviorTests.length).toBe(105)
    expect(appBarScreenshotTests).toHaveLength(19)
    expect(bottomAppBarScreenshotTests).toHaveLength(7)
    expect(appBarScreenshotTests.length + bottomAppBarScreenshotTests.length).toBe(26)
    expect(overflowTests).toHaveLength(22)
    expect(all).toHaveLength(153)
    expect(new Set(all).size).toBe(153)
  })

  it('records every exclusion, adaptation, and anomaly with its reason', () => {
    expect(exclusions).toHaveLength(6)
    expect(new Set(exclusions).size).toBe(6)
    expect(nativeWebAdaptations).toHaveLength(5)
    expect(new Set(nativeWebAdaptations).size).toBe(5)
    expect(implementationAnomalies).toHaveLength(5)
    expect(new Set(implementationAnomalies).size).toBe(5)
  })

  it('collapses the six top-bar composables onto one export with variant props', () => {
    expect(componentSource).toContain("size = 'small'")
    expect(componentSource).toContain('data-m3e-size={size}')
    expect(componentSource).toContain('flexible')
    expect(barrel.match(/export \{[^}]*\}/g)).toEqual(['export { AppBar }'])
    expect(componentSource).not.toMatch(
      /export const (TopAppBar|CenterAlignedTopAppBar|MediumTopAppBar|LargeTopAppBar|TwoRowsTopAppBar)/,
    )
  })

  it('carries the sourced title crossfade easing and semantics threshold', () => {
    // CubicBezierEasing(0.8f, 0f, 0.8f, 0.15f) and the 0.5 semantics swap.
    expect(primitiveSource).toContain('0.8')
    expect(primitiveSource).toContain('0.15')
    expect(primitiveSource).toContain('fraction >= 0.5')
    expect(css).toContain('--m3e-app-bar-top-title-alpha')
  })

  it('derives collapse ranges from the sourced tier heights', () => {
    expect(componentSource).toContain('112 - 64')
    expect(componentSource).toContain('136 : 112')
    expect(componentSource).toContain('152 - 64')
    expect(componentSource).toContain('152 : 120')
  })

  it('adapts every sourced dimension to a component token rather than an inline style', () => {
    for (const token of [
      'container-height',
      'medium-container-height',
      'large-container-height',
      'horizontal-padding',
      'title-inset',
      'medium-title-bottom-padding',
      'large-title-bottom-padding',
    ]) {
      expect(css).toContain(`var(--m3e-comp-app-bar-${token})`)
    }
    expect(componentSource).not.toContain('style={{')
  })
})
