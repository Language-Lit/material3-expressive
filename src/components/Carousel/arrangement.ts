/**
 * Port of the pinned `Arrangement.kt` at revision
 * `a90df2fc27e026b9ad2ed569f203a260c1041fab`.
 *
 * An arrangement is one combination of large, medium, and small item counts and
 * sizes, fitted to an available space and scored by how little it had to alter
 * the target large size. The engine tries every permutation of the caller's
 * count arrays and keeps the cheapest.
 *
 * The port is literal apart from two things the platform forces. The source
 * takes a `Density` and converts dp to px; the web works in CSS pixels, so
 * every size here is already a pixel value and no density parameter exists.
 * And Kotlin's `Float` arithmetic becomes JavaScript's double, which is wider
 * rather than narrower, so no expected value changes.
 */

/** A fitted combination of item counts and their resolved sizes. */
export interface Arrangement {
  /** Permutation order this arrangement was generated in; 1 is most preferred. */
  readonly priority: number
  readonly smallSize: number
  readonly smallCount: number
  readonly mediumSize: number
  readonly mediumCount: number
  readonly largeSize: number
  readonly largeCount: number
}

/**
 * Percentage of a medium item's size by which it may grow or shrink to help an
 * arrangement fit — the source's `MediumItemFlexPercentage`.
 */
const MEDIUM_ITEM_FLEX_PERCENTAGE = 0.1

/** Number of keylines the arrangement occupies. */
export function arrangementItemCount(arrangement: Arrangement): number {
  return arrangement.largeCount + arrangement.mediumCount + arrangement.smallCount
}

/**
 * An arrangement is only visually valid when the sizes it claims are actually
 * ordered largest to smallest. A "large" item narrower than a "small" one would
 * read as a layout defect rather than a carousel.
 */
function isValid(arrangement: Arrangement): boolean {
  const { largeCount, smallCount, mediumCount, largeSize, mediumSize, smallSize } = arrangement
  if (largeCount > 0 && smallCount > 0 && mediumCount > 0) {
    return largeSize > mediumSize && mediumSize > smallSize
  }
  if (largeCount > 0 && smallCount > 0) {
    return largeSize > smallSize
  }
  return true
}

/**
 * Cost combines the arrangement's permutation priority with how far its large
 * size drifted from the target. Lower is better, and an invalid arrangement is
 * unaffordable.
 */
function cost(arrangement: Arrangement, targetLargeSize: number): number {
  if (!isValid(arrangement)) return Number.MAX_VALUE
  return Math.abs(targetLargeSize - arrangement.largeSize) * arrangement.priority
}

/**
 * Solves for the large size that makes the arrangement occupy exactly
 * `availableSpace`, given the small size and that a medium item is the mean of
 * the large and small sizes:
 *
 * `availableSpace = (large * largeCount) + (((large + small) / 2) * mediumCount)
 * + (small * smallCount)`
 */
function calculateLargeSize(
  availableSpace: number,
  smallCount: number,
  smallSize: number,
  mediumCount: number,
  largeCount: number,
): number {
  return (
    (availableSpace - (smallCount + mediumCount / 2) * smallSize) / (largeCount + mediumCount / 2)
  )
}

/**
 * Fits one permutation of item counts into `availableSpace`, protecting the
 * large size as long as possible: small items absorb the difference first
 * within their allowed range, then the large size is solved for, then the
 * medium item gives back or takes up to its flex allowance.
 */
function fit(
  priority: number,
  availableSpace: number,
  itemSpacing: number,
  smallCount: number,
  smallSize: number,
  minSmallSize: number,
  maxSmallSize: number,
  mediumCount: number,
  mediumSize: number,
  largeCount: number,
  largeSize: number,
): Arrangement {
  const totalItemCount = largeCount + mediumCount + smallCount
  const availableSpaceWithoutSpacing = availableSpace - (totalItemCount - 1) * itemSpacing
  let arrangedSmallSize = Math.min(Math.max(smallSize, minSmallSize), maxSmallSize)
  let arrangedMediumSize = mediumSize
  let arrangedLargeSize = largeSize

  const totalSpaceTakenByArrangement =
    arrangedLargeSize * largeCount + arrangedMediumSize * mediumCount + arrangedSmallSize * smallCount
  const delta = availableSpaceWithoutSpacing - totalSpaceTakenByArrangement
  if (smallCount > 0 && delta > 0) {
    arrangedSmallSize += Math.min(delta / smallCount, maxSmallSize - arrangedSmallSize)
  } else if (smallCount > 0 && delta < 0) {
    arrangedSmallSize += Math.max(delta / smallCount, minSmallSize - arrangedSmallSize)
  }

  arrangedSmallSize = smallCount > 0 ? arrangedSmallSize : 0
  arrangedLargeSize = calculateLargeSize(
    availableSpaceWithoutSpacing,
    smallCount,
    arrangedSmallSize,
    mediumCount,
    largeCount,
  )
  arrangedMediumSize = (arrangedLargeSize + arrangedSmallSize) / 2

  // Counter any drift in the large size by flexing the medium item, which is
  // the least visually load-bearing of the three.
  if (mediumCount > 0 && arrangedLargeSize !== largeSize) {
    const targetAdjustment = (largeSize - arrangedLargeSize) * largeCount
    const availableMediumFlex = arrangedMediumSize * MEDIUM_ITEM_FLEX_PERCENTAGE * mediumCount
    const distribute = Math.min(Math.abs(targetAdjustment), availableMediumFlex)
    if (targetAdjustment > 0) {
      arrangedMediumSize -= distribute / mediumCount
      arrangedLargeSize += distribute / largeCount
    } else {
      arrangedMediumSize += distribute / mediumCount
      arrangedLargeSize -= distribute / largeCount
    }
  }

  return {
    priority,
    smallSize: arrangedSmallSize,
    smallCount,
    mediumSize: arrangedMediumSize,
    mediumCount,
    largeSize: arrangedLargeSize,
    largeCount,
  }
}

export interface FindArrangementOptions {
  readonly availableSpace: number
  readonly itemSpacing: number
  readonly targetSmallSize: number
  readonly minSmallSize: number
  readonly maxSmallSize: number
  readonly smallCounts: readonly number[]
  readonly targetMediumSize: number
  readonly mediumCounts: readonly number[]
  readonly targetLargeSize: number
  readonly largeCounts: readonly number[]
}

/**
 * Generates every permutation of the given counts in priority order, fits each,
 * and returns the cheapest. Returns `null` only when no permutation exists.
 *
 * A zero-cost arrangement exits early: cost cannot improve below zero, and
 * because permutations are generated in priority order, nothing later can be
 * preferred either.
 */
export function findLowestCostArrangement({
  availableSpace,
  itemSpacing,
  targetSmallSize,
  minSmallSize,
  maxSmallSize,
  smallCounts,
  targetMediumSize,
  mediumCounts,
  targetLargeSize,
  largeCounts,
}: FindArrangementOptions): Arrangement | null {
  let lowestCostArrangement: Arrangement | null = null
  let priority = 1
  for (const largeCount of largeCounts) {
    for (const mediumCount of mediumCounts) {
      for (const smallCount of smallCounts) {
        const arrangement = fit(
          priority,
          availableSpace,
          itemSpacing,
          smallCount,
          targetSmallSize,
          minSmallSize,
          maxSmallSize,
          mediumCount,
          targetMediumSize,
          largeCount,
          targetLargeSize,
        )
        if (
          lowestCostArrangement === null ||
          cost(arrangement, targetLargeSize) < cost(lowestCostArrangement, targetLargeSize)
        ) {
          lowestCostArrangement = arrangement
          if (cost(lowestCostArrangement, targetLargeSize) === 0) {
            return lowestCostArrangement
          }
        }
        priority += 1
      }
    }
  }
  return lowestCostArrangement
}
