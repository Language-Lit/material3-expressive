import { createRef } from 'react'
import {
  TimePicker,
  type TimePickerLayout,
  type TimePickerMode,
  type TimePickerPresentation,
  type TimePickerValue,
} from '../../../src/components/TimePicker'

const fieldRef = createRef<HTMLInputElement>()
const value: TimePickerValue = '13:45'
const mode: TimePickerMode = 'dial'
const presentation: TimePickerPresentation = 'modal'
const layout: TimePickerLayout = 'horizontal'

;<TimePicker ref={fieldRef} label="Time" defaultValue={value} />
;<TimePicker label="Time" value={value} onValueChange={() => undefined} />
;<TimePicker
  label="Time"
  mode={mode}
  onModeChange={() => undefined}
  presentation={presentation}
  layout={layout}
  open
  onOpenChange={() => undefined}
  fieldVariant="outlined"
  min="09:00"
  max="17:00"
  locale={['ja-JP', 'en']}
  hour12={false}
  name="time"
  form="booking"
  customValidity="Complete the date first."
/>

// @ts-expect-error a controlled value requires its callback
;<TimePicker label="Time" value="13:45" />

// @ts-expect-error controlled and uncontrolled value state cannot be combined
;<TimePicker label="Time" value="13:45" defaultValue="12:00" onValueChange={() => undefined} />

// @ts-expect-error a controlled mode requires its callback
;<TimePicker label="Time" mode="input" />

// @ts-expect-error a controlled open state requires its callback
;<TimePicker label="Time" presentation="modal" open />

// @ts-expect-error closed mode vocabulary
;<TimePicker label="Time" defaultMode="clock" />

// @ts-expect-error closed presentation vocabulary
;<TimePicker label="Time" presentation="popover" />

// @ts-expect-error closed layout vocabulary
;<TimePicker label="Time" layout="landscape" />

// @ts-expect-error native input type is owned by the picker
;<TimePicker label="Time" type="date" />
