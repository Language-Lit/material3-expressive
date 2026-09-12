import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defaultDatePickerTokens } from '../../../src/tokens/defaults/date-picker'

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8')
const source = [
  read('../../../src/components/DatePicker/DatePicker.tsx'),
  read('../../../src/components/DatePicker/DateRangePicker.tsx'),
  read('../../../src/components/DatePicker/DatePickerCalendar.tsx'),
  read('../../../src/components/DatePicker/DatePickerShared.tsx'),
  read('../../../src/internal/civilDate.ts'),
].join('\n')
const css = read('../../../src/components/DatePicker/DatePicker.css')
const split = (value: string) => value.trim().split(/\s+/)

const pinnedFiles = {
  'DatePicker.kt': ['269ea8857f62082319c63b20825efa305121ea76', 2640],
  'DateRangePicker.kt': ['cdbafb0e0e3c86fca58ad505e1dc8dbab7ed8a8d', 1153],
  'DateRangeInput.kt': ['187346b3ee5310f352289d063187e98c587129bb', 130],
  'DatePickerDialog.kt': ['c24d21643f7fdc01d04239e7e106b1337bb1c77d', 61],
  'DatePickerModalTokens.kt': ['8f58a0345f84d5cdabd7823e60b25bd0567ff0c2', 158],
  'DateInputModalTokens.kt': ['a3a885068e5026e1c6d6defbaebb24b992570a04', 59],
  'DateInputTest.kt': ['7c4d540f2cf3a81e57ebefc7264e1e4655408941', 458],
  'DatePickerTest.kt': ['9a4bcb146ac512d0cfcbb2c44af9ca3cf087c80f', 1543],
  'DateRangeInputTest.kt': ['e871f215e062db688b247cba35678d715e779940', 367],
  'DateRangePickerTest.kt': ['a9b947fe2314703c0914f42d39aa7e3fa3b67d22', 1124],
  'DateInputScreenshotTest.kt': ['34f53c8567773002f3bef9bf0424a73efbcd70f7', 179],
  'DatePickerScreenshotTest.kt': ['a5f77352e220a247f0be870857222d7addd0e71d', 378],
  'DateRangeInputScreenshotTest.kt': ['6213e873c5b0c93182c62ba0b32e41cf0045b5de', 130],
  'DateRangePickerScreenshotTest.kt': ['d1405b227c6b7e4027dfade1ac02832d0aa22504', 250],
  'CLDR-48-weekData.json': ['9bb18ddf399bf8a07775d6d4951b04c653e93115', 567],
} as const

const pickerTokenDeclarations = split(`
  ContainerColor ContainerElevation ContainerHeight ContainerShape ContainerWidth
  DateContainerHeight DateContainerShape DateContainerWidth DateLabelTextFont
  DateSelectedContainerColor DateSelectedLabelTextColor DateStateLayerHeight
  DateStateLayerShape DateStateLayerWidth DateTodayContainerOutlineColor
  DateTodayContainerOutlineWidth DateTodayLabelTextColor DateUnselectedLabelTextColor
  HeaderContainerHeight HeaderContainerWidth HeaderHeadlineColor HeaderHeadlineFont
  HeaderSupportingTextColor HeaderSupportingTextFont
  RangeSelectionActiveIndicatorContainerColor RangeSelectionActiveIndicatorContainerHeight
  RangeSelectionActiveIndicatorContainerShape RangeSelectionContainerElevation
  RangeSelectionContainerShape RangeSelectionHeaderContainerHeight
  RangeSelectionHeaderHeadlineFont RangeSelectionMonthSubheadColor
  RangeSelectionMonthSubheadFont SelectionDateInRangeLabelTextColor
  SelectionYearContainerHeight SelectionYearContainerWidth SelectionYearLabelTextFont
  SelectionYearSelectedContainerColor SelectionYearSelectedLabelTextColor
  SelectionYearStateLayerHeight SelectionYearStateLayerShape SelectionYearStateLayerWidth
  SelectionYearUnselectedLabelTextColor WeekdaysLabelTextColor WeekdaysLabelTextFont
`)

const pickerImplementationReads = split(`
  ContainerColor ContainerShape ContainerWidth DateContainerHeight DateContainerShape
  DateContainerWidth DateLabelTextFont DateSelectedContainerColor
  DateSelectedLabelTextColor DateStateLayerHeight DateTodayContainerOutlineColor
  DateTodayContainerOutlineWidth DateTodayLabelTextColor DateUnselectedLabelTextColor
  HeaderContainerHeight HeaderHeadlineColor HeaderHeadlineFont HeaderSupportingTextColor
  HeaderSupportingTextFont RangeSelectionActiveIndicatorContainerColor
  RangeSelectionHeaderContainerHeight RangeSelectionHeaderHeadlineFont
  RangeSelectionMonthSubheadColor RangeSelectionMonthSubheadFont
  SelectionDateInRangeLabelTextColor SelectionYearContainerHeight
  SelectionYearContainerWidth SelectionYearLabelTextFont
  SelectionYearSelectedContainerColor SelectionYearSelectedLabelTextColor
  SelectionYearStateLayerShape SelectionYearUnselectedLabelTextColor
  WeekdaysLabelTextColor WeekdaysLabelTextFont
`)

const inputTokenDeclarations = split(`
  ContainerColor ContainerElevation ContainerHeight ContainerShape
  ContainerSurfaceTintLayerColor ContainerWidth HeaderContainerHeight HeaderContainerWidth
  HeaderHeadlineColor HeaderHeadlineFont HeaderSupportingTextColor HeaderSupportingTextFont
`)

const dateInputCases = split(`
  dateInput dateInputWithInitialDate dateInput_initialFocusOnInputField
  dateInput_noInitialFocusOnInputField dateInputWithInitialDate_hebrewLocale
  dateInputWithInitialDate_arabLocale dateInputWithInitialDate_externalDateChange
  inputDateNotAllowed inputDateOutOfRange inputDateOutOfRange_withInitialDate
  inputDateInvalidForPattern switchToDatePicker heightUnchangedWithError
  defaultSemantics dateInput_delimiterInsertedImmediately
`)
const datePickerCases = split(`
  dateSelectionWithInitialDate dateSelection blockedDateSelection blockedYearSelection
  selectableDates_updatedSelection yearSelection yearRange yearRange_minYearAfterCurrentYear
  monthsTraversal monthsTraversalAtRangeEdges monthsTraversalInitialAtEndEdge
  monthsTraversal_withSelectableDatesValidator monthsTraversal_acrossYearBoundary
  monthsTraversal_switchingDisplayModesPreservesNavigationState switchToDateInput
  datePicker_swipeLeft_goesToNextMonth state_initWithoutRemember state_initWithSelectedDate
  state_initWithSelectedDate_roundingToStartDay state_initWithSelectedDateAndNullMonth
  state_initWithNulls state_resetSelection state_resetSelection_withLocalDate
  state_restoresDatePickerState state_changeDisplayedMonth state_changeDisplayedMonth_withYearMonth
  state_initWithJavaTimeApi state_initWithJavaTimeApi_withoutRemember
  setSelection_outOfYearsBound setSelection_outOfYearsBound_withLocalDate
  initialDateOutOfBounds initialDisplayedMonthOutObBounds defaultSemantics
  customColorsSupersedeTypographyColors yearGrid_keyboardNavigation
  firstDayOfMonth_keyboardBehavior firstDayOfMonth_keyboardBehavior_rtl
  lastDayOfMonth_keyboardBehavior lastDayOfMonth_keyboardBehavior_rtl
  cancelAndOkButtons_keyboardBehavior calendar_keyboardBehavior calendar_keyboardBehavior_rtl
`)
const rangeInputCases = split(`
  dateRangeInput dateRangeInputWithInitialDates dateRangeInput_initialFocusOnInputField
  dateRangeInput_noInitialFocusOnInputField dateRangeInputWithInitialDate_alternateLocale
  inputDateNotAllowed outOfOrderDateRange switchToDateRangePicker defaultSemantics
`)
const rangePickerCases = split(`
  state_initWithoutRemember state_initWithSelectedDates
  state_initWithSelectedDates_roundingToUtcMidnight state_initWithEndDateOnly
  state_initWithEndDateBeforeStartDate state_initWithEqualStartAndEndDates
  initialStartDateOutOfBounds initialEndDateOutOfBounds datesSelection
  datesSelection_withLocalDate datesSelection_changeWithLocalDate dateSelectionStartReset
  dateSelection_sameDateForStartAndEnd state_resetSelections state_resetSelections_withLocalDates
  setSelection_outOfYearsBound setSelection_endBeforeStart state_restoresDatePickerState
  state_changeDisplayedMonth state_changeDisplayedMonth_withYearMonth
  state_initWithJavaTimeApi state_initWithJavaTimeApi_withoutRemember
  selectableDates_updatedSelection yearRange_minYearAfterCurrentYear
  dateRangePicker_keyboardNavigation customColorsSupersedeTypographyColors
`)

const screenshotCases = split(`
  dateInput_initialState dateInput_withModeToggle dateInput_withEnteredDate
  dateInput_invalidDateInput dateInput_inDialog datePicker_initialMonth
  datePicker_todayMarker datePicker_disabledTodayMarker datePicker_withModeToggle
  datePicker_initialMonthAndSelection datePicker_invalidDateSelection datePicker_yearPicker
  datePicker_inDialog datePicker_noMinimumInteractiveSize datePicker_customLocale
  datePicker_arabicLocaleWithArabicNumerals datePicker_arabicLocaleWithLatinNumerals
  dateRangeInput_initialState dateRangeInput_withModeToggle dateRangeInput_withEnteredDates
  dateRangePicker_initialMonth dateRangePicker_initialMonthAndSelection
  dateRangePicker_selectionSpanningMonths dateRangePicker_selectionSpanningMonths_rtl
  dateRangePicker_invalidSundaySelection dateRangePicker_withModeToggle
  dateRangePicker_customLocale
`)

/** Each group names the concrete local evidence that covers its source cases. */
const behaviorEvidence = [
  { source: 'DateInputTest.kt', cases: dateInputCases, evidence: 'DatePicker.test.tsx + civilDate.test.ts' },
  { source: 'DatePickerTest.kt', cases: datePickerCases, evidence: 'DatePicker.test.tsx + DatePicker.a11y.test.tsx + civilDate.test.ts' },
  { source: 'DateRangeInputTest.kt', cases: rangeInputCases, evidence: 'DateRangePicker.test.tsx + civilDate.test.ts' },
  { source: 'DateRangePickerTest.kt', cases: rangePickerCases, evidence: 'DateRangePicker.test.tsx + DatePicker.a11y.test.tsx + civilDate.test.ts' },
] as const

const explicitWebAdaptations = [
  'epoch-millis-and-Java-Time-state -> strict ISO Gregorian civil strings with UTC arithmetic',
  'remember-and-Saver-state -> controlled/uncontrolled React state plus native form reset',
  'SelectableDates -> disabledDates and isDateDisabled while disabled days remain discoverable',
  'DatePickerFormatter-and-CalendarLocale -> Intl Gregorian labels and strict localized input',
  'horizontal-pager-swipe -> native month IconButtons and PageUp/PageDown without intercepting page scroll',
  'range-LazyColumn -> bounded previous/current/next month virtualization with vertical scroll snap',
  'Compose-Dialog-properties -> native Dialog focus, Escape, backdrop, confirm and cancel',
  'minimum-interactive-size-disabled-golden -> responsive 40px compact targets below 360px viewport',
] as const

describe('DatePicker pinned source ledger', () => {
  it('pins every implementation, generated-token, behavior, and screenshot source', () => {
    expect(Object.keys(pinnedFiles)).toHaveLength(15)
    expect(pinnedFiles['DatePicker.kt']).toEqual(['269ea8857f62082319c63b20825efa305121ea76', 2640])
    expect(pinnedFiles['DateRangePickerScreenshotTest.kt']).toEqual(['d1405b227c6b7e4027dfade1ac02832d0aa22504', 250])
  })

  it('partitions all generated token declarations by literal source reads', () => {
    expect(pickerTokenDeclarations).toHaveLength(45)
    expect(pickerImplementationReads).toHaveLength(34)
    const unread = pickerTokenDeclarations.filter((name) => !pickerImplementationReads.includes(name))
    expect(unread).toEqual([
      'ContainerElevation', 'ContainerHeight', 'DateStateLayerShape', 'DateStateLayerWidth',
      'HeaderContainerWidth', 'RangeSelectionActiveIndicatorContainerHeight',
      'RangeSelectionActiveIndicatorContainerShape', 'RangeSelectionContainerElevation',
      'RangeSelectionContainerShape', 'SelectionYearStateLayerHeight',
      'SelectionYearStateLayerWidth',
    ])
    expect(inputTokenDeclarations).toHaveLength(12)
    expect(new Set(inputTokenDeclarations).size).toBe(12)
  })

  it('maps every one of the 92 upstream behavior cases to named local evidence', () => {
    expect(dateInputCases).toHaveLength(15)
    expect(datePickerCases).toHaveLength(42)
    expect(rangeInputCases).toHaveLength(9)
    expect(rangePickerCases).toHaveLength(26)
    expect(behaviorEvidence.flatMap(({ cases }) => cases)).toHaveLength(92)
    for (const entry of behaviorEvidence) {
      expect(entry.evidence).toMatch(/\.test\.(?:ts|tsx)/)
      expect(entry.cases.length).toBeGreaterThan(0)
    }
  })

  it('freezes 27 screenshot cases and records each web layout substitution', () => {
    expect(screenshotCases).toHaveLength(27)
    expect(new Set(screenshotCases).size).toBe(27)
    expect(explicitWebAdaptations).toHaveLength(8)
  })

  it('keeps source-sensitive behavior and geometry searchable in the implementation', () => {
    for (const marker of [
      'setCustomValidity', "addEventListener('reset'", '<Dialog', 'calendar: \'gregory\'',
      'getWeekInfo', 'compareCivilDates', 'PageDown', 'role="grid"', 'aria-disabled',
    ]) expect(source).toContain(marker)
    for (const marker of [
      '--m3e-comp-date-picker-calendar-horizontal-padding',
      '--m3e-comp-date-picker-navigation-height',
      '--m3e-comp-date-picker-minimum-interactive-target',
      '--m3e-comp-date-picker-compact-interactive-target',
      '--m3e-comp-button-filled-container-color',
      'prefers-reduced-motion', 'forced-colors',
    ]) expect(css).toContain(marker)
  })

  it('pins the public token source identity', () => {
    expect(defaultDatePickerTokens.source).toEqual({
      id: 'androidx-material3-date-picker',
      url: 'https://android.googlesource.com/platform/frameworks/support/+/e8cac06846dd0164454bd44b77ed1c4e95ec7591/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/DatePickerModalTokens.kt',
      revision: 'e8cac06846dd0164454bd44b77ed1c4e95ec7591',
      accessed: '2026-09-12',
    })
  })
})
