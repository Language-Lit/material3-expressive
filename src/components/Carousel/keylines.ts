/**
 * Port of the pinned `KeylineList.kt` and `Keylines.kt` at revision
 * `a90df2fc27e026b9ad2ed569f203a260c1041fab`.
 *
 * A keyline is a fixed position along the scrolling axis that defines what size
 * an item takes when its centre sits there. An item is always between two
 * keylines, and the fraction between them produces an interpolated keyline that
 * gives the item its mask size and translation. That is the whole carousel: the
 * layouts differ only in which keylines they place.
 *
 * Two deliberate differences from the source, both structural rather than
 * behavioural. Kotlin's `KeylineList` *is* a `List<Keyline>` with extra members;
 * TypeScript has no comparable delegation, so the list is a plain object holding
 * a `keylines` array beside its derived indices, and the members that were
 * properties or methods there are functions here. And Kotlin's `hashCode`
 * becomes {@link keylineListKey}: JavaScript has no hashCode contract, but the
 * pinned tests' intent — equal lists agree, unequal lists differ — is preserved
 * by a deterministic string key.
 */

import { type Arrangement, arrangementItemCount, findLowestCostArrangement } from './arrangement'

/** How items are aligned along the main axis — the source's `CarouselAlignment`. */
export type CarouselAlignment = 'start' | 'center' | 'end'

/**
 * The numbers `CarouselDefaults` supplies to the engine. The source reads them
 * as dp constants; here they arrive as pixels so a theme override of
 * `--m3e-comp-carousel-*` reaches the layout instead of being compiled in.
 */
export interface CarouselSizingDefaults {
  /** `CarouselDefaults.MinSmallItemSize` — 40dp. */
  readonly minSmallItemSize: number
  /** `CarouselDefaults.MaxSmallItemSize` — 56dp. */
  readonly maxSmallItemSize: number
  /** `CarouselDefaults.AnchorSize` — 10dp. */
  readonly anchorSize: number
  /** `CarouselDefaults.MediumLargeItemDiffThreshold` — 0.85. */
  readonly mediumLargeItemDiffThreshold: number
}

/** The sourced defaults, used when no themed value can be measured. */
export const carouselSizingDefaults: CarouselSizingDefaults = {
  minSmallItemSize: 40,
  maxSmallItemSize: 56,
  anchorSize: 10,
  mediumLargeItemDiffThreshold: 0.85,
}

/**
 * A position along the scrolling axis and the item state that belongs to it.
 *
 * @property size the size an item takes when its centre is at `offset`
 * @property offset where the item's centre is placed
 * @property unadjustedOffset where the item's centre would be in the end-to-end
 *   scrolling model, with every item at full size
 * @property isFocal whether an item here is fully unmasked
 * @property isAnchor whether this keyline may not be shifted — the fully
 *   off-screen first and last keylines
 * @property isPivot whether every other keyline's offsets were derived from this
 *   one
 * @property cutoff how far the item bleeds past the container edge; zero when it
 *   is fully in or fully out of bounds
 */
export interface Keyline {
  readonly size: number
  readonly offset: number
  readonly unadjustedOffset: number
  readonly isFocal: boolean
  readonly isAnchor: boolean
  readonly isPivot: boolean
  readonly cutoff: number
}

/** A list of keylines with the derived indices the engine navigates by. */
export interface KeylineList {
  readonly keylines: readonly Keyline[]
  readonly minSize: number
  readonly maxSize: number
  readonly pivotIndex: number
  readonly firstNonAnchorIndex: number
  readonly lastNonAnchorIndex: number
  readonly firstFocalIndex: number
  readonly lastFocalIndex: number
  /** Total number of focal keylines. */
  readonly focalCount: number
}

function createKeylineList(keylines: readonly Keyline[]): KeylineList {
  let min = Number.MAX_VALUE
  let max = 0
  for (const keyline of keylines) {
    if (keyline.size < min) min = keyline.size
    if (keyline.size > max) max = keyline.size
  }
  const firstFocalIndex = keylines.findIndex((k) => k.isFocal)
  let lastFocalIndex = -1
  let lastNonAnchorIndex = -1
  keylines.forEach((k, i) => {
    if (k.isFocal) lastFocalIndex = i
    if (!k.isAnchor) lastNonAnchorIndex = i
  })
  return {
    keylines,
    minSize: min,
    maxSize: max,
    pivotIndex: keylines.findIndex((k) => k.isPivot),
    firstNonAnchorIndex: keylines.findIndex((k) => !k.isAnchor),
    lastNonAnchorIndex,
    firstFocalIndex,
    lastFocalIndex,
    focalCount: lastFocalIndex - firstFocalIndex + 1,
  }
}

/** The empty list, the source's `KeylineList.Empty`. */
export const emptyKeylineList: KeylineList = createKeylineList([])

export function isEmptyKeylineList(list: KeylineList): boolean {
  return list.keylines.length === 0
}

export function firstKeyline(list: KeylineList): Keyline {
  return list.keylines[0]!
}

export function lastKeyline(list: KeylineList): Keyline {
  return list.keylines[list.keylines.length - 1]!
}

export function pivotKeyline(list: KeylineList): Keyline {
  return list.keylines[list.pivotIndex]!
}

export function firstFocalKeyline(list: KeylineList): Keyline {
  return list.keylines[list.firstFocalIndex]!
}

export function lastFocalKeyline(list: KeylineList): Keyline {
  return list.keylines[list.lastFocalIndex]!
}

export function firstNonAnchorKeyline(list: KeylineList): Keyline {
  return list.keylines[list.firstNonAnchorIndex]!
}

export function lastNonAnchorKeyline(list: KeylineList): Keyline {
  return list.keylines[list.lastNonAnchorIndex]!
}

/**
 * True when the first focal item's leading edge is inside the container and it
 * is also the first non-anchor keyline — that is, the focal range is already as
 * far towards the start as it can go and needs no start shift steps.
 */
export function isFirstFocalItemAtStartOfContainer(list: KeylineList): boolean {
  const focal = firstFocalKeyline(list)
  const focalLeft = focal.offset - focal.size / 2
  return focalLeft >= 0 && focal === firstNonAnchorKeyline(list)
}

/** The end-side mirror of {@link isFirstFocalItemAtStartOfContainer}. */
export function isLastFocalItemAtEndOfContainer(
  list: KeylineList,
  carouselMainAxisSize: number,
): boolean {
  const focal = lastFocalKeyline(list)
  const focalRight = focal.offset + focal.size / 2
  return focalRight <= carouselMainAxisSize && focal === lastNonAnchorKeyline(list)
}

/**
 * Index of the first keyline after the focal range whose size is `size`, or the
 * last index when none matches. Used when moving a keyline across the focal
 * range so the arrangement keeps its visual balance.
 */
export function firstIndexAfterFocalRangeWithSize(list: KeylineList, size: number): number {
  const lastIndex = list.keylines.length - 1
  for (let i = list.lastFocalIndex; i <= lastIndex; i += 1) {
    if (list.keylines[i]!.size === size) return i
  }
  return lastIndex
}

/** The start-side mirror of {@link firstIndexAfterFocalRangeWithSize}. */
export function lastIndexBeforeFocalRangeWithSize(list: KeylineList, size: number): number {
  for (let i = list.firstFocalIndex - 1; i >= 0; i -= 1) {
    if (list.keylines[i]!.size === size) return i
  }
  return 0
}

/**
 * The last keyline whose unadjusted offset is strictly less than
 * `unadjustedOffset`, or the first keyline when none is.
 */
export function keylineBefore(list: KeylineList, unadjustedOffset: number): Keyline {
  for (let i = list.keylines.length - 1; i >= 0; i -= 1) {
    const keyline = list.keylines[i]!
    if (keyline.unadjustedOffset < unadjustedOffset) return keyline
  }
  return firstKeyline(list)
}

/**
 * The first keyline whose unadjusted offset is greater than or equal to
 * `unadjustedOffset`, or the last keyline when none is.
 */
export function keylineAfter(list: KeylineList, unadjustedOffset: number): Keyline {
  for (const keyline of list.keylines) {
    if (keyline.unadjustedOffset >= unadjustedOffset) return keyline
  }
  return lastKeyline(list)
}

export function keylinesEqual(a: Keyline, b: Keyline): boolean {
  return (
    a.size === b.size &&
    a.offset === b.offset &&
    a.unadjustedOffset === b.unadjustedOffset &&
    a.isFocal === b.isFocal &&
    a.isAnchor === b.isAnchor &&
    a.isPivot === b.isPivot &&
    a.cutoff === b.cutoff
  )
}

export function keylineListsEqual(a: KeylineList, b: KeylineList): boolean {
  if (a === b) return true
  if (a.keylines.length !== b.keylines.length) return false
  return a.keylines.every((keyline, i) => keylinesEqual(keyline, b.keylines[i]!))
}

/**
 * Deterministic identity for a keyline list, standing in for the source's
 * `hashCode`. Equal lists produce equal keys and unequal lists produce unequal
 * ones, which is what the pinned equality tests assert.
 */
export function keylineListKey(list: KeylineList): string {
  return list.keylines
    .map(
      (k) =>
        `${k.size}|${k.offset}|${k.unadjustedOffset}|${k.isFocal ? 1 : 0}${k.isAnchor ? 1 : 0}${
          k.isPivot ? 1 : 0
        }|${k.cutoff}`,
    )
    .join(';')
}

/** `androidx.compose.ui.util.lerp` — kept in the source's exact form. */
function lerpValue(start: number, stop: number, fraction: number): number {
  return (1 - fraction) * start + fraction * stop
}

/** An interpolated keyline `fraction` of the way from `start` to `end`. */
export function lerpKeyline(start: Keyline, end: Keyline, fraction: number): Keyline {
  return {
    size: lerpValue(start.size, end.size, fraction),
    offset: lerpValue(start.offset, end.offset, fraction),
    unadjustedOffset: lerpValue(start.unadjustedOffset, end.unadjustedOffset, fraction),
    isFocal: fraction < 0.5 ? start.isFocal : end.isFocal,
    isAnchor: fraction < 0.5 ? start.isAnchor : end.isAnchor,
    isPivot: fraction < 0.5 ? start.isPivot : end.isPivot,
    cutoff: lerpValue(start.cutoff, end.cutoff, fraction),
  }
}

/**
 * An interpolated keyline list. Unlike the builders, this does not recompute
 * offsets from a pivot — every value is interpolated directly, which is what
 * makes a mid-shift state continuous.
 */
export function lerpKeylineList(from: KeylineList, to: KeylineList, fraction: number): KeylineList {
  return createKeylineList(
    from.keylines.map((keyline, i) => lerpKeyline(keyline, to.keylines[i]!, fraction)),
  )
}

/** A keyline queued by a builder, before its offsets are known. */
interface PendingKeyline {
  readonly size: number
  readonly isAnchor: boolean
}

/** Receiver for the keyline builders — the source's `KeylineListScope`. */
export type KeylineListBuilder = (add: (size: number, isAnchor?: boolean) => void) => void

interface CollectedKeylines {
  readonly pending: readonly PendingKeyline[]
  readonly firstFocalIndex: number
  readonly focalItemSize: number
}

function collect(build: KeylineListBuilder): CollectedKeylines {
  const pending: PendingKeyline[] = []
  let firstFocalIndex = -1
  let focalItemSize = 0
  build((size, isAnchor = false) => {
    pending.push({ size, isAnchor })
    // The first focal keyline is the first index of the largest non-anchor item
    // added; the last is found by walking forward while the size still matches.
    if (!isAnchor && size > focalItemSize) {
      firstFocalIndex = pending.length - 1
      focalItemSize = size
    }
  })
  return { pending, firstFocalIndex, focalItemSize }
}

function findLastFocalIndex(collected: CollectedKeylines): number {
  const { pending, firstFocalIndex, focalItemSize } = collected
  let lastFocalIndex = firstFocalIndex
  while (
    lastFocalIndex < pending.length - 1 &&
    pending[lastFocalIndex + 1]!.size === focalItemSize
  ) {
    lastFocalIndex += 1
  }
  return lastFocalIndex
}

/**
 * True when an item of `size` centred at `offset` straddles the container's
 * leading edge — neither fully visible nor fully invisible.
 */
function isCutoffLeft(size: number, offset: number): boolean {
  return offset - size / 2 < 0 && offset + size / 2 > 0
}

/** The trailing-edge mirror of {@link isCutoffLeft}. */
function isCutoffRight(size: number, offset: number, carouselMainAxisSize: number): boolean {
  return offset - size / 2 < carouselMainAxisSize && offset + size / 2 > carouselMainAxisSize
}

/**
 * Resolves pending keylines into real ones by placing one pivot and deriving
 * every other offset, unadjusted offset, and cutoff outward from it.
 *
 * Pivoting is what lets the same arrangement be aligned differently: align the
 * first focal keyline to the container start for a start-aligned list, or the
 * last focal keyline to the end when shifting the focal range towards the end.
 */
function createKeylinesWithPivot(
  pivotIndex: number,
  pivotOffset: number,
  firstFocalIndex: number,
  lastFocalIndex: number,
  itemMainAxisSize: number,
  carouselMainAxisSize: number,
  itemSpacing: number,
  pending: readonly PendingKeyline[],
): Keyline[] {
  const pivot = pending[pivotIndex]!
  const keylines: Keyline[] = []

  let pivotCutoff = 0
  if (isCutoffLeft(pivot.size, pivotOffset)) {
    pivotCutoff = pivotOffset - pivot.size / 2
  } else if (isCutoffRight(pivot.size, pivotOffset, carouselMainAxisSize)) {
    pivotCutoff = pivotOffset + pivot.size / 2 - carouselMainAxisSize
  }
  keylines.push({
    size: pivot.size,
    offset: pivotOffset,
    unadjustedOffset: pivotOffset,
    isFocal: pivotIndex >= firstFocalIndex && pivotIndex <= lastFocalIndex,
    isAnchor: pivot.isAnchor,
    isPivot: true,
    cutoff: pivotCutoff,
  })

  // Everything before the pivot, inserted at the front so the caller's order
  // survives.
  let offset = pivotOffset - itemMainAxisSize / 2 - itemSpacing
  let unadjustedOffset = pivotOffset - itemMainAxisSize / 2 - itemSpacing
  for (let originalIndex = pivotIndex - 1; originalIndex >= 0; originalIndex -= 1) {
    const item = pending[originalIndex]!
    const itemOffset = offset - item.size / 2
    const itemUnadjustedOffset = unadjustedOffset - itemMainAxisSize / 2
    keylines.unshift({
      size: item.size,
      offset: itemOffset,
      unadjustedOffset: itemUnadjustedOffset,
      isFocal: originalIndex >= firstFocalIndex && originalIndex <= lastFocalIndex,
      isAnchor: item.isAnchor,
      isPivot: false,
      cutoff: isCutoffLeft(item.size, itemOffset) ? Math.abs(itemOffset - item.size / 2) : 0,
    })
    offset -= item.size + itemSpacing
    unadjustedOffset -= itemMainAxisSize + itemSpacing
  }

  // Everything after the pivot.
  offset = pivotOffset + itemMainAxisSize / 2 + itemSpacing
  unadjustedOffset = pivotOffset + itemMainAxisSize / 2 + itemSpacing
  for (let originalIndex = pivotIndex + 1; originalIndex < pending.length; originalIndex += 1) {
    const item = pending[originalIndex]!
    const itemOffset = offset + item.size / 2
    const itemUnadjustedOffset = unadjustedOffset + itemMainAxisSize / 2
    keylines.push({
      size: item.size,
      offset: itemOffset,
      unadjustedOffset: itemUnadjustedOffset,
      isFocal: originalIndex >= firstFocalIndex && originalIndex <= lastFocalIndex,
      isAnchor: item.isAnchor,
      isPivot: false,
      cutoff: isCutoffRight(item.size, itemOffset, carouselMainAxisSize)
        ? itemOffset + item.size / 2 - carouselMainAxisSize
        : 0,
    })
    offset += item.size + itemSpacing
    unadjustedOffset += itemMainAxisSize + itemSpacing
  }

  return keylines
}

/**
 * Builds a keyline list by aligning the focal range relative to the container —
 * the source's `keylineListOf(…, carouselAlignment) { … }`.
 */
export function keylineListWithAlignment(
  carouselMainAxisSize: number,
  itemSpacing: number,
  alignment: CarouselAlignment,
  build: KeylineListBuilder,
): KeylineList {
  const collected = collect(build)
  const lastFocalIndex = findLastFocalIndex(collected)
  const { firstFocalIndex, focalItemSize, pending } = collected
  const focalItemCount = lastFocalIndex - firstFocalIndex

  let pivotOffset: number
  if (alignment === 'center') {
    // With an even number of focal keylines the spacing itself lands on the
    // container's centre line, so only an odd count splits a gap in half.
    const itemSpacingSplit = itemSpacing === 0 || focalItemCount % 2 === 0 ? 0 : itemSpacing / 2
    const itemSpaceCounts = Math.floor(focalItemCount / 2) * itemSpacing
    pivotOffset =
      carouselMainAxisSize / 2 -
      (focalItemSize / 2) * focalItemCount -
      itemSpacingSplit -
      itemSpaceCounts
  } else if (alignment === 'end') {
    pivotOffset = carouselMainAxisSize - focalItemSize / 2
  } else {
    pivotOffset = focalItemSize / 2
  }

  return createKeylineList(
    createKeylinesWithPivot(
      firstFocalIndex,
      pivotOffset,
      firstFocalIndex,
      lastFocalIndex,
      focalItemSize,
      carouselMainAxisSize,
      itemSpacing,
      pending,
    ),
  )
}

/**
 * Builds a keyline list from an explicit pivot — the source's
 * `keylineListOf(…, pivotIndex, pivotOffset) { … }`, used for every shifted
 * step.
 */
export function keylineListWithPivot(
  carouselMainAxisSize: number,
  itemSpacing: number,
  pivotIndex: number,
  pivotOffset: number,
  build: KeylineListBuilder,
): KeylineList {
  const collected = collect(build)
  return createKeylineList(
    createKeylinesWithPivot(
      pivotIndex,
      pivotOffset,
      collected.firstFocalIndex,
      findLastFocalIndex(collected),
      collected.focalItemSize,
      carouselMainAxisSize,
      itemSpacing,
      collected.pending,
    ),
  )
}

/** Internal escape hatch for the interpolation in `strategy.ts`. */
export function keylineListFrom(keylines: readonly Keyline[]): KeylineList {
  return createKeylineList(keylines)
}

function createLeftAlignedKeylineList(
  carouselMainAxisSize: number,
  itemSpacing: number,
  leftAnchorSize: number,
  rightAnchorSize: number,
  arrangement: Arrangement,
): KeylineList {
  return keylineListWithAlignment(carouselMainAxisSize, itemSpacing, 'start', (add) => {
    add(leftAnchorSize, true)
    for (let i = 0; i < arrangement.largeCount; i += 1) add(arrangement.largeSize)
    for (let i = 0; i < arrangement.mediumCount; i += 1) add(arrangement.mediumSize)
    for (let i = 0; i < arrangement.smallCount; i += 1) add(arrangement.smallSize)
    add(rightAnchorSize, true)
  })
}

function createCenterAlignedKeylineList(
  carouselMainAxisSize: number,
  itemSpacing: number,
  leftAnchorSize: number,
  rightAnchorSize: number,
  arrangement: Arrangement,
): KeylineList {
  return keylineListWithAlignment(carouselMainAxisSize, itemSpacing, 'center', (add) => {
    add(leftAnchorSize, true)
    const halfSmall = Math.floor(arrangement.smallCount / 2)
    const halfMedium = Math.floor(arrangement.mediumCount / 2)
    for (let i = 0; i < halfSmall; i += 1) add(arrangement.smallSize)
    for (let i = 0; i < halfMedium; i += 1) add(arrangement.mediumSize)
    for (let i = 0; i < arrangement.largeCount; i += 1) add(arrangement.largeSize)
    for (let i = 0; i < halfMedium; i += 1) add(arrangement.mediumSize)
    for (let i = 0; i < halfSmall; i += 1) add(arrangement.smallSize)
    add(rightAnchorSize, true)
  })
}

export interface MultiBrowseKeylineOptions {
  readonly carouselMainAxisSize: number
  readonly preferredItemSize: number
  readonly itemSpacing: number
  readonly itemCount: number
  readonly sizing?: CarouselSizingDefaults
}

/**
 * The multi-browse arrangement: at least one large, one medium, and one small
 * item, sized so a whole number of items fits the container with the least
 * possible change to the preferred large size.
 */
export function multiBrowseKeylineList({
  carouselMainAxisSize,
  preferredItemSize,
  itemSpacing,
  itemCount,
  sizing = carouselSizingDefaults,
}: MultiBrowseKeylineOptions): KeylineList {
  if (carouselMainAxisSize === 0 || preferredItemSize === 0) return emptyKeylineList

  const { minSmallItemSize, maxSmallItemSize, anchorSize } = sizing
  let smallCounts: number[] = [1]
  const mediumCounts: number[] = [1, 0]

  const targetLargeSize = Math.min(preferredItemSize, carouselMainAxisSize)
  // A balanced arrangement wants a small item about a third of the large one,
  // clamped into the allowed small range.
  const targetSmallSize = Math.min(
    Math.max(targetLargeSize / 3, minSmallItemSize),
    maxSmallItemSize,
  )
  const targetMediumSize = (targetLargeSize + targetSmallSize) / 2

  if (carouselMainAxisSize < minSmallItemSize * 2) {
    // Too narrow to hold a large item and a strictly smaller small one.
    smallCounts = [0]
  }

  const minAvailableLargeSpace =
    carouselMainAxisSize -
    targetMediumSize * Math.max(...mediumCounts) -
    maxSmallItemSize * Math.max(...smallCounts)
  const minLargeCount = Math.max(1, Math.floor(minAvailableLargeSpace / targetLargeSize))
  const maxLargeCount = Math.ceil(carouselMainAxisSize / targetLargeSize)
  const largeCounts = Array.from(
    { length: maxLargeCount - minLargeCount + 1 },
    (_, i) => maxLargeCount - i,
  )

  let arrangement = findLowestCostArrangement({
    availableSpace: carouselMainAxisSize,
    itemSpacing,
    targetSmallSize,
    minSmallSize: minSmallItemSize,
    maxSmallSize: maxSmallItemSize,
    smallCounts,
    targetMediumSize,
    mediumCounts,
    targetLargeSize,
    largeCounts,
  })

  if (arrangement !== null && arrangementItemCount(arrangement) > itemCount) {
    // More keylines than items: drop the smallest ones, keeping at least one
    // medium so large items do not fill the whole carousel.
    let keylineSurplus = arrangementItemCount(arrangement) - itemCount
    let smallCount = arrangement.smallCount
    let mediumCount = arrangement.mediumCount
    while (keylineSurplus > 0) {
      if (smallCount > 0) {
        smallCount -= 1
      } else if (mediumCount > 1) {
        mediumCount -= 1
      }
      keylineSurplus -= 1
    }
    arrangement = findLowestCostArrangement({
      availableSpace: carouselMainAxisSize,
      itemSpacing,
      targetSmallSize,
      minSmallSize: minSmallItemSize,
      maxSmallSize: maxSmallItemSize,
      smallCounts: [smallCount],
      targetMediumSize,
      mediumCounts: [mediumCount],
      targetLargeSize,
      largeCounts,
    })
  }

  if (arrangement === null) return emptyKeylineList

  return createLeftAlignedKeylineList(
    carouselMainAxisSize,
    itemSpacing,
    anchorSize,
    anchorSize,
    arrangement,
  )
}

/**
 * Chooses a medium size for the uncontained layout: large enough that a useful
 * fraction of it is cut off, small enough to stay visibly different from a large
 * item.
 */
function calculateMediumChildSize(
  minimumMediumSize: number,
  largeItemSize: number,
  remainingSpace: number,
  mediumLargeItemDiffThreshold: number,
): number {
  // Ideally a third of the item is cut off, which means it is 1.5× the space
  // that is left.
  let mediumItemSize = Math.max(remainingSpace * 1.5, minimumMediumSize)

  const largeItemThreshold = largeItemSize * mediumLargeItemDiffThreshold
  if (mediumItemSize > largeItemThreshold) {
    // Too close to the large size to create motion; fall back to whichever is
    // bigger of the threshold and a fifth cut off, never exceeding large.
    const sizeWithFifthCutOff = remainingSpace * 1.2
    mediumItemSize = Math.min(Math.max(largeItemThreshold, sizeWithFifthCutOff), largeItemSize)
  }
  return mediumItemSize
}

export interface UncontainedKeylineOptions {
  readonly carouselMainAxisSize: number
  readonly itemSize: number
  readonly itemSpacing: number
  readonly sizing?: CarouselSizingDefaults
}

/**
 * The uncontained arrangement: as many same-size items as fit, plus one trailing
 * item deliberately cut off so there is motion when items leave the container.
 */
export function uncontainedKeylineList({
  carouselMainAxisSize,
  itemSize,
  itemSpacing,
  sizing = carouselSizingDefaults,
}: UncontainedKeylineOptions): KeylineList {
  if (carouselMainAxisSize === 0 || itemSize === 0) return emptyKeylineList

  const largeItemSize = Math.min(itemSize + itemSpacing, carouselMainAxisSize)
  const largeCount = Math.max(1, Math.floor(carouselMainAxisSize / largeItemSize))
  const remainingSpace = carouselMainAxisSize - largeCount * largeItemSize
  const mediumCount = remainingSpace > 0 ? 1 : 0

  const defaultAnchorSize = sizing.anchorSize
  const mediumItemSize = calculateMediumChildSize(
    defaultAnchorSize,
    largeItemSize,
    remainingSpace,
    sizing.mediumLargeItemDiffThreshold,
  )
  const arrangement: Arrangement = {
    priority: 0,
    smallSize: 0,
    smallCount: 0,
    mediumSize: mediumItemSize,
    mediumCount,
    largeSize: largeItemSize,
    largeCount,
  }

  const xSmallSize = Math.min(defaultAnchorSize, itemSize)
  // Half the cut-off item's size, so motion at the leading edge resembles the
  // trailing edge where the cut-off actually is.
  const leftAnchorSize = Math.max(xSmallSize, mediumItemSize * 0.5)
  return createLeftAlignedKeylineList(
    carouselMainAxisSize,
    itemSpacing,
    leftAnchorSize,
    defaultAnchorSize,
    arrangement,
  )
}

export interface HeroKeylineOptions {
  readonly carouselMainAxisSize: number
  /** Null lets one large item fill the viewport minus its small items. */
  readonly maxItemSize: number | null
  readonly itemSpacing: number
  readonly itemCount: number
  readonly isCentered?: boolean
  readonly sizing?: CarouselSizingDefaults
}

/**
 * The hero arrangement: one or more large items with one small item beside them,
 * or two small items around them when centred.
 */
export function heroKeylineList({
  carouselMainAxisSize,
  maxItemSize,
  itemSpacing,
  itemCount,
  isCentered = false,
  sizing = carouselSizingDefaults,
}: HeroKeylineOptions): KeylineList {
  if (carouselMainAxisSize === 0) return emptyKeylineList

  const { minSmallItemSize, maxSmallItemSize, anchorSize } = sizing
  // Fewer than three items cannot be centred, so those fall back to start.
  const shouldCenter = isCentered && itemCount >= 3

  let smallCounts: number[]
  if (itemCount <= 1) {
    smallCounts = [0]
  } else if (shouldCenter) {
    smallCounts = [2]
  } else {
    smallCounts = [1]
  }

  const targetLargeSize = Math.min(maxItemSize ?? carouselMainAxisSize, carouselMainAxisSize)
  const targetSmallSize = Math.min(
    Math.max(targetLargeSize / 3, minSmallItemSize),
    maxSmallItemSize,
  )

  // There must be room for the small items plus a large item at least 25%
  // bigger than one of them, or the layout goes full-bleed instead.
  const fullscreenThreshold = minSmallItemSize * Math.max(...smallCounts) + minSmallItemSize * 1.25
  if (carouselMainAxisSize < fullscreenThreshold) {
    smallCounts = [0]
  }

  const minAvailableLargeSpace =
    carouselMainAxisSize - minSmallItemSize * Math.max(...smallCounts)
  const minLargeCount = Math.max(1, Math.floor(minAvailableLargeSpace / targetLargeSize))
  const maxLargeCount = Math.ceil(carouselMainAxisSize / targetLargeSize)
  const largeCounts = Array.from(
    { length: maxLargeCount - minLargeCount + 1 },
    (_, i) => maxLargeCount - i,
  )

  const arrangement = findLowestCostArrangement({
    availableSpace: carouselMainAxisSize,
    itemSpacing,
    targetSmallSize,
    minSmallSize: minSmallItemSize,
    maxSmallSize: maxSmallItemSize,
    smallCounts,
    targetMediumSize: 0,
    mediumCounts: [0],
    targetLargeSize,
    largeCounts,
  })

  if (arrangement === null) return emptyKeylineList

  if (shouldCenter && itemCount >= arrangementItemCount(arrangement)) {
    return createCenterAlignedKeylineList(
      carouselMainAxisSize,
      itemSpacing,
      anchorSize,
      anchorSize,
      arrangement,
    )
  }
  return createLeftAlignedKeylineList(
    carouselMainAxisSize,
    itemSpacing,
    anchorSize,
    anchorSize,
    arrangement,
  )
}
