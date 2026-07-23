# Chip conformance

Task: T38
Status: conformant
Reviewed: 2026-07-23

## Primary references

- Material 3 chips overview, accessed 2026-07-23:
  <https://m3.material.io/components/chips/overview>
- Pinned AndroidX `Chip.kt`, accessed 2026-07-23:
  <https://android.googlesource.com/platform/frameworks/support/+/225f50d42bf0adeb2abf4b6109befb5ab6ce4efc/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Chip.kt>
- Pinned generated `AssistChipTokens.kt`, `FilterChipTokens.kt`,
  `InputChipTokens.kt`, `SuggestionChipTokens.kt`, and Expressive
  `ChipsTokens.kt`, accessed 2026-07-23:
  <https://android.googlesource.com/platform/frameworks/support/+/225f50d42bf0adeb2abf4b6109befb5ab6ce4efc/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/>
- Pinned AndroidX `ChipTest.kt`, accessed 2026-07-23:
  <https://android.googlesource.com/platform/frameworks/support/+/225f50d42bf0adeb2abf4b6109befb5ab6ce4efc/compose/material3/material3/src/androidInstrumentedTest/kotlin/androidx/compose/material3/ChipTest.kt>
- Pinned AndroidX `ChipScreenshotTest.kt`, accessed 2026-07-23:
  <https://android.googlesource.com/platform/frameworks/support/+/225f50d42bf0adeb2abf4b6109befb5ab6ce4efc/compose/material3/material3/src/androidInstrumentedTest/kotlin/androidx/compose/material3/ChipScreenshotTest.kt>
- WAI-ARIA button pattern, accessed 2026-07-23:
  <https://www.w3.org/WAI/ARIA/apg/patterns/button/>
- WCAG 2.2 focus visible, target size, reflow, and reduced-motion criteria,
  accessed 2026-07-23: <https://www.w3.org/TR/WCAG22/>

Supported baseline: AndroidX Material 3 revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`. The four legacy generated token
files identify `VERSION: 7_0_1`; Expressive `ChipsTokens.kt` identifies
`VERSION: 37.2.1`.

## Public-source surface ledger

Every non-deprecated public composable is covered:

| AndroidX entry | React translation | Status |
| --- | --- | --- |
| `AssistChip` | `<Chip kind="assist" variant="flat">` | Implemented |
| `ElevatedAssistChip` | `<Chip kind="assist" variant="elevated">` | Implemented |
| `FilterChip(shape)` | `<Chip kind="filter" shape="standard">` | Implemented |
| `FilterChip(shapes)` | `<Chip kind="filter" shape="expressive">` | Implemented |
| `ElevatedFilterChip(shape)` | `<Chip kind="filter" variant="elevated" shape="standard">` | Implemented |
| `ElevatedFilterChip(shapes)` | `<Chip kind="filter" variant="elevated" shape="expressive">` | Implemented |
| `InputChip(shape)` | `<Chip kind="input" shape="standard">` | Implemented |
| `InputChip(shapes)` | `<Chip kind="input" shape="expressive">` | Implemented |
| `SuggestionChip` | `<Chip kind="suggestion" variant="flat">` | Implemented |
| `ElevatedSuggestionChip` | `<Chip kind="suggestion" variant="elevated">` | Implemented |

The remaining public source surface is also accounted for:

| Source entry | Translation |
| --- | --- |
| `AssistChipDefaults`, `FilterChipDefaults`, `InputChipDefaults`, `SuggestionChipDefaults` | Default geometry, arrangement, colors, outlines, elevation, shapes, and typography are registered tokens and CSS behavior. |
| `ChipColors`, `SelectableChipColors` | Stable provider-level component tokens replace per-instance Compose color objects. Enabled/disabled and selected/unselected resolution is retained. |
| `ChipElevation`, `SelectableChipElevation` | CSS shadow variables and native interaction states retain every resolved value. Selection intentionally does not change elevation, matching the source implementation. |
| `ChipShapes` | `ChipShape = 'standard' | 'expressive'` maps the default shape or sourced unselected/selected/pressed set. Arbitrary shape objects are excluded. |

The additional `AssistChip`/`ElevatedAssistChip`/`FilterChip`/`InputChip`/
`SuggestionChip`/`ElevatedSuggestionChip` overloads marked `@Deprecated` in the
pinned file are Android source/binary compatibility shims. Eleven deprecated
composable overloads, the two deprecated defaults functions returning
`ChipBorder`, and deprecated `ChipBorder` itself are frozen as 14 separate
ledger entries and excluded as distinct React APIs; their observable output
duplicates a current row above.

## Anatomy and slots

- One native `<button>` root owns interaction and one nested visual container
  owns shape, background, outline, elevation, focus ring, and state layer.
- The visual content is always three ordered children: leading slot, `Text`
  label using `labelLarge`, trailing slot. This mirrors `ChipContent` and
  `AnimatingChipContent` exactly enough that missing zero-width slots still
  contribute arrangement spacing.
- Assist supports leading and trailing icons. Filter and input support both.
  Suggestion supports only its source `icon`, mapped to `leadingIcon`.
- Input supports `avatar`; `leadingContent()`'s source precedence is preserved
  as avatar > leading icon.
- Both slot wrappers are decorative (`aria-hidden`). Direct public `Icon`, SVG,
  and image children are constrained to the slot box.
- Selectable slots retain their last non-null node while hidden, translating
  `rememberRetainedState` during `AnimatedVisibility` exit.

## Geometry and arrangement

- Visual container minimum height: 32px.
- Native interaction target: minimum 48×48px, translating the `Surface`
  minimum interactive component size around the 32dp visual chip.
- Icon: 18×18px. Input avatar: 24×24px, full-corner clipped, disabled opacity
  0.38.
- Selectable maximum width: 1000px (`maxChipWidth`). The root also respects its
  containing inline size.
- Content row sizing is intrinsic/fit-content until constrained. Label is the
  flexible child, may wrap under large text, and has `min-inline-size: 0`; the
  trailing fixed-size slot cannot be hidden by a long label.
- Standard content padding is 8px per logical edge and arrangement spacing is
  8px between each of the three positions. Therefore a label-only chip has an
  effective 16px visual edge distance, just like the source's two zero-width
  spacers.
- Expressive filter/input arrangements preserve every `ChipArrangement`
  branch: no slots 8/8; leading only 4/8; trailing only 4/4 (the zero-width
  leading position uses `trailingSpacing`); both 4/4.
- Input content padding preserves every branch: logical start 4px with no
  leading or with avatar, 8px with leading icon; logical end 4px without
  trailing and 8px with trailing.

## Shape, color, outline, and elevation

- Standard shape: small corner in every state.
- Expressive shape: medium unselected, full selected, small pressed. Pressed
  wins over selected while active.
- Assist: on-surface label, primary icons; flat outline-variant 1px; elevated
  surface-container-low.
- Suggestion: on-surface-variant label, primary leading icon; flat
  outline-variant 1px; elevated surface-container-low.
- Filter: unselected on-surface-variant label/trailing and legacy primary
  leading icon. Expressive/tonal unselected leading uses on-surface-variant.
  Selected container is secondary-container and all selected content is
  on-secondary-container.
- Input: unselected content is on-surface-variant. Selected container is
  secondary-container, label/trailing are on-secondary-container, and leading
  icon is primary.
- Unselected flat filter/input outlines are outline-variant 1px. Selected
  outline width is zero. Disabled unselected outline is on-surface at 0.12;
  disabled selected container is on-surface at 0.12 with no outline.
- All disabled labels/icons use on-surface at 0.38. Elevated disabled
  containers use on-surface at 0.12; disabled elevation is Level 0.
- Assist/suggestion flat elevation is Level 0 and dragged Level 4.
  Assist/suggestion elevated is Level 1 rest/focus/press, Level 2 hover,
  Level 4 drag, Level 0 disabled.
- Filter flat is Level 0 rest/focus/press, Level 1 hover, Level 4 drag. This
  follows `filterChipElevation()` literally: it uses the generated *selected*
  hover role for every selection state, while
  `SelectableChipElevation` ignores selection.
- Filter elevated is Level 1 rest/focus/press, Level 2 hover, Level 4 drag,
  Level 0 disabled. Input is Level 0 except Level 4 drag.
- The source's disabled elevated-suggestion defaults literally read
  `AssistChipTokens.DisabledIcon*` and
  `AssistChipTokens.ElevatedDisabledContainerOpacity`; those cross-family
  references remain explicit. Flat suggestion reads its own generated disabled
  icon roles.

## State and motion

- Enabled, disabled, unselected, selected, hover, keyboard focus, press, drag,
  and supported combinations are implemented.
- A current native `draggable` prop enables the existing browser drag lifecycle.
  `dragstart`/`dragend` set a private `data-m3e-dragged` state, making every
  source Level 4 dragged path observable without inventing a separate prop.
- Hover/focus/press state-specific generated content colors are mostly unread
  by the pinned `ChipColors`/`SelectableChipColors` resolution. Base resolved
  colors therefore remain stable and the Material state layer conveys those
  interactions.
- Enabled container/color/outline/shadow transitions use system Expressive
  effects. Shape uses fast-spatial.
- Standard selectable slots enter with slow-effects opacity and fast-spatial
  width, exit with fast-effects opacity and default-effects shrink, matching
  the standard overload's temporary animation specifications. Expressive slots
  use default-effects opacity and fast-spatial width both ways.
- Momentary assist/suggestion content does not animate because it uses
  `ChipContent`, not `AnimatingChipContent`.
- Moving to disabled resolves immediately at the native disabled selector,
  matching the source elevation snap. Reduced motion removes every transition
  and leaves the final state intact.
- When multiple browser pseudo-classes coexist, CSS uses deterministic
  active/drag/hover/focus cascade priority rather than reproducing the source's
  chronological `interactions.lastOrNull()` list. Each individual state value
  is unchanged.

## Generated-role completeness ledger

`Chip.source.test.ts` freezes all 220 generated declarations and the exact
118 read / 102 unread partition:

| Token family | Declarations | Read by `Chip.kt` | Unread |
| --- | ---: | ---: | ---: |
| `AssistChipTokens` | 34 | 24 | 10 |
| `FilterChipTokens` | 67 | 38 | 29 |
| `InputChipTokens` | 56 | 29 | 27 |
| `SuggestionChipTokens` | 34 | 23 | 11 |
| `ChipsTokens` | 29 | 4 | 25 |

Unread does not mean forgotten. It means the pinned implementation has no
resolution path for that generated name. In particular:

- hover/focus/press/drag label and icon names collapse to the actually-read
  base `ChipColors`/`SelectableChipColors`;
- unused focus-indicator token names do not replace this library's established
  token-backed focus ring contract;
- most `ChipsTokens` geometry/color/outline names are not used by the new
  overloads; they still reuse legacy family defaults and read only the three
  shapes plus tonal unselected leading color;
- `InputChipTokens.TrailingIconSize` is generated but the defaults expose
  `IconSize` from `LeadingIconSize`; both current values are 18dp and the source
  content does not read the trailing name.

The T38 registration contains 122 searchable tokens after consolidating
identical paths that the source resolves together. It does not fabricate
properties for unread generated states.

## Pinned implementation anomalies

The ledger also freezes eight source details that a cleanup-oriented port could
accidentally erase:

- the current customizable `elevatedAssistChipColors(...)` overload copies
  `defaultElevatedSuggestionChipColors`, while the zero-argument
  `elevatedAssistChipColors()` returns the correct assist defaults. Arbitrary
  per-instance color objects are excluded here, so the shipped default follows
  the correct zero-argument path;
- elevated suggestion disabled-container opacity reads
  `AssistChipTokens.ElevatedDisabledContainerOpacity`;
- elevated suggestion disabled icon defaults read
  `AssistChipTokens.DisabledIconColor` and `DisabledIconOpacity`; flat
  suggestion correctly keeps `SuggestionChipTokens.DisabledLeadingIcon*`;
- elevated filter's disabled trailing icon reads
  `FilterChipTokens.DisabledLeadingIconOpacity` instead of its same-valued
  `DisabledTrailingIconOpacity`; the elevated CSS keeps that cross-role read;
- `ChipElevation.equals`/`hashCode` omit stored `draggedElevation`;
- `SelectableChipElevation.equals`/`hashCode` also omit stored
  `draggedElevation`. This library exposes no public elevation value object, so
  it retains rendered drag elevation without importing the equality defect;
- `ChipColors` and `SelectableChipColors` carry TODO
  `b/113855296` for hover/focus/drag resolution, explaining the unread
  state-specific color roles;
- both selectable content paths say their animation tokens are temporary TODOs.
  The exact currently selected motion schemes are translated rather than
  guessing future token replacements.

## Pinned-test completeness ledger

The executable ledger freezes every input test name: 59 `ChipTest` cases and
34 `ChipScreenshotTest` cases. Their translations are grouped as follows:

- semantics/behavior: native button role and enabled/disabled state for
  assist/suggestion; `aria-pressed` for selected/unselected filter/input;
  click, toggle, Enter, Space, cancellation, controlled/uncontrolled state,
  form safety, and refs;
- geometry: all family heights, standard/custom-width padding, icons, avatar,
  custom padding/spacing output, scroll-row dimensions, intrinsic min/max,
  long label with trailing icon, large font growth, row content, and 48px
  minimum click target;
- content resolution: unselected/selected label and slot colors, disabled
  elevated shapes/colors, and elevated filter defaults;
- Expressive arrangement: filter no/leading/trailing/both icons, large-width
  trailing placement, and input no icon/leading/avatar/trailing;
- screenshots: every flat/elevated, light/dark, enabled/disabled,
  selected/unselected, avatar, and standard/Expressive case named by the 34
  pinned golden tests appears in the source ledger and in the example/theme/
  CSS/browser coverage.

Unlike Android's golden harness, this repository does not copy upstream bitmap
goldens. Its real-browser rendering audit checks interaction targets and clipped
elevation shadows, while focused CSS/token tests freeze exact state mappings
and the playground renders the matrix in both system color modes.

## DOM, forms, selection, and runtime validation

- DOM: `<button class="m3e-chip">` → `<span
  class="m3e-chip__container">` → leading slot, `Text` label, trailing slot.
- Default `type="button"` prevents accidental form submission. Native
  `type="submit"`, `form`, `name`, `value`, handlers, attributes, style/class,
  and the button ref are preserved.
- Filter/input controlled selection never mutates prop-owned state. Uncontrolled
  selection initializes from `defaultSelected`.
- Consumer click runs before internal selection; `preventDefault()` cancels the
  change. Native disabled prevents both.
- Development builds warn for missing/invalid kind, elevated input,
  Expressive momentary shape, selection on momentary kinds, mixed controlled/
  uncontrolled state, controlled state without callback, avatar outside input,
  suggestion trailing icon, and missing accessible label.

## Accessibility, bidi, forced colors, and themes

- All purposes are native buttons. Assist/suggestion expose no `aria-pressed`.
  Filter/input expose a Boolean pressed state; this is the named web adaptation
  from Compose `Role.Checkbox`.
- Button text or explicit ARIA naming owns the accessible name. Decorative
  slot content is hidden as one subtree, so icon glyph names do not leak.
- Native buttons provide keyboard activation and leave sequential focus when
  disabled. The focus-visible ring uses secondary.
- Logical padding/margins and unchanged source order mirror correctly in RTL.
- Forced colors retains ButtonFace/ButtonText boundaries,
  Highlight/HighlightText selected state, Highlight focus, and GrayText
  disabled state, while suppressing translucent state layers and shadows.
- Light/dark aliases, custom Chip token overrides, and nested providers resolve
  through normal scoped custom properties. Chip injects no runtime styles.
- Server markup is deterministic and hydration does not alter it.

## Web-specific deviations and exclusions

- Ten current Compose overload paths become one discriminated React component.
- Selectable Compose `Role.Checkbox` becomes native `<button aria-pressed>`;
  this preserves button-shaped content slots and uses the web's toggle-button
  contract.
- Compose `Modifier`, `MutableInteractionSource`, `PaddingValues`,
  `Arrangement.Horizontal`, `BorderStroke`, arbitrary color/elevation objects,
  `State<Color>`, `Row` measure policy, composition locals, and semantics DSL
  are platform mechanisms rather than React API. Their observable results above
  remain in scope.
- Arbitrary per-instance token objects are replaced by scoped provider tokens.
- Deprecated compatibility overloads are excluded; no observable variant is
  lost.
- Compose's exact chronological interaction precedence is flattened to CSS
  pseudo-class cascade when simultaneous states coexist.
- Android bitmap goldens are not redistributed. Equivalent state coverage is
  enforced through token/CSS assertions and the local real-browser audit.
