# ADR 0040: Carousel as one export, two ported layout engines, and a specification-sourced token registry

Status: accepted; decision 6 corrected three times — the mask shape by T50, the
size bucket by T54, and the adaptive-content switch by T55 (2026-07-26) — and
the paint pass's stacking contained by T57 (2026-08-04, see Corrections)
Date: 2026-07-25
Task: T48

## Context

Carousel is catalog row 7 and the fourth composite of tranche C. The pinned
revision is `a90df2fc27e026b9ad2ed569f203a260c1041fab`: all nineteen carousel
files — nine implementation files and ten test files — were fetched at that
revision and at `androidx-main` HEAD
(`25daaa71c1e9309a7f0d7df1bde73c6d2d5ef6d7`, 2026-07-24). Twelve are
byte-identical. Seven differ by Kotlin explicit-API `public` modifiers, four
explicit return types, and the one-line
`createComposeRule(StandardTestDispatcher())` → `createComposeRule()` change T47
already classified. Nothing is added, removed, or renamed, so the pin holds and
the delta is classified rather than re-pinned (the T44 rule), extending the
unified snapshot for a fifth consecutive task.

Five facts shaped the decisions below.

**The three public composables differ by one argument.** `HorizontalMultiBrowseCarousel`,
`HorizontalUncontainedCarousel`, and `HorizontalCenteredHeroCarousel` all delegate
to one `internal fun Carousel`, passing a different `keylineList` lambda and a
different `maxNonFocalVisibleItemCount`. Everything else — the pager, the item
modifier, the snap position, the semantics — is shared.

**The design site names six layouts; the source implements four arrangements.**
The specs page enumerates Multi-browse, Uncontained, Uncontained multi-aspect
ratio, Hero, Center-aligned hero, and Full-screen. The source has three keyline
builders (`multiBrowseKeylineList`, `uncontainedKeylineList`, `heroKeylineList`
with an `isCentered` flag) plus a separate aspect-ratio engine in
`MultiAspectCarousel.kt`. Full-screen has no builder of its own: it is the
uncontained arrangement at exactly the container size, on the block axis, which
the pinned `UncontainedTest.testLargeItem_withFullCarouselWidth` demonstrates
produces `[anchor, full-size, anchor]`.

**The layout is a real algorithm, not a set of measurements.** `Arrangement`
searches permutations of large/medium/small counts and scores them;
`KeylineList` places them around a pivot; `Strategy` derives the shifted lists
that let the first and last items reach a focal position; `KeylineSnapPosition`
turns those into per-item snap offsets. 62 of the 88 pinned test cases are
JVM host tests over exactly this code, with concrete expected values.

**Nothing in the family is themed upstream.** Listing
`commonMain/kotlin/androidx/compose/material3/tokens/` at the pinned revision and
at HEAD returns **no `CarouselTokens.kt`**. Every previous family task in this
library was built around partitioning a generated token file into roles the
implementation reads and roles it does not. Carousel has no such file. Its numbers
live in `CarouselDefaults`, in private constants, and in the design
specification's own measurement tables.

**Scroll-driven CSS animations are outside the browser baseline.**
`animation-timeline: view()` would express the masking declaratively, but it is
unavailable in Firefox 121 and Safari 17.2, both of which T01 pins as minimums.

## Decisions

### 1. One export with a six-value `layout` prop

`Carousel` is the only export. `layout` spans `multiBrowse` (default),
`uncontained`, `multiAspect`, `hero`, `centeredHero`, and `fullScreen`.

Three composables that differ in one argument are one component with one prop,
the same reduction ADR 0037 made for bottom sheets and ADR 0039 for search. The
prop then also carries the three layouts the source has no composable for, so the
public surface matches the specification's own enumeration rather than the
source's file layout.

Per-layout arguments are enforced by a discriminated union rather than by
runtime validation: `preferredItemWidth` exists only on `multiBrowse`, `itemWidth`
only on `uncontained`, `maxItemWidth` only on the hero layouts, and `aspectRatio`
only on `multiAspect` items. TypeScript rejects the rest.

### 2. Items are a data-driven collection

`items` is an array of descriptors rather than a render prop, matching `Tabs`,
`NavigationBar`, `SegmentedButtonGroup`, and `Menu`. The source's
`content: @Composable CarouselItemScope.(itemIndex: Int) -> Unit` exists to give
each item its scope; the web equivalents of that scope are CSS custom properties
on the item, so the callback has nothing left to deliver.

### 3. Both engines are genuinely ported

`Arrangement`, `KeylineList`, `Keylines`, `Strategy`, and `KeylineSnapPosition`
are ported to TypeScript in private modules, and `MultiAspectCarousel.kt`'s
mask/parallax/intensity math beside them. Approximating either would have been
cheaper and wrong: the arrangement search, the shift steps, and the snap offsets
are what make a carousel a carousel rather than a scroller with rounded corners.

The port is literal apart from what the platform forces: the density parameter is
gone because CSS pixels are already pixels; `KeylineList` is an object with a
`keylines` array instead of a delegating Kotlin `List`; and `hashCode` becomes a
deterministic string key, because JavaScript has no hashCode contract while the
pinned equality tests do assert on one.

All 62 pinned host cases are ported with their upstream expected values,
including the exact offset arrays such as `[-101, 93, 287, 481, 675]`. They passed
on the first run of the finished port, which is the evidence that the arrangement
math is the source's rather than a reconstruction.

One deliberate divergence: `roundToNearestStep`'s tie-breaking. The pinned
mid-step case lands at 0.50000006 in the source's `Float` and 0.4999999999999999
in a double, so a plain round disagrees with the source at exactly that point. The
port compares with a tolerance, keeping the sourced behavior rather than making it
depend on which precision produced the number. Nothing in the pinned
implementation passes the flag — `Modifier.carouselItem` and the debug overlay both
take the default — so it exists for the pinned tests alone.

### 4. The scroll container is the browser's; snapping is CSS

Items lay out end-to-end at the focal size, which is exactly the size Pager gives
every page, so gesture, wheel, momentum, keyboard scrolling, right-to-left, and
scrollbar accessibility come from the platform.

`getSnapPositionOffset` maps exactly onto `scroll-margin-*` under
`scroll-snap-align: start`: a positive scroll margin places the item's edge that
many pixels after the snapport start, which is what the function returns. Keyline
snapping — including both shift ranges, where the offsets differ per item — is
therefore native.

`scroll` exposes the specification's own two named behaviors, `snap` and `free`,
defaulting per layout to the one it recommends. The three `flingBehavior`
factories are excluded: they describe post-gesture physics no web API exposes, so
`PagerSnapDistance.atMost(1)` cannot be reproduced at all. `userScrollEnabled` is
excluded for a stronger reason — a scroll container cannot refuse user scrolling
without breaking behavior the platform guarantees.

### 5. Masking is computed in JavaScript and applied as `clip-path` plus `translate`

The interpolated keyline is resolved per scroll frame and written as
`--m3e-carousel-item-inset-start/-end` and `--m3e-carousel-item-translate`. CSS
turns those into `clip-path: inset()` and `translate`, which compose the way the
source's layer clip and translation do: `clip-path` applies in the element's own
coordinate space, before its transform.

Writes are imperative, for the reason `useAppBarScroll` established in T46: a
React state update per frame would re-render every item to change one custom
property. React renders the resting structure and never revisits these
properties, so ownership does not conflict.

This is the decision most likely to age. When `animation-timeline: view()` reaches
the pinned baseline, the same keyline values could be expressed as a scroll-driven
animation and the frame loop deleted. Nothing in the public contract depends on
where the numbers are computed.

### 6. `CarouselItemDrawInfo` becomes custom properties and a size bucket

The source exposes `size`, `minSize`, `maxSize`, and `maskRect` to item content so
it can adapt, and warns that reading them in composition "will be recomposed on
every change causing potential performance issues".

On the web the same information is CSS: `--m3e-carousel-item-current-size`,
`--m3e-carousel-item-min-size`, `--m3e-carousel-item-max-size`, and
`data-m3e-size` of `large`/`medium`/`small`. Content marked
`data-m3e-carousel-hide="medium"` or `"small"` withdraws at those widths, which is
the specification's own adaptive rule — full title, hidden title, abbreviated
label — expressed without a render per frame. The warning the source has to give
does not apply, because there is nothing to recompose.

The `maskClip`/`maskBorder`/`rememberMaskShape` trio is excluded: all three hand a
Compose `Shape` back to the caller so it can clip its own subtree. The component
clips the item, and the item's own border radius shapes it.

> **Corrected by T50.** The last sentence was wrong, and it shipped a visible
> defect: `clip-path: inset()` without a `round` component clips a sharp-cornered
> rectangle straight through `border-radius`, so every *masked* item painted
> hard-square while focal items looked correct. `rememberMaskShape` builds the item
> shape at the mask rect's size and translates it to the mask's origin, which is
> exactly `inset(... round var(--m3e-comp-carousel-item-shape))`. The mask shape is
> therefore ported; only the two caller-facing modifiers remain excluded.

> **Corrected by T54.** `data-m3e-size` is this decision's own invention — the
> source publishes `size`/`minSize`/`maxSize` and leaves the classification to the
> caller — and it was normalised between the two published values. That is wrong,
> because `minItemSize` is the port of a computation that counts the **anchor**
> keylines, which are off screen at around 10px. An item therefore only classified
> as `small` below `anchor + 0.1 × (focal − anchor)`, which for the specification's
> small item of 40–56px needs a focal item of 310px or more — so the `small` bucket
> held nothing but anchors, the visible small item classified as `medium`, and
> content written for medium items rendered into a 37px box and painted as cropped
> glyph fragments. The bucket is now normalised between
> `Strategy.smallestVisibleItemSize` — the small keyline of the resting
> arrangement, also an addition with no counterpart in the source — and the focal
> size. The two published custom properties are unchanged, because they are the
> port and the port is right; only this decision's own derived value moved.
>
> **Corrected again by T55.** This decision expressed the adaptive rule as
> `display: none` at a bucket boundary, which pops. The reference fades:
> `FadingHorizontalMultiBrowseCarouselSample` in the pinned source drives content
> alpha from a `lerp` over the item's masked size, and Material's carousel
> documentation describes a title as pinned to the masking edge and faded out as the
> item becomes too small for it. `data-m3e-carousel-hide` now fades, computed in CSS
> from three unitless properties the paint pass writes —
> `--m3e-carousel-item-visible-size`, `--m3e-carousel-item-bucket-min`, and
> `--m3e-carousel-item-bucket-range`, unitless because `calc()` cannot divide by a
> length. Each marker names the width its content must be gone by and fades over the
> half of the range above it. Only that halving remains an interpretation, like the
> bucket boundaries above.
>
> The discrete reading of the rule had to go, and it is arithmetic rather than a
> judgement call: `large` and `medium` are adjacent bands, so "opaque throughout
> large, clear throughout medium" leaves no width at all to fade across. What the
> rule is *for* is preserved — full content on a focal item, the title gone by a
> medium one, nothing on a small one — and the rendering audit now checks that
> outcome by effective visibility while separately sweeping the scroll range to
> assert something is mid-fade, since the outcome checks alone pass against a switch
> too. An earlier attempt drove the fade from each element's measured width instead;
> it produced the wrong ordering at the widths that matter and is recorded in T55.
>
> The same task pinned the item box with `min-inline-size: 0`/`min-block-size: 0`.
> A flex item's automatic minimum size is its content's, so `flex: 0 0 <size>` did
> not actually guarantee the arrangement's size: `white-space: nowrap` content
> widened the item and invalidated every snap offset derived from it. The source
> measures items with the strategy's size as a fixed constraint, so this restores a
> guarantee the port had silently dropped rather than adding a new constraint.

### 7. An explicit item window replaces `beyondViewportPageCount`

The source composes `maxNonFocalVisibleItemCount` items past the viewport and no
more, so `Modifier.carouselItem`'s out-of-bounds translation — which divides a
distance by a masked size — is only ever evaluated for a near neighbour.

Every item is in the DOM here, because taking off-screen items out of the document
would take them out of the tab order and break the specification's "Tab moves to
the next carousel item". So the same window is applied explicitly: items inside it
are masked and translated, and items outside it keep their natural position,
off-screen and clipped by the scroller, still focusable. Applying the mask to a
distant item would place a sliver at the container edge and, through that
division, inflate the scrollable area.

### 8. The APG carousel pattern replaces `Role.Carousel`

There is no ARIA `carousel` role. The source's `Role.Carousel` and the
accessibility page's "container role" both resolve to the WAI-ARIA Authoring
Practices carousel pattern: the container is a `group` with
`aria-roledescription="carousel"`, and each item is a `group` with
`aria-roledescription="slide"` labelled `"{name}, {n} of {total}"` — literally the
page's "the label reads out the total amount of items and the current item in
focus".

Actionable items are real `button` or `a` elements, so "Space or Enter activates
the focused carousel item" and scroll-into-view on focus are the browser's.
Left/Right (logical), `Home`, and `End` move by item. `Up` and `Down` are
deliberately not intercepted on a horizontal carousel: the page's "use the up and
down arrow keys to leave the carousel" is a screen-reader idiom, and on the web
leaving is `Tab`, so swallowing those keys would only break page scrolling.

The container takes a tab stop **only when no item is actionable**. This is a
knowing deviation from "avoid focusing on the carousel container": at the pinned
browser baseline a scroll container is not keyboard-reachable unless something in
it is focusable, so a carousel of passive images would otherwise have no keyboard
route at all. With actionable items the container takes no tab stop, which is what
the guidance asks for.

### 9. Reduced motion withdraws the masking entirely

Under `prefers-reduced-motion: reduce` nothing is masked, translated, or
parallaxed, and no size bucket is written: every item stays at its focal size.
That is the accessibility page's requirement — "the parallax effect should be
removed and carousel items should no longer expand as they come into view. All
items are the same size." Because the leading and trailing padding are produced by
the shifted keyline lists rather than by real padding, items also reach the
container edges, which is the same page's second requirement, at no extra cost.

### 10. The token registry is sourced from `CarouselDefaults` and the specification

With no generated token file, the registry draws on the two first-party sources
that do describe the family:

- **`CarouselDefaults` and the private constants beside it** supply the four
  numbers the implementation reads: `MinSmallItemSize` (40dp),
  `MaxSmallItemSize` (56dp), `AnchorSize` (10dp), and
  `MediumLargeItemDiffThreshold` (0.85). These are registered because they choose
  an *arrangement*: a theme that raises the small-item range changes the layout,
  not only its paint. `AnchorSize` is `internal` upstream and registered anyway,
  because it determines how far items travel past both container edges and is a
  layout number a theme should be able to change.
- **The design specification's measurement tables** supply what only the design
  owns: the 28dp item corner, the 16dp leading/trailing and 8dp block padding, the
  8dp gap, the uncontained layouts' leading-only padding, the full-screen 0dp/16dp
  pair, and the `surface` container colour.

Two supporting decisions. `item-shape` is registered as a reference to
`cornerExtraLarge` rather than a literal `28px`, because that system role already
carries exactly this value and a theme that reshapes its corners should reshape
carousel items too. And `uncontained-trailing-padding` is registered as `0px`
rather than omitted, so one variable answers the padding question for every
layout instead of the absence of a variable meaning something.

The four arrangement numbers are read in JavaScript, from the resolved custom
properties, and the stylesheet deliberately never references them. A value with
two readers would have two sources of truth; `Carousel.css.test.ts` enforces the
split.

### 11. Excluded, with reasons

- **Predictive back** and **window insets** — Android system concerns.
- **`flingBehavior`, `rememberSplineBasedDecay`** — post-gesture physics the
  browser owns; see decision 4.
- **`userScrollEnabled`** — see decision 4.
- **`CarouselState.Saver`** — Android instance-state restoration; the web restores
  scroll position itself.
- **`CarouselItemScope.maskClip`/`maskBorder`/`rememberMaskShape`** — see
  decision 6. *Corrected by T50: the mask shape `rememberMaskShape` computes is
  ported; the two caller-facing modifiers remain excluded.*
- **`Modifier.drawDebugLines`** — a development aid that draws keylines over a
  carousel.
- **`MultiAspectCarouselItemDrawInfo(LazyGridState)`** — a Compose grid layout;
  the multi-aspect layout here is one scroll container, and a grid of carousels is
  a consumer composition.
- **The Compose animation specs** — expressed as semantic motion roles, the
  library-wide rule.
- **`CarouselAlignment.End`** — reachable in the ported builder and exercised by
  the pinned `KeylineTest`, but no layout selects it: the specification names
  start-aligned and center-aligned only.

## Consequences

Row 7 moves from Planned to Conformant with one export. The catalog's six
carousel layouts are all implemented, so the family needs no follow-up task, and
the "Show all" affordance the accessibility page requires is a documented recipe
rather than an export.

The library gains its first ported *algorithm* rather than ported measurements.
That is a new kind of maintenance: a future upstream change to `Arrangement` or
`Strategy` is a change to behavior the pinned host tests will catch, because those
62 cases are now this library's tests too. It is also the first family whose token
provenance is partly the design site rather than a generated file, and
`TOKEN_PROVENANCE.md` records that exception explicitly so it is not read as a
precedent for skipping a token file that does exist.

The masking frame loop is the one part of this design with a known expiry. It
exists because `animation-timeline: view()` is outside the pinned baseline, and
nothing in the public contract would change if it were replaced.

## Corrections (T57, 2026-08-04)

The paint pass translates the source's fractional focal `Modifier.zIndex` onto
integer CSS `z-index` values up to 1000 — but ported only the values, not
their scope. In Compose, `Modifier.zIndex` compares siblings inside the same
layout node and nothing else; CSS `z-index` participates in the nearest
*stacking context*, and `.m3e-carousel` (positioned, `z-index: auto`) created
none, so the item levels joined the page's root stacking context. Any
consumer chrome below `z-index: 1000` lost to a carousel scrolled beneath
it — the documentation site's sticky bar, at `z-index: 20`, was the reported
instance: 16 of 16 `elementFromPoint` samples inside the bar's box returned
carousel content on the unrepaired build.

The repair is one declaration, `isolation: isolate` on `.m3e-carousel`,
which creates the stacking context the source's sibling-scoped ordering
implied all along; the internal parallax overlap is unchanged and the
carousel joins the page's paint order as ordinary content. A z-index survey
of the rest of the library found no second instance of the class: every
other in-flow component's internal layering stays at `z-index` 1–3, below
any plausible chrome level, and `Menu`'s 1000 is a portaled overlay that is
*supposed* to beat page chrome. Pinned by a stylesheet-contract test and a rendering-audit probe
that lays a `z-index: 20` chrome stand-in over the carousel and requires it
to win every sample — proven against the unrepaired build (16/16 leak hits)
and the repaired one (0/16).
