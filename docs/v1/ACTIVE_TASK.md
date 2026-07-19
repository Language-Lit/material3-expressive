# Active v1 task

## T09 — FloatingActionButton

Status: complete
Approved: 2026-07-19
Completed: 2026-07-19

### Scope

- Implement `FloatingActionButton` as a framework-neutral native HTML button,
  defaulting to `type="button"` while preserving form, focus, disabled, ref,
  event, ARIA, and data-attribute behavior.
- Support current Material standard, medium, and large FAB sizes and the
  corresponding size-aware extended layouts with sourced container, icon,
  typography, spacing, and shape values.
- Model extended content through an explicit icon plus label contract. Support
  an `expanded` visual state while keeping the native button's accessible name
  stable when its label is visually collapsed.
- Provide explicit momentary and toggle modes. Toggle mode supports controlled
  `selected`, uncontrolled `defaultSelected`, `onSelectedChange`, optional
  alternate selected icon content, and boolean `aria-pressed` semantics.
- Match the current Expressive toggle transition from each initial size, shape,
  primary-container color, and icon size to the sourced 56px round primary
  container with a 20px on-primary icon. Keep its initial footprint stable and
  use the first-party top-end alignment.
- Support default, lowered, and zero elevation behavior with sourced resting,
  hovered, focused, and pressed levels for ordinary and extended FABs. Preserve
  the fixed Level 3 elevation of the first-party toggle FAB.
- Reuse the existing controllable-state and cancelable consumer-first event
  primitives; `preventDefault()` cancels internal toggle mutation.
- Preserve at least a 48 by 48 CSS-pixel interaction target, visible focus,
  forced-colors, logical RTL alignment, and reduced-motion outcomes.
- Document the web adaptation from separate Compose FAB, extended FAB, and
  toggle FAB APIs to one discriminated React component.

Small 40px FABs, arbitrary container colors/shapes, link behavior, tooltip
ownership, loading, scroll-driven show/hide, long-press, FAB menu composition,
application positioning, framework adapters, private downstream application integration, and
legacy implementation changes are out of scope.

### Expected files

- `src/v1/components/FloatingActionButton/`, public component barrels,
  complete style assembly, and sourced FAB component-token defaults.
- FloatingActionButton behavior, interaction, accessibility, theme, CSS, SSR,
  and conformance evidence under `tests/v1/`.
- A mirrored example under `playground/v1/examples/`, playground usage, and
  packed Vite/Next fixture coverage.
- FloatingActionButton documentation, a public-API/elevation ADR,
  architecture/provenance notes, and the component inventory status/exports.
- An explicit bundle-budget update only if justified by measured output.

### Acceptance checks

- Standard, medium, and large map to sourced 56/80/96px containers,
  24/28/36px icons, and 16/20/28px corners through stable namespaced tokens and
  data attributes.
- Extended FABs map each size to the current sourced container height,
  typography, leading/trailing padding, and icon-label spacing; collapse keeps
  a stable accessible name and uses spatial/effects motion separately.
- Momentary buttons omit `aria-pressed`. Toggle buttons expose boolean
  `aria-pressed`, support controlled and uncontrolled selection, call
  `onSelectedChange` once per uncanceled activation, and preserve consumer
  `onClick` ordering and cancellation.
- Toggle selection animates to a 56px full-round primary container and 20px
  icon, retains the initial footprint and logical top-end alignment, and
  supports optional alternate selected artwork.
- The root is a native `button`, defaults to `type="button"`, forwards its ref,
  preserves native forms and Enter/Space activation, and never duplicates
  browser-owned keyboard behavior.
- Default elevation resolves to Level 3 at rest/focus/press and Level 4 on
  hover; lowered resolves to Level 1 at rest/focus/press and Level 2 on hover;
  zero elevation has no shadow; toggle elevation stays at Level 3.
- Disabled controls do not activate or mutate selection, lose elevation, and
  retain an explicit visible disabled treatment.
- Missing or invalid naming/mode combinations produce actionable development
  warnings without changing server markup; rendering and hydration remain
  deterministic and inject no styles.
- Focus, forced-colors, RTL, reduced-motion, default/custom/nested theme, CSS
  resolution, documentation, source provenance, examples, public exports,
  production fixtures, and inventory are covered and agree.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures, CSS
  checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
