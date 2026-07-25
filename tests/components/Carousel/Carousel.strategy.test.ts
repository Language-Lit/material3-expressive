/**
 * The pinned `StrategyTest.kt` and `KeylineSnapPositionTest.kt` cases at
 * revision `a90df2fc27e026b9ad2ed569f203a260c1041fab`, ported case for case with
 * their expected values intact — see the header of `Carousel.keylines.test.ts`
 * for the systematic API differences the port required.
 */

import {
  firstFocalKeyline,
  firstNonAnchorKeyline,
  type Keyline,
  type KeylineList,
  keylineListKey,
  keylineListsEqual,
  keylineListWithAlignment,
  keylineListWithPivot,
  lastFocalKeyline,
  lastNonAnchorKeyline,
  emptyKeylineList,
  multiBrowseKeylineList,
} from '../../../src/components/Carousel/keylines'
import {
  createStrategy,
  getSnapPositionOffset,
  strategiesEqual,
  strategyKey,
  type Strategy,
} from '../../../src/components/Carousel/strategy'

const large = 100
const small = 20
const medium = (large + small) / 2
const xSmall = 5

const strategyOf = (
  defaultKeylines: KeylineList,
  availableSpace: number,
  itemSpacing = 0,
  beforeContentPadding = 0,
  afterContentPadding = 0,
): Strategy =>
  createStrategy({
    defaultKeylines,
    availableSpace,
    itemSpacing,
    beforeContentPadding,
    afterContentPadding,
  })

/** `[xs | s s m l l m s s | xs]` */
const createCenterAlignedKeylineList = () =>
  keylineListWithAlignment(
    small * 2 + medium + large * 2 + medium + small * 2,
    0,
    'center',
    (add) => {
      add(xSmall, true)
      add(small)
      add(small)
      add(medium)
      add(large)
      add(large)
      add(medium)
      add(small)
      add(small)
      add(xSmall, true)
    },
  )

/** `[xs | l m s | xs]` */
const createStartAlignedKeylineList = () =>
  keylineListWithAlignment(large + medium + small, 0, 'start', (add) => {
    add(xSmall, true)
    add(large)
    add(medium)
    add(small)
    add(xSmall, true)
  })

/** `[xs | l m m | xs]` with the large item bleeding past the container. */
const createStartAlignedCutoffKeylineList = (cutoff: number) =>
  keylineListWithAlignment(large + medium + medium, 0, 'start', (add) => {
    add(xSmall, true)
    add(large + cutoff)
    add(medium)
    add(medium)
    add(xSmall, true)
  })

/** `[xs | m m l | xs]` with the large item bleeding past the container. */
const createEndAlignedCutoffKeylineList = (cutoff: number) =>
  keylineListWithAlignment(large + medium + medium, 0, 'end', (add) => {
    add(xSmall, true)
    add(medium)
    add(medium)
    add(large + cutoff)
    add(xSmall, true)
  })

const expectKeylineWithin = (tolerance: number, actual: Keyline, expected: Keyline) => {
  expect(actual.size).toBeCloseTo(expected.size, 2)
  expect(Math.abs(actual.offset - expected.offset)).toBeLessThanOrEqual(tolerance)
  expect(Math.abs(actual.unadjustedOffset - expected.unadjustedOffset)).toBeLessThanOrEqual(0.01)
  expect(actual.isFocal).toBe(expected.isFocal)
  expect(actual.isAnchor).toBe(expected.isAnchor)
  expect(actual.isPivot).toBe(expected.isPivot)
  expect(Math.abs(actual.cutoff - expected.cutoff)).toBeLessThanOrEqual(tolerance)
}

describe('Strategy — pinned StrategyTest cases', () => {
  it('shifts a start-aligned strategy towards the end', () => {
    const itemCount = 10
    const carouselMainAxisSize = large + medium + small
    const maxScrollOffset = itemCount * large - carouselMainAxisSize
    const defaultKeylineList = createStartAlignedKeylineList()
    const strategy = strategyOf(defaultKeylineList, carouselMainAxisSize)

    expect(
      keylineListsEqual(
        strategy.getKeylineListForScrollOffset(0, maxScrollOffset),
        defaultKeylineList,
      ),
    ).toBe(true)

    const lastEndStepOffsets = [-2.5, 10, 50, 130, 182.5]
    const lastEndStepUnadjustedOffsets = [130 - 300, 130 - 200, 130 - 100, 130, 130 + 100]
    strategy
      .getKeylineListForScrollOffset(maxScrollOffset, maxScrollOffset)
      .keylines.forEach((keyline, i) => {
        expect(keyline.offset).toBe(lastEndStepOffsets[i])
        expect(keyline.unadjustedOffset).toBe(lastEndStepUnadjustedOffsets[i])
      })
  })

  it('shifts a start-aligned cutoff strategy to the end, keeping the cutoff', () => {
    const carouselMainAxisSize = large + medium + medium
    const cutoff = 50
    const defaultKeylineList = createStartAlignedCutoffKeylineList(cutoff)
    const strategy = strategyOf(defaultKeylineList, carouselMainAxisSize)
    const endKeylineList = strategy.endKeylineSteps[strategy.endKeylineSteps.length - 1]!

    expect(lastNonAnchorKeyline(defaultKeylineList).cutoff).toBe(cutoff)
    expect(
      firstNonAnchorKeyline(defaultKeylineList).offset -
        firstNonAnchorKeyline(defaultKeylineList).size / 2,
    ).toBe(0)
    expect(firstNonAnchorKeyline(endKeylineList).cutoff).toBe(cutoff)
    expect(
      firstNonAnchorKeyline(endKeylineList).offset - firstNonAnchorKeyline(endKeylineList).size / 2,
    ).toBe(-cutoff)
    expect(
      lastNonAnchorKeyline(endKeylineList).offset + lastNonAnchorKeyline(endKeylineList).size / 2,
    ).toBe(carouselMainAxisSize)
  })

  it('shifts an end-aligned cutoff strategy to the start, keeping the cutoff', () => {
    const carouselMainAxisSize = large + medium + medium
    const cutoff = 50
    const defaultKeylineList = createEndAlignedCutoffKeylineList(cutoff)
    const strategy = strategyOf(defaultKeylineList, carouselMainAxisSize)
    const startKeylineList = strategy.startKeylineSteps[strategy.startKeylineSteps.length - 1]!

    expect(firstNonAnchorKeyline(defaultKeylineList).cutoff).toBe(cutoff)
    expect(
      lastNonAnchorKeyline(defaultKeylineList).offset +
        lastNonAnchorKeyline(defaultKeylineList).size / 2,
    ).toBe(carouselMainAxisSize)
    expect(lastNonAnchorKeyline(startKeylineList).cutoff).toBe(cutoff)
    expect(
      firstNonAnchorKeyline(startKeylineList).offset -
        firstNonAnchorKeyline(startKeylineList).size / 2,
    ).toBe(0)
    expect(
      lastNonAnchorKeyline(startKeylineList).offset +
        lastNonAnchorKeyline(startKeylineList).size / 2,
    ).toBe(carouselMainAxisSize + cutoff)
  })

  it('skips the default keyline list when the shift ranges overlap', () => {
    const itemCount = 2
    const carouselMainAxisSize = large + small
    const maxScrollOffset = large * itemCount - carouselMainAxisSize
    const defaultKeylines = keylineListWithAlignment(carouselMainAxisSize, 0, 'start', (add) => {
      add(xSmall, true)
      add(large)
      add(small)
      add(xSmall, true)
    })
    const strategy = strategyOf(defaultKeylines, carouselMainAxisSize, 0, 24, 48)

    const startKeylineList = strategy.getKeylineListForScrollOffset(0, maxScrollOffset, false)
    expect(firstFocalKeyline(startKeylineList).offset).toBe(
      24 + firstFocalKeyline(startKeylineList).size / 2,
    )

    const endKeylineList = strategy.getKeylineListForScrollOffset(maxScrollOffset, maxScrollOffset, false)
    expect(lastFocalKeyline(endKeylineList).offset).toBe(
      carouselMainAxisSize - 48 - lastFocalKeyline(endKeylineList).size / 2,
    )

    // The midpoint must not be the default step: the strategy moves straight
    // from the last start step to the last end step.
    const midpointKeylineList = strategy.getKeylineListForScrollOffset(
      maxScrollOffset / 2,
      maxScrollOffset,
      true,
    )
    expect(midpointKeylineList.keylines.map((k) => k.offset)).not.toEqual(
      defaultKeylines.keylines.map((k) => k.offset),
    )
  })

  it('shifts a center-aligned strategy towards the start one keyline at a time', () => {
    const itemCount = 12
    const carouselMainAxisSize = small * 2 + medium + large * 2 + medium + small * 2
    const maxScrollOffset = itemCount * large - carouselMainAxisSize
    const strategy = strategyOf(createCenterAlignedKeylineList(), carouselMainAxisSize)

    const startSteps = [
      // default step - [xs | s s m l l m s s | xs]
      createCenterAlignedKeylineList(),
      // step 1 - [xs | s m l l m s s s | xs]
      keylineListWithPivot(carouselMainAxisSize, 0, 3, small * 1 + medium + large / 2, (add) => {
        add(xSmall, true)
        add(small)
        add(medium)
        add(large)
        add(large)
        add(medium)
        add(small)
        add(small)
        add(small)
        add(xSmall, true)
      }),
      // step 2 - [xs | m l l m s s s s | xs]
      keylineListWithPivot(carouselMainAxisSize, 0, 2, medium + large / 2, (add) => {
        add(xSmall, true)
        add(medium)
        add(large)
        add(large)
        add(medium)
        add(small)
        add(small)
        add(small)
        add(small)
        add(xSmall, true)
      }),
      // step 3 - [xs | l l m m s s s s | xs]
      keylineListWithPivot(carouselMainAxisSize, 0, 1, large / 2, (add) => {
        add(xSmall, true)
        add(large)
        add(large)
        add(medium)
        add(medium)
        add(small)
        add(small)
        add(small)
        add(small)
        add(xSmall, true)
      }),
    ]

    const shiftedStart = strategy.getKeylineListForScrollOffset(0, maxScrollOffset)
    expect(keylineListsEqual(shiftedStart, startSteps[startSteps.length - 1]!)).toBe(true)
    // The last shift places the first focal item against the container start.
    expect(firstFocalKeyline(shiftedStart).offset - firstFocalKeyline(shiftedStart).size / 2).toBe(0)

    const first = (list: KeylineList) => list.keylines[0]!
    const totalShiftStart =
      first(startSteps[startSteps.length - 1]!).unadjustedOffset - first(startSteps[0]!).unadjustedOffset
    const startStepsScrollOffsets = [
      totalShiftStart,
      totalShiftStart - (first(startSteps[1]!).unadjustedOffset - first(startSteps[0]!).unadjustedOffset),
      totalShiftStart - (first(startSteps[2]!).unadjustedOffset - first(startSteps[0]!).unadjustedOffset),
      totalShiftStart - (first(startSteps[3]!).unadjustedOffset - first(startSteps[0]!).unadjustedOffset),
    ]

    startStepsScrollOffsets.forEach((scroll, i) => {
      strategy
        .getKeylineListForScrollOffset(scroll, maxScrollOffset)
        .keylines.forEach((keyline, j) => {
          expectKeylineWithin(0.01, keyline, startSteps[i]!.keylines[j]!)
        })
    })
  })

  it('shifts a center-aligned strategy towards the end one keyline at a time', () => {
    const itemCount = 12
    const carouselMainAxisSize = small * 2 + medium + large * 2 + medium + small * 2
    const maxScrollOffset = itemCount * large - carouselMainAxisSize
    const strategy = strategyOf(createCenterAlignedKeylineList(), carouselMainAxisSize)

    const endSteps = [
      createCenterAlignedKeylineList(),
      // step 1: a small item moves from after the focal range to before it
      keylineListWithPivot(carouselMainAxisSize, 0, 5, small * 3 + medium + large / 2, (add) => {
        add(xSmall, true)
        add(small)
        add(small)
        add(small)
        add(medium)
        add(large)
        add(large)
        add(medium)
        add(small)
        add(xSmall, true)
      }),
      // step 2: another small item moves
      keylineListWithPivot(carouselMainAxisSize, 0, 6, small * 4 + medium + large / 2, (add) => {
        add(xSmall, true)
        add(small)
        add(small)
        add(small)
        add(small)
        add(medium)
        add(large)
        add(large)
        add(medium)
        add(xSmall, true)
      }),
      // step 3: the medium item moves
      keylineListWithPivot(carouselMainAxisSize, 0, 7, small * 4 + medium * 2 + large / 2, (add) => {
        add(xSmall, true)
        add(small)
        add(small)
        add(small)
        add(small)
        add(medium)
        add(medium)
        add(large)
        add(large)
        add(xSmall, true)
      }),
    ]

    const shiftedEnd = strategy.getKeylineListForScrollOffset(maxScrollOffset, maxScrollOffset)
    expect(keylineListsEqual(shiftedEnd, endSteps[endSteps.length - 1]!)).toBe(true)
    expect(lastFocalKeyline(shiftedEnd).offset + lastFocalKeyline(shiftedEnd).size / 2).toBe(
      carouselMainAxisSize,
    )

    const last = (list: KeylineList) => list.keylines[list.keylines.length - 1]!
    const totalShiftEnd =
      last(endSteps[0]!).unadjustedOffset - last(endSteps[endSteps.length - 1]!).unadjustedOffset
    const endStepsScrollOffsets = [
      maxScrollOffset - totalShiftEnd,
      maxScrollOffset - totalShiftEnd - (last(endSteps[1]!).unadjustedOffset - last(endSteps[0]!).unadjustedOffset),
      maxScrollOffset - totalShiftEnd - (last(endSteps[2]!).unadjustedOffset - last(endSteps[0]!).unadjustedOffset),
      maxScrollOffset - totalShiftEnd - (last(endSteps[3]!).unadjustedOffset - last(endSteps[0]!).unadjustedOffset),
    ]

    endStepsScrollOffsets.forEach((scroll, i) => {
      strategy
        .getKeylineListForScrollOffset(scroll, maxScrollOffset)
        .keylines.forEach((keyline, j) => {
          expectKeylineWithin(0.01, keyline, endSteps[i]!.keylines[j]!)
        })
    })

    // A non-exact offset rounds to the nearest whole step.
    const almostToStepOne =
      endStepsScrollOffsets[0]! + (endStepsScrollOffsets[1]! - endStepsScrollOffsets[0]!) * 0.75
    expect(
      keylineListsEqual(
        strategy.getKeylineListForScrollOffset(almostToStepOne, maxScrollOffset, true),
        endSteps[1]!,
      ),
    ).toBe(true)
    const halfWayToStepTwo =
      endStepsScrollOffsets[1]! + (endStepsScrollOffsets[2]! - endStepsScrollOffsets[1]!) * 0.5
    expect(
      keylineListsEqual(
        strategy.getKeylineListForScrollOffset(halfWayToStepTwo, maxScrollOffset, true),
        endSteps[2]!,
      ),
    ).toBe(true)
    const justPastStepTwo =
      endStepsScrollOffsets[2]! + (endStepsScrollOffsets[3]! - endStepsScrollOffsets[2]!) * 0.1
    expect(
      keylineListsEqual(
        strategy.getKeylineListForScrollOffset(justPastStepTwo, maxScrollOffset, true),
        endSteps[2]!,
      ),
    ).toBe(true)
  })

  it('treats strategies over the same available space as equal', () => {
    const build = (availableSpace: number) =>
      strategyOf(
        multiBrowseKeylineList({
          carouselMainAxisSize: availableSpace,
          preferredItemSize: large,
          itemSpacing: 0,
          itemCount: 10,
        }),
        availableSpace,
      )

    expect(strategiesEqual(build(500), build(500))).toBe(true)
    expect(strategyKey(build(500))).toBe(strategyKey(build(500)))
  })

  it('treats strategies over different available space as unequal', () => {
    const build = (availableSpace: number) =>
      strategyOf(
        multiBrowseKeylineList({
          carouselMainAxisSize: availableSpace,
          preferredItemSize: large,
          itemSpacing: 0,
          itemCount: 10,
        }),
        availableSpace,
      )

    expect(strategiesEqual(build(500), build(501))).toBe(false)
    expect(strategyKey(build(500))).not.toBe(strategyKey(build(501)))
  })

  it('never equates an invalid strategy with a valid one', () => {
    const valid = strategyOf(
      multiBrowseKeylineList({
        carouselMainAxisSize: 500,
        preferredItemSize: large,
        itemSpacing: 0,
        itemCount: 10,
      }),
      500,
    )
    const invalid = strategyOf(emptyKeylineList, 500)

    expect(strategiesEqual(valid, invalid)).toBe(false)
    expect(strategyKey(valid)).not.toBe(strategyKey(invalid))
  })

  it('returns the default keylines when the max scroll offset is negative', () => {
    const itemCount = 1
    const carouselMainAxisSize = large + medium + small
    const maxScrollOffset = itemCount * large - carouselMainAxisSize
    const defaultKeylineList = createStartAlignedKeylineList()
    const strategy = strategyOf(defaultKeylineList, carouselMainAxisSize)

    expect(
      keylineListsEqual(
        strategy.getKeylineListForScrollOffset(0, maxScrollOffset),
        defaultKeylineList,
      ),
    ).toBe(true)
  })

  it('accounts for item spacing in the end steps of a start-aligned strategy', () => {
    const availableSpace = 380
    const itemSpacing = 8
    const strategy = strategyOf(
      keylineListWithAlignment(availableSpace, itemSpacing, 'start', (add) => {
        add(10, true)
        add(186)
        add(122)
        add(56)
        add(10, true)
      }),
      availableSpace,
      itemSpacing,
    )

    const middleStep = strategy.endKeylineSteps[1]!
    expect(middleStep.keylines.map((k) => k.offset)).toEqual([-13, 28, 157, 319, 393])
    expect(middleStep.keylines.map((k) => k.unadjustedOffset)).toEqual([-231, -37, 157, 351, 545])

    const endStep = strategy.endKeylineSteps[2]!
    expect(endStep.keylines.map((k) => k.offset)).toEqual([-13, 28, 125, 287, 393])
    expect(endStep.keylines.map((k) => k.unadjustedOffset)).toEqual([-295, -101, 93, 287, 481])
  })

  it('accounts for item spacing in both step directions of a center-aligned strategy', () => {
    const availableSpace = 768
    const itemSpacing = 8
    const strategy = strategyOf(
      keylineListWithAlignment(availableSpace, itemSpacing, 'center', (add) => {
        add(10, true)
        add(56)
        add(122)
        add(186)
        add(186)
        add(122)
        add(56)
        add(10, true)
      }),
      availableSpace,
      itemSpacing,
    )

    expect(strategy.startKeylineSteps).toHaveLength(3)
    expect(strategy.endKeylineSteps).toHaveLength(3)

    // One small item moves from start to end - xs, m, l, l, m, s, s, xs
    expect(strategy.startKeylineSteps[1]!.keylines.map((k) => k.offset)).toEqual([
      -13, 61, 223, 417, 579, 676, 740, 781,
    ])
    expect(strategy.startKeylineSteps[1]!.keylines.map((k) => k.unadjustedOffset)).toEqual([
      -165, 29, 223, 417, 611, 805, 999, 1193,
    ])

    // xs, l, l, m, m, s, s, xs
    expect(strategy.startKeylineSteps[2]!.keylines.map((k) => k.offset)).toEqual([
      -13, 93, 287, 449, 579, 676, 740, 781,
    ])
    expect(strategy.startKeylineSteps[2]!.keylines.map((k) => k.unadjustedOffset)).toEqual([
      -101, 93, 287, 481, 675, 869, 1063, 1257,
    ])

    // One small item moves to the start - xs, s, s, m, l, l, m, xs
    expect(strategy.endKeylineSteps[1]!.keylines.map((k) => k.offset)).toEqual([
      -13, 28, 92, 189, 351, 545, 707, 781,
    ])
    expect(strategy.endKeylineSteps[1]!.keylines.map((k) => k.unadjustedOffset)).toEqual([
      -425, -231, -37, 157, 351, 545, 739, 933,
    ])

    // One medium item moves to the end
    expect(strategy.endKeylineSteps[2]!.keylines.map((k) => k.offset)).toEqual([
      -13, 28, 92, 189, 319, 481, 675, 781,
    ])
    expect(strategy.endKeylineSteps[2]!.keylines.map((k) => k.unadjustedOffset)).toEqual([
      -489, -295, -101, 93, 287, 481, 675, 869,
    ])
  })

  it('accounts for content padding in a center-aligned strategy', () => {
    const availableSpace = 500
    const strategy = strategyOf(
      keylineListWithAlignment(availableSpace, 0, 'center', (add) => {
        add(10, true)
        add(50)
        add(100)
        add(200)
        add(100)
        add(50)
        add(10, true)
      }),
      availableSpace,
      0,
      16,
      24,
    )

    const lastStartStep = strategy.startKeylineSteps[strategy.startKeylineSteps.length - 1]!
    const lastEndStep = strategy.endKeylineSteps[strategy.endKeylineSteps.length - 1]!

    expect(firstFocalKeyline(lastStartStep).offset - firstFocalKeyline(lastStartStep).size / 2).toBe(16)
    expect(
      lastNonAnchorKeyline(lastStartStep).offset + lastNonAnchorKeyline(lastStartStep).size / 2,
    ).toBe(500)
    expect(lastFocalKeyline(lastEndStep).offset + lastFocalKeyline(lastEndStep).size / 2).toBe(500 - 24)
    expect(
      Math.abs(
        firstNonAnchorKeyline(lastEndStep).offset - firstNonAnchorKeyline(lastEndStep).size / 2,
      ),
    ).toBeLessThan(0.01)
  })

  it('accounts for padding in a start-aligned two-large-one-small strategy', () => {
    const availableSpace = 444
    const itemSpacing = 8
    const strategy = strategyOf(
      keylineListWithAlignment(availableSpace, itemSpacing, 'start', (add) => {
        add(10, true)
        add(186)
        add(186)
        add(56)
        add(10, true)
      }),
      availableSpace,
      itemSpacing,
      16,
      16,
    )

    expect(strategy.itemMainAxisSize).toBe(186)

    const lastStartStep = strategy.startKeylineSteps[strategy.startKeylineSteps.length - 1]!
    const lastStartStepSmallItem = lastStartStep.keylines[3]!
    expect(lastStartStepSmallItem.offset + lastStartStepSmallItem.size / 2).toBeCloseTo(444, 3)

    const lastEndSteps = strategy.endKeylineSteps[strategy.endKeylineSteps.length - 1]!
    expect(
      lastEndSteps.keylines[1]!.size + 8 + lastEndSteps.keylines[2]!.size + 8 + lastEndSteps.keylines[3]!.size,
    ).toBe(444 - 16)

    const lastEndStepSmallItem = lastEndSteps.keylines[1]!
    expect(lastEndStepSmallItem.offset - lastEndStepSmallItem.size / 2).toBeCloseTo(0, 3)
  })

  it('caches the keyline list per scroll offset', () => {
    const itemCount = 10
    const carouselMainAxisSize = large + medium + small
    const maxScrollOffset = itemCount * large - carouselMainAxisSize
    const strategy = strategyOf(createStartAlignedKeylineList(), carouselMainAxisSize)

    // Offsets inside the end-shift range, so an interpolation really happens.
    const offset1 = maxScrollOffset - 20
    const offset2 = maxScrollOffset - 10

    const list1 = strategy.getKeylineListForScrollOffset(offset1, maxScrollOffset)
    expect(strategy.getKeylineListForScrollOffset(offset1, maxScrollOffset)).toBe(list1)

    const list3 = strategy.getKeylineListForScrollOffset(offset2, maxScrollOffset)
    expect(list3).not.toBe(list1)

    const list4 = strategy.getKeylineListForScrollOffset(offset2, maxScrollOffset + 10)
    expect(list4).not.toBe(list3)

    const list5 = strategy.getKeylineListForScrollOffset(offset2, maxScrollOffset + 10, true)
    expect(list5).not.toBe(list4)
  })
})

describe('snap positions — pinned KeylineSnapPositionTest cases', () => {
  /** `[xsmall - small - medium - large - medium - small - xsmall]`, centred. */
  const testCenterAlignedStrategy = () =>
    strategyOf(
      keylineListWithAlignment(1000, 0, 'center', (add) => {
        add(5, true)
        add(100)
        add(200)
        add(400)
        add(200)
        add(100)
        add(5, true)
      }),
      1000,
    )

  /** `[xs - large - medium - medium - small - small - xsmall]`, start-aligned. */
  const testStartAlignedStrategy = () =>
    strategyOf(
      keylineListWithAlignment(1000, 0, 'start', (add) => {
        add(5, true)
        add(400)
        add(200)
        add(200)
        add(100)
        add(100)
        add(5, true)
      }),
      1000,
    )

  /** `[xs - large - large - medium - small - xsmall]`, start-aligned. */
  const testStartAlignedStrategyWithMultipleFocal = () =>
    strategyOf(
      keylineListWithAlignment(1000, 0, 'start', (add) => {
        add(5, true)
        add(400)
        add(400)
        add(125)
        add(75)
        add(5, true)
      }),
      1000,
    )

  it('snaps a centered single-focal strategy', () => {
    const itemCount = 6
    const strategy = testCenterAlignedStrategy()
    // l=400, m=200, s=100
    expect(
      Array.from({ length: itemCount }, (_, i) => getSnapPositionOffset(strategy, i, itemCount)),
    ).toEqual([0, 200, 300, 300, 400, 600])
  })

  it('snaps a centered multi-focal strategy', () => {
    const itemCount = 10
    const carouselSize = 10 + 40 + 100 + 100 + 40 + 10
    const strategy = strategyOf(
      keylineListWithAlignment(carouselSize, 0, 'center', (add) => {
        add(5, true)
        add(10)
        add(40)
        add(100)
        add(100)
        add(40)
        add(10)
        add(5, true)
      }),
      carouselSize,
    )

    // l=100, m=40, s=10
    expect(
      Array.from({ length: itemCount }, (_, i) => getSnapPositionOffset(strategy, i, itemCount)),
    ).toEqual([0, 40, 50, 50, 50, 50, 50, 10 + 40 + 100, 10 + 10 + 40 + 100, 10 + 10 + 40 + 40 + 100])
  })

  it('snaps a start-aligned strategy', () => {
    const itemCount = 6
    const strategy = testStartAlignedStrategy()
    const expected = [0, 0, 100, 200, 400, 600]
    for (let i = 0; i < itemCount; i += 1) {
      expect(getSnapPositionOffset(strategy, i, itemCount)).toBe(expected[i])
    }
  })

  it('snaps a start-aligned strategy with multiple focal keylines', () => {
    const itemCount = 5
    const strategy = testStartAlignedStrategyWithMultipleFocal()
    // l=400, m=125, s=75
    expect(
      Array.from({ length: itemCount }, (_, i) => getSnapPositionOffset(strategy, i, itemCount)),
    ).toEqual([0, 0, 400, 75 + 400, 75 + 125 + 400])
  })

  it('snaps a multi-focal strategy with as many items as non-anchor keylines', () => {
    const strategy = testStartAlignedStrategyWithMultipleFocal()
    const itemCount = strategy.defaultKeylines.keylines.length - 2
    expect(
      Array.from({ length: itemCount }, (_, i) => getSnapPositionOffset(strategy, i, itemCount)),
    ).toEqual([0, 400, 75 + 400, 75 + 125 + 400])
  })

  it('snaps a multi-focal strategy with fewer items than focal keylines', () => {
    const strategy = testStartAlignedStrategyWithMultipleFocal()
    const itemCount =
      strategy.defaultKeylines.lastFocalIndex - strategy.defaultKeylines.firstFocalIndex
    expect(
      Array.from({ length: itemCount }, (_, i) => getSnapPositionOffset(strategy, i, itemCount)),
    ).toEqual([0])
  })
})

describe('keyline list identity helpers', () => {
  it('produces a stable key for the same list', () => {
    const list = createStartAlignedKeylineList()
    expect(keylineListKey(list)).toBe(keylineListKey(createStartAlignedKeylineList()))
  })
})

/*
 * Not a pinned upstream case. `smallestVisibleItemSize` has no counterpart in the
 * source: it exists because this port publishes a `large`/`medium`/`small` bucket
 * that Compose leaves to the caller, and that bucket needs a floor an item can
 * actually be seen at.
 */
describe('smallestVisibleItemSize — the size bucket floor', () => {
  it('is the small keyline, not the anchor the ported minItemSize counts', () => {
    // `[xs | l m s | xs]`, so xSmall 5 is off screen and small 20 is the narrowest
    // item a user ever sees.
    const strategy = strategyOf(createStartAlignedKeylineList(), large + medium + small)

    expect(strategy.minItemSize).toBeLessThanOrEqual(xSmall)
    expect(strategy.smallestVisibleItemSize).toBe(small)
    expect(strategy.itemMainAxisSize).toBe(large)
  })

  it('is taken from the resting arrangement, so the boundary cannot flicker', () => {
    const strategy = strategyOf(createStartAlignedKeylineList(), large + medium + small)
    const maxScrollOffset = 10 * large - (large + medium + small)

    // Shifted lists can mask an item below the resting minimum; the floor must not
    // follow them, or content would change state as the list shifts rather than as
    // the item resizes.
    const shifted = strategy.getKeylineListForScrollOffset(maxScrollOffset, maxScrollOffset)
    const smallestShifted = Math.min(
      ...shifted.keylines.filter((k) => !k.isAnchor).map((k) => k.size),
    )
    expect(smallestShifted).toBeLessThanOrEqual(strategy.smallestVisibleItemSize)
    expect(strategy.smallestVisibleItemSize).toBe(small)
  })
})
