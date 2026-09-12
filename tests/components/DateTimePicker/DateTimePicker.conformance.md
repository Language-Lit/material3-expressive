# DateTimePicker conformance

Status: experimental
Task: T66

## Source and composition boundary

`DateTimePicker` is a web composition of the public `DatePicker` and
`TimePicker` APIs. It does not copy another picker implementation and registers
no independent visual token family. The child conformance records freeze their
AndroidX implementation, generated-token, behavior-test, and screenshot-test
sources:

- `DatePicker` at AndroidX revision
  `e8cac06846dd0164454bd44b77ed1c4e95ec7591`;
- `TimePicker` at AndroidX revision
  `8a0ee86845b2fb7c56fc5786971ecb687ad85527`.

The source models date selection and time selection as separate state. This
composition's public output is the direct web serialization of those two child
values as `YYYY-MM-DDTHH:mm`. ADR 0044 records why the component does not use
`Date`, an instant, or a time-zone offset.

## Public behavior

- Controlled and uncontrolled values use the package's standard mutually
  exclusive prop unions.
- Empty and incomplete parts yield an empty aggregate value. Partial field text
  remains editable and no missing date or time is fabricated.
- A same-value controlled rerender preserves partial text. A distinct external
  value replaces the draft.
- Full bounds compare strict ISO civil strings. The minimum or maximum time is
  passed to `TimePicker` only on the matching boundary date, so a date change
  immediately revalidates a retained time.
- Locale and `hour12` affect child presentation and parsing only. The submitted
  and callback value remains ASCII ISO civil text.
- The group has one visible label and separately nameable date and time fields.
  Required, invalid, disabled, and read-only states remain native child-control
  states rather than ARIA-only approximations.
- One hidden input submits the complete combined value. Both children and the
  hidden input support an external `form`; an uncancelled reset restores the
  uncontrolled default and a cancelled reset preserves the draft.
- The forwarded ref targets the date trigger. Native `div` attributes describe
  the group root.

## Verification

The focused suite covers initial and live partial values, empty optional and
required validity, the incomplete-pair regression, full bounds, boundary-date
changes, controlled rerenders and external updates, external form submission,
normal and cancelled reset, exact time-zone-independent strings, accessible
naming, native validity, disabled state, SSR, hydration, and compile-only prop
unions.

Promotion to `conformant` requires the aggregate package verification,
production playground build, and real-browser light/dark, RTL, density, and
reduced-motion checks required by T66.
