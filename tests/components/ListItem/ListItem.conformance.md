# ListItem conformance

Task: T40
Status: conformant
Reviewed: 2026-07-24

## Primary references

- AndroidX `ListItem` API, accessed 2026-07-24:
  <https://developer.android.com/reference/kotlin/androidx/compose/material3/ListItem.composable>
- AndroidX `SegmentedListItem` API, accessed 2026-07-24:
  <https://developer.android.com/reference/kotlin/androidx/compose/material3/SegmentedListItem.composable>
- Pinned `ListItem.kt`, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ListItem.kt>
- Pinned `ListItemDefaults.kt`, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ListItemDefaults.kt>
- Pinned generated tokens, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/>
- WCAG 2.2, accessed 2026-07-24: <https://www.w3.org/TR/WCAG22/>

Supported baseline: AndroidX Material 3 revision
`a90df2fc27e026b9ad2ed569f203a260c1041fab`; generated `ListTokens.kt`
and `ReorderListTokens.kt` identify version 29.0.0.

## Surface and native semantics

The four current `ListItem` overloads and four matching
`SegmentedListItem` overloads map to `interaction="none"`, `"action"`,
`"single"`, and `"multiple"`. Passive items use `div`/`li`, actions use a
button, single selection uses a radio, and multiple selection uses a checkbox.
Native controls own activation, keyboard, focus, disabled behavior, names,
states, forms, reset, cancellation, and refs.

The source defaults object, colors/shapes/elevation value classes, padding,
vertical alignment, and segmented shape factory map to component tokens and
CSS state. The deprecated headline-first overload, `Elevation`, `shape`, and
legacy colors overload are compatibility surfaces and do not create separate
React APIs.

## Anatomy and geometry

Headline, leading, trailing, overline, and supporting slots are implemented.
The 56/72/88px minimum heights, 16px logical edge padding, 10px ordinary and
12px precision-pointer block padding, 12px internal slot spacing, 2px
segmented gap, constrained/intrinsic width, multiline detection, and
center-versus-top alignment are covered by CSS tests and the rendering audit.

Segmented first/middle/last/only logical corners use the generated large outer
shape over the Expressive extra-small base shape. Runtime positions are
validated and fail safely.

## Color, shape, elevation, typography, and motion

Normal, selected, disabled, and dragged resolution covers all six source color
channels. Dragged color/shape roles retain their distinct
`ReorderListTokens` ownership while dragged elevation correctly remains a
`ListTokens` Level 4 read. Disabled resolves before dragged/selected for
colors. Shape priority is pressed, dragged, selected, focused, hovered, base.

Headline is body-large; supporting is body-medium; overline and trailing are
label-small; leading content is title-medium. Effects motion controls
color/state layers and fast-spatial controls shape/elevation. Reduced motion,
forced colors, light/dark scopes, and nested token overrides are covered.

## Source-completeness ledger

`ListItem.source.test.ts` freezes:

- eight upstream file identities;
- all 120 `ListTokens` declarations and their 46 read / 74 unread partition;
- all nine `ReorderListTokens` declarations and their seven read / two unread
  partition;
- 25 current and 13 deprecated public/default/value-class paths;
- 44 behavior tests and 27 screenshot tests;
- four source details which are easy to erase during translation.

Direct implementation geometry is distinguished from generated tokens.
Generated-but-unread media/icon/state names do not become runtime behavior.

## Web adaptations

- Native radio/checkbox semantics replace Compose selectable/toggleable
  semantics and make selection form-capable.
- Long click is excluded because the web has no native keyboard-equivalent
  long-press action.
- `Modifier`, arbitrary color/shape/elevation objects, interaction sources,
  semantics DSL, and measure policies are platform machinery. Provider tokens
  and authored CSS preserve their observable result.
- Native `draggable` events expose the source dragged appearance.
- Interactive slots reject nested actions; multi-action rows use passive mode.

Behavior, accessibility, types, CSS, theme, SSR/hydration, production styles,
public exports, documentation, playground, packed consumers, and real-browser
geometry are verified by T40's focused and aggregate gates.
