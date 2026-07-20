# Active v1 task

## T21 — Progress indicator geometry and motion repair

Status: active
Approved: 2026-07-20
Follow-up approved: 2026-07-20

### Scope

Repair the existing T21 `CircularProgress` and `WavyProgress`
implementations against the pinned AndroidX revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`. This is a T21 conformance
repair, not T25 and not a new component task.

- Rotate the plain and wavy circular animation layers around the fixed SVG
  view-box center. Do not derive a transform origin from each animated
  group's changing painted/fill bounds.
- Match the pinned circular gap and endpoint behavior, including the round-cap
  allowance, without zero-length active or track dashes painting stray dots at
  0% or 100%. Preserve the wavy circular indicator's visible indeterminate
  track rather than inheriting the plain indicator's transparent-track rule.
- Replace the clipped linear wavy polyline with the pinned source's smooth
  quadratic wave geometry. Its maximum centerline amplitude must reserve half
  the 4px stroke inside the 10px container.
- Replace the circular sine/polyline approximation with a stroke-safe rounded
  nine-point polygon derived from the pinned `RoundedPolygon.circle`/
  `RoundedPolygon.star` geometry, including the circle-to-wave amplitude
  transition used by determinate progress.
- Preserve the existing public APIs, token-driven colors and dimensions,
  determinate/indeterminate semantics, logical RTL behavior, forced colors,
  reduced-motion fallback, SSR, hydration, and additive v1 boundary.

### Expected files

- `src/v1/components/CircularProgress/CircularProgress.tsx` and
  `CircularProgress.css`.
- `src/v1/components/WavyProgress/WavyProgress.tsx`, `WavyProgress.css`, and
  `wavePaths.ts`; its token provenance only if the repaired geometry exposes an
  inaccurate existing claim.
- Focused CircularProgress/WavyProgress behavior and CSS tests under
  `tests/v1/components/`.
- T21 conformance records and component documentation, ADR 0021, architecture
  text, and `docs/v1/component-inventory.json` review/update.
- Existing playground examples already expose every affected fraction and
  indeterminate mode; change them only if the repair needs a missing state.

### Acceptance checks

- Plain circular indeterminate motion stays centered in its 40px SVG at every
  sampled phase; both nested rotation origins resolve to the fixed 20px
  view-box center rather than a changing painted-content box.
- Circular determinate active and track arcs use the pinned round-cap-aware gap
  math and render no zero-length cap artifact at 0% or 100%.
- Linear wavy progress renders a smooth quadratic traveling wave whose complete
  4px stroke remains inside the 10px container in determinate and
  indeterminate modes, with no clipped crests or troughs.
- Circular wavy progress renders the sourced rounded nine-point treatment
  inside its 48px SVG, stays centered during wave travel and indeterminate
  rotation, and transitions between a circle and the wave at the sourced
  amplitude thresholds without clipping or opacity substitution. Its visible
  indeterminate circle track follows the animated sweep and adaptive gap.
- Focused component tests and one browser computed-geometry/motion probe pass.
  After owner visual confirmation, `npm run verify:v1` passes before this task
  is marked complete.
