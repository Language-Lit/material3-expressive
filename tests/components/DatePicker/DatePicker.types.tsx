import { createRef } from 'react'
import {
  DatePicker,
  DateRangePicker,
  type DatePickerMode,
  type DatePickerPresentation,
  type DateRangeValue,
} from '../../../src/components/DatePicker'

const ref = createRef<HTMLInputElement>()
const range: DateRangeValue = { start: '2026-09-12', end: '2026-09-15' }
const mode: DatePickerMode = 'calendar'
const presentation: DatePickerPresentation = 'modal'

;<DatePicker ref={ref} label="Date" defaultValue="2026-09-12" name="date" />
;<DatePicker
  label="Date"
  value="2026-09-12"
  onValueChange={() => undefined}
  mode={mode}
  onModeChange={() => undefined}
  presentation={presentation}
  open
  onOpenChange={() => undefined}
  min="2026-09-01"
  max="2026-09-30"
  form="booking"
  customValidity="Complete the time."
  aria-description="Choose a local civil date"
/>
;<DateRangePicker
  label="Trip"
  value={range}
  onValueChange={() => undefined}
  startName="start"
  endName="end"
/>

// @ts-expect-error a controlled value requires its callback
;<DatePicker label="Date" value="2026-09-12" />

// @ts-expect-error controlled and uncontrolled date state cannot be combined
;<DatePicker label="Date" value="2026-09-12" defaultValue="2026-09-13" onValueChange={() => undefined} />

// @ts-expect-error a controlled mode requires its callback
;<DatePicker label="Date" mode="input" />

// @ts-expect-error a controlled open state requires its callback
;<DateRangePicker label="Trip" open />

// @ts-expect-error a range has separate form names
;<DateRangePicker label="Trip" name="range" />

// @ts-expect-error the visible field type is owned by the picker
;<DatePicker label="Date" type="date" />
