# WavyProgress conformance

Task: T21
Status: conformant
Reviewed: 2026-07-20

## Primary references

- Material Design progress indicators component guide, accessed 2026-07-20:
  <https://m3.material.io/components/progress-indicators/overview>
- Pinned current AndroidX `WavyProgressIndicator.kt`, accessed 2026-07-20:
  <https://android.googlesource.com/platform/frameworks/support/+/225f50d42bf0adeb2abf4b6109befb5ab6ce4efc/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/WavyProgressIndicator.kt>
- Pinned `internal/LinearWavyProgressModifiers.kt`/
  `CircularWavyProgressModifiers.kt`, accessed 2026-07-20:
  <https://android.googlesource.com/platform/frameworks/support/+/225f50d42bf0adeb2abf4b6109befb5ab6ce4efc/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/internal/LinearWavyProgressModifiers.kt>
- Pinned generated AndroidX `ProgressIndicatorTokens`/
  `LinearProgressIndicatorTokens`/`CircularProgressIndicatorTokens`/
  `tokens/MotionTokens.kt`, accessed 2026-07-20 (see `LinearProgress`/
  `CircularProgress` conformance for direct links).
- WAI-ARIA APG meter/progressbar guidance, accessed 2026-07-20:
  <https://www.w3.org/WAI/ARIA/apg/patterns/meter/>

Supported Material baseline: AndroidX Material 3 branch revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`.

## Anatomy and content

- One public component: `shape: 'linear' | 'circular'` (default
  `'linear'`) selects the orientation; `value`/`max` determine determinate
  progress, omitting `value` renders indeterminate. `aria-label`/
  `aria-labelledby` provide the required accessible name.
- The source itself groups both orientations' wavy treatment into one file
  (`WavyProgressIndicator.kt`, `LinearWavyProgressIndicator`/
  `CircularWavyProgressIndicator`), distinct from the plain file's own
  linear/circular split (`ProgressIndicator.kt`) — this component mirrors
  that grouping with a `shape` prop rather than two separate components.

## Variants, shape, color, and size

- `'linear'`: `10px` container height (`WaveHeight`, taller than
  `LinearProgress`'s `4px` to leave room for the wave), `40px`/`20px`
  determinate/indeterminate wavelength (`ActiveWaveWavelength`/
  `IndeterminateActiveWaveWavelength`), responsive `inline-size: 100%`
  (see `LinearProgress`'s own deviation note — the same reasoning applies).
- `'circular'`: `48px` fixed diameter (`WaveSize`, larger than
  `CircularProgress`'s plain `40px` `Size`), `15px` wavelength for both
  determinate and indeterminate (one token, unlike the linear shape's two).
- Both: `primary`-tinted indicator, `secondaryContainer` track (straight,
  not wavy, in both shapes — see Web-specific deviations), `4px` stroke
  width.

## States and motion

- Wave travel: a continuous `translateX` (linear) / `rotate` (circular)
  loop of exactly one wavelength per `wavelength / waveSpeed` — always
  `1000ms` since `waveSpeed` defaults to `wavelength` in the source,
  running continuously regardless of determinate/indeterminate mode.
- Amplitude ramp: `WavyProgressIndicatorDefaults.indicatorAmplitude` zeroes
  the wave near `progress <= 0.1` or `>= 0.95` in determinate mode (always
  full amplitude when indeterminate, matching the source's own fixed
  `amplitude: Float = 1f` default there). `'linear'` scales the wave
  vertically via `scaleY` — a direct, faithful translation, since the
  source computes amplitude in px as a literal fraction of the container's
  half-height. `'circular'` cross-fades opacity between a flat circle and
  the wave path instead (see Web-specific deviations).
- Indeterminate `'linear'` reuses `LinearProgress`'s exact pre-sampled
  head/tail keyframes for the visible clip window, layering the
  wave-travel animation on top. Indeterminate `'circular'` reuses
  `CircularProgress`'s exact three-layer rotation/sweep composition,
  adding a fourth continuous rotation for the traveling ripple.

## Accessibility

- `role="progressbar"` with `aria-valuemin="0"`/`aria-valuemax`/
  `aria-valuenow` (determinate) or no `aria-valuenow` at all
  (indeterminate), identical contract to `LinearProgress`/
  `CircularProgress`.
- No interactive semantics: the indicator is not focusable and has no
  keyboard model, matching the source.

## Web-specific deviations

- **`shape` prop instead of a fourth component**: the source's own file
  split (plain vs. wavy, each internally split by orientation) is the
  precedent this component follows, rather than one component per
  orientation × treatment combination.
- **Pre-rendered, sampled wave paths, not a literal sine/`RoundedPolygon`
  computation at render time**: `wavePaths.ts` generates the linear sine
  wave and the circular ripple ring by numerically sampling the target
  curve into an SVG `<path>` `d` string ahead of time (`8`/`12` points per
  cycle), animated purely via CSS `transform`, not `requestAnimationFrame`.
  The circular ripple is a sine-perturbation-of-radius approximation, not
  the source's actual `androidx.graphics.shapes` `RoundedPolygon` morph —
  the exact polygon-morph pixel-amplitude formula was not practical to
  port; this project's approximation is visually equivalent for a subtle,
  low-amplitude ripple.
- **Linear wave path pre-rendered to a fixed, generous 2400px width**, not
  computed per actual rendered width — comfortably covers realistic
  layout widths; a bar stretched wider than that would see the wave
  pattern clip at the far edge, a documented, extremely unlikely edge case
  for an ultra-wide viewport.
- **Circular amplitude ramp uses an opacity cross-fade between a flat
  circle and the wave path**, not a literal radial-amplitude animation —
  a ring's radial amplitude has no equivalent simple CSS transform (unlike
  the linear shape's straightforward vertical `scaleY`), so this project
  substitutes a documented, visually equivalent technique.
- **Track renders as a straight (non-wavy) line in both shapes**, even
  though the source's own track can carry a subordinate wave that
  continuously reshapes around a moving gap — a deliberate, documented
  simplification: replicating that exactly is disproportionate complexity
  for a segment that is already low-contrast `secondaryContainer` against
  the primary wave.
- **One symmetric amplitude-transition easing**, not the source's
  direction-dependent `Increasing`/`DecreasingAmplitudeAnimationSpec` pair
  — a deliberate, minor, documented scope cut.
- This is one of three sibling components (`LinearProgress`,
  `CircularProgress`, `WavyProgress`) matching `V1_SPEC.md` §9's own
  three-item naming — see ADR 0021 for the full rationale, including why
  an earlier two-component-plus-`variant` draft was restructured to match
  the spec's explicit naming before this task completed.
