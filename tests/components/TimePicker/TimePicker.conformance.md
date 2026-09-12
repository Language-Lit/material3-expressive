# TimePicker conformance

Status: experimental
Task: T66

Promotion gate: claim conformance only after the repository-wide verifier and
browser matrix pass against the integrated picker family and canonical
playground examples.

## Pinned sources

AndroidX Material 3 revision
`8a0ee86845b2fb7c56fc5786971ecb687ad85527`, accessed 2026-09-12:

- `TimePicker.kt`, blob `f341edbc2698fb6fe93418c5e1896257aa1f538e`;
- generated `TimePickerTokens.kt` v0_210, blob
  `ecbb7525709bb6ba05619e0f095df258794cf2d6`;
- generated `TimeInputTokens.kt` v0_210, blob
  `4b09f4fb16b750f4469fc68bf63504d111439924`;
- `TimePickerTest.kt`, blob `d08e5fbd105265f11e7af5c6d0a0bd244553f2fb`;
- `TimePickerScreenshotTest.kt`, blob
  `e273437aa0d45682aa14679150770f8450a9e6fb`;
- `TimeInputScreenshotTest.kt`, blob
  `831aa974a3ba617d08f3e55aa394aa2bc272b76d`.

The implementation source is [TimePicker.kt](https://android.googlesource.com/platform/frameworks/support/+/8a0ee86845b2fb7c56fc5786971ecb687ad85527/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/TimePicker.kt).
`TimePicker.source.test.ts` freezes all six blob identities, 53 picker token
declarations, 36 input token declarations, all 37 named behavior tests, and all
eight screenshot cases. There are no omitted source tests in the ledger.

## Public source-surface disposition

| Pinned source surface | Web disposition |
| --- | --- |
| `TimePicker(state)` and default overload | `TimePicker` in `dial` mode |
| `TimeInput(state)` | The same component in `input` mode |
| `TimePickerState` / `rememberTimePickerState` | Controlled and uncontrolled `HH:mm` props |
| `TimePickerLayoutType.Vertical` | Default `layout="vertical"` dial stack |
| `TimePickerLayoutType.Horizontal` | Explicit `layout="horizontal"` clock-and-dial row with horizontal period control |
| `TimePickerColors` / `TimePickerDefaults.colors` | Default registration and scoped component-token overrides |
| `TimePickerDefaults.periodToggle` | Localized two-state Button composition |
| `TimePickerDefaults.layoutType` | Deterministic vertical default; callers choose horizontal for landscape containers |
| `ClockDisplay` / `TimeSelector` | Two real selector Buttons with pressed state |
| `ClockFace` / `ClockDial` | Pointer-aware radio group and sourced selector geometry |
| `PeriodToggle` | Real AM/PM Buttons with bounded availability |
| `TimePickerSelectionMode` | Internal hour/minute selection with focus transfer |
| `TimeInputImpl` / `TimeField` | Two labeled native text inputs matching source geometry |

Android accessibility-service queries do not have an equivalent React public
object. The web component uses explicit keyboard semantics and focus transfer.
Dialog containment is public composition with the package's native `Dialog`,
not an Android source entry.

## Values, bounds, and locale

- Values serialize strictly as `HH:mm` civil text. Parsing never constructs a
  `Date` and never reads a time zone.
- Locale digits are parsed at the field boundary and serialized back to ASCII;
  `hour12` affects display only. The default locale is deterministic `en-US`,
  including during server rendering.
- Inclusive `min` and `max` constrain every dial, input, modal-confirmation,
  and form path. Reversed bounds are invalid rather than overnight.
- Empty bounded panels seed at `min` without committing the fabricated draft.
  Period changes choose the nearest allowed time in the target period.
- Controlled props remain prop-owned. Uncontrolled values initialize once,
  emit exact changes, and restore on an uncancelled form reset.

## Dial, pointer, and keyboard

- Twelve-hour mode uses `12,1…11`. Twenty-four-hour mode preserves the pinned
  source mapping: outer `00…11`, inner `12…23`.
- The minute group contains all 60 values. Five-minute labels paint at rest;
  an off-five selection becomes a full 48px control with selected and focus
  styling. Pointer angle selection comes from the dial sector, avoiding 60
  overlapping hit targets.
- Pointer dragging retains hour mode for the whole gesture and advances only
  on release. The inner-ring decision reads the resolved threshold token, so
  dial-size and radius overrides stay aligned with pointer behavior.
- Each group has one enabled roving tab stop. Arrow, Home, and End keys skip
  disabled values. Hour arrows browse within the hour group; explicit
  activation advances and focuses the matching minute. Horizontal arrows read
  computed CSS direction, including nested direction overrides.

## Input, forms, modal state, and accessibility

- The source-specific Hour and Minute inputs are exactly token-sized 96×72
  fields with zero-padding text and associated supporting labels beneath them.
  In 12-hour mode, the source's 52×72 vertical period toggle sits beside their
  LTR numeric row. Invalid local drafts stay visible and block confirmation.
- The main TextField is the form-associated validity control. Its native
  required state plus `setCustomValidity` enforce empty, format, bounds, and
  composed `customValidity` errors. A hidden named input submits only complete
  canonical text; invalid or partial drafts emit and submit empty without being
  erased. Picker-owned errors take priority.
- Read-only mode uses `aria-readonly` while keeping native validity active. It
  blocks mutation input and permits navigation and modifier shortcuts.
- The modal uses the native Dialog lifecycle. Edits are drafts; Confirm commits
  once, while Cancel, Escape, and outside dismissal restore prior state. Enter
  in a panel input cannot submit the containing form.
- The dial is a radio group over real buttons. The clock and period selectors
  use real buttons, and the input mode uses real labeled inputs.
- The sourced dial period container is 52×80 vertically and 216×38
  horizontally; input mode uses 52×72. `PeriodToggleImpl` constrains each
  `TextButton` to half its fixed container. Those 40px/38px/36px source targets
  clear WCAG 2.2 SC 2.5.8's 24px minimum but fall
  below this package audit's normal 44px threshold, so the experimental browser
  gate records a selector-specific exception. Enlarging the Button border box
  would stretch its painted container and change the pinned geometry.

## Tokens, rendering, and verification

Every authored selector is under the `.m3e-time-picker` namespace. The
component uses public Button token aliases and does not depend
on Button or TextField private markup. Runtime geometry custom properties have
static CSS fallbacks. Reduced-motion and forced-color outcomes are explicit.

Focused verification covers controlled/uncontrolled editing, clearing, form
validity, custom validity, external forms, cancelled and uncancelled reset,
read-only shortcuts, exact-minute keyboard access, bounded periods, pointer
geometry overrides, modal drafts, invalid input drafts, accessibility, source
and CSS contracts, deterministic SSR, and hydration without recoverable
errors.

## Browser evidence pending aggregate promotion

Chromium was run with reduced motion against the canonical playground at the
source density. Light and dark LTR dialogs used a 328px desktop width around
the 280px intrinsic vertical panel, with a 256×256 dial and 48×48 selected
handle; their container, dial, and selected colors all
changed with the theme tokens. Light and dark RTL retained the same clock
center. The selected 2-hour handle stayed at the expected (+87.47, −50.5)
offset, and the numeric clock display computed LTR with Hour before Minute.

A real pointer drag starting on the selected 2-hour handle moved to 3, released
into minute selection, then dragged the selected exact minute 32 to 33. The
off-five selector measured 48×48, exposed `aria-checked="true"`, and Confirm
committed `15:33`; the trailing compatibility click did not restore 32.

The horizontal 24-hour panel measured 508px: 216px display + 36px sourced gap
+ 256px dial. It rendered both hour rings and no period toggle. Input mode
measured a 216px LTR numeric row of two 96×72 fields and separator, labels below
the fields, a 12px gap, and a 52×72 vertical period container. At 320px the
vertical dialog occupied x=8…312, with a 280px intrinsic panel inside 12px
responsive padding. Its 280px display stayed inside the panel and the centered
256px dial occupied x=32…288. The aggregate verifier and integrated picker
browser matrix remain the promotion gate while this record is experimental.
