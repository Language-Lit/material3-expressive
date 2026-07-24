# AppBar conformance

Task: T46
Status: conformant
Reviewed: 2026-07-24

## Primary references

- Material 3 App bars, accessed 2026-07-24:
  <https://m3.material.io/components/app-bars/overview>
- Material 3 App bars specs, accessed 2026-07-24:
  <https://m3.material.io/components/app-bars/specs>
- Material 3 App bars guidelines, accessed 2026-07-24:
  <https://m3.material.io/components/app-bars/guidelines>
- Material 3 App bars accessibility, accessed 2026-07-24:
  <https://m3.material.io/components/app-bars/accessibility>
- Pinned `AppBar.kt`, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/AppBar.kt>
- Pinned generated `AppBarTokens.kt` and the five tier files, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/AppBarTokens.kt>
- HTML Standard, the `header` element, accessed 2026-07-24:
  <https://html.spec.whatwg.org/multipage/sections.html#the-header-element>
- CSS Positioned Layout, sticky positioning, accessed 2026-07-24:
  <https://www.w3.org/TR/css-position-3/#stickypos-insets>

Supported baseline: AndroidX Material 3 revision
`a90df2fc27e026b9ad2ed569f203a260c1041fab` — the reference snapshot T44 adopted
and T45 extended. All eighteen pinned app-bar files were fetched at that
revision and at `androidx-main` HEAD
(`477f94858de4569261d2ba58329e928d2683b7eb`, committed 2026-07-24) and compared
byte-for-byte; every one is identical. Generated `AppBarTokens.kt` identifies
version `14_0_0`.

## Family boundary

This record covers the top app bar family: catalog row 1's current specimens
(small with optional centered title, medium, medium flexible, large, large
flexible) plus the baseline medium/large variants the source keeps stable. The
row is **Partial**, and this record does not claim otherwise:

- The overflow-action system (`AppBarRow`/`AppBarColumn`/`AppBarDsl`, 22 pinned
  tests) is behavior-owning — it measures available width and relocates items
  into a menu — so per the completeness contract it must be an API, not a
  recipe, and it is deferred to its own approved task.
- `BottomAppBar`/`FlexibleBottomAppBar` live in the same pinned file but the
  current design index files them under Toolbars (row 35): the bottom app bar
  is "no longer recommended... replaced with the docked toolbar", and the
  flexible variant already reads `DockedToolbarTokens`.
- The "Search app bar" specimen's source is `AppBarWithSearch` in
  `SearchBar.kt` (row 25), which borrows `AppBarTokens` colors without
  composing any top app bar; the guidelines' own rule is "don't transform app
  bars into a search app bar."

## Public-source surface ledger

121 in-scope current entries at parameter granularity across `TopAppBar` (with
its subtitle overload), `CenterAlignedTopAppBar`, `MediumTopAppBar`,
`MediumFlexibleTopAppBar`, `LargeTopAppBar`, `LargeFlexibleTopAppBar`,
`TwoRowsTopAppBar`, `TopAppBarScrollBehavior`, `TopAppBarState`,
`rememberTopAppBarState`, `TopAppBarColors`, and the eighteen
`TopAppBarDefaults` members. Sixteen dispositioned entries at composable
granularity (seven bottom-bar, nine overflow-system). Ten deprecated entries:
five hidden binary-compatibility overloads and five warning-level migrations.

The six size-variant composables map to one `AppBar` export through
`size` × `flexible` × `titleAlignment` × `subtitle`. The source itself
collapses them: center-aligned is the small bar with a centered title — the
current catalog merged the specimen away — and every two-row variant delegates
to `TwoRowsTopAppBar`. Baseline-versus-flexible is a token-family axis (Large
is 152px/headline-medium where Large flexible is 120px/display-small), so it
is a prop rather than parallel exports. `TwoRowsTopAppBar` itself is
ledger-accounted, not exported: its custom heights are dimension parameters,
and this library's equivalent of a dimension parameter is a scoped token
override.

`SheetState`-style machinery maps as follows: `TopAppBarState`'s
`collapsedFraction` becomes the scroll primitive's fraction;
`overlappedFraction` becomes the scrolled flag; `heightOffset` becomes the
enter-always offset. None is a controlled prop — the fraction is a
scroll-derived measurement, not enumerable state, a documented deviation from
the controlled/uncontrolled rule. `TopAppBarColors` and the height parameters
are adapted to the seventeen component tokens. `windowInsets` and
`contentPadding` are Compose inset composition; the bar is a normal-flow
`header` and page insets belong to the page.

## Generated-role completeness ledger

`AppBarTokens` declares fourteen roles; the pinned top-bar composables resolve
six, all registered:

| Role | Disposition |
| --- | --- |
| `ContainerColor` | read → `--m3e-comp-app-bar-container-color` |
| `OnScrollContainerColor` | read → `--m3e-comp-app-bar-on-scroll-container-color` |
| `LeadingIconColor` | read → `--m3e-comp-app-bar-leading-icon-color` |
| `TitleColor` | read → `--m3e-comp-app-bar-title-color` |
| `TrailingIconColor` | read → `--m3e-comp-app-bar-trailing-icon-color` |
| `SubtitleColor` | read → `--m3e-comp-app-bar-subtitle-color` |
| `ContainerElevation` | read only by the row-35 `FlexibleBottomAppBar`; travels with that disposition |
| `ContainerShape` | unread (`CornerNone` — an edge-to-edge band) |
| `OnScrollContainerElevation` | unread — top bars change color, not elevation, on scroll |
| `IconSize` / `AvatarSize` / `IconButtonSpace` | unread — icon slots are `IconButton`, which owns its geometry |
| `LeadingSpace` / `TrailingSpace` | unread — shadowed by the hand-tuned `TopAppBarHorizontalPadding = 4.dp` the code reads instead |

The `LeadingSpace`/`TrailingSpace` shadowing is the notable anomaly: the
generated roles and the private constant agree at 4dp today, but only the
constant is on the read path, so `horizontal-padding` registers the constant —
the same prefer-the-read-path rule T42 established and T45 applied.

All fifteen tier-file roles are read. Heights become the seven height tokens
(64, 112, 112/136, 152, 120/152); the title/subtitle fonts are consumed
directly from the baseline typescale custom properties per tier (title-large
and label-medium on the small/collapsed row; headline-small on medium;
headline-medium with label-large on medium flexible; headline-medium on large;
display-small with title-medium on large flexible). The hand-tuned
`TopAppBarTitleInset` (12px), `MediumTitleBottomPadding` (24px), and
`LargeTitleBottomPadding` (28px) are registered; `TopTitleAlphaEasing`
cubic-bezier(.8, 0, .8, .15) is evaluated in the scroll primitive.

## Anatomy and slots

Container, leading (navigation) slot, title with optional subtitle, trailing
(actions) slot — the specification's five elements. A two-row bar renders the
title twice, as the source does: a small-typography copy in the collapsed row
and the expanded copy below. An icon-less title is inset 12px beyond the 4px
row padding, keeping text 16px from the edge, exactly the source's
`TopAppBarTitleInset` spacer.

## Scroll behaviors

- **pinned** — `position: sticky` keeps the bar at the container's top edge;
  the container color swaps to the on-scroll role at any overlap and back at
  the top, with the default-effects transition standing in for the source's
  animated binary swap at `overlappedFraction > 0.01`.
- **enterAlways** — the bar translates away by an offset accumulating raw
  scroll deltas, clamped to its own height: any downward scroll hides, any
  upward scroll begins revealing, exactly `heightOffset` under
  `dispatchRawDelta`. The source's velocity fling-settle becomes an idle snap:
  150ms after scrolling stops, a partially hidden bar settles to the nearer of
  fully shown and fully hidden, with the spatial transition applied only while
  settling so the bar tracks scroll exactly.
- **exitUntilCollapsed** — the expanded row shrinks over the sourced collapse
  range with a fraction derived deterministically from scroll position. The
  container color blends continuously — an overlay in the on-scroll color at
  the fraction's opacity, which alpha-composites to exactly the source's srgb
  lerp — while the collapsed title fades in through the sourced easing and the
  expanded title fades out linearly. Position-derived fraction subsumes the
  source's "remain small until scrolled back to the top" and leaves no
  independent state for the mid-collapse snap to act on.

Single-row bars have no second row, so `exitUntilCollapsed` is rejected there
by the type system and warned about at runtime.

## DOM structure and native behavior

The root is a `<header>` — a `banner` landmark in body context — and stays a
normal-flow element: no portal, no fixed positioning, no z-index management
beyond the sticky band itself. The scroll container is the window by default,
with an element ref opt-in, because Compose's nested-scroll wiring has no web
analog and naming the container explicitly is the honest equivalent.

## Accessible name, role, state, and keyboard interaction

The title is a slot, not an automatic heading: the specification forbids
coupling typography roles to document structure, so a consumer who wants the
bar title to be the page's `h1` renders one into the slot. The two title
copies of a two-row bar expose exactly one to assistive technology at a time,
crossing at fraction 0.5 — the source's own semantics threshold. Slotted
controls keep their native order and semantics; the bar adds no roving focus,
matching the accessibility page's plain Tab/activate model.

The page's requirement to "maintain access to app bar actions when content is
scrolled" is satisfied structurally for pinned and exit-until-collapsed bars
(the collapsed row never leaves the viewport) and by the focus-within reveal
for enter-always bars: focus landing inside a hidden bar resets its offset,
with the settle transition, so keyboard users never operate an off-screen
control. The source's own accessibility affordance — auto-disabling scroll
behavior under TalkBack — is an Android service query with no web equivalent;
the focus reveal is the web-native answer to the same requirement.

## Bidirectional and adaptive behavior

Every dimension uses logical properties; the leading slot leads and the
trailing slot trails in either direction. The bar spans its container's full
inline size, per the guidelines' 100%-width rule. Trailing-action overflow at
small widths is the deferred overflow-action system, named in the roadmap
row's remaining work.

## Known web-specific deviations

- **The bar-drag resize gesture is excluded.** Dragging the bar itself is a
  touch affordance the web reserves for scrolling; the scroll coupling is the
  port. Its five pinned drag tests are ledgered as excluded behavior.
- **Fling settle is replaced by an idle snap** (enter-always) and by
  position-derived determinism (exit-until-collapsed).
- **`contentPadding` and `windowInsets` are excluded** — Compose inset
  composition; a web page owns its own insets.
- **The scrolled color swap on single-row bars is a CSS transition**, not a
  Compose `animateColorAsState`, with the same default-effects motion role.
- **Collapse fraction has no controlled prop** — scroll-derived measurement,
  like T45's drag offset.
- **Hidden/warning-level compat shims are excluded** — the T44 class.
