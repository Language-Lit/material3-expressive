# DatePicker family conformance

Status: experimental
Task: T66

## Pinned sources

The family is pinned to AndroidX Material 3 revision
`e8cac06846dd0164454bd44b77ed1c4e95ec7591`, accessed 2026-09-12.

- `DatePicker.kt`: 2,640 lines, blob `269ea8857f62082319c63b20825efa305121ea76`.
- `DateRangePicker.kt`: 1,153 lines, blob `cdbafb0e0e3c86fca58ad505e1dc8dbab7ed8a8d`.
- `DateRangeInput.kt`: 130 lines, blob `187346b3ee5310f352289d063187e98c587129bb`.
- `DatePickerDialog.kt`: 61 lines, blob `c24d21643f7fdc01d04239e7e106b1337bb1c77d`.
- `DatePickerModalTokens.kt`: 158 lines, 45 declarations, blob `8f58a0345f84d5cdabd7823e60b25bd0567ff0c2`.
- `DateInputModalTokens.kt`: 59 lines, 12 declarations, blob `a3a885068e5026e1c6d6defbaebb24b992570a04`.
- Four behavior files: 3,492 lines and 92 tests, individually pinned in `DatePicker.source.test.ts`.
- Four screenshot files: 937 lines and 27 tests, individually pinned in that ledger.
- Unicode CLDR 48 `weekData.json`: 567 lines, revision
  `4d06be52b51bb2f75688d0abe55c52a66afed790`, blob
  `9bb18ddf399bf8a07775d6d4951b04c653e93115`.

The executable ledger freezes every file identity and test name. It groups each
of the 92 behavior cases under concrete component, accessibility, SSR, or civil
date tests. Aggregate verification and the browser gate pass; the record stays
experimental until the owner completes the separate promotion review. It does
not claim Android bitmap parity.

## Public source-surface disposition

| AndroidX source surface | Web disposition |
| --- | --- |
| `DatePicker` | `DatePicker` with controlled/uncontrolled ISO state |
| `DateRangePicker` | `DateRangePicker` with an ordered `{ start, end }` value |
| `DatePickerState` / `DateRangePickerState` | React state props, displayed-month state, and native form reset |
| `rememberDatePickerState` / `rememberDateRangePickerState` | Uncontrolled defaults; no Compose Saver object is exposed |
| `SelectableDates` | `disabledDates`, `isDateDisabled`, `min`, and `max` |
| `DatePickerFormatter` | Explicit Gregorian `Intl` formatting and strict localized parsing |
| `DisplayMode` | `calendar` / `input` mode props |
| `DatePickerDefaults` / `DateRangePickerDefaults` | Stable composition and registered component tokens |
| `DatePickerColors` | provider-scoped component tokens |
| `DatePickerDialog` | shipped native `Dialog` with draft Confirm/Cancel |
| Internal `DateRangeInput` | range input mode with two labelled `TextField` controls |

Compose `Modifier`, coroutine, Saver, snapshot, lazy-list, and semantics-node
objects are framework machinery and are not React APIs. Their observable
selection, reset, focus, keyboard, bounds, and label effects have web evidence.

## Generated token ledger

`DatePickerModalTokens.kt` declares 45 roles. `DatePicker.kt` and
`DateRangePicker.kt` literally read 34. The 11 unread generated roles are
`ContainerElevation`, `ContainerHeight`, `DateStateLayerShape`,
`DateStateLayerWidth`, `HeaderContainerWidth`,
`RangeSelectionActiveIndicatorContainerHeight`,
`RangeSelectionActiveIndicatorContainerShape`,
`RangeSelectionContainerElevation`, `RangeSelectionContainerShape`,
`SelectionYearStateLayerHeight`, and `SelectionYearStateLayerWidth`.

The current implementation does not literally read the 12
`DateInputModalTokens` declarations. Input mode composes the shipped
`TextField`, whose own token registration supplies its visual states. The
picker registration maps the 34 source-read roles plus explicit web values for
portal elevation, viewport margins, form-control clipping, keyboard focus,
and responsive compact targets. Its CSS test proves that every registered role
is consumed and every picker variable is registered.

## Values, state, and validity

- Public values are strict proleptic-Gregorian `YYYY-MM-DD` civil strings.
  Arithmetic uses UTC fields only and explicitly avoids the JavaScript
  year-0–99 constructor remapping and local DST transitions.
- `min` and `max` are inclusive. Defaults preserve the source's 1900–2100
  year interval. Invalid bounds do not swap or normalize; they invalidate the
  form and reject commits.
- Controlled invalid values render without throwing, serialize as empty, and
  own a custom validity message so stale data is never silently submitted.
- Unavailable days remain visible and focusable with `aria-disabled`; pointer,
  native button activation, and input commits all reject them.
- A range may be empty when optional. Once either endpoint exists, both are
  required and ordered for confirmation and submission. Selecting before the
  start restarts the range, matching the source.
- Docked input edits publish only a complete valid ISO date, or `''` for a
  partial/invalid edit. Modal edits are drafts. External `customValidity`
  remains attached to the native control but does not prevent a locally valid
  draft from being confirmed.

## Locale, keyboard, and focus

Formatting always requests the Gregorian calendar and UTC zone from `Intl`.
The deterministic default locale is `en-US`. Localized input parsing matches
the complete locale-derived field order and separator, accepts locale digits
and bidi marks, requires a four-digit year, and rejects surrounding junk.
`Intl.Locale.getWeekInfo()` or `weekInfo` supplies the first weekday when
available; `-u-fw-*` is honored, with a frozen CLDR-region fallback.

The day grid has proper `row`/`gridcell` nesting and one roving tab stop.
Arrow, Home/End, Page, Shift+Page, bounds changes, RTL, all-disabled months,
and year-grid movement have focused tests. Disabled dates remain in movement
order to avoid unbounded searches and allow their unavailable state to be
discovered. Enter and Space use native button activation exactly once.

Opening waits for a docked portal mount before moving focus. Calendar/input
selection and modal actions restore the field; Escape uses the shared overlay
or native Dialog path. Pointer dismissal preserves the newly clicked target.

## Layout adaptations

AndroidX's calendar uses a 360dp container, 12dp horizontal padding, a 56dp
month/year row, 48dp minimum targets, and 40dp painted date circles. Those
values map directly at ordinary web density. Under a 360px viewport, seven
48px targets plus source padding cannot fit. The explicit narrow-viewport path
uses seven non-overlapping 40px targets, retaining the 40px date surface and
all dates without horizontal clipping.

AndroidX range selection presents a virtualized, vertically scrolling sequence
of months. The web range path keeps a bounded previous/current/next window,
month subheads, vertical overflow, and scroll snapping. When scrolling settles,
the nearest month becomes the displayed month and the three-month window is
recentered, so the complete min/max range stays traversable without mounting
more than three 42-cell grids. Page keys use the same displayed-month state.
Multi-month range selection remains painted across the virtual window and RTL
affects logical key direction.

The modal composes the shipped `Dialog` and owns one picker header. Docked mode
uses the shared anchored-overlay service and recreates provider tokens and
direction on its portal root. Year choices and modal geometry customize the
shipped `Button` and `Dialog` only through public `--m3e-comp-*` aliases.

## Forms, themes, and SSR

The read-only presentation field is not used as the submitted value. A real
`input type="date"` owns each ISO value, bound, required state, external form
association, native constraint API, reset listener, and invalid event. Invalid
submission redirects focus to the labelled visible field. Canceled reset is
observed after dispatch and leaves component state unchanged.

The visible field receives caller `id`, ARIA/native input props, and composed
focus/key/click handlers. The ref points to it. `className` and `style` describe
the picker root. Range names are deliberately explicit `startName` and
`endName` so two stable ISO values are submitted.

All CSS values resolve through registered tokens, including forced colors and
reduced motion. SSR emits only deterministic field/form markup for closed
pickers; an initially open docked portal mounts after hydration. The explicit
`today` prop pins server examples, while the default corrects from UTC to the
client's local civil day after hydration without changing represented values.
