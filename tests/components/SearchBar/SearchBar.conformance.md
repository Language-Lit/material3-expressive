# SearchBar conformance

Task: T47
Status: conformant
Reviewed: 2026-07-24

## Primary references

- Material 3 Search overview, accessed 2026-07-24:
  <https://m3.material.io/components/search/overview>
- Material 3 Search specs, accessed 2026-07-24:
  <https://m3.material.io/components/search/specs>
- Material 3 Search guidelines, accessed 2026-07-24:
  <https://m3.material.io/components/search/guidelines>
- Material 3 Search accessibility, accessed 2026-07-24:
  <https://m3.material.io/components/search/accessibility>
- Pinned `SearchBar.kt`, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/SearchBar.kt>
- Pinned generated `SearchBarTokens.kt`, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SearchBarTokens.kt>
- Pinned generated `SearchViewTokens.kt`, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SearchViewTokens.kt>
- WAI-ARIA Authoring Practices, combobox pattern, accessed 2026-07-24:
  <https://www.w3.org/WAI/ARIA/apg/patterns/combobox/>
- HTML Standard, the `dialog` element, accessed 2026-07-24:
  <https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element>

Supported baseline: AndroidX Material 3 revision
`a90df2fc27e026b9ad2ed569f203a260c1041fab` — the reference snapshot T44 adopted
and T45/T46 extended. All five pinned search files were fetched at that revision
and at `androidx-main` HEAD (`409acc1915f01da1855d63bb721e4635ec736f84`,
committed 2026-07-24). `SearchBar.kt` and both token files are byte-identical.
`SearchBarTest.kt` and `SearchBarScreenshotTest.kt` differ by one line each —
`createComposeRule(StandardTestDispatcher())` became `createComposeRule()` — a
Compose test-infrastructure change that adds, removes, and renames no case, so
the pin holds and the delta is classified rather than re-pinned (the T44 rule).
Both generated token files identify version `v0_210`.

## Family boundary

This record covers catalog row 25 in full: the search bar, both official
styles (contained and divided), both official layouts (docked and full-screen)
plus the adaptive rule that chooses between them, and the search app bar
specimen T46 dispositioned here from row 1.

Two exports carry it. `SearchBar` is the bar and its expanded surfaces;
`SearchAppBar` is the app-bar chrome around one. They are separate for the same
reason the source separates them: `AppBarWithSearch` composes `SearchBar`
inside its own surface and never touches a top app bar, and its
navigation/action slots and scroll coupling apply to no plain search bar.

## Public-source surface ledger

197 current entries at parameter granularity across `SearchBar`,
`AppBarWithSearch`, `ExpandedFullScreenSearchBar`,
`ExpandedFullScreenContainedSearchBar`, `ExpandedDockedSearchBar`,
`ExpandedDockedSearchBarWithGap`, `SearchBarValue`, `SearchBarState` and its
three `remember*` factories, `SearchBarScrollBehavior`, `SearchBarColors`,
`AppBarWithSearchColors`, and the twenty-one `SearchBarDefaults` members.
Fourteen deprecated entries: the renamed `TopSearchBar`, the two
`expanded`/`onExpandedChange` composables that predate `SearchBarState` with
their hidden binary-compatibility twins, three superseded `InputField`
overloads, three hidden color factories, the renamed `Elevation`, the legacy
scroll-behavior overload, and the two-argument `SearchBarColors` constructor.

The four expanded composables are the cross product of two axes the design
site's own configuration table names — Style (contained, divided) and Layout
(docked, full-screen) — so they map to `appearance` and `layout` props rather
than four exports. `ExpandedDockedSearchBarWithGap` is contained-docked,
`ExpandedDockedSearchBar` is divided-docked, and the two full-screen
composables split the same way.

`SearchBarState` maps onto the controllable `expanded` triple. Its `progress`,
`isAnimating`, `targetValue`/`currentValue` split, and `snapTo` describe a
Compose `Animatable` mid-flight; the web equivalent is a CSS transition the
component does not sample, so those members are adapted rather than exposed.
The `inputField` slot becomes real props — the field is the component's own
control here, not a caller-provided composable — and `SearchBarColors` /
`AppBarWithSearchColors` become component tokens.

## Generated-role completeness ledger

Twenty-eight declarations across the two files; the pinned implementation reads
ten.

| Role | Disposition |
| --- | --- |
| `SearchBarTokens.ContainerColor` | read → `--m3e-comp-search-bar-container-color` |
| `SearchBarTokens.ContainerHeight` | read → `--m3e-comp-search-bar-container-height` |
| `SearchBarTokens.ContainerShape` | read → `--m3e-comp-search-bar-container-shape` |
| `SearchBarTokens.InputTextColor` | read → `--m3e-comp-search-bar-input-text-color` |
| `SearchBarTokens.LeadingIconColor` | read → `--m3e-comp-search-bar-leading-icon-color` |
| `SearchBarTokens.SupportingTextColor` | read → `--m3e-comp-search-bar-supporting-text-color` |
| `SearchBarTokens.TrailingIconColor` | read → `--m3e-comp-search-bar-trailing-icon-color` |
| `SearchViewTokens.DividerColor` | read → `--m3e-comp-search-bar-view-divider-color` |
| `SearchViewTokens.DockedContainerShape` | read → `--m3e-comp-search-bar-view-docked-container-shape` |
| `SearchViewTokens.FullScreenContainerShape` | read → `--m3e-comp-search-bar-view-full-screen-container-shape` |
| `SearchBarTokens.AvatarShape` / `AvatarSize` | unread upstream; registered here, because the specification's anatomy and measurement table describe exactly this slot (ADR 0039) |
| `SearchBarTokens.FocusIndicatorColor` | unread upstream; registered here, because the source does draw an inset focus ring but colors it from the ripple theme (ADR 0039) |
| `SearchBarTokens.ContainerElevation` | unread — `Level3`, while both `SearchBarDefaults` elevations are `Level0`, so a search bar ships flat |
| `SearchBarTokens.InputTextFont` / `SupportingTextFont` | unread — the field takes its type from the ambient text style, which is the same body-large role |
| `SearchBarTokens.HoverSupportingTextColor` / `PressedSupportingTextColor` | unread — hinted text does not change color on hover or press in the implementation |
| `SearchViewTokens.ContainerColor` / `ContainerElevation` | unread — the view surface resolves `SearchBarDefaults.colors()`, which reads the bar's own container color |
| `SearchViewTokens.DockedHeaderContainerHeight` / `FullScreenHeaderContainerHeight` | unread — the view reuses the collapsed field instead of composing a header, yet 8 + 56 + 8 lands exactly on the declared 72dp |
| `SearchViewTokens.Header*` (five roles) | unread — same cause: there is no separate header to color or set type on |

Registered beside them are the `SearchBarDefaults` members and private
measurement constants the source reads directly: the 360/720dp width bounds,
`SearchBarVerticalPadding` (8dp), the docked drop-down's 12dp corner, 2dp gap
and 240dp minimum height, the `ScrimTokens` pair behind
`dockedDropdownScrimColor`, `fullScreenContainedSearchBarColor`,
`scrolledSearchBarContainerColor`, and the three app-bar paddings. The two
horizontal paddings are the source's own decomposition of its 16dp text inset:
12dp of text-field padding plus a 4dp `SearchBarIconOffsetX`.

`SearchAppBar` registers no color of its own — the source reads `AppBarTokens`
for its container, on-scroll, navigation and action colors, so it consumes the
`--m3e-comp-app-bar-*` tokens T46 registered. Disabled colors likewise consume
`--m3e-comp-text-field-disabled-*`, because `inputFieldColors` resolves every
disabled role from `FilledTextFieldTokens`.

## Anatomy and slots

The specification's six elements: container, leading icon, supporting (hinted)
text, optional trailing icon and avatar, input text, and a container for
suggestions or results. The results container is empty by default and takes
whatever content it is given — the specification's "use the list component to
add content" — so this library adds no role or item semantics to it.

The `avatar` slot is API beyond the pinned source, added because the
specification lists "with avatar" and "with trailing icon button and avatar" as
distinct specimens and the generated roles for it exist unread. ADR 0039
records the decision.

## Styles, layouts, and the adaptive rule

- **contained** (default, the recommended Expressive style) — the bar keeps its
  filled full-corner container in every state. Full-screen puts it on a
  `SurfaceContainerLow` backdrop; docked separates the drop-down by the sourced
  2dp gap, gives it the 12dp corner, and dims the page behind it.
- **divided** (baseline) — the bar's own container goes transparent once
  expanded and a divider separates it from the results, with the surface
  carrying the color. Docked shapes the whole container `CornerExtraLarge`.
- **docked** results reach two thirds of the window (half in the contained
  style, per `DockedExpandedWithGapTableMaxHeightScreenRatio`), never below the
  240dp minimum.
- **fullScreen** results fill the viewport, with no corners.
- **adaptive** (default) resolves the guidance itself — "full-screen in compact
  windows to docked in larger window sizes" — at the 600px compact breakpoint
  `NavigationSuite` already uses.

## DOM structure and native behavior

The collapsed bar is a normal-flow element. Both expanded surfaces carry their
own copy of the field, exactly as all four expanded composables take the input
field as a slot and re-render it, and the in-page bar is made `inert` while a
surface is open so exactly one combobox is focusable or exposed. The query
survives because it is hoisted; the caret survives because the selection is
copied across.

The full-screen surface is a native `<dialog>` opened with `showModal()` — the
ADR 0016 lifecycle Dialog, NavigationDrawer, and BottomSheet share — so the top
layer, the focus trap, the inert background, and focus restoration are the
platform's. The docked surface is the shared anchored-overlay portal `Menu` and
`Select` use, positioned over the collapsed bar's own box rather than below it,
which is where the source's popup places itself (`collapsedBounds.topLeft`).

## Accessible name, role, state, and keyboard interaction

The field is a `combobox` with `aria-expanded`, `aria-controls` pointing at the
results while they exist, and `aria-autocomplete="list"`. The source publishes
the same fact through a `stateDescription` of "Suggestions available"; ARIA's
own expanded state is the web-native equivalent and needs no live region.

The hinted search text is the accessible name, as the accessibility page
requires, and `aria-label` overrides it. Expansion follows the source's
non-touch rules in every input mode — pointer activation, a query that grew, or
the down key — because the web has no touch-mode signal and a search bar that
took over the screen on plain Tab focus would be hostile. The down key while
expanded moves focus to the first focusable result, the web-native reading of
`focusManager.moveFocus(FocusDirection.Down)`. Enter reports the search and
leaves the results showing, matching "the input text should remain visible, but
not in focus". Escape collapses; dismissal from inside the surface returns
focus to the in-page field, while an outside click leaves focus where the click
put it.

`SearchAppBar` is a `banner` landmark whose navigation and action slots keep
their native order and semantics.

## Bidirectional and adaptive behavior

Every dimension uses logical properties, so the leading slot leads and the
trailing slot trails in either direction. The bar spans its container and
honors the sourced 360/720dp bounds, with the minimum clamped to the space
available so a narrow viewport cannot overflow.

## Known web-specific deviations

- **Predictive back is excluded.** It is an Android system gesture; the browser
  owns its own back affordance, and Escape plus the dialog's own cancel path
  are the web's dismissal. Its five pinned screenshot cases are ledgered.
- **Window insets are excluded** — an Android window concern; a web page owns
  its own insets.
- **Fling settle becomes the shared idle snap** on a coupled search app bar,
  the same substitution T46 made.
- **Compose animation specs become semantic motion tokens** — the enter/exit
  tween pairs map to the fast-effects role rather than being reproduced.
- **Soft-keyboard interception is excluded** — `DisableSoftKeyboard` suppresses
  the Android IME for a collapsed field; the web has nothing to suppress.
- **Reverse-layout scrolling is excluded** — a Compose lazy-list concern, not a
  property of the search bar.
- **`SearchBarState.progress` has no public equivalent** — mid-flight animation
  progress is a Compose `Animatable` reading; here the transition is the
  browser's and is not sampled.
- **Hidden and warning-level compat shims are excluded** — the T44 class.
