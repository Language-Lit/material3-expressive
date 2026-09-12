# DatePicker

`DatePicker` selects one Gregorian civil date. `DateRangePicker` selects an
ordered pair. Values use strict ISO `YYYY-MM-DD` strings without a time zone.

```tsx
import {
  DatePicker,
  DateRangePicker,
} from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<DatePicker
  label="Appointment date"
  name="appointment-date"
  defaultValue="2026-09-18"
  min="2026-09-12"
  max="2026-10-12"
  disabledDates={['2026-09-20']}
/>

<DateRangePicker
  label="Travel dates"
  presentation="modal"
  defaultValue={{ start: '2026-09-18', end: '2026-09-22' }}
  startName="travel-start"
  endName="travel-end"
/>
```

## Values and constraints

Use `value` with `onValueChange` for controlled state, or `defaultValue` for
uncontrolled state. An empty string means no selection. Range values contain
`start` and `end`; an optional range may be completely empty, but a range with
only one endpoint is an invalid editing state and cannot be confirmed or
submitted.

`min` and `max` are inclusive and default to the source's 1900-01-01 through
2100-12-31 interval. Invalid bounds and `min > max` make the form control
invalid; they are not silently reordered. `disabledDates` handles a stable ISO
list and `isDateDisabled` handles application rules. Disabled dates remain in
the grid's arrow-key order so people can discover that they are unavailable,
but pointer, keyboard, and input-mode commits reject them.

Date calculations use UTC only as a Gregorian integer-calendar engine. They do
not convert through the user's time zone, so moving by a day is stable through
DST changes and years 0001–0099 retain their actual year. `locale` changes
labels, digits, input order, and the first weekday while the represented
calendar remains explicitly Gregorian. The default locale is deterministic
`en-US`. Set `today` to an ISO date when a server render must pin the initial
empty month and today marker; otherwise the server uses the UTC day and the
client corrects it to the local civil day after hydration.

## Presentation and input mode

`presentation="docked"` is the default. Activating the labelled field opens a
360px anchored popup. `presentation="modal"` uses the library's native
`Dialog`; edits remain a draft until the user presses OK, and Cancel discards
them. `open`/`onOpenChange` and `defaultOpen` control the popup or dialog.

`mode="calendar"` is the default. The header action switches between calendar
and localized text entry; control it with `mode`/`onModeChange` or initialize it
with `defaultMode`. Partial or invalid text in a docked picker clears the
canonical public value to `''` while retaining the draft for correction. Modal
text remains isolated until confirmation. `customValidity` participates in
form validity but does not block confirmation of a locally valid modal draft,
which lets a composed field resolve an aggregate error.

## Keyboard and accessibility

The trigger is a labelled native text input. Its ref, `id`, ARIA props, and
native focus/key/click handlers belong to that input; `className` and `style`
belong to the picker root. Consumer event handlers run first and may cancel the
picker's activation with `preventDefault()`.

The calendar uses a row-nested ARIA grid with one roving day tab stop. Range
calendar mode presents a vertical, three-month virtual window that recenters as
the user scrolls, preserving source-style continuous month browsing without a
large DOM. Arrow
keys move by a day or week, Home/End move within the localized week, Page
Up/Down move by a month, and Shift+Page Up/Down move by a year. Left and Right
follow RTL direction. The year grid has one roving tab stop and three-column
arrow movement. Enter and Space use the focused native button's activation.
Every date has a full localized accessible name; unavailable dates use
`aria-disabled` while remaining focusable for discovery.

Opening moves focus into the calendar or editable input. Selection and modal
actions restore focus to the trigger. Escape follows `Dialog` or anchored
overlay behavior, and an outside pointer retains its clicked focus target.
Disabling an open picker closes it and blocks selection.

## Forms, reset, and rendering

One real `input type="date"` stores the single ISO value; a range owns one for
each endpoint. `name`, or `startName`/`endName`, and `form` support ordinary and
externally associated forms. Required, format, bounds, range order, unavailable
dates, and `customValidity` all participate in native constraint validation.
An invalid submission focuses the visible field. Form reset restores
uncontrolled defaults after the reset event and respects `preventDefault()`.

Markup is deterministic for server rendering. The docked popup mounts in a
theme-preserving portal only after hydration; the modal composes the shipped
`Dialog`, `TextField`, `Button`, and `IconButton`. At viewports narrower than
360px the seven columns use non-overlapping 40px controls around the source's
40px painted date surface; wider layouts preserve the source's 48px minimum
interactive targets.

## Tokens and source boundary

Every visual value resolves through `--m3e-comp-date-picker-*` tokens. The
calendar keeps the AndroidX 360px container, 12px horizontal inset, 56px
month/year row, 48px normal target, and 40px date surface. Year choices and the
modal set only public Button and Dialog component-token aliases.

The family is pinned to AndroidX Material 3 revision
`e8cac06846dd0164454bd44b77ed1c4e95ec7591`, accessed 2026-09-12. The executable
source ledger records all 92 upstream behavior tests, 27 screenshot tests, 45
generated picker roles, 12 generated input roles, and the web dispositions for
state, dialog, paging, compact layout, and Gregorian localization.
