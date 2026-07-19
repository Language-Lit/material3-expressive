# v1 token provenance

Access date: 2026-07-19

The default token set is a web adaptation of current first-party Material data.
Every source is pinned to a repository revision so regeneration does not drift
when an upstream `latest` directory changes.

## Material Web 34.0.21

Primary revision: `b4de401eb665ec63474f39319a4ba8f2145974cc`

- Reference palette: [palette values](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/tokens/versions/latest/sass/_md-ref-palette-values.scss)
- Light scheme: [light system colors](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/tokens/versions/latest/sass/_md-sys-color-light-values.scss)
- Dark scheme: [dark system colors](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/tokens/versions/latest/sass/_md-sys-color-dark-values.scss)
- Typeface references: [typeface values](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/tokens/versions/latest/sass/_md-ref-typeface-values.scss)
- Typography: [baseline type scale](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/tokens/versions/latest/sass/_md-sys-typescale-values.scss) and [emphasized type scale](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/tokens/versions/latest/sass/_md-sys-typescale-emphasized-values.scss)
- Shape: [shape values](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/tokens/versions/latest/sass/_md-sys-shape-values.scss)
- Elevation: [elevation values](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/tokens/versions/latest/sass/_md-sys-elevation-values.scss) and [web shadow projection](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/tokens/internal/_elevation.scss)
- State: [state values](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/tokens/versions/latest/sass/_md-sys-state-values.scss)

The current Material Web color files take precedence for this web library where
platform generations differ. In particular, the current light scheme uses tone
30 for `onPrimaryContainer`, `onSecondaryContainer`, and
`onTertiaryContainer`; older Android-generated schemes use tone 10.

Material's generated font sizes and line heights are converted from pixels to
`rem` using the browser's 16px default. The reference families retain Roboto
first and add the generic `sans-serif` fallback required for a resilient web
font stack. Variable-font axes remain typed metadata for capable consumers.

The current AndroidX `Typography` API was rechecked for T05 on 2026-07-19. It
exposes emphasized counterparts for all 15 baseline display, headline, title,
body, and label roles. `Text` consumes both complete scales and maps all nine
modeled axes to CSS `font-variation-settings`; it does not approximate the
Expressive scale with an application-defined bold style.

## AndroidX Material 3

Primary revision: `0be207d91046b7376beeef5544d331a02d6fa87c`

- Motion API and slot meanings: [MotionScheme.kt](https://android.googlesource.com/platform/frameworks/support/+/0be207d91046b7376beeef5544d331a02d6fa87c/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MotionScheme.kt)
- Expressive spring values: [ExpressiveMotionTokens.kt](https://android.googlesource.com/platform/frameworks/support/+/0be207d91046b7376beeef5544d331a02d6fa87c/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt)
- Standard spring values: [StandardMotionTokens.kt](https://android.googlesource.com/platform/frameworks/support/+/0be207d91046b7376beeef5544d331a02d6fa87c/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/StandardMotionTokens.kt)
- Tonal elevation behavior: [ColorScheme.kt](https://android.googlesource.com/platform/frameworks/support/+/0be207d91046b7376beeef5544d331a02d6fa87c/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ColorScheme.kt)

Motion is represented by the same standard/expressive, fast/default/slow, and
spatial/effects slots as AndroidX. T02 initially preserved only spring
parameters. T07 adds the first required web motion adapter at token serialization:
every spring deterministically emits a unit-mass settlement duration at a 0.001
threshold and a ten-sample CSS `linear()` curve. The source damping ratio and
stiffness remain canonical, and custom themes regenerate scoped derived values.
ADR 0007 records this projection; it adds no browser or React dependency to the
token layer.

Tonal surface-container roles are the preferred web elevation colors. The
AndroidX tonal overlay formula remains represented for custom schemes and later
theme services; it does not replace the sourced default surface-container roles.

## Web accessibility adaptations

- Required default text-role contrast is 4.5:1, following [WCAG 2.2 Success Criterion 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum).
- Material's 48dp minimum interactive target is represented as 48 CSS pixels at
  the component-token boundary, following the [Material 3 minimum interactive component size API](https://developer.android.com/reference/kotlin/androidx/compose/material3/package-summary#minimumInteractiveComponentSize()).

## Component tokens

The registry grows only as each component task reaches conformance. `Surface`
is the first registration and cites the pinned AndroidX `Surface.kt` revision.
Its defaults map the passive surface container, content color, rectangular
shape, and zero tonal/shadow elevations to existing system tokens. Explicit
Surface variants continue to resolve through system color, shape, and elevation
roles so custom themes remain authoritative.

`Text` deliberately adds no component-token registration. AndroidX Text reads a
selected theme `TextStyle` and inherited content color, so the web adaptation
maps directly to existing `sys.typography` and CSS color inheritance. Font
loading remains consumer-owned and is not token-generation behavior.

`Icon` registers its 24px default from current Android Compose icon guidance and
its Material Symbols web defaults from Google's current guide. The glyph adapter
models outlined, rounded, and sharp font-family hooks plus `FILL` 0, `wght` 400,
`GRAD` 0, `opsz` 24, and `ROND` 50. The current guide documents the adjustable
ranges and now includes `ROND` in its variable-font requests; T06 carries that
Expressive axis even though the guide's introductory copy still describes the
four original symbol axes. Font files, subsetting, and network delivery remain
consumer-owned. SVG sources consume only Icon size and inherited `currentColor`.

`Button` registers current AndroidX Material 3 revision
`dd849e200f5046c2f2ca904e821fc9d42cbd0256`. The five generated size token files
supply visual heights 32/40/56/96/136px, padding, icon metrics, outline widths,
and size-aware resting/pressed corner roles. Filled, filled-tonal, elevated,
outlined, and text generated tokens supply enabled/disabled color roles,
opacities, and elevation. The source Button implementation supplies the 58px
minimum width, label type selection, content-padding corrections, and its
intentional no-bounce default-effects shape spring. Round CSS radii are exact
half-heights so the sourced pill geometry interpolates rather than transitioning
from an arbitrary 9999px value. The web root consumes the existing 48px density
target independently from the visual height.

`IconButton` registers current AndroidX Material 3 revision
`f0793303999c933a40c10d79212e0580d21bdc68`. `IconButtonDefaults.kt`, the four
variant token files, and the five generated size token files supply standard,
filled, filled-tonal, and outlined action/toggle roles; heights
32/40/56/96/136px; narrow/uniform/wide widths; icons 20/24/24/32/40px;
outlines 1/1/1/2/3px; and round, square, pressed, and selected corner pairs.
The implementation source confirms a 48px target and intentionally selects
default-effects motion for corner morphs. Exact half-height CSS radii represent
`CornerFull`, allowing the selected round/square inversion to interpolate. The
web adaptation uses the recommended vibrant system roles where Compose also
offers inherited-local-content overloads, and uses `aria-pressed` for native
toggle-button semantics.

`FloatingActionButton` registers current AndroidX Material 3 revision
`b0ef6d36c141931a051272e39ad3f4783dcb28e0`. `FabBaselineTokens`,
`FabMediumTokens`, `FabLargeTokens`, their extended counterparts, and the
current implementations supply 56/80/96px containers; 24/28/36px icons;
16/20/28px corners; size-aware label type and spacing; primary-container color;
and Level 3/4 normal plus Level 1/2 lowered elevation. The 36px large icon and
12/16px medium/large icon-label gaps follow explicit source corrections while
the generated token files retain upstream TODO values. The paired toggle FAB
source supplies its 56px final container, 28px corner, 20px icon,
primary/on-primary selected colors, logical top-end alignment, and
fast-spatial progress. The web API keeps its native button name stable and uses
`aria-pressed` rather than importing menu semantics before T24.

`Card` registers current AndroidX Material 3 revision
`0be207d91046b7376beeef5544d331a02d6fa87c`. `Card.kt` plus generated
`FilledCardTokens` and `ElevatedCardTokens` v0_210 and `OutlinedCardTokens`
v0_192 supply the medium corner; surface-container-highest, surface-container-low,
and surface containers; on-surface content; outline-variant/on-surface borders;
disabled composition; and Levels 0/1/2 state elevations. The source also
contains dragged Levels 3/4/3, but T10 owns no drag operation and makes no
dragged-state claim. Current first-party Card has no separate Expressive size or
shape overload, so the web component preserves current geometry and consumes
the shared Expressive effects motion projection for interactive state changes.

`Checkbox` registers current AndroidX Material 3 branch revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`, `Checkbox.kt` blob
`a8cb1c1edcbb50bcb4fe82dc2051b9656ee173a7`, and generated `CheckboxTokens` blob
`90342356e6b7aa7571f15fb895c29900db75749b` at `VERSION: 14_1_0`. They supply the
18px container, 2px corner, 2px outline and checkmark stroke, 40px state layer,
primary/on-primary checked roles, on-surface-variant unchecked outline, surface
disabled checkmark, and the 0.38 disabled opacities. The two opacity constants
`SelectedDisabledContainerOpacity` and `UnselectedDisabledContainerOpacity` are
equal but remain separate tokens because the source reads them under different
names. The three transparent roles are `Color.Transparent` literals upstream and
stay CSS `transparent` rather than becoming unthemed variables.

Geometry follows the token-backed path that the source selects when
`ComposeMaterial3Flags.isCheckboxStylingFixEnabled` is enabled; AndroidX still
ships that flag disabled, retaining a 20dp box inside 2dp padding under the open
`TODO(b/188529841)`. The checkmark coordinates are the sourced normalized
polyline and its `checkCenterGravitationShiftFraction` endpoints. Two roles are
deliberate web additions: the unchecked state layer uses the unselected outline
role because the sourced `indicatorColor` returns a transparent color that cannot
show hover, focus, or pressed feedback, and the focus ring uses the generated but
upstream-unread `FocusIndicatorColor` secondary role because visible focus is
required. The sourced springs need no substitution because Expressive default
spatial 0.8/380, default effects 1.0/1600, and fast effects 1.0/3800 already
match this library's scheme.

`Radio` registers the same AndroidX Material 3 branch revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`, `RadioButton.kt` blob
`02bdd9c675137bb277e454b21ffec58fc4ff6dfb`, and generated `RadioButtonTokens`
blob `9c3d1a69f1dada4962d9f3f68a40a36f26824683` at `VERSION: v0_117`. They
supply the 20px container, 2px ring stroke, 10px drawn dot diameter, 40px
state layer, and primary/on-surface-variant selected/unselected roles. The
source paints the ring and dot from one shared `radioColor` value, so Radio
registers one icon-color role per state instead of separate ring/dot roles.
`DisabledSelectedIconOpacity` and `DisabledUnselectedIconOpacity` are both
0.38 but remain separate tokens because the source reads them under different
names, matching the Checkbox precedent for its own equal-but-distinct
opacities.

Two roles are deliberate web additions, both following Checkbox precedent:
the state layer uses the same-state icon-color role because the pinned
`ripple()` call carries no explicit per-state color, and the focus ring uses
the secondary role because `RadioButtonTokens` defines no focus-indicator
token at all. The sourced `MotionSchemeKeyTokens.FastSpatial` dot animation
and `DefaultEffects` color animation need no substitution for the same reason
as Checkbox's springs.
