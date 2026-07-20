# Active v1 task

## T20 — Navigation bar and rail indicator geometry repair

Status: active
Repair approved: 2026-07-20

### Scope

Correct the existing T20 `NavigationBar` and `NavigationRail` item animation
against the pinned AndroidX revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`. This remains a T20 conformance
repair, not T25 or a new component task.

- Keep every navigation icon in its sourced 24px box in selected and
  unselected states, including when alternate selected artwork is supplied.
- Animate only the active indicator background from zero width to the sourced
  56×32px pill. Do not scale the indicator wrapper, icon, or item footprint.
- Keep the full-size pill as the hover, focus, press, and ripple/state-layer
  target independently of the selected background's width animation.
- Apply the same correction to bar and rail while preserving their public APIs,
  labels, colors, disabled behavior, native navigation semantics, RTL,
  reduced-motion and forced-colors behavior, SSR, and hydration.

### Expected files

- `src/v1/components/NavigationBar/NavigationBar.css` and
  `src/v1/components/NavigationRail/NavigationRail.css`.
- Focused CSS tests under `tests/v1/components/NavigationBar/` and
  `tests/v1/components/NavigationRail/`.
- T20 conformance records and component documentation, ADR 0020, architecture
  text, and `docs/v1/component-inventory.json` review/update.
- No TSX, public type, token, or playground change unless the CSS-only repair
  proves insufficient.

### Acceptance checks

- Selected and unselected icon wrappers remain exactly 24×24px; switching
  selection never scales an icon or changes the navigation item's footprint.
- The active background alone expands horizontally from zero to 56px while
  remaining 32px high and centered behind the icon in both bar and rail.
- The independent 56×32px state layer retains hover, focus, press, reduced
  motion, forced-colors, and disabled behavior.
- Focused source/CSS tests pass. Per owner direction, browser automation and
  screenshots are omitted; owner performs visual confirmation before the
  required aggregate verification marks the repair complete.
