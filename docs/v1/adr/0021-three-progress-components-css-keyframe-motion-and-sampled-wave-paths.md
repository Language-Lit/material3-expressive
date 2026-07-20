# ADR 0021: Three progress components matching the spec's own naming, CSS-`@keyframes`-driven motion, and numerically pre-sampled wave/curve paths

Status: accepted
Date: 2026-07-20
Task: T21

## Context

The pinned AndroidX revision (`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`,
still the branch's current HEAD since T17–T20) implements progress
indicators across two files: `ProgressIndicator.kt` (`LinearProgressIndicator`/
`CircularProgressIndicator`, the plain treatment) and
`WavyProgressIndicator.kt` (`LinearWavyProgressIndicator`/
`CircularWavyProgressIndicator`, the Material 3 Expressive traveling-wave
treatment, backed by `internal/LinearWavyProgressModifiers.kt`/
`CircularWavyProgressModifiers.kt`). Every animated value in both files —
indeterminate head/tail fractions, circular global/additional rotation and
sweep pulse, the wavy indicator's continuous wave-offset scroll, the
amplitude ramp — is driven by `tokens/MotionTokens.kt`'s fixed millisecond
durations and named cubic-bezier easings, not the app-level
`MotionSchemeKeyTokens` spring system prior v1 components' own spatial
transitions use.

`docs/V1_SPEC.md` §9 lists three components under "Feedback and overlays":
`LinearProgress`, `CircularProgress`, `WavyProgress` (plus `LoadingIndicator`,
T22). `docs/v1/component-inventory.json` already carried matching
`"planned"` placeholder rows for all three, each with its own `path`/
`publicExports`. Every one of T01–T20's delivered component names has
matched §9's list exactly.

This task's implementation began by building two components —
`LinearProgressIndicator`/`CircularProgressIndicator`, each with a
`variant: 'plain' | 'wavy'` prop — reading "linear, circular, and wavy" in
the T21 task-table row as a description of required *behavior*, not a
literal three-component split. Mid-task, re-reading the inventory
placeholders and `V1_SPEC.md` §9 directly (rather than only the task-table
row) surfaced the explicit three-name list. Since every prior task treated
§9 as the authoritative naming source, this task's components were
restructured to match before completion, discarding the `variant`-prop
design in favor of three components. This ADR documents the final,
restructured design; the two-component draft is mentioned here only as
the reason the restructuring happened, not as a design this project ships.

## Decision

1. **Three components, matching `V1_SPEC.md` §9 and the inventory
   placeholders exactly**: `LinearProgress`/`CircularProgress` cover only
   `ProgressIndicator.kt`'s plain composables. `WavyProgress` covers
   `WavyProgressIndicator.kt`'s wavy composables for *both* orientations
   through a `shape: 'linear' | 'circular'` prop (default `'linear'`) — the
   source itself already groups both orientations' wavy treatment into one
   file, distinct from the plain file's own linear/circular split;
   `WavyProgress` mirrors that grouping rather than inventing a fourth
   linear-wavy/circular-wavy split the source doesn't have. None of the
   three expose per-instance `color`/`trackColor`/`strokeWidth` props —
   colors and geometry come from CSS custom properties like every other v1
   component.
2. **Determinate/indeterminate contract mirrors native `<progress>`, not a
   separate boolean flag**: on all three components, `value` present (a
   number in `[0, max]`) renders determinate (`aria-valuenow` set); `value`
   omitted renders indeterminate (`aria-valuenow` omitted — the APG
   progressbar pattern's own documented indeterminate technique, and
   exactly how a native `<progress>` element without a `value` attribute
   already behaves). None of the three use the native `<progress>` element
   itself — its rendering can't be restyled into an arc or a sine wave in
   any browser — but its determinate/indeterminate *contract* is the
   correct one to mirror.
3. **CSS `@keyframes`-driven motion, no `requestAnimationFrame` loop
   anywhere**: since every source animation value already has a fixed
   millisecond duration and a named cubic-bezier easing
   (`tokens/MotionTokens.kt`), all of it ports directly to CSS
   `@keyframes` with per-keyframe-stop `animation-timing-function` (CSS
   supports this natively, matching Compose's own per-segment `using X`
   easing). These are the first three v1 components to use CSS
   `@keyframes` at all — every prior component's motion was a `transition`
   on a discrete state change. The sourced durations/easings are
   registered as each component's own string-kind tokens rather than
   reused from `--m3e-sys-motion-*`: they are fixed Material-spec
   constants intrinsic to each component's established motion identity,
   not a generic spatial transition a consumer's theme-level motion
   scheme should be able to retune. Determinate value-change transitions,
   by contrast, *are* ordinary discrete state changes, so they reuse
   `--m3e-sys-motion-expressive-default-spatial-*` directly.
4. **`LinearProgress`'s indeterminate two-bar motion is numerically
   pre-sampled, not hand-derived**: the source's `firstLineHead`/
   `firstLineTail`/`secondLineHead`/`secondLineTail` are four independently
   delayed/eased `0..1` curves (`EasingEmphasizedAccelerateCubicBezier`,
   `1750ms` cycle); each visible bar's position/size is the *difference* of
   two of these curves. A CSS keyframe segment can only interpolate with
   one easing curve per segment, and the difference of two independently
   timed eased curves is not itself expressible as a short, hand-written
   easing. This project generated the exact resulting curve numerically
   (evaluating the true cubic-bezier at 21 evenly spaced points across the
   cycle) and baked the result into dense, `linear`-interpolated keyframe
   stops — a standard technique for complex CSS animations, and the only
   practical way to reach full visual fidelity without `@property`
   (unsupported on this project's own minimum-supported Firefox 121;
   `@property` shipped in Firefox 128) or a JS animation loop.
5. **`LinearProgress`'s `inline-size` defaults to `100%`, not the source's
   fixed `240dp` sample default**: a web progress bar is overwhelmingly
   used full-width (matching `<progress>`'s own default block-level
   rendering); the source's fixed width is a mobile-sample convenience,
   not a hard constraint. `CircularProgress` keeps the source's own fixed
   intrinsic size (`40px`) unchanged — a circular indicator is used as a
   small, fixed-size spinner in real web usage too, so no
   width-flexibility deviation is needed there. `WavyProgress` follows the
   same split per shape (`'linear'` responsive, `'circular'` fixed
   `48px`).
6. **`CircularProgress`/`WavyProgress`'s determinate sweep uses
   `stroke-dasharray`/`stroke-dashoffset` with an explicit
   `pathLength={100}`** — the same technique `Checkbox`'s T11 check-draw
   animation established for a one-shot `transition`, extended here to a
   looping `@keyframes`. `pathLength={100}` makes every sweep value a
   plain 0–100 "percent of this path" number, SVG's own native
   normalization, rather than a value this project would otherwise have
   to compute from each path's true geometric length (materially
   different between a plain circle and a rippling wave path of the same
   nominal diameter).
7. **Circular indeterminate composes three independently animated nested
   groups**, matching the source's three composed `animateFloat` values
   exactly: a continuous global rotation (`1080deg`/`6000ms` linear), a
   stepped additional rotation (`90/180/270/360deg` with hold segments,
   `EasingEmphasizedDecelerateCubicBezier`), and a sweep pulse
   (`0.1→0.87→0.1`, `EasingStandardCubicBezier` then linear). Three
   separate CSS animations on nested elements compose additively — the
   direct web equivalent of Compose summing three independent
   `animateFloat` values, needing no custom easing math to merge them into
   one animation. `circularIndeterminateTrackColor` is `Transparent` in
   the pinned source (unlike the linear indicator's own indeterminate
   track, which stays visible); `CircularProgress`/`WavyProgress` render
   no track element at all in indeterminate mode, the more direct
   translation of "invisible" than an explicit transparent element.
8. **`WavyProgress`'s wave geometry is pre-rendered and numerically
   sampled, not computed live at render time**: `wavePaths.ts` samples
   `y = sin(2*PI*x / wavelength)` (linear, 8 points/cycle across a fixed,
   documented `2400px` span) and `r(theta) = radius + sin(waveCount *
   theta)` in polar coordinates (circular, 12 points/cycle around a full
   closed loop, `waveCount = round(circumference / wavelength)` computed
   once since the ring's size is fixed) into static SVG `<path>` `d`
   strings, animated purely via CSS `transform` (`translateX`/`rotate`)
   loops of exactly one wavelength per `wavelength/waveSpeed` — always
   `1000ms` since the source's own default `waveSpeed` equals `wavelength`.
   No `requestAnimationFrame` loop, no per-frame JS path regeneration.
   The circular ripple is a sine-perturbation-of-radius approximation of
   the source's actual `androidx.graphics.shapes` `RoundedPolygon`-morph
   implementation, whose exact pixel-amplitude formula was not practical
   to port; visually equivalent at this component's subtle, low amplitude.
9. **Amplitude ramp**: `WavyProgress` reproduces
   `WavyProgressIndicatorDefaults.indicatorAmplitude`'s exact thresholds
   (`progress <= 0.1` or `>= 0.95` → zero amplitude). `shape="linear"`
   applies a literal `scaleY` transition — a direct, faithful translation,
   since the source computes linear amplitude in px as a literal fraction
   of the container's half-height (confirmed from
   `LinearProgressDrawingCache`'s own `y = (1f - amplitude) * halfHeight`).
   `shape="circular"` instead cross-fades opacity between a flat circle
   and the wave path: a ring's *radial* amplitude has no equivalent simple
   CSS transform the way a horizontal wave's *vertical* amplitude does, so
   this project substitutes a documented, visually equivalent technique
   rather than attempting per-frame path regeneration. Both shapes use one
   symmetric transition easing (`MotionTokens.DurationLong2`/
   `EasingStandardCubicBezier`) instead of the source's direction-dependent
   `Increasing`/`DecreasingAmplitudeAnimationSpec` pair — a deliberate,
   minor, documented scope cut.
10. **Track renders as a straight (non-wavy) line in `WavyProgress`, both
    shapes** — a deliberate, documented simplification: the source's track
    can itself carry a subordinate wave that continuously reshapes around
    a moving gap, and replicating that exactly (a second independently
    phased wave path, re-clipped every frame around a moving gap) is
    disproportionate complexity for a segment that is already low-contrast
    `secondaryContainer` against the primary wave.
11. **No carved gap in any indeterminate track** (`LinearProgress`,
    `WavyProgress` `shape="linear"`): the track renders as one continuous
    full-width bar under the two moving indicator segments, rather than
    three dynamically-computed gapped segments matching the source's own
    per-frame gap carving. This matches how other production
    Material-inspired web implementations already render indeterminate
    linear progress, not a fabrication.
12. **No RTL-specific CSS anywhere in any of the three components**: every
    positioning value (`inset-inline-start`, `inline-size`) already uses
    logical properties, which the browser mirrors automatically under
    `dir="rtl"` with zero extra CSS — unlike `NavigationDrawer`'s slide
    animation (T20), which needed an explicit RTL-safe `inset-inline-start`
    keyframe target precisely because it was animating a physical
    direction. The wave's own `translateX` travel direction and the
    circular sweep's rotation direction are left unflipped under RTL — a
    cosmetic ripple/rotation direction carries no directional meaning, and
    the pinned source itself has no RTL handling for circular progress at
    all (confirmed: no `layoutDirection` branch anywhere in
    `CircularProgressIndicator`'s composables, unlike the linear
    composables' explicit LTR/RTL branch).
13. Three new components (rather than the originally planned two) plus the
    pre-sampled wave path data (`~21KB` raw across two `wavePaths.ts`
    files, before minification/gzip) pushed six of nine measured
    artifacts past their T19-set ceilings, several of the rest already
    down to single-digit headroom — the same threshold prior tasks
    (T13/T15/T17/T19) used to justify a proportional raise across every
    ceiling rather than only the breached ones. All nine ceilings were
    raised ~12% above this task's own measured output, following that
    same established methodology; wave-path sample density (8 points/cycle
    linear, 12/cycle circular) and the fixed `2400px` linear span were
    already kept moderate specifically to limit this raise's size, not
    left unbounded and corrected after the fact.

## Consequences

- A future component whose motion is a fixed, continuous, Material-spec
  loop (not a themeable spatial transition) should follow the same
  "component-owned string-kind duration/easing tokens, CSS `@keyframes`,
  no `requestAnimationFrame`" pattern these three establish, rather than
  reaching for the spring-based `MotionScheme` or a JS animation loop.
- The "numerically pre-sample a curve that can't be expressed as a single
  CSS easing, bake it into dense keyframe stops" technique (`LinearProgress`
  §4) is now precedented for any future component whose visible motion is
  the composition/difference of multiple independently timed source
  curves — reach for this before reaching for `@property` (blocked by this
  project's own Firefox 121 floor) or a JS loop.
- `WavyProgress`'s `shape` prop, grouping two orientations' treatment of
  the *same* visual concept behind one component, is now precedented for
  any future component whose pinned source similarly groups multiple
  orientations/forms in one file — distinct from `NavigationDrawer`'s own
  variant-prop precedent (T20), which unified three *lifecycle* composables
  of the *same* orientation, not two orientations of the same treatment.
- This task's mid-implementation restructuring is a reminder to check
  `V1_SPEC.md` §9 and the `component-inventory.json` placeholder rows
  directly before finalizing a component's public shape, not only the
  task-table's one-line behavior summary — the placeholders exist
  precisely to carry this kind of naming decision forward from the
  project's initial scaffolding.
