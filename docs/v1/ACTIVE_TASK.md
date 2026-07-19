# Active v1 task

## T08 — IconButton

Status: complete
Approved: 2026-07-19
Completed: 2026-07-19

### Scope

- Implement `IconButton` as a framework-neutral native HTML button for React
  consumers, defaulting to `type="button"` while preserving form, focus,
  disabled, ref, event, ARIA, and data-attribute behavior.
- Support the four Material icon-button variants: standard, filled, filled
  tonal, and outlined.
- Support the current Material 3 Expressive extra-small, small, medium, large,
  and extra-large size tiers and narrow, uniform, and wide container widths.
- Support round and square resting shapes, the sourced size-aware pressed
  shape, and the selected shape that intentionally inverts round/square
  geometry for toggle buttons.
- Provide explicit momentary and toggle modes. Toggle mode supports controlled
  `selected`, uncontrolled `defaultSelected`, `onSelectedChange`, a stable
  `aria-pressed` state, and optional alternate selected visual content.
- Compose consumer click behavior with internal toggle behavior, allowing
  `preventDefault()` to cancel the state change, through named internal event
  and controllable-state primitives suitable for later controls.
- Keep all icon content decorative because the native button owns its required
  accessible name through `aria-label` or `aria-labelledby`.
- Preserve a minimum 48 by 48 CSS-pixel interaction target independently of
  smaller Expressive visual sizes, with visible focus, forced-colors, RTL, and
  reduced-motion outcomes.
- Reuse the deterministic Expressive default-effects spring projection for
  pressed and selected shape/color transitions.
- Document the web adaptation from separate Compose action/toggle overloads to
  one discriminated React API with native toggle-button semantics.

Link behavior, tooltip ownership, menu behavior, long-press behavior, loading,
FAB behavior, button grouping, arbitrary custom shapes, framework adapters,
private downstream application integration, and legacy implementation changes are out of scope.

### Expected files

- `src/v1/components/IconButton/`, public component barrels, complete style
  assembly, and sourced IconButton component-token defaults.
- Focused shared primitives under `src/v1/internal/` for deterministic
  controlled/uncontrolled state and cancelable consumer/internal event
  composition.
- IconButton behavior, interaction, accessibility, theme, CSS, SSR, internal-
  primitive, and conformance evidence under `tests/v1/`.
- A mirrored example under `playground/v1/examples/`, playground usage, and
  packed Vite/Next fixture coverage.
- IconButton documentation, a public-API/state ADR, architecture/provenance
  notes, and the component inventory status/exports.
- An explicit bundle-budget update only if justified by measured output.

### Acceptance checks

- All four variants, five sizes, and three width options map to current sourced
  colors, dimensions, icon metrics, outlines, and shapes through stable
  namespaced variables and data attributes.
- Round and square buttons morph to the correct size-aware pressed shape;
  selected toggles use the corresponding selected round/square shape and the
  Expressive default-effects motion tokens.
- The root is a native `button`, defaults to `type="button"`, forwards its ref,
  preserves native form and consumer behavior, and does not add link, tooltip,
  menu, loading, or FAB semantics.
- Momentary buttons omit `aria-pressed`. Toggle buttons expose a boolean
  `aria-pressed`, support controlled and uncontrolled selection, call
  `onSelectedChange` once per uncanceled activation, and preserve consumer
  `onClick` ordering and cancellation.
- Native pointer, Enter, and Space activation stay browser-owned with no custom
  keyboard simulation or duplicate callbacks; disabled buttons neither
  activate nor mutate selection.
- Default and selected visual content render in stable decorative slots and do
  not compete with the required button accessible name.
- Every configuration provides at least a 48 by 48 CSS-pixel target, focus
  remains visible, and disabled, forced-colors, RTL, and reduced-motion outcomes
  are explicit.
- Missing or invalid naming/state combinations produce actionable development
  warnings without changing server markup; rendering and hydration remain
  deterministic and inject no styles.
- Default, custom, and nested theme scopes prove token consumption; production
  CSS resolves every referenced custom property.
- Documentation, current primary-source links, example, public exports,
  production stylesheet coverage, and inventory agree.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures, CSS
  checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
