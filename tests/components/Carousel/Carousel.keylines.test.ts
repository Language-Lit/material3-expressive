/**
 * The pinned host tests for the carousel layout engine, ported case for case.
 *
 * Upstream runs these on the JVM with no Compose runtime, so they are the one
 * part of the family whose expected values transfer without adaptation: every
 * number below is the number `ArrangementTest.kt`, `KeylineTest.kt`,
 * `MultiBrowseTest.kt`, `UncontainedTest.kt`, and `CenteredHeroTest.kt` assert
 * at revision `a90df2fc27e026b9ad2ed569f203a260c1041fab`. Where upstream writes
 * an expression rather than a literal, so does this file, because that is what
 * keeps the two comparable.
 *
 * The only systematic change is the API shape the port required: keyword
 * arguments become an options object, `keylineListOf`'s two overloads become
 * `keylineListWithAlignment` and `keylineListWithPivot`, `KeylineList` members
 * become functions over a `keylines` array, and the density parameter is gone
 * because these are already CSS pixels.
 */

import { findLowestCostArrangement } from '../../../src/components/Carousel/arrangement'
import {
  carouselSizingDefaults,
  firstFocalKeyline,
  firstIndexAfterFocalRangeWithSize,
  firstNonAnchorKeyline,
  heroKeylineList,
  keylineAfter,
  keylineBefore,
  keylineListKey,
  keylineListsEqual,
  keylineListWithAlignment,
  keylineListWithPivot,
  lastIndexBeforeFocalRangeWithSize,
  lastNonAnchorKeyline,
  lerpKeylineList,
  multiBrowseKeylineList,
  uncontainedKeylineList,
} from '../../../src/components/Carousel/keylines'
import { createStrategy } from '../../../src/components/Carousel/strategy'

const { minSmallItemSize, maxSmallItemSize, anchorSize } = carouselSizingDefaults

/** `StrategyTest`'s shared sizes, which `KeylineTest` also borrows. */
const large = 100
const small = 20
const medium = (large + small) / 2
const xSmall = 5

describe('Arrangement — pinned ArrangementTest cases', () => {
  it('makes no adjustment when the arrangement already fits (test1L1M1S_noAdjustmentsMade)', () => {
    const targetSmallSize = 56
    const targetLargeSize = 56 * 3
    const targetMediumSize = (targetLargeSize + targetSmallSize) / 2

    const arrangement = findLowestCostArrangement({
      availableSpace: targetLargeSize + targetMediumSize + targetSmallSize,
      itemSpacing: 0,
      targetSmallSize,
      minSmallSize: 40,
      maxSmallSize: 56,
      smallCounts: [1],
      targetMediumSize,
      mediumCounts: [1],
      targetLargeSize,
      largeCounts: [1],
    })

    expect(arrangement?.largeSize).toBe(targetLargeSize)
    expect(arrangement?.mediumSize).toBe(targetMediumSize)
    expect(arrangement?.smallSize).toBe(targetSmallSize)
  })

  it('decreases the small size before the large one (test1L1M1S_decreasesSmallSize)', () => {
    const targetSmallSize = 56
    const targetLargeSize = 56 * 3
    const targetMediumSize = (targetLargeSize + targetSmallSize) / 2

    const arrangement = findLowestCostArrangement({
      availableSpace: targetLargeSize + targetMediumSize + targetSmallSize - 10,
      itemSpacing: 0,
      targetSmallSize,
      minSmallSize: 40,
      maxSmallSize: 56,
      smallCounts: [1],
      targetMediumSize,
      mediumCounts: [1],
      targetLargeSize,
      largeCounts: [1],
    })

    expect(arrangement?.largeSize).toBe(targetLargeSize)
    expect(Math.round(arrangement!.mediumSize)).toBe(Math.round(targetMediumSize))
    expect(arrangement?.smallSize).toBe(targetSmallSize - 10)
  })

  it('increases the small size before the large one (test1L1M1S_increasesSmallSize)', () => {
    const targetSmallSize = 40
    const targetLargeSize = 40 * 3
    const targetMediumSize = (targetLargeSize + targetSmallSize) / 2

    const arrangement = findLowestCostArrangement({
      availableSpace: targetLargeSize + targetMediumSize + targetSmallSize + 10,
      itemSpacing: 0,
      targetSmallSize,
      minSmallSize: 40,
      maxSmallSize: 56,
      smallCounts: [1],
      targetMediumSize,
      mediumCounts: [1],
      targetLargeSize,
      largeCounts: [1],
    })

    expect(arrangement?.largeSize).toBe(targetLargeSize)
    expect(Math.round(arrangement!.mediumSize)).toBe(Math.round(targetMediumSize))
    expect(arrangement?.smallSize).toBe(targetSmallSize + 10)
  })

  it('flexes the medium size down to protect the large one (test1L1M1S_decreasesMediumSize)', () => {
    const targetSmallSize = 40
    const targetLargeSize = 40 * 3
    const targetMediumSize = (targetLargeSize + targetSmallSize) / 2
    const mediumAdjustment = targetMediumSize * 0.05

    const arrangement = findLowestCostArrangement({
      availableSpace: targetLargeSize + targetMediumSize + targetSmallSize - mediumAdjustment,
      itemSpacing: 0,
      targetSmallSize,
      minSmallSize: 40,
      maxSmallSize: 56,
      smallCounts: [1],
      targetMediumSize,
      mediumCounts: [1],
      targetLargeSize,
      largeCounts: [1],
    })

    expect(arrangement?.largeSize).toBe(targetLargeSize)
    expect(Math.round(arrangement!.mediumSize)).toBe(Math.round(targetMediumSize - mediumAdjustment))
    expect(arrangement?.smallSize).toBe(targetSmallSize)
  })

  it('flexes the medium size up to protect the large one (test1L1M1S_increasesMediumSize)', () => {
    const targetSmallSize = 56
    const targetLargeSize = 56 * 3
    const targetMediumSize = (targetLargeSize + targetSmallSize) / 2
    const mediumAdjustment = targetMediumSize * 0.05

    const arrangement = findLowestCostArrangement({
      availableSpace: targetLargeSize + targetMediumSize + targetSmallSize + mediumAdjustment,
      itemSpacing: 0,
      targetSmallSize,
      minSmallSize: 40,
      maxSmallSize: 56,
      smallCounts: [1],
      targetMediumSize,
      mediumCounts: [1],
      targetLargeSize,
      largeCounts: [1],
    })

    expect(arrangement?.largeSize).toBe(targetLargeSize)
    expect(Math.round(arrangement!.mediumSize)).toBe(Math.round(targetMediumSize + mediumAdjustment))
    expect(arrangement?.smallSize).toBe(targetSmallSize)
  })

  it('spreads a small increase across two small items (test1L1M2S_increasesSmallSize)', () => {
    const targetSmallSize = 40
    const targetLargeSize = 40 * 3
    const targetMediumSize = (targetLargeSize + targetSmallSize) / 2
    const smallAdjustment = 10

    const arrangement = findLowestCostArrangement({
      availableSpace:
        targetLargeSize + targetMediumSize + targetSmallSize * 2 + smallAdjustment * 2,
      itemSpacing: 0,
      targetSmallSize,
      minSmallSize: 40,
      maxSmallSize: 56,
      smallCounts: [2],
      targetMediumSize,
      mediumCounts: [1],
      targetLargeSize,
      largeCounts: [1],
    })

    expect(arrangement?.largeSize).toBe(targetLargeSize)
    expect(Math.round(arrangement!.mediumSize)).toBe(Math.round(targetMediumSize))
    expect(arrangement?.smallSize).toBe(targetSmallSize + smallAdjustment)
  })

  it('spreads a small decrease across two small items (test1L1M2S_decreasesSmallSize)', () => {
    const targetSmallSize = 56
    const targetLargeSize = 56 * 3
    const targetMediumSize = (targetLargeSize + targetSmallSize) / 2
    const smallAdjustment = 10

    const arrangement = findLowestCostArrangement({
      availableSpace:
        targetLargeSize + targetMediumSize + targetSmallSize * 2 - smallAdjustment * 2,
      itemSpacing: 0,
      targetSmallSize,
      minSmallSize: 40,
      maxSmallSize: 56,
      smallCounts: [2],
      targetMediumSize,
      mediumCounts: [1],
      targetLargeSize,
      largeCounts: [1],
    })

    expect(arrangement?.largeSize).toBe(targetLargeSize)
    expect(Math.round(arrangement!.mediumSize)).toBe(Math.round(targetMediumSize))
    expect(arrangement?.smallSize).toBe(targetSmallSize - smallAdjustment)
  })

  it('flexes two medium items up (test2L2M2S_increasesMediumSize)', () => {
    const targetSmallSize = 56
    const targetLargeSize = 56 * 3
    const targetMediumSize = (targetLargeSize + targetSmallSize) / 2
    const mediumAdjustment = targetMediumSize * 0.05

    const arrangement = findLowestCostArrangement({
      availableSpace:
        targetLargeSize * 2 + targetMediumSize * 2 + targetSmallSize * 2 + mediumAdjustment * 2,
      itemSpacing: 0,
      targetSmallSize,
      minSmallSize: 40,
      maxSmallSize: 56,
      smallCounts: [2],
      targetMediumSize,
      mediumCounts: [2],
      targetLargeSize,
      largeCounts: [2],
    })

    expect(arrangement?.largeSize).toBe(targetLargeSize)
    expect(Math.round(arrangement!.mediumSize)).toBe(Math.round(targetMediumSize + mediumAdjustment))
    expect(arrangement?.smallSize).toBe(targetSmallSize)
  })

  it('flexes two medium items down (test2L2M2S_decreasesMediumSize)', () => {
    const targetSmallSize = 40
    const targetLargeSize = 40 * 3
    const targetMediumSize = (targetLargeSize + targetSmallSize) / 2
    const mediumAdjustment = targetMediumSize * 0.05

    const arrangement = findLowestCostArrangement({
      availableSpace:
        targetLargeSize * 2 + targetMediumSize * 2 + targetSmallSize * 2 - mediumAdjustment * 2,
      itemSpacing: 0,
      targetSmallSize,
      minSmallSize: 40,
      maxSmallSize: 56,
      smallCounts: [2],
      targetMediumSize,
      mediumCounts: [2],
      targetLargeSize,
      largeCounts: [2],
    })

    expect(arrangement?.largeSize).toBe(targetLargeSize)
    expect(Math.round(arrangement!.mediumSize)).toBe(Math.round(targetMediumSize - mediumAdjustment))
    expect(arrangement?.smallSize).toBe(targetSmallSize)
  })
})

describe('KeylineList — pinned KeylineTest cases', () => {
  const LargeSize = 100
  const SmallSize = 20
  const XSmallSize = 5
  const MediumSize = (LargeSize + SmallSize) / 2

  /** The upstream fixture arrangement `[xs-s-s-m-l-l-m-s-s-xs]`. */
  const createTestKeylineList = () =>
    keylineListWithAlignment(
      XSmallSize * 2 + SmallSize * 4 + MediumSize * 2 + LargeSize * 2,
      0,
      'center',
      (add) => {
        add(XSmallSize, true)
        add(SmallSize)
        add(SmallSize)
        add(MediumSize)
        add(LargeSize)
        add(LargeSize)
        add(MediumSize)
        add(SmallSize)
        add(SmallSize)
        add(XSmallSize, true)
      },
    )

  it('finds the first and last focal keylines', () => {
    const list = createTestKeylineList()
    expect(list.firstFocalIndex).toBe(4)
    expect(list.lastFocalIndex).toBe(5)
  })

  it('pivots with the correct trailing cutoff', () => {
    const carouselMainAxisSize = LargeSize + Math.round(MediumSize * 0.75)
    const list = keylineListWithAlignment(carouselMainAxisSize, 0, 'start', (add) => {
      add(SmallSize, true)
      add(LargeSize)
      add(MediumSize)
      add(SmallSize, true)
    })

    expect(list.keylines[2]!.cutoff).toBe(MediumSize - Math.round(MediumSize * 0.75))
  })

  it('pivots with the correct leading cutoff', () => {
    const carouselMainAxisSize = Math.round(MediumSize * 0.75) + LargeSize
    const list = keylineListWithAlignment(carouselMainAxisSize, 0, 'end', (add) => {
      add(SmallSize, true)
      add(MediumSize)
      add(LargeSize)
      add(SmallSize, true)
    })

    expect(list.keylines[1]!.cutoff).toBe(MediumSize * 0.25)
  })

  it('finds the first index after the focal range with a size', () => {
    expect(firstIndexAfterFocalRangeWithSize(createTestKeylineList(), SmallSize)).toBe(7)
  })

  it('finds the last index before the focal range with a size', () => {
    expect(lastIndexBeforeFocalRangeWithSize(createTestKeylineList(), SmallSize)).toBe(2)
  })

  it('returns the keyline before an unadjusted offset', () => {
    const list = createTestKeylineList()
    expect(keylineBefore(list, 60)).toBe(list.keylines[3])
    expect(keylineBefore(list, -Number.MAX_VALUE)).toBe(list.keylines[0])
    expect(keylineBefore(list, Number.MAX_VALUE)).toBe(list.keylines[list.keylines.length - 1])
  })

  it('returns the keyline after an unadjusted offset', () => {
    const list = createTestKeylineList()
    expect(keylineAfter(list, 60)).toBe(list.keylines[4])
    expect(keylineAfter(list, -Number.MAX_VALUE)).toBe(list.keylines[0])
    expect(keylineAfter(list, Number.MAX_VALUE)).toBe(list.keylines[list.keylines.length - 1])
  })

  it('interpolates between two keyline lists', () => {
    const carouselMainAxisSize = large + medium + small
    const from = keylineListWithPivot(carouselMainAxisSize, 0, 1, large / 2, (add) => {
      add(xSmall, true)
      add(large)
      add(medium)
      add(small)
      add(xSmall, true)
    })
    const to = keylineListWithPivot(carouselMainAxisSize, 0, 2, small + large / 2, (add) => {
      add(xSmall, true)
      add(small)
      add(large)
      add(medium)
      add(xSmall, true)
    })

    // Built from the keyline values directly rather than through a builder: a
    // builder would recompute offsets from a pivot and so differ from a direct
    // interpolation, which is the upstream comment on this case too.
    const half = [
      { size: xSmall, offset: -2.5, unadjustedOffset: -90, isFocal: false, isAnchor: true, isPivot: false, cutoff: 0 },
      { size: 60, offset: 30, unadjustedOffset: 10, isFocal: false, isAnchor: false, isPivot: false, cutoff: 0 },
      { size: 80, offset: 100, unadjustedOffset: 110, isFocal: true, isAnchor: false, isPivot: true, cutoff: 0 },
      { size: 40, offset: 160, unadjustedOffset: 210, isFocal: false, isAnchor: false, isPivot: false, cutoff: 0 },
      { size: xSmall, offset: 182.5, unadjustedOffset: 310, isFocal: false, isAnchor: true, isPivot: false, cutoff: 0 },
    ]

    expect(keylineListsEqual(lerpKeylineList(from, to, 0), from)).toBe(true)
    expect(keylineListsEqual(lerpKeylineList(from, to, 1), to)).toBe(true)
    expect(lerpKeylineList(from, to, 0.5).keylines).toEqual(half)
  })

  it('treats identical keyline lists as equal', () => {
    const build = () =>
      keylineListWithAlignment(120, 0, 'start', (add) => {
        add(10, true)
        add(100)
        add(20)
        add(10, true)
      })

    expect(keylineListsEqual(build(), build())).toBe(true)
    expect(keylineListKey(build())).toBe(keylineListKey(build()))
  })

  it('treats keyline lists with a differently sized item as unequal', () => {
    const first = keylineListWithAlignment(120, 0, 'start', (add) => {
      add(11, true)
      add(100)
      add(20)
      add(10, true)
    })
    const second = keylineListWithAlignment(120, 0, 'start', (add) => {
      add(10, true)
      add(100)
      add(20)
      add(10, true)
    })

    expect(keylineListsEqual(first, second)).toBe(false)
    expect(keylineListKey(first)).not.toBe(keylineListKey(second))
  })

  it('adds spacing between start-aligned items', () => {
    const list = keylineListWithAlignment(380, 8, 'start', (add) => {
      add(10, true)
      add(186)
      add(122)
      add(56)
      add(10, true)
    })

    expect(list.keylines.map((k) => k.offset)).toEqual([-13, 93, 255, 352, 393])
    expect(list.keylines.map((k) => k.unadjustedOffset)).toEqual([-101, 93, 287, 481, 675])
  })

  it('adds spacing between center-aligned items', () => {
    const list = keylineListWithAlignment(768, 8, 'center', (add) => {
      add(10, true)
      add(56)
      add(122)
      add(186)
      add(186)
      add(122)
      add(56)
      add(10, true)
    })

    expect(list.keylines.map((k) => k.offset)).toEqual([-13, 28, 125, 287, 481, 643, 740, 781])
    expect(list.keylines.map((k) => k.unadjustedOffset)).toEqual([
      -295, -101, 93, 287, 481, 675, 869, 1063,
    ])
  })

  it('adds spacing between end-aligned items', () => {
    const list = keylineListWithAlignment(380, 8, 'end', (add) => {
      add(10, true)
      add(56)
      add(122)
      add(186)
      add(10, true)
    })

    expect(list.keylines.map((k) => k.offset)).toEqual([-13, 28, 125, 287, 393])
    expect(list.keylines.map((k) => k.unadjustedOffset)).toEqual([-295, -101, 93, 287, 481])
  })
})

describe('multi-browse layout — pinned MultiBrowseTest cases', () => {
  const strategyFor = (list: ReturnType<typeof multiBrowseKeylineList>, availableSpace: number) =>
    createStrategy({
      defaultKeylines: list,
      availableSpace,
      itemSpacing: 0,
      beforeContentPadding: 0,
      afterContentPadding: 0,
    })

  it('does not resize the large item when there is enough room', () => {
    const itemSize = 120
    const list = multiBrowseKeylineList({
      carouselMainAxisSize: 500,
      preferredItemSize: itemSize,
      itemSpacing: 0,
      itemCount: 10,
    })

    expect(strategyFor(list, 500).itemMainAxisSize).toBe(itemSize)
  })

  it('resizes an item larger than the container to fit one small item', () => {
    const list = multiBrowseKeylineList({
      carouselMainAxisSize: 100,
      preferredItemSize: 200,
      itemSpacing: 0,
      itemCount: 10,
    })
    const strategy = strategyFor(list, 100)
    const keylines = strategy.defaultKeylines.keylines

    // [xSmall-Large-Small-xSmall]
    expect(strategy.itemMainAxisSize).toBeLessThanOrEqual(100)
    expect(keylines).toHaveLength(4)
    expect(keylines[0]!.unadjustedOffset).toBeLessThan(0)
    expect(keylines[keylines.length - 1]!.unadjustedOffset).toBeGreaterThan(100)
    expect(keylines[1]!.isFocal).toBe(true)
    expect(keylines[2]!.size).toBe(minSmallItemSize)
  })

  it('has no small items when there is not enough room', () => {
    const list = multiBrowseKeylineList({
      carouselMainAxisSize: minSmallItemSize,
      preferredItemSize: 200,
      itemSpacing: 0,
      itemCount: 10,
    })
    const strategy = strategyFor(list, minSmallItemSize)

    expect(strategy.itemMainAxisSize).toBe(minSmallItemSize)
    expect(firstFocalKeyline(strategy.defaultKeylines)).toBe(
      firstNonAnchorKeyline(strategy.defaultKeylines),
    )
    expect(strategy.defaultKeylines.lastFocalIndex).toBe(
      strategy.defaultKeylines.lastNonAnchorIndex,
    )
  })

  it('is empty when the available space is zero', () => {
    const list = multiBrowseKeylineList({
      carouselMainAxisSize: 0,
      preferredItemSize: 200,
      itemSpacing: 0,
      itemCount: 10,
    })
    expect(list.keylines).toHaveLength(0)
  })

  it('adjusts the medium size to be proportional', () => {
    const preferredItemSize = 200
    const carouselSize = preferredItemSize * 2 + maxSmallItemSize * 2
    const list = multiBrowseKeylineList({
      carouselMainAxisSize: carouselSize,
      preferredItemSize,
      itemSpacing: 0,
      itemCount: 10,
    })
    const keylines = strategyFor(list, carouselSize).defaultKeylines.keylines

    // [xSmall-Large-Large-Medium-Small-xSmall]
    expect(keylines).toHaveLength(6)
    expect(keylines[1]!.isFocal).toBe(true)
    expect(keylines[2]!.isFocal).toBe(true)
    expect(keylines[3]!.size).toBeLessThan(keylines[2]!.size)
    expect(keylines[4]!.size).toBeLessThan(keylines[3]!.size)
  })

  it('drops a keyline when there are fewer items than keylines', () => {
    const preferredItemSize = 200
    const carouselSize = preferredItemSize * 2 + maxSmallItemSize * 2
    const list = multiBrowseKeylineList({
      carouselMainAxisSize: carouselSize,
      preferredItemSize,
      itemSpacing: 0,
      itemCount: 3,
    })
    const keylines = strategyFor(list, carouselSize).defaultKeylines.keylines

    // [xSmall-Large-Large-Small-xSmall] rather than the six-keyline default
    expect(keylines).toHaveLength(5)
    expect(keylines[1]!.isFocal).toBe(true)
    expect(keylines[2]!.isFocal).toBe(true)
    expect(keylines[3]!.size).toBeLessThan(keylines[2]!.size)
  })

  it('adjusts for item spacing', () => {
    const list = multiBrowseKeylineList({
      carouselMainAxisSize: 380,
      preferredItemSize: 186,
      itemSpacing: 8,
      itemCount: 10,
    })
    const strategy = createStrategy({
      defaultKeylines: list,
      availableSpace: 380,
      itemSpacing: 8,
      beforeContentPadding: 0,
      afterContentPadding: 0,
    })

    expect(firstFocalKeyline(list).size).toBe(186)
    // The first visible item is large and flush with the container start.
    expect(firstFocalKeyline(list).offset).toBe(186 / 2)
    // The last visible item is flush with the container end.
    expect(lastNonAnchorKeyline(list).offset + lastNonAnchorKeyline(list).size / 2).toBe(380)

    expect(strategy.itemMainAxisSize).toBe(186)
    const lastVisible = strategy.defaultKeylines.keylines[3]!
    expect(lastVisible.size).toBe(56)
    expect(lastVisible.offset).toBe(380 - 56 / 2)

    const maxScrollOffset = 186 * 10 + 8 * 10 - 380
    expect(
      strategy.getKeylineListForScrollOffset(0, maxScrollOffset).keylines.map((k) => k.unadjustedOffset),
    ).toEqual([-101, 93, 287, 481, 675])
  })
})

describe('uncontained layout — pinned UncontainedTest cases', () => {
  const strategyFor = (list: ReturnType<typeof uncontainedKeylineList>, availableSpace: number) =>
    createStrategy({
      defaultKeylines: list,
      availableSpace,
      itemSpacing: 0,
      beforeContentPadding: 0,
      afterContentPadding: 0,
    })

  it('fills the container when the item is exactly its width', () => {
    const carouselSize = 500
    const list = uncontainedKeylineList({
      carouselMainAxisSize: carouselSize,
      itemSize: 500,
      itemSpacing: 0,
    })
    const keylines = strategyFor(list, carouselSize).defaultKeylines.keylines

    // [xSmall-large-xSmall] with both anchors outside the container
    expect(keylines).toHaveLength(3)
    expect(keylines[0]!.offset).toBe(-anchorSize / 2)
    expect(keylines[1]!.size).toBe(carouselSize)
    expect(keylines[2]!.offset).toBe(carouselSize + anchorSize / 2)
  })

  it('clamps an item larger than the container', () => {
    const carouselSize = 400
    const list = uncontainedKeylineList({
      carouselMainAxisSize: carouselSize,
      itemSize: 500,
      itemSpacing: 0,
    })
    const keylines = strategyFor(list, carouselSize).defaultKeylines.keylines

    expect(keylines).toHaveLength(3)
    expect(keylines[0]!.offset).toBe(-anchorSize / 2)
    expect(keylines[1]!.size).toBe(carouselSize)
    expect(keylines[2]!.offset).toBe(carouselSize + anchorSize / 2)
  })

  it('fits two items larger than half the container', () => {
    const carouselSize = 1000
    const itemSize = 501
    const list = uncontainedKeylineList({
      carouselMainAxisSize: carouselSize,
      itemSize,
      itemSpacing: 0,
    })
    const keylines = strategyFor(list, carouselSize).defaultKeylines.keylines

    expect(keylines).toHaveLength(4)
    expect(keylines[0]!.offset).toBe(-125.25)
    expect(keylines[1]!.size).toBe(itemSize)
    expect(keylines[2]!.size).toBe(itemSize)
    expect(keylines[3]!.size).toBe(anchorSize)
    expect(keylines[3]!.offset).toBe(itemSize * 2 + anchorSize / 2)
  })

  it('sizes the cut-off item so a third of it is hidden', () => {
    const carouselSize = 400
    const itemSize = 125
    const list = uncontainedKeylineList({
      carouselMainAxisSize: carouselSize,
      itemSize,
      itemSpacing: 0,
    })
    const keylines = strategyFor(list, carouselSize).defaultKeylines.keylines

    // [xSmall-large-large-large-medium-xSmall]
    expect(keylines).toHaveLength(6)
    expect(keylines[1]!.size).toBe(itemSize)
    expect(keylines[2]!.size).toBe(itemSize)
    expect(keylines[3]!.size).toBe(itemSize)
    expect(keylines[4]!.size).toBe(25 * 1.5)
    expect(keylines[4]!.offset).toBe(393.75)
    // The leading anchor is half the medium size.
    expect(keylines[0]!.size).toBe(18.75)
    expect(keylines[0]!.offset).toBe(-9.375)
    expect(keylines[5]!.size).toBe(anchorSize)
    expect(keylines[5]!.offset).toBe(itemSize * 3 + 25 * 1.5 + anchorSize / 2)
  })

  it('caps the cut-off item when a third would be too close to large', () => {
    const carouselSize = 400
    const itemSize = 105
    const list = uncontainedKeylineList({
      carouselMainAxisSize: carouselSize,
      itemSize,
      itemSpacing: 0,
    })
    const keylines = strategyFor(list, carouselSize).defaultKeylines.keylines

    expect(keylines).toHaveLength(6)
    expect(keylines[1]!.size).toBe(itemSize)
    expect(keylines[2]!.size).toBe(itemSize)
    expect(keylines[3]!.size).toBe(itemSize)
    // remainingSpace * 120%
    expect(keylines[4]!.size).toBe(85 * 1.2)
    expect(keylines[0]!.size).toBe(85 * 1.2 * 0.5)
    expect(keylines[5]!.size).toBe(anchorSize)
    expect(keylines[0]!.offset).toBe(-(85 * 1.2 * 0.5) / 2)
    expect(keylines[5]!.offset).toBe(itemSize * 3 + 85 * 1.2 + anchorSize / 2)
  })
})

describe('centered hero layout — pinned CenteredHeroTest cases', () => {
  const strategyFor = (list: ReturnType<typeof heroKeylineList>, availableSpace: number, itemSpacing = 0) =>
    createStrategy({
      defaultKeylines: list,
      availableSpace,
      itemSpacing,
      beforeContentPadding: 0,
      afterContentPadding: 0,
    })

  it('fits one large and two small items when there is room', () => {
    const size = 100 + 40 + 40
    const list = heroKeylineList({
      carouselMainAxisSize: size,
      maxItemSize: null,
      itemSpacing: 0,
      itemCount: 6,
      isCentered: true,
    })
    expect(strategyFor(list, size).itemMainAxisSize).toBe(100)
  })

  it('falls back to a start-aligned arrangement below three items', () => {
    const size = 100 + 40 + 40
    const list = heroKeylineList({
      carouselMainAxisSize: size,
      maxItemSize: null,
      itemSpacing: 0,
      itemCount: 2,
      isCentered: true,
    })
    const strategy = strategyFor(list, size)

    expect(strategy.itemMainAxisSize).toBeGreaterThan(100)
    expect(strategy.defaultKeylines.firstFocalIndex).toBe(1)
  })

  it('goes full-bleed with a single item', () => {
    const size = 40 + 40 + 40
    const list = heroKeylineList({
      carouselMainAxisSize: size,
      maxItemSize: null,
      itemSpacing: 0,
      itemCount: 1,
      isCentered: true,
    })
    expect(strategyFor(list, size).itemMainAxisSize).toBe(120)
  })

  it('goes full-bleed below the fullscreen threshold', () => {
    const size = 40 + 40 + 40
    const list = heroKeylineList({
      carouselMainAxisSize: size,
      maxItemSize: null,
      itemSpacing: 0,
      itemCount: 6,
      isCentered: true,
    })
    expect(strategyFor(list, size).itemMainAxisSize).toBe(120)
  })

  it('aligns the first and last default items to the container without spacing', () => {
    const size = 300 * 3 + 40 + 40
    const list = heroKeylineList({
      carouselMainAxisSize: size,
      maxItemSize: 300,
      itemSpacing: 0,
      itemCount: 7,
      isCentered: true,
    })
    const keylines = strategyFor(list, size).defaultKeylines

    expect(firstNonAnchorKeyline(keylines).offset).toBe(20)
    expect(lastNonAnchorKeyline(keylines).offset).toBe(size - 20)
  })

  it('aligns the first and last default items to the container with spacing', () => {
    const size = 300 * 3 + 40 + 40
    const list = heroKeylineList({
      carouselMainAxisSize: size,
      maxItemSize: 300,
      itemSpacing: 12,
      itemCount: 7,
      isCentered: true,
    })
    const keylines = strategyFor(list, size, 12).defaultKeylines

    expect(firstNonAnchorKeyline(keylines).offset).toBe(20)
    expect(lastNonAnchorKeyline(keylines).offset).toBe(size - 20)
  })

  it('aligns the first and last default items with spacing and an even item count', () => {
    const size = 300 * 3 + 40 + 40
    const list = heroKeylineList({
      carouselMainAxisSize: size,
      maxItemSize: 300,
      itemSpacing: 12,
      itemCount: 10,
      isCentered: true,
    })
    const keylines = strategyFor(list, size, 12).defaultKeylines

    expect(firstNonAnchorKeyline(keylines).offset).toBe(20)
    expect(lastNonAnchorKeyline(keylines).offset).toBe(size - 20)
  })
})
