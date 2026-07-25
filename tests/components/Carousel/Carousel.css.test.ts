import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  fileURLToPath(new URL('../../../src/components/Carousel/Carousel.css', import.meta.url)),
  'utf8',
)

describe('Carousel stylesheet contract', () => {
  it('reaches every registered role through its component variable', () => {
    for (const token of [
      'container-color',
      'item-shape',
      'item-container-color',
      'item-content-color',
      'item-spacing',
      'block-padding',
      'full-screen-item-spacing',
      'full-screen-padding',
      'focus-ring-width',
      'focus-ring-offset',
      'focus-ring-color',
      'state-layer-color',
      'disabled-content-opacity',
      'disabled-container-opacity',
    ]) {
      expect(css, token).toContain(`var(--m3e-comp-carousel-${token})`)
    }
  })

  it('reads the shared system state opacities rather than duplicating them', () => {
    expect(css).toContain('var(--m3e-sys-state-hover)')
    expect(css).toContain('var(--m3e-sys-state-focus)')
    expect(css).toContain('var(--m3e-sys-state-pressed)')
  })

  it('leaves the arrangement numbers to the layout engine, not the stylesheet', () => {
    // These four choose an arrangement rather than paint one, so they are read in
    // JavaScript. A stylesheet reference would be a second source of truth.
    for (const token of [
      'min-small-item-size',
      'max-small-item-size',
      'anchor-size',
      'medium-large-item-diff-threshold',
      'trailing-padding',
      'uncontained-trailing-padding',
    ]) {
      expect(css, token).not.toContain(`var(--m3e-comp-carousel-${token})`)
    }
  })

  it('makes the leading padding real only for the layout with no strategy', () => {
    // Every keyline layout folds its content padding into the shifted keyline
    // lists, exactly as the source does. The multi-aspect layout runs no
    // strategy, so there its padding is real padding.
    const multiAspectRule = css.slice(
      css.indexOf('  .m3e-carousel[data-m3e-layout="multiAspect"] {'),
      css.indexOf('  .m3e-carousel[data-m3e-layout="multiAspect"] .m3e-carousel__item {'),
    )
    expect(multiAspectRule).toContain(
      'padding-inline-start: var(--m3e-comp-carousel-leading-padding)',
    )
    expect(multiAspectRule).toContain(
      'scroll-padding-inline-start: var(--m3e-comp-carousel-leading-padding)',
    )
    // No other rule may add main-axis padding — the `scroll-padding` beside it is
    // the snapport inset, not a layout inset.
    expect(css.match(/(?<![-\w])padding-inline-start:/g)).toHaveLength(1)
  })

  it('lives entirely in the components layer under one namespace', () => {
    expect(css.startsWith('@layer m3e.components {')).toBe(true)
    const selectors = css.match(/^\s{2}[.a-z[][^{]*\{/gm) ?? []
    selectors.forEach((selector) => {
      expect(selector, selector).toMatch(/\.m3e-carousel|@media|::-webkit-scrollbar/)
    })
  })

  it('is the scroll container itself, with no main-axis padding of its own', () => {
    // The pinned source keeps main-axis content padding out of the Pager and
    // lets the strategy produce it, so real padding here would double it.
    expect(css).toContain('overflow: auto hidden')
    expect(css).toContain('padding-block: var(--m3e-comp-carousel-block-padding)')
    expect(css).not.toMatch(/\.m3e-carousel \{[^}]*padding-inline:/)

    // The same rule on the vertical layout, whose main axis is the block axis:
    // the strategy folds the full-screen padding into its keylines and snap
    // offsets, so only the cross-axis padding may be real.
    const blockRule = css.slice(
      css.indexOf('.m3e-carousel[data-m3e-axis="block"] {'),
      css.indexOf('.m3e-carousel[data-m3e-scroll="snap"]'),
    )
    expect(blockRule).toContain('padding-block: 0')
    expect(blockRule).toContain(
      'padding-inline: var(--m3e-comp-carousel-full-screen-padding)',
    )
  })

  it('snaps on the axis the layout scrolls', () => {
    expect(css).toContain('scroll-snap-type: x mandatory')
    expect(css).toContain('scroll-snap-type: y mandatory')
    expect(css).toContain('scroll-snap-align: start')
    // The keyline snap offset arrives as a scroll margin, which is what makes
    // `getSnapPositionOffset` native rather than simulated.
    expect(css).toContain('scroll-margin-inline-start: var(--m3e-carousel-item-snap)')
    expect(css).toContain('scroll-margin-block-start: var(--m3e-carousel-item-snap)')
  })

  it('masks with a clip path and pins edges with a translation', () => {
    expect(css).toContain('clip-path: inset(')
    expect(css).toContain('translate: var(--m3e-carousel-item-translate)')
  })

  it('rounds the mask, so an item keeps its shape at every masked size', () => {
    // `rememberMaskShape` creates the item shape at the mask rect's size and
    // translates it to the mask's origin, so the corner radius belongs to the
    // clipped rectangle. A bare `inset()` cuts a sharp-cornered rectangle
    // through `border-radius` and every masked item renders square.
    // Matched to the declaration's `;` rather than the first `)`, which belongs
    // to the nested `var()`, not to `inset()`.
    const masks = css.match(/clip-path: inset\([\s\S]*?\);/g) ?? []
    expect(masks).toHaveLength(3) // inline, inline-rtl, block
    masks.forEach((mask) => {
      expect(mask, mask).toContain('round var(--m3e-comp-carousel-item-shape)')
    })
  })

  it('keeps the mask off the item box, so the snap area is not transformed', () => {
    // A transform is part of an element's scroll-snap area. Masking the item box
    // would move the position the browser snaps to, and mandatory snapping would
    // chase a target the mask keeps moving.
    expect(css).toContain(
      '.m3e-carousel__item[data-m3e-axis="inline"] > .m3e-carousel__item-content',
    )
    expect(css).not.toMatch(/\.m3e-carousel__item\[data-m3e-axis="inline"\] \{/)
    const itemRule = css.slice(
      css.indexOf('  .m3e-carousel__item {'),
      css.indexOf('  .m3e-carousel[data-m3e-axis="block"] .m3e-carousel__item {'),
    )
    // The resting custom properties live here; the properties that would build a
    // transform or a painted surface do not.
    expect(itemRule).not.toMatch(/^ {4}clip-path:/m)
    expect(itemRule).not.toMatch(/^ {4}translate:/m)
    expect(itemRule).not.toMatch(/^ {4}background/m)
  })

  it('mirrors the logical mask and translation in right-to-left', () => {
    expect(css).toContain('.m3e-carousel__item[data-m3e-axis="inline"]:dir(rtl)')
    expect(css).toContain('translate: calc(-1 * var(--m3e-carousel-item-translate))')
  })

  it('authors the resting state, so an unmeasured carousel is not an undefined one', () => {
    // Pager defaults a page to the whole viewport when no strategy is valid, and
    // every value the passes write has a resting declaration here rather than a
    // fallback repeated at each use.
    expect(css).toContain('--m3e-carousel-item-size: 100%')
    expect(css).toContain('flex: 0 0 var(--m3e-carousel-item-size)')
    for (const property of [
      'inset-start',
      'inset-end',
      'translate',
      'parallax',
      'snap',
      'z',
      'aspect',
    ]) {
      expect(css, property).toContain(`--m3e-carousel-item-${property}:`)
    }
  })

  it('translates only the media box for the multi-aspect parallax', () => {
    expect(css).toContain(
      '.m3e-carousel[data-m3e-layout="multiAspect"] .m3e-carousel__item-media',
    )
    expect(css).toContain('translate: var(--m3e-carousel-item-parallax)')
  })

  it('withdraws the mask and the parallax under reduced motion', () => {
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(reduced).toContain('clip-path: none')
    expect(reduced).toContain('translate: none')
  })

  it('keeps items and focus visible in forced colors', () => {
    const forced = css.slice(css.indexOf('@media (forced-colors: active)'))
    expect(forced).toContain('CanvasText')
    expect(forced).toContain('Highlight')
    expect(forced).toContain('GrayText')
  })

  it('exposes the size buckets the adaptive-content rule needs', () => {
    expect(css).toContain('[data-m3e-size="medium"]')
    expect(css).toContain('[data-m3e-size="small"]')
  })

  it('stops item content from enlarging the item past the arrangement size', () => {
    // A flex item's automatic minimum size is its content's, so `flex: 0 0 <size>`
    // alone lets nowrap content widen the box — and every snap offset the engine
    // writes is derived from that size. Caught in the browser audit as a carousel
    // resting 28.4px off its keyline, which no jsdom test can see.
    const item = css.slice(css.indexOf('.m3e-carousel__item {'))
    const declarations = item.slice(0, item.indexOf('}'))
    expect(declarations).toContain('min-inline-size: 0')
    expect(declarations).toContain('min-block-size: 0')
  })
})
