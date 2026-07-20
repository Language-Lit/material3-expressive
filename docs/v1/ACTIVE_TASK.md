# Active v1 task

## T13 — Switch thumb icon and inset geometry repair

Status: active
Repair approved: 2026-07-20

### Scope

Correct the existing T13 `Switch` thumb/icon translation against the pinned
AndroidX revision `225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`. This remains a
T13 conformance repair, not T25 or a new component task.

- Constrain the public `thumbIcon` slot to the sourced 16×16px icon geometry
  and center its direct artwork inside the 24px icon-bearing thumb. Adapt the
  library's own `Icon` component and ordinary direct SVG/image artwork without
  requiring consumers to compensate manually.
- Correct every resting and pressed inline thumb inset for the CSS containing
  block created by the track's 2px border, so the thumb's outer-box offsets
  match the pinned `ThumbNode.measure` coordinates in LTR and RTL.
- Preserve the sourced 52×32px track, 16/24/28px handle sizes, 40px state
  layer, checked/disabled colors, pressed snap/release motion, native checkbox
  and switch semantics, forms, SSR, hydration, reduced motion, and forced
  colors.

### Expected files

- `src/v1/components/Switch/Switch.css`; `Switch.tsx` only if CSS cannot fully
  adapt the existing slot structure.
- Focused Switch CSS/behavior tests under `tests/v1/components/Switch/`.
- T13 conformance record and component documentation, ADR 0013, architecture
  text, and `docs/v1/component-inventory.json` review/update.
- The existing playground example only if the repaired component contract is
  not sufficient to size its default `Icon` correctly.

### Acceptance checks

- Icon-bearing checked and unchecked thumbs remain 24×24px, while a direct v1
  `Icon`, SVG, or image resolves to a centered 16×16px artwork box with 4px of
  space on each side.
- In LTR, resting outer-box thumb starts resolve to 8px without content, 4px
  with content, and 24px when checked; pressed starts resolve to 2px unchecked
  and 22px checked. Logical placement mirrors in RTL.
- State-layer centering, state colors, disabled behavior, forced colors, and
  press/release/reduced-motion behavior remain unchanged.
- Focused source/CSS tests pass. Per owner direction, browser automation and
  screenshots are omitted; owner performs visual confirmation before the
  required aggregate verification marks the repair complete.
