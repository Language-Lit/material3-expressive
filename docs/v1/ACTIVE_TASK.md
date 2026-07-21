# Active v1 task

## T14 — TextField shared-content geometry repairs

Status: complete
Horizontal repair approved: 2026-07-21
Horizontal repair completed: 2026-07-21
Vertical repair approved: 2026-07-21
Vertical repair completed: 2026-07-21

### Scope

Correct the existing T14 shared `TextFieldChrome` horizontal layout against
the pinned AndroidX revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc` and its first-party Material Web
adaptation. This remains a T14 conformance repair, not a new component task.

- Replace the full-width native control overlaid beneath icon slots, whose
  caret and text position depends entirely on reset-sensitive inline padding,
  with distinct logical start, input-content, and end regions.
- Preserve the sourced 16px ordinary content inset and 52px icon-aware content
  inset (48px icon target plus 4px gap) for input text, placeholder, and the
  resting label, including under representative downstream form-control
  resets.
- Reserve trailing content symmetrically so typed text and browser-owned input
  affordances cannot occupy the trailing icon region.
- Apply the shared correction to filled and outlined `TextField`, every
  supported native input type including `password`, multiline `TextArea`, and
  `Select`, which deliberately reuses the same internal chrome.
- Preserve the outlined floating label's ordinary 16px inset, label notch,
  native focus/value truth, whole-field click-to-focus behavior, logical RTL
  mirroring, forced colors, reduced motion, accessibility, SSR, and public
  APIs.
- Keep legacy source and private downstream applications outside the repair.

The approved vertical follow-up repairs the remaining reset-sensitive block
geometry without changing Material's intended compact relationship:

- Replace native-control block padding as the owner of the filled and outlined
  label/value relationship with explicit top/content/bottom grid rows.
- Preserve AndroidX's exact filled placement: 8px above the minimized 16px
  label line, followed immediately by the 24px input line, followed by 8px at
  the bottom of the 56px minimum container. Preserve the outlined 16/24/16px
  placement.
- Keep resting labels centered, minimized labels at their existing positions,
  and multiline content top-aligned while allowing native `rows` and vertical
  resize to grow the content row.
- Apply the correction to filled and outlined `TextField`, `TextArea`, and
  `Select`, including under representative unlayered input/textarea/button
  padding resets.
- Preserve the completed horizontal start/content/end repair, public APIs,
  native behavior, accessibility, SSR, RTL, forced colors, and motion.

### Expected files

- `src/v1/internal/TextFieldChrome.tsx` and
  `src/v1/components/TextField/TextField.css` for the shared semantic and
  horizontal layout correction; TextArea/Select runtime styles only if their
  existing shared-chrome composition proves insufficient.
- Focused TextField, TextArea, and Select behavior/CSS regressions under
  `tests/v1/components/`, including icon-aware geometry that does not depend on
  native-control inline padding.
- T14 conformance records and public component documentation, ADR 0014,
  architecture text, and `docs/v1/component-inventory.json` review/update.
- Mirrored playground examples only where needed to expose password/icon and
  shared-consumer combinations for visual verification.
- `src/v1/components/TextField/TextField.css` and, if required by native
  multiline sizing, `src/v1/components/TextArea/TextArea.css` for structural
  block rows; no runtime component change is expected.
- Focused TextField/TextArea/Select CSS or browser regressions proving clean and
  reset geometry, plus T14 ADR/conformance/component-documentation updates.

### Acceptance checks

- Input text/caret starts at the ordinary 16px inset without a leading icon
  and at 52px with one; trailing content reserves the corresponding end region.
  Both relationships mirror in RTL.
- The icon-aware horizontal geometry remains correct with a representative
  unlayered `input, textarea { padding: 0 }` downstream reset, rather than
  collapsing the caret underneath the leading icon.
- Filled, outlined, empty, focused, populated, error, disabled, leading-icon,
  trailing-icon, password, other supported input-type, TextArea, and Select
  states retain their intended label, outline, indicator, and content layout.
- Clicking the field chrome still focuses or activates its native control;
  accessible naming/description, native forms, SSR, hydration, forced colors,
  reduced motion, and public types remain unchanged.
- Focused component tests, a real-browser computed-geometry smoke check, and
  `npm run verify:v1` pass with no legacy, package, CSS-token, documentation,
  or bundle-budget regressions.
- Filled minimized labels occupy 8–24px and their input content begins at 24px;
  outlined input content occupies the centered 16–40px row. The line boxes are
  adjacent, not overlapped and not separated by an invented gap.
- Those block relationships remain exact after an unlayered
  `input, textarea, button { padding: 0 }` reset. TextArea rows and user-driven
  vertical resize grow only the content row, and Select retains its native
  trigger activation and popup behavior.

### Completion evidence

- Focused TextField/TextArea/Select verification passed: 15 files and 100
  tests, including native-label activation, SSR/hydration, accessibility, CSS,
  theme, and shared-consumer regressions.
- Chrome measured all 25 playground shared-chrome controls with both clean CSS
  and an unlayered `input, textarea, button { padding: 0 }` reset. Both runs
  retained filled 24/24/8px and outlined 16/24/16px rows exactly; every
  four-row textarea retained its 128px container with only the 96px middle
  content row growing.
- Chrome checked every one of the playground's 25 shared-chrome controls
  against the expected 16px ordinary and 52px icon-bearing edge regions under
  a representative unlayered input/textarea reset. All 25 passed in LTR and
  all 25 passed after live RTL mirroring; password-icon activation focused the
  native password input and Select-icon activation opened the combobox.
- The same 25/25 LTR and 25/25 RTL geometry check passed against the
  production-built playground and assembled `dist/v1/styles.css`.
- `npm run verify:v1` passed all 13 aggregate gates: 174 test files and 1,010
  tests, distributable/package and production-playground builds, architecture,
  docs, supported browsers, CSS, tokens, frozen legacy contracts, every bundle
  budget, and packed Vite/Next/legacy consumer fixtures.
- `component-inventory.json` was reviewed and remains accurate: the repair
  changes no component names, T14/T17 ownership, dependencies, statuses, or
  public exports, so changing inventory data would be false bookkeeping.
