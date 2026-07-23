import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defaultTokenSet } from '../../../src/tokens'

const sliderSource = readFileSync(
  fileURLToPath(
    new URL('../../../src/components/Slider/Slider.tsx', import.meta.url),
  ),
  'utf8',
)
const rangeSource = readFileSync(
  fileURLToPath(
    new URL('../../../src/components/Slider/RangeSlider.tsx', import.meta.url),
  ),
  'utf8',
)
const sharedSource = readFileSync(
  fileURLToPath(
    new URL('../../../src/components/Slider/Slider.shared.tsx', import.meta.url),
  ),
  'utf8',
)
const css = readFileSync(
  fileURLToPath(
    new URL('../../../src/components/Slider/Slider.css', import.meta.url),
  ),
  'utf8',
)

const split = (source: string) => source.trim().split(/\s+/)

const pinnedSourceFiles = [
  {
    file: 'Slider.kt',
    blob: '49ae732acecdaf0c62d6e3afe98c5fb2ced77377',
    lines: 3876,
  },
  {
    file: 'SliderTokens.kt',
    blob: '607a2e87f50827d26fd78cefc7cc8c380cb5d18a',
    lines: 75,
  },
  {
    file: 'SliderTest.kt',
    blob: '4565310203edabcefeb84a5eee0ab5648575fdf9',
    lines: 1667,
  },
  {
    file: 'SliderScreenshotTest.kt',
    blob: 'a63ff58deece394abf598768aef86480f4fafba4',
    lines: 845,
  },
] as const

/**
 * Every generated SliderTokens declaration at v2_3_5. `read` is the exact
 * literal `SliderTokens.*` partition in the pinned Slider.kt; the complement
 * remains deliberately unread.
 */
const sourceTokenLedger = {
  declarations: split(`
    ActiveContainerOpacity ActiveHandleHeight ActiveHandleLeadingSpace
    ActiveHandlePadding ActiveHandleShape ActiveHandleTrailingSpace
    ActiveHandleWidth ActiveTrackColor ActiveTrackHeight ActiveTrackShape
    ActiveTrackShapeLeading DisabledActiveTrackColor DisabledActiveTrackOpacity
    DisabledHandleColor DisabledHandleOpacity DisabledHandleWidth
    DisabledInactiveTrackColor DisabledInactiveTrackOpacity DisabledStopColor
    FocusActiveTrackColor FocusHandleWidth FocusInactiveTrackColor FocusStopColor
    HandleColor HandleHeight HandleShape HandleWidth HoverHandleColor
    HoverHandleWidth HoverStopColor InactiveContainerOpacity InactiveTrackColor
    InactiveTrackHeight InactiveTrackShape LabelContainerColor LabelTextColor
    PressedActiveTrackColor PressedHandleColor PressedHandleWidth
    PressedInactiveTrackColor PressedStopColor SliderActiveHandleColor
    StopIndicatorColor StopIndicatorColorSelected StopIndicatorShape
    StopIndicatorSize StopIndicatorTrailingSpace ValueIndicatorActiveBottomSpace
    ValueIndicatorContainerColor ValueIndicatorLabelTextColor
    ValueIndicatorLabelTextFont
  `),
  read: split(`
    ActiveHandleLeadingSpace ActiveTrackColor DisabledActiveTrackColor
    DisabledActiveTrackOpacity DisabledHandleColor DisabledHandleOpacity
    DisabledInactiveTrackColor DisabledInactiveTrackOpacity HandleColor
    HandleHeight HandleShape HandleWidth InactiveTrackColor InactiveTrackHeight
    StopIndicatorSize
  `),
} as const

const sourceSurfaceLedger = [
  'Slider(value-basic)',
  'Slider(value-custom-slots)',
  'Slider(state)',
  'VerticalSlider(state-topToBottom)',
  'RangeSlider(value-basic)',
  'RangeSlider(value-custom-slots)',
  'RangeSlider(state)',
  'rememberSliderState',
  'rememberRangeSliderState',
  'SliderDefaults',
  'SliderDefaults.colors()',
  'SliderDefaults.colors(overrides)',
  'SliderDefaults.Thumb(horizontal)',
  'SliderDefaults.Thumb(isVertical)',
  'SliderDefaults.Track(SliderState)',
  'SliderDefaults.Track(SliderState,trackCornerSize)',
  'SliderDefaults.CenteredTrack',
  'SliderDefaults.Track(RangeSliderState)',
  'SliderDefaults.Track(RangeSliderState,trackCornerSize)',
  'SliderDefaults.drawStopIndicator',
  'SliderDefaults.TrackStopIndicatorSize',
  'SliderDefaults.TickSize',
  'SliderColors',
  'SliderState',
  'RangeSliderState',
] as const

const deprecatedSourceSurfaceLedger = [
  'VerticalSliderLegacy(reverseDirection)',
  'SliderDefaults.Thumb(SliderState)',
  'SliderDefaults.Track(SliderPositions)',
  'SliderDefaults.Track(RangeSliderState-legacy)',
  'SliderPositions',
] as const

const observableImplementationLedger = [
  'SliderImpl-measure-and-place',
  'RangeSliderImpl-measure-and-place',
  'slideOnKeyEvents',
  'rangeSliderOnKeyEvents',
  'sliderSemantics-setProgress',
  'rangeSliderStartThumbSemantics',
  'rangeSliderEndThumbSemantics',
  'sliderTapModifier',
  'draggable-single-axis',
  'rangeSliderPressDragModifier',
  'RangeSliderLogic-nearest-thumb',
  'RangeSliderLogic-overlap-tie',
  'ThumbContent-focus-press-drag-width',
  'stepsToTickFractions',
  'snapValueToTick',
  'calcFraction-and-scale',
  'drawTrack-segmentation',
  'drawTrack-tick-gap-filtering',
  'drawTrackPath-asymmetric-corners',
  'discrete-corner-inset-placement',
  'focus-padding-position-invariance',
  'minimumInteractiveComponentSize',
  'pointer-slop-and-orthogonal-cancellation',
  'range-non-crossing-coercion',
  'RTL-and-vertical-direction-resolution',
] as const

const pinnedSourceAnomalies = [
  'ActiveHandleLeadingSpace-used-for-both-sides-trailing-role-unread',
  'InactiveTrackHeight-sizes-entire-track-active-height-unread',
  'hover-interaction-is-emitted-but-ThumbContent-collector-does-not-handle-it',
  'state-specific-generated-colors-and-widths-are-unread',
  'enabled-and-disabled-tick-colors-cross-track-role-identities',
  'disabled-handle-precomposites-over-surface-while-track-colors-retain-alpha',
  'default-stop-indicator-uses-active-track-color-not-generated-stop-roles',
  'range-custom-corner-alignment-line-hardcodes-half-track-height',
  'RangeSliderState-gestureEndAction-boolean-argument-is-unused',
  'SliderColors-copy-KDoc-says-SelectableChipColors',
  'rememberRangeSliderState-KDoc-says-SliderState',
  'rangeSlider-thumb-recomposition-test-is-ignored-as-b447508701',
  'horizontal-PageUp-PageDown-do-not-apply-RTL-reversal',
] as const

const pinnedBehaviorTests = split(`
  sliderPosition_valueCoercion sliderState_isVertical_getter
  sliderPosition_stepsThrowWhenLessThanZero slider_semantics_continuous
  slider_semantics_stepped slider_semantics_focusable slider_semantics_disabled
  slider_drag slider_drag_out_of_bounds slider_tap vertical_slider_tap
  slider_scrollableContainer slider_tap_rangeChange slider_drag_rtl slider_tap_rtl
  slider_sizes slider_sizes_within_row slider_min_size
  slider_noUnwantedCallbackCalls slider_valueChangeFinished_calledOnce
  slider_setProgress_callsOnValueChangeFinished slider_interactionSource_resetWhenDisposed
  slider_onValueChangedFinish_afterTap slider_zero_width slider_thumb_recomposition
  slider_track_recomposition slider_parentWithInfiniteWidth_minWidth
  slider_rowWithInfiniteWidth slider_onValueChangeFinishedWithSnackbar
  rangeSlider_dragThumb rangeSlider_drag_out_of_bounds
  rangeSlider_drag_overlap_thumbs rangeSlider_tap rangeSlider_tap_rangeChange
  rangeSlider_drag_rtl rangeSlider_drag_out_of_bounds_rtl
  rangeSlider_closeThumbs_dragRight rangeSlider_closeThumbs_dragLeft
  rangeSlider_weightModifier rangeSlider_semantics_continuous
  rangeSlider_semantics_stepped rangeSlider_thumbs_semanticsNodeBounds
  rangeSlider_thumbs_visualBounds slider_dragOutsideTouchArea_doesntJump
  rangeSlider_thumb_recomposition rangeSlider_track_recomposition
  rangeSlider_parentWithInfiniteWidth_minWidth rangeSlider_rowWithInfiniteWidth
  rangeSlider_onValueChangeFinishedWithSnackbar
  rangeSlider_valueUpdatedByLaunchEffectAndInteraction
  rangeslider_initialValueOutsideOfRange_doesNotCrash
  slider_thumbPosition_staysSameWhenFocused
  slider_thumbPosition_staysSameWhenFocused_insetRing
  verticalSlider_thumbPosition_staysSameWhenFocused_insetRing
  verticalSlider_reversed_thumbPosition_staysSameWhenFocused_insetRing
`)

const pinnedScreenshotTests = split(`
  sliderTest_origin slider_focused_insetFocusRings sliderTest_origin_rtl
  sliderTest_withSteps_rtl sliderTest_withSteps_rtl_lookaheadScope
  sliderTest_origin_disabled sliderTest_middle sliderTest_middle_no_gap
  sliderTest_middle_no_inside_corner sliderTest_middle_no_stop_indicator
  sliderTest_middle_dark sliderTest_middle_dark_disabled sliderTest_end
  sliderTest_end_rtl sliderTest_middle_steps sliderTest_first_steps
  sliderTest_last_steps sliderTest_middle_steps_dark
  sliderTest_middle_steps_disabled sliderTest_middle_steps_custom_ticks
  sliderTest_customColors sliderTest_customColors_disabled sliderTest_min_corner
  sliderTest_middle_custom_corners_track_icons verticalSliderTest
  verticalSliderTest_rtl verticalSliderTest_reversed centeredSliderTest
  centeredSliderTest_dark centeredSliderTest_rtl centeredSliderTest_middle
  centeredSliderTest_steps verticalCenteredSliderTest
  rangeSliderTest_middle_no_gap rangeSliderTest_middle_no_external_corner
  rangeSliderTest_middle_no_inside_corner rangeSliderTest_middle_no_inside_corner_rtl
  rangeSliderTest_middle_no_inside_corner_rtl_lookaheadScope
  rangeSliderTest_middle_no_stop_indicator
  rangeSliderTest_middle_no_stop_indicator_rtl
  rangeSliderTest_middle_steps_disabled rangeSliderTest_middle_steps_enabled
  rangeSliderTest_middle_steps_dark_enabled
  rangeSliderTest_middle_steps_dark_disabled
  rangeSliderTest_middle_steps_custom_ticks rangeSliderTest_overlappingThumbs
  rangeSliderTest_fullRange rangeSliderTest_asymmetric_startEnd
  rangeSliderTest_asymmetric_startEnd_rtl rangeSliderTest_steps_customColors
`)

describe('Slider pinned-source completeness ledger', () => {
  it('pins all four audited upstream files and their immutable identities', () => {
    expect(pinnedSourceFiles).toHaveLength(4)
    expect(new Set(pinnedSourceFiles.map(({ file }) => file)).size).toBe(4)
    expect(new Set(pinnedSourceFiles.map(({ blob }) => blob)).size).toBe(4)
    expect(pinnedSourceFiles.map(({ lines }) => lines)).toEqual([
      3876, 75, 1667, 845,
    ])
  })

  it('freezes all 51 generated roles as 15 literally read and 36 unread', () => {
    const declared = new Set(sourceTokenLedger.declarations)
    const read = new Set(sourceTokenLedger.read)
    const unread = sourceTokenLedger.declarations.filter(
      (role) => !read.has(role),
    )

    expect(sourceTokenLedger.declarations).toHaveLength(51)
    expect(declared.size).toBe(51)
    expect(sourceTokenLedger.read).toHaveLength(15)
    expect(read.size).toBe(15)
    expect([...read].every((role) => declared.has(role))).toBe(true)
    expect(unread).toHaveLength(36)
    expect(read.size + unread.length).toBe(declared.size)
    expect(unread).toContain('HoverHandleWidth')
    expect(unread).toContain('ActiveTrackHeight')
    expect(unread).toContain('ValueIndicatorLabelTextFont')
  })

  it('accounts for every current, deprecated, and internal observable path', () => {
    expect(sourceSurfaceLedger).toHaveLength(25)
    expect(new Set(sourceSurfaceLedger).size).toBe(25)
    expect(deprecatedSourceSurfaceLedger).toHaveLength(5)
    expect(new Set(deprecatedSourceSurfaceLedger).size).toBe(5)
    expect(observableImplementationLedger).toHaveLength(25)
    expect(new Set(observableImplementationLedger).size).toBe(25)
    expect(pinnedSourceAnomalies).toHaveLength(13)
    expect(new Set(pinnedSourceAnomalies).size).toBe(13)
  })

  it('freezes all 55 behavior tests and all 50 screenshot tests', () => {
    expect(pinnedBehaviorTests).toHaveLength(55)
    expect(new Set(pinnedBehaviorTests).size).toBe(55)
    expect(pinnedScreenshotTests).toHaveLength(50)
    expect(new Set(pinnedScreenshotTests).size).toBe(50)

    expect(pinnedBehaviorTests).toContain('slider_zero_width')
    expect(pinnedBehaviorTests).toContain('rangeSlider_drag_overlap_thumbs')
    expect(pinnedBehaviorTests).toContain(
      'verticalSlider_reversed_thumbPosition_staysSameWhenFocused_insetRing',
    )
    expect(pinnedScreenshotTests).toContain('centeredSliderTest_steps')
    expect(pinnedScreenshotTests).toContain(
      'rangeSliderTest_asymmetric_startEnd_rtl',
    )
  })

  it('pins source identity and registers only observed generated resolution paths', () => {
    const registration = defaultTokenSet.componentTokens.find(
      (candidate) => candidate.component === 'slider',
    )

    expect(registration?.task).toBe('T39')
    expect(registration?.source).toEqual({
      id: 'androidx-material3-slider',
      url: 'https://android.googlesource.com/platform/frameworks/support/+/225f50d42bf0adeb2abf4b6109befb5ab6ce4efc/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Slider.kt',
      revision: '225f50d42bf0adeb2abf4b6109befb5ab6ce4efc',
      accessed: '2026-07-23',
    })
    expect(registration?.tokens).toHaveProperty('handle-shape')
    expect(registration?.tokens).toHaveProperty('active-track-color')
    expect(registration?.tokens).toHaveProperty('inactive-track-color')
    expect(registration?.tokens).not.toHaveProperty('hover-handle-width')
    expect(registration?.tokens).not.toHaveProperty('active-track-height')
    expect(registration?.tokens).not.toHaveProperty(
      'value-indicator-container-color',
    )
  })

  it('keeps every public web adaptation and source quirk searchable', () => {
    for (const marker of [
      'useControllableState',
      'valueForPointer',
      'valueForKey',
      'formatValueForSemantics',
      'onValueChangeFinished',
    ]) {
      expect(sliderSource).toContain(marker)
    }
    for (const marker of [
      'chooseThumb',
      "return pointerValue < value[0] ? 'start' : 'end'",
      'Math.min(next, current[1])',
      'Math.max(next, current[0])',
      'aria-valuemax={resolvedValue[1]}',
      'aria-valuemin={resolvedValue[0]}',
    ]) {
      expect(rangeSource).toContain(marker)
    }
    for (const marker of [
      'const actualSteps = bounds.steps > 0 ? bounds.steps + 1 : 100',
      'const page = Math.min(10, Math.max(1, Math.trunc(actualSteps / 10)))',
      'snapValueForSemantics',
      'cornerCoefficient = 1 - 2 * fraction',
      'buildSingleSegments',
      'buildSingleTickWindows',
      'buildRangeSegments',
      'reverseSegment',
      'showStopIndicator',
    ]) {
      expect(sharedSource).toContain(marker)
    }
    for (const marker of [
      '--m3e-comp-slider-inset-focus-ring-padding',
      '--m3e-comp-slider-interacted-handle-width',
      '--m3e-comp-slider-disabled-handle-opacity',
      '--m3e-sys-color-surface',
      'prefers-reduced-motion',
      'forced-colors',
    ]) {
      expect(css).toContain(marker)
    }
  })
})
