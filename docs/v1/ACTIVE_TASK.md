# Active v1 task

## T20 — Navigation suite

Status: complete
Approved: 2026-07-20
Completed: 2026-07-20

### Scope

Four components sourced from the pinned AndroidX revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc` (`NavigationBar.kt`,
`NavigationRail.kt`, `NavigationDrawer.kt`, plus the separate
`material3-adaptive-navigation-suite` module's `NavigationSuiteScaffold.kt`/
`WindowSizeClassHelper.kt`), sharing one `NavigationItem` data type
(`{ value, label, icon, selectedIcon?, disabled?, href? }`, canonically
defined in `NavigationBar.types.ts` and re-exported by the other three —
the first cross-component-folder type reuse in v1, justified because these
four are explicitly designed to interoperate, unlike any prior pair of
components that merely share visual styling).

- **Web-native navigation semantics, not the ported `Role.Tab`**: the
  pinned source reuses `role = Role.Tab`/`selectable()` for `NavigationBar
  Item`/`NavigationRailItem` (and a plain `selectable()` for
  `NavigationDrawerItem`). This project deviates deliberately: `Tabs` (T19)
  already owns the `role="tablist"`/`role="tab"`/`role="tabpanel"` pattern
  for in-page panel-switching; a navigation bar/rail/drawer is a
  fundamentally different case — persistent *site/app* navigation, not
  in-page tabs — so each renders a `<nav aria-label>` containing plain
  focusable items (`<a href>` when navigating, `<button>` otherwise) with
  `aria-current="page"` on the active one. No roving `tabindex` and no
  arrow-key model either: items sit in normal tab order like any other
  navigation link list, since APG has no composite-widget requirement for
  a navigation menu the way it does for tabs. This is the V1_SPEC §3 "web
  semantic wins over ported platform guidance" clause applied for the
  first time to a *pattern* choice, not just a color/shape value.
- **`NavigationBar`**: horizontal row, `64px` height
  (`ContainerHeight`), evenly distributed items, `surfaceContainer`
  background, `level2` elevation. Each item: `24px` icon, a `56×32px`
  pill (`ActiveIndicatorWidth`/`Height`, `cornerFull`) behind the icon
  when selected (`secondaryContainer`, `onSecondaryContainer` icon —
  label tints `secondary`, a genuine sourced icon/label color split),
  `onSurfaceVariant` inactive, `labelMedium` label typography.
- **`NavigationRail`**: the same item visual language, vertical column,
  fixed width, optional `header` (a consumer-owned slot above the items,
  typically a FAB/menu button, matching the source's own `header` param).
  No shared sliding indicator between items — unlike `Tabs`, each item
  independently shows/hides its own pill on its own selected state, so no
  new measurement infrastructure is needed here.
- **`NavigationDrawer`**: `variant: 'modal' | 'dismissible' | 'permanent'`
  (default `'modal'`). `'modal'` reuses the same native `<dialog>` +
  `@starting-style` technique ADR 0016 established for `Dialog` (a small,
  independently duplicated ~20-line lifecycle, not an extracted shared
  primitive — the two components' exact backdrop/escape nuances differ
  enough that forced sharing would need its own parameterization, and this
  is the only other native-`<dialog>` caller so far), slid in from the
  logical start edge by animating `inset-inline-start` (not `transform`,
  so the slide direction auto-corrects under RTL with no JS branching).
  `'dismissible'` is a plain, non-modal side panel that collapses its own
  `inline-size` to `0` (participates in normal document flow, pushing
  adjacent content, matching the source's own non-scrimmed reveal).
  `'permanent'` is always visible with no open/close state at all. Items
  are full-width rows (`336×56px` pill, `cornerFull`,
  `secondaryContainer`) in a `360px`-wide container
  (`cornerLargeEnd` shape). The source's drag-to-dismiss gesture on the
  modal variant is excluded — Compose-specific gesture machinery with no
  clean web equivalent, the same basis Menu's drag-select exclusion used.
- **`NavigationSuite`**: composes the three other components directly
  (the first component in v1 to render another public v1 component
  internally, since it is explicitly designed to interoperate with them —
  unlike any prior pair, which only shared styling/tokens). Switches
  between them using the pinned source's own real `Compact`/`Medium`/
  `Expanded` width breakpoints (`0`/`600`/`840px`,
  `WIDTH_DP_MEDIUM_LOWER_BOUND`/`WIDTH_DP_EXPANDED_LOWER_BOUND`) via a new
  `window.matchMedia`-driven internal hook — compact → `NavigationBar`,
  medium → `NavigationRail`, expanded → `NavigationDrawer` (`'permanent'`).
  **Deliberate deviation from the pinned source's own
  `calculateFromAdaptiveInfo`**, which only 2-tier switches between
  `NavigationBar`/`NavigationRail` and never auto-selects
  `NavigationDrawer` at all: this task's own name explicitly groups
  "Bar, rail, drawer" under one adaptive suite, and the sourced
  Compact/Medium/Expanded breakpoint *tier names* already exist for
  exactly this three-way split elsewhere in the same pinned module, so a
  permanent drawer at the expanded tier is the more useful, expected
  behavior — documented, not hidden. SSR/pre-hydration renders the
  `'compact'` tier (mobile-first default) until the first client
  measurement corrects it, the same "renders a reasonable default before a
  real measurement is available" category `Tabs`' indicator and `Snackbar`
  auto-dismiss defaults both already established in different forms.

### Expected files

- `src/v1/components/NavigationBar/`, `NavigationRail/`,
  `NavigationDrawer/`, `NavigationSuite/`, their public barrels, and
  sourced component-token defaults for all four.
- Behavior, interaction, accessibility, theme, CSS, SSR, type-contract, and
  conformance evidence under `tests/v1/` for all four.
- Mirrored playground examples, playground usage, and packed Vite/Next
  fixture coverage.
- Documentation for all four, one ADR, architecture/provenance notes, and
  component-inventory rows for all four.
- An explicit bundle-budget update only if justified by measured output.

### Acceptance checks

- All four: `value`/`defaultValue`/`onValueChange` behave like every other
  v1 controlled/uncontrolled pair (`NavigationDrawer`'s `'permanent'`
  variant has no open/close state, matching the source). An item with
  `href` renders `<a aria-current="page">`; without, `<button>`. A
  disabled item is inert to click and omits `href` if it had one.
- `NavigationDrawer`'s `'modal'` variant: opens/closes like `Dialog`
  (native `<dialog>`, Escape/outside-click dismissal), slides from the
  logical start edge, and the slide direction is correct under RTL.
  `'dismissible'` collapses/expands in place without a backdrop or focus
  trap. `'permanent'` always renders, ignoring `open`/`onOpenChange`.
- `NavigationSuite` renders `NavigationBar` under 600px width,
  `NavigationRail` from 600–839px, and `NavigationDrawer` (`'permanent'`)
  at 840px and up, updating live on a simulated `matchMedia` change;
  nothing renders server-side beyond the compact-tier default.
- Forced colors keep every navigation surface and its pill/indicator
  visibly distinct from the page; logical properties mirror correctly
  under RTL; all transitions become immediate under reduced motion.
- Rendering and hydration remain deterministic (beyond `NavigationSuite`'s
  documented pre-measurement default) and inject no styles.
- Forced colors, RTL, reduced motion, default/custom/nested theme, CSS
  resolution, documentation, source provenance, playground examples,
  public exports, production fixtures, and inventory are covered and agree
  for all four components.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures,
  CSS checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
