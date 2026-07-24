import type { ComponentTokenRegistration } from '../schema'

/**
 * AndroidX Material 3 search tokens at the pinned T47 revision, the reference
 * snapshot T44 adopted. Two generated files describe the family, exactly the
 * split the design site's token table describes: `SearchBarTokens` covers the
 * unfocused search bar (fifteen roles) and `SearchViewTokens` covers everything
 * reached by interacting with search (thirteen roles).
 *
 * The pinned implementation resolves ten of those twenty-eight: seven bar roles
 * (`ContainerColor`, `ContainerHeight`, `ContainerShape`, `InputTextColor`,
 * `LeadingIconColor`, `SupportingTextColor`, `TrailingIconColor`) and three view
 * roles (`DividerColor`, `DockedContainerShape`, `FullScreenContainerShape`).
 * The remaining eighteen are recorded in the ledger rather than registered,
 * with two consequential ones:
 *
 * - `SearchBarTokens.ContainerElevation` is `Level3`, but
 *   `SearchBarDefaults.TonalElevation` and `ShadowElevation` are both `Level0`,
 *   so the generated elevation has no read path and a search bar ships flat.
 * - `SearchViewTokens.FullScreenHeaderContainerHeight` (72dp) and
 *   `DockedHeaderContainerHeight` (56dp) are likewise unread, yet the layout
 *   composes them: a divided full-screen header is the 56dp input field plus
 *   `SearchBarVerticalPadding` above and below, which is exactly 72dp.
 *
 * Two registrations are deliberate exceptions to the read/unread rule, both
 * recorded in ADR 0039:
 *
 * - `avatar-shape`/`avatar-size` are declared in `SearchBarTokens` and read by
 *   nothing in the pinned source, but the specification's anatomy lists an
 *   avatar and its measurement table gives it 30dp, so this library's `avatar`
 *   slot gives the two roles the read path the implementation never wired.
 * - `focus-ring-color` is `SearchBarTokens.FocusIndicatorColor`. The source
 *   does draw an inset focus ring — `ripple(focusRingShape = shape, …)` when
 *   the ripple theme asks for one — but takes its color from that ripple theme
 *   rather than from the generated role. The role names exactly this ring, and
 *   `Secondary` is the value every other focus ring in this library already
 *   uses, so it is registered instead of hard-coded. The negative offset is
 *   what makes it the source's *inset* ring rather than an outline.
 *
 * Everything below the generated roles is a `SearchBarDefaults` member or a
 * private measurement constant, registered because the source reads it
 * directly: the 360/720dp width bounds, `SearchBarVerticalPadding` (8dp), the
 * docked drop-down's 12dp corner and 2dp gap and 240dp minimum height, the
 * scrim pair `dockedDropdownScrimColor` composes from `ScrimTokens`,
 * `fullScreenContainedSearchBarColor` and `scrolledSearchBarContainerColor`
 * (both carrying the source's own "TODO: replace with token" comment), and the
 * three app-bar paddings `AppBarWithSearch` applies. The two horizontal
 * paddings are the source's own decomposition, stated in its own comment:
 * "Search bar has 16dp padding between icons and start/end, while by default
 * text field has 12dp". `input-horizontal-padding` is that 12dp and
 * `icon-horizontal-padding` is the 4dp `SearchBarIconOffsetX` beside it, so an
 * unaccompanied query sits at the sourced 16dp while a 48dp icon target's 24dp
 * glyph lands on the same 16dp line.
 *
 * `SearchAppBar` registers no color of its own. The source reads `AppBarTokens`
 * for its container, on-scroll container, navigation-icon and action-icon
 * colors, so it consumes the `--m3e-comp-app-bar-*` tokens T46 registered
 * rather than duplicating them under a second name.
 */
export const defaultSearchBarTokens = {
  component: 'search-bar',
  task: 'T47',
  source: {
    id: 'androidx-material3-search-bar',
    url: 'https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SearchBarTokens.kt',
    revision: 'a90df2fc27e026b9ad2ed569f203a260c1041fab',
    accessed: '2026-07-24',
  },
  tokens: {
    'container-color': {
      kind: 'color', value: { $ref: 'sys.color.surfaceContainerHigh' },
    },
    'scrolled-container-color': {
      kind: 'color', value: { $ref: 'sys.color.surfaceContainerHighest' },
    },
    'container-height': { kind: 'dimension', value: '56px' },
    'container-shape': {
      kind: 'shape', value: { $ref: 'sys.shape.corners.cornerFull' },
    },
    'input-text-color': { kind: 'color', value: { $ref: 'sys.color.onSurface' } },
    'leading-icon-color': { kind: 'color', value: { $ref: 'sys.color.onSurface' } },
    'supporting-text-color': {
      kind: 'color', value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'trailing-icon-color': {
      kind: 'color', value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'avatar-shape': {
      kind: 'shape', value: { $ref: 'sys.shape.corners.cornerFull' },
    },
    'avatar-size': { kind: 'dimension', value: '30px' },
    'focus-ring-width': { kind: 'dimension', value: '2px' },
    'focus-ring-offset': { kind: 'dimension', value: '-2px' },
    'focus-ring-color': { kind: 'color', value: { $ref: 'sys.color.secondary' } },
    'min-width': { kind: 'dimension', value: '360px' },
    'max-width': { kind: 'dimension', value: '720px' },
    'input-horizontal-padding': { kind: 'dimension', value: '12px' },
    'icon-horizontal-padding': { kind: 'dimension', value: '4px' },
    'vertical-padding': { kind: 'dimension', value: '8px' },
    'app-bar-horizontal-padding': { kind: 'dimension', value: '4px' },
    'app-bar-vertical-padding': { kind: 'dimension', value: '4px' },
    'app-bar-search-padding': { kind: 'dimension', value: '8px' },
    'view-divider-color': { kind: 'color', value: { $ref: 'sys.color.outline' } },
    'view-docked-container-shape': {
      kind: 'shape', value: { $ref: 'sys.shape.corners.cornerExtraLarge' },
    },
    'view-full-screen-container-shape': {
      kind: 'shape', value: { $ref: 'sys.shape.corners.cornerNone' },
    },
    'view-full-screen-contained-container-color': {
      kind: 'color', value: { $ref: 'sys.color.surfaceContainerLow' },
    },
    'view-docked-dropdown-shape': { kind: 'shape', value: '12px' },
    'view-docked-dropdown-gap': { kind: 'dimension', value: '2px' },
    'view-docked-min-height': { kind: 'dimension', value: '240px' },
    'view-scrim-color': { kind: 'color', value: { $ref: 'sys.color.scrim' } },
    'view-scrim-opacity': { kind: 'opacity', value: 0.32 },
  },
} as const satisfies ComponentTokenRegistration
