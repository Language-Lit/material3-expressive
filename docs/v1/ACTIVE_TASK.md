# Active v1 task

## T12 — Radio

Status: complete
Approved: 2026-07-20
Completed: 2026-07-20

### Scope

- Implement one framework-neutral `Radio` built on a native
  `input type="radio"` that forwards its ref to that input and preserves
  native form participation, grouping by shared `name`, label association,
  activation, and disabled behavior. Native grouping supplies roving arrow-key
  focus and mutual exclusivity within a `name`; the component adds no
  orchestration of its own.
- Require `name` (unlike a plain native pass-through) because a nameless radio
  cannot participate in a group, and grouping is this task's required result.
- Support controlled `checked` and uncontrolled `defaultChecked`, naming the
  prop `checked`/`onCheckedChange` to match the native `HTMLInputElement`
  property and this library's existing `Checkbox` shape rather than Compose's
  `selected`/`onClick` parameter names.
- Map the sourced icon (ring and dot share one paint color in the pinned
  source), state-layer, and disabled roles to stable `--m3e-comp-radio-*`
  variables.
- Reproduce the sourced dot scale-in/out motion and the icon color transition
  using semantic motion tokens, including the source's own asymmetry: the dot
  scale animates unconditionally while the color transition snaps immediately
  whenever the control is disabled.
- Preserve a 48 by 48 CSS-pixel target, visible focus, forced-colors, logical
  RTL behavior, reduced-motion outcomes, deterministic SSR/hydration, and
  default/custom/nested theme token resolution.
- Warn in development when runtime callers combine `checked` with
  `defaultChecked` or supply a controlled value without any change handler.
- Document the web adaptation from Compose's `selected`/`onClick` RadioButton
  API to native grouped inputs, and the label, error, and size behavior that is
  deliberately absent from the pinned first-party API.

Label and supporting-text slots, error state, size variants, a standalone
`RadioGroup` wrapper (native grouping already satisfies this task's group
behavior requirement), framework adapters, private downstream application integration, and
legacy implementation changes are out of scope.

### Expected files

- `src/v1/components/Radio/`, public component barrels, complete style
  assembly, and sourced Radio component-token defaults.
- Radio behavior, interaction, accessibility, theme, CSS, SSR, type-contract,
  and conformance evidence under `tests/v1/`.
- A mirrored example under `playground/v1/examples/`, playground usage, and
  packed Vite/Next fixture coverage.
- Radio documentation, a native grouping/motion-asymmetry ADR,
  architecture/provenance notes, and the component inventory status/exports.
- An explicit bundle-budget update only if justified by measured output.

### Acceptance checks

- The rendered control is one native `input type="radio"` that receives the
  forwarded ref, requires `name`, participates in forms and native grouping
  through `name`, `value`, `form`, `required`, and reset, and is activated by
  the browser's own click, Space, and arrow-key roving without synthesized key
  events.
- Two or more `Radio`s sharing a `name` are mutually exclusive and roving-focus
  navigable using only native behavior.
- Controlled and uncontrolled checked state both work, consumer `onChange` and
  `onCheckedChange` compose without replacing either, and a cancelled event
  suppresses the library state change.
- Sourced icon, state-layer, and disabled roles resolve through stable
  `--m3e-comp-radio-*` variables and `data-m3e-*` attributes.
- Disabled radios do not activate or mutate state, retain sourced disabled
  treatment, and leave sequential focus.
- The interactive target reserves at least 48 by 48 CSS pixels around the
  sourced container size, and focus remains visible in forced colors.
- The dot scale transition consumes semantic motion tokens and runs regardless
  of disabled state; the icon color transition consumes semantic motion tokens
  while enabled and is immediate while disabled, matching the sourced
  animation guard. Both become immediate under reduced motion.
- Invalid prop combinations produce actionable development warnings without
  changing server markup; rendering and hydration remain deterministic and
  inject no styles.
- Forced colors, RTL, reduced motion, default/custom/nested theme, CSS
  resolution, documentation, source provenance, examples, public exports,
  production fixtures, and inventory are covered and agree.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures, CSS
  checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
