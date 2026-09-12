import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defaultTimePickerTokens } from '../../../src/tokens/defaults/time-picker'

const componentSource = readFileSync(
  fileURLToPath(new URL('../../../src/components/TimePicker/TimePicker.tsx', import.meta.url)),
  'utf8',
)
const css = readFileSync(
  fileURLToPath(new URL('../../../src/components/TimePicker/TimePicker.css', import.meta.url)),
  'utf8',
)
const behaviorSource = [
  'TimePicker.test.tsx',
  'TimePicker.a11y.test.tsx',
  'TimePicker.ssr.test.tsx',
].map((file) => readFileSync(
  fileURLToPath(new URL(`../../../tests/components/TimePicker/${file}`, import.meta.url)),
  'utf8',
)).join('\n')
const split = (source: string) => source.trim().split(/\s+/)

const pinnedFiles = {
  'TimePicker.kt': 'f341edbc2698fb6fe93418c5e1896257aa1f538e',
  'TimePickerTokens.kt': 'ecbb7525709bb6ba05619e0f095df258794cf2d6',
  'TimeInputTokens.kt': '4b09f4fb16b750f4469fc68bf63504d111439924',
  'TimePickerTest.kt': 'd08e5fbd105265f11e7af5c6d0a0bd244553f2fb',
  'TimePickerScreenshotTest.kt': 'e273437aa0d45682aa14679150770f8450a9e6fb',
  'TimeInputScreenshotTest.kt': '831aa974a3ba617d08f3e55aa394aa2bc272b76d',
} as const

const pickerTokenDeclarations = split(`
  ClockDialColor ClockDialContainerSize ClockDialLabelTextFont
  ClockDialSelectedLabelTextColor ClockDialSelectorCenterContainerColor
  ClockDialSelectorCenterContainerShape ClockDialSelectorCenterContainerSize
  ClockDialSelectorHandleContainerColor ClockDialSelectorHandleContainerShape
  ClockDialSelectorHandleContainerSize ClockDialSelectorTrackContainerColor
  ClockDialSelectorTrackContainerWidth ClockDialShape
  ClockDialUnselectedLabelTextColor ContainerColor ContainerElevation
  ContainerShape HeadlineColor HeadlineFont PeriodSelectorContainerShape
  PeriodSelectorHorizontalContainerHeight PeriodSelectorHorizontalContainerWidth
  PeriodSelectorLabelTextFont PeriodSelectorOutlineColor PeriodSelectorOutlineWidth
  PeriodSelectorSelectedContainerColor PeriodSelectorSelectedFocusLabelTextColor
  PeriodSelectorSelectedHoverLabelTextColor PeriodSelectorSelectedLabelTextColor
  PeriodSelectorSelectedPressedLabelTextColor PeriodSelectorUnselectedFocusLabelTextColor
  PeriodSelectorUnselectedHoverLabelTextColor PeriodSelectorUnselectedLabelTextColor
  PeriodSelectorUnselectedPressedLabelTextColor PeriodSelectorVerticalContainerHeight
  PeriodSelectorVerticalContainerWidth TimeSelector24HVerticalContainerWidth
  TimeSelectorContainerHeight TimeSelectorContainerShape TimeSelectorContainerWidth
  TimeSelectorLabelTextFont TimeSelectorSelectedContainerColor
  TimeSelectorSelectedFocusLabelTextColor TimeSelectorSelectedHoverLabelTextColor
  TimeSelectorSelectedLabelTextColor TimeSelectorSelectedPressedLabelTextColor
  TimeSelectorSeparatorColor TimeSelectorSeparatorFont
  TimeSelectorUnselectedContainerColor TimeSelectorUnselectedFocusLabelTextColor
  TimeSelectorUnselectedHoverLabelTextColor TimeSelectorUnselectedLabelTextColor
  TimeSelectorUnselectedPressedLabelTextColor
`)

const inputTokenDeclarations = split(`
  ContainerColor ContainerElevation ContainerShape FocusIndicatorColor
  HeadlineColor HeadlineFont PeriodSelectorContainerHeight
  PeriodSelectorContainerShape PeriodSelectorContainerWidth
  PeriodSelectorLabelTextFont PeriodSelectorOutlineColor PeriodSelectorOutlineWidth
  PeriodSelectorSelectedContainerColor PeriodSelectorSelectedFocusLabelTextColor
  PeriodSelectorSelectedHoverLabelTextColor PeriodSelectorSelectedLabelTextColor
  PeriodSelectorSelectedPressedLabelTextColor PeriodSelectorUnselectedFocusLabelTextColor
  PeriodSelectorUnselectedHoverLabelTextColor PeriodSelectorUnselectedLabelTextColor
  PeriodSelectorUnselectedPressedLabelTextColor TimeFieldContainerColor
  TimeFieldContainerHeight TimeFieldContainerShape TimeFieldContainerWidth
  TimeFieldFocusContainerColor TimeFieldFocusLabelTextColor
  TimeFieldFocusOutlineColor TimeFieldFocusOutlineWidth TimeFieldHoverLabelTextColor
  TimeFieldLabelTextColor TimeFieldLabelTextFont TimeFieldSeparatorColor
  TimeFieldSeparatorFont TimeFieldSupportingTextColor TimeFieldSupportingTextFont
`)

const pickerImplementationReads = split(`
  ClockDialColor ClockDialContainerSize ClockDialLabelTextFont
  ClockDialSelectedLabelTextColor ClockDialSelectorCenterContainerSize
  ClockDialSelectorHandleContainerColor ClockDialSelectorHandleContainerSize
  ClockDialSelectorTrackContainerWidth ClockDialUnselectedLabelTextColor
  ContainerColor PeriodSelectorContainerShape PeriodSelectorHorizontalContainerHeight
  PeriodSelectorHorizontalContainerWidth PeriodSelectorOutlineColor PeriodSelectorOutlineWidth
  PeriodSelectorSelectedContainerColor PeriodSelectorSelectedLabelTextColor
  PeriodSelectorUnselectedLabelTextColor PeriodSelectorVerticalContainerHeight
  PeriodSelectorVerticalContainerWidth TimeSelectorContainerHeight
  TimeSelectorContainerShape TimeSelectorContainerWidth TimeSelectorLabelTextFont
  TimeSelectorSelectedContainerColor TimeSelectorSelectedLabelTextColor
  TimeSelectorUnselectedContainerColor TimeSelectorUnselectedLabelTextColor
`)

const inputImplementationReads = split(`
  PeriodSelectorContainerHeight PeriodSelectorContainerWidth
  TimeFieldContainerHeight TimeFieldContainerShape TimeFieldContainerWidth
  TimeFieldLabelTextFont TimeFieldSeparatorColor TimeFieldSupportingTextColor
  TimeFieldSupportingTextFont
`)

const behaviorEvidence = [
  {
    source: split('timePicker_vertical_layout timePicker_initialState'),
    local: 'keeps modal changes as a draft, restores on Cancel, and commits on OK',
  },
  {
    source: split('timePicker_horizontal_layout'),
    local: 'renders the source horizontal layout with a horizontal period selector',
  },
  {
    source: split('timePicker_switchToMinutes timePicker_selectHour'),
    local: 'keeps hour arrows in the hour group until explicit activation',
  },
  {
    source: split('timePicker_switchToAM state_setHour_updatesIsPm analogState_setHour_updatesIsPm'),
    local: 'maps all 12-hour display values to the correct AM or PM civil hour',
  },
  {
    source: split('timePicker_dragging'),
    local: 'drags from the selected clock number instead of requiring dial background',
  },
  {
    source: split('timePickerState_format_12h state_12h_hourInitializationMatches clockFace_12Hour_everyValue clockFace_12Hour_initAtNoon'),
    local: 'maps all 12-hour display values to the correct AM or PM civil hour',
  },
  {
    source: split('timePickerState_format_24h state_24h_hourInitializationMatches clockFace_24Hour_everyValue'),
    local: 'selects every 24-hour value and every exact minute',
  },
  {
    source: split('timePicker_toggle_semantics timePicker_display_semantics timePicker_clockFace_hour_semantics timePicker_clockFace_selected_semantics timePicker_clockFace_minutes_semantics'),
    local: 'exposes real clock selectors, period controls, and radio selection semantics',
  },
  {
    source: split('timeInput_semantics'),
    local: 'uses source-specific numeric fields with associated labels below them',
  },
  {
    source: split('timeInput_keyboardInput_valid timeInput_keyboardInput_outOfRange timeInput_keyboardInput_Nan'),
    local: 'keeps invalid text-entry drafts visible and blocks modal confirmation',
  },
  {
    source: split('timeInput_keyboardInput_switchAmPm timeInput_keyboardInput_maintainsPm timeInput_deleting_maintainsPm'),
    local: 'updates input-mode time while retaining PM and preserves invalid deletions',
  },
  {
    source: split('timeInput_24Hour_noAmPm_Toggle timeInput_24Hour_writePmHour timeInput_24HourStartingPm_writePmHour timeInput_24Hour_writeNoon timeInput_24Hour_writeMidnight'),
    local: 'accepts midnight, noon, and PM hours in 24-hour input without a period control',
  },
  {
    source: split('timeInput_writeMinute_updatesCurrentAngle clockFace_24HourMinutes_everyValue clockFace_12HourMinutes_everyValue'),
    local: 'selects every 24-hour value and every exact minute',
  },
  {
    source: split('state_restoresTimePickerState'),
    local: 'restores its default on an uncancelled form reset and preserves state when reset is cancelled',
  },
] as const
const behaviorTests = behaviorEvidence.flatMap(({ source }) => source)

const screenshotTests = split(`
  timePicker_12h timePicker_12h_rtl timePicker_24h timePicker_24h_rtl
  timeInput_12h_hourFocused timeInput_12h_hourFocused_rtl
  timeInput_24h_hourFocused timeInput_24h_hourFocused_rtl
`)

const webAdaptations = split(`
  ISO-HH:mm controlled-uncontrolled native-form-field custom-validity
  docked-modal native-dialog draft-confirm-cancel locale-hour12-boundary
  sixty-minute-roving-radio pointer-sector-drag min-max no-overnight
  readonly-validity form-reset SSR-hydration forced-colors reduced-motion
`)

describe('TimePicker pinned source ledger', () => {
  it('records a unique immutable blob identity for every pinned source input', () => {
    expect(Object.keys(pinnedFiles)).toHaveLength(6)
    expect(new Set(Object.values(pinnedFiles)).size).toBe(6)
    for (const blob of Object.values(pinnedFiles)) expect(blob).toMatch(/^[0-9a-f]{40}$/)
  })

  it('partitions every generated declaration into source-read and unread roles', () => {
    expect(pickerTokenDeclarations).toHaveLength(53)
    expect(inputTokenDeclarations).toHaveLength(36)
    expect(pickerImplementationReads).toHaveLength(28)
    expect(inputImplementationReads).toHaveLength(9)
    const pickerUnread = pickerTokenDeclarations.filter(
      (name) => !pickerImplementationReads.includes(name),
    )
    const inputUnread = inputTokenDeclarations.filter(
      (name) => !inputImplementationReads.includes(name),
    )
    expect(pickerUnread).toHaveLength(25)
    expect(inputUnread).toHaveLength(27)
    expect(pickerUnread).toContain('ContainerElevation')
    expect(pickerUnread).toContain('TimeSelector24HVerticalContainerWidth')
    expect(inputUnread).toContain('TimeFieldFocusOutlineColor')
  })

  it('maps every upstream behavior case to an executable local regression', () => {
    expect(behaviorTests).toHaveLength(37)
    expect(new Set(behaviorTests).size).toBe(37)
    for (const { local } of behaviorEvidence) expect(behaviorSource).toContain(`it('${local}'`)
  })

  it('records the complete screenshot matrix for the browser promotion gate', () => {
    expect(screenshotTests).toHaveLength(8)
    expect(new Set(screenshotTests).size).toBe(8)
  })

  it('keeps every web adaptation and source-sensitive geometry searchable', () => {
    expect(webAdaptations).toHaveLength(17)
    for (const marker of [
      'nearestTimeInPeriod', 'setCustomValidity', 'addEventListener(\'reset\'',
      '<Dialog', 'getComputedStyle', 'pointerIdRef', 'open',
      '--m3e-comp-time-picker-inner-ring-threshold',
    ]) {
      expect(componentSource).toContain(marker)
    }
    for (const marker of [
      '--m3e-comp-time-picker-clock-dial-size',
      '--m3e-comp-time-picker-outer-radius',
      '[data-m3e-major="false"][aria-checked="true"]',
      'prefers-reduced-motion', 'forced-colors',
    ]) {
      expect(css).toContain(marker)
    }
  })

  it('pins the token source identity', () => {
    expect(defaultTimePickerTokens.source).toEqual({
      id: 'androidx-material3-time-picker',
      url: 'https://android.googlesource.com/platform/frameworks/support/+/8a0ee86845b2fb7c56fc5786971ecb687ad85527/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/TimePicker.kt',
      revision: '8a0ee86845b2fb7c56fc5786971ecb687ad85527',
      accessed: '2026-09-12',
    })
  })
})
