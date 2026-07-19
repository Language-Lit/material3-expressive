# Active v1 task

## T14 — TextField and TextArea

Status: complete
Approved: 2026-07-20
Completed: 2026-07-20

### Scope

- Implement one shared, internal field-decoration primitive plus two public
  components built on it: `TextField` (native `input`) and `TextArea` (native
  `textarea`), forwarding their ref to that native control. The pinned source
  has no dedicated multiline composable — `TextField`/`OutlinedTextField`
  reuse one decoration layer regardless of line count — so the shared
  primitive is the direct web equivalent, not a bonus abstraction.
- Support `variant: 'filled' | 'outlined'` reproducing the two sourced
  defaults: filled uses an inside-the-container label and a bottom indicator
  line; outlined uses a bordered container whose top edge is notched around
  the label. The Expressive `roundedShape`/`tonalColors()` additions are
  excluded because the pinned source itself marks them provisional
  (`TODO(b/448727879)`, no shipped token yet).
- A required `label`, an optional `placeholder` shown only while focused, an
  optional `supportingText`, and a boolean `error` that recolors the
  indicator/outline, label, and supporting text and sets `aria-invalid` on
  the control, reproducing the pinned source's generic
  `defaultErrorSemantics` affordance.
- Optional `leadingIcon`/`trailingIcon` slots sized and positioned per the
  sourced icon tokens and touch-target padding rule.
- The label MUST float between its large resting position/type size and a
  small top-aligned position/type size driven by the control's own native
  `:focus` and `:placeholder-shown` pseudo-classes, not by React-rendered
  state, so a value change made outside a normal input event (autofill,
  `form.reset()`, an imperative ref write) still repositions the label
  correctly — the same native-truth precedent ADR 0012 established for
  Radio's checked state.
- Map the sourced label, indicator/outline, icon, and supporting-text color
  and width roles to stable `--m3e-comp-text-field-*` variables. Reproduce
  the confirmed dead `Hover*`-suffixed roles and the confirmed-unread filled
  disabled-container opacity by leaving both unregistered, matching the
  unread-role precedent from every prior selection control.
- Preserve a 56×280 CSS-pixel minimum field size (already well above the
  48×48 rule), visible focus conveyed by the indicator/outline itself (the
  pinned source defines no separate focus-ring token for either variant),
  forced-colors, logical RTL behavior, reduced-motion outcomes, deterministic
  SSR/hydration, and default/custom/nested theme token resolution.
- Native label association (`htmlFor`/`id`), `aria-describedby` to
  supporting text, and `aria-invalid` when `error` is set.
- Document the web adaptation from Compose's canvas-drawn cutout
  (`ClipOp.Difference` over a drawn border) to a native `fieldset`/`legend`
  notch, and from continuous spring-driven `TextStyle` interpolation to a
  token-driven CSS transition between the sourced body-large and body-small
  typescale roles.

Prefix/suffix slots, a character counter (the pinned source defines none),
non-default label positions (`Above`, deprecated `Attached`), Expressive
rounded/tonal variants, and auto-growing `TextArea` height are out of scope.

### Expected files

- `src/v1/internal/textField/`, `src/v1/components/TextField/`,
  `src/v1/components/TextArea/`, public component barrels, complete style
  assembly, and sourced text-field component-token defaults.
- TextField/TextArea behavior, interaction, accessibility, theme, CSS, SSR,
  type-contract, and conformance evidence under `tests/v1/`.
- Mirrored examples under `playground/v1/examples/`, playground usage, and
  packed Vite/Next fixture coverage.
- TextField and TextArea documentation, a cutout/label-motion/native-truth
  ADR, architecture/provenance notes, and the component inventory
  status/exports.
- An explicit bundle-budget update only if justified by measured output.

### Acceptance checks

- The rendered control is one native `input`/`textarea` that receives the
  forwarded ref, is associated with its label through `htmlFor`/`id`, is
  associated with its supporting text through `aria-describedby`, and
  participates in forms through `name`, `value`/`defaultValue`, `form`,
  `required`, `disabled`, and reset with no library-owned controlled state.
- The label is large and centered when the control is unfocused and empty,
  and small and top-aligned whenever the control is focused or has a value,
  driven by `:focus`/`:placeholder-shown` so the position tracks true DOM
  state after autofill, reset, or an imperative value write.
- The outlined variant's border shows a gap around the label exactly when
  the label is in its floating position, and no gap when the label is
  resting inside the container.
- `error` recolors the indicator/outline, label, and supporting text and
  sets `aria-invalid`; `disabled` suppresses interaction and applies the
  sourced disabled treatment; both are visually correct together.
- Supplied `leadingIcon`/`trailingIcon` render at the sourced size and
  touch-target padding, and adjust the control's content padding.
- The interactive field reserves at least 56×280 CSS pixels, and focus
  remains visible in forced colors.
- Label, indicator/outline width and color, and icon color transitions
  consume semantic motion tokens and become immediate under reduced motion.
- Rendering and hydration remain deterministic and inject no styles.
- Forced colors, RTL, reduced motion, default/custom/nested theme, CSS
  resolution, documentation, source provenance, examples, public exports,
  production fixtures, and inventory are covered and agree for both
  components.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures,
  CSS checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
