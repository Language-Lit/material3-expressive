# DateTimePicker

`DateTimePicker` composes the public date and time pickers into one civil value.
It keeps the calendar date and wall-clock time together as
`YYYY-MM-DDTHH:mm`; it never constructs a JavaScript `Date` and never applies a
time-zone offset.

```tsx
import { DateTimePicker } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<DateTimePicker
  label="Appointment"
  dateLabel="Appointment date"
  timeLabel="Appointment time"
  defaultValue="2026-09-18T09:30"
  min="2026-09-18T08:00"
  max="2026-09-22T17:00"
  name="startsAt"
  required
/>
```

## Value and bounds

Use `value` with `onValueChange` for controlled state, or `defaultValue` and an
optional callback for uncontrolled state. Values and bounds use the exact civil
form `YYYY-MM-DDTHH:mm`. An empty string means that no complete value is
selected.

The component preserves incomplete field text while a person edits. It emits an
empty string and clears its submitted value until both parts are complete; it
does not invent a missing date or time. A parent rerender with the same
controlled value preserves that draft, while a distinct external value replaces
it.

`min` and `max` compare the complete civil strings. Their time portions constrain
the time field only when the selected date is the corresponding boundary date.
Changing the date therefore revalidates a retained time without applying the
boundary hour to unrelated dates.

## Modes and presentation

`dateMode` and `timeMode` independently control the child picker modes. Their
uncontrolled forms are `defaultDateMode` and `defaultTimeMode`. The date side
supports `calendar` and `input`; the time side supports `dial` and `input`.

`presentation="modal"` is the compact default and uses each child's native
dialog lifecycle and Confirm/Cancel actions. `presentation="docked"` keeps
picker content in the page. `locale`
changes date text, localized digits, and 12/24-hour presentation only. `hour12`
can override the locale's hour-cycle choice. The stored value remains ASCII ISO
civil text in every locale.

## Forms and accessibility

The root renders a named `group` containing separately labeled date and time
inputs. Both child controls receive `required`, `disabled`, `readOnly`, `form`,
and aggregate validity. Browser `checkValidity()` fails for a required empty
value, an incomplete pair, an invalid part, or a complete value outside the
bounds.

When `name` is present, one hidden input submits the complete combined value.
It is empty while either field is empty or partial, so a stale complete value is
never submitted. `form` associates the validity controls and hidden input with
an external form. An uncancelled form reset restores `defaultValue`; a cancelled
reset preserves the current draft.

The forwarded ref targets the visible date trigger. `className`, `style`, and
other native root attributes describe the group container. `onBlur` is passed to
both visible fields.

## Tokens and source boundary

The composition adds only layout around public `DatePicker` and `TimePicker`
instances. Its gap consumes the date-picker `input-spacing` token; every field,
panel, state, color, shape, elevation, and motion value remains owned by the
child picker token registrations.

The component contains no time-zone or calendar conversion layer. AndroidX's
date and time picker APIs provide separate calendar and wall-clock state, so the
web composition serializes those two public child values directly. ADR 0044
records this civil-value boundary, the partial-draft contract, the native form
adaptation, and the locale-only presentation rule.
