# Carousel

`Carousel` shows a scrollable collection of mostly-visual items that change size
as they move through the container. One component covers all six layouts
Material specifies.

```tsx
import { Button, Carousel } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

// Multi-browse: many items at once, for quick browsing.
<Carousel
  aria-label="Recent photos"
  preferredItemWidth={186}
  items={photos.map((photo) => ({
    key: photo.id,
    label: photo.title,
    content: <img src={photo.src} alt="" />,
    onActivate: () => open(photo),
  }))}
/>

// Hero: one large item with a preview of what is next.
<Carousel aria-label="Featured" layout="centeredHero" items={featured} />

// Uncontained: same-size items that flow past the edge.
<Carousel aria-label="Articles" layout="uncontained" itemWidth={240} items={articles} />

// Multi-aspect ratio: each item keeps its own shape.
<Carousel
  aria-label="Clips"
  layout="multiAspect"
  items={clips.map((clip) => ({ key: clip.id, content: <video src={clip.src} />, aspectRatio: clip.ratio }))}
/>
```

## Contract

`items` is the collection. Each item takes a `key`, its visual `content`, and
optionally a `label`, `onActivate`, `href`, and `disabled`. An item with
`onActivate` renders a real `button` and one with `href` a real `a`, so
Space/Enter activation and the browser's scroll-into-view on focus come from the
platform rather than from key handling.

`layout` selects the arrangement and defaults to `"multiBrowse"`:

| Layout | Best for | Required prop |
| --- | --- | --- |
| `multiBrowse` | Browsing many visual items at once | `preferredItemWidth` |
| `uncontained` | Text-heavy or highly customised items | `itemWidth` |
| `multiAspect` | Items of genuinely different shapes | per-item `aspectRatio` |
| `hero` | Spotlighting one very large item | — |
| `centeredHero` | The same, centred between two previews | — |
| `fullScreen` | Immersive vertical feeds | — |

`preferredItemWidth` is a target, not a guarantee: the arrangement adjusts small
items first, then medium ones, and only then the large width, so a whole number of
items fits the container. `minSmallItemWidth` and `maxSmallItemWidth` bound the
small item and default to the specified 40–56px range.

It is also the layout's only responsive lever, and it is yours to move. The
arrangement adds items as the container grows — at a fixed `186` it fits three
items at compact widths and eight at 1440px — but it does not grow the items
themselves. Material's guidelines put compact at window widths under 600dp, expect
up to three items there, and expect a growing window to both add items *and* scale
them up. Only the first of those falls out of the algorithm, so raise
`preferredItemWidth` at wider breakpoints if you want the second. The prop is a
plain number, so a window-size-class hook or a `ResizeObserver` is enough to drive
it. There is no specified ramp to copy: the first-party Compose sample hard-codes
186dp at every window size, which is why the examples here do the same.

One consequence is worth expecting rather than debugging. Whenever the arrangement
fits more than one large item, those keylines share a size, so an item crosses them
without resizing and only closes into its frame at the trailing edge. That is the
arrangement working as specified — the browse region is stable and the resizing
happens at the edges — and it is why a wide multi-browse carousel does not animate
like a narrow one.

`scroll` chooses between the specification's two named behaviors and defaults to
the one it recommends for the layout: `"snap"` everywhere except the two
uncontained layouts, which default to `"free"`. The full-screen layout requires
snapping, so leave it alone there.

`currentItem`, `defaultCurrentItem`, and `onCurrentItemChange` track the item at a
focal position. Setting `currentItem` scrolls to it; scrolling reports the nearest
item back. `itemSpacing` overrides the gap.

The carousel needs an accessible name, so pass `aria-label` or
`aria-labelledby`. Everything else on a `div` passes through, and the ref is the
scroll container.

## Adaptive item content

Items report their current width, so content can adapt without re-rendering.
`data-m3e-size` is `large`, `medium`, or `small` on each item, and content marked
`data-m3e-carousel-hide` **fades out** as the item narrows past the width that
content needs:

```tsx
<Carousel
  aria-label="Albums"
  preferredItemWidth={186}
  items={albums.map((album) => ({
    key: album.id,
    label: album.title,
    content: (
      <>
        <img src={album.cover} alt="" />
        <figcaption>
          <span data-m3e-carousel-hide="medium">{album.title}</span>
          <span data-m3e-carousel-hide="small">{album.year}</span>
        </figcaption>
      </>
    ),
  }))}
/>
```

That is Material's own rule: the large item shows the full title, the medium item
hides it, the small item abbreviates the label. It is a fade rather than a switch,
because that is what the reference does — a title is pinned to the masking edge and
faded out as the item becomes too small for it.

The attribute's value picks how long content survives, not a hard cutoff:
`"medium"` content is opaque on a focal item and gone by the middle of the range,
`"small"` content is opaque by that middle and gone at the narrowest visible item.
So a title leads its label out, and each transition is a fade you can watch rather
than a switch.

If you want text to stay put rather than be cropped as it fades, translate it by
`--m3e-carousel-item-inset-start`, as the reference pins its title. Prefer a
translation to padding: padding changes the content's own width, and content wide
enough to exceed the arrangement's item size is content the engine cannot place.

The exact pixel widths are
available too, as `--m3e-carousel-item-current-size`,
`--m3e-carousel-item-min-size`, and `--m3e-carousel-item-max-size`.

One caution if you use those numbers directly: `--m3e-carousel-item-min-size`
mirrors the Compose value, which counts the **anchor** keylines — the slivers
parked off screen at around 10px. It is not the narrowest item you can see, so
normalising a size against it will class almost everything as medium. `data-m3e-size`
already does the classification against the small keyline; prefer it.

Content is clipped to the item, never accommodated by it: an item is exactly the
arrangement's width, because the snap offsets are derived from that width. So text
that must stay readable as an item narrows should be padded by the mask insets,
`--m3e-carousel-item-inset-start` and `--m3e-carousel-item-inset-end`, which is
what they are exposed for — otherwise it is cropped mid-glyph rather than moved.

## Show all — the accessibility requirement

On a vertically scrolling page, a horizontal carousel needs a route to every item
that does not involve horizontal scrolling. Material asks for a **Show all**
button below the carousel, or an arrow beside its header. That is a composition,
not a prop:

```tsx
<section aria-labelledby="recent-heading">
  <h2 id="recent-heading">Recent</h2>
  <Carousel aria-labelledby="recent-heading" preferredItemWidth={186} items={photos} />
  <Button variant="text" onClick={() => router.push('/photos')}>
    Show all
  </Button>
</section>
```

The requirement does not apply to the full-screen layout, which already scrolls
the same axis as the page.

## Behavior

The carousel is a real scroll container, so gestures, wheel, momentum, keyboard
scrolling, and right-to-left come from the browser. Snapping is CSS scroll snap
positioned at Material's own keylines, so a released gesture settles where the
arrangement says it should. Fling distance is the browser's — Material's
one-item-at-a-time fling has no web equivalent.

Item masking is computed from the scroll position, which is what makes items
expand and collapse between the large, medium, and small widths and gives the
image inside a mask its parallax.

Under `prefers-reduced-motion: reduce` the masking is withdrawn: every item stays
at its full size, nothing expands, and the items reach the container edges — the
reduced-motion presentation Material describes.

## Tokens

Carousel is the one component whose tokens change the *layout*, not only the
paint. Four of them feed the arrangement algorithm directly:

| Token | Default | Effect |
| --- | --- | --- |
| `--m3e-comp-carousel-min-small-item-size` | `40px` | Narrowest a small item may be |
| `--m3e-comp-carousel-max-small-item-size` | `56px` | Widest a small item may be |
| `--m3e-comp-carousel-anchor-size` | `10px` | How far items travel past each edge |
| `--m3e-comp-carousel-medium-large-item-diff-threshold` | `0.85` | When a medium item is too close to a large one |

The rest are ordinary appearance tokens: `container-color`, `item-shape`,
`item-container-color`, `item-content-color`, `item-spacing`, `leading-padding`,
`trailing-padding`, `block-padding`, `uncontained-trailing-padding`,
`full-screen-padding`, `full-screen-item-spacing`, the focus-ring trio, the
state-layer colour, and the two disabled opacities. Override any of them on the
theme or on one instance:

```tsx
<Carousel
  aria-label="Covers"
  preferredItemWidth={186}
  items={covers}
  style={{ '--m3e-comp-carousel-item-shape': '12px' }}
/>
```

## Layout notes

Give the carousel a height. Items fill it, and the multi-aspect layout derives
each item's width from that height and the item's ratio.

Item content is laid out at the unmasked item size and clipped, so an image should
fill its item — `img`, `video`, `picture`, `svg`, and `canvas` children are already
sized and cropped for you.
