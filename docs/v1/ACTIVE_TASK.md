# Active v1 task

## T15 — SegmentedButtonGroup

Status: complete
Approved: 2026-07-20
Completed: 2026-07-20

### Scope

- Implement one public, data-driven `SegmentedButtonGroup` component: a
  `segments: readonly { value, label, icon?, disabled? }[]` prop, not a
  compound-children API. The pinned source's row composables
  (`SingleChoiceSegmentedButtonRow`/`MultiChoiceSegmentedButtonRow`) exist
  only to compute per-item shape and semantics from index/count/selection —
  an array prop computes the same index/count trivially with no
  `Children.map`/context machinery, and matches the single export already
  named in the component inventory.
- Support `multiple` (default `false`, single-choice) vs `multiple: true`
  (multi-choice), reproducing the pinned source's two row variants. Each
  rendered segment is one native form control, not a custom ARIA widget:
  single-choice renders one `<input type="radio">` per segment sharing a
  common `name` (auto-generated via `useId` when not supplied), giving
  native radiogroup roving-tabindex and mutual-exclusivity for free, exactly
  matching the pinned source's own `Role.RadioButton` choice for this mode.
  Multi-choice renders independent `<input type="checkbox">` controls
  sharing one `name` so `FormData.getAll(name)` yields every checked value
  natively. `value`/`defaultValue`/`onValueChange` are `string` in
  single-choice mode and `readonly string[]` in multi-choice mode,
  discriminated by the `multiple` literal so the two shapes cannot be
  mixed at the type level.
- Reproduce the sourced per-item shape rule with logical corner-radius
  properties driven by a computed `data-m3e-position` (`start`/`middle`/
  `end`/`only`): the first segment rounds its inline-start corners, the
  last rounds its inline-end corners, interior segments stay square, and a
  lone segment is fully rounded — the web equivalent of
  `SegmentedButtonDefaults.itemShape`'s `baseShape.start()`/`.end()`/
  `RectangleShape`/`baseShape` branches.
- Reproduce the sourced border-overlap and stacking rule: adjacent segments
  overlap by exactly one border width via a negative logical margin so
  shared edges coincide instead of doubling, and a segment's stacking order
  rises while checked and rises further while also hovered, pressed, or
  keyboard-focused — the ordinal flattening of
  `interactionCount + (checked ? CheckedZIndexFactor : 0)` into a small
  fixed z-index scale, preserving the same relative ranking (checked always
  outranks a merely-interacting neighbor) without literally counting
  interactions.
- An optional per-segment `icon` slot that shows only while its segment is
  unselected, crossfading with the selected checkmark
  (`MotionSchemeKeyTokens.DefaultEffects`, symmetric) when supplied. When no
  `icon` is supplied, only the checkmark ever renders, revealed with a
  fade+scale entrance from its inline-start/block-end origin
  (`DefaultEffects` opacity, `FastSpatial` scale) and removed instantly on
  deselect with no exit transition, matching the pinned source's
  `AnimatedVisibility(exit = ExitTransition.None)` asymmetry exactly. The
  checkmark reproduces `androidx.compose.material3.internal.Icons.Filled.Check`
  as a static inline SVG path (not the Checkbox stroke-draw technique — this
  source paints a solid filled glyph, not a Canvas polyline). The sourced
  `Animatable<Int>`-driven horizontal content recentering when the icon
  column's width changes is reproduced as a CSS width/margin transition on
  the icon column inside a centered flex row, not a literal ported measure
  policy, consistent with every prior spring-to-CSS-transition flattening
  in this library.
- Map the sourced container, content, and border color roles to stable
  `--m3e-comp-segmented-button-group-*` variables, consolidating any role
  the source reads from one identical upstream constant for both
  active/inactive or both disabled call sites into a single token (matching
  the T14 content-color consolidation precedent), and leaving every
  `Hover*`/`Focus*`/`Pressed*`-suffixed role and the base `SelectedIconColor`/
  `UnselectedIconColor`/`DisabledIconColor`/`DisabledIconOpacity` roles
  unregistered, since `defaultSegmentedButtonColors` never reads them (icon
  color always inherits the label content-color role it resolves instead).
  Disabled container color needs no dedicated token at all: the source
  reuses the same enabled container value undimmed in the disabled+selected
  case and the same transparent literal in the disabled+unselected case.
- No `minimumInteractiveComponentSize`-equivalent inflation: the pinned
  source applies no such modifier to `SegmentedButton`, so the rendered
  control stays at its sourced 40px height with no 48px touch-target
  wrapper, unlike Checkbox/Radio/Switch's smaller sourced visuals.
- Preserve visible focus (no dedicated focus-ring token exists for this
  component, so the established `sys.color.secondary` fallback applies,
  matching Checkbox/Radio/Switch precedent), forced-colors, logical RTL
  behavior (including automatic start/end mirroring through logical corner
  properties), reduced-motion outcomes, deterministic SSR/hydration, and
  default/custom/nested theme token resolution.
- Native group semantics: `role="radiogroup"` for single-choice and
  `role="group"` for multi-choice on the container, an accessible group name
  via passthrough `aria-label`/`aria-labelledby`, and a native `<label>`
  wrapping each control so its visible text is the accessible name with no
  extra `id` plumbing.
- Document the web adaptation from the sourced two-composable row API
  (`SingleChoiceSegmentedButtonRow`/`MultiChoiceSegmentedButtonRow` plus a
  child-scope `SegmentedButton`) to one data-driven component, the
  `:has()`-based checked/focus container and stacking rules, and the
  crossfade/reveal flattening, in a new ADR.

Prefix-only icon layouts, a segment count/overflow policy, and the
Expressive `roundedShape`/tonal-color provisional additions (unshipped in
the pinned source, same exclusion basis as T14) are out of scope.

### Expected files

- `src/v1/components/SegmentedButtonGroup/`, its public barrel, and sourced
  `segmented-button-group` component-token defaults.
- SegmentedButtonGroup behavior, interaction, accessibility, theme, CSS,
  SSR, type-contract, and conformance evidence under `tests/v1/`.
- A mirrored example under `playground/v1/examples/`, playground usage, and
  packed Vite/Next fixture coverage.
- SegmentedButtonGroup documentation, a shape/stacking/crossfade ADR,
  architecture/provenance notes, and the component inventory status/exports.
- An explicit bundle-budget update only if justified by measured output.

### Acceptance checks

- Single-choice mode renders one native `role="radio"`-equivalent
  `<input type="radio">` per segment sharing one `name`, with native
  mutual exclusivity, roving tabindex, and arrow-key behavior with no
  custom keyboard handling. Multi-choice mode renders independent
  `<input type="checkbox">` controls that can be selected in any
  combination.
- The group participates in forms: single-choice submits one value under
  its shared `name`; multi-choice's checked values are all retrievable via
  `FormData.getAll(name)`; a form reset restores the default selection with
  no library-owned controlled state involved in that restoration.
- The first and last segments are rounded only on their outer (inline-start/
  inline-end) corners, interior segments are square, and a single segment
  is fully rounded; adjacent borders overlap by exactly one border width
  with no doubled seam; a checked segment's border stays visually on top of
  an unchecked neighbor's, and an interacting segment's border stays on top
  of a merely-checked one.
- A segment without a supplied `icon` shows only a checkmark that fades and
  scales in on selection and disappears instantly on deselection; a segment
  with a supplied `icon` shows that icon while unselected and crossfades to
  the checkmark while selected, in both directions.
- `disabled` (group-level or per-segment) suppresses interaction and dims
  content/border while leaving the selected container's own color
  unchanged, matching the pinned source; error states are not part of this
  component's contract.
- Focus remains visible in forced colors; logical corner/margin properties
  mirror correctly under RTL.
- Content, border, and icon-crossfade transitions consume semantic motion
  tokens and become immediate under reduced motion.
- Rendering and hydration remain deterministic and inject no styles.
- Forced colors, RTL, reduced motion, default/custom/nested theme, CSS
  resolution, documentation, source provenance, the example, public
  exports, production fixtures, and inventory are covered and agree.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures,
  CSS checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
