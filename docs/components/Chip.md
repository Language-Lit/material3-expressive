# Chip

`Chip` is the compact Material action and selection control. One discriminated
API covers assist, filter, input, and suggestion purposes without allowing
source-invalid prop combinations.

```tsx
import { Chip, Icon } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<Chip
  kind="assist"
  variant="elevated"
  leadingIcon={<Icon source="translate" />}
>
  Translate
</Chip>

<Chip
  kind="filter"
  shape="expressive"
  selected={grammar}
  onSelectedChange={setGrammar}
  leadingIcon={grammar ? <Icon source="check" /> : null}
>
  Grammar
</Chip>

<Chip
  kind="input"
  avatar={<span>A</span>}
  trailingIcon={<Icon source="close" />}
>
  Aiko
</Chip>
```

## Contract

- `kind` is required: `assist`, `filter`, `input`, or `suggestion`.
- Assist and suggestion chips are momentary actions. They accept normal native
  button props but no selection props.
- Filter and input chips are selectable. Use either controlled
  `selected`/`onSelectedChange` or uncontrolled `defaultSelected`.
- `variant` is `flat` by default. Assist, filter, and suggestion also support
  `elevated`; the first-party source has no elevated input chip.
- `shape="expressive"` enables the sourced state shape morph for filter and
  input chips. The default `standard` treatment keeps the small corner.
- `leadingIcon` is available to every purpose. `trailingIcon` is available to
  assist, filter, and input; the source exposes only a leading icon for
  suggestion.
- `avatar` is input-only and replaces `leadingIcon` when both exist.

All branches render a native `<button type="button">`; submission is opt-in
with `type="submit"`. Native attributes, form ownership, name/value, handlers,
class/style, forwarded ref, disabled state, and `draggable` are preserved.
For selectable chips, consumer `onClick` runs first and `preventDefault()`
cancels the state change.

## Anatomy and geometry

The root reserves the theme's 48px minimum interactive target around a 32px
visual container. The visual row always contains three children: leading slot,
label, and trailing slot. Missing slots collapse to zero width but retain their
adjacent arrangement gap, matching the pinned source rather than treating
missing content as a two-child row.

Standard spacing is 8px. Expressive filter/input spacing becomes 4px next to
present slots, including the source's trailing-only rule that leaves 4px before
the label and trailing icon. Input edge padding is 4px normally, 8px before a
leading icon, 4px before an avatar, and 8px after a trailing icon.

Icons occupy 18×18px. Input avatars occupy and clip to a 24×24px full corner.
Selectable chips cap at the source's 1000px maximum width. Labels may wrap and
grow the visual container for large text; a trailing slot remains visible
instead of being squeezed out by a long label.

## Variants, state, and motion

Flat assist/suggestion chips and unselected filter/input chips are outlined.
Selected filter/input chips use secondary-container and remove the outline.
Elevated assist/suggestion and unselected filter chips use
surface-container-low. Filter elevation is Level 0/1 for flat rest/hover and
Level 1/2 for elevated rest/hover. Assist and suggestion elevated chips use
Level 1/2; their flat treatment stays Level 0. Every supported draggable chip
uses Level 4 while dragged. Disabled elevation is Level 0.

Hover, focus, and press paint Material state layers. Keyboard focus adds the
token-backed secondary ring. Standard chips keep the small shape; Expressive
filter/input chips use medium when unselected, full when selected, and small
while pressed.

Selectable slot insertion/removal reproduces the source's
`AnimatedVisibility`, including retaining the departing node until its exit
state completes. Standard slots use slow-effects plus fast-spatial on entrance
and fast-effects plus default-effects on exit. Expressive overloads use
default-effects opacity and fast-spatial size. Reduced motion resolves every
shape, elevation, color, and slot change immediately.

## Accessibility

The native button supplies naming, pointer, Enter, Space, focus, disabled, and
form behavior. Filter and input publish selection with `aria-pressed`; assist
and suggestion do not expose a false toggle state. This is the native-web
translation of the source's selectable `Role.Checkbox`.

Slot wrappers are decorative and `aria-hidden`, so their glyph names never
pollute the button name. Supply visible label content, `aria-label`, or
`aria-labelledby`. Do not put links, controls, or other interactive content
inside a chip.

Logical padding/margins mirror under RTL without reordering the DOM.
Forced-colors mode keeps an explicit boundary, Highlight selected state and
focus, HighlightText selected content, and GrayText disabled treatment while
removing translucent state layers and authored shadows.

## Tokens and source boundary

Chip registers searchable `--m3e-comp-chip-*` variables for:

- 32px visual height, minimum target, maximum width, slot sizes and shapes;
- standard/compact spacing and input-specific logical edge padding;
- standard and Expressive unselected/selected/pressed shapes;
- each purpose's enabled, selected, disabled, outline, and elevated colors;
- rest, hover, focus, press, drag, and disabled shadows;
- focus ring geometry/color.

The registration pins AndroidX revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`. Generated roles that `Chip.kt`
never reads are recorded as unread instead of becoming fictitious component
states. The source's cross-family elevated-suggestion disabled reads remain
explicit: its icon and container opacity use assist-chip roles with the same
current values, while flat suggestion keeps the suggestion icon roles.

Per-instance Compose color/elevation/border objects are not React props;
customization uses scoped `Material3Provider` component tokens. Deprecated
Android compatibility overloads and Compose-only `Modifier`,
`InteractionSource`, `Arrangement`, and measure-policy plumbing are excluded,
while their observable output is implemented. The complete mapping is frozen
in the Chip conformance record and executable source-ledger test.
