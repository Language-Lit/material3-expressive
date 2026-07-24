# Divider

`Divider` is the thin line that groups content in lists and layouts. It renders
a native `<hr>` by default, supports both orientations through one `orientation`
prop, and takes its color and thickness from component tokens rather than props.

```tsx
import { Divider, ListItem } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

// A full-width rule between sections.
<Divider />

// Between list items, where `hr` would be invalid HTML.
<ul>
  <ListItem as="li" headline="Inbox" />
  <Divider as="li" />
  <ListItem as="li" headline="Archive" />
</ul>

// Between controls in a flex row.
<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
  <span>Draft</span>
  <Divider orientation="vertical" />
  <span>Edited 2m ago</span>
</div>

// A rule the grouping already conveys, hidden from assistive technology.
<Divider decorative />
```

## Contract

`orientation` selects the axis and defaults to `"horizontal"`. A horizontal
divider fills the inline axis and takes its thickness on the block axis; a
vertical divider is the transpose.

Both orientations fill by stretching, so inline margins subtract from the line
rather than pushing it past its container — which is how insets are written. A
horizontal divider fills a block, flex-column, or grid parent. A vertical
divider fills the cross axis of a **bounded** parent through
`align-self: stretch`, so it needs a flex or grid parent, or an explicit block
size; it collapses in an auto-height block container — the same constraint the
Material source's `fillMaxHeight()` has.

`as` selects the element and defaults to `"hr"`. Use `"li"` inside `<ul>` and
`<ol>`, whose content model accepts only `li` and script-supporting children, so
an `hr` between list items is invalid markup. Use `"div"` for layouts that
accept neither.

`decorative` hides a purely visual line from the accessibility tree. The default
is semantic, because Material dividers group content rather than only decorate
it.

The component renders no children — a divider is an empty line, and its default
element is void. `className` is merged after the library class, `style` and
every other native attribute pass through, and `ref` forwards to the rendered
element.

## Accessibility

A default `<hr>` carries the implicit `separator` role, which the component
leaves implicit rather than restating. `div` and `li` receive an explicit
`role="separator"`. Vertical separators add `aria-orientation="vertical"`;
horizontal ones do not, because that is already the role's implicit value.

`decorative` emits `role="none"` on `hr` and `li`, which have an implicit role
to strip, and nothing on `div`, which has none. A decorative divider carries no
`aria-orientation`, since it exposes no role to qualify.

The divider is never focusable and has no keyboard model. In forced-colors mode
it repaints as `CanvasText`, because author background colors are overridden
there and the line would otherwise vanish.

## Tokens and source boundary

Two tokens, matching the two roles the Material source's generated
`DividerTokens` declares and reads:

| Token | Default |
| --- | --- |
| `--m3e-comp-divider-color` | `sys.color.outlineVariant` |
| `--m3e-comp-divider-thickness` | `1px` |

The Material source takes thickness and color as per-call parameters. This
library exposes them as tokens instead: an arbitrary per-instance value would
have to be emitted as an inline style, while a scoped custom-property override
composes with the theme, nests with `Material3Provider`, and survives server
rendering.

Indentation is composition rather than a prop — apply an inline margin to the
divider, or padding to its container, matching the source, whose own indent
test applies a padding modifier around the divider and asserts its size is
unchanged while the drawn line shortens inside the indent. (Padding on the
divider itself cannot express an inset: the painted background fills the
padding box.)

`Dp.Hairline` is not reproduced. It exists to escape density scaling and paint
exactly one physical pixel; a CSS pixel is already density-independent, and the
source's own hairline test shows the modern composables lay out at zero height.

`Tabs` paints its rule under the tablist as a border rather than composing a
`Divider`, because `role="tablist"` owns only `role="tab"` children. Its
`--m3e-comp-tabs-divider-*` tokens carry the same sourced values, so restyling
one tab row stays possible without the two drifting apart.
