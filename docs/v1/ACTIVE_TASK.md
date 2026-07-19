# Active v1 task

## T16 — Dialog

Status: complete
Approved: 2026-07-20
Completed: 2026-07-20

### Scope

- Implement one public `Dialog` component rendering a native `<dialog>`
  element as its root, collapsing the pinned source's layered
  `BasicAlertDialog` (bare positioning/sizing) and `AlertDialog`
  (opinionated icon/title/text/actions layout) into a single component,
  matching the sole `Dialog`/`DialogProps` export already named in the
  component inventory.
- `open`/`defaultOpen`/`onOpenChange` follow the same controlled/
  uncontrolled shape as every other stateful v1 component
  (`useControllableState`). Openness is driven exclusively by imperative
  `showModal()`/`show()`/`close()` calls synchronized from `open` in an
  effect — the `open` HTML attribute is never set directly by JSX, so SSR
  always paints closed and a mounted client effect performs the first
  open, which is the only way a true top-layer modal with a backdrop and
  inert background can exist at all.
- `modal` (default `true`) selects `showModal()` (backdrop, focus trap,
  inert background content, implicit `aria-modal="true"`) vs `show()`
  (no backdrop, no focus trap, background stays interactive, implicit
  `aria-modal="false"`) — this is the web-native "Modal/non-modal
  semantics" the task names, and a deliberate capability addition beyond
  the pinned source, which is unconditionally modal. Initial focus
  placement and, on close, focus restoration to the previously-focused
  element are both native `<dialog>` behavior for either mode (the HTML
  living standard's dialog focusing steps and closing steps) and require
  no library-owned focus-management code.
- `dismissOnEscape` (default `true`) maps the source's
  `dismissOnBackPress`: `false` calls `preventDefault()` on the native
  `cancel` event so Escape leaves the dialog open with no callback,
  exactly like the source's back-press suppression. `dismissOnOutsideClick`
  (default `true`) maps `dismissOnClickOutside`: a manual bounding-rect
  click check on the dialog element (the standard native-`<dialog>`
  light-dismiss technique, since native automatic light dismiss via the
  `closedby` attribute postdates this library's browser floor) calls
  `close()` when the click lands outside the dialog's own box. Both
  props are meaningful only in modal mode (no backdrop exists to click,
  and Escape does not dismiss non-modal dialogs by native default) and
  are documented as such rather than silently ignored. A single native
  `close` event listener is the one path that calls `onOpenChange(false)`,
  so a `<form method="dialog">` submission inside the dialog (native,
  requiring no library wiring) reaches the consumer exactly like any
  other dismissal.
- Opinionated content structure reproducing `AlertDialogContent`'s layout
  with optional named slots — `icon`, `title`, `children` (the body/
  supporting-text region), `actions` — over a styled surface (container
  color, shape, elevation) sourced from `DialogTokens`. `children` sets
  inheritable default typography/color for plain text while letting any
  nested component (Button, TextField, etc.) override by being explicit,
  matching the Card content-boundary precedent of not forcing typography
  on interactive descendants. The source's confirm/dismiss dual-slot API
  with its layout-direction-flip trick (DOM order confirm-then-dismiss,
  visual order reversed in LTR) is simplified to one `actions` slot — a
  wrapping flex row, end-aligned, gap-separated — letting the consumer's
  own JSX order set both DOM and visual order directly with no framework-
  specific reordering plumbing, a flattening of Compose-specific
  composition mechanics with no clean CSS equivalent.
- Adaptive width sizing cross-validated against both the pinned source's
  `DialogMinWidth`/`DialogMaxWidth` (280dp/560dp) and material-web's
  dialog CSS (`min(560px, calc(100% - 48px))`): intrinsic width bounded
  to 280–560px, clamped against the viewport with a 24px margin on each
  side. Height is not source-capped, so only a viewport-safe
  `max-height` with internal scrolling applies, not a second 560px cap.
- Entrance and exit motion (fade + scale, sourced duration/easing from
  the existing `default-spatial` motion tokens for the surface transform
  and `default-effects` for the backdrop's opacity-only fade) is
  implemented with `@starting-style` and `transition-behavior:
  allow-discrete` — a native, JS-free technique for animating a
  top-layer element's open/close that degrades to an instant,
  fully-functional show/hide with zero breakage on any browser without
  `@starting-style` support, unlike this library's usual hard
  floor-support commitments elsewhere.
- Map `DialogTokens`' container/icon/headline/supporting-text/action
  color, shape, and elevation roles to `--m3e-comp-dialog-*` variables.
  Typography roles reuse existing typescale variables directly (matching
  the SegmentedButtonGroup precedent) rather than duplicating them as
  component tokens. A scrim opacity token (32%, cross-validated against
  material-web since the pinned Compose source has no cross-platform
  Material3 scrim-opacity token of its own — dialog dimming there is an
  Android platform default, not a Material3 design token) is registered
  for the native `::backdrop`.
- An accessible name/description contract per the APG dialog pattern:
  `title`, when present, is associated via a generated id and
  `aria-labelledby` unless the caller passes an explicit `aria-label`/
  `aria-labelledby`; `children`, when present, is associated via
  `aria-describedby` the same way. A dev-mode warning fires when the
  dialog has no accessible name from any source. `role` defaults to
  `dialog` and accepts `alertdialog` for interruption-style confirmations,
  folding the source's separate "alert dialog" identity into one prop
  rather than a second component.
- Preserve forced-colors, logical RTL behavior, reduced-motion (no
  transform/opacity/backdrop transitions), deterministic SSR/hydration
  with no injected styles, and default/custom/nested theme token
  resolution.

Predictive-back gesture handling, edge-to-edge system-bar color
adaptation, and the `shouldUsePrecisionPointerComponentSizing`-gated
20px padding variant are Android-platform-specific or unshipped
provisional behavior with no web equivalent or no stable source value,
same exclusion basis as prior tasks' provisional-feature exclusions.

### Expected files

- `src/v1/components/Dialog/`, its public barrel, and sourced `dialog`
  component-token defaults.
- Dialog behavior, interaction, accessibility, theme, CSS, SSR,
  type-contract, and conformance evidence under `tests/v1/`.
- A mirrored example under `playground/v1/examples/`, playground usage,
  and packed Vite/Next fixture coverage.
- Dialog documentation, a native-dialog-adoption ADR, architecture/
  provenance notes, and the component inventory status/exports.
- An explicit bundle-budget update only if justified by measured output.

### Acceptance checks

- `open`/`defaultOpen`/`onOpenChange` behave like every other v1
  controlled/uncontrolled prop pair; the dialog never has the `open`
  HTML attribute set before the first client effect runs.
- `modal={true}` (default) shows a backdrop, traps focus, makes the rest
  of the page inert, and exposes `aria-modal="true"`; `modal={false}`
  shows none of those and exposes `aria-modal="false"`; both move focus
  into the dialog on open and restore it to the previously-focused
  element on close with no library-owned focus code.
- `dismissOnEscape={false}` leaves a modal dialog open on Escape with no
  `onOpenChange` call; `dismissOnOutsideClick={false}` leaves a modal
  dialog open on a backdrop click; both default to dismissing. A
  `<form method="dialog">` submission inside the dialog closes it and
  calls `onOpenChange(false)` with no extra wiring.
- `icon`/`title`/`children`/`actions` render in the sourced order and
  spacing; omitting any slot removes its spacing contribution with no
  leftover gap; `actions` end-aligns and wraps under width pressure.
- The dialog's own width stays within 280–560px and never exceeds the
  viewport minus margins; very tall content scrolls inside the dialog
  rather than overflowing the viewport.
- Opening and closing animate via `@starting-style`/`allow-discrete` where
  supported and are fully functional (correct open/closed state, focus,
  and callbacks) with no animation on a browser without that support.
- `title` without an explicit `aria-label`/`aria-labelledby` sets
  `aria-labelledby`; `children` sets `aria-describedby`; a dialog with no
  accessible name warns in development.
- Forced colors keep the dialog boundary and content visibly distinct
  from the page; logical properties mirror correctly under RTL; all
  transitions become immediate under reduced motion.
- Rendering and hydration remain deterministic and inject no styles.
- Forced colors, RTL, reduced motion, default/custom/nested theme, CSS
  resolution, documentation, source provenance, the example, public
  exports, production fixtures, and inventory are covered and agree.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures,
  CSS checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
