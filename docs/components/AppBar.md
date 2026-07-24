# AppBar

`AppBar` is the band at the top of a screen that names the page and carries its
navigation and actions. One component covers Material's six top-bar variants
through `size`, `flexible`, `titleAlignment`, and `subtitle`, and couples to
scrolling through three sourced behaviors: pin, hide-and-return, and
collapse-to-small.

```tsx
import { AppBar, IconButton } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

// A small pinned bar that fills with color once content scrolls under it.
<AppBar
  title="Inbox"
  scrollBehavior="pinned"
  navigationIcon={<IconButton aria-label="Open navigation">…</IconButton>}
  actions={<IconButton aria-label="Search">…</IconButton>}
/>

// A centered small bar with a subtitle.
<AppBar title="Inbox" subtitle="All accounts" titleAlignment="center" />

// A large flexible bar that collapses to a small bar as the page scrolls.
<AppBar
  size="large"
  flexible
  title={<h1>Inbox</h1>}
  subtitle="All accounts"
  scrollBehavior="exitUntilCollapsed"
/>

// A bar that hides on scroll and returns the moment the user scrolls up.
<AppBar title="Inbox" scrollBehavior="enterAlways" />
```

## Contract

`size` selects the tier and defaults to `"small"`. A small bar is single-row at
64px. Medium and large bars are two-row: a 64px collapsed row plus an expanded
title region, at the sourced 112px (medium), 152px (large), and — with
`flexible` — 112/136px (medium, without/with subtitle) and 120/152px (large).

`flexible` selects the Expressive treatment on medium and large bars: a
different type scale, and subtitle and title-alignment support. There is no
small flexible variant, because the source has none — the current Material
catalog folded the old center-aligned specimen into the small bar, which is why
`titleAlignment` lives on the small and flexible variants. The baseline medium
and large bars ship because the source keeps them stable; the design guidance
now recommends their flexible replacements, which is a documentation fact, not
an exclusion.

`title` is required and is a slot, not a heading: pass an `<h1>` if this bar
carries the page's heading, or plain text if it does not. `subtitle` requires a
variant that has one (small, or flexible). `navigationIcon` and `actions` are
plain slots; put `IconButton`s in them.

`scrollBehavior` defaults to `"none"`. The three couplings:

- `"pinned"` — the bar sticks to the top and swaps its container color to the
  on-scroll role whenever anything is scrolled under it.
- `"enterAlways"` — the bar slides away as the user scrolls down and returns
  the moment they scroll up, settling to fully shown or hidden when scrolling
  pauses.
- `"exitUntilCollapsed"` — a two-row bar shrinks to its collapsed row and
  stays there until the page is scrolled back to the top. Rejected on small
  bars, which have no row to collapse.

`scrollContainer` names the scrollable element when the page does not scroll at
the document level; the default is the window. The collapse fraction is not a
prop in either direction — it is a measurement of scroll position, and
controlling it would mean controlling the user's scroll.

`className` is merged after the library class, `style` and every other native
attribute pass through, and `ref` forwards to the `<header>`.

## Accessibility

The root is a native `<header>` — a `banner` landmark in body context. The
title is deliberately not coerced into a heading; document structure belongs to
the document.

A two-row bar renders its title twice, exactly as the Material source does, and
exposes only one copy to assistive technology at a time: the expanded title
speaks while the bar is open, the collapsed copy takes over past the halfway
point of the collapse — the source's own semantics threshold.

Material's accessibility guidance requires app bar actions to stay reachable
while content is scrolled. Pinned and collapsing bars satisfy that
structurally: something of the bar is always on screen. An `enterAlways` bar
satisfies it by revealing itself the moment keyboard focus lands inside it, so
tabbing to a bar control never operates an off-screen element.

Under `prefers-reduced-motion` the color and settle transitions are removed;
the collapse itself still tracks scrolling, because it is state, not
decoration. In forced-colors mode the band keeps a `CanvasText` boundary.

## Tokens and source boundary

Seventeen tokens: the six color roles the source's `topAppBarColors()` reads,
the seven tier heights, and the four hand-tuned constants on the source's read
path.

| Token | Default |
| --- | --- |
| `--m3e-comp-app-bar-container-color` | `sys.color.surface` |
| `--m3e-comp-app-bar-on-scroll-container-color` | `sys.color.surfaceContainer` |
| `--m3e-comp-app-bar-leading-icon-color` | `sys.color.onSurface` |
| `--m3e-comp-app-bar-title-color` | `sys.color.onSurface` |
| `--m3e-comp-app-bar-trailing-icon-color` | `sys.color.onSurfaceVariant` |
| `--m3e-comp-app-bar-subtitle-color` | `sys.color.onSurfaceVariant` |
| `--m3e-comp-app-bar-container-height` | `64px` |
| `--m3e-comp-app-bar-medium-container-height` | `112px` |
| `--m3e-comp-app-bar-medium-flexible-container-height` | `112px` |
| `--m3e-comp-app-bar-medium-flexible-subtitle-container-height` | `136px` |
| `--m3e-comp-app-bar-large-container-height` | `152px` |
| `--m3e-comp-app-bar-large-flexible-container-height` | `120px` |
| `--m3e-comp-app-bar-large-flexible-subtitle-container-height` | `152px` |
| `--m3e-comp-app-bar-horizontal-padding` | `4px` |
| `--m3e-comp-app-bar-title-inset` | `12px` |
| `--m3e-comp-app-bar-medium-title-bottom-padding` | `24px` |
| `--m3e-comp-app-bar-large-title-bottom-padding` | `28px` |

Typography comes straight from the baseline typescale per tier: title-large on
the small and collapsed rows, headline-small on medium, headline-medium on
medium flexible and large, display-small on large flexible, with label-medium,
label-large, and title-medium subtitles.

The catalog family is wider than this component, and the boundary is explicit.
The bottom app bar lives in the same Material source file, but the current
design catalog files it under Toolbars ("no longer recommended... replaced with
the docked toolbar"), so it belongs to that family's reconciliation. The
"Search app bar" specimen's source is the Search family's `AppBarWithSearch`.
And the overflow-action system — trailing actions collapsing into a menu when
space runs out — is behavior-owning upstream (`AppBarRow` measures and
relocates items), so it is deferred to its own task rather than approximated
with a recipe; until it lands, the App bars catalog row remains Partial by
design.

Pinning is native `position: sticky`. The scrolled color blend on a collapsing
bar is an overlay at the fraction's opacity — alpha-compositing an opaque color
is exactly the source's lerp. The collapsed title fades in through the source's
own cubic-bezier(.8, 0, .8, .15); the bar-drag resize gesture and the
velocity fling-settle are the deliberate exclusions, recorded in the
conformance file with the rest.
