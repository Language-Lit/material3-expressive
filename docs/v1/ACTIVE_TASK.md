# Active v1 task

## T13 — Switch

Status: complete
Approved: 2026-07-20
Completed: 2026-07-20

### Scope

- Implement one framework-neutral `Switch` built on a native
  `input type="checkbox" role="switch"` that forwards its ref to that input
  and preserves native form participation, label association, activation,
  and disabled behavior. `role` is fixed the same way `type` already is.
- Support controlled `checked` and uncontrolled `defaultChecked`, and an
  optional `thumbIcon` slot reproducing the pinned `thumbContent` parameter,
  including its `hasContent || checked` sizing rule.
- Map the sourced track, thumb, icon, state-layer, and disabled roles to
  stable `--m3e-comp-switch-*` variables, and derive every thumb inset with
  `calc()` on the same track/handle dimension tokens the source's own measure
  function uses, rather than precomputed pixel offsets.
- Reproduce the sourced pressed-shape motion (16/24/28px thumb sizes with
  edge-relative insets) and its own asymmetry: the size/inset transition
  snaps instantly entering a press and animates normally leaving one.
- Anchor the hover/focus/pressed state layer to the thumb's own current
  position, not a fixed track-centered point, matching the source attaching
  its ripple to the thumb element.
- Preserve a 48 by 48 CSS-pixel target, visible focus, forced-colors, logical
  RTL behavior, reduced-motion outcomes, deterministic SSR/hydration, and
  default/custom/nested theme token resolution.
- Warn in development when runtime callers combine `checked` with
  `defaultChecked` or supply a controlled value without any change handler.
- Document the web adaptation from Compose's `Switch`/`thumbContent` API to a
  native role-mapped input, and the label, error, and size behavior that is
  deliberately absent from the pinned first-party API.

Label and supporting-text slots, error state, size variants, framework
adapters, private downstream application integration, and legacy implementation changes are out
of scope.

### Expected files

- `src/v1/components/Switch/`, public component barrels, complete style
  assembly, and sourced Switch component-token defaults.
- Switch behavior, interaction, accessibility, theme, CSS, SSR, type-contract,
  and conformance evidence under `tests/v1/`.
- A mirrored example under `playground/v1/examples/`, playground usage, and
  packed Vite/Next fixture coverage.
- Switch documentation, a role-mapping/pressed-shape-motion ADR,
  architecture/provenance notes, and the component inventory status/exports.
- An explicit bundle-budget update only if justified by measured output.

### Acceptance checks

- The rendered control is one native `input type="checkbox" role="switch"`
  that receives the forwarded ref, cannot have `type` or `role` overridden by
  a caller, participates in forms through `name`, `value`, `form`,
  `required`, and reset, and is activated by the browser's own click and
  Space handling without synthesized key events, with no `aria-checked`
  needed for its accessible state.
- Controlled and uncontrolled checked state both work, consumer `onChange`
  and `onCheckedChange` compose without replacing either, and a cancelled
  event suppresses the library state change.
- A supplied `thumbIcon` renders inside the thumb and keeps the thumb at the
  selected handle size even while unchecked.
- Sourced track, thumb, icon, state-layer, and disabled roles resolve through
  stable `--m3e-comp-switch-*` variables and native `:checked`/`:disabled`/
  `:active` pseudo-classes, not React-rendered attributes, consistent with
  the live-accuracy requirement established for Radio.
- Disabled switches do not activate or mutate state, retain sourced disabled
  treatment, and leave sequential focus.
- The interactive target reserves at least 48 by 48 CSS pixels around the
  sourced track, and focus remains visible in forced colors.
- Thumb size/inset transitions consume semantic motion tokens while releasing
  a press and snap to zero duration while a press is active; color
  transitions consume semantic motion tokens. Both become immediate under
  reduced motion.
- Invalid prop combinations produce actionable development warnings without
  changing server markup; rendering and hydration remain deterministic and
  inject no styles.
- Forced colors, RTL, reduced motion, default/custom/nested theme, CSS
  resolution, documentation, source provenance, examples, public exports,
  production fixtures, and inventory are covered and agree.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures, CSS
  checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
