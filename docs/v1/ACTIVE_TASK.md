# Active v1 task

## T24 — Floating toolbar and FAB menu

Status: complete
Approved: 2026-07-20
Completed: 2026-07-20

### Scope

Two components sourced from the pinned AndroidX revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`: `FloatingToolbar` (source:
`HorizontalFloatingToolbar`/`VerticalFloatingToolbar`) and `FabMenu`
(source: `FloatingActionButtonMenu`/`ToggleFloatingActionButton`/
`FloatingActionButtonMenuItem`), matching `docs/V1_SPEC.md` §9's
"Navigation and expressive layout" list and the matching
`docs/v1/component-inventory.json` placeholder rows.

- **`FloatingToolbar` is one component with an `orientation` prop**
  (`'horizontal' | 'vertical'`, default `'horizontal'`), not two separate
  exports — the inventory placeholder names only `FloatingToolbar`/
  `FloatingToolbarProps`, and the source's own `Horizontal`/`Vertical`
  composables are otherwise near-identical (same defaults object, same
  colors, same shape), differing only in main-axis direction.
- **Scope cut: no integrated FAB slot.** The source's
  `HorizontalFloatingToolbar(expanded, floatingActionButton, ...)`
  overload co-locates a FAB that itself resizes/re-elevates as the
  toolbar expands and collapses — a second, materially different layout
  and animation contract layered on top of the plain toolbar. This task
  also covers `FabMenu`, which already delivers this session's FAB-morph
  work; a second, toolbar-flavored FAB integration is out of scope. The
  plain content-only treatment is what's built here.
- **Scope cut: no scroll-behavior integration
  (`FloatingToolbarScrollBehavior`/`NestedScrollConnection`).** This is a
  Compose-specific scroll-coordination API with no direct web analog
  short of a real `onScroll` listener plus fling/snap physics — a
  substantial undertaking on its own. `expanded`/`defaultExpanded`/
  `onExpandedChange` are exposed directly instead; a consumer wanting
  scroll-driven behavior wires their own scroll listener to them.
- **Scope cut: no touch-exploration force-expand.** The source keeps the
  toolbar permanently expanded when Android's touch exploration service
  (e.g. TalkBack) is active — an Android-platform API with no web
  equivalent (a screen reader's presence isn't observable from web
  content). Not applicable here, not merely cut.
- **Roving focus**, explicitly named in this task's own table
  description, *is* in scope: arrow keys (`ArrowLeft`/`ArrowRight` for
  horizontal, `ArrowUp`/`ArrowDown` for vertical) move focus among direct
  children, `Home`/`End` jump to the first/last, matching the WAI-ARIA
  APG toolbar pattern. Only one child is in the tab sequence at a time
  (`tabindex="0"` on the current item, `-1` on the rest); arrow keys move
  both focus and that roving `tabindex`.
- **`FabMenu` renders its own trigger FAB directly** rather than
  requiring a separately-composed `ToggleFloatingActionButton` (the
  source's own composable is designed to be used standalone too, but
  every real usage pairs it with exactly one `FloatingActionButtonMenu`)
  — the inventory placeholder names only `FabMenu`/`FabMenuProps`, no
  second public toggle-FAB export. `icon`/`closeIcon` are both required
  props rather than a single icon the consumer must cross-fade
  themselves.
- **The trigger FAB's size does not change between collapsed and
  expanded** — reading the actual sourced token values
  (`FabBaselineTokens.ContainerHeight` and
  `FabMenuBaselineTokens.CloseButtonContainerHeight` are both `56dp`),
  only its shape (`CornerLarge` rounded-square → `CornerFull` circle),
  color (`primaryContainer`/`onPrimaryContainer` →
  `primary`/`onPrimary`), and icon size (`24dp` → `20dp`) actually morph.
  This is a straightforward CSS state transition, not the width/height
  interpolation the source's generic `containerSize: (Float) -> Dp`
  callback API suggests it might need to be.
- No per-instance `color`/`shape` JS props beyond what's listed above —
  colors and geometry come from CSS custom properties like every other
  v1 component.

### Expected files

- `src/v1/components/FloatingToolbar/`, `FabMenu/`, their public
  barrels, and sourced component-token defaults for both.
- Behavior, interaction, accessibility, theme, CSS, SSR, type-contract,
  and conformance evidence under `tests/v1/` for both.
- Mirrored playground examples, playground usage, and packed Vite/Next
  fixture coverage.
- Documentation for both, one ADR, `component-inventory.json` updates
  (filling in the two existing `"planned"` placeholder rows), and
  `TOKEN_PROVENANCE.md` entries.
- An explicit bundle-budget update only if justified by measured output.

### Acceptance checks

- `FloatingToolbar`: renders a floating pill container (`role="toolbar"`,
  `aria-orientation`) around arbitrary children; arrow keys move both
  focus and the roving `tabindex` among children, `Home`/`End` jump to
  the ends. `expanded={false}` visibly collapses the container.
- `FabMenu`: the trigger FAB toggles `aria-expanded`, morphing shape/
  color/icon-size on toggle with no width/height change; its menu items
  reveal with a staggered, closest-item-first animation and are hidden
  (not just visually collapsed) from both the DOM and keyboard/AT
  navigation while collapsed.
- Forced colors keep every part visibly distinct. All motion (roving
  focus has none of its own, expand/collapse, stagger reveal, FAB morph)
  becomes immediate under reduced motion.
- Rendering and hydration remain deterministic and inject no styles;
  both components are pure functions of props (no client-only
  measurement effect), so SSR/pre-hydration markup matches the first
  client frame exactly with zero delta.
- Forced colors, RTL, reduced motion, default/custom/nested theme, CSS
  resolution, documentation, source provenance, playground examples,
  public exports, production fixtures, and inventory are covered and
  agree for both components.
- Existing typecheck, tests, legacy contracts, packed Vite/Next
  fixtures, CSS checks, architecture checks, and bundle budgets remain
  green through `npm run verify:v1`.
