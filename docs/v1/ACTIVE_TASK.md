# Active v1 task

## T23 — Button groups and split button

Status: complete
Approved: 2026-07-20
Completed: 2026-07-20

### Scope

Two components sourced from the pinned AndroidX revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`: `ButtonGroup` and
`SplitButton`, matching `docs/V1_SPEC.md` §9's "Actions and containment"
list and the matching `docs/v1/component-inventory.json` placeholder rows.

- **`ButtonGroup` is a layout wrapper around consumer-provided children**
  (typically `Button`/`IconButton`), not a data-driven scope-DSL like the
  source's `ButtonGroupScope.clickableItem`/`toggleableItem`/`customItem`
  builder. A Kotlin `Modifier`-scoped DSL has no React equivalent; a plain
  `children` prop is the idiomatic translation, matching how every other
  v1 layout composite (e.g. `NavigationBar`) takes React children rather
  than a callback-based item list.
- **Scope cut: no automatic overflow-into-a-dropdown-menu.** The source's
  overflow behavior requires either a `ResizeObserver`-driven client-only
  measurement effect or reimplementing its custom intrinsic-width
  `MeasurePolicy` in JS. Given the scope of this task also covers
  `SplitButton`, and T24 immediately follows, this is an explicit,
  documented cut — consumers needing overflow can use `flex-wrap` or their
  own responsive logic. See ADR 0023.
- **Scope cut: no "connected" button-group shape variant** (the source's
  asymmetric pill-leading/small-radius-middle/pill-trailing row with a
  checked-state circle morph). This would require either deep coupling
  into arbitrary children's internal shape CSS or reimplementing
  Button-like rendering inside `ButtonGroup` itself. `SegmentedButtonGroup`
  (T15) already serves the single/multi-select connected-row use case this
  variant targets. `ButtonGroup` here covers only the source's *standard*
  (non-connected) treatment.
- **The "expressive interaction" that remains in scope — and is the part
  of this task's own description that most needs to survive — is
  press-triggered neighbor compression**: pressing one child visually
  grows it and shrinks its immediate siblings. The source achieves this
  with a custom `MeasurePolicy` reading `Animatable` press state per
  child. This project reproduces the same visual effect with a pure CSS
  `:has()` selector chain reading each child's own native `:active` state
  and a `transform: scale()` grow/shrink pair — no JS layout measurement,
  no `requestAnimationFrame`, and no coupling to whichever component the
  consumer places inside `ButtonGroup`. See ADR 0023 for the exact
  selectors and why `:has()` is safe at this project's Firefox 121 floor.
- **`SplitButton` renders its own two `<button>` elements directly**
  (leading action button + trailing icon-only toggle button), not by
  nesting the public `Button`/`IconButton` components — the same
  "composite components own their internal buttons" precedent
  `SegmentedButtonGroup` (T15) already established, avoiding CSS
  specificity/import-order coupling to another component's internal
  custom-property names.
- `SplitButton` supports the full five-size scale (`extra-small`, `small`,
  `medium`, `large`, `extra-large`) matching `Button`/`IconButton`'s own
  established size system from T07/T08 — every other action component in
  this project commits to that scale, and `SplitButtonXSmallTokens`
  through `SplitButtonXLargeTokens` confirm the source itself defines all
  five for this component (unlike `ButtonGroup`, which the source only
  ever defines a `Small` token set for).
- `SplitButton`'s trailing button is a toggle (`selected`/`onSelectedChange`,
  matching `IconButton`'s own toggle contract from T08) representing
  "the attached menu is open," morphing to a full circle when selected —
  wiring it to an actual menu is left to the consumer (e.g. this project's
  own `Menu`, T17), the same "expose the toggle state, don't own the
  overlay" scoping `IconButton` itself already uses.
- Neither component exposes per-instance `color`/`shape` JS props beyond
  what's listed above — geometry and color come from CSS custom
  properties like every other v1 component.

### Expected files

- `src/v1/components/ButtonGroup/`, `SplitButton/`, their public barrels,
  and sourced component-token defaults for both.
- Behavior, interaction, accessibility, theme, CSS, SSR, type-contract, and
  conformance evidence under `tests/v1/` for both.
- Mirrored playground examples, playground usage, and packed Vite/Next
  fixture coverage.
- Documentation for both, one ADR, `component-inventory.json` updates
  (filling in the two existing `"planned"` placeholder rows), and
  `TOKEN_PROVENANCE.md` entries.
- An explicit bundle-budget update only if justified by measured output.

### Acceptance checks

- `ButtonGroup`: renders children in a horizontal flex row with the
  sourced `BetweenSpace` gap; pressing one child visibly grows it and
  compresses its immediate siblings, settling back on release; unaffected
  children (more than one away from the pressed one) do not move.
- `SplitButton`: leading and trailing buttons render as one visually
  connected pill with a small shared inner-corner radius that visibly
  expands on hover/press (matching the sourced per-size corner tokens);
  the trailing button's shape becomes a full circle when `selected`.
  All five sizes render with visibly distinct heights/padding/icon sizes
  matching their sourced tokens.
- Forced colors keep every part visibly distinct. All motion (shape
  morphs, neighbor compression) becomes immediate under reduced motion.
- Rendering and hydration remain deterministic and inject no styles; both
  components are pure functions of props (no client-only measurement
  effect), so SSR/pre-hydration markup matches the first client frame
  exactly with zero delta.
- Forced colors, RTL, reduced motion, default/custom/nested theme, CSS
  resolution, documentation, source provenance, playground examples,
  public exports, production fixtures, and inventory are covered and agree
  for both components.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures,
  CSS checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
