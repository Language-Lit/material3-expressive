# ADR 0044: Date and time picker civil values and web composition

Status: accepted
Date: 2026-09-12
Task: T66

## Context

Material exposes date selection and time selection as separate stateful
families. Applications also need a combined local date and wall-clock time, but
combining the values through JavaScript `Date` would silently choose a time
zone, daylight-saving rule, or UTC conversion that neither picker owns.

The public APIs must also preserve normal web behavior. A person can temporarily
enter an incomplete date or time; forms need native constraint validation,
reset, and external `form` association; locale changes presentation without
changing stored data; and modal pickers need the browser's dialog lifecycle.

The primary implementation and token sources are pinned independently because
the two AndroidX families were surveyed at different current revisions:

- [`DatePicker.kt`](https://android.googlesource.com/platform/frameworks/support/+/e8cac06846dd0164454bd44b77ed1c4e95ec7591/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/DatePicker.kt)
  and its generated date-picker token files at revision
  `e8cac06846dd0164454bd44b77ed1c4e95ec7591`;
- [`TimePicker.kt`](https://android.googlesource.com/platform/frameworks/support/+/8a0ee86845b2fb7c56fc5786971ecb687ad85527/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/TimePicker.kt)
  and its generated time-picker and time-input token files at revision
  `8a0ee86845b2fb7c56fc5786971ecb687ad85527`.

Both were accessed on 2026-09-12. Their executable source ledgers and
conformance records own the complete file, token-role, test, screenshot, and
exclusion inventories. This ADR records the shared public and web adaptation
decisions.

## Decisions

### 1. Three public surfaces cover two families and one composition

`DatePicker` and `DateRangePicker` share one date-picker family, implementation
directory, token registration, documentation page, and inventory entry. This is
the `Slider`/`RangeSlider` precedent: the range control owns additional state but
uses the same family anatomy and styles.

`TimePicker` owns the time family. `DateTimePicker` is a public composition of
the two child APIs. It owns aggregate state and validation, but it does not copy
either picker or register another visual token family.

### 2. Public values are ISO civil strings

The date API uses `YYYY-MM-DD`, time uses `HH:mm`, and date-time uses
`YYYY-MM-DDTHH:mm`. Empty string means no complete value. These are local civil
values, not instants. Implementations parse their numeric fields directly and do
not construct `Date` objects for storage, callbacks, comparison, or submission.

Lexical comparison is valid only after strict calendar and time validation.
`DateTimePicker` therefore validates each part before comparing the complete
fixed-width string with `min` or `max`. It passes a boundary time to the child
time picker only when the selected date equals that boundary's date. A retained
time is revalidated immediately when the date changes.

Time-zone conversion belongs to an application or protocol adapter that knows
the intended zone. Keeping it outside the component prevents a locale, browser
zone, or daylight-saving transition from changing the selected civil value.

### 3. Partial text is draft state, never a fabricated value

Each picker accepts the package's controlled or uncontrolled prop union. Text
entry keeps an internal draft while it is incomplete or invalid. The callback
and submitted value become empty until the draft is complete; the implementation
does not fill a missing part with today, midnight, or a previous complete value.

For controlled `DateTimePicker`, a parent rerender carrying the same external
value preserves that draft. A distinct external value replaces it. This lets a
consumer echo callbacks without erasing the person's next keystroke while still
supporting authoritative external reset.

### 4. Locale affects presentation only

`locale` selects localized date formatting, localized digits, date order, hour
cycle, and period labels. `hour12` overrides only the hour-cycle presentation.
The callback and form value always use ASCII ISO civil text.

Gregorian ISO serialization is the stable cross-locale contract. Locale-aware
input is parsed at the field boundary and converted back to that contract. The
components do not claim non-Gregorian calendar storage or time-zone support.

### 5. Child controls own their native validity

`DatePicker` and `TimePicker` expose `customValidity` for compositions. Each
child computes its own format and bound error first, then applies the additional
message only when its own value is valid. This avoids competing effects where a
parent imperatively calls `setCustomValidity()` and a child later clears the
same input.

`DateTimePicker` supplies one aggregate message to both children for an
incomplete pair or full-value bound failure. Required and invalid submissions
therefore fail browser `checkValidity()` on real form-associated controls rather
than relying on `aria-invalid` alone.

### 6. Forms submit one combined value and keep native reset semantics

The date and time children remain validity controls but have no `name` inside
the composition. `DateTimePicker` renders one hidden named input containing the
complete combined value. Clearing or partially editing either child immediately
empties it, preventing submission of a stale value.

`form` is passed to both children and the hidden input so all three participate
in an external form. An uncontrolled composition listens for that form's reset,
waits until cancellation can be observed, and restores `defaultValue` only when
the reset was not prevented.

### 7. Web overlays retain native browser behavior

The docked date presentation uses an anchored popup and the docked time
presentation stays in flow. Modal presentations compose the library's native
`Dialog`, retaining top-layer behavior, Escape dismissal, focus containment,
and focus restoration. Confirm and Cancel stage modal edits; docked edits commit
as the owning child accepts them.

`TimePicker.layout` exposes the source's vertical and horizontal arrangements,
defaulting to vertical. It is explicit rather than inferred from an Android
window-size API that has no stable component-local web equivalent; responsive
applications can select the horizontal arrangement at their own layout boundary.

The date calendar uses native buttons for navigation and day activation inside
an ARIA grid with roving focus. A real form-associated date input retains date
constraint validation while the visible field and calendar provide Material
presentation. Time text entry stays a real input; dial options use native button
activation with radio/radiogroup state and roving focus. Composite roles expose
the selection model while button and input elements retain browser activation.

The range calendar retains the source's continuous vertical month browsing
without mounting its full 1900–2100 range. It renders a bounded
previous/current/next month window, recenters that window when scrolling
settles, and keeps the selected range and roving day focus across each shift.

### 8. Tokens remain attributable to their source families

The token registry adds `date-picker` and `time-picker` domains at their pinned
revisions. Date range shares `date-picker`. `DateTimePicker` uses the date
family's input-spacing role for its child layout and otherwise delegates all
paint, geometry, state, elevation, and motion to the two children.

Web-only values such as viewport margins, focus rings, and form-control hiding
dimensions are named in the registrations and classified in the source ledgers.
They are adaptations required by browser layout or accessibility, not values
misattributed to generated Android tokens.

### 9. Package and publication boundaries stay unchanged

The new components flow through the existing root component barrel and compiled
stylesheet. The package keeps its four approved export paths, React/React DOM as
its only peers, and no runtime dependencies. Registry publication and site
deployment remain separate final actions.

### 10. Rebase the three bundle artifacts that the complete family exceeds

The pre-task package at commit
`4d55ab36708fac6e0b65521843a6542c7258eec5`, built with the same installed
toolchain, measures a 475,772-byte imported JavaScript closure (84,701 gzip), a
109,667-byte declaration closure (25,881 gzip), a 468,575-byte full stylesheet
(51,319 gzip), a 133,408-byte token stylesheet (11,829 gzip), and a 476,487-byte
packed package.

The complete T66 picker surface measures 590,642 bytes of imported JavaScript
(107,133 gzip), 124,267 bytes of declarations (28,790 gzip), 501,362 bytes of
full CSS (55,061 gzip), 140,442 bytes of token CSS (12,582 gzip), and a
557,983-byte packed package. The JavaScript growth is the calendar/range,
localized civil parsing, time dial/input, and modal state implementation. The
token growth is exactly the two new registrations; the packed-package growth is
the compiled picker code and styles. The package still has no runtime
dependency, and `DateTimePicker` reuses the public children instead of copying
their implementations.

The JavaScript closure, token stylesheet, and packed package exceed their T48
ceilings and are rebased to the measurements above. Applying each artifact's
existing proportional headroom and rounding upward to the next 100 bytes gives
661,100 raw / 120,000 gzip for JavaScript, 146,700 raw / 13,100 gzip for token
CSS, and 623,600 for the packed package. The declaration closure and full
stylesheet stay below their existing ceilings, so their baselines and ceilings
do not move. This follows the bounded ADR 0037/0038 precedent: raise breached
artifacts with recorded measurements and retain every gate that still has room.

## Consequences

Consumers can keep a civil appointment unchanged across browser time zones and
choose explicitly when to associate it with a zone or instant. Native form
validation sees partial, required, and out-of-range states, including when the
control belongs to an external form.

The combined component deliberately exposes child mode controls because date
and time modes are independent upstream. It does not expose child open state;
applications that need separately controlled overlays can compose the two
public pickers directly.

Source conformance remains attributable to the two picker families. The
date-time composition must prove its additional draft, boundary, locale, and
form behavior in its own tests and browser audit before the inventory can call
it conformant.
