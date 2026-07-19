# Active v1 task

## T18 — Tooltip and Snackbar

Status: complete
Approved: 2026-07-20
Completed: 2026-07-20

### Scope

Two transient-feedback components. Both reuse T17's shared overlay
infrastructure (portal to `document.body`, phase-based mount/measure/
deferred-unmount) but neither reuses Menu's dismissal model unmodified —
each has its own accessible timing/dismissal contract, sourced from the
pinned AndroidX revision `225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`
(unchanged since T17 — this is still the branch's current HEAD).

#### `Tooltip`

- `anchorRef` (required) + `content` (the body). `variant?: 'plain' | 'rich'`
  (default `'plain'`); `rich` adds an optional `subhead`. `placement?: 'top' |
  'bottom' | 'start' | 'end'` (default `'top'`, `'start'`/`'end'` resolved to
  physical left/right unconditionally — the same no-RTL-branching precedent
  `overlayPosition.ts` already set for `Menu`). `open`/`defaultOpen`/
  `onOpenChange` exist as a controlled escape hatch, but unlike `Menu`,
  `Tooltip` owns its own show/hide wiring directly on `anchorRef.current`
  (`mouseenter`/`mouseleave`/`focusin`/`focusout`) — hover/focus tooltip
  triggering is a single, standardized interaction (WAI-ARIA APG Tooltip
  pattern), unlike `Menu`'s click semantics, which are genuinely
  app-specific. No artificial show/hide delay: the pinned source shows/
  hides immediately on pointer enter/exit (`BasicTooltip.kt`'s
  `handleGestures`), so none is invented.
- Also imperatively sets/removes `aria-describedby` on the anchor while
  mounted — the first imperative ARIA-attribute technique in v1, extending
  the same "library owns unambiguous wiring" reasoning that already
  justifies Dialog's imperative native calls and Menu/Select's imperative
  focus calls.
- `useAnchoredOverlay` gains an optional `computePosition` override (used
  only by `Tooltip`; `Menu`/`Select` keep their existing default and are
  unaffected). `overlayPosition.ts` gains `computeTooltipPosition`: center-
  aligned on the cross axis, flips top/bottom or start/end on collision,
  clamps to the viewport with **zero** margin (the pinned source's own
  `coerceIn(0, ...)`, not a fabricated margin), `4px` gap (sourced
  `SpacingBetweenTooltipAndAnchor`).
- **Hoverable beyond the source**: tracks pointer presence over the popover
  itself in addition to the anchor (the pinned source only tracks the
  anchor), so moving the pointer from anchor to popover never dismisses it —
  a deliberate WCAG 1.4.13 addition; harmless here since neither variant
  contains interactive content (next point).
- `role="tooltip"`, always non-interactive. AndroidX's `RichTooltip` action
  button (`RichTooltipTokens.ActionLabelText*`) is **excluded**: WAI-ARIA
  explicitly disallows interactive content inside `role="tooltip"`, a direct
  spec conflict the web semantic wins per `V1_SPEC.md` §3. No caret/pointer
  triangle either — the source draws it via `CacheDrawScope`/
  `LayoutCoordinates` custom geometry with no clean web equivalent, the same
  "Compose-specific drawing machinery, no clean web equivalent" basis prior
  tasks already excluded features on.
- Tokens (both `PlainTooltipTokens`/`RichTooltipTokens`, plus sourced
  spacing constants): plain container color/shape (inverseSurface/
  cornerExtraSmall), plain supporting-text color (inverseOnSurface); rich
  container color/shape/shadow (surfaceContainer/cornerMedium/level2), rich
  subhead color (onSurfaceVariant), rich supporting-text color
  (onSurfaceVariant); `min-width`/`min-height` (40px/24px), plain/rich
  `max-width` (200px/320px), plain padding-inline/block (8px/4px), rich
  padding-inline (16px), `anchor-gap` (4px). Typography reuses existing
  `body-small`/`title-small`/`body-medium` typescale roles directly
  (unread-by-name, matching every prior task's precedent).

#### `Snackbar`

- `open`/`defaultOpen`/`onOpenChange` (standard shape) + `message`
  (required) + optional `action: { label, onClick }` + optional
  `dismissible?: boolean` (renders a close icon button; default `false`,
  matching the source's `withDismissAction` default) + `duration?: 'short' |
  'long' | 'indefinite' | number`, defaulting to the source's own
  `if (action == null) Short else Indefinite` logic (`Short` = 4000ms,
  `Long` = 10000ms, sourced from `SnackbarDuration.toMillis`). No leading
  status icon exists in the pinned source's public API — `SnackbarTokens`'
  `IconColor`/`IconSize` belong to the dismiss action only.
- `role="status"` (implicit polite + atomic live region), matching the
  source's own `liveRegion = Polite` semantics — the direct web analogue,
  since Android's own accessibility-service timing/announcement machinery
  has no web equivalent.
- **Pausable beyond the source**: the auto-dismiss timer pauses on
  hover/focus of the snackbar itself and resumes on pointer/focus leave — a
  deliberate WCAG 2.2.1 (timing adjustable) addition; the source has none
  since Android's own accessibility services extend timing differently.
- Motion: fade + scale (`0.8` → `1`) on `FastEffects`/`FastSpatial`, the
  exact tokens and curve `Menu` already uses (`FadeInFadeOutWithScale`) — no
  new motion tokens.
- The `actionOnNewLine` two-row layout variant is excluded (legacy path per
  the source's own `LegacySnackbarVerticalPadding` naming) — action stays
  inline, the modern single-row layout.
- No component-level viewport-offset token: the source's positioning is a
  consuming `Scaffold`'s job, not a component token, and no cross-validation
  source (material-web ships no snackbar implementation, only token files)
  defines one either. The bottom offset is therefore a plain CSS value, not
  a claimed-sourced token — the same "implementation constant, not a
  Material value" status Menu's own `z-index: 1000` already has.
- Tokens: container color/elevation/shape (inverseSurface/level3/
  cornerExtraSmall), supporting-text color (inverseOnSurface), action-label
  color (inversePrimary), dismiss-icon color (inverseOnSurface), icon size
  (24px), min-height (48px), max-width (600px), padding-inline (16px),
  padding-inline-button-side (8px), padding-block (14px). Typography reuses
  `label-large`/`body-medium` directly.

### Expected files

- `src/v1/internal/overlayPosition.ts` (+`computeTooltipPosition`),
  `src/v1/internal/useAnchoredOverlay.ts` (+`computePosition` option) — both
  extended, not replaced; `Menu`/`Select` behavior unchanged.
- `src/v1/components/Tooltip/`, `src/v1/components/Snackbar/`, public
  barrels, sourced `tooltip`/`snackbar` component-token defaults.
- Behavior, interaction, accessibility, theme, CSS, SSR, type-contract, and
  conformance evidence under `tests/v1/` for both, plus tests for
  `computeTooltipPosition`.
- Mirrored playground examples, docs, one ADR, architecture/provenance
  notes, component-inventory rows for both.
- An explicit bundle-budget update only if justified by measured output.

### Acceptance checks

- `Tooltip`: shows on hover/focus of the anchor, hides on hover-out/blur
  (immediate, no artificial delay) unless the pointer moved onto the
  popover itself; Escape always dismisses; `aria-describedby` is present on
  the anchor only while mounted; `role="tooltip"` throughout; positioning
  prefers the requested placement, flips on collision, and clamps flush to
  the viewport edge with no overflow; reduced motion makes the transition
  immediate with no stuck-open frame; nothing renders server-side or before
  the first client effect; rich variant renders subhead + content with no
  focusable/interactive descendant.
- `Snackbar`: `open`/`defaultOpen`/`onOpenChange` behave like every other
  v1 controlled/uncontrolled pair; auto-dismisses after the resolved
  duration unless indefinite; the auto-dismiss timer pauses on hover/focus
  and resumes on leave; the action button and dismiss button both close and
  fire their own callback; `role="status"` announces new messages; reduced
  motion and forced colors both hold; nothing renders server-side or before
  the first client effect.
- `Menu`/`Select`'s existing tests remain green unmodified — the
  `useAnchoredOverlay`/`overlayPosition` extension must be additive only.
- Forced colors, RTL (logical properties), reduced motion, default/custom/
  nested theme, CSS resolution, documentation, source provenance, both
  examples, public exports, production fixtures, and inventory are covered
  and agree.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures,
  CSS checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
