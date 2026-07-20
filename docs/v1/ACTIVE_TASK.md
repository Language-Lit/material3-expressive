# Active v1 task

## T14 — TextField and TextArea geometry repair

Status: active
Approved: 2026-07-20
Follow-up approved: 2026-07-20

### Scope

Correct the outlined-field geometry defect in the existing T14 implementation
without adding a new component, changing the public API, or starting T25. The
repair remains part of T14 because it fixes the shared `TextField`/`TextArea`
foundation and its label, icon, input, and outline layout. `Select` receives
regression coverage only because T17 deliberately reuses the same internal
chrome.

- Replace the native `fieldset`/`legend` notch, whose browser-owned border
  painting does not share the visible label's coordinate system, with a
  CSS-driven segmented outline whose top edge and label gap use the same
  geometry.
- Preserve the sourced 52px content inset for the input and resting label when
  a 48px leading-icon slot is present, while moving the outlined floating label
  and its cutout back to the ordinary 16px content inset.
- Align the floating label to the painted top outline and retain true vertical
  centering for single-line input text and icons inside the 56px container.
- Match the pinned multiline branch: an empty TextArea label starts at the
  ordinary 16px top padding instead of centering across all rows, while icon
  slots remain centered across the multiline container.
- Keep the native TextArea resize affordance synchronized with the complete
  field container by applying its 56px Material minimum to the textarea itself,
  so the control cannot shrink independently of the label, indicator, or
  outline.
- Preserve the filled variant, native-truth focus/value behavior, logical RTL
  layout, forced colors, reduced motion,
  accessibility, SSR, and public types.

### Expected files

- `src/v1/internal/TextFieldChrome.tsx` and
  `src/v1/components/TextField/TextField.css` for the shared outline and label
  geometry; `src/v1/components/TextArea/TextArea.css` only if a multiline delta
  is required.
- Focused TextField/TextArea tests and Select regression tests under
  `tests/v1/components/`.
- T14 conformance records and component documentation, ADR 0014 (or a
  superseding T14 ADR if the decision is clearer that way), architecture text,
  and `docs/v1/component-inventory.json`.
- Mirrored playground examples only if the existing examples do not expose the
  required icon/focus/value combinations for visual verification.

### Acceptance checks

- In an outlined 56px single-line field, the input line box and 24px icon are
  centered on the same block-axis midpoint as the painted outline; the floating
  label is centered on the outline's top edge.
- With a leading icon, input text and the resting label start at 52px while the
  floating label and cutout start at 16px. Logical placement mirrors in RTL.
- Empty, focused, populated, error, disabled, leading-icon, trailing-icon,
  filled, outlined, TextArea, and Select states retain their intended layout;
  an empty multiline label starts at 16px and multiline icon slots are centered
  across the container, matching the pinned placement policy.
- Resizing a TextArea changes the complete field container while the native
  textarea continues to fill it; the resize handle cannot move above the
  indicator/outline or shrink the field below its 56px minimum block size.
- The outline gap follows arbitrary label content without JavaScript
  measurement, and focus/error/disabled outline width and color remain visible
  in normal and forced-colors modes.
- Focused component tests, browser geometry/visual checks, and `npm run
  verify:v1` pass with no public API, SSR, hydration, accessibility, legacy, or
  bundle-budget regressions.
