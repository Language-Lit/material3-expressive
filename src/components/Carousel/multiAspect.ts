/**
 * Port of the mask, parallax, and mask-intensity math in the pinned
 * `MultiAspectCarousel.kt` at revision
 * `a90df2fc27e026b9ad2ed569f203a260c1041fab`.
 *
 * The uncontained multi-aspect-ratio layout — the November 2025 addition to the
 * catalog — is a second engine, not a keyline arrangement. Items keep whatever
 * width their own aspect ratio gives them, and masking is derived from how far
 * each item has travelled past a viewport edge rather than from a keyline it is
 * approaching. It also has real content parallax, which the keyline layouts get
 * only as a side effect of a shrinking mask over fixed content.
 */

import { lerpRange } from './strategy'

/** The item geometry this engine needs, in pixels. */
export interface MultiAspectItemState {
  readonly isVisible: boolean
  readonly mainAxisSize: number
  readonly crossAxisSize: number
  /** The item's leading edge in the scroll container's content coordinates. */
  readonly offset: number
}

/** The scroll container's visible window in the same coordinates. */
export interface MultiAspectContainerState {
  readonly viewportStartOffset: number
  readonly viewportEndOffset: number
}

/**
 * How much of an item may be masked away, as a fraction, derived from its aspect
 * ratio. A wide item can lose half its width and still read as itself; a tall
 * one cannot.
 *
 * The comparisons are strict on both sides, so an item at exactly 16:9 or
 * exactly 1:1 falls through to the final branch and gets the *lowest* intensity
 * rather than the boundary value of the range it sits on. That is the pinned
 * source's behavior and is preserved deliberately.
 */
export function getMaskIntensity(mainAxisSize: number, crossAxisSize: number): number {
  const aspectRatio = mainAxisSize / crossAxisSize
  const wide = 16 / 9
  const tall = 9 / 16
  if (aspectRatio > wide) return 1 / 2
  if (aspectRatio < wide && aspectRatio > 1) {
    return lerpRange(1 / 3, 1 / 2, 1, wide, aspectRatio)
  }
  if (aspectRatio < 1 && aspectRatio > tall) {
    return lerpRange(1 / 4, 1 / 3, tall, 1, aspectRatio)
  }
  return 1 / 4
}

/** The smallest main-axis size this item will ever be masked to. */
export function getMultiAspectMinSize(item: MultiAspectItemState): number {
  if (!item.isVisible) return 0
  return item.mainAxisSize * (1 - getMaskIntensity(item.mainAxisSize, item.crossAxisSize))
}

/**
 * The item's mask as a `[start, end]` pair of main-axis offsets within its own
 * box. An item fully inside the viewport is unmasked.
 */
export function getMultiAspectMask(
  container: MultiAspectContainerState,
  item: MultiAspectItemState,
): readonly [number, number] {
  if (!item.isVisible) return [0, 0]

  const { mainAxisSize, crossAxisSize, offset } = item
  // The distance an item must travel outside the viewport to become fully
  // masked. Scaling it by the item's own size keeps the effect uniform across
  // items of very different widths.
  const offscreenThreshold = mainAxisSize
  const maskIntensity = getMaskIntensity(mainAxisSize, crossAxisSize)

  if (offset < container.viewportStartOffset) {
    const offscreenDistance = container.viewportStartOffset - offset
    const maskStart = lerpRange(
      0,
      mainAxisSize * (1 - maskIntensity),
      0,
      offscreenThreshold,
      offscreenDistance,
    )
    return [maskStart, mainAxisSize]
  }

  if (offset > container.viewportEndOffset - mainAxisSize) {
    const offscreenDistance = -(container.viewportEndOffset - offset - mainAxisSize)
    const maskEnd = lerpRange(
      mainAxisSize,
      mainAxisSize * maskIntensity,
      0,
      offscreenThreshold,
      offscreenDistance,
    )
    return [0, maskEnd]
  }

  return [0, mainAxisSize]
}

/**
 * How far to translate the item's content against the scroll direction, so it
 * appears to lag behind its own mask.
 */
export function getMultiAspectParallax(
  container: MultiAspectContainerState,
  item: MultiAspectItemState,
): number {
  if (!item.isVisible) return 0

  const { mainAxisSize, crossAxisSize, offset } = item
  const offscreenThreshold = mainAxisSize
  const parallaxDistance = mainAxisSize * getMaskIntensity(mainAxisSize, crossAxisSize)

  if (offset < container.viewportStartOffset) {
    const offscreenDistance = container.viewportStartOffset - offset
    return lerpRange(0, parallaxDistance, 0, offscreenThreshold, offscreenDistance)
  }

  if (offset > container.viewportEndOffset - mainAxisSize) {
    const offscreenDistance = -(container.viewportEndOffset - offset - mainAxisSize)
    return -lerpRange(0, parallaxDistance, 0, offscreenThreshold, offscreenDistance)
  }

  return 0
}
