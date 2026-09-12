import { useState } from 'react'
import {
  DatePicker,
  DateRangePicker,
  Surface,
  Text,
  type DateRangeValue,
} from '@language-lit/material3-expressive'

export function DatePickerExample() {
  const [date, setDate] = useState('2026-09-18')
  const [range, setRange] = useState<DateRangeValue>({
    start: '2026-09-18',
    end: '2026-09-22',
  })

  return (
    <Surface
      as="section"
      aria-labelledby="date-picker-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="date-picker-example"
    >
      <Text as="h2" id="date-picker-example-title" variant="titleLarge" emphasis="emphasized">
        Date pickers
      </Text>
      <Text as="p" variant="bodyMedium">
        Anchored single-date selection and a modal range with strict civil dates.
      </Text>
      <DatePicker
        label="Appointment date"
        value={date}
        onValueChange={setDate}
        min="2026-09-12"
        max="2026-10-12"
        disabledDates={['2026-09-20']}
        supportingText="September 20 is unavailable"
        today="2026-09-12"
      />
      <DateRangePicker
        label="Travel dates"
        presentation="modal"
        fieldVariant="outlined"
        value={range}
        onValueChange={setRange}
        min="2026-09-12"
        max="2026-12-31"
        startName="travel-start"
        endName="travel-end"
        today="2026-09-12"
      />
    </Surface>
  )
}
