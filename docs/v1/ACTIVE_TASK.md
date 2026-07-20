# Active v1 task

## T21 — Progress indicators

Status: complete
Approved: 2026-07-20
Completed: 2026-07-20

### Scope

Three components sourced from the pinned AndroidX revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`: `LinearProgress`,
`CircularProgress`, and `WavyProgress` — matching `docs/V1_SPEC.md` §9's
own three-item component list under "Feedback and overlays" and the
matching `docs/v1/component-inventory.json` placeholder rows, all of which
name these as three independent components, not one component pair with a
`variant` prop. (An earlier draft of this task built two components —
`LinearProgressIndicator`/`CircularProgressIndicator` — with `variant:
'plain' | 'wavy'`; that draft was restructured to match the spec's
explicit naming before this task completed, since every prior T01–T20
component has matched §9's names exactly. See ADR 0021.)

- `LinearProgress`/`CircularProgress` cover only the source's plain
  (non-wavy) `ProgressIndicator.kt` composables. `WavyProgress` covers the
  separate `WavyProgressIndicator.kt` file's `LinearWavyProgressIndicator`/
  `CircularWavyProgressIndicator` composables through one component with a
  `shape: 'linear' | 'circular'` prop (default `'linear'`) — the source
  itself already groups both orientations' wavy treatment into one file,
  distinct from the plain file's own linear/circular split; `WavyProgress`
  mirrors that grouping.
- **Determinate/indeterminate contract mirrors native `<progress>`, not a
  separate boolean flag**: `value` present (a number in `[0, max]`) renders
  determinate (`aria-valuenow` set); `value` omitted renders indeterminate
  (`aria-valuenow` omitted, matching the APG progressbar pattern's own
  indeterminate guidance and exactly how a native `<progress>` element
  without a `value` attribute already behaves). `max` defaults to `1`,
  matching the source's `0f..1f` fraction. None of the three components use
  the native `<progress>` element itself — its rendering can't be restyled
  into an arc or a sine wave in any browser — but its determinate/
  indeterminate *contract* is the correct one to mirror (`role="progressbar"`
  on a `div` is APG's own documented technique for exactly this case).
- **SVG-based rendering (wavy only)/CSS-based rendering (plain), CSS-driven
  motion, no `requestAnimationFrame` loop anywhere**: every one of the
  source's `infiniteRepeatable`/`keyframes` animations (linear
  indeterminate head/tail fractions, circular indeterminate global +
  additional rotation and progress sweep, the wavy indicator's continuous
  wave-offset scroll) has fixed, sourced millisecond durations and named
  cubic-bezier easings (`MotionTokens.kt`), not the theme's
  user-configurable spring-based `MotionScheme` — so all of it ports
  directly to CSS `@keyframes` with literal `animation-timing-function`
  per-keyframe-stop (CSS supports this natively, matching Compose's own
  per-segment `using X` easing). These are the first three v1 components to
  use CSS `@keyframes` at all (every prior component's motion was a
  `transition` on a state change); the sourced durations/easings are
  registered as each component's own string-kind tokens, not reused from
  `--m3e-sys-motion-*`, since they are fixed Material-spec constants
  intrinsic to each component's established motion identity, not a generic
  spatial transition a consumer's motion scheme should be able to retune.
- **`LinearProgress`**: plain `div`s (track, one or two indicator segments,
  an end-of-track stop dot in determinate mode) positioned with percentage
  `inline-size`/`inset-inline-start` — no SVG needed for a straight bar.
  `inline-size` defaults to `100%` (responsive), not the source's fixed
  `240dp` sample default — a web progress bar is overwhelmingly used
  full-width (matching `<progress>`'s own default block-level rendering).
  Indeterminate mode reuses the exact two-segment head/tail keyframes
  (`1750ms` cycle, `250`/`650`/`900ms` per-line delays,
  `EasingEmphasizedAccelerateCubicBezier`), pre-sampled numerically into
  dense keyframe stops (a CSS keyframe segment can only interpolate with
  one easing curve, and these two bars are each the *difference* of two
  independently timed eased curves).
- **`CircularProgress`**: fixed intrinsic size (`40px`, matching the
  source's own fixed `Size` token — a circular indicator is used as a
  small, fixed-size spinner in real web usage too, so no width-flexibility
  deviation is needed here, unlike the linear bar). Plain determinate/
  indeterminate render as a `<circle>` driven by `stroke-dasharray`/
  `stroke-dashoffset` (the same technique `Checkbox`'s T11 check-draw
  animation already established for this project, extended here from a
  one-shot `transition` to a looping `@keyframes`). Indeterminate composes
  three independently animated nested groups exactly matching the source's
  three composed `animateFloat` values: a continuous global rotation
  (`1080deg`/`6000ms` linear), an additional stepped rotation (keyframed
  `90/180/270/360deg` with hold segments, `EasingEmphasizedDecelerateCubicBezier`),
  and a sweep pulse (`0.1→0.87→0.1`, `EasingStandardCubicBezier` then
  linear) — three separate CSS `transform`/`stroke-dashoffset` animations
  on nested elements compose additively, the same way Compose sums three
  independent `animateFloat` values. `circularIndeterminateTrackColor` is
  `Transparent` in the pinned source (unlike the linear indicator's own
  indeterminate track, which stays visible) — no track element renders at
  all in indeterminate mode, rather than an explicit transparent one.
- **`WavyProgress`**: `shape="linear"` reuses `LinearProgress`'s clip/
  gap/stop layout, replacing the flat fill with a pre-rendered, fixed-pixel-
  width sine-wave `<path>` (many repeated cycles, generously covering
  realistic viewport widths — a documented scope limit, see ADR 0021),
  revealed by a percentage-width clip and animated by a `translateX`
  `@keyframes` loop of exactly one `wavelength` per `wavelength/waveSpeed`
  (`1s` by default, matching the source's own default). `shape="circular"`
  pre-renders one full ring's worth of wave path with an integer wave
  count (`round(circumference / wavelength)`, computed once since the
  ring's size is fixed, never measured at runtime), sweep-revealed with the
  same dasharray/dashoffset math `CircularProgress` uses, with an added
  continuous rotation for the traveling ripple, composed with the same
  three-layer indeterminate rotation/sweep system `CircularProgress` uses.
  The track segment renders as a straight (non-wavy) line in both shapes —
  a deliberate, documented simplification: the source's track can itself
  carry a subordinate wave that continuously reshapes around a moving gap,
  and replicating that exactly is disproportionate complexity for a
  segment that is already low-contrast `secondaryContainer` against the
  primary wave.
- **Amplitude ramp** (`WavyProgress` only): scales toward zero near
  `progress <= 0.1` or `>= 0.95` (exact sourced thresholds from
  `WavyProgressIndicatorDefaults.indicatorAmplitude`), using the source's
  `DurationLong2` (`500ms`) with `EasingStandardCubicBezier` for both the
  increase and decrease direction — the source uses two distinct easings
  depending on direction; this project uses one symmetric easing for both,
  a deliberate, minor, documented scope cut. `shape="linear"` achieves the
  ramp via a literal `scaleY` transition (amplitude maps directly to a
  vertical scale of the wave path). `shape="circular"` cross-fades opacity
  between a flat circle and the wave path instead — a circular ring's
  radial amplitude has no equivalent simple CSS transform, so this project
  substitutes an opacity cross-fade as a documented technique substitution,
  not a literal radial-amplitude animation.
- None of the three components expose a per-instance `color`/`trackColor`/
  `strokeWidth` prop — colors and geometry come from CSS custom properties
  like every other v1 component, not JS props, matching the project's
  established "tokens over props" convention.

### Expected files

- `src/v1/components/LinearProgress/`, `CircularProgress/`,
  `WavyProgress/`, their public barrels, and sourced component-token
  defaults for all three.
- Behavior, interaction, accessibility, theme, CSS, SSR, type-contract, and
  conformance evidence under `tests/v1/` for all three.
- Mirrored playground examples, playground usage, and packed Vite/Next
  fixture coverage.
- Documentation for all three, one ADR, `component-inventory.json` updates
  (filling in the three existing `"planned"` placeholder rows), and
  `TOKEN_PROVENANCE.md` entries.
- An explicit bundle-budget update only if justified by measured output.

### Acceptance checks

- Determinate mode: `value`/`max` render an accurate `aria-valuenow`/
  `aria-valuemin`/`aria-valuemax`, and the visual fill matches the
  fraction; changing `value` transitions smoothly. Indeterminate mode
  (`value` omitted) loops continuously with no `aria-valuenow` present and
  is announced as busy/indeterminate to assistive technology.
- `WavyProgress` renders a visible traveling sine wave (`shape="linear"`)
  or ring ripple (`shape="circular"`) in both determinate and indeterminate
  modes; amplitude visibly ramps down near 0% and 100% progress in
  determinate mode.
- Forced colors keep indicator, track, and stop dot visibly distinct from
  the page and from each other. RTL mirrors the linear bar's fill direction
  correctly (logical properties only, no explicit RTL CSS needed); the
  circular sweep's start point does not flip under RTL, matching the
  pinned source's own lack of RTL handling for circular progress. All
  animations (indeterminate loops, wave travel, amplitude ramp, determinate
  value transitions) become immediate under reduced motion.
- Rendering and hydration remain deterministic and inject no styles; all
  three components are pure functions of props (no client-only measurement
  effect), so SSR/pre-hydration markup matches the first client frame
  exactly with zero delta — unlike `Tabs`/`NavigationSuite`'s documented
  pre-measurement defaults, this task's components need none.
- Forced colors, RTL, reduced motion, default/custom/nested theme, CSS
  resolution, documentation, source provenance, playground examples,
  public exports, production fixtures, and inventory are covered and agree
  for all three components.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures,
  CSS checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
