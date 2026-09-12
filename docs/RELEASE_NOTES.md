# Release notes

## 1.3.0-rc.1 — 2026-09-12

Status: prerelease on npm's `next` tag. `latest` remains `1.2.2`. This is an
additive test release; the picker inventory remains experimental pending a
separate promotion review.

### Added

- **DatePicker and DateRangePicker.** Strict Gregorian ISO civil dates,
  calendar and text modes, docked and modal presentation, bounds, unavailable
  dates, locale formatting, keyboard grids, native form validation, and a
  vertically browsable range-month window.
- **TimePicker.** Strict `HH:mm` civil times, dial and numeric-input modes,
  vertical and horizontal layouts, 12/24-hour presentation, exact-minute
  selection, bounds, form validation, and native modal drafts.
- **DateTimePicker.** A composition of the public date and time components
  which retains civil values, validates boundary times, and submits one
  combined ISO value.

The release has no runtime dependencies, retains the four public export paths,
and does not change existing component APIs. See ADR 0044 and the picker
component documentation for source pins and web adaptations.

## 1.2.2 — 2026-08-13

Status: prepared patch release. No export, prop, token, or dependency change;
the public surface is identical to `1.2.1`.

### Fixed

- **`Switch`: the visible ends of the track did not respond to a tap** —
  reported against a bare, unlabelled `Switch`. The root sized its box at the
  48px minimum interactive target on both axes while the track paints 52px
  wide, and the native `<input>` is `position: absolute; inset: 0`, so the hit
  surface was the 48px box and no larger. That left 2px of painted track dead
  at each end, with nothing to forward the click: the track is `aria-hidden`,
  carries no handler, and the root is a `<span>` rather than a `<label>`.

  This was a conformance defect, not only an ergonomic one. The pinned
  AndroidX source composes the target through
  `minimumInteractiveComponentSize()`, which measures
  `maxOf(placeable.width, sizePx)` per axis — a floor that grows the target to
  hold a larger child, never a ceiling that clips it. Upstream the Switch
  target is therefore 52×48 and the whole track is tappable. A CSS
  `inline-size` is a clamp, so the web control shipped 48×48 under a 52×32
  visual. The target is now
  `max(minimum-interactive-target, track-width)` by
  `max(minimum-interactive-target, track-height)` — the max is written on both
  axes because the source takes it on both and both inputs are
  consumer-overridable tokens (T59).

  Every `SwitchTokens.kt` dimension already matched the registration; the
  defect was in how the root consumed `minimum-interactive-target`, so no
  token value changed. The defect predates `1.0.0` — it is present in the
  commit that first added the component.

  A consumer who wraps `Switch` in a `<label>`, as the playground examples do,
  was never affected: the label forwards a click from anywhere in its own box.

## 1.2.1 — 2026-08-04

Status: prepared patch release. No export, prop, token, or dependency change;
the public surface is identical to `1.2.0`.

### Fixed

- **`Tabs`: the sliding indicator misplaced itself on any scrolled row** —
  reported as a mobile-only defect. The indicator is absolutely positioned
  *inside* the scrollable tablist, so it lives in the scrolled content's
  coordinate space, but its position was measured in viewport space. The two
  spaces coincide only at `scrollLeft === 0`, so a fresh, unscrolled mount
  looked correct and any re-measure while scrolled — selecting a tab after
  scrolling the row, a `ResizeObserver` firing on rotation or keyboard
  appearance, a window resize — landed the indicator exactly `scrollLeft`
  pixels toward the start. Fixed by converting the measurement to content
  space (T56).

  Two related defects were repaired in the same pass: the indicator's anchor
  was a logical `inset-inline-start`, which resolves to the *opposite* edge
  under RTL from the physical measurement driving its transform, pushing it
  off the row entirely; it is now the physical `left` edge, matched to the
  physical measurement. And selecting a tab called `scrollIntoView`, which
  walks every scrollable ancestor and could scroll the whole page — it now
  scrolls only the tab row itself, centering the selection the way the
  pinned AndroidX `ScrollableTabRow` does.

  See ADR 0019's Corrections section for the full analysis.

- **`Carousel`: scrolling a carousel under a page's own fixed or sticky
  chrome painted the carousel on top of it.** The parallax paint pass gives
  focal items `z-index` values up to 1000 to translate the source's
  fractional focal `Modifier.zIndex`, but the carousel created no stacking
  context of its own, so those levels joined the *page's* stacking context
  instead of staying scoped to the carousel's own layout, as the source's
  ordering is. Any page chrome under `z-index: 1000` — a sticky header being
  the reported case — lost to a carousel scrolled beneath it. Fixed with one
  `isolation: isolate` declaration, containing the parallax stacking the way
  the source's sibling-scoped `zIndex` modifier always was (T57). See
  ADR 0040's Corrections section.

### Verification target

Same as `1.2.0`: `npm run check:docs` and `npm run verify`. See
[RELEASE_READINESS.md](RELEASE_READINESS.md) for the `1.2.1` audit.

## 1.2.0 — 2026-07-26

Status: prepared minor release. Additive only — seven new conformant families
lifting the matrix from the published `1.1.0` count of 34 to 41, plus one
provenance correction to an existing component's token value. No existing
export, prop, token name, dependency, or export-map path is removed or
renamed. A consumer on `1.1.0` upgrades without edits.

### Added

- **`ListItem` and `SegmentedListItem`.** One native-semantic family covers
  passive rows, native button actions, radio-backed single selection, and
  checkbox-backed multiple selection. It preserves the pinned AndroidX
  56/72/88px line geometry, segmented gaps/corners, selected/disabled/dragged
  state resolution, and distinct `ReorderListTokens` ownership (ADR 0032;
  T40). Controlled and uncontrolled selection, native forms/reset, SSR,
  logical RTL layout, forced colors, reduced motion, and scoped component-token
  overrides are covered.
- **`Divider`.** The thin line that groups content in lists and layouts, ported
  from AndroidX `Divider.kt` at the pinned revision
  `a90df2fc27e026b9ad2ed569f203a260c1041fab` (ADR 0034; T42). One `orientation`
  prop covers both source composables. An `as` prop selects `hr` (default),
  `div`, or `li` — `li` is required inside `<ul>`/`<ol>`, whose content model
  rejects `hr`. A `decorative` prop removes the line from the accessibility
  tree; the default exposes a native separator. Thickness and color are
  component tokens rather than props, so overrides compose with the theme and
  never emit an inline style. This is the first family whose generated token
  file has no unread remainder.
- **`Badge` and `BadgeAnchor`.** The notification marker that sits on an icon,
  ported from AndroidX `Badge.kt` at the pinned revision
  `a90df2fc27e026b9ad2ed569f203a260c1041fab` (ADR 0035; T43). Content selects
  the variant exactly as the source does: `<Badge />` is the 6px dot and
  `<Badge>3</Badge>` is the 16px pill that grows with its count.
  `BadgeAnchor` reproduces the source's placement — offsets that change with
  the badge's content, relative placement that mirrors under RTL, and
  out-of-flow sizing so an anchor measures only its content. A `label` prop
  names the badge for assistive technology, which the Compose source has no
  equivalent for and which the web needs because the components a badge sits on
  hide their icon slots from the accessibility tree.
- **`badge` on navigation and tab items.** `NavigationBar`, `NavigationRail`,
  `NavigationDrawer`, `NavigationSuite`, and `Tabs` accept an optional `badge`
  per item — the five components the pinned source makes room for one on. The
  bar, rail, and tabs anchor it to the icon. The drawer renders it as an
  end-side label, because `NavigationDrawerItem`'s own `badge` is a different
  affordance: a trailing count in the item's text color rather than the
  error-colored pill.
- **`BottomSheet`.** The first composite of tranche C, ported from AndroidX
  `BottomSheet.kt`, `ModalBottomSheet.kt`, and `SheetDefaults.kt` at the pinned
  revision `a90df2fc27e026b9ad2ed569f203a260c1041fab` (ADR 0037; T45). Upstream
  splits the family across three public composables that do not partition by
  "sheet" versus "not sheet", so a `variant` prop selects the inline surface or
  the modal one — scrim, focus containment, outside-click and back-press
  dismissal follow the variant rather than a second component. Dragging is
  handle-only, matching the source's own gesture ownership. `BottomSheetScaffold`
  is documented as a recipe over `AppBar` and this component instead of shipping
  as an app-shell export. New exports: `BottomSheet`, `BottomSheetProps`,
  `BottomSheetState`, `BottomSheetVariant`.
- **`AppBar`.** One export across the source's six top-bar composables, ported
  from `AppBar.kt` at the same pinned revision (ADR 0038; T46). `size` selects
  the small/medium/large ladder and its two-row forms; `titleAlignment` covers
  the centered specimen. Compose's `NestedScrollConnection` scroll behaviors have
  no web equivalent, so `scrollBehavior` is rebuilt on web-native primitives —
  `position: sticky` for the pinned case, scroll position of a named container
  for the collapsing ones — preserving the sourced color and height matrix
  without a nested-scroll protocol. The catalog row splits three ways: bottom
  bars are excluded (the design catalog moved them to Toolbars, and
  `FlexibleBottomAppBar` already reads `DockedToolbarTokens`), and the search
  app bar ships with the Search family, whose source it actually comes from. New
  exports: `AppBar`, `AppBarProps`, `AppBarScrollBehavior`, `AppBarSize`,
  `AppBarTitleAlignment`.
- **`SearchBar` and `SearchAppBar`.** Two exports for the design's two axes,
  ported from `SearchBar.kt` at the same pinned revision (ADR 0039; T47). The
  source's six current composables collapse onto `appearance` (contained or
  divided) and `layout` (docked or full-screen); upstream renders the expanded
  search in a `Dialog` or `Popup`, which is not portable, but its structure is —
  the expanded surface owns its own field and the collapsed bar sits behind it.
  `layout` defaults to adaptive so the docked and full-screen forms are chosen by
  viewport rather than hardcoded. `SearchAppBar` is the app-bar-chrome form that
  borrows `AppBarTokens` colors while composing no top app bar. New exports:
  `SearchBar`, `SearchBarAppearance`, `SearchBarLayout`, `SearchBarProps`,
  `SearchAppBar`, `SearchAppBarProps`, `SearchAppBarScrollBehavior`.
- **`Carousel`.** One export over the source's three public composables, ported
  from the nineteen pinned carousel files at the same revision (ADR 0040; T48,
  with decision 6 corrected by T50, T54, and T55). All three upstream
  composables delegate to one internal `Carousel`, differing only by keyline
  list and visible-item count, so `layout` selects among them; the separate
  aspect-ratio engine is ported alongside the keyline engine, which is why
  `MultiAspectCarouselItem` exists as a distinct item type. The token registry is
  sourced from the specification where the generated token file has no
  equivalent. Mask shape, item size buckets, and adaptive content fading were
  each corrected against real-Chromium behavior after the initial port. New
  exports: `Carousel`, `CarouselItem`, `CarouselLayout`, `CarouselProps`,
  `CarouselScroll`, `MultiAspectCarouselItem`.

### Changed

- **The primitive tranche shares one upstream snapshot.** The fifteen primitive
  families were pinned across three scattered revision groups. Each family's
  pinned source, token, and test files were re-fetched at the family's own
  revision, at the reference snapshot
  `a90df2fc27e026b9ad2ed569f203a260c1041fab`, and at `androidx-main` HEAD, then
  compared (ADR 0036; T44). For every primitive file examined the reference
  snapshot equals HEAD, so the tranche is verified current and now describes one
  comparable snapshot. This adds no component and changes no rendered output;
  it is a provenance change to the source ledgers. The four composites above
  extend the same snapshot, so tranche C is pinned consistently with tranche P.

### Fixed

- **Tab rows draw the divider color their source actually renders.** `Tabs`
  registered `divider-color` from `SecondaryNavigationTabTokens.DividerColor`
  (`surfaceVariant`), a generated role the pinned `TabRow.kt` never reads: every
  `divider` parameter across both variants, both scrollable forms, and the
  deprecated overloads defaults to `HorizontalDivider()`, which is
  `outlineVariant`. T19 had no `Divider` component to trace the generic
  composable to; T42 added one, so the color is corrected (ADR 0034). The rule
  under a tab row shifts from `surfaceVariant` to `outlineVariant` — both are
  low-emphasis outline roles, and the change makes it match every other Material
  divider. `--m3e-comp-tabs-divider-color` and `-height` keep their names and
  remain overridable, so no theming surface changed.

## 1.1.0 — 2026-07-23

Status: prepared minor release. Additive only — two new components, no change to
any existing export, prop, token, dependency, or export-map path. A consumer on
`1.0.3` upgrades without edits.

### Added

- **`Slider` and `RangeSlider`.** A native-range slider family ported from
  AndroidX Material 3 `Slider.kt` at the pinned revision
  `225f50d42bf0adeb2abf4b6109befb5ab6ce4efc` (ADR 0031; T39). `Slider` covers
  continuous, stepped, centered, and vertical paths behind an `orientation`
  option, with `topToBottom` replacing the legacy `reverseDirection`;
  `RangeSlider` owns two semantic thumbs constrained not to cross. Each semantic
  thumb is a real `<input type="range">` — carrying role, value, name, focus,
  disabled state, form participation, and ref — beneath an `aria-hidden`
  Material rendering tree. Pointer gestures and keyboard deltas follow the pinned
  tap/slop/RTL/vertical/nearest-thumb rules rather than a browser's default
  range increments. The whole 48px track is the interactive target; the root
  shows `cursor: pointer` so the affordance matches that target rather than only
  the 4px handle.
- **`Chip`.** A compact action and selection control covering the assist,
  filter, input, and suggestion purposes through a discriminated API that
  rejects invalid prop combinations at the type level, rendering as a native
  `<button>`.

### Verification target

`npm run verify` (13 gates). See [RELEASE_READINESS.md](RELEASE_READINESS.md)
for the `1.1.0` audit.

## 1.0.3 — 2026-07-22

Status: prepared patch release. No export, prop, token, or dependency change;
the public surface is identical to `1.0.0`.

### Fixed

- Portaled overlays ignored the theme. `Menu`, `Select`'s popup listbox,
  `Tooltip`, and `Snackbar` render into `document.body`, which is a sibling of
  the element `Material3Provider` renders rather than a descendant, so they
  inherited none of its scope and resolved every custom property against
  `:root` — which carries the light scheme unconditionally as the
  no-JavaScript visual contract. Each now reconstitutes the enclosing scope on
  its own portal root (ADR 0029; T36).

  Three consequences, all of them user-visible:

  - **Color mode.** A menu opened in a dark scope painted the light scheme.
    Measured before the repair: `--m3e-sys-color-surface-container` resolved to
    `#211f26` on the provider element and `#f3edf7` on the portaled menu in the
    same document.
  - **Custom themes.** The provider's inline block also carries density,
    typography, shape, motion, and component-token overrides, so under a custom
    theme a portaled overlay rendered the *default* theme in every domain, not
    only in color.
  - **`Tooltip` and `Snackbar` were inverted the wrong way.** Both paint
    `inverseSurface`, so looking light on a dark page is correct; what they
    actually rendered was the light scheme's inverse — a dark chip on a dark
    page. The right role against the wrong scheme.

  Nested scopes are honored: an overlay opened inside a nested provider carries
  that nested scope. An overlay with no provider above it emits no scope at
  all, so an application that puts `.m3e-theme` and `data-m3e-color-mode` on
  `<html>` itself keeps governing `document.body`.

  The defect predates `1.0.0`; every published version to date has it.

### Verification target

Same as `1.0.0`: `npm run check:docs` and `npm run verify`. See
[RELEASE_READINESS.md](RELEASE_READINESS.md) for the `1.0.3` audit.

## 1.0.2 — 2026-07-22

Status: prepared patch release. No export, prop, token, or dependency change;
the public surface is identical to `1.0.0`.

`1.0.1` was prepared and tagged but never reached the registry, so `1.0.2`
carries **both** patches. A consumer upgrading from `1.0.0` receives the
`FabMenu` repair below as well as the `NavigationDrawer` one.

### Fixed

- `NavigationDrawer`: the `'modal'` variant could not be closed by pointer. It
  wired `showModal()`/`close()` and a native `close` listener but no
  outside-click handling, and it renders no close affordance of its own, so
  Escape was its only dismissal path — with nothing on screen saying so. A
  click on the scrim now closes it, matching both the component's own
  documented contract ("Escape/outside-click dismissal") and the pinned
  source's clickable scrim. Dismissal is unconditional; a consumer that needs
  to suppress it can `preventDefault()` in `onClick`, which runs first.
- `FabMenu` (carried from the unpublished `1.0.1`): an item's elevation shadow
  was clipped to a rectangle by `.m3e-fab-menu__item-slot { overflow: hidden }`,
  so only its corners survived and a rounded item read as a square halo. The
  slot no longer clips; the staged reveal animation is unchanged at default
  motion, under `prefers-reduced-motion: reduce`, and under
  `forced-colors: active`.

### Added

Carried from the unpublished `1.0.1`: `scripts/audit-rendering.mjs`
(`npm run audit:rendering`) and the in-repository documentation site at
`m3e.language-lit.com` (ADR 0028). Neither is part of the published package.

### Verification target

Same as `1.0.0`: `npm run check:docs` and `npm run verify`. See
[RELEASE_READINESS.md](RELEASE_READINESS.md) for the `1.0.2` audit.

## 1.0.1 — 2026-07-21

Status: prepared but never published. The `v1.0.1` tag exists on `main`, but the
version was never pushed to the registry — the registry went `1.0.0` straight to
`1.0.2`, which carries this patch's contents. No export, prop, token, or
dependency change; the public surface is identical to `1.0.0`.

### Fixed

- `FabMenu`: an item's elevation shadow was clipped to a rectangle by
  `.m3e-fab-menu__item-slot { overflow: hidden }`, so only its corners survived
  and a rounded item read as a square halo. The slot no longer clips; the
  staged reveal animation is unchanged at default motion, under
  `prefers-reduced-motion: reduce`, and under `forced-colors: active`.

### Added

- `scripts/audit-rendering.mjs` (`npm run audit:rendering`): a browser-based
  audit, run against the built playground, that checks for elevation shadows
  clipped by an ancestor and interactive targets under the WCAG 2.2 SC 2.5.8
  floor — defects that compile, pass jsdom-based unit tests, and are still
  wrong on screen. Not part of `npm run verify`, since it needs a real browser;
  documented in `AGENTS.md`.
- The in-repository documentation site at `m3e.language-lit.com`, built from
  the library's own components and consuming only its public exports (ADR
  0028).

### Verification target

Same as `1.0.0`: `npm run check:docs` and `npm run verify`. See
[RELEASE_READINESS.md](RELEASE_READINESS.md) for the `1.0.1` audit.

## 1.0.0 — 2026-07-21

Status: prepared stable release. The cutover replaces the 0.3 surface; it does
not publish to the registry or create a remote release.

### Added

- `.`, `/theme`, `/tokens`, and `/styles.css` as the complete public surface.
- A validated serializable theme/token system with light, dark, system, custom,
  and nested provider scopes.
- Thirty-two conformant public components listed in the generated
  [supported-component matrix](SUPPORTED_COMPONENTS.md).
- Native form, keyboard, focus, RTL, reduced-motion, forced-colors, SSR, and
  hydration behavior covered by component conformance gates.
- Framework-neutral Vite and Next.js packed-package fixtures.
- Public installation, theming, SSR, migration, and web-deviation guides.

### Removed

The 0.3 implementation was deleted rather than deprecated in place, because its
only known consumer completed migration first. `0.3.x` remains published for
applications that are not ready.

- The 0.3 components, hooks, utilities, provider, showcase, and token CSS.
- The `components/*`, `hooks`, `utils`, `context/*`, `showcase`, `styles`, and
  `tailwind-preset` subpath exports.
- The Tailwind preset and the optional `tailwindcss` peer dependency.
- All fourteen runtime dependencies. React and React DOM are the only peers.

### Breaking changes

`1.0.0` reuses the package root for a new API, so upgrading from `0.3.x` is a
deliberate migration rather than a version bump:

- component import paths and many prop contracts;
- stylesheet and CSS custom-property namespaces;
- provider responsibilities and theme representation;
- icon source handling;
- composite component state and semantic models;
- the supported-component scope.

See [MIGRATION.md](MIGRATION.md) for public concept mappings.

### Limitations

- The complete `/styles.css` file is the supported stylesheet; component CSS
  subpaths and token-only CSS are not public package exports.
- The support claim is limited to the generated conformant matrix. Chips,
  sliders, search, sheets, list items, app bars, carousel, and other possible
  1.x components are not included.
- Material 3 Expressive sources are evolving; each conformance record pins the
  source revision used by this release.
- Publication, registry dist-tags, and remote release creation require separate
  explicit approval.

### Verification target

The release must pass `npm run check:docs` and `npm run verify`, including
packed Vite/Next builds, the release contract, and bundle budgets. The
release-readiness record is [RELEASE_READINESS.md](RELEASE_READINESS.md).
