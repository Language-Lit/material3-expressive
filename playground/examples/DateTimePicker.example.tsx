import { useState } from 'react'
import {
  DateTimePicker,
  Surface,
  Text,
} from '@language-lit/material3-expressive'

export function DateTimePickerExample() {
  const [appointment, setAppointment] = useState('2026-09-18T09:30')

  return (
    <Surface
      as="section"
      aria-labelledby="date-time-picker-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="date-time-picker-example"
    >
      <Text
        as="h2"
        id="date-time-picker-example-title"
        variant="titleLarge"
        emphasis="emphasized"
      >
        Date and time picker
      </Text>
      <Text as="p" variant="bodyMedium">
        A civil date and wall-clock time with boundary-aware validation.
      </Text>
      <DateTimePicker
        label="Appointment"
        dateLabel="Appointment date"
        timeLabel="Appointment time"
        value={appointment}
        onValueChange={setAppointment}
        min="2026-09-18T08:00"
        max="2026-09-22T17:00"
        defaultDateMode="input"
        defaultTimeMode="input"
        name="startsAt"
        required
      />
      <output>
        <Text as="span" variant="bodyMedium">
          {appointment || 'Incomplete value'}
        </Text>
      </output>
    </Surface>
  )
}
