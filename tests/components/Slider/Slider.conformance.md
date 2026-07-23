# Slider conformance

Status: conformant
Task: T39

## Pinned sources

- AndroidX revision:
  `225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`.
- `Slider.kt`: 3,876 lines, blob
  `49ae732acecdaf0c62d6e3afe98c5fb2ced77377`.
- generated `SliderTokens.kt` v2_3_5: 75 lines, 51 declarations, blob
  `607a2e87f50827d26fd78cefc7cc8c380cb5d18a`.
- `SliderTest.kt`: 1,667 lines, 55 `@Test` cases, blob
  `4565310203edabcefeb84a5eee0ab5648575fdf9`.
- `SliderScreenshotTest.kt`: 845 lines, 50 cases, blob
  `a63ff58deece394abf598768aef86480f4fafba4`.

`Slider.source.test.ts` freezes all four identities, every named test, the
generated-role partition, source surface, observable internals, and anomalies.

## Public source-surface disposition

| Pinned source entry | Web disposition |
| --- | --- |
| `Slider(value, basic defaults)` | `Slider` controlled props with default visuals |
| `Slider(value, custom thumb/track)` | Same component with passive visual slots |
| `Slider(state)` | Controlled/uncontrolled props plus shared resolved-state path |
| `VerticalSlider(state, topToBottom)` | `Slider orientation="vertical"` and `topToBottom` |
| Three `RangeSlider` overloads | One `RangeSlider` controlled/uncontrolled API |
| `rememberSliderState` | React uncontrolled state and native form reset |
| `rememberRangeSliderState` | React uncontrolled ordered-pair state and reset |
| `SliderDefaults` | Stable default DOM/CSS renderer and registered tokens |
| Two `colors` overloads | Default tokens and scoped provider overrides |
| Horizontal and `isVertical` `Thumb` | Orientation-aware authored handle |
| Two current single `Track` overloads | Ordinary orientation-aware track; external corner fixed by source geometry |
| `CenteredTrack` | `centered` single-slider state |
| Two current range `Track` overloads | Range segmentation and shared authored track |
| `drawStopIndicator` | Default stop element plus `renderStopIndicator` |
| `TrackStopIndicatorSize` / `TickSize` | 4px stop and tick tokens |
| `SliderColors` | Provider-level color tokens and CSS resolution |
| `SliderState` | Shared normalized single-value state and behavior helpers |
| `RangeSliderState` | Shared normalized, ordered, non-crossing range state |

The source object plus overloads/values/classes produce 25 unique current
entries in the executable ledger.

Five deprecated entries add no observable variant:

- `VerticalSliderLegacy(reverseDirection)` maps algebraically to
  `topToBottom={!reverseDirection}`;
- deprecated `Thumb(SliderState)` delegates to the current `isVertical`
  overload;
- deprecated `Track(SliderPositions)` is the pre-state drawing path;
- hidden legacy `Track(RangeSliderState)` delegates to the current overload;
- `SliderPositions` exists only for that deprecated track.

They are recorded, not re-exported as React compatibility APIs.

## Generated token ledger

The generated file declares 51 roles. `Slider.kt` literally reads 15:

`ActiveHandleLeadingSpace`, `ActiveTrackColor`,
`DisabledActiveTrackColor`, `DisabledActiveTrackOpacity`,
`DisabledHandleColor`, `DisabledHandleOpacity`,
`DisabledInactiveTrackColor`, `DisabledInactiveTrackOpacity`, `HandleColor`,
`HandleHeight`, `HandleShape`, `HandleWidth`, `InactiveTrackColor`,
`InactiveTrackHeight`, and `StopIndicatorSize`.

The other 36 names are explicitly unread. In particular:

- the whole track uses `InactiveTrackHeight`; generated
  `ActiveTrackHeight` is not a second height;
- both sides use `ActiveHandleLeadingSpace`; the same-valued trailing role is
  unread;
- focus, hover, and pressed color names are not read by `SliderColors`;
- generated interaction widths are unread. `ThumbContent` derives 2px by
  halving the 4px handle during focus, press, or drag;
- stop indicators use active-track color rather than generated stop-color
  names;
- value-indicator names are unused because this source implements no value
  indicator.

Direct source and web-platform values are identified separately: 48px minimum
target, 8px external corner (half of the 16px track), 2px inside corner, 4px
inset-focus padding, and the focus ring.

## Values, gestures, and completion

- `min`/`max` default to `0…1`. Invalid runtime ranges normalize safely with a
  development warning. Values clamp into the resolved range.
- `steps` counts interior values, producing `steps + 1` equal intervals.
  Negative/non-integer runtime values warn and normalize to continuous.
- Tick snapping uses first-minimum selection: an exact midpoint resolves to
  the lower tick, matching `minByOrNull`. The source semantics action is a
  deliberate exception: its low-to-high `<=` loop retains the later, upper
  tick on an exact tie, so native accessibility changes do the same.
- Controlled values remain prop-owned. Uncontrolled defaults initialize once,
  matching remembered source state, and form reset restores them.
- Pointer down emits visual press but does not jump. After 8 CSS pixels of
  same-axis movement it becomes a drag; the consumed slop stays subtracted
  from its value. Release without movement commits the original press
  coordinate, even after sub-slop drift. Orthogonal movement cancels the tap
  so native page scrolling can continue; if the browser does not cancel the
  pointer, a later same-axis move can still begin the source's axis-specific
  drag without jumping.
- Pointer cancellation after an active drag finishes once; cancellation before
  a drag does not.
- Every pointer mapping leaves half the 4px handle inside either root edge.
  Zero-size rectangles resolve without division failure.
- `onValueChangeFinished` runs after tap/drag, handled key release, and changed
  native accessibility input. It does not store state.
- Disabled controls ignore every library gesture/key path and native inputs
  remain disabled.

For ranges, nearest absolute offset selects the active thumb. Unequal distance
selects the closer one. On a tie, pointer value below raw start selects start;
otherwise end. The selected thumb clamps against the other and cannot cross.
Both values can coincide. Range drag and tap follow the same RTL transform as
layout.

## Keyboard and semantics

- Inputs are native `<input type="range" role="slider">` elements.
- Continuous arrows use `(max - min) / 100`; stepped arrows use one interval.
- Page keys multiply the interval by `clamp(floor(actualSteps / 10), 1, 10)`.
- Home/End use the semantic thumb's current lower/upper bounds.
- Horizontal Left/Right applies RTL reversal. Page Up/Down intentionally does
  not, preserving the pinned asymmetry.
- Vertical Up/Down and Page keys apply the `topToBottom` sign.
- Key release—not each repeat—fires completion.
- Single accessible min/max/now state is fixed to the overall range. Range
  start max equals current end; range end min equals current start.
- The source's state description rounds to two decimals and keeps `.0` for
  integers; default `aria-valuetext` mirrors it and remains overridable for
  localized units.

Single naming uses normal native wrapping labels, `for` labels, `aria-label`,
or `aria-labelledby`. Range requires localized `startAriaLabel` and
`endAriaLabel`; an optional root label names the group. Both range inputs are
independent tab stops. Disabled inputs leave sequential focus.

## Geometry and rendering

- Horizontal roots are full-inline-size with a 48×48px minimum target.
  Vertical roots default to 48×200px with a 48px minimum.
- The visual horizontal handle is 4×44px; vertical is 44×4px.
- Track thickness is 16px. External corners are 8px; thumb-facing corners are
  2px. CSS radius scaling handles constrained segments without overflowing.
- Base handle-edge-to-track space is 6px. Focus adds 4px only to the
  corresponding gap. Track/handle anchor insets stay unchanged, preserving
  source focus-position invariance. Centered tracks use the source's virtual
  zero-width center handle, so their center gap is 6px (10px focused), while
  the real thumb gap is 8px (12px focused).
- Continuous positions span the complete track. Discrete interior positions
  use `corner + fraction × (track - 2 × corner)`; discrete endpoints remain at
  complete bounds.
- Ordinary single active track runs from logical start to thumb. Centered
  active track runs center-to-thumb. Range active track runs start-to-end.
- A normal single slider draws only the far inactive stop. Centered/range
  tracks draw each existing inactive outer stop. Endpoint ticks disappear
  whenever stop rendering is enabled.
- Tick colors follow whether their centers lie in the active segment. Ticks on
  a thumb or within either physical thumb/center gap disappear. Directional
  CSS masks apply the pixel gaps after percentage/corner projection; the
  real-browser audit verifies those masks because jsdom cannot measure them.
- End-thumb DOM order retains the source's overlap painting order.

Custom thumb, track artwork, tick, and stop slots are descendants of one
`aria-hidden` track. A supplied renderer may render nothing. CSS suppresses
pointer events for all custom descendants so a visually supplied button cannot
become a nested interaction.

## Colors, themes, forced colors, and SSR

- Enabled handle/active track are primary; inactive track is secondary
  container.
- Enabled active ticks use inactive-track color and inactive ticks use
  active-track color.
- Disabled handle mixes 38% on-surface over surface, matching source
  precomposition. Disabled tracks retain 38% active and 12% inactive alpha.
  Disabled tick roles remain crossed.
- Stop indicators resolve through active-track color in every state.
- Light/dark, custom, and nested token scopes flow through normal provider
  custom properties with no runtime style injection.
- Focus-visible draws a secondary ring with an explicit forced-color
  Highlight result. Disabled forced colors use GrayText; inactive track
  boundaries retain CanvasText.
- No sourced visual motion exists for track/handle state changes. Reduced
  motion therefore remains immediate.
- Server markup is deterministic and hydration changes no DOM or stylesheet.

## Source anomalies preserved or explicitly bounded

The ledger records 13 anomalies, including ignored hover interaction in
`ThumbContent`, crossed tick roles, mixed disabled compositing, unread generated
state roles, active-track-colored stops, the custom range-corner alignment-line
mismatch, the unused gesture-end Boolean, two KDoc mistakes, ignored upstream
recomposition test, and RTL Page-key asymmetry.

The custom range-corner mismatch is not reachable because the passive web
track slot does not expose an arbitrary geometry-changing corner parameter.
The ignored upstream recomposition test is classified rather than claimed as
passing Android's unresolved regression. All other observable anomalies above
are directly retained and tested.

## Web-specific adaptations

- Compose state/Saver/Modifier/interaction-source/Canvas/DrawScope/alignment-
  line mechanisms are not public React objects.
- A transparent native input cannot simultaneously supply a consistent custom
  Material track and two-thumb behavior, so the visual root owns pointer
  translation while inputs retain semantic, form, keyboard, focus, and
  assistive-technology responsibilities.
- `Slider` folds vertical into an orientation prop; `RangeSlider` remains
  separate and horizontal.
- Per-instance `SliderColors` becomes scoped provider tokens.
- Android bitmap goldens are not redistributed. CSS/token tests and the real
  Chromium rendering audit verify equivalent geometry and states.
