import { useState } from 'react'
import {
  Surface,
  Text,
  TimePicker,
} from '@language-lit/material3-expressive'

export function TimePickerExample() {
  const [time, setTime] = useState('14:32')

  return (
    <Surface
      as="section"
      aria-labelledby="time-picker-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="time-picker-example"
    >
      <Text
        as="h2"
        id="time-picker-example-title"
        variant="titleLarge"
        emphasis="emphasized"
      >
        Time picker
      </Text>
      <Text as="p" variant="bodyMedium">
        Choose a civil time with the clock dial or exact keyboard input.
      </Text>
      <TimePicker
        label="Appointment time"
        supportingText="Available from 08:30 to 17:45"
        value={time}
        onValueChange={setTime}
        min="08:30"
        max="17:45"
        presentation="modal"
        name="appointmentTime"
        required
      />
      <TimePicker
        label="Landscape 24-hour time"
        defaultValue="21:05"
        hour12={false}
        layout="horizontal"
        presentation="modal"
      />
      <output>
        <Text as="span" variant="bodyMedium">
          {time || 'No time selected'}
        </Text>
      </output>
    </Surface>
  )
}
