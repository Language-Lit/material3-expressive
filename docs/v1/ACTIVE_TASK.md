# Active v1 task

## T19 — Tabs

Status: complete
Approved: 2026-07-20
Completed: 2026-07-20

### Scope

One data-driven `Tabs` component sourced from the pinned AndroidX revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc` (`Tab.kt`/`TabRow.kt`,
`PrimaryNavigationTabTokens`/`SecondaryNavigationTabTokens`), extending the
Menu/SegmentedButtonGroup data-array precedent: `items: readonly TabItem[]`,
`{ value, label, icon?, disabled?, href?, panel? }`.

- `variant?: 'primary' | 'secondary'` (default `'primary'`). Primary: a
  short, rounded, content-width-hugging indicator (`24px` default width,
  `3px` height, `RoundedCornerShape(3dp)`, primary color) that slides and
  resizes to the selected tab's own icon+label content width
  (`matchContentSize = true`); active content is tinted primary. Secondary:
  a full-tab-width underline indicator (same `3px` height, reusing the
  Primary token's own `ActiveIndicatorColor`/`Height` since
  `SecondaryNavigationTabTokens` defines none of its own — the pinned
  source's own `SecondaryIndicator` reads `PrimaryNavigationTabTokens`
  directly); active content is tinted plain `onSurface`, not primary —
  Secondary tabs are deliberately more subdued. Both read inactive content
  from `onSurfaceVariant`.
- **New sliding-indicator infrastructure** (first in v1 — no existing
  component measures and animates a shared element between sibling
  positions): a `useLayoutEffect`-driven measurement of the selected tab's
  own bounding rect (or, for `'primary'`, its inner content-wrapper rect,
  to reproduce `matchContentSize`) relative to the tablist container,
  applied as an absolutely-positioned indicator's inline `transform`/
  `width`, transitioned via CSS using the sourced `DefaultSpatial` motion
  slot — not `FastSpatial` like every prior overlay task; this is a
  content-shift transition, not an overlay entrance, and the source itself
  specifically uses `MotionSchemeKeyTokens.DefaultSpatial` for it. Repositions
  on window resize and on the tablist's own `ResizeObserver` (container
  reflow, e.g. responsive width or late font metrics).
- Roving `tabindex` across enabled tabs (APG Tabs pattern's own automatic-
  activation model, matching this project's other roving-focus components):
  ArrowLeft/ArrowRight move focus and select; Home/End jump to the first/
  last enabled tab and select. A disabled item is skipped by keyboard
  navigation and inert to click.
- **Link-safe API**: an item with `href` renders as a real `<a role="tab">`
  instead of `<button role="tab">`. Arrow-key movement still updates the
  local selected/indicator state (automatic activation is purely visual
  here), but actual navigation is left entirely to the browser's native
  anchor behavior (Enter or click) — arrow keys never synthesize a
  navigation. This lets a consumer drive tabs from a router's current route
  without `Tabs` owning any routing concept itself.
- **Panels**: an item with `panel` gets one `role="tabpanel"` region,
  associated via `id`/`aria-controls`/`aria-labelledby`, rendered for the
  selected item only. If no item defines a `panel` (a pure link-tabs/
  external-page-switch usage), no tabpanel region is rendered at all — a
  consumer's router owns the destination content in that case.
- `scrollable?: boolean` (default `false`): switches the tablist from an
  evenly distributed fixed row to a horizontally scrolling one with the
  sourced `90px` minimum tab width (`ScrollableTabRowMinTabWidth`) and
  `52px` edge padding (`ScrollableTabRowEdgeStartPadding`); the newly
  selected tab scrolls into view, the same `scrollIntoView` technique
  `Select` already uses for its active option.
- Row height: `48px` (`SmallTabHeight`/`ContainerHeight`) when every item
  has only a label or only an icon; `72px` (`LargeTabHeight`, the value the
  source's own `TabBaselineLayout` actually uses — not the token file's
  unread `64px` `IconAndLabelTextContainerHeight`) when any item combines
  both, stacked icon-above-label (the source's separate side-by-side
  `LeadingIconTab` composable is excluded as a less-common alternate
  layout, the same "one clean composition over several alternate overload
  variants" precedent prior tasks already applied).
- A full-width divider renders under the tablist for both variants
  (`SecondaryNavigationTabTokens.DividerColor`/`DividerHeight` — the
  source's own default `divider` composable for *both* `PrimaryTabRow`/
  `SecondaryTabRow` is a generic, non-tab-specific `HorizontalDivider()`,
  but this project surfaces the actually-defined, traceable token value
  instead of an untraceable system-generic one).
- Disabled tabs dim to the universal `onSurface` 0.38-opacity treatment
  every other v1 interactive component already uses — the source has no
  disabled color axis at all for tabs (`enabled=false` only removes
  interactivity, not color), so this is a deliberate, documented web
  addition for visual disabled communication.

### Expected files

- `src/v1/components/Tabs/`, its public barrel, and sourced `tabs`
  component-token defaults.
- Tabs behavior, interaction, accessibility, theme, CSS, SSR, type-
  contract, and conformance evidence under `tests/v1/`.
- A mirrored playground example, playground usage, and packed Vite/Next
  fixture coverage.
- Tabs documentation, one ADR, architecture/provenance notes, and the
  component inventory status/exports.
- An explicit bundle-budget update only if justified by measured output.

### Acceptance checks

- `value`/`defaultValue`/`onValueChange` behave like every other v1
  controlled/uncontrolled pair. `role="tablist"` contains `role="tab"`
  children with correct `aria-selected`/`tabindex` roving focus;
  ArrowLeft/ArrowRight/Home/End move and select correctly, skipping
  disabled tabs; a disabled tab is inert to click.
- An `href` item renders `<a role="tab" href>`; a non-`href` item renders
  `<button role="tab">`; both participate identically in the same
  roving-tabindex/indicator/keyboard model.
- A `panel` item renders one `role="tabpanel"` correctly associated via
  `id`/`aria-controls`/`aria-labelledby` for the selected tab only; no
  tabpanel region exists when no item defines `panel`.
- The indicator slides and (in `'primary'`) resizes to the newly selected
  tab's position/content-width; it repositions correctly on container
  resize; it is immediate under reduced motion.
- `scrollable` keeps the selected tab in view on keyboard navigation and
  selection; the fixed (non-scrollable) row distributes tabs evenly.
- Row height responds correctly to icon/label combinations; forced colors
  keep the indicator and tab boundaries visibly distinct from the page;
  logical properties mirror correctly under RTL (indicator slides the
  correct direction).
- Rendering and hydration remain deterministic and inject no styles.
- Forced colors, RTL, reduced motion, default/custom/nested theme, CSS
  resolution, documentation, source provenance, the playground example,
  public exports, production fixtures, and inventory are covered and agree.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures,
  CSS checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
