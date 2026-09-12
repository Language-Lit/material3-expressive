# TimePicker

`TimePicker` selects a local civil time. Its public value is always an ASCII
`HH:mm` string such as `09:05` or `23:40`; it has no date, offset, or time
zone.

```tsx
import { TimePicker } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<TimePicker
  label="Appointment time"
  defaultValue="14:30"
  min="08:00"
  max="17:45"
  name="appointmentTime"
  required
/>
```

## Value and bounds

Use `value` with `onValueChange` for controlled state, or `defaultValue` and an
optional callback for uncontrolled state. Empty selection is the empty string.
The visible field accepts strict 24-hour `HH:mm` text and autoformats four
digits such as `1432` to `14:32`. Clearing it emits `''`.

`min` and `max` are inclusive `HH:mm` bounds. A picker with `min` later than
`max` is invalid; it does not infer an overnight interval. The dial disables
unavailable choices and starts an empty bounded panel at the first allowed
time. Changing AM or PM near a boundary moves to the closest selectable time
in that period.

`locale` controls displayed numerals and day-period labels. The main field and
Hour/Minute inputs accept that locale's digits and convert them to ASCII at the
value boundary. `hour12` overrides the locale's hour-cycle preference. Neither
prop changes the stored value: a localized 2:32 PM selection remains `14:32`.

## Modes and presentation

`mode="dial"` provides a clock face. `mode="input"` provides separate Hour and
Minute fields with a vertical period selector beside them in 12-hour mode. Use
`defaultMode` for uncontrolled mode or pair `mode` with `onModeChange` for
controlled mode.

The default `presentation="docked"` keeps the panel inline. The `modal`
presentation renders the visible form field and an open button, then composes
the library's native `Dialog`. Modal edits remain a draft until the Confirm
action. Cancel, Escape, and outside dismissal restore the committed value.
Invalid Hour or Minute drafts remain visible and disable confirmation.

`open`, `defaultOpen`, and `onOpenChange` apply to the modal presentation.
`confirmLabel` and `cancelLabel` localize its actions. `fieldVariant` changes
the visible field between `filled` and `outlined`.

`layout="vertical"` is the portrait-style default. `layout="horizontal"`
places the clock display and horizontal AM/PM selector beside the dial, matching
the pinned source's landscape layout. The layout prop applies to dial mode;
source `TimeInput` has one row layout. Horizontal dial layout requires a wide
container; choose the vertical layout at narrow application breakpoints.

## Forms and accessibility

The visible `TextField` owns the forwarded ref, native form association, and
validity. It receives `form`, `required`, `disabled`, `onBlur`, and the remaining
native input attributes. A hidden input receives `name` and submits only a
complete canonical value; partial or invalid visible text submits `''` and emits
`onValueChange('')` without erasing the draft. Format and bounds failures use
native custom validity, so an invalid controlled value cannot submit silently.
`customValidity` merges consumer or composed-picker validity after TimePicker's
own error; the picker's own format or bounds error has priority.

`readOnly` keeps form validation active while preventing text and picker
mutation. Navigation, selection, and modifier shortcuts such as Copy continue
to work. An uncancelled form reset restores `defaultValue`; a cancelled reset
does not change state.

The clock exposes one radio group at a time. Arrow keys move among enabled
hours or all 60 exact minute values; Home and End move to the first or last
enabled choice. Activating an hour advances to minutes and moves focus there.
In right-to-left text, horizontal arrows follow the control's computed
direction. Pointer selection uses the rendered dial geometry and the resolved
inner-ring threshold token.

## Source and tokens

The implementation is pinned to AndroidX Material 3 revision
`8a0ee86845b2fb7c56fc5786971ecb687ad85527`, accessed 2026-09-12. It covers
`TimePicker.kt`, generated `TimePickerTokens.kt` and `TimeInputTokens.kt`, and
their behavior and screenshot suites. The component registration is
`time-picker`; all picker geometry, color, shape, typography, state, motion,
and focus styling resolve through its registered tokens.

The 24-hour dial preserves the pinned source's ring mapping: `00`–`11` occupy
the outer ring and `12`–`23` the inner ring. Minute pointer hit testing belongs
to the clock sector. All 60 minute buttons remain in the accessibility model,
while only five-minute labels paint at rest; selecting an exact off-five minute
makes its full 48px selector and focus treatment visible.
