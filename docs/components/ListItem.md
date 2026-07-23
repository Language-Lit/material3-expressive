# ListItem

`ListItem` and `SegmentedListItem` render Material list rows with native web
semantics for passive content, actions, radio selection, and checkbox
selection.

```tsx
import {
  ListItem,
  SegmentedListItem,
} from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<ListItem
  interaction="action"
  headline="Grammar review"
  supportingText="12 exercises"
  trailingContent="18 min"
  onClick={openLesson}
/>

<SegmentedListItem
  interaction="single"
  index={0}
  count={3}
  name="level"
  value="beginner"
  headline="Beginner"
  selected={level === 'beginner'}
  onSelectedChange={() => setLevel('beginner')}
/>
```

## Contract and anatomy

Every item requires `headline`. Optional `leadingContent`, `trailingContent`,
`overline`, and `supportingText` slots complete the source anatomy.

- Omit `interaction` for passive content. `as="div"` is the default;
  `as="li"` is available inside a semantic list.
- `interaction="action"` renders a native button and defaults to
  `type="button"`.
- `interaction="single"` renders a native radio. `name` and `value` are
  required. Use controlled `selected`/`onSelectedChange` or uncontrolled
  `defaultSelected`.
- `interaction="multiple"` renders a native checkbox. Use controlled
  `checked`/`onCheckedChange` or uncontrolled `defaultChecked`.
- `SegmentedListItem` shares every mode and requires `index` and `count` to
  derive first, middle, last, or only-item corners.

Native attributes and form ownership are forwarded to the semantic button or
input. `className` and `style` describe the visual root. The forwarded ref
targets the passive root, button, radio, or checkbox selected by the
interaction mode.

## Geometry, variants, and states

One-, two-, and three-line rows have minimum heights of 56, 72, and 88px.
Headline plus supporting text is two-line; an overline or multiline supporting
text selects three-line geometry. Short rows center their slots vertically;
three-line rows align them to the top. Logical edge padding is 16px, ordinary
block padding is 10px, precision-pointer block padding is 12px, and slot
spacing is 12px.

Segmented rows use a 2px gap. The first row receives large top corners, the
last receives large bottom corners, and a single row receives all four. Middle
corners retain the extra-small base shape.

Base content uses on-surface/on-surface-variant over surface. A checked radio
or checkbox uses secondary-container with on-secondary-container content.
Disabled content resolves to on-surface at 0.38 while preserving its selected
shape. Native drag events use the separate reorder-list
tertiary-container/on-tertiary-container colors, large shape, and Level 4
shadow.

Hover uses the medium corner. Focus, selection, press, and drag use the large
corner. When states overlap, shape priority is press, drag, selection, focus,
hover, then base. Color priority is disabled, drag, selection, then base.
State-layer/color motion uses Expressive default-effects; shape and elevation
use fast-spatial. Reduced motion resolves immediately.

## Accessibility

Buttons, radios, and checkboxes own pointer, Enter/Space, focus, disabled,
accessible name/state, form serialization, reset, and event cancellation.
Radio grouping is native through `name`; no ARIA role recreates it.

All visible slot content contributes to the native control's accessible name.
Use `aria-label` or `aria-labelledby` when the visible row is not a suitable
name. Do not place links, controls, labels, or other focusable content inside
an interactive item. Use a passive row when slots need independent actions.

Logical grid order mirrors visually under RTL without changing DOM reading
order. Focus remains visible in forced colors; selected rows use system
Highlight/HighlightText and disabled rows use GrayText.

## Tokens and source boundary

The family consumes `--m3e-comp-list-item-*` tokens for heights, padding,
spacing, segmented gap, shapes, colors, disabled opacities, normal/dragged
elevation, and focus rings. Headline uses body-large, supporting text
body-medium, overline/trailing label-small, and leading content title-medium.

Defaults are pinned to AndroidX revision
`a90df2fc27e026b9ad2ed569f203a260c1041fab`. The generated
`ListTokens`/`ReorderListTokens` read and unread partitions are frozen in the
conformance ledger; generated names do not become fictitious runtime states.
Provider-scoped component token overrides replace arbitrary Compose
color/shape/elevation objects.

Long press is not exposed because the web has no corresponding native keyboard
activation. Compose `Modifier`, `InteractionSource`, semantics DSL, and measure
policies are platform mechanisms; their observable semantic, geometry, state,
and motion output remains covered.
