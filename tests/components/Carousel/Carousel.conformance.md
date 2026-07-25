# Carousel conformance

Task: T48
Status: conformant
Reviewed: 2026-07-25

## Primary references

- Material 3 Carousel overview, accessed 2026-07-25:
  <https://m3.material.io/components/carousel/overview>
- Material 3 Carousel specs, accessed 2026-07-25:
  <https://m3.material.io/components/carousel/specs>
- Material 3 Carousel guidelines, accessed 2026-07-25:
  <https://m3.material.io/components/carousel/guidelines>
- Material 3 Carousel accessibility, accessed 2026-07-25:
  <https://m3.material.io/components/carousel/accessibility>
- Pinned `Carousel.kt`, accessed 2026-07-25:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/carousel/Carousel.kt>
- Pinned `Keylines.kt`, `KeylineList.kt`, `Strategy.kt`, `Arrangement.kt`,
  `KeylineSnapPosition.kt`, `CarouselState.kt`, `CarouselItemScope.kt`, and
  `MultiAspectCarousel.kt`, accessed 2026-07-25, in the same
  `.../material3/carousel/` directory.
- WAI-ARIA Authoring Practices, carousel pattern, accessed 2026-07-25:
  <https://www.w3.org/WAI/ARIA/apg/patterns/carousel/>
- CSS Scroll Snap Module Level 1, accessed 2026-07-25:
  <https://www.w3.org/TR/css-scroll-snap-1/>

Supported baseline: AndroidX Material 3 revision
`a90df2fc27e026b9ad2ed569f203a260c1041fab` — the reference snapshot T44 adopted
and T45/T46/T47 extended. All nineteen pinned carousel files were fetched at that
revision and at `androidx-main` HEAD
(`25daaa71c1e9309a7f0d7df1bde73c6d2d5ef6d7`, committed 2026-07-24). Twelve are
byte-identical. Seven differ non-substantively: four implementation files gained
Kotlin explicit-API `public` modifiers plus explicit return types on
`CarouselDefaults.MinSmallItemSize`, `MaxSmallItemSize`,
`CarouselState.scrollToItem`, and `animateScrollToItem`; three test files carry
the same one-line `createComposeRule(StandardTestDispatcher())` →
`createComposeRule()` change T47 classified. Nothing is added, removed, or
renamed, so the pin holds and the delta is classified rather than re-pinned (the
T44 rule).

**No generated token file exists.** Listing
`commonMain/kotlin/androidx/compose/material3/tokens/` at the pinned revision and
at HEAD returns no `CarouselTokens.kt`. Carousel is the first family in this
library with no generated roles to partition, and ADR 0040 records what stands in
for them.

## Family boundary

One export, `Carousel`, covers the whole family. The source's three
`Horizontal*Carousel` composables are thin wrappers over one internal `Carousel`
that differ in exactly one argument — the keyline function — so they become a
`layout` prop, the reduction ADR 0037 made for bottom sheets and ADR 0039 for
search. `layout` spans all six layouts the specification's own measurement tables
enumerate:

| Layout | Engine | Sourced arrangement |
| --- | --- | --- |
| `multiBrowse` (default) | keyline | `multiBrowseKeylineList`: at least one large, medium, and small item |
| `uncontained` | keyline | `uncontainedKeylineList`: same-size items plus one cut-off trailing item |
| `multiAspect` | aspect ratio | `MultiAspectCarousel.kt`: each item sized by its own ratio |
| `hero` | keyline | `heroKeylineList(isCentered = false)` |
| `centeredHero` | keyline | `heroKeylineList(isCentered = true)` |
| `fullScreen` | keyline | `uncontainedKeylineList` at exactly the container size, on the block axis |

The accessibility page's "Show all" requirement — a button below the carousel, or
an arrow beside a header, giving a non-horizontal route to every item — is a
tested recipe composing public `Button`/`IconButton`, matching the pinned
`CarouselWithShowAllButtonSample`. It adds no export.

## Public-source surface ledger

Frozen in `Carousel.source.test.ts` at parameter granularity: 82 entries covering
three composables, `CarouselDefaults` and its three fling factories and two size
constants, `CarouselState` with its constructor, scroll members, and saver,
`rememberCarouselState`, both draw-info interfaces, `CarouselItemScope`, and the
whole experimental multi-aspect surface. **The family ships no deprecated API** at
either revision — the first family task whose deprecated ledger is empty.

The internal engine is reproduced rather than exposed: `Arrangement`,
`KeylineList`, `Keylines`, `Strategy`, `KeylineSnapPosition`, and the multi-aspect
mask/parallax functions live in private modules the barrel never re-exports.

## Sourced-number ledger

With no generated token file, the registry draws on two first-party sources.

Read by the pinned implementation, from `CarouselDefaults` and the constants
beside it:

| Source | Token | Value |
| --- | --- | --- |
| `CarouselDefaults.MinSmallItemSize` | `min-small-item-size` | 40px |
| `CarouselDefaults.MaxSmallItemSize` | `max-small-item-size` | 56px |
| `CarouselDefaults.AnchorSize` (internal) | `anchor-size` | 10px |
| `CarouselDefaults.MediumLargeItemDiffThreshold` | `medium-large-item-diff-threshold` | 0.85 |

Owned by the design specification's measurement tables:

| Specification attribute | Token | Value |
| --- | --- | --- |
| Item corner radius | `item-shape` | `cornerExtraLarge` (28px) |
| Leading/trailing padding | `leading-padding`, `trailing-padding` | 16px |
| Top/bottom padding | `block-padding` | 8px |
| Padding between elements | `item-spacing` | 8px |
| Uncontained trailing padding | `uncontained-trailing-padding` | 0px |
| Full-screen padding | `full-screen-padding` | 0px |
| Full-screen padding between elements | `full-screen-item-spacing` | 16px |
| Container colour | `container-color` | `surface` |

The four arrangement numbers are read in JavaScript rather than CSS, because they
choose an arrangement instead of painting one; the stylesheet deliberately never
references them, which `Carousel.css.test.ts` enforces so there is one source of
truth per value.

## Pinned test ledger

88 `@Test` methods across ten files, frozen by name.

- **62 host tests** over the layout engine — `ArrangementTest`, `KeylineTest`,
  `StrategyTest`, `KeylineSnapPositionTest`, `MultiBrowseTest`,
  `UncontainedTest`, `CenteredHeroTest` — are ported case for case into
  `Carousel.keylines.test.ts` and `Carousel.strategy.test.ts` with their upstream
  expected values, including the exact offset arrays.
- **26 device tests** run a Compose harness with no web equivalent. Each has a
  recorded disposition: a named local case, a stylesheet contract, an engine
  case, a rendering-audit probe, or an exclusion with its reason.

## Anatomy and slots

- **Container** — the scroll container itself. `surface`, 8px block padding, no
  main-axis padding: the source keeps main-axis content padding out of the Pager
  and lets the strategy produce it, so real padding here would double it.
- **Item** — a slide box at the focal size, 28px corners, clipped to its
  interpolated keyline. `content` is the item's visual; `label` names it;
  `onActivate`/`href` make it a real `button`/`a`; `disabled` marks it
  unavailable.
- **Item text** — not a slot. The specification treats item text as content that
  adapts to the item's width, so it is expressed through the size buckets below
  rather than through a fixed slot.

## Sizes, states, and the adaptive-content rule

The three widths the anatomy names reach content as `data-m3e-size` of `large`,
`medium`, or `small`, beside `--m3e-carousel-item-current-size`,
`--m3e-carousel-item-min-size`, and `--m3e-carousel-item-max-size`. Content marked
`data-m3e-carousel-hide="medium"` or `"small"` withdraws at those widths, which is
the specification's own rule: the large item shows the full title, the medium item
hides it, the small item abbreviates the label.

The bucket is normalised between the **small keyline's** size and the focal size,
not between `--m3e-carousel-item-min-size` and `--m3e-carousel-item-max-size`.
Those two are the port of the source's `minItemSize`/`maxItemSize` and are
published unchanged, and `minItemSize` counts the **anchor** keylines, which sit
off screen at around 10px. Normalising against the anchor makes the `small` bucket
unreachable for the specification's small item, fixed at 40–56px: it would require
a focal item of 310px or more. `Strategy.smallestVisibleItemSize` is the floor the
bucket uses, taken from the resting arrangement so the boundary does not move as
the keyline list shifts. It has no counterpart in the source, because the source
publishes the three sizes and leaves the classification to the caller.

An item's box is also pinned to the arrangement's size in both axes
(`min-inline-size: 0`, `min-block-size: 0`). A flex item's automatic minimum size
is its content's, so without that a caption with `white-space: nowrap` widens the
item past the size every snap offset was derived from. The source is not reachable
this way: it measures items with the strategy's size as a fixed constraint and
clips content that does not fit.

States are enabled, hovered, focused, pressed, and disabled, exactly the specs
page's list. Hover, focus, and pressed paint the shared `--m3e-sys-state-*`
opacities over the item; disabled dims the content and the container by the
registered opacities and disables the native control.

## DOM structure and native behavior

```html
<div class="m3e-carousel" role="group" aria-roledescription="carousel"
     data-m3e-layout="multiBrowse" data-m3e-scroll="snap" data-m3e-axis="inline">
  <div class="m3e-carousel__item" data-m3e-carousel-item role="group"
       aria-roledescription="slide" aria-label="Sunrise, 1 of 8" data-m3e-size="large">
    <button class="m3e-carousel__item-content" type="button" aria-label="Sunrise">…</button>
  </div>
</div>
```

The container is a real scroll container, so gesture, wheel, momentum, keyboard
scrolling, RTL, and scrollbar accessibility are the browser's. Snapping is CSS
scroll-snap: `getSnapPositionOffset` maps exactly onto `scroll-margin-*` under
`scroll-snap-align: start`, so keyline snapping — including both shift ranges — is
native rather than simulated. Masking is `clip-path: inset()` plus `translate`,
which is what `placeWithLayer(clip = …, translationX = …)` composes.

Masking runs in JavaScript because `animation-timeline: view()` is outside the
pinned browser baseline. Writes are imperative for the reason
`useAppBarScroll` established: a React state update per scroll frame would
re-render every item to change one custom property.

## Accessible name, role, state, and keyboard interaction

There is no ARIA `carousel` role, so `Role.Carousel` and the specification's
"container role" both resolve to the APG carousel pattern. The container is a
`group` with `aria-roledescription="carousel"`, named by the consumer's
`aria-label`/`aria-labelledby`. Each item is a `group` with
`aria-roledescription="slide"` labelled `"{name}, {n} of {total}"`, which is the
specification's "the label reads out the total amount of items and the current
item in focus".

| Key | Behavior |
| --- | --- |
| `Tab` | Moves to the next actionable item; the browser scrolls it into view |
| `ArrowRight`/`ArrowLeft` (logical) | Moves to the next/previous item |
| `ArrowDown`/`ArrowUp` | Moves items in the full-screen layout; otherwise left to the page |
| `Home`/`End` | Moves to the first/last item |
| `Space`/`Enter` | Activates the focused item, natively |

The container takes a tab stop only when no item is actionable. At the pinned
browser baseline a scroll container is not keyboard-reachable unless something in
it is focusable, so a carousel of passive images would otherwise have no keyboard
route at all. With actionable items it takes none, which is what "avoid focusing
on the carousel container" asks for.

## Motion and reduced motion

Masks track the scroll position exactly rather than animating, so there is no
transition to slow. Programmatic movement — a controlled `currentItem`, an arrow
key, `Home`/`End` — uses smooth scrolling and falls back to an instant jump when
reduced motion is preferred.

Under `prefers-reduced-motion: reduce` masking is withdrawn entirely: every item
stays at its focal size with no clip, no translation, and no parallax, and no
size bucket is written. That is the accessibility page's requirement — "the
parallax effect should be removed and carousel items should no longer expand as
they come into view. All items are the same size" — and because the leading
padding is produced by the masks, items also reach the container edges, which is
the same page's second requirement.

## Bidirectional and adaptive behavior

Keyline offsets, translations, and snap offsets are logical. `clip-path: inset()`
is physical, so a `:dir(rtl)` rule swaps the two insets and negates the
translation, which is exactly the source's `translationX = if (isRtl) -translation`.
The logical scroll offset is the magnitude of a right-to-left scroller's negative
inline offset.

The arrangement is recomputed from the container's own size on every resize
observation, so the specification's responsive rule — more items as the container
grows — is a consequence of the engine rather than a breakpoint table.

## Known web-specific deviations

- **Fling behavior is the browser's.** All three `flingBehavior` factories
  describe post-gesture physics no web API exposes, so `PagerSnapDistance.atMost(1)`
  cannot be reproduced. `scroll` exposes the specification's own two named
  behaviors instead: `snap` and `free`.
- **`userScrollEnabled` is excluded.** A scroll container cannot refuse user
  scrolling without breaking wheel, drag, and keyboard behavior the platform
  guarantees.
- **The `CarouselItemScope` modifiers are excluded, but the mask shape they compute
  is ported.** `maskClip` and `maskBorder` hand a Compose `Shape` back to the caller
  to clip its own subtree, which item content does not need here. The shape
  `rememberMaskShape` builds — the item shape created at the *mask rect's* size and
  translated to its origin — is ported as `inset(... round
  var(--m3e-comp-carousel-item-shape))`, so a masked item keeps its full corner
  radius on all four corners. Relying on `border-radius` alone was a T50 defect: a
  bare `inset()` cuts a sharp-cornered rectangle through it.
- **`CarouselItemDrawInfo` becomes CSS custom properties** plus a size bucket, so
  the adaptive-content rule needs no per-frame React render.
- **An explicit item window replaces `beyondViewportPageCount`.** Compose composes
  only nearby pages, so its out-of-bounds translation never reaches a distant
  item. Every item is in the DOM here for focus order, so the window is applied
  explicitly and items outside it keep their natural, unmasked, still-focusable
  position — off-screen and clipped by the scroller.
- **The maximum scroll offset is measured, not derived.** The container's own
  `scrollWidth - clientWidth` is the same quantity as
  `calculateMaxScrollOffset`, so the end shift completes exactly where the
  browser stops.
- **The focal item size is fractional.** Pager rounds it because it measures in
  whole pixels; CSS accepts a fractional length, so the arrangement fits the
  container exactly.
- **"Up and down leave the carousel" becomes `Tab`.** That instruction is a
  screen-reader idiom; swallowing those keys on the web would break page
  scrolling.
- **`roundToNearestStep` ties are compared with a tolerance.** The pinned mid-step
  case sits exactly on the rounding boundary and lands at 0.50000006 in the
  source's `Float` and 0.4999999999999999 in a double, so the tie-breaking is
  compared with a tolerance rather than left to whichever precision produced the
  number. Nothing in the pinned implementation passes the flag; it exists for the
  pinned tests.
- **Mask intensity excludes its own boundaries.** In `getMaskIntensity`, an item
  at exactly 16:9 or exactly 1:1 fails both strict comparisons and falls through
  to the lowest intensity. That is the source's behavior and is preserved
  deliberately.
