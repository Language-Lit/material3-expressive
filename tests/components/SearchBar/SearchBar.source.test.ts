import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defaultTokenSet } from '../../../src/tokens'

const componentSource = readFileSync(
  fileURLToPath(new URL('../../../src/components/SearchBar/SearchBar.tsx', import.meta.url)),
  'utf8',
)
const appBarSource = readFileSync(
  fileURLToPath(new URL('../../../src/components/SearchBar/SearchAppBar.tsx', import.meta.url)),
  'utf8',
)
const primitiveSource = readFileSync(
  fileURLToPath(new URL('../../../src/internal/useAppBarScroll.ts', import.meta.url)),
  'utf8',
)
const css = readFileSync(
  fileURLToPath(new URL('../../../src/components/SearchBar/SearchBar.css', import.meta.url)),
  'utf8',
)
const barrel = readFileSync(
  fileURLToPath(new URL('../../../src/components/SearchBar/index.ts', import.meta.url)),
  'utf8',
)
const split = (source: string) => source.trim().split(/\s+/)

/**
 * Git blob hashes of the pinned AndroidX files at revision
 * `a90df2fc27e026b9ad2ed569f203a260c1041fab`, the reference snapshot T44
 * adopted and T45/T46 extended. All five were fetched at that revision and at
 * `androidx-main` HEAD (`409acc1915f01da1855d63bb721e4635ec736f84`, committed
 * 2026-07-24). The implementation and both token files are byte-identical. The
 * two test files differ by exactly one line each — `createComposeRule(
 * StandardTestDispatcher())` became `createComposeRule()` — which adds,
 * removes, and renames no case, so the pin holds and the delta is recorded
 * here rather than re-pinned, the classification T44 established.
 */
const pinnedFiles = {
  'SearchBar.kt': '81e94b6a6355eeba2f6f29d31fbb8ee603ae4e0b',
  'SearchBarTokens.kt': '04a13a3ed39a8a011f81b96811dddab0d921aa9d',
  'SearchViewTokens.kt': '4ad7468ef322da58b754fa2e2fa1f0fd40670653',
  'SearchBarTest.kt': '25b82789f403fffe117b799dc4c694d185e181ac',
  'SearchBarScreenshotTest.kt': '4f9dfa915d350bf9ade34759a0634bf3ecb16eaa',
} as const

/** The upstream test files' only delta at HEAD, by blob. */
const headTestBlobs = {
  'SearchBarTest.kt': '151ede21473924ab11d2216c77c55bdf67e5b428',
  'SearchBarScreenshotTest.kt': 'cd7a41ec3ed7a4b7ec5044fe0955e85859111d0f',
} as const

/** Every declaration in the generated `SearchBarTokens.kt` (VERSION v0_210). */
const barTokenDeclarations = split(`
  AvatarShape AvatarSize ContainerColor ContainerElevation ContainerHeight
  ContainerShape FocusIndicatorColor HoverSupportingTextColor InputTextColor
  InputTextFont LeadingIconColor PressedSupportingTextColor SupportingTextColor
  SupportingTextFont TrailingIconColor
`)

/** The roles the pinned implementation resolves. */
const barTokenReads = split(`
  ContainerColor ContainerHeight ContainerShape InputTextColor LeadingIconColor
  SupportingTextColor TrailingIconColor
`)

/**
 * Declared and resolved by nothing in the pinned file. `AvatarShape`/`AvatarSize`
 * and `FocusIndicatorColor` are registered anyway — see ADR 0039 — because the
 * specification and the source's own inset focus ring both describe exactly
 * what they name. The two font roles are unread because the field takes its
 * type from the ambient text style, which is the same body-large role.
 */
const barTokenUnread = split(`
  AvatarShape AvatarSize ContainerElevation FocusIndicatorColor
  HoverSupportingTextColor InputTextFont PressedSupportingTextColor
  SupportingTextFont
`)

/** Every declaration in the generated `SearchViewTokens.kt` (VERSION v0_210). */
const viewTokenDeclarations = split(`
  ContainerColor ContainerElevation DividerColor DockedContainerShape
  DockedHeaderContainerHeight FullScreenContainerShape
  FullScreenHeaderContainerHeight HeaderInputTextColor HeaderInputTextFont
  HeaderLeadingIconColor HeaderSupportingTextColor HeaderSupportingTextFont
  HeaderTrailingIconColor
`)

const viewTokenReads = split(`
  DividerColor DockedContainerShape FullScreenContainerShape
`)

/**
 * The expanded view reuses the collapsed field rather than composing a header
 * of its own, so the whole `Header*` family and both header heights are
 * declared with no read path. The composed values still land on them: a divided
 * full-screen header is 8 + 56 + 8, exactly `FullScreenHeaderContainerHeight`.
 */
const viewTokenUnread = split(`
  ContainerColor ContainerElevation DockedHeaderContainerHeight
  FullScreenHeaderContainerHeight HeaderInputTextColor HeaderInputTextFont
  HeaderLeadingIconColor HeaderSupportingTextColor HeaderSupportingTextFont
  HeaderTrailingIconColor
`)

/**
 * The current public surface at parameter granularity: six composables, the
 * state and its three factories, the scroll-behavior contract, both color
 * holders, and every `SearchBarDefaults` member.
 */
const currentSurface = split(`
  SearchBar SearchBar.state SearchBar.inputField SearchBar.modifier
  SearchBar.shape SearchBar.colors SearchBar.tonalElevation
  SearchBar.shadowElevation
  AppBarWithSearch AppBarWithSearch.state AppBarWithSearch.inputField
  AppBarWithSearch.modifier AppBarWithSearch.navigationIcon
  AppBarWithSearch.actions AppBarWithSearch.shape AppBarWithSearch.colors
  AppBarWithSearch.tonalElevation AppBarWithSearch.shadowElevation
  AppBarWithSearch.contentPadding AppBarWithSearch.windowInsets
  AppBarWithSearch.scrollBehavior
  ExpandedFullScreenSearchBar ExpandedFullScreenSearchBar.state
  ExpandedFullScreenSearchBar.inputField ExpandedFullScreenSearchBar.modifier
  ExpandedFullScreenSearchBar.collapsedShape ExpandedFullScreenSearchBar.colors
  ExpandedFullScreenSearchBar.tonalElevation
  ExpandedFullScreenSearchBar.shadowElevation
  ExpandedFullScreenSearchBar.windowInsets
  ExpandedFullScreenSearchBar.properties ExpandedFullScreenSearchBar.content
  ExpandedFullScreenContainedSearchBar ExpandedFullScreenContainedSearchBar.state
  ExpandedFullScreenContainedSearchBar.inputField
  ExpandedFullScreenContainedSearchBar.modifier
  ExpandedFullScreenContainedSearchBar.collapsedShape
  ExpandedFullScreenContainedSearchBar.colors
  ExpandedFullScreenContainedSearchBar.tonalElevation
  ExpandedFullScreenContainedSearchBar.shadowElevation
  ExpandedFullScreenContainedSearchBar.windowInsets
  ExpandedFullScreenContainedSearchBar.properties
  ExpandedFullScreenContainedSearchBar.content
  ExpandedDockedSearchBar ExpandedDockedSearchBar.state
  ExpandedDockedSearchBar.inputField ExpandedDockedSearchBar.modifier
  ExpandedDockedSearchBar.shape ExpandedDockedSearchBar.colors
  ExpandedDockedSearchBar.tonalElevation ExpandedDockedSearchBar.shadowElevation
  ExpandedDockedSearchBar.properties ExpandedDockedSearchBar.content
  ExpandedDockedSearchBarWithGap ExpandedDockedSearchBarWithGap.state
  ExpandedDockedSearchBarWithGap.inputField
  ExpandedDockedSearchBarWithGap.modifier ExpandedDockedSearchBarWithGap.shape
  ExpandedDockedSearchBarWithGap.dropdownShape
  ExpandedDockedSearchBarWithGap.dropdownGapSize
  ExpandedDockedSearchBarWithGap.dropdownScrimColor
  ExpandedDockedSearchBarWithGap.colors
  ExpandedDockedSearchBarWithGap.tonalElevation
  ExpandedDockedSearchBarWithGap.shadowElevation
  ExpandedDockedSearchBarWithGap.properties
  ExpandedDockedSearchBarWithGap.content
  SearchBarValue SearchBarValue.Collapsed SearchBarValue.Expanded
  SearchBarState SearchBarState.constructor-3-arg
  SearchBarState.constructor-5-arg SearchBarState.progress
  SearchBarState.isAnimating SearchBarState.targetValue
  SearchBarState.currentValue SearchBarState.animateToExpanded
  SearchBarState.animateToCollapsed SearchBarState.snapTo
  SearchBarState.Saver-2-spec SearchBarState.Saver-4-spec
  rememberSearchBarState rememberSearchBarState.initialValue
  rememberSearchBarState.animationSpecForExpand
  rememberSearchBarState.animationSpecForCollapse
  rememberContainedSearchBarState rememberContainedSearchBarState.initialValue
  rememberContainedSearchBarState.animationSpecForExpand
  rememberContainedSearchBarState.animationSpecForCollapse
  rememberContainedSearchBarState.animationSpecForContentFadeIn
  rememberContainedSearchBarState.animationSpecForContentFadeOut
  rememberSearchBarWithGapState rememberSearchBarWithGapState.initialValue
  rememberSearchBarWithGapState.animationSpecForExpand
  rememberSearchBarWithGapState.animationSpecForCollapse
  rememberSearchBarWithGapState.animationSpecForContentFadeIn
  rememberSearchBarWithGapState.animationSpecForContentFadeOut
  SearchBarScrollBehavior SearchBarScrollBehavior.scrollOffset
  SearchBarScrollBehavior.scrollOffsetLimit
  SearchBarScrollBehavior.contentOffset
  SearchBarScrollBehavior.nestedScrollConnection
  SearchBarScrollBehavior.searchBarScrollBehavior
  SearchBarDefaults SearchBarDefaults.TonalElevation
  SearchBarDefaults.ShadowElevation SearchBarDefaults.InputFieldHeight
  SearchBarDefaults.inputFieldShape SearchBarDefaults.fullScreenShape
  SearchBarDefaults.collapsedContainedSearchBarColor
  SearchBarDefaults.fullScreenContainedSearchBarColor
  SearchBarDefaults.dockedShape SearchBarDefaults.dockedDropdownShape
  SearchBarDefaults.dockedDropdownGapSize
  SearchBarDefaults.dockedDropdownScrimColor
  SearchBarDefaults.AppBarContentPadding SearchBarDefaults.windowInsets
  SearchBarDefaults.fullScreenWindowInsets
  SearchBarDefaults.enterAlwaysSearchBarScrollBehavior
  enterAlwaysSearchBarScrollBehavior.initialOffset
  enterAlwaysSearchBarScrollBehavior.initialOffsetLimit
  enterAlwaysSearchBarScrollBehavior.initialContentOffset
  enterAlwaysSearchBarScrollBehavior.canScroll
  enterAlwaysSearchBarScrollBehavior.snapAnimationSpec
  enterAlwaysSearchBarScrollBehavior.flingAnimationSpec
  enterAlwaysSearchBarScrollBehavior.reverseLayout
  SearchBarDefaults.colors colors.containerColor colors.dividerColor
  colors.inputFieldColors
  SearchBarDefaults.containedColors containedColors.state
  SearchBarDefaults.appBarWithSearchColors
  appBarWithSearchColors.searchBarColors
  appBarWithSearchColors.scrolledSearchBarContainerColor
  appBarWithSearchColors.appBarContainerColor
  appBarWithSearchColors.scrolledAppBarContainerColor
  appBarWithSearchColors.appBarNavigationIconColor
  appBarWithSearchColors.appBarActionIconColor
  SearchBarDefaults.inputFieldColors inputFieldColors.focusedTextColor
  inputFieldColors.unfocusedTextColor inputFieldColors.disabledTextColor
  inputFieldColors.cursorColor inputFieldColors.selectionColors
  inputFieldColors.focusedLeadingIconColor
  inputFieldColors.unfocusedLeadingIconColor
  inputFieldColors.disabledLeadingIconColor
  inputFieldColors.focusedTrailingIconColor
  inputFieldColors.unfocusedTrailingIconColor
  inputFieldColors.disabledTrailingIconColor
  inputFieldColors.focusedPlaceholderColor
  inputFieldColors.unfocusedPlaceholderColor
  inputFieldColors.disabledPlaceholderColor
  inputFieldColors.focusedPrefixColor inputFieldColors.unfocusedPrefixColor
  inputFieldColors.disabledPrefixColor inputFieldColors.focusedSuffixColor
  inputFieldColors.unfocusedSuffixColor inputFieldColors.disabledSuffixColor
  inputFieldColors.focusedContainerColor
  inputFieldColors.unfocusedContainerColor
  inputFieldColors.disabledContainerColor
  SearchBarDefaults.InputField InputField.textFieldState
  InputField.searchBarState InputField.onSearch InputField.modifier
  InputField.enabled InputField.readOnly InputField.textStyle
  InputField.placeholder InputField.leadingIcon InputField.trailingIcon
  InputField.prefix InputField.suffix InputField.inputTransformation
  InputField.outputTransformation InputField.scrollState InputField.shape
  InputField.colors InputField.interactionSource InputField.keyboardOptions
  InputField.lineLimits
  SearchBarColors SearchBarColors.containerColor SearchBarColors.dividerColor
  SearchBarColors.inputFieldColors SearchBarColors.copy
  AppBarWithSearchColors AppBarWithSearchColors.searchBarColors
  AppBarWithSearchColors.scrolledSearchBarContainerColor
  AppBarWithSearchColors.appBarContainerColor
  AppBarWithSearchColors.scrolledAppBarContainerColor
  AppBarWithSearchColors.appBarNavigationIconColor
  AppBarWithSearchColors.appBarActionIconColor
  AppBarWithSearchColors.constructor-4-arg
`)

/**
 * The fourteen deprecated entries: the renamed `TopSearchBar`, the two
 * `expanded`/`onExpandedChange` composables that predate `SearchBarState` and
 * their hidden binary-compatibility twins, three superseded `InputField`
 * overloads, three hidden color factories, the renamed `Elevation`, the legacy
 * scroll-behavior overload, and the two-argument `SearchBarColors` constructor.
 */
const deprecatedSurface = split(`
  TopSearchBar SearchBar.expanded-overload DockedSearchBar.expanded-overload
  SearchBar.hidden-overload DockedSearchBar.hidden-overload
  SearchBarDefaults.Elevation
  enterAlwaysSearchBarScrollBehavior.hidden-overload
  InputField.hidden-keyboard-options-overload InputField.expanded-state-overload
  InputField.query-callback-overload colors.hidden-overload
  inputFieldColors.hidden-overload-1 inputFieldColors.hidden-overload-2
  SearchBarColors.two-arg-constructor
`)

/** All 28 cases in the pinned `SearchBarTest.kt`. */
const behaviorTests = split(`
  searchBar_becomesExpandedAndFocusedOnClick_andNotExpandedAndUnfocusedOnBack
  searchBar_doesNotOverwriteFocusOfOtherComponents
  searchBar_onImeAction_executesSearchCallback searchBar_notExpandedSize
  searchBar_expandedSize searchBar_usesAndConsumesWindowInsets
  searchBar_clickingIconButton_doesNotExpandSearchBarItself
  dockedSearchBar_becomesExpandedAndFocusedOnClick_andNotExpandedAndUnfocusedOnBack
  dockedSearchBar_doesNotOverwriteFocusOfOtherComponents
  dockedSearchBar_onImeAction_executesSearchCallback
  dockedSearchBar_notExpandedSize dockedSearchBar_expandedSize
  dockedSearchBar_clickingIconButton_doesNotExpandSearchBarItself
  newSearchBar_becomesExpandedAndFocusedOnClick_andCollapsedAndUnfocusedOnBack
  newSearchBar_expansionBehavior_inNonTouchMode
  newSearchBar_expanded_isReachableViaDownKey
  newSearchBar_doesNotOverwriteFocusOfOtherComponents
  newSearchBar_onImeAction_executesSearchCallback newSearchBar_collapsedSize
  newSearchBar_clickingIconButton_doesNotExpandSearchBarItself
  appBarWithSearch_usesAndConsumesWindowInsets
  appBarWithSearch_scrollBehavior_showsAndHidesWithVerticalScroll
  appBarWithSearch_scrollBehavior_showsAndHidesWithVerticalScroll_reverseLayout
  appBarWithSearch_scrollBehavior_scrollDisabled
  appBarWithSearch_scrollBehavior_restoresOffsetState
  appBarWithSearch_correctlyPadsWhenParentHandlesInsetsAndContentPaddingIsUsed
  appBarWithSearch_minWidth appBarWithSearch_maxWidth
`)

/** All 36 cases in the pinned `SearchBarScreenshotTest.kt`. */
const screenshotTests = split(`
  searchBar_notExpanded searchBar_focused_insetFocusRings searchBar_disabled
  searchBar_expanded searchBar_expanded_withIcons searchBar_expanded_customColors
  searchBar_shadow_notExpanded searchBar_shadow_expanded
  searchBar_predictiveBack_progress0 searchBar_predictiveBack_progress25
  searchBar_predictiveBack_progress50 searchBar_predictiveBack_progress75
  searchBar_predictiveBack_progress100
  dockedSearchBar_notExpanded dockedSearchBar_disabled dockedSearchBar_expanded
  dockedSearchBar_expanded_withIcons dockedSearchBar_expanded_customShape
  dockedSearchBar_expanded_customColors dockedSearchBar_shadow_notExpanded
  dockedSearchBar_shadow_expanded
  newSearchBar_collapsed newSearchBar_collapsed_shadow
  newSearchBar_collapsed_disabled newSearchBar_fullScreen_expanded
  newSearchBar_fullScreen_expanded_withIcons
  newSearchBar_fullScreen_expanded_customColors newSearchBar_docked_expanded
  newSearchBar_docked_expanded_withIcons newSearchBar_docked_expanded_customShape
  newSearchBar_docked_expanded_customColors
  appBarWithSearch_withNavigationIconAndActions
  appBarWithSearch_withNavigationIconAndActions_dockedAndExpanded_withGap
  appBarWithSearch_withNavigationIconAndActions_fullScreenAndExpanded_contained
  appBarWithSearch_withoutNavigationIconAndActions
  appBarWithSearch_withScrolledContainerColor
`)

/** Every source concern deliberately not ported, each with its reason. */
const exclusions = split(`
  predictive-back-is-an-android-system-gesture-the-browser-owns
  window-insets-are-an-android-window-concern-the-viewport-answers
  velocity-fling-settle-replaced-by-the-shared-idle-snap
  compose-animation-specs-become-semantic-motion-tokens
  soft-keyboard-interception-has-no-web-equivalent-to-suppress
  reverse-layout-scrolling-is-a-lazy-list-concern-not-a-search-bar-one
  kotlin-binary-compatibility-shims-have-no-web-equivalent-to-preserve
`)

/** Behaviours answered by a native web mechanism instead of ported code. */
const nativeWebAdaptations = split(`
  ime-search-action-becomes-input-type-search-and-the-enter-key
  combobox-semantics-replace-the-suggestions-available-state-description
  native-dialog-modality-replaces-the-full-screen-window
  anchored-portal-replaces-the-docked-popup
  expanded-surface-owns-the-field-and-inerts-the-in-page-copy
  adaptive-layout-resolves-the-guidance-at-the-compact-breakpoint
  non-touch-expansion-rules-apply-in-every-input-mode
  nested-scroll-connection-becomes-an-explicit-scroll-container
`)

/** Implementation anomalies recorded rather than smoothed over. */
const implementationAnomalies = split(`
  container-elevation-is-level3-while-both-default-elevations-are-level0
  full-screen-header-height-is-unread-yet-composed-exactly-by-the-padding
  docked-dropdown-shape-and-gap-carry-a-todo-replace-with-token-comment
  scrolled-and-contained-container-colors-are-todo-comments-not-generated-roles
  avatar-and-focus-indicator-roles-are-declared-and-read-by-nothing
  header-token-family-duplicates-the-bar-roles-because-the-view-reuses-the-field
  design-site-measures-a-24-to-12dp-focused-margin-the-source-composes-as-8dp
`)

describe('SearchBar pinned-source completeness ledger', () => {
  it('freezes every pinned source file identity', () => {
    expect(Object.keys(pinnedFiles)).toHaveLength(5)
    expect(new Set(Object.values(pinnedFiles)).size).toBe(5)
    expect(Object.values(pinnedFiles).every((blob) => /^[0-9a-f]{40}$/.test(blob))).toBe(true)
  })

  it('records the two test files that moved at HEAD without changing a case', () => {
    expect(Object.keys(headTestBlobs)).toHaveLength(2)
    for (const [name, blob] of Object.entries(headTestBlobs)) {
      expect(blob).not.toBe(pinnedFiles[name as keyof typeof pinnedFiles])
    }
    // The implementation and both token files did not move at all.
    expect(Object.keys(headTestBlobs)).not.toContain('SearchBar.kt')
    expect(Object.keys(headTestBlobs)).not.toContain('SearchBarTokens.kt')
    expect(Object.keys(headTestBlobs)).not.toContain('SearchViewTokens.kt')
  })

  it('classifies every generated declaration in both token files', () => {
    expect(barTokenDeclarations).toHaveLength(15)
    expect(viewTokenDeclarations).toHaveLength(13)
    expect(new Set([...barTokenDeclarations, ...viewTokenDeclarations]).size).toBe(26)

    expect(barTokenReads).toHaveLength(7)
    expect(barTokenUnread).toHaveLength(8)
    expect([...barTokenReads, ...barTokenUnread].sort()).toEqual([...barTokenDeclarations].sort())

    expect(viewTokenReads).toHaveLength(3)
    expect(viewTokenUnread).toHaveLength(10)
    expect([...viewTokenReads, ...viewTokenUnread].sort()).toEqual(
      [...viewTokenDeclarations].sort(),
    )

    // Ten of the twenty-eight declarations have a read path in the source.
    expect(barTokenReads.length + viewTokenReads.length).toBe(10)
    expect(barTokenDeclarations.length + viewTokenDeclarations.length).toBe(28)
  })

  it('registers every read role, and only the two unread ones ADR 0039 justifies', () => {
    const registration = defaultTokenSet.componentTokens.find(
      (candidate) => candidate.component === 'search-bar',
    )

    expect(registration?.task).toBe('T47')
    expect(registration?.source.revision).toBe('a90df2fc27e026b9ad2ed569f203a260c1041fab')
    expect(registration?.tokens['container-color'].value).toEqual({
      $ref: 'sys.color.surfaceContainerHigh',
    })
    expect(registration?.tokens['view-divider-color'].value).toEqual({
      $ref: 'sys.color.outline',
    })
    expect(registration?.tokens['container-height'].value).toBe('56px')

    const names = Object.keys(registration?.tokens ?? {})
    // Unread roles are recorded in this ledger, not registered as behavior.
    expect(names).not.toContain('container-elevation')
    expect(names).not.toContain('hover-supporting-text-color')
    expect(names).not.toContain('pressed-supporting-text-color')
    expect(names).not.toContain('view-docked-header-container-height')
    expect(names).not.toContain('view-full-screen-header-container-height')
    // The two exceptions, each with a rendered read path here.
    expect(names).toContain('avatar-size')
    expect(names).toContain('focus-ring-color')
  })

  it('accounts for every current and deprecated source entry', () => {
    expect(currentSurface).toHaveLength(197)
    expect(new Set(currentSurface).size).toBe(197)
    expect(deprecatedSurface).toHaveLength(14)
    expect(new Set(deprecatedSurface).size).toBe(14)
  })

  it('freezes all 64 pinned test cases', () => {
    const all = [...behaviorTests, ...screenshotTests]

    expect(behaviorTests).toHaveLength(28)
    expect(screenshotTests).toHaveLength(36)
    expect(all).toHaveLength(64)
    expect(new Set(all).size).toBe(64)
  })

  it('records every exclusion, adaptation, and anomaly with its reason', () => {
    expect(exclusions).toHaveLength(7)
    expect(new Set(exclusions).size).toBe(7)
    expect(nativeWebAdaptations).toHaveLength(8)
    expect(new Set(nativeWebAdaptations).size).toBe(8)
    expect(implementationAnomalies).toHaveLength(7)
    expect(new Set(implementationAnomalies).size).toBe(7)
  })

  it('collapses the four expanded composables onto two configuration axes', () => {
    expect(componentSource).toContain("appearance = 'contained'")
    expect(componentSource).toContain("layout = 'adaptive'")
    expect(componentSource).toContain('data-m3e-appearance={appearance}')
    expect(barrel.match(/export \{[^}]*\}/g)).toEqual([
      'export { SearchBar }',
      'export { SearchAppBar }',
    ])
    expect(componentSource).not.toMatch(
      /export const (ExpandedFullScreenSearchBar|ExpandedDockedSearchBar|DockedSearchBar|TopSearchBar)/,
    )
  })

  it('resolves the adaptive layout at the compact window class', () => {
    expect(componentSource).toContain('COMPACT_BREAKPOINT_PX = 600')
    expect(componentSource).toMatch(/min-width: \$\{COMPACT_BREAKPOINT_PX\}px/)
  })

  it('ports the sourced expansion triggers and none of the touch-mode split', () => {
    // Pointer activation, a growing query, and the down key — the source's
    // click detection, `snapshotFlow` on the text, and `expandOnDownKey`.
    expect(componentSource).toContain('next.length > resolvedQuery.length')
    expect(componentSource).toContain("event.key === 'ArrowDown'")
    expect(componentSource).toContain('focusFirstResult()')
    expect(componentSource).not.toContain('InputMode.Touch')
  })

  it('carries the search app bar on the shared scroll primitive, namespaced', () => {
    expect(appBarSource).toContain("variablePrefix: 'search-app-bar'")
    expect(primitiveSource).toContain("variablePrefix = 'app-bar'")
    expect(css).toContain('--m3e-search-app-bar-offset')
  })

  it('adapts every sourced dimension to a component token rather than an inline style', () => {
    for (const token of [
      'container-height',
      'min-width',
      'max-width',
      'vertical-padding',
      'view-docked-min-height',
      'view-docked-dropdown-gap',
    ]) {
      expect(css).toContain(`var(--m3e-comp-search-bar-${token})`)
    }
    expect(componentSource).not.toContain('style={{')
    expect(appBarSource).not.toContain('style={{')
  })
})
