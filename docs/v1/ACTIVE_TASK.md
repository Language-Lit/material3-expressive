# Active v1 task

## T22 — Expressive loading indicator

Status: complete
Approved: 2026-07-20
Completed: 2026-07-20

### Scope

One component, sourced from the pinned AndroidX revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`: `LoadingIndicator`, matching
`docs/V1_SPEC.md` §9's "Feedback and overlays" list and the matching
`docs/v1/component-inventory.json` placeholder row.

- Covers only the pinned source's **uncontained** `LoadingIndicator`
  composables (`progress`-driven determinate and autonomous indeterminate).
  `ContainedLoadingIndicator` (a colored-container variant) is out of
  scope — `V1_SPEC.md` §9 names only `LoadingIndicator`, and every prior
  T01–T21 component has matched §9's names exactly.
- **Determinate/indeterminate contract mirrors every other v1 progress
  component**: `value` present (`[0, max]`) renders determinate
  (`aria-valuenow` set); `value` omitted renders indeterminate.
- **The defining feature of this component is real `RoundedPolygon` shape
  morphing** (`androidx.graphics.shapes`), not a simplified approximation.
  Unlike T21's `WavyProgress`, which substituted a documented technique
  (opacity cross-fade) for the source's `RoundedPolygon`-morph radial
  amplitude because that ramp was a secondary polish detail, morphing here
  *is* the component's entire identity — a substitution would fail the
  task. The full geometry engine (`RoundedPolygon` vertex/corner-rounding
  construction, `Cubic` bezier math, and `Morph`'s curve-matching algorithm
  that pairs cubics between two differently-shaped polygons) was ported
  faithfully to an offline Python script from the pinned source's
  `graphics/graphics-shapes` module (`RoundedPolygon.kt`, `Cubic.kt`,
  `Features.kt`, `PolygonMeasure.kt`, `FeatureMapping.kt`, `Morph.kt`,
  `Point.kt`, `Utils.kt`, `Shapes.kt`, `CornerRounding.kt`) plus
  `MaterialShapes.kt`'s exact vertex/rounding data for the eight needed
  named shapes (`Circle`, `SoftBurst`, `Cookie9Sided`, `Pentagon`, `Pill`,
  `Sunny`, `Cookie4Sided`, `Oval`). Every shape was visually verified
  against the known Material 3 Expressive shape gallery before use. See
  ADR 0022 for the full port, verification, and CSS-authoring methodology.
- **Determinate** (`Circle`→`SoftBurst`, one morph): the matched
  `(startCubic, endCubic)` pairs `Morph.match()` produces are baked as a
  static numeric array (`loadingIndicatorMorphs.ts`), and the component
  performs the same plain per-coordinate `lerp` `Morph.forEachCubic` does
  every frame, directly from the continuous `value` prop, building the SVG
  `d` string at render time — no `requestAnimationFrame`, since it's a
  synchronous function of props like every other determinate progress
  component. `transform: rotate(-progress*180deg)` matches the source's
  counterclockwise determinate rotation exactly. A CSS `transition` handles
  smooth `d`/`transform` changes on value updates.
- **Indeterminate** (7-shape circular loop, 650ms per shape): CSS cannot
  animate the SVG `d` property through a sequence of *structurally
  different* paths in one continuous `@keyframes` rule (the segment count
  differs per shape pair). The technique: seven stacked `<path>` elements,
  each owning one shape-pair's `@keyframes` (spanning the full 4550ms loop,
  holding flat outside its own 650ms slot, hard-cut via `opacity`), so the
  browser only ever interpolates between two *structurally identical*
  `d` values per rule — always valid. Each rule's own \[0%, spring-settle%\]
  segment uses `animation-timing-function: linear(...)`, a spring-shaped
  easing sampled with the exact same technique `src/v1/tokens/css.ts`
  already uses for the shared `--m3e-sys-motion-expressive-*` spring
  tokens, applied here to the source's own morph spring
  (`dampingRatio=0.6, stiffness=200, visibilityThreshold=0.1`, settling in
  298ms of each 650ms). Because `linear()` easing warps *when* progress
  advances rather than pre-sampling the path data itself, only the two
  path endpoints need to ship (not many intermediate samples), and the
  spring's characteristic slight overshoot-and-settle is reproduced exactly
  by the eased value legitimately exceeding 1 mid-segment — matching the
  source's own documented use of out-of-range progress for "bounce or
  overshoot" effects, not an approximation.
- **Rotation composition**: each segment's own per-slot rotation (a step
  base of `(index+1)*90deg`, `+90deg` warped by the same per-segment
  spring) is baked directly into that segment's own `transform` keyframe
  stops. The continuous global rotation (`4666ms`/`360deg`, linear,
  infinite) is a separate, always-on rotation on an outer wrapping `<g>`,
  composed additively — the same nested-`<g>` technique
  `CircularProgress`/`WavyProgress` already use for their own indeterminate
  rotation layers.
- **No per-frame `path.getBounds()` re-centering**: the source recomputes
  and re-centers the interpolated path's own bounding box every frame.
  Measured offline, this recentering never drifts more than ~0.6% of the
  container size across any sampled morph — sub-pixel at this component's
  40–48px scale — so this project bakes one static scale+recenter
  transform per shape set (matching `calculateScaleFactor` ×
  `ActiveIndicatorScale`) directly into the precomputed coordinates
  instead, a documented, verified-negligible simplification.
- Reduced motion: determinate loses its value-change `transition`;
  indeterminate freezes on a static (non-mid-morph) shape — the first
  segment's own start shape, matching every other progress component's
  "static state communicates activity without motion" precedent, not
  whatever frame the animation happened to be on.
- No per-instance `color` prop — colors come from CSS custom properties
  like every other v1 component.

### Expected files

- `src/v1/components/LoadingIndicator/`, its public barrel, and sourced
  component-token defaults.
- Behavior, interaction, accessibility, theme, CSS, SSR, type-contract, and
  conformance evidence under `tests/v1/`.
- A mirrored playground example, playground usage, and packed Vite/Next
  fixture coverage.
- Documentation, one ADR (covering the full geometry-engine port and the
  CSS `linear()`-easing indeterminate technique in detail),
  `component-inventory.json` update (filling in the existing `"planned"`
  placeholder row), and a `TOKEN_PROVENANCE.md` entry.
- An explicit bundle-budget update if justified by measured output (the
  precomputed morph data is expected to push several artifacts near or
  past their T21 ceilings).

### Acceptance checks

- Determinate mode: `value`/`max` render an accurate `aria-valuenow`, and
  the visual shape matches the `Circle`→`SoftBurst` morph fraction exactly;
  changing `value` transitions smoothly, including near `0` and `1`.
- Indeterminate mode loops continuously through all seven shapes with no
  `aria-valuenow` present, announced as busy/indeterminate to assistive
  technology, and with no visual double-exposure/ghosting between segments
  at any point in the cycle (verified both by direct opacity inspection
  and full-cycle screenshots).
- Forced colors keep the shape visibly distinct from the page. All motion
  (indeterminate loop, determinate value transitions) becomes immediate
  under reduced motion, landing on a clean static shape.
- Rendering and hydration remain deterministic and inject no styles; the
  component is a pure function of props, so SSR/pre-hydration markup
  matches the first client frame exactly with zero delta.
- Forced colors, reduced motion, default/custom/nested theme, CSS
  resolution, documentation, source provenance, playground example, public
  exports, production fixtures, and inventory are covered and agree.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures,
  CSS checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
