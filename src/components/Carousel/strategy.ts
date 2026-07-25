/**
 * Port of the pinned `Strategy.kt` and `KeylineSnapPosition.kt` at revision
 * `a90df2fc27e026b9ad2ed569f203a260c1041fab`.
 *
 * A strategy takes one default keyline list and derives the shifted lists the
 * carousel needs at the ends of its scroll range. Without them, the first and
 * last items could never become focal: the focal range sits in the middle of the
 * container, so an item at the very start of the list would have to detach from
 * the container edge to reach it. Each step moves the focal range by exactly one
 * keyline, which is what guarantees every item passes through it.
 *
 * The port is literal. `Strategy` is a factory returning a frozen object rather
 * than a Kotlin class with two constructors, and its scroll-offset cache lives
 * in the closure; `hashCode` becomes {@link strategyKey} for the reason
 * `keylineListKey` records.
 */

import {
  emptyKeylineList,
  firstFocalKeyline,
  firstIndexAfterFocalRangeWithSize,
  firstKeyline,
  firstNonAnchorKeyline,
  isEmptyKeylineList,
  isFirstFocalItemAtStartOfContainer,
  isLastFocalItemAtEndOfContainer,
  type Keyline,
  keylineListFrom,
  keylinesEqual,
  keylineListKey,
  type KeylineList,
  keylineListsEqual,
  keylineListWithPivot,
  lastFocalKeyline,
  lastIndexBeforeFocalRangeWithSize,
  lastKeyline,
  lerpKeylineList,
  pivotKeyline,
} from './keylines'

/**
 * Maps `value` from the input range onto the output range, clamping outside it —
 * the source's five-argument `lerp`.
 */
export function lerpRange(
  outputMin: number,
  outputMax: number,
  inputMin: number,
  inputMax: number,
  value: number,
): number {
  if (value <= inputMin) return outputMin
  if (value >= inputMax) return outputMax
  const fraction = (value - inputMin) / (inputMax - inputMin)
  return (1 - fraction) * outputMin + fraction * outputMax
}

export interface Strategy {
  readonly defaultKeylines: KeylineList
  readonly startKeylineSteps: readonly KeylineList[]
  readonly endKeylineSteps: readonly KeylineList[]
  readonly availableSpace: number
  readonly itemSpacing: number
  readonly beforeContentPadding: number
  readonly afterContentPadding: number
  readonly minItemSize: number
  readonly maxItemSize: number
  /** The size of an item when focal and fully unmasked. */
  readonly itemMainAxisSize: number
  /**
   * Web-only, and deliberately not a ported value: the smallest size a *visible*
   * item reaches in the resting arrangement — the small keyline's size.
   *
   * `minItemSize` cannot serve this purpose. It is the port of the source's own
   * computation, so it includes the **anchor** keylines, which sit off screen at
   * around 10px. Normalising the size bucket against it puts the specification's
   * small item, fixed at 40–56px, in the medium band at every realistic width: an
   * item only classifies as small below `anchor + 0.1 × (focal − anchor)`, which
   * for a 40px small item needs a focal item of 310px or more.
   */
  readonly smallestVisibleItemSize: number
  readonly isValid: boolean
  readonly startShiftDistance: number
  readonly endShiftDistance: number
  /**
   * The keyline list to use at `scrollOffset`. Pass `roundToNearestStep` to get
   * a whole shift step instead of an interpolation between two.
   */
  getKeylineListForScrollOffset(
    scrollOffset: number,
    maxScrollOffset: number,
    roundToNearestStep?: boolean,
  ): KeylineList
}

/** Total scroll distance covered by every start step. */
function getStartShiftDistance(
  startKeylineSteps: readonly KeylineList[],
  beforeContentPadding: number,
): number {
  if (startKeylineSteps.length === 0) return 0
  return Math.max(
    firstKeyline(startKeylineSteps[startKeylineSteps.length - 1]!).unadjustedOffset -
      firstKeyline(startKeylineSteps[0]!).unadjustedOffset,
    beforeContentPadding,
  )
}

/** Total scroll distance covered by every end step. */
function getEndShiftDistance(
  endKeylineSteps: readonly KeylineList[],
  afterContentPadding: number,
): number {
  if (endKeylineSteps.length === 0) return 0
  return Math.max(
    lastKeyline(endKeylineSteps[0]!).unadjustedOffset -
      lastKeyline(endKeylineSteps[endKeylineSteps.length - 1]!).unadjustedOffset,
    afterContentPadding,
  )
}

/**
 * Returns a copy of `from` with every keyline's offset shifted by
 * `contentPadding`, reducing each item's size by an equal share so the
 * arrangement still fits.
 *
 * The unadjusted offsets are then restored from the incoming list, because the
 * items are still laid out end-to-end at the original size — only their painted
 * masks shrink.
 */
function createShiftedKeylineListForContentPadding(
  from: KeylineList,
  carouselMainAxisSize: number,
  itemSpacing: number,
  contentPadding: number,
  pivot: Keyline,
  pivotIndex: number,
): KeylineList {
  const numberOfNonAnchorKeylines = from.keylines.filter((k) => !k.isAnchor).length
  const sizeReduction = contentPadding / numberOfNonAnchorKeylines
  const shifted = keylineListWithPivot(
    carouselMainAxisSize,
    itemSpacing,
    pivotIndex,
    pivot.offset - sizeReduction / 2 + contentPadding,
    (add) => {
      from.keylines.forEach((k) => add(k.size - Math.abs(sizeReduction), k.isAnchor))
    },
  )
  return keylineListFrom(
    shifted.keylines.map((k, i) => ({ ...k, unadjustedOffset: from.keylines[i]!.unadjustedOffset })),
  )
}

function moveKeyline(keylines: readonly Keyline[], srcIndex: number, dstIndex: number): Keyline[] {
  const next = [...keylines]
  const [keyline] = next.splice(srcIndex, 1)
  next.splice(dstIndex, 0, keyline!)
  return next
}

/**
 * Moves the keyline at `srcIndex` to `dstIndex` and rebuilds the list around the
 * pivot that the move displaces.
 */
function moveKeylineAndCreateShiftedKeylineList(
  from: KeylineList,
  srcIndex: number,
  dstIndex: number,
  carouselMainAxisSize: number,
  itemSpacing: number,
): KeylineList {
  // -1 when the pivot shifts towards the start, 1 towards the end.
  const pivotDir = srcIndex > dstIndex ? 1 : -1
  const source = from.keylines[srcIndex]!
  const pivotDelta = (source.size - source.cutoff + itemSpacing) * pivotDir
  const newPivotIndex = from.pivotIndex + pivotDir
  const newPivotOffset = pivotKeyline(from).offset + pivotDelta
  return keylineListWithPivot(
    carouselMainAxisSize,
    itemSpacing,
    newPivotIndex,
    newPivotOffset,
    (add) => {
      moveKeyline(from.keylines, srcIndex, dstIndex).forEach((k) => add(k.size, k.isAnchor))
    },
  )
}

/**
 * Discrete steps moving the focal range from its default position to the start of
 * the container, one keyline at a time. Each step takes the keyline at the start
 * and re-inserts it after the focal range beside a keyline of the same size, so
 * the arrangement stays visually balanced.
 */
function getStartKeylineSteps(
  defaultKeylines: KeylineList,
  carouselMainAxisSize: number,
  itemSpacing: number,
  beforeContentPadding: number,
): KeylineList[] {
  if (isEmptyKeylineList(defaultKeylines)) return []

  const steps: KeylineList[] = [defaultKeylines]

  if (isFirstFocalItemAtStartOfContainer(defaultKeylines)) {
    if (beforeContentPadding !== 0) {
      steps.push(
        createShiftedKeylineListForContentPadding(
          defaultKeylines,
          carouselMainAxisSize,
          itemSpacing,
          beforeContentPadding,
          firstFocalKeyline(defaultKeylines),
          defaultKeylines.firstFocalIndex,
        ),
      )
    }
    return steps
  }

  const startIndex = defaultKeylines.firstNonAnchorIndex
  const endIndex = defaultKeylines.firstFocalIndex
  const numberOfSteps = endIndex - startIndex

  // No steps to take, but a cut-off focal item still needs one shifted list.
  if (numberOfSteps <= 0 && firstFocalKeyline(defaultKeylines).cutoff > 0) {
    steps.push(
      moveKeylineAndCreateShiftedKeylineList(
        defaultKeylines,
        0,
        0,
        carouselMainAxisSize,
        itemSpacing,
      ),
    )
    return steps
  }

  for (let i = 0; i < numberOfSteps; i += 1) {
    const prevStep = steps[steps.length - 1]!
    const originalItemIndex = startIndex + i
    let dstIndex = defaultKeylines.keylines.length - 1
    if (originalItemIndex > 0) {
      const originalNeighborBeforeSize = defaultKeylines.keylines[originalItemIndex - 1]!.size
      dstIndex = firstIndexAfterFocalRangeWithSize(prevStep, originalNeighborBeforeSize) - 1
    }
    steps.push(
      moveKeylineAndCreateShiftedKeylineList(
        prevStep,
        defaultKeylines.firstNonAnchorIndex,
        dstIndex,
        carouselMainAxisSize,
        itemSpacing,
      ),
    )
  }

  if (beforeContentPadding !== 0) {
    const last = steps[steps.length - 1]!
    steps[steps.length - 1] = createShiftedKeylineListForContentPadding(
      last,
      carouselMainAxisSize,
      itemSpacing,
      beforeContentPadding,
      firstFocalKeyline(last),
      last.firstFocalIndex,
    )
  }

  return steps
}

/** The end-side mirror of {@link getStartKeylineSteps}. */
function getEndKeylineSteps(
  defaultKeylines: KeylineList,
  carouselMainAxisSize: number,
  itemSpacing: number,
  afterContentPadding: number,
): KeylineList[] {
  if (isEmptyKeylineList(defaultKeylines)) return []

  const steps: KeylineList[] = [defaultKeylines]

  if (isLastFocalItemAtEndOfContainer(defaultKeylines, carouselMainAxisSize)) {
    if (afterContentPadding !== 0) {
      steps.push(
        createShiftedKeylineListForContentPadding(
          defaultKeylines,
          carouselMainAxisSize,
          itemSpacing,
          -afterContentPadding,
          lastFocalKeyline(defaultKeylines),
          defaultKeylines.lastFocalIndex,
        ),
      )
    }
    return steps
  }

  const startIndex = defaultKeylines.lastFocalIndex
  const endIndex = defaultKeylines.lastNonAnchorIndex
  const numberOfSteps = endIndex - startIndex

  if (numberOfSteps <= 0 && lastFocalKeyline(defaultKeylines).cutoff > 0) {
    steps.push(
      moveKeylineAndCreateShiftedKeylineList(
        defaultKeylines,
        0,
        0,
        carouselMainAxisSize,
        itemSpacing,
      ),
    )
    return steps
  }

  for (let i = 0; i < numberOfSteps; i += 1) {
    const prevStep = steps[steps.length - 1]!
    const originalItemIndex = endIndex - i
    let dstIndex = 0
    if (originalItemIndex < defaultKeylines.keylines.length - 1) {
      const originalNeighborAfterSize = defaultKeylines.keylines[originalItemIndex + 1]!.size
      dstIndex = lastIndexBeforeFocalRangeWithSize(prevStep, originalNeighborAfterSize) + 1
    }
    steps.push(
      moveKeylineAndCreateShiftedKeylineList(
        prevStep,
        defaultKeylines.lastNonAnchorIndex,
        dstIndex,
        carouselMainAxisSize,
        itemSpacing,
      ),
    )
  }

  if (afterContentPadding !== 0) {
    const last = steps[steps.length - 1]!
    steps[steps.length - 1] = createShiftedKeylineListForContentPadding(
      last,
      carouselMainAxisSize,
      itemSpacing,
      -afterContentPadding,
      lastFocalKeyline(last),
      last.lastFocalIndex,
    )
  }

  return steps
}

/**
 * Points between 0 and 1 marking when each step becomes current. Steps are
 * unevenly distributed because a step's share depends on how far its keylines
 * actually shift.
 */
function getStepInterpolationPoints(
  totalShiftDistance: number,
  steps: readonly KeylineList[],
  isShiftingLeft: boolean,
): number[] {
  const points = [0]
  if (totalShiftDistance === 0 || steps.length === 0) return points

  for (let i = 1; i < steps.length; i += 1) {
    const prevKeylines = steps[i - 1]!
    const currKeylines = steps[i]!
    const distanceShifted = isShiftingLeft
      ? firstKeyline(currKeylines).unadjustedOffset - firstKeyline(prevKeylines).unadjustedOffset
      : lastKeyline(prevKeylines).unadjustedOffset - lastKeyline(currKeylines).unadjustedOffset
    const stepPercentage = distanceShifted / totalShiftDistance
    points.push(i === steps.length - 1 ? 1 : points[i - 1]! + stepPercentage)
  }
  return points
}

export interface StrategyOptions {
  readonly defaultKeylines: KeylineList
  readonly availableSpace: number
  readonly itemSpacing: number
  readonly beforeContentPadding: number
  readonly afterContentPadding: number
}

/** The empty strategy, the source's `Strategy.Empty`. */
export function emptyStrategy(): Strategy {
  return createStrategy({
    defaultKeylines: emptyKeylineList,
    availableSpace: 0,
    itemSpacing: 0,
    beforeContentPadding: 0,
    afterContentPadding: 0,
  })
}

export function createStrategy({
  defaultKeylines,
  availableSpace,
  itemSpacing,
  beforeContentPadding,
  afterContentPadding,
}: StrategyOptions): Strategy {
  const startKeylineSteps = getStartKeylineSteps(
    defaultKeylines,
    availableSpace,
    itemSpacing,
    beforeContentPadding,
  )
  const endKeylineSteps = getEndKeylineSteps(
    defaultKeylines,
    availableSpace,
    itemSpacing,
    afterContentPadding,
  )

  let minItemSize = defaultKeylines.minSize
  let maxItemSize = defaultKeylines.maxSize
  for (const step of [...startKeylineSteps, ...endKeylineSteps]) {
    if (step.minSize < minItemSize) minItemSize = step.minSize
    if (step.maxSize > maxItemSize) maxItemSize = step.maxSize
  }

  const empty = isEmptyKeylineList(defaultKeylines)
  const itemMainAxisSize = empty ? 0 : firstFocalKeyline(defaultKeylines).size
  const isValid = !empty && availableSpace !== 0 && itemMainAxisSize !== 0

  // Taken from the resting arrangement only, so the bucket boundary does not move
  // as the keyline list shifts and make content flicker between two states.
  let smallestVisibleItemSize = itemMainAxisSize
  for (const keyline of defaultKeylines.keylines) {
    if (!keyline.isAnchor && keyline.size < smallestVisibleItemSize) {
      smallestVisibleItemSize = keyline.size
    }
  }

  const startShiftDistance = getStartShiftDistance(startKeylineSteps, beforeContentPadding)
  const endShiftDistance = getEndShiftDistance(endKeylineSteps, afterContentPadding)
  const startShiftPoints = getStepInterpolationPoints(startShiftDistance, startKeylineSteps, true)
  const endShiftPoints = getStepInterpolationPoints(endShiftDistance, endKeylineSteps, false)

  /**
   * The last start step paired with the last end step, for the case where the
   * two shift ranges overlap and the default list is never current.
   */
  let lastStartAndEndKeylineListSteps: readonly KeylineList[] | null = null

  let cachedScrollOffset = -1
  let cachedMaxScrollOffset = -1
  let cachedRoundToNearestStep = false
  let cachedKeylineList: KeylineList | null = null

  const computeKeylineList = (
    scrollOffset: number,
    maxScrollOffset: number,
    roundToNearestStep: boolean,
  ): KeylineList => {
    // Rounding can make the reported offset slightly negative.
    const positiveScrollOffset = Math.max(0, scrollOffset)
    const startShiftOffset = startShiftDistance
    const endShiftOffset = Math.max(0, maxScrollOffset - endShiftDistance)

    if (positiveScrollOffset >= startShiftOffset && positiveScrollOffset <= endShiftOffset) {
      return defaultKeylines
    }

    let interpolation = lerpRange(1, 0, 0, startShiftOffset, positiveScrollOffset)
    let shiftPoints = startShiftPoints
    let steps: readonly KeylineList[] = startKeylineSteps

    if (positiveScrollOffset > endShiftOffset) {
      interpolation = lerpRange(0, 1, endShiftOffset, maxScrollOffset, positiveScrollOffset)
      shiftPoints = endShiftPoints
      steps = endKeylineSteps

      // When end shifting begins at offset zero the default step is never
      // current, so interpolate straight from the last start step to the last
      // end step. 0.01 absorbs floating-point imprecision.
      if (endShiftOffset < 0.01 && startKeylineSteps.length === 2 && endKeylineSteps.length === 2) {
        lastStartAndEndKeylineListSteps ??= [
          startKeylineSteps[startKeylineSteps.length - 1]!,
          endKeylineSteps[endKeylineSteps.length - 1]!,
        ]
        steps = lastStartAndEndKeylineListSteps
      }
    }

    let fromStepIndex = 0
    let toStepIndex = 0
    let steppedInterpolation = 0
    let lowerBounds = shiftPoints[0]!
    for (let i = 1; i < steps.length; i += 1) {
      const upperBounds = shiftPoints[i]!
      if (interpolation <= upperBounds) {
        fromStepIndex = i - 1
        toStepIndex = i
        steppedInterpolation = lerpRange(0, 1, lowerBounds, upperBounds, interpolation)
        break
      }
      lowerBounds = upperBounds
    }

    if (roundToNearestStep) {
      // The source rounds the step fraction and so breaks a tie towards the next
      // step. That fraction arrives through two normalizations, and at exactly
      // half way the residue can fall either side of 0.5 depending on the
      // precision it was computed in: the pinned mid-step case yields
      // 0.50000006 in the source's `Float` and 0.4999999999999999 in a double.
      // Comparing with a tolerance keeps the sourced tie-breaking instead of
      // letting it depend on which precision produced the number.
      return steps[steppedInterpolation >= 0.5 - 1e-9 ? toStepIndex : fromStepIndex]!
    }

    return lerpKeylineList(steps[fromStepIndex]!, steps[toStepIndex]!, steppedInterpolation)
  }

  return {
    defaultKeylines,
    startKeylineSteps,
    endKeylineSteps,
    availableSpace,
    itemSpacing,
    beforeContentPadding,
    afterContentPadding,
    minItemSize,
    maxItemSize,
    itemMainAxisSize,
    smallestVisibleItemSize,
    isValid,
    startShiftDistance,
    endShiftDistance,
    getKeylineListForScrollOffset(scrollOffset, maxScrollOffset, roundToNearestStep = false) {
      if (
        scrollOffset === cachedScrollOffset &&
        maxScrollOffset === cachedMaxScrollOffset &&
        roundToNearestStep === cachedRoundToNearestStep &&
        cachedKeylineList !== null
      ) {
        return cachedKeylineList
      }
      const result = computeKeylineList(scrollOffset, maxScrollOffset, roundToNearestStep)
      cachedScrollOffset = scrollOffset
      cachedMaxScrollOffset = maxScrollOffset
      cachedRoundToNearestStep = roundToNearestStep
      cachedKeylineList = result
      return result
    },
  }
}

export function strategiesEqual(a: Strategy, b: Strategy): boolean {
  if (a === b) return true
  // Two invalid strategies are interchangeable.
  if (!a.isValid && !b.isValid) return true
  if (a.isValid !== b.isValid) return false
  if (a.availableSpace !== b.availableSpace) return false
  if (a.itemSpacing !== b.itemSpacing) return false
  if (a.beforeContentPadding !== b.beforeContentPadding) return false
  if (a.afterContentPadding !== b.afterContentPadding) return false
  if (a.itemMainAxisSize !== b.itemMainAxisSize) return false
  if (a.startShiftDistance !== b.startShiftDistance) return false
  if (a.endShiftDistance !== b.endShiftDistance) return false
  // Every other keyline list derives from the defaults, so comparing them is
  // sufficient.
  return keylineListsEqual(a.defaultKeylines, b.defaultKeylines)
}

/** Deterministic identity for a strategy — see {@link keylineListKey}. */
export function strategyKey(strategy: Strategy): string {
  if (!strategy.isValid) return 'invalid'
  return [
    strategy.availableSpace,
    strategy.itemSpacing,
    strategy.beforeContentPadding,
    strategy.afterContentPadding,
    strategy.itemMainAxisSize,
    strategy.startShiftDistance,
    strategy.endShiftDistance,
    keylineListKey(strategy.defaultKeylines),
  ].join('/')
}

/**
 * The offset from the container's start needed to snap the item at `itemIndex`
 * into a focal position.
 *
 * Items in the middle of the list all snap the first focal keyline to its
 * resting place. Items near either end snap using the corresponding shift step,
 * because those items only become focal once the range has shifted.
 */
export function getSnapPositionOffset(
  strategy: Strategy,
  itemIndex: number,
  itemCount: number,
): number {
  if (!strategy.isValid) return 0

  let offset = Math.round(
    firstFocalKeyline(strategy.defaultKeylines).unadjustedOffset - strategy.itemMainAxisSize / 2,
  )

  const lastStartStepIndex = strategy.startKeylineSteps.length - 1
  if (itemIndex <= lastStartStepIndex) {
    // Steps run from the default step to the furthest start step, so an item's
    // index counts backwards through them.
    const stepIndex = Math.min(Math.max(lastStartStepIndex - itemIndex, 0), lastStartStepIndex)
    const startKeylines = strategy.startKeylineSteps[stepIndex]!
    offset = Math.round(
      firstFocalKeyline(startKeylines).unadjustedOffset - strategy.itemMainAxisSize / 2,
    )
  }

  const lastItemIndex = itemCount - 1
  const lastEndStepIndex = strategy.endKeylineSteps.length - 1
  if (
    itemIndex >= lastItemIndex - lastEndStepIndex &&
    // When every item lands on a focal keyline there is nothing to shift.
    itemCount > strategy.defaultKeylines.focalCount
  ) {
    const stepIndex = Math.min(
      Math.max(lastEndStepIndex - (lastItemIndex - itemIndex), 0),
      lastEndStepIndex,
    )
    const endKeylines = strategy.endKeylineSteps[stepIndex]!
    offset = Math.round(
      lastFocalKeyline(endKeylines).unadjustedOffset - strategy.itemMainAxisSize / 2,
    )
  }

  return offset
}

/** The greatest scroll offset the container can reach. */
export function calculateMaxScrollOffset(strategy: Strategy, itemCount: number): number {
  const maxScrollPossible =
    strategy.itemMainAxisSize * itemCount + strategy.itemSpacing * (itemCount - 1)
  return Math.max(maxScrollPossible - strategy.availableSpace, 0)
}

/**
 * How far `unadjustedOffset` sits between two keylines, as a fraction. Equal
 * keylines mean the item is beyond the first or last one, which reads as fully
 * arrived.
 */
export function getProgress(before: Keyline, after: Keyline, unadjustedOffset: number): number {
  if (keylinesEqual(before, after)) return 1
  const total = after.unadjustedOffset - before.unadjustedOffset
  return (unadjustedOffset - before.unadjustedOffset) / total
}
