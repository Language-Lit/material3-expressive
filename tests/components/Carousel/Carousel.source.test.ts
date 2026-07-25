import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defaultTokenSet } from '../../../src/tokens'

const read = (path: string) =>
  readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8')

const componentSource = read('../../../src/components/Carousel/Carousel.tsx')
const typesSource = read('../../../src/components/Carousel/Carousel.types.ts')
const arrangementSource = read('../../../src/components/Carousel/arrangement.ts')
const keylinesSource = read('../../../src/components/Carousel/keylines.ts')
const strategySource = read('../../../src/components/Carousel/strategy.ts')
const multiAspectSource = read('../../../src/components/Carousel/multiAspect.ts')
const maskSource = read('../../../src/components/Carousel/useCarouselMask.ts')
const css = read('../../../src/components/Carousel/Carousel.css')
const barrel = read('../../../src/components/Carousel/index.ts')

const split = (source: string) => source.trim().split(/\s+/)

/**
 * Git blob hashes of the pinned AndroidX files at revision
 * `a90df2fc27e026b9ad2ed569f203a260c1041fab`, the reference snapshot T44 adopted
 * and T45/T46/T47 extended. All nineteen were fetched at that revision and at
 * `androidx-main` HEAD (`25daaa71c1e9309a7f0d7df1bde73c6d2d5ef6d7`, committed
 * 2026-07-24). Twelve are byte-identical.
 *
 * Seven differ, and every difference is non-substantive. Four implementation
 * files gained Kotlin explicit-API `public` modifiers, plus explicit `Dp` return
 * types on `CarouselDefaults.MinSmallItemSize`/`MaxSmallItemSize`, an explicit
 * `Unit` on `CarouselState.scrollToItem`/`animateScrollToItem`, and a reformat of
 * the latter's parameter list. Three test files carry the same one-line
 * `createComposeRule(StandardTestDispatcher())` → `createComposeRule()` change
 * T47 already classified. Nothing is added, removed, or renamed, so the pin holds
 * and the delta is recorded here rather than re-pinned — the classification T44
 * established.
 */
const pinnedFiles = {
  'carousel/Arrangement.kt': 'a6e40485eeda46fb41a7ab84aa8f8f2229ef1564',
  'carousel/Carousel.kt': '7520c32dd4dc18d00f9a78ede949ead57e6fdedb',
  'carousel/CarouselItemScope.kt': 'f28dcfa1e3bce295202664b91094c6b81f0a7af0',
  'carousel/CarouselState.kt': '99f2894b3a0c31cba0cc00dea071508a1fe4b15a',
  'carousel/KeylineList.kt': 'f01dc124156222dc37874c68fb06e6f3cc334595',
  'carousel/KeylineSnapPosition.kt': 'cd437bca1e0834737bd25e1d101d60f46ce5bf9b',
  'carousel/Keylines.kt': '037f1a7c7e2315c4d251c669b62d1961a9152149',
  'carousel/MultiAspectCarousel.kt': 'afa66fa178303fa24cc6aac108ef4c7c95c1d6b6',
  'carousel/Strategy.kt': 'ef51d3386a3460327a3de012f359e9b2b5927fa4',
  'androidDeviceTest/CarouselItemScopeTest.kt': 'f4a493b9727678b9ad0434eb25543b4357de0def',
  'androidDeviceTest/CarouselTest.kt': '6f4e3c6e69fdb0ae58768199affcdff02807a1f9',
  'androidDeviceTest/MultiAspectCarouselTest.kt': 'c42b3beb4992899ab3ce041ab43c540af6d2a7a7',
  'androidHostTest/ArrangementTest.kt': '9e7d2d907a7a96084895a50c2772143c5a06b81a',
  'androidHostTest/CenteredHeroTest.kt': '1f2d1ae3db919d4f3c8a8c9b17f16500e75392f5',
  'androidHostTest/KeylineSnapPositionTest.kt': 'a47396ea7e3fbe7756f0f4405d50cc057711fe2c',
  'androidHostTest/KeylineTest.kt': 'a8fdcb823ca435ececdfe51af6940eaad3f2fbd1',
  'androidHostTest/MultiBrowseTest.kt': 'd921a2ed7ab523f4c2de2b4533df4ad1037c25dc',
  'androidHostTest/StrategyTest.kt': '60042e9046b011e8cf9658da13be30ed92377641',
  'androidHostTest/UncontainedTest.kt': 'b44c654c77ed2368f0e96267cf1f539f653ad55a',
} as const

/** The seven files whose HEAD blob differs, frozen so the classification cannot rot. */
const headBlobs = {
  'carousel/Carousel.kt': '86eb8a2449de1162948caf42941d2b50f13b177c',
  'carousel/CarouselItemScope.kt': '82648cf48915a41493dee63ebada1a8c0b0217b9',
  'carousel/CarouselState.kt': 'a50069a6713018a32288e854ca9a11f8b0123d56',
  'carousel/MultiAspectCarousel.kt': '551a96c67f31fb70c4c275078fac06ccff2e3e47',
  'androidDeviceTest/CarouselTest.kt': '23435a28acc4ae2f403847d77408118b400e8676',
  'androidDeviceTest/CarouselItemScopeTest.kt': '029de616878372dcaffa080a91fb38457773edb1',
  'androidDeviceTest/MultiAspectCarouselTest.kt': 'bece4ac5a2cd9ec1dec6e6875e45a19ed5848f7f',
} as const

/**
 * Carousel is the only family so far with **no generated token file**. Listing
 * `commonMain/kotlin/androidx/compose/material3/tokens/` at the pinned revision
 * and at HEAD returns no `CarouselTokens.kt`, so there is no read/unread role
 * partition to record — the thing every previous family ledger was built around.
 * What replaces it is recorded in `sourcedNumbers` and `specifiedNumbers` below.
 */
const generatedTokenFiles: readonly string[] = []

/**
 * The numbers the pinned implementation itself reads, from `CarouselDefaults` and
 * the private constants beside it. These four choose the arrangement, so the port
 * registers them rather than compiling them in.
 */
const sourcedNumbers = {
  'CarouselDefaults.MinSmallItemSize': '40px',
  'CarouselDefaults.MaxSmallItemSize': '56px',
  'CarouselDefaults.AnchorSize': '10px',
  'CarouselDefaults.MediumLargeItemDiffThreshold': 0.85,
} as const

/**
 * The numbers only the design specification owns, from its own measurement
 * tables at <https://m3.material.io/components/carousel/specs>, rendered and
 * accessed 2026-07-25. The generated token file that would normally carry these
 * does not exist.
 */
const specifiedNumbers = {
  'item corner radius': '28px',
  'leading/trailing padding': '16px',
  'top/bottom padding': '8px',
  'padding between elements': '8px',
  'uncontained trailing padding': '0px',
  'full-screen padding': '0px',
  'full-screen padding between elements': '16px',
} as const

/**
 * The current first-party public surface at parameter granularity: three
 * composables, `CarouselDefaults`, the state and its factory, both draw-info
 * interfaces, the item scope, and the whole experimental multi-aspect surface.
 * The family ships no deprecated API at either revision — `grep -c Deprecated`
 * over all nineteen files is zero.
 */
const currentSurface = split(`
  HorizontalMultiBrowseCarousel HorizontalMultiBrowseCarousel.state
  HorizontalMultiBrowseCarousel.preferredItemWidth
  HorizontalMultiBrowseCarousel.modifier HorizontalMultiBrowseCarousel.itemSpacing
  HorizontalMultiBrowseCarousel.flingBehavior
  HorizontalMultiBrowseCarousel.userScrollEnabled
  HorizontalMultiBrowseCarousel.minSmallItemWidth
  HorizontalMultiBrowseCarousel.maxSmallItemWidth
  HorizontalMultiBrowseCarousel.contentPadding HorizontalMultiBrowseCarousel.content
  HorizontalUncontainedCarousel HorizontalUncontainedCarousel.state
  HorizontalUncontainedCarousel.itemWidth HorizontalUncontainedCarousel.modifier
  HorizontalUncontainedCarousel.itemSpacing
  HorizontalUncontainedCarousel.flingBehavior
  HorizontalUncontainedCarousel.userScrollEnabled
  HorizontalUncontainedCarousel.contentPadding HorizontalUncontainedCarousel.content
  HorizontalCenteredHeroCarousel HorizontalCenteredHeroCarousel.state
  HorizontalCenteredHeroCarousel.modifier HorizontalCenteredHeroCarousel.maxItemWidth
  HorizontalCenteredHeroCarousel.itemSpacing
  HorizontalCenteredHeroCarousel.flingBehavior
  HorizontalCenteredHeroCarousel.userScrollEnabled
  HorizontalCenteredHeroCarousel.minSmallItemWidth
  HorizontalCenteredHeroCarousel.maxSmallItemWidth
  HorizontalCenteredHeroCarousel.contentPadding HorizontalCenteredHeroCarousel.content
  CarouselDefaults CarouselDefaults.singleAdvanceFlingBehavior
  CarouselDefaults.singleAdvanceFlingBehavior.state
  CarouselDefaults.singleAdvanceFlingBehavior.snapAnimationSpec
  CarouselDefaults.multiBrowseFlingBehavior
  CarouselDefaults.multiBrowseFlingBehavior.state
  CarouselDefaults.multiBrowseFlingBehavior.decayAnimationSpec
  CarouselDefaults.multiBrowseFlingBehavior.snapAnimationSpec
  CarouselDefaults.noSnapFlingBehavior CarouselDefaults.MinSmallItemSize
  CarouselDefaults.MaxSmallItemSize
  CarouselState CarouselState.currentItem-arg
  CarouselState.currentItemOffsetFraction CarouselState.itemCount
  CarouselState.currentItem CarouselState.isScrollInProgress
  CarouselState.dispatchRawDelta CarouselState.scroll CarouselState.scrollToItem
  CarouselState.animateScrollToItem CarouselState.animateScrollToItem.animationSpec
  CarouselState.Saver rememberCarouselState rememberCarouselState.initialItem
  rememberCarouselState.itemCount
  CarouselItemDrawInfo CarouselItemDrawInfo.size CarouselItemDrawInfo.minSize
  CarouselItemDrawInfo.maxSize CarouselItemDrawInfo.maskRect
  CarouselItemScope CarouselItemScope.carouselItemDrawInfo
  CarouselItemScope.maskClip CarouselItemScope.maskBorder
  CarouselItemScope.rememberMaskShape
  MultiAspectCarouselScope MultiAspectCarouselScope.content
  MultiAspectCarouselScope.maskClip MultiAspectCarouselScope.maskBorder
  MultiAspectCarouselItemDrawInfo-lazyList MultiAspectCarouselItemDrawInfo-lazyGrid
  MultiAspectCarouselItemDrawInfo MultiAspectCarouselItemDrawInfo.index
  MultiAspectCarouselItemDrawInfo.size MultiAspectCarouselItemDrawInfo.minSize
  MultiAspectCarouselItemDrawInfo.maxSize MultiAspectCarouselItemDrawInfo.maskStart
  MultiAspectCarouselItemDrawInfo.maskEnd MultiAspectCarouselItemDrawInfo.parallax
  MultiAspectCarouselItemDrawInfo.isHorizontal
`)

/** The internal machinery the port reproduces rather than exposes. */
const portedInternals = split(`
  Arrangement Arrangement.findLowestCostArrangement Arrangement.fit
  Arrangement.calculateLargeSize Arrangement.cost Arrangement.isValid
  Arrangement.itemCount
  Keyline KeylineList KeylineList.minSize KeylineList.maxSize
  KeylineList.pivotIndex KeylineList.firstNonAnchorIndex
  KeylineList.lastNonAnchorIndex KeylineList.firstFocalIndex
  KeylineList.lastFocalIndex KeylineList.focalCount
  KeylineList.isFirstFocalItemAtStartOfContainer
  KeylineList.isLastFocalItemAtEndOfContainer
  KeylineList.firstIndexAfterFocalRangeWithSize
  KeylineList.lastIndexBeforeFocalRangeWithSize KeylineList.getKeylineBefore
  KeylineList.getKeylineAfter keylineListOf-alignment keylineListOf-pivot
  KeylineListScope.add lerp-keyline lerp-keylineList
  multiBrowseKeylineList uncontainedKeylineList heroKeylineList
  createLeftAlignedKeylineList createCenterAlignedKeylineList
  calculateMediumChildSize CarouselAlignment
  Strategy Strategy.defaultKeylines Strategy.startKeylineSteps
  Strategy.endKeylineSteps Strategy.minItemSize Strategy.maxItemSize
  Strategy.itemMainAxisSize Strategy.isValid
  Strategy.getKeylineListForScrollOffset getStartKeylineSteps getEndKeylineSteps
  getStartShiftDistance getEndShiftDistance getStepInterpolationPoints
  createShiftedKeylineListForContentPadding
  moveKeylineAndCreateShiftedKeylineList lerp-range
  getSnapPositionOffset KeylineSnapPosition calculateCurrentScrollOffset
  calculateMaxScrollOffset getProgress Modifier.carouselItem CarouselPageSize
  getMaskIntensity getMask getParallax getMinSize
`)

/** Every `@Test` in the ten pinned test files, by file. */
const pinnedTestCases = {
  'ArrangementTest.kt': split(`
    test1L1M1S_noAdjustmentsMade test1L1M1S_decreasesSmallSize
    test1L1M1S_increasesSmallSize test1L1M1S_decreasesMediumSize
    test1L1M1S_increasesMediumSize test1L1M2S_increasesSmallSize
    test1L1M2S_decreasesSmallSize test2L2M2S_increasesMediumSize
    test2L2M2S_decreasesMediumSize
  `),
  'KeylineTest.kt': split(`
    testKeylineList_findsFirstAndLastFocalKeylines
    testKeylineList_pivotsWithCorrectCutoffsRight
    testKeylineList_pivotsWithCorrectCutoffsLeft
    testKeylineList_findsFirstIndexAfterFocalRangeWithSize
    testKeylineList_findsLastIndexBeforeFocalRangeWithSize
    testKeylineList_getKeylineBefore testKeylineList_getKeylineAfter
    testKeylineListLerp test_keylineListsShouldBeEqual
    testDifferentSizedItem_keylineListsShouldNotBeEqual
    testStartKeylines_shouldAddSpacingBetweenItems
    testCenteredKeylines_shouldAddSpacingBetweenItems
    testEndKeylines_shouldAddSpacingBetweenItems
  `),
  'StrategyTest.kt': split(`
    testStrategy_startAlignedStrategyShiftsEnd
    testStrategy_startAlignedCutoffStrategyShiftsEndWithCutoff
    testStrategy_endAlignedCutoffStrategyShiftsStartWithCutoff
    testStrategy_overlappingShiftOffsetsSkipsDefaultKeylineList
    testStrategy_centerAlignedShiftsStart testStrategy_centerAlignedShiftsEnd
    testStrategy_sameAvailableSpaceCreatesEqualObjects
    testStrategy_differentAvailableSpaceCreatesUnequalObjects
    testStrategy_invalidObjectDoesNotEqualValidObject
    testStrategy_startAlignedStrategyWithNegativeMaxScroll
    testStartKeylineStrategy_endStepsShouldAccountForItemSpacing
    testCenterKeylineStrategy_startAndEndStepsShouldAccountForItemSpacing
    testCenterStrategy_stepsShouldAccountForContentPadding
    testStartStrategy_twoLargeOneSmall_shouldAccountForPadding
    testStrategy_getKeylineListForScrollOffset_caching
  `),
  'KeylineSnapPositionTest.kt': split(`
    testCenterAlignedSnapPosition_singleFocalItem
    testCenterAlignedSnapPosition_multipleFocalItems
    testSnapPosition_forStartAlignedStrategy
    testSnapPosition_forStartAlignedStrategyWithMultipleFocal
    testSnapPosition_forStartAlignedStrategyWithMultipleFocalAndLessItems
    testSnapPosition_forStartAlignedStrategyWithLessItemsThanFocal
  `),
  'MultiBrowseTest.kt': split(`
    testMultiBrowse_doesNotResizeLargeWhenEnoughRoom
    testMultiBrowse_resizesItemLargerThanContainerToFit1Small
    testMultiBrowse_hasNoSmallItemsIfNotEnoughRoom
    testMultiBrowse_isNullIfAvailableSpaceIsZero
    testMultiBrowse_adjustsMediumSizeToBeProportional
    testMultiBrowse_withLessItemsThanKeylines
    testMultiBrowse_adjustsForItemSpacing
  `),
  'UncontainedTest.kt': split(`
    testLargeItem_withFullCarouselWidth testLargeItem_largerThanFullCarouselWidth
    testLargeItem_largerThanHalfCarouselWidth
    testRemainingSpaceWithItemSize_fitsItemWithThirdCutoff
    testRemainingSpaceWithItemSize_fitsMediumItemWithCutoff
  `),
  'CenteredHeroTest.kt': split(`
    enoughRoom_shouldFitOneLargeTwoSmall
    lessThan3Items_shouldChangeToLeftAlignedArrangement
    oneItemOnly_shouldGoFullscreen lessThanFullscreenThreshold_shouldGoFullscreen
    maxItemWidth_withoutItemSpacing_firstAndLastDefaultItemsShouldAlignToStartAndEnd
    maxItemWidth_withItemSpacing_firstAndLastDefaultItemsShouldAlignToStartAndEnd
    maxItemWidth_withItemSpacing_evenCount_firstAndLastDefaultItemsShouldAlignToStartAndEnd
  `),
  'CarouselTest.kt': split(`
    carousel_horizontalScrollUpdatesState carousel_verticalScrollUpdatesState
    carousel_testInitialItem carousel_snapsToPage
    uncontainedCarousel_doesntSnapToPage
    uncontainedCarousel_userScrollDisabled_doesNotScroll
    carouselSingleAdvanceFling_capsScroll carouselMultibrowseFling_ScrollsToEnd
    carousel_correctlyCalculatesMaxScrollOffsetWithItemSpacing
    carousel_semanticsBoundsAreReportedCorrectly
    centeredHeroCarousel_horizontalScrollUpdatesState
    centeredHeroCarousel_snapsAndCentersFocalItemAfterScroll
    centeredHeroCarousel_emptyState_doesNotCrash
    centeredHeroCarousel_singleItemState_isCentered
    centeredHeroCarousel_extremelySmallContainer_doesNotCrash
    centeredHeroCarousel_clickedScrolledItem_triggersClick
    centeredHeroCarousel_rtl_focalItemIsCentered
  `),
  'CarouselItemScopeTest.kt': split(`
    mask_fullyUnmaskedShouldMatchSize mask_halfMaksedShouldIntersectSize
    mask_genericMaskedPathShouldIntersectSize mask_squareMaskShouldIntersectSize
    maskBorder_fullyUnmaskedShouldMatchSize
    maskBorder_triangleMaskShouldIntersectSize
  `),
  'MultiAspectCarouselTest.kt': split(`
    carouselRow_default horizontalGrid_singleRow verticalGrid_twoColumns
  `),
} as const

/**
 * The 62 host-test cases are ported one-for-one into
 * `Carousel.keylines.test.ts` and `Carousel.strategy.test.ts` with their upstream
 * expected values. The 26 device-test cases run a Compose harness that has no web
 * equivalent, so each is answered by a named local case or by the browser audit
 * instead.
 */
const deviceCaseDispositions = {
  carousel_horizontalScrollUpdatesState: 'local: reports the focal item as the container scrolls',
  carousel_verticalScrollUpdatesState: 'local: moves on the block arrows in the full-screen layout',
  carousel_testInitialItem: 'local: applies an initial uncontrolled focal item without animating',
  carousel_snapsToPage: 'css: snaps on the axis the layout scrolls (native scroll-snap)',
  uncontainedCarousel_doesntSnapToPage: 'local: gives the uncontained layout its recommended scrolling (free)',
  uncontainedCarousel_userScrollDisabled_doesNotScroll:
    'excluded: `userScrollEnabled` has no honest web analogue — a scroll container the browser owns cannot refuse a wheel or a drag without breaking the platform',
  carouselSingleAdvanceFling_capsScroll:
    'excluded: the browser owns fling distance, so `PagerSnapDistance.atMost(1)` cannot be expressed',
  carouselMultibrowseFling_ScrollsToEnd: 'excluded: same reason — post-fling target selection is the browser’s',
  carousel_correctlyCalculatesMaxScrollOffsetWithItemSpacing:
    'adaptation: the container’s own `scrollWidth - clientWidth` replaces the computed maximum, which is the same quantity measured rather than derived',
  carousel_semanticsBoundsAreReportedCorrectly: 'audit: the rendering audit measures each masked item’s box',
  centeredHeroCarousel_horizontalScrollUpdatesState: 'local: reports the focal item as the container scrolls',
  centeredHeroCarousel_snapsAndCentersFocalItemAfterScroll: 'audit: the centered-hero probe measures the focal item’s centre',
  centeredHeroCarousel_emptyState_doesNotCrash: 'local: renders no slide for an empty collection',
  centeredHeroCarousel_singleItemState_isCentered: 'engine: CenteredHeroTest oneItemOnly_shouldGoFullscreen',
  centeredHeroCarousel_extremelySmallContainer_doesNotCrash: 'local: survives a container resized to nothing and back',
  centeredHeroCarousel_clickedScrolledItem_triggersClick: 'local: renders an activatable item as a real button and reports activation',
  centeredHeroCarousel_rtl_focalItemIsCentered: 'css: mirrors the logical mask and translation in right-to-left',
  mask_fullyUnmaskedShouldMatchSize: 'css: masks with a clip path — a fully unmasked item has a zero inset',
  mask_halfMaksedShouldIntersectSize: 'audit: the multi-browse probe measures a half-masked item',
  mask_genericMaskedPathShouldIntersectSize:
    'excluded: `rememberMaskShape` exposes a Compose `Shape` to the caller; the web item is clipped by the component and shaped by its own border radius',
  mask_squareMaskShouldIntersectSize: 'excluded: same reason as the generic mask shape',
  maskBorder_fullyUnmaskedShouldMatchSize:
    'excluded: `maskBorder` is a consumer modifier with no web analogue; a border on the item follows its clip natively',
  maskBorder_triangleMaskShouldIntersectSize: 'excluded: same reason as maskBorder',
  carouselRow_default: 'local: parallaxes multi-aspect content without moving the item box',
  horizontalGrid_singleRow:
    'excluded: `LazyGridState` is a Compose layout; the multi-aspect layout here is one scroll container, and a grid of carousels is a consumer composition',
  verticalGrid_twoColumns: 'excluded: same reason as the horizontal grid',
} as const

/** Deliberate omissions, each with the reason it is not a defect. */
const exclusions = {
  'predictive back': 'an Android system gesture; the browser owns its back affordance',
  'window insets': 'an Android window concern with no web equivalent',
  flingBehavior:
    'all three factories describe post-gesture physics the browser owns. The specification’s own two named behaviors — default and snap-scrolling — are what `scroll` exposes instead',
  rememberSplineBasedDecay: 'part of the fling contract above',
  userScrollEnabled:
    'a scroll container cannot refuse user scrolling without breaking wheel, drag, and keyboard behavior the platform guarantees',
  'CarouselState.Saver': 'Android instance-state restoration; the web restores scroll position itself',
  'CarouselItemScope.maskClip/maskBorder/rememberMaskShape':
    'consumer modifiers that hand a Compose `Shape` back to the caller. The component clips the item and the item’s own border radius shapes it',
  'Modifier.drawDebugLines': 'a development aid for drawing keylines over a carousel',
  'MultiAspectCarouselItemDrawInfo(LazyGridState)':
    'a Compose grid layout; the multi-aspect layout here is one scroll container',
  'Compose animation specs': 'expressed as semantic motion roles, the library-wide rule',
  'CarouselAlignment.End': 'reachable in the port’s builder and exercised by the pinned KeylineTest, but no layout selects it: the specification names start-aligned and center-aligned only',
} as const

/** Places where the web platform answers the same requirement differently. */
const adaptations = {
  'Pager → native scroll container':
    'items lay out end-to-end at the focal size, exactly the size Pager gives every page, so touch, wheel, momentum, keyboard scrolling, RTL, and scrollbar accessibility are the browser’s',
  'KeylineSnapPosition → scroll-margin':
    '`getSnapPositionOffset` maps exactly onto `scroll-margin-*` under `scroll-snap-align: start`, making keyline snapping — including both shift ranges — native',
  'per-frame layout modifier → imperative style writes':
    'a React state update per frame would re-render every item to change one custom property',
  'CarouselItemDrawInfo → custom properties and a size bucket':
    'the specification’s adaptive-content rule becomes CSS instead of a per-frame render',
  'Role.Carousel → the APG carousel pattern':
    'no ARIA `carousel` role exists; a labelled group with `aria-roledescription="carousel"` and slides labelled "N of M" is the web’s form of the same announcement',
  'beyondViewportPageCount → an explicit item window':
    'Compose composes only nearby pages, so its out-of-bounds translation never reaches a distant item. Every item exists in the DOM, so the window is applied explicitly and items outside it keep their natural, focusable position',
  'Density → CSS pixels': 'the engine takes pixel values, so no density conversion exists',
  'roundToInt page size → a fractional length':
    'Pager measures in whole pixels; CSS accepts a fractional one, so the arrangement fits the container exactly',
  'hashCode → a deterministic key':
    'JavaScript has no hashCode contract, so `keylineListKey`/`strategyKey` carry the equality intent the pinned tests assert',
  'maxScrollOffset → the measured scroll range':
    'the container’s own `scrollWidth - clientWidth` is the same quantity, measured rather than derived, so the end shift completes exactly at the end of scroll',
  'up/down arrows leave the carousel → Tab':
    'a TalkBack idiom; swallowing those keys on the web would break page scrolling',
} as const

/** Findings in the pinned source worth stating rather than silently reproducing. */
const anomalies = {
  'no generated token file':
    'Carousel has no `CarouselTokens.kt` at the pinned revision or at HEAD, so its registry is sourced from `CarouselDefaults` and the design specification’s measurement tables instead',
  'no deprecated surface':
    'the family ships no deprecated API at either revision, the first family task where the deprecated ledger is empty',
  'mask intensity excludes its own boundaries':
    'in `getMaskIntensity`, an item at exactly 16:9 or exactly 1:1 fails both strict comparisons and falls through to the lowest intensity, 1/4, rather than the boundary value of the range it sits on',
  'roundToNearestStep has no production caller':
    'nothing in the pinned implementation passes it; `Modifier.carouselItem` and the debug overlay both take the default. It exists for the pinned tests, and its tie-breaking sits exactly on a float boundary — 0.50000006 in the source’s `Float` and 0.4999999999999999 in a double — so the port compares with a tolerance to keep the sourced behavior',
  'out-of-bounds offset divides by a size':
    '`translation += (unadjustedCenter - interpolated.unadjustedOffset) / interpolated.size` divides a distance by a size. It is only ever evaluated for an item within `beyondViewportPageCount` of the viewport, where the numerator is small; the port reproduces it inside the same window',
  'the hero keyline list is start-aligned below three items':
    '`heroKeylineList` forces a start-aligned arrangement when `itemCount < 3`, so `centeredHero` silently becomes `hero` for one or two items',
  'uncontained leading anchor is half the cut-off item':
    'the leading anchor is `max(anchorSize, mediumItemSize * 0.5)` rather than the anchor size, so motion at the leading edge resembles the trailing edge where the cut-off actually is',
  'CarouselDefaults.AnchorSize is internal':
    'the 10dp anchor is `internal`, not public, yet it determines how far items travel past both container edges. The port registers it because it is a layout number a theme should be able to change',
} as const

describe('Carousel pinned source ledger', () => {
  it('freezes all nineteen pinned blob identities', () => {
    expect(Object.keys(pinnedFiles)).toHaveLength(19)
    Object.values(pinnedFiles).forEach((hash) => expect(hash).toMatch(/^[0-9a-f]{40}$/))
    expect(new Set(Object.values(pinnedFiles)).size).toBe(19)
  })

  it('freezes the seven HEAD blobs whose delta is classified rather than re-pinned', () => {
    expect(Object.keys(headBlobs)).toHaveLength(7)
    Object.entries(headBlobs).forEach(([file, hash]) => {
      expect(hash).toMatch(/^[0-9a-f]{40}$/)
      // A classified delta must actually be a delta.
      expect(hash, file).not.toBe(pinnedFiles[file as keyof typeof pinnedFiles])
    })
    // The other twelve are byte-identical, so they have no HEAD entry.
    expect(19 - Object.keys(headBlobs).length).toBe(12)
  })

  it('records that the family has no generated token file to partition', () => {
    expect(generatedTokenFiles).toHaveLength(0)

    const registration = defaultTokenSet.componentTokens.find(
      (entry) => entry.component === 'carousel',
    )
    expect(registration).toBeDefined()
    expect(registration?.task).toBe('T48')
    expect(registration?.source.revision).toBe('a90df2fc27e026b9ad2ed569f203a260c1041fab')
    // The attribution points at the implementation, because there is no token
    // file to point at.
    expect(registration?.source.url).toContain('carousel/Carousel.kt')
  })

  it('registers every sourced arrangement number the implementation reads', () => {
    const tokens = defaultTokenSet.componentTokens.find(
      (entry) => entry.component === 'carousel',
    )?.tokens

    expect(Object.keys(sourcedNumbers)).toHaveLength(4)
    expect(tokens?.['min-small-item-size'].value).toBe(sourcedNumbers['CarouselDefaults.MinSmallItemSize'])
    expect(tokens?.['max-small-item-size'].value).toBe(sourcedNumbers['CarouselDefaults.MaxSmallItemSize'])
    expect(tokens?.['anchor-size'].value).toBe(sourcedNumbers['CarouselDefaults.AnchorSize'])
    expect(tokens?.['medium-large-item-diff-threshold'].value).toBe(
      sourcedNumbers['CarouselDefaults.MediumLargeItemDiffThreshold'],
    )
  })

  it('registers every measurement the design specification owns', () => {
    const tokens = defaultTokenSet.componentTokens.find(
      (entry) => entry.component === 'carousel',
    )?.tokens

    expect(Object.keys(specifiedNumbers)).toHaveLength(7)
    expect(tokens?.['leading-padding'].value).toBe(specifiedNumbers['leading/trailing padding'])
    expect(tokens?.['trailing-padding'].value).toBe(specifiedNumbers['leading/trailing padding'])
    expect(tokens?.['block-padding'].value).toBe(specifiedNumbers['top/bottom padding'])
    expect(tokens?.['item-spacing'].value).toBe(specifiedNumbers['padding between elements'])
    expect(tokens?.['uncontained-trailing-padding'].value).toBe(
      specifiedNumbers['uncontained trailing padding'],
    )
    expect(tokens?.['full-screen-padding'].value).toBe(specifiedNumbers['full-screen padding'])
    expect(tokens?.['full-screen-item-spacing'].value).toBe(
      specifiedNumbers['full-screen padding between elements'],
    )
    // The 28dp item corner is registered as the system role that already carries
    // it, so reshaping the scale reshapes carousel items too.
    expect(tokens?.['item-shape'].value).toEqual({ $ref: 'sys.shape.corners.cornerExtraLarge' })
  })

  it('accounts for the whole current surface at parameter granularity, with no deprecated API', () => {
    expect(currentSurface).toHaveLength(82)
    expect(new Set(currentSurface).size).toBe(currentSurface.length)
    // Every top-level name in the pinned public surface is accounted for.
    for (const name of [
      'HorizontalMultiBrowseCarousel',
      'HorizontalUncontainedCarousel',
      'HorizontalCenteredHeroCarousel',
      'CarouselDefaults',
      'CarouselState',
      'rememberCarouselState',
      'CarouselItemDrawInfo',
      'CarouselItemScope',
      'MultiAspectCarouselScope',
      'MultiAspectCarouselItemDrawInfo',
    ]) {
      expect(currentSurface, name).toContain(name)
    }
  })

  it('reproduces the internal engine rather than exposing it', () => {
    expect(new Set(portedInternals).size).toBe(portedInternals.length)
    // Nothing internal escapes through the barrel.
    for (const name of ['Keyline', 'KeylineList', 'Strategy', 'Arrangement', 'CarouselAlignment']) {
      expect(barrel, name).not.toContain(name)
    }
    expect(split(barrel).filter((token) => token === 'Carousel,')).toHaveLength(0)
  })

  it('freezes all 88 pinned test cases', () => {
    const all = Object.values(pinnedTestCases).flat()
    expect(all).toHaveLength(88)
    expect(new Set(all).size).toBe(88)

    // Sixty-two are host tests over the layout engine, ported one for one.
    const hostFiles = [
      'ArrangementTest.kt',
      'KeylineTest.kt',
      'StrategyTest.kt',
      'KeylineSnapPositionTest.kt',
      'MultiBrowseTest.kt',
      'UncontainedTest.kt',
      'CenteredHeroTest.kt',
    ] as const
    const hostCases = hostFiles.flatMap((file) => pinnedTestCases[file])
    expect(hostCases).toHaveLength(62)

    // The remaining twenty-six are device tests, each with its own disposition.
    const deviceCases = [
      ...pinnedTestCases['CarouselTest.kt'],
      ...pinnedTestCases['CarouselItemScopeTest.kt'],
      ...pinnedTestCases['MultiAspectCarouselTest.kt'],
    ]
    expect(deviceCases).toHaveLength(26)
    deviceCases.forEach((name) => {
      expect(Object.keys(deviceCaseDispositions), name).toContain(name)
    })
    expect(Object.keys(deviceCaseDispositions)).toHaveLength(26)
  })

  it('gives every device-test disposition one classified result', () => {
    Object.entries(deviceCaseDispositions).forEach(([name, disposition]) => {
      expect(disposition, name).toMatch(/^(local|css|engine|audit|excluded|adaptation):/)
    })
  })

  it('records every exclusion, adaptation, and anomaly with its reason', () => {
    expect(Object.keys(exclusions)).toHaveLength(11)
    expect(Object.keys(adaptations)).toHaveLength(11)
    expect(Object.keys(anomalies)).toHaveLength(8)
    for (const record of [exclusions, adaptations, anomalies]) {
      Object.entries(record).forEach(([name, reason]) => {
        expect(reason.length, name).toBeGreaterThan(30)
      })
    }
  })
})

describe('Carousel port shape', () => {
  it('keeps the engine in private modules the barrel never re-exports', () => {
    expect(barrel).toContain("export { Carousel } from './Carousel'")
    for (const module of ['./arrangement', './keylines', './strategy', './multiAspect']) {
      expect(barrel, module).not.toContain(module)
    }
  })

  it('exports one component and its five types', () => {
    for (const name of [
      'CarouselItem',
      'CarouselLayout',
      'CarouselProps',
      'CarouselScroll',
      'MultiAspectCarouselItem',
    ]) {
      expect(barrel, name).toContain(name)
    }
  })

  it('names all six official layouts in the public union', () => {
    for (const layout of [
      'multiBrowse',
      'uncontained',
      'multiAspect',
      'hero',
      'centeredHero',
      'fullScreen',
    ]) {
      expect(typesSource, layout).toContain(`'${layout}'`)
    }
  })

  it('cites the pinned revision in every ported module', () => {
    for (const source of [arrangementSource, keylinesSource, strategySource, multiAspectSource]) {
      expect(source).toContain('a90df2fc27e026b9ad2ed569f203a260c1041fab')
    }
  })

  it('declares its client boundary, since it owns scroll behavior', () => {
    expect(componentSource.startsWith("'use client'")).toBe(true)
  })

  it('writes no measured value during render', () => {
    // Everything the layout and paint passes produce is written imperatively, so
    // server markup and the first client frame agree.
    expect(componentSource).not.toContain('--m3e-carousel-item-size')
    expect(componentSource).not.toContain('--m3e-carousel-item-inset')
    expect(maskSource).toContain('--m3e-carousel-item-size')
    expect(maskSource).toContain('--m3e-carousel-item-inset-start')
  })

  it('keeps the mask in CSS and the arrangement in JavaScript', () => {
    expect(css).toContain('clip-path: inset(')
    expect(maskSource).not.toContain('clip-path')
  })
})
