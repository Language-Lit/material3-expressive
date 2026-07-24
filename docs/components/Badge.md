# Badge

`Badge` is the small notification marker that sits on an icon — a bare dot for
"something is new", or a short count. `BadgeAnchor` positions one against the
content it belongs to.

```tsx
import { Badge, BadgeAnchor, NavigationBar, Tabs } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

// A dot: no content, so it is the small variant.
<Badge label="New notifications" />

// A count: any content makes it the large variant.
<Badge label="3 unread messages">3</Badge>

// Anchored to an icon.
<BadgeAnchor badge={<Badge label="3 unread">3</Badge>}>
  <Icon name="mail" />
</BadgeAnchor>

// On a navigation destination, where badges are most often used.
<NavigationBar
  items={[
    { value: 'inbox', label: 'Inbox', icon: <Icon name="inbox" />, badge: <Badge label="3 unread">3</Badge> },
    { value: 'sent', label: 'Sent', icon: <Icon name="send" /> },
  ]}
/>

// On a tab.
<Tabs
  items={[
    { value: 'all', label: 'All', icon: <Icon name="list" />, badge: <Badge label="2 new">2</Badge> },
    { value: 'archive', label: 'Archive' },
  ]}
/>
```

## Contract

There is no `variant` or `size` prop. The presence of children selects the
variant, exactly as the Material source selects it from `content != null`: a
childless badge is the 6px dot, and any content makes it the 16px pill. A zero
count still counts as content, so `<Badge>{0}</Badge>` stays large.

Material caps badge text at four characters including a `+`, so `999+` is the
widest intended label. Longer text keeps working — the pill grows from its
leading edge outward — but it stops matching the specification.

`BadgeAnchor` takes the badge through `badge` and the content it decorates
through `children`. It measures exactly its children: the badge is taken out of
flow, so adding one never changes the layout around it. The badge lands at the
top-trailing corner and mirrors automatically in right-to-left languages.

Both components render a `<span>`, merge `className` after the library class,
pass every other native attribute through, and forward `ref`.

## Accessibility

`label` is what assistive technology announces, and it is where the sentence
goes: `label="3 unread messages"` rather than the bare `3` the badge shows. It
exposes the badge as an image with that name and prunes the visible glyph, so
the count is announced once rather than twice.

Supply it whenever the badge carries meaning. Without it the badge exposes no
role at all — a labelled badge's own text is still read as ordinary content, but
a bare dot is silent, which is the right default only when something else
already conveys the same thing.

Badges are announced after the destination they belong to. Inside
`NavigationBar`, `NavigationRail`, and `Tabs` this works without extra markup:
those components hide their icon slots from assistive technology, and the badge
is deliberately rendered outside that hidden subtree.

In forced-colors mode the badge repaints as `CanvasText` on `Canvas` with a ring
in `Canvas`, because author background colors are dropped there and the badge
would otherwise read as loose text on top of its icon.

## Badges on navigation and tabs

`NavigationBar`, `NavigationRail`, `NavigationDrawer`, `NavigationSuite`, and
`Tabs` each accept a `badge` on their items. This mirrors the Material source,
where those are exactly the components that make room for a badge.

The drawer is the exception worth knowing about. In Material a drawer item's
badge is a **different affordance**: a plain trailing count at the end of the
row, in the item's own text color, not an error-colored pill anchored to the
icon. So pass text there, and a `Badge` in the others:

```tsx
<NavigationDrawer
  variant="permanent"
  items={[
    { value: 'inbox', label: 'Inbox', icon: <Icon name="inbox" />, badge: '24' },
    { value: 'spam', label: 'Spam', icon: <Icon name="report" />, badge: '99+' },
  ]}
/>
```

## Tokens and source boundary

| Token | Default |
| --- | --- |
| `--m3e-comp-badge-color` | `sys.color.error` |
| `--m3e-comp-badge-label-color` | `sys.color.onError` |
| `--m3e-comp-badge-shape` | `sys.shape.corners.cornerFull` |
| `--m3e-comp-badge-size` | `6px` |
| `--m3e-comp-badge-large-size` | `16px` |
| `--m3e-comp-badge-large-horizontal-padding` | `4px` |
| `--m3e-comp-badge-offset` | `6px` |
| `--m3e-comp-badge-large-horizontal-offset` | `12px` |
| `--m3e-comp-badge-large-vertical-offset` | `14px` |

The Material source takes the container and content colors as per-call
parameters. This library exposes them as tokens instead: an arbitrary
per-instance value would have to be emitted as an inline style, while a scoped
custom-property override composes with the theme, nests with `Material3Provider`,
and survives server rendering.

One `shape` token covers both variants because the source uses `CornerFull` for
each. The design specification's separate "3dp" and "8dp" corner radii are the
same statement measured on a 6px dot and a 16px pill.

The sizes are minimums, matching the source's `defaultMinSize`. To make a badge
smaller than its minimum, override the minimum as well as the size — setting the
size alone leaves the floor in place.

Label typography is read from the `label-small` typescale directly rather than
registered as a badge token, matching how every other component in this library
consumes type.
