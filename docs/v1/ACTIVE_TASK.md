# Active v1 task

## T11 — Checkbox

Status: complete
Approved: 2026-07-19
Completed: 2026-07-19

### Scope

- Implement one framework-neutral `Checkbox` built on a native
  `input type="checkbox"` that forwards its ref to that input and preserves
  native form participation, label association, activation, and disabled
  behavior.
- Support controlled `checked`, uncontrolled `defaultChecked`, and a
  `indeterminate` visual/assistive state that mirrors first-party
  `ToggleableState` without owning a cycling policy the pinned API does not own.
- Map the sourced checkbox container, outline, checkmark, state-layer, shape,
  and disabled roles to stable `--m3e-comp-checkbox-*` variables, including the
  first-party asymmetry of one disabled checkmark role against three disabled
  box and outline roles.
- Reproduce the sourced check-draw reveal, the checkmark-to-indeterminate
  gravitation, and the delayed snap when leaving the checked state using
  semantic motion tokens.
- Preserve a 48 by 48 CSS-pixel target, visible focus, forced-colors, logical
  RTL behavior, reduced-motion outcomes, deterministic SSR/hydration, and
  default/custom/nested theme token resolution.
- Warn in development when runtime callers combine `checked` with
  `defaultChecked` or supply a controlled value without any change handler.
  Naming is not warned about because a wrapping `label` is a valid, undetectable
  source of the accessible name.
- Document the web adaptation from Compose's `Checkbox`/`TriStateCheckbox`
  overloads to one React input, and the label, error, and size behavior that is
  deliberately absent from the pinned first-party API.

Label and supporting-text slots, error state, size variants, shape morphing,
custom stroke overloads, parent/child group orchestration, framework adapters,
private downstream application integration, and legacy implementation changes are out of scope.

### Expected files

- `src/v1/components/Checkbox/`, public component barrels, complete style
  assembly, and sourced Checkbox component-token defaults.
- Checkbox behavior, interaction, accessibility, theme, CSS, SSR,
  type-contract, and conformance evidence under `tests/v1/`.
- A mirrored example under `playground/v1/examples/`, playground usage, and
  packed Vite/Next fixture coverage.
- Checkbox documentation, a native tri-state semantics ADR,
  architecture/provenance notes, and the component inventory status/exports.
- An explicit bundle-budget update only if justified by measured output.

### Acceptance checks

- The rendered control is one native `input type="checkbox"` that receives the
  forwarded ref, participates in forms through `name`, `value`, `form`,
  `required`, and reset, and is activated by the browser's own click and Space
  handling without synthesized key events.
- Controlled and uncontrolled checked state both work, consumer `onChange` and
  `onCheckedChange` compose without replacing either, and a cancelled event
  suppresses the library state change.
- `indeterminate` renders `aria-checked="mixed"` and a deterministic state
  attribute in server markup, sets the native `indeterminate` DOM property after
  hydration, and resolves to the browser-owned checked value on user activation.
- Sourced container, outline, checkmark, state-layer, shape, and disabled roles
  resolve through stable `--m3e-comp-checkbox-*` variables and `data-m3e-*`
  attributes, including all thirteen first-party color roles.
- Disabled checkboxes do not activate or mutate state, retain sourced disabled
  container/outline/checkmark treatment, and leave sequential focus.
- The interactive target reserves at least 48 by 48 CSS pixels around the
  sourced container size, and focus remains visible in forced colors.
- Check-draw, indeterminate gravitation, and the delayed leave-to-unchecked snap
  consume semantic motion tokens and become immediate under reduced motion.
- Invalid prop combinations produce actionable development warnings without
  changing server markup; rendering and hydration remain deterministic and
  inject no styles.
- Forced colors, RTL, reduced motion, default/custom/nested theme, CSS
  resolution, documentation, source provenance, examples, public exports,
  production fixtures, and inventory are covered and agree.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures, CSS
  checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
