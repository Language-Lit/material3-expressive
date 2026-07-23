# ADR 0031: Native-range Slider family with a pinned source ledger

Status: accepted
Date: 2026-07-23
Task: T39

## Context

AndroidX Material 3 `Slider.kt` at revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc` contains three current
single-slider overloads, current and legacy vertical paths, three current
range-slider overloads, eleven current `SliderDefaults` overloads/values,
three current state/value classes, two remember helpers, and five deprecated
compatibility entries. Its generated `SliderTokens.kt` declares 51 names, but
the implementation literally reads only 15.

A surface-level port loses behavior that lives below the composables:

- continuous keyboard adjustment is one percent while discrete adjustment is
  one tick;
- horizontal Left/Right reverses in RTL but Page Up/Down deliberately does
  not;
- vertical minimum is at the top unless `topToBottom` is false;
- range pointer selection uses nearest-thumb distance and an asymmetric
  overlap tie-break;
- pointer taps commit on release, drags wait for axis slop, and orthogonal
  touch motion cancels into scrolling;
- focus padding expands the adjacent track gap while measure code subtracts
  that padding so thumb and track positions do not move;
- discrete interior positions are projected between the external corner
  centers, unlike continuous positions and endpoints;
- normal, centered, and range tracks have different active segments, endpoint
  stops, gaps, and tick exclusions;
- `ThumbContent` reacts to focus, press, and drag but ignores the hover
  interaction emitted by its own `hoverable` modifier;
- the default palette crosses active/inactive track roles for enabled and
  disabled tick colors;
- disabled handle color is precomposited over `surface`, while disabled track
  and tick colors retain alpha;
- range custom-corner placement publishes a half-track-height alignment line
  even when drawing a different custom corner size;
- `RangeSliderState.gestureEndAction` ignores its Boolean argument;
- two KDocs name the wrong source type, and an upstream range-thumb
  recomposition regression remains ignored as `b/447508701`.

T39 requires every public/deprecated entry, observable internal path, generated
role, upstream behavior test, screenshot test, and discovered anomaly to be
classified.

## Decision

1. **Export `Slider` and `RangeSlider` as one family.** `Slider` uses an
   `orientation` option for the source's horizontal and vertical composables;
   `topToBottom` replaces legacy `reverseDirection`. `RangeSlider` remains a
   separate export because it owns two semantic thumbs. The package export map
   does not change.

2. **Keep one native range input per semantic thumb.** Inputs own accessible
   slider role/value state, naming, focus, disabled state, forms, reset, and
   refs. They are transparent full-target siblings of an `aria-hidden`
   Material rendering tree. The rendering tree owns no semantics.

3. **Resolve pointer gestures on the visual root.** A native single range
   cannot render the sourced geometry consistently, and HTML has no native
   two-thumb range. Root pointer capture therefore translates the pinned tap,
   slop, same-axis drag, orthogonal cancellation, RTL, vertical direction,
   nearest-thumb, overlap-tie, and non-crossing rules. The semantic inputs
   remain keyboard- and assistive-technology-operable.

4. **Override native keyboard deltas with the pinned rules.** Home/End,
   continuous one-percent steps, discrete steps, capped Page jumps, RTL arrow
   reversal, Page-key asymmetry, and vertical direction are shared in one
   explicit helper. Finish notification occurs on handled key release, as in
   the source.

5. **Support controlled and uncontrolled React state.** Values are finite,
   clamped, and snapped through a shared path. An exact pointer/value midpoint
   selects the lower tick because `snapValueToTick` uses first-minimum
   selection. Native accessibility changes preserve the separate source
   semantics loop, whose `<=` tie retains the upper tick. Range values are
   sorted initially and never cross. Native form reset resynchronizes
   uncontrolled visual state.

6. **Translate track drawing into authored DOM/CSS.** Stable segments use
   logical insets and asymmetric logical radii. Horizontal RTL mirrors without
   duplicating DOM. Vertical reversal maps complete segments, including their
   active identity and gap side. Directional masks remove ticks and stops from
   physical thumb/center gaps after layout. Ticks, stops, custom passive
   artwork, focus gaps, and discrete corner-inset expressions share the same
   value fractions as handles. Real-browser auditing—not jsdom—verifies
   physical 48px targets and sourced geometry.

7. **Keep visual customization passive.** Thumb, track-art, tick, and stop
   slots render only below `aria-hidden`. They may replace artwork or render
   nothing but cannot replace a native thumb, change value semantics, or add a
   nested interaction.

8. **Register only observed generated roles.** The 15 literal
   `SliderTokens.*` reads become provider-level component tokens. The 36 unread
   declarations stay in the executable ledger. Direct source geometry
   (2px inside corners, focus padding, target size) and web focus-ring values
   are separately identified. Arbitrary Compose `SliderColors` instances are
   replaced by scoped component-token overrides.

9. **Name platform adaptations and exclusions.** Compose `Modifier`,
   `MutableInteractionSource`, `DraggableState`, `Saver`, `Canvas`,
   `DrawScope`, alignment lines, semantics DSL, and state objects are not React
   APIs. Their observable results are implemented above. Deprecated overloads
   add no unique result and are excluded. Android screenshot goldens are not
   redistributed; equivalent states are covered by CSS/token assertions,
   examples, and the browser rendering audit.

10. **Freeze every audit input in tests.** `Slider.source.test.ts` records the
    four upstream blob identities, 25 current public entries, five deprecated
    entries, 25 observable internal paths, 13 anomalies, all 51 generated
    declarations, all 55 behavior tests, and all 50 screenshot tests.

11. **Rebase bundle budgets on the complete T39 surface.** The pre-task
    reference is Chip-complete commit
    `a4c1a4b1db8f358aef056366d5f89d9ac2073b16`. T39 measures a 352,500-byte
    imported JavaScript closure (61,654 gzip), 81,461-byte declaration closure
    (18,976 gzip), 414,869-byte full stylesheet (45,036 gzip), 124,371-byte
    token stylesheet (10,891 gzip), and 352,618-byte packed package. The
    previous T27 ceilings are exceeded by the new two-control gesture/state
    implementation, source-ledger surface, and complete authored track
    renderer—not by a dependency (the runtime dependency count remains zero).
    Following the T13/T15/T17/T19/T21 proportional-raise precedent, every
    baseline is remeasured and every ceiling is restored to approximately 12%
    above measured T39 output, rather than loosening only the four breached
    figures.

## Consequences

- Consumers get native names, form values, independent range-thumb focus, and
  refs without accepting browser-specific native range appearance.
- Pointer and keyboard behavior intentionally follows the pinned Android
  implementation where it differs from a browser's default range increments.
- `RangeSlider` requires two localized labels. Its root may be named as a
  group, while each input exposes dynamic min/max bounds constrained by the
  other thumb.
- Focus/press/drag halve only the default authored handle. Hover retains 4px,
  preserving the source collector rather than the unread generated
  `HoverHandleWidth` name.
- Bundle reports now measure the complete 34-component package against T39
  baselines; the proportional headroom remains visible and future growth still
  fails the same aggregate imported-closure and packed-package gates.
- A future upstream update fails the frozen ledger when a role, overload, test,
  screenshot case, or known behavior changes and must be reclassified before
  implementation can drift.
