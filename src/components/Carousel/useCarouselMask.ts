import { useCallback, useEffect, useRef, type RefObject } from 'react'
import {
  carouselSizingDefaults,
  type CarouselSizingDefaults,
  heroKeylineList,
  keylineAfter,
  keylineBefore,
  keylinesEqual,
  type KeylineList,
  lerpKeyline,
  multiBrowseKeylineList,
  uncontainedKeylineList,
} from './keylines'
import {
  getMultiAspectMask,
  getMultiAspectParallax,
  getMultiAspectMinSize,
} from './multiAspect'
import {
  createStrategy,
  getProgress,
  getSnapPositionOffset,
  type Strategy,
  strategiesEqual,
} from './strategy'
import type { CarouselLayout } from './Carousel.types'

/**
 * Couples a carousel to its scroll container.
 *
 * The pinned source does this in a layout modifier that runs per frame: it asks
 * the strategy which keyline list belongs to the current scroll offset, finds the
 * interpolated keyline for each item's centre, and places the item with that
 * keyline's mask and translation. Compose can afford to do that in composition
 * because only the visible pages exist. On the web every item is in the DOM, so
 * the same work happens here against real scroll events and is written as
 * imperative style properties.
 *
 * Writes are imperative for the reason `useAppBarScroll` already establishes: a
 * React state update per frame would re-render every item to change one custom
 * property. React renders the resting structure and never revisits these
 * properties, so ownership does not conflict.
 *
 * The work splits in two. The layout phase rebuilds the strategy and writes the
 * values that only change with the container or the props — the focal item size
 * and each item's snap offset. The paint phase runs per scroll frame and writes
 * only masks, translations, stacking, and the focal index.
 */

/** Which side of the item a value applies to, before direction is resolved. */
interface ItemPaint {
  readonly insetStart: number
  readonly insetEnd: number
  readonly translate: number
  readonly parallax: number
  readonly size: number
  readonly minSize: number
  readonly maxSize: number
  /**
   * The range the size bucket is normalised between. Deliberately not `minSize`
   * and `maxSize`: those two are the port of the source's `minItemSize`/
   * `maxItemSize` and are published as-is, and `minItemSize` counts the off-screen
   * anchor keylines. See `Strategy.smallestVisibleItemSize`.
   */
  readonly bucketMinSize: number
  readonly bucketMaxSize: number
  readonly zIndex: number
}

export interface CarouselMaskOptions {
  readonly containerRef: RefObject<HTMLDivElement | null>
  readonly layout: CarouselLayout
  readonly itemCount: number
  readonly itemSpacing: number | undefined
  readonly preferredItemWidth: number | undefined
  readonly itemWidth: number | undefined
  readonly maxItemWidth: number | undefined
  readonly minSmallItemWidth: number | undefined
  readonly maxSmallItemWidth: number | undefined
  readonly onFocalItemChange: (index: number) => void
}

export interface CarouselMaskHandle {
  /** Scrolls the item at `index` to its snapped focal position. */
  readonly scrollToItem: (index: number, animate: boolean) => void
}

/** `beyondViewportPageCount` in the source: how far past the viewport to mask. */
const ITEM_WINDOW_MARGIN = 2

/**
 * Highest stacking value a focal item takes. The source gives the focal item a
 * fractional `zIndex` of `1 / (1 + distance)`; CSS `z-index` is an integer, so
 * the same ordering is expressed over a scaled range.
 */
const FOCAL_Z_INDEX = 1000

function readPx(styles: CSSStyleDeclaration, property: string, fallback: number): number {
  const raw = styles.getPropertyValue(property).trim()
  if (raw === '') return fallback
  const value = Number.parseFloat(raw)
  return Number.isFinite(value) ? value : fallback
}

function readNumber(styles: CSSStyleDeclaration, property: string, fallback: number): number {
  return readPx(styles, property, fallback)
}

/** Keyline layouts scroll the inline axis; the full-screen layout scrolls the block axis. */
function isVerticalLayout(layout: CarouselLayout): boolean {
  return layout === 'fullScreen'
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useCarouselMask(options: CarouselMaskOptions): CarouselMaskHandle {
  const latest = useRef(options)
  latest.current = options

  const strategyRef = useRef<Strategy | null>(null)
  const focalIndexRef = useRef(0)

  const itemsOf = useCallback((container: HTMLElement): HTMLElement[] => {
    return Array.from(container.querySelectorAll<HTMLElement>('[data-m3e-carousel-item]'))
  }, [])

  const readSizing = useCallback((container: HTMLElement): CarouselSizingDefaults => {
    const styles = getComputedStyle(container)
    const { minSmallItemWidth, maxSmallItemWidth } = latest.current
    return {
      minSmallItemSize:
        minSmallItemWidth ??
        readPx(
          styles,
          '--m3e-comp-carousel-min-small-item-size',
          carouselSizingDefaults.minSmallItemSize,
        ),
      maxSmallItemSize:
        maxSmallItemWidth ??
        readPx(
          styles,
          '--m3e-comp-carousel-max-small-item-size',
          carouselSizingDefaults.maxSmallItemSize,
        ),
      anchorSize: readPx(
        styles,
        '--m3e-comp-carousel-anchor-size',
        carouselSizingDefaults.anchorSize,
      ),
      mediumLargeItemDiffThreshold: readNumber(
        styles,
        '--m3e-comp-carousel-medium-large-item-diff-threshold',
        carouselSizingDefaults.mediumLargeItemDiffThreshold,
      ),
    }
  }, [])

  const readSpacing = useCallback((container: HTMLElement): number => {
    const { itemSpacing, layout } = latest.current
    if (itemSpacing !== undefined) return itemSpacing
    const styles = getComputedStyle(container)
    return layout === 'fullScreen'
      ? readPx(styles, '--m3e-comp-carousel-full-screen-item-spacing', 16)
      : readPx(styles, '--m3e-comp-carousel-item-spacing', 8)
  }, [])

  const readContentPadding = useCallback(
    (container: HTMLElement): { before: number; after: number } => {
      const { layout } = latest.current
      const styles = getComputedStyle(container)
      if (layout === 'fullScreen') {
        const padding = readPx(styles, '--m3e-comp-carousel-full-screen-padding', 0)
        return { before: padding, after: padding }
      }
      const before = readPx(styles, '--m3e-comp-carousel-leading-padding', 16)
      // The measurement tables give the uncontained layouts a leading padding
      // only: their items are meant to bleed past the trailing edge.
      const after =
        layout === 'uncontained'
          ? readPx(styles, '--m3e-comp-carousel-uncontained-trailing-padding', 0)
          : readPx(styles, '--m3e-comp-carousel-trailing-padding', 16)
      return { before, after }
    },
    [],
  )

  const buildKeylines = useCallback(
    (availableSpace: number, itemSpacing: number, sizing: CarouselSizingDefaults): KeylineList => {
      const { layout, itemCount, preferredItemWidth, itemWidth, maxItemWidth } = latest.current
      switch (layout) {
        case 'uncontained':
          return uncontainedKeylineList({
            carouselMainAxisSize: availableSpace,
            itemSize: itemWidth ?? 0,
            itemSpacing,
            sizing,
          })
        case 'hero':
        case 'centeredHero':
          return heroKeylineList({
            carouselMainAxisSize: availableSpace,
            maxItemSize: maxItemWidth ?? null,
            itemSpacing,
            itemCount,
            isCentered: layout === 'centeredHero',
            sizing,
          })
        case 'fullScreen':
          // One edge-to-edge item: the uncontained arrangement at exactly the
          // container size, which the pinned `UncontainedTest` shows produces
          // `[anchor, full-size, anchor]`.
          return uncontainedKeylineList({
            carouselMainAxisSize: availableSpace,
            itemSize: availableSpace,
            itemSpacing,
            sizing,
          })
        default:
          return multiBrowseKeylineList({
            carouselMainAxisSize: availableSpace,
            preferredItemSize: preferredItemWidth ?? 0,
            itemSpacing,
            itemCount,
            sizing,
          })
      }
    },
    [],
  )

  const logicalScrollOffset = useCallback((container: HTMLElement): number => {
    if (isVerticalLayout(latest.current.layout)) return container.scrollTop
    // Right-to-left scrollers report a negative inline offset, so the logical
    // offset is its magnitude.
    return Math.abs(container.scrollLeft)
  }, [])

  const maxScrollOffsetOf = useCallback((container: HTMLElement): number => {
    return isVerticalLayout(latest.current.layout)
      ? Math.max(0, container.scrollHeight - container.clientHeight)
      : Math.max(0, container.scrollWidth - container.clientWidth)
  }, [])

  /** Where the container rests when the item at `index` is snapped. */
  const restOffsetOf = useCallback((strategy: Strategy, index: number, itemCount: number): number => {
    const itemSizeWithSpacing = strategy.itemMainAxisSize + strategy.itemSpacing
    return index * itemSizeWithSpacing - getSnapPositionOffset(strategy, index, itemCount)
  }, [])

  const paint = useCallback(() => {
    const container = latest.current.containerRef.current
    if (container === null) return
    const strategy = strategyRef.current
    const items = itemsOf(container)
    const { layout, itemCount, onFocalItemChange } = latest.current
    const vertical = isVerticalLayout(layout)

    if (layout === 'multiAspect') {
      paintMultiAspect(container, items, vertical)
      return
    }

    if (strategy === null || !strategy.isValid || prefersReducedMotion()) {
      // No arrangement to apply, or the accessibility guidance's reduced-motion
      // state: every item stays at its focal size with no mask and no parallax.
      items.forEach(clearItemPaint)
      return
    }

    const scrollOffset = logicalScrollOffset(container)
    const maxScrollOffset = maxScrollOffsetOf(container)
    const keylines = strategy.getKeylineListForScrollOffset(scrollOffset, maxScrollOffset)
    const itemSize = strategy.itemMainAxisSize
    const itemSizeWithSpacing = itemSize + strategy.itemSpacing
    const availableSpace = strategy.availableSpace

    // Track the nearest resting position rather than deriving it from a page
    // index the browser does not keep.
    let nearestIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY
    for (let index = 0; index < itemCount; index += 1) {
      const distance = Math.abs(restOffsetOf(strategy, index, itemCount) - scrollOffset)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = index
      }
    }
    if (nearestIndex !== focalIndexRef.current) {
      focalIndexRef.current = nearestIndex
      onFocalItemChange(nearestIndex)
    }

    // The source composes only `beyondViewportPageCount` items past the
    // viewport, so its out-of-bounds translation never applies to a distant
    // item. Every item exists here, so the same window is applied explicitly:
    // items outside it keep their natural position, off-screen and clipped by
    // the scroller, and stay focusable so Tab still reaches them.
    const firstIndex = Math.max(0, Math.floor(scrollOffset / itemSizeWithSpacing) - ITEM_WINDOW_MARGIN)
    const lastIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollOffset + availableSpace) / itemSizeWithSpacing) + ITEM_WINDOW_MARGIN,
    )

    items.forEach((item, index) => {
      if (index < firstIndex || index > lastIndex) {
        clearItemPaint(item)
        return
      }

      const unadjustedCenter = index * itemSizeWithSpacing + itemSize / 2 - scrollOffset
      const before = keylineBefore(keylines, unadjustedCenter)
      const after = keylineAfter(keylines, unadjustedCenter)
      const progress = getProgress(before, after, unadjustedCenter)
      const interpolated = lerpKeyline(before, after, progress)
      const isOutOfKeylineBounds = keylinesEqual(before, after)

      // The mask is centred in the item's own box, so both insets are the same
      // half of the difference between the focal size and the keyline size.
      const inset = (itemSize - interpolated.size) / 2

      let translate = interpolated.offset - unadjustedCenter
      if (isOutOfKeylineBounds) {
        // Past the first or last keyline, keep offsetting the item by cutting
        // its unadjusted offset according to its masked size.
        translate += (unadjustedCenter - interpolated.unadjustedOffset) / interpolated.size
      }

      applyItemPaint(item, vertical, {
        insetStart: inset,
        insetEnd: inset,
        translate,
        parallax: 0,
        size: interpolated.size,
        minSize: strategy.minItemSize,
        maxSize: strategy.maxItemSize,
        bucketMinSize: strategy.smallestVisibleItemSize,
        bucketMaxSize: strategy.itemMainAxisSize,
        zIndex: Math.round(FOCAL_Z_INDEX / (1 + Math.abs(index - nearestIndex))),
      })
    })
  }, [itemsOf, logicalScrollOffset, maxScrollOffsetOf, restOffsetOf])

  /**
   * The aspect-ratio engine. There is no arrangement and no keyline: each item's
   * mask and parallax come from how far it has travelled past a viewport edge,
   * scaled by the mask intensity its own ratio allows.
   */
  const paintMultiAspect = useCallback(
    (container: HTMLElement, items: HTMLElement[], vertical: boolean) => {
      if (prefersReducedMotion()) {
        items.forEach(clearItemPaint)
        return
      }
      const viewportEndOffset = vertical ? container.clientHeight : container.clientWidth
      if (viewportEndOffset === 0) {
        items.forEach(clearItemPaint)
        return
      }
      const scrollOffset = logicalScrollOffset(container)
      const containerState = { viewportStartOffset: 0, viewportEndOffset }

      items.forEach((item, index) => {
        const mainAxisSize = vertical ? item.offsetHeight : item.offsetWidth
        const crossAxisSize = vertical ? item.offsetWidth : item.offsetHeight
        const naturalOffset = (vertical ? item.offsetTop : item.offsetLeft) - scrollOffset
        const isVisible =
          mainAxisSize > 0 &&
          crossAxisSize > 0 &&
          naturalOffset < viewportEndOffset + mainAxisSize &&
          naturalOffset > -mainAxisSize * 2
        if (!isVisible) {
          clearItemPaint(item)
          return
        }
        const itemState = { isVisible, mainAxisSize, crossAxisSize, offset: naturalOffset }
        const [maskStart, maskEnd] = getMultiAspectMask(containerState, itemState)
        applyItemPaint(item, vertical, {
          insetStart: maskStart,
          insetEnd: mainAxisSize - maskEnd,
          // The item box keeps its natural position; only its content lags.
          translate: 0,
          parallax: getMultiAspectParallax(containerState, itemState),
          size: maskEnd - maskStart,
          minSize: getMultiAspectMinSize(itemState),
          maxSize: mainAxisSize,
          // This engine has no keylines and therefore no anchors, so the published
          // range is already the range a visible item moves through.
          bucketMinSize: getMultiAspectMinSize(itemState),
          bucketMaxSize: mainAxisSize,
          zIndex: FOCAL_Z_INDEX - index,
        })
      })
    },
    [logicalScrollOffset],
  )

  const layoutPass = useCallback(() => {
    const container = latest.current.containerRef.current
    if (container === null) return
    const { layout, itemCount } = latest.current
    if (layout === 'multiAspect') {
      paint()
      return
    }

    const vertical = isVerticalLayout(layout)
    const availableSpace = vertical ? container.clientHeight : container.clientWidth
    const itemSpacing = readSpacing(container)
    const sizing = readSizing(container)
    const { before, after } = readContentPadding(container)

    const strategy = createStrategy({
      defaultKeylines: buildKeylines(availableSpace, itemSpacing, sizing),
      availableSpace,
      itemSpacing,
      beforeContentPadding: before,
      afterContentPadding: after,
    })

    const previous = strategyRef.current
    strategyRef.current = strategy
    const changed = previous === null || !strategiesEqual(previous, strategy)

    if (strategy.isValid) {
      // The source rounds the page size because Pager measures in whole pixels;
      // CSS accepts a fractional length, so the unrounded size is used and the
      // arrangement fits the container exactly.
      container.style.setProperty('--m3e-carousel-item-size', `${strategy.itemMainAxisSize}px`)
    } else {
      container.style.removeProperty('--m3e-carousel-item-size')
    }

    if (changed) {
      // Snap offsets belong to the layout pass: rewriting a scroll margin while
      // a gesture is settling would move the target the browser is animating to.
      itemsOf(container).forEach((item, index) => {
        if (!strategy.isValid) {
          item.style.removeProperty('--m3e-carousel-item-snap')
          return
        }
        const snap = getSnapPositionOffset(strategy, index, itemCount)
        item.style.setProperty('--m3e-carousel-item-snap', `${snap}px`)
      })
    }

    paint()
  }, [buildKeylines, itemsOf, paint, readContentPadding, readSizing, readSpacing])

  useEffect(() => {
    const container = options.containerRef.current
    if (container === null) return undefined

    let frame = 0
    const schedule = () => {
      if (frame !== 0) return
      frame = requestAnimationFrame(() => {
        frame = 0
        paint()
      })
    }

    layoutPass()

    container.addEventListener('scroll', schedule, { passive: true })
    const observer =
      typeof ResizeObserver === 'function' ? new ResizeObserver(() => layoutPass()) : null
    observer?.observe(container)
    const motionQuery =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null
    motionQuery?.addEventListener('change', layoutPass)

    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      container.removeEventListener('scroll', schedule)
      observer?.disconnect()
      motionQuery?.removeEventListener('change', layoutPass)
      container.style.removeProperty('--m3e-carousel-item-size')
      itemsOf(container).forEach((item) => {
        clearItemPaint(item)
        item.style.removeProperty('--m3e-carousel-item-snap')
      })
    }
  }, [
    itemsOf,
    layoutPass,
    paint,
    options.containerRef,
    options.itemCount,
    options.layout,
    options.itemSpacing,
    options.preferredItemWidth,
    options.itemWidth,
    options.maxItemWidth,
    options.minSmallItemWidth,
    options.maxSmallItemWidth,
  ])

  const scrollToItem = useCallback(
    (index: number, animate: boolean) => {
      const container = latest.current.containerRef.current
      if (container === null) return
      const { itemCount, layout } = latest.current
      const strategy = strategyRef.current
      const clamped = Math.min(Math.max(index, 0), Math.max(itemCount - 1, 0))
      const behavior: ScrollBehavior = animate && !prefersReducedMotion() ? 'smooth' : 'instant'

      if (strategy === null || !strategy.isValid) {
        // No arrangement yet: fall back to the item's own box, which is where a
        // browser would scroll it anyway.
        itemsOf(container)[clamped]?.scrollIntoView({ behavior, block: 'nearest', inline: 'start' })
        return
      }

      const offset = restOffsetOf(strategy, clamped, itemCount)
      if (isVerticalLayout(layout)) {
        container.scrollTo({ top: offset, behavior })
        return
      }
      // A right-to-left scroller counts the inline axis negatively.
      const isRtl = getComputedStyle(container).direction === 'rtl'
      container.scrollTo({ left: isRtl ? -offset : offset, behavior })
    },
    [itemsOf, restOffsetOf],
  )

  return { scrollToItem }
}

function applyItemPaint(item: HTMLElement, vertical: boolean, paint: ItemPaint): void {
  const { style } = item
  style.setProperty('--m3e-carousel-item-inset-start', `${paint.insetStart}px`)
  style.setProperty('--m3e-carousel-item-inset-end', `${paint.insetEnd}px`)
  /*
   * The three numbers the adaptive-content fade needs, all **unitless**: the fade
   * has to divide by a width, and CSS `calc()` cannot divide by a length. Between
   * them they describe where this item sits in the range a visible item moves
   * through, which is the same range `sizeBucketOf` classifies against.
   */
  style.setProperty('--m3e-carousel-item-visible-size', String(paint.size))
  style.setProperty('--m3e-carousel-item-bucket-min', String(paint.bucketMinSize))
  style.setProperty(
    '--m3e-carousel-item-bucket-range',
    String(Math.max(0, paint.bucketMaxSize - paint.bucketMinSize)),
  )
  style.setProperty('--m3e-carousel-item-translate', `${paint.translate}px`)
  style.setProperty('--m3e-carousel-item-parallax', `${paint.parallax}px`)
  style.setProperty('--m3e-carousel-item-z', String(paint.zIndex))
  // The specification's adaptive-content rule works from these three: content
  // shows its full title at large, hides it at medium, and abbreviates at small.
  style.setProperty('--m3e-carousel-item-current-size', `${paint.size}px`)
  style.setProperty('--m3e-carousel-item-min-size', `${paint.minSize}px`)
  style.setProperty('--m3e-carousel-item-max-size', `${paint.maxSize}px`)
  item.dataset.m3eSize = sizeBucketOf(paint.size, paint.bucketMinSize, paint.bucketMaxSize)
  item.dataset.m3eAxis = vertical ? 'block' : 'inline'
}

function clearItemPaint(item: HTMLElement): void {
  const { style } = item
  style.removeProperty('--m3e-carousel-item-inset-start')
  style.removeProperty('--m3e-carousel-item-inset-end')
  style.removeProperty('--m3e-carousel-item-visible-size')
  style.removeProperty('--m3e-carousel-item-bucket-min')
  style.removeProperty('--m3e-carousel-item-bucket-range')
  style.removeProperty('--m3e-carousel-item-translate')
  style.removeProperty('--m3e-carousel-item-parallax')
  style.removeProperty('--m3e-carousel-item-z')
  style.removeProperty('--m3e-carousel-item-current-size')
  style.removeProperty('--m3e-carousel-item-min-size')
  style.removeProperty('--m3e-carousel-item-max-size')
  delete item.dataset.m3eSize
  delete item.dataset.m3eAxis
}

/**
 * The three widths the specification's anatomy names. An item at or near the
 * focal size is large, one at or near the small keyline is small, and the range
 * between them is medium.
 *
 * `minSize` must be the smallest size a *visible* item takes — the small
 * keyline's size, not the anchors'. A keyline list that has shifted can hand an
 * item a size below that resting minimum, and a fraction below zero classifies as
 * small, which is what it looks like.
 */
export function sizeBucketOf(size: number, minSize: number, maxSize: number): 'large' | 'medium' | 'small' {
  if (maxSize <= minSize) return 'large'
  const fraction = (size - minSize) / (maxSize - minSize)
  if (fraction >= 0.9) return 'large'
  if (fraction <= 0.1) return 'small'
  return 'medium'
}
