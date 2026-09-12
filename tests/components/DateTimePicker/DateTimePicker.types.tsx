import { createRef } from 'react'
import { DateTimePicker } from '../../../src/components/DateTimePicker'
import type {
  DateTimePickerProps,
  DateTimePickerValue,
} from '../../../src/components/DateTimePicker'

const ref = createRef<HTMLInputElement>()
const value: DateTimePickerValue = '2026-06-20T09:30'
const props: DateTimePickerProps = { label: 'Appointment', defaultValue: value }
void props

;<DateTimePicker label="Appointment" />
;<DateTimePicker label="Appointment" ref={ref} defaultValue={value} />
;<DateTimePicker label="Appointment" value={value} onValueChange={(next) => void next} />
;<DateTimePicker label="Appointment" dateMode="input" onDateModeChange={() => {}} />
;<DateTimePicker label="Appointment" timeMode="dial" onTimeModeChange={() => {}} />
;<DateTimePicker label="Appointment" name="startsAt" form="booking" required />

// @ts-expect-error label is required
;<DateTimePicker />

// @ts-expect-error controlled values require a change callback
;<DateTimePicker label="Appointment" value={value} />

// @ts-expect-error controlled date mode requires a change callback
;<DateTimePicker label="Appointment" dateMode="input" />

// @ts-expect-error controlled time mode requires a change callback
;<DateTimePicker label="Appointment" timeMode="dial" />

// @ts-expect-error civil values are strings
;<DateTimePicker label="Appointment" defaultValue={new Date()} />
