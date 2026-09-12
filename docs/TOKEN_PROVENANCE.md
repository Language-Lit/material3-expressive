# Token provenance

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

`Switch` registers the same AndroidX Material 3 branch revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`, `Switch.kt` blob
`15dbb283ad8b99ca2aac1b665a02e2f3ebce6293`, and generated `SwitchTokens` blob
`e73c33330cdd86a2c0cfeec04d2cd12d4e01da64` at `VERSION: v0_210`. They supply
the 52×32px track, 2px outline, 16/24/28px unselected/selected/pressed handle
sizes, 40px state layer, 16px icon size, primary/on-primary/on-primary-container
selected roles, and surface-container-highest/outline/surface-container-highest
unselected roles. `SwitchTokens` also generates Hover/Focus/Pressed-suffixed
handle, track, and icon color roles that `SwitchColors`/`defaultSwitchColors`
never read, so they are not registered, matching the unread-role precedent
from Checkbox and Radio. `DisabledTrackOpacity` (0.12) is one source constant
read by three different disabled roles — the disabled checked track, the
disabled unchecked track, and the disabled unchecked border — and is
registered once and reused rather than duplicated, unlike Checkbox's
distinctly-named equal opacities. `DisabledSelectedHandleOpacity` is a real
constant equal to 1.0, a functional no-op kept as a literal opaque color.

Two roles are deliberate web additions, following the same Checkbox/Radio
precedent: the state layer uses a primary/on-surface-variant identity pairing
because the pinned `ripple()` call carries no explicit per-state color, and
disabled colors use `color-mix(..., transparent)` instead of the source's
`compositeOver(colorScheme.surface)`, so they composite correctly against
whatever backdrop the control actually sits on. The sourced
`MotionSchemeKeyTokens.FastSpatial` thumb-shape animation and `DefaultEffects`
color animation need no substitution for the same reason as Checkbox's and
Radio's springs; the press-triggered `SnapSpec` is reproduced as a
zero-duration `transition-duration` scoped to `:active`.

`TextField`/`TextArea` register the same AndroidX Material 3 branch
revision `225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`, generated
`FilledTextFieldTokens` blob `431029bad8804cec683c3077744f8783ca0ced56` at
`VERSION: v0_210` and `OutlinedTextFieldTokens` blob
`13f1d6b644376e767ea30def343065ccc274f6ce` at `VERSION: v0_103`. Every
content color role — input, placeholder, label, leading icon, trailing
icon, and supporting text — is identical between the two token files, since
Kotlin has no shared-token-file mechanism and AndroidX simply repeats each
constant under both names; this registration keeps one unprefixed copy of
each instead of a duplicated pair, and registers the container fill/shape
and indicator/outline border per variant only where the source's values
genuinely differ (including the outlined border's own 0.12 disabled opacity
versus every other role's shared 0.38). Every `Hover*`-suffixed role in both
files is unread — `TextFieldColors`' accessors take only
`(enabled, isError, focused)`, with no fourth "hovered" axis anywhere in the
resolved color model — matching the unread-role precedent from Checkbox,
Radio, and Switch. `FilledTextFieldTokens.DisabledContainerColor`/
`DisabledContainerOpacity` are unread too:
`ColorScheme.defaultTextFieldColors()` resolves the filled container to the
same full-opacity `ContainerColor` in every state including disabled, so
this registration reproduces that actual behavior rather than the token
file's documented, unapplied dimmed value. `InputFont`/`LabelFont`/
`SupportingFont` and `LeadingIconSize`/`TrailingIconSize` are unread by name
for the same reason as Switch's geometry duplicates: typography is pulled
live from `MaterialTheme.typography.bodyLarge`/`.bodySmall`, so this port
references the theme's own baseline body-large/body-small typescale roles
directly in component CSS instead of re-registering them as component
tokens.

Unlike every prior selection control, disabled colors here are not a
deliberate web deviation: the pinned source itself resolves every disabled
text-field color as true alpha (`fromToken(...).copy(alpha = ...)`), not
`compositeOver(colorScheme.surface)`, so this registration's
`color-mix(..., transparent)` technique reproduces the pinned source's own
semantics exactly rather than correcting away from a baked-backdrop
assumption.

`SegmentedButtonGroup` registers the same AndroidX Material 3 branch
revision `225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`, `SegmentedButton.kt`
blob `295bc3889b25193473d4e4670b98c1d33aaa2663`, and generated
`OutlinedSegmentedButtonTokens` blob `2530ef60381d2ab54edb097c1a35dcc97d6c391c`
at `VERSION: v0_162`. `defaultSegmentedButtonColors()` reads the identical
`OutlineColor` constant for both the active and inactive border, and the
identical `DisabledLabelTextColor`/`DisabledLabelTextOpacity` pair for both
the disabled active and disabled inactive content color — not two
distinctly-named constants that happen to match, the exact same call both
times — so each is registered once here instead of as an active/inactive
pair, matching the T14 content-color consolidation precedent. The disabled
active container reuses the enabled `SelectedContainerColor` undimmed and
the disabled inactive container reuses the same `Color.Transparent` literal
the enabled inactive container already expresses directly in the
stylesheet: the token file defines no disabled container role at all, so a
disabled selected segment keeps its full tonal fill and no disabled
container token exists. Every `Hover*`/`Focus*`/`Pressed*`-suffixed role,
and even the base `SelectedIconColor`/`UnselectedIconColor`/
`DisabledIconColor`/`DisabledIconOpacity` roles, are unread:
`SegmentedButtonContent` never tints its `Icon` explicitly, so the icon
always inherits the same `LocalContentColor` the label text resolves from
the label-text tokens above — extending the unread-role precedent from
every prior selection control to roles the source defines but never
connects to any color-resolution path at all. `LabelTextFont` is unread by
name for the same reason as TextField's typography roles: it is pulled live
from the theme's own `label-large` typescale role directly in component
CSS. The pinned source applies no `minimumInteractiveComponentSize`-
equivalent modifier to `SegmentedButton`, unlike Checkbox/Radio/Switch, so
this registration carries no `minimum-interactive-target` token at all —
the 40px `ContainerHeight` is the real, undilated interactive height.

`Dialog` registers the same AndroidX Material 3 branch revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`, `DialogTokens.kt` blob
`ab467ec4329ecba62c406ad8355085abf20771a2` and `AlertDialog.kt` blob
`5448ca3a52fdf66709ff713b81ea7a4f3641e39e`, both at `VERSION: v0_210`. Every
`DialogTokens` color, shape, and elevation role that `AlertDialogContent`
actually reads is registered directly: `ContainerColor`, `ContainerShape`,
`ContainerElevation`, `IconColor`/`IconSize`, `HeadlineColor`,
`SupportingTextColor`, `ActionLabelTextColor`. `HeadlineFont`/
`SupportingTextFont`/`ActionLabelTextFont` are unread by name for the same
reason as every prior typography role in this library: they are pulled live
from the theme's own `headline-small`/`body-medium` typescale roles
directly in component CSS. `AlertDialogDefaults.dialogPadding`/`textPadding`
use the non-"precision pointer" branch (24px both), the same
provisional-Expressive exclusion basis already applied to every prior task
that hit a `shouldUsePrecisionPointerComponentSizing`-gated value.
`DialogMinWidth`/`DialogMaxWidth` (280dp/560dp, from `AlertDialog.kt`) are
registered as measured dimensions rather than `$ref`s, since they are not
theme-scoped system values in the source either. The pinned Compose source
defines no cross-platform Material3 scrim-opacity or viewport-margin value —
window dimming there is an Android platform default, and the 280/560px width
bounds have no accompanying viewport-margin or height-cap value of their
own — so both the 32% scrim opacity and the 24px viewport margin are
cross-validated against material-web's dialog CSS
(`github.com/material-components/material-web`, `dialog/internal/_dialog.scss`,
`.scrim { opacity: 32% }`, `max-width: min(560px, calc(100% - 48px))`)
instead — the same material-web source already cited above as this
project's foundation-token authority, here corroborating a component-level
value for the first time because the pinned Compose source has none of its
own for this role.

`Menu` registers the same AndroidX Material 3 branch revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`, `MenuTokens.kt` blob
`512d25472ad549b911ca61641e1b5fa87eded5dc` at `VERSION: v0_210`,
`ListTokens.kt` blob `9c1823f65873878d6b3e746cf0393522c0b980c2` at
`VERSION: 29.0.0`, and `StandardMenuTokens.kt` blob
`d4743d36238e15a38dc27f710889b24dd9fb2951` at `VERSION: 24.1.2`. Container
color/shape/elevation come from `MenuTokens` (`ContainerColor`
surfaceContainer, `ContainerShape` cornerExtraSmall, `ContainerElevation`
level2). Plain item color comes from `ListTokens` (`ItemLabelTextColor`
onSurface, `ItemLeadingIconColor`/`ItemTrailingIconColor` onSurfaceVariant,
disabled-0.38 pair) — the values `defaultMenuItemColors` actually reads for
the plain, non-selectable `DropdownMenuItemContent` this component ports,
not the separate Expressive per-item hover/press shape-morph roles
(`ItemHoveredContainerExpressiveShape`, etc.) that belong to the
out-of-scope grouped/segmented-menu rendering path. Checked-item color
comes from `StandardMenuTokens` (`ItemSelectedContainerColor`
tertiaryContainer, `ItemSelected*Color` onTertiaryContainer, disabled-0.38
pair) — the values `defaultMenuSelectableItemColors` actually reads, not
the unread `MenuTokens.ListItemSelectedContainerColor`/secondaryContainer
role the token file itself defines but no default color resolver ever
reaches. `MenuDefaults`' own constants supply the `112`/`280px`
`DropdownMenuItemDefaultMinWidth`/`MaxWidth`, `48px` menu-specific
`MenuListItemContainerHeight`, `12px` `DropdownMenuItemHorizontalPadding`,
and `8px` `DropdownMenuVerticalPadding`/`MenuHorizontalMargin` (the latter
reused as this component's viewport clamp margin on both axes — Android's
separate 48dp `MenuVerticalMargin` clears system status/navigation bars
with no web equivalent, so it is not ported as a second value).
`MenuItemColors`' own resolution takes only `(enabled, selected)` — no
hover/focus/pressed axis exists in the source's color model — so
hover/pressed feedback reuses the shared state-layer system every other
interactive component already applies; `MenuTokens.FocusIndicatorColor`
(secondary) is registered anyway for a visible keyboard-focus ring, the
same accessibility-driven registration Checkbox/Radio already made for an
upstream-unread role. Label typography reuses the theme's own
`label-large` typescale role directly, the same unread-typography-role
precedent every prior task established.

`Select` registers no component tokens of its own. Its field chrome reuses
`text-field`'s registration unchanged — the pinned `ExposedDropdownMenuBox`
composes a real `TextField`/`OutlinedTextField` and reads the same
`TextFieldColors`/`TextFieldTokens` with no distinct token file of its own —
and its popup listbox reuses `menu`'s registration unchanged, since
`ExposedDropdownMenuDefaults` itself resolves straight through to
`MenuDefaults.shape`/`containerColor`/`TonalElevation`/`ShadowElevation`,
the exact same values plain `DropdownMenu` uses. This extends the T14
TextField/TextArea one-shared-domain precedent to a third and fourth public
component.

`Tooltip` registers the same AndroidX Material 3 branch revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc` (still the branch's current HEAD
as of this task), `PlainTooltipTokens.kt` blob
`0a3aa15fe2d33a30f06e3697013c95a2bcb5cf89` and `RichTooltipTokens.kt` blob
`b327485a280348ed12ccd70384ae1e1fb7160064`, both at `VERSION: v0_210`.
Plain container color/shape/supporting-text color come from
`PlainTooltipTokens` (`ContainerColor` inverseSurface, `ContainerShape`
cornerExtraSmall, `SupportingTextColor` inverseOnSurface). Rich container
color/shape/elevation and subhead/supporting-text color come from
`RichTooltipTokens` (`ContainerColor` surfaceContainer, `ContainerShape`
cornerMedium, `ContainerElevation` level2, `SubheadColor`/
`SupportingTextColor` onSurfaceVariant) — `ActionLabelText*`/
`ActionFocusLabelTextColor`/`ActionHoverLabelTextColor`/
`ActionPressedLabelTextColor` are not registered, since the rich-tooltip
action button has no web port (`role="tooltip"` disallows interactive
content; see ADR 0018). Sizing/spacing constants (`TooltipMinWidth`/
`MinHeight`, `plainTooltipMaxWidth`/`richTooltipMaxWidth`,
`PlainTooltipContentPadding`, `RichTooltipHorizontalPadding`,
`SpacingBetweenTooltipAndAnchor`) come straight from `Tooltip.kt` itself,
since Compose treats them as plain layout constants rather than
`@Composable` color/shape roles — the same status they keep here.
`rich-padding-block`/`rich-subhead-gap` approximate the source's
baseline-relative padding constants as ordinary CSS block padding/margin, a
documented simplification. Typography reuses the theme's own
`body-small`/`title-small`/`body-medium` typescale roles directly.

`Snackbar` registers the same pinned revision, `SnackbarTokens.kt` blob
`45acfed8dae975007c068543cc3796d6b4556d40` at `VERSION: v0_103`. Container
color/elevation/shape come from `SnackbarTokens` (`ContainerColor`
inverseSurface, `ContainerElevation` level3, `ContainerShape`
cornerExtraSmall); supporting-text/action-label/dismiss-icon color are
`SupportingTextColor` (inverseOnSurface), `ActionLabelTextColor`
(inversePrimary), and `IconColor` (inverseOnSurface) — the pinned source's
public `Snackbar` composable has no separate leading status-icon slot, so
`IconColor`/`IconSize` belong to the dismiss action only. Action/icon
focus/hover/pressed colors all resolve to the same enabled role (confirmed
against material-web's `_md-comp-snackbar.scss` at the `material-web-tokens`
source's own pinned revision `b4de401eb665ec63474f39319a4ba8f2145974cc`, the
first time this project's cross-validation source corroborates a
component-level color role rather than a missing numeric value), so
hover/press feedback reuses the shared `--m3e-sys-state-*` system via
`currentColor`, the same `Menu`/`Select` precedent. `ContainerMaxWidth`,
`HorizontalSpacing`, `HorizontalSpacingButtonSide`, and
`SnackbarVerticalPadding` come straight from `Snackbar.kt` itself, the same
plain-layout-constant status Tooltip's own sizing constants have. No
viewport-offset token is registered: the pinned source leaves screen-edge
placement to a consuming `Scaffold`, and material-web ships no snackbar
implementation to cross-validate against either, so the bottom offset is a
plain CSS value, not a claimed-sourced token — the same status Menu's own
`z-index: 1000` already has.

`Tabs` registers the same pinned revision, `PrimaryNavigationTabTokens.kt`
blob `3a7cc1b6e3dc512162a43ef08275f8afa6433a23` at `VERSION: v0_162` and
`SecondaryNavigationTabTokens.kt` blob
`a19ea9bf5a359ba8a81b67cdaac79f378b6d0749`, also `VERSION: v0_162`.
Indicator color/height/shape and the `'primary'`-only content-hugging
width come from `PrimaryNavigationTabTokens` (`ActiveIndicatorColor`
primary, `ActiveIndicatorHeight` 3dp, `ActiveIndicatorShape`
`RoundedCornerShape(3dp)`) plus the `24dp` default width parameter
`TabRowDefaults.PrimaryIndicator` itself defines (not a token-file value).
`SecondaryNavigationTabTokens` defines no indicator fields of its own — the
pinned source's own `TabRowDefaults.SecondaryIndicator` reads
`PrimaryNavigationTabTokens.ActiveIndicatorColor`/`ActiveIndicatorHeight`
directly — so `'secondary'` reuses the same `indicator-color`/
`indicator-height` pair rather than a duplicate value under a second name.
Active/inactive label and icon color come from each token file's own
`Active*Color`/`Inactive*Color` pair (`primary`/`onSurfaceVariant` for
`'primary'`; plain `onSurface`/`onSurfaceVariant` for `'secondary'` —
deliberately more subdued, not brand-colored). `divider-color`/
`divider-height` mirror `DividerTokens.Color`/`Thickness` (outlineVariant,
1dp), because every `divider` parameter in the pinned `TabRow.kt` —
`PrimaryTabRow`, `SecondaryTabRow`, both scrollable variants, and the
deprecated overloads — defaults to `@Composable { HorizontalDivider() }`.
`SecondaryNavigationTabTokens.DividerColor`/`DividerHeight` (surfaceVariant,
1dp) are generated but never read; `TabRow.kt` reads only `ContainerColor`
and `ActiveLabelTextColor` from that object. T19 registered the unread pair
because no `Divider` component existed to trace the generic composable to.
T42 added one, so the ordinary "prefer the value the code actually reads"
rule now applies and the color moved from surfaceVariant to outlineVariant.
The pair stays under the `tabs` namespace rather than being deleted, so a
consumer can still restyle one tab row's rule — the web equivalent of the
source's per-call `divider` slot. `container-height` (48px,
`ContainerHeight`/`SmallTabHeight`) and `container-height-with-icon-and-
label` (72px, `LargeTabHeight`, the value `Tab.kt`'s own
`TabBaselineLayout` actually uses — not the token file's unread 64px
`IconAndLabelTextContainerHeight`) both come straight from `Tab.kt`/
`TabRow.kt`, the same plain-layout-constant status Tooltip's/Snackbar's own
sizing constants have; likewise `label-inline-padding` (16px,
`HorizontalTextPadding`) and the scrollable-variant `scrollable-min-tab-
width`/`scrollable-edge-padding` (90px/52px,
`ScrollableTabRowMinTabWidth`/`ScrollableTabRowEdgeStartPadding`).
`icon-label-gap` approximates the source's own baseline-relative stacked
layout as an ordinary flexbox gap, the same baseline-to-block-model
simplification already applied to Tooltip's rich-variant padding.
`disabled-label-color`/`disabled-icon-color` (both `onSurface` at `0.38`
opacity) have no source at all: `Tab`'s `enabled` param removes
interactivity only, with no distinct disabled color axis in the pinned
source's own `TabTransition` — this registers the same universal disabled
dimming every other interactive component already uses. Label
typography reuses the theme's own `title-small` typescale role directly
(`LabelTextFont`, unread by name for the same reason as every prior
component's typography roles).

`NavigationBar` registers the same pinned revision,
`NavigationBarTokens.kt` blob `352fe47c0f6d4a1cd90a3ae670cb45446adc5c5d`
and `NavigationBarVerticalItemTokens.kt` blob
`c901af76dc7832de7279cdb50d569951f2a50bf4`, both at `VERSION: v0_11_0`.
Container color/elevation/height come from `NavigationBarTokens`
(`ContainerColor` surfaceContainer, `ContainerElevation` level2,
`ContainerHeight` 64dp). Item pill geometry/color come from
`NavigationBarVerticalItemTokens` (`ActiveIndicatorWidth`/`Height`
56×32dp) and `NavigationBarTokens` (`ItemActiveIndicatorShape` cornerFull,
`ItemActiveIndicatorColor` secondaryContainer). Active icon tints
`onSecondaryContainer`; active **label** tints `secondary` — a genuine
sourced split (`ItemActiveIconColor` vs `ItemActiveLabelTextColor`), not a
simplification. Inactive icon/label both tint `onSurfaceVariant`. `4px`
icon-label gap (`ItemActiveIndicatorIconLabelSpace`), `24px` icon size,
`labelMedium` typography. `disabled-*` (onSurface at 0.38 opacity) has no
source — the pinned `enabled` param removes interactivity only.

`NavigationRail` registers the same pinned revision,
`NavigationRailColorTokens.kt` blob
`68a5be19f8abe4004509360421f597fd0a6f6e94`,
`NavigationRailVerticalItemTokens.kt` blob
`c398fc68e8c4cefc0ff1cf319fc3afccce1f344c`, and
`NavigationRailBaselineItemTokens.kt` blob
`7e5c0b335781c27a18351fe9633a9f255db07314`, all at `VERSION: v0_11_0`.
Reuses `NavigationBar`'s own item pill geometry/color and active/inactive
icon/label split unchanged. Container color/width come from
`NavigationRailColorTokens`/`NavigationRailCollapsedTokens`
(`ContainerColor` surface, `96px` `ContainerWidth`); `44px` top padding
(`TopSpace`), `4px` item gap (`ItemVerticalSpace`), and `80px` item width
(`NarrowContainerWidth`) also come from `NavigationRailCollapsedTokens`.
`8px` header-to-items gap (`NavigationRailHeaderPadding`) comes straight
from `NavigationRail.kt` itself, the same plain-layout-constant status
Tabs'/Tooltip's own sizing constants have.

`NavigationDrawer` registers the same pinned revision,
`NavigationDrawerTokens.kt` blob
`ce3cd3664365006164807d5c2c72be967d6d5cb6`. `ModalContainerColor`/
`ModalContainerElevation` (surfaceContainerLow, level1) apply to the
`'modal'` variant only; `StandardContainerColor`/`StandardContainerElevation`
(plain surface, level0) apply to both `'dismissible'` and `'permanent'` —
the source uses the same "standard" pair for both non-modal variants.
`360px` container width (`ContainerWidth`), `cornerLargeEnd` shape
(`ContainerShape`, `'modal'` only). Item: full-width `336×56px` pill
(`ActiveIndicatorWidth`/`Height`, `cornerFull`, `secondaryContainer`),
`onSecondaryContainer` for **both** icon and label when selected (unlike
`NavigationBar`/`NavigationRail`, which split icon/label color) —
`onSurfaceVariant` inactive, `labelLarge` typography (larger than
`NavigationBar`/`NavigationRail`'s `labelMedium`). `16px`/`24px`
asymmetric inline padding and `12px` icon-label gap come straight from
`NavigationDrawerItem`'s own `Modifier.padding(start=16dp, end=24dp)`/
`Spacer(width=12dp)` in `NavigationDrawer.kt`, not a token-file value;
`12px` item-list inline padding comes from `NavigationDrawerItemDefaults.
ItemPadding`. `FocusIndicatorColor` (secondary) is a deliberate web
addition for a visible keyboard-focus ring, the same accessibility-driven
registration Menu's own `item-focus-ring-color` already made.
`scrim-color`/`scrim-opacity` (0.32) reuse Dialog's own cross-validated
scrim value (ADR 0016) for the `'modal'` variant's backdrop, since the
pinned source's own modal scrim is an Android platform default, not a
component token. `disabled-*` has no source (no disabled color axis in
the source's `selected`-only color model), the same universal web-added
dimming every other interactive component already uses.

`NavigationSuite` registers no component tokens of its own — it composes
`NavigationBar`/`NavigationRail`/`NavigationDrawer` directly and reuses
whichever of their registrations applies to the currently active tier, the
same "reuses an existing domain entirely" precedent `Select` already set
for `text-field`/`menu`.

`LinearProgress`/`CircularProgress` register the same pinned revision,
`ProgressIndicator.kt` blob `656375f06afe964ca60ab4806a32a0bc15ff2edc`,
generated `ProgressIndicatorTokens.kt` blob
`eea770174ac30abd8faa16bc69817c44ffde55d0`, `LinearProgressIndicatorTokens
.kt` blob `8bbd505238de24cabdaa3baa24c48a4ae69de75b`, and
`CircularProgressIndicatorTokens.kt` blob
`1e3dd93e33e8b1bdba2cb924e1153f8159034f68`. `ProgressIndicatorTokens`
(`ActiveIndicatorColor`/`TrackColor`/shapes) is registered independently
by both components rather than through a third shared token file, the
same duplication-over-premature-extraction precedent `NavigationBar`/
`NavigationRail`'s own item visual language already used.
`LinearProgress`'s `stop-trailing-space` (`6px`) is `ProgressIndicator.kt`'s
own internal `StopIndicatorTrailingSpace` constant, not the *token* file's
own unread `StopTrailingSpace` (`0dp`) — the "prefer the value the code
actually uses over an unread token" rule. T21 cited `Tabs`' `divider-color`
as precedent for that rule, which was inaccurate: T19 had registered the
*unread* `SecondaryNavigationTabTokens.DividerColor` there. T42 corrected
`Tabs` to the value its source actually renders, so the two registrations
now genuinely agree. `LinearProgressIndicatorTokens
.ActiveWaveAmplitude`/`CircularProgressIndicatorTokens.ActiveWaveAmplitude`
are not registered by these two plain-only components at all — they exist
only for the wavy treatment, registered by `WavyProgress` instead.

`WavyProgress` registers the same pinned revision,
`WavyProgressIndicator.kt` blob `398ae0dd455d85705e0200e1a9cfc07f58d5802b`,
and generated `MotionTokens.kt` blob
`8658f45e4241274a22364a0c8b764ff09d59cad7` for its sourced cubic-bezier
easing/duration constants (`EasingLinearCubicBezier`/
`EasingStandardCubicBezier`/`EasingEmphasizedAccelerateCubicBezier`/
`EasingEmphasizedDecelerateCubicBezier`, `DurationLong2`). Registers its
own copy of `ProgressIndicatorTokens`/`LinearProgressIndicatorTokens`/
`CircularProgressIndicatorTokens` values independently of `LinearProgress`/
`CircularProgress`'s own copies, the same established duplication
precedent. `circular-amplitude` (`1.6dp`, `ActiveWaveAmplitude`) is
retained here for public token compatibility. The repaired circular ripple
does not treat it as a radial-sine offset: it uses the pinned
`CircularWavyProgressModifiers.kt` circle/star parameters, generated through
the faithful offline `androidx.graphics.shapes` `RoundedPolygon`/`Morph` port
established by T22. The linear centerline amplitude is instead derived from
the pinned container/stroke geometry: `(10px - 4px) / 2 = 3px`, keeping the
complete stroke in bounds. `amplitude-transition-easing` maps the source's
increasing `EasingStandardCubicBezier`; `amplitude-decreasing-transition-
easing` maps its decreasing `EasingEmphasizedAccelerateCubicBezier`, both
with `DurationLong2`. See ADR 0021 for the full "three progress components,
not two plus a `variant` prop" rationale and other T21 web-specific choices.

`LoadingIndicator` (T22) registers the same pinned revision,
`LoadingIndicator.kt` blob `edf7825aa2fa1f4654c7db50db813ddfa6b9273f`,
`MaterialShapes.kt` blob `acb31bd3937f0fde35e169f3a47d1ec8f8a4360f` (the
eight named shapes' exact vertex/rounding data), and generated
`LoadingIndicatorTokens.kt` blob `ee8a50d80f45a3dea5151818526df2ade41ad8f3`
for `ActiveIndicatorColor`/`ContainerWidth`/`ContainerHeight`. The shape
geometry and morph-matching algorithm itself comes from the separate
`graphics/graphics-shapes` module, same pinned revision: `RoundedPolygon.kt`
blob `a3c53e7d9472e8e0294c285219cc8e8cb12add2b`, `Cubic.kt` blob
`696bd9f1d0ef87debfa1306d380eab1608531e8e`, `CornerRounding.kt` blob
`1ed9aafaacb6231c6e2da867781960158935a14e`, `Features.kt` blob
`44a249a1052ebbfea9cb0a5faf3549f7655de408`, `PolygonMeasure.kt` blob
`7b009099671f51240ca09b82df9db54cea9a5de8`, `FeatureMapping.kt` blob
`86f4783076ea2ad2e31775cb447a1316f5ab1409`, `FloatMapping.kt` blob
`f96e02fe5c19941742c2075969abbd506bd9c56a`, `Morph.kt` blob
`6ab5c729683c56c7ae4e349a8d44b102898e0359`, `Point.kt` blob
`d25e99b780be69b64ece992c702fea820094c141`, `Utils.kt` blob
`1566e2261a3de75df8427d90a62158d599881290`, and `Shapes.kt` (the
`circle`/`star` factory functions) blob
`692cb0777f111ec3e7457f48ad4681736a869a3d` — all cross-verified against
Gitiles' own tree-listing `id` field, using `git hash-object` rather than
this project's earlier manual `printf`-based blob-hash construction (which
had a subtle, unresolved bug; `git hash-object` reproduced the exact
Gitiles `id` for every file on the first try). This algorithm was ported
to an offline Python script (not committed — see ADR 0022) that produces
the two runtime artifacts `LoadingIndicator` actually ships:
`loadingIndicatorMorphs.ts` (the determinate `Circle`→`SoftBurst` matched
cubic pairs) and `loadingIndicatorKeyframes.css` (the indeterminate
7-shape loop's per-segment `@keyframes`). `indeterminate-cycle-duration`
(`4550ms`) is 7 × `LoadingIndicator.kt`'s own internal
`MorphIntervalMillis` (`650ms`); `global-rotation-duration` (`4666ms`) is
its `GlobalRotationDurationMillis`. The per-segment morph spring
(`dampingRatio=0.6`, `stiffness=200`, `visibilityThreshold=0.1`) is not
registered as a token — it is baked directly into
`loadingIndicatorKeyframes.css` as a `linear()` easing function, using the
same spring→`linear()` sampling technique `src/tokens/css.ts` already
applies to the shared `--m3e-sys-motion-expressive-*` tokens. See ADR 0022
for the full geometry-port, CSS-authoring, and verification methodology.

`ButtonGroup` (T23) registers the same pinned revision, `ButtonGroup.kt`
blob `38c1a786d0337173cc7ed565927d3d6932372278`, and generated
`ButtonGroupSmallTokens.kt` blob `ec51dcd1e1ba99d66865ec6d3554e97cf3a82a88`
for `BetweenSpace`. `ConnectedButtonGroupSmallTokens.kt` blob
`cf528a8557bf393c8bd30964818914d61caa24e3` was read but is not registered
by this project's `ButtonGroup` — its `InnerCornerCornerSize`/
`SelectedInnerCornerCornerSizePercent` values back the source's
"connected" asymmetric-shape variant, which is out of scope here (see ADR
0023). `pressed-scale`/`neighbor-scale` are this project's own CSS-
transform values, not sourced token values — there is no CSS equivalent
of the source's measured-width `ExpandedRatio` (`0.15`) to cite directly;
ADR 0023 documents the substitution.

`SplitButton` (T23) registers the same pinned revision, `SplitButton.kt`
blob `443d0c0c74ff00bdd9fc5fea7faad255ffca0e4a`, `Button`'s own variant
color values (registered independently here rather than shared, the same
duplication precedent `WavyProgress`/`CircularProgress` already used), and
five generated per-size token files: `SplitButtonXSmallTokens.kt` blob
`754b0a615b64be6bb2601b8fae1c5dbffc30f8e7`, `SplitButtonSmallTokens.kt`
blob `1d76713a341c4030b17a9bdc0ee7e656eea22720`,
`SplitButtonMediumTokens.kt` blob `a3d650c72f2cf27e0cf515251b3b261980df700c`,
`SplitButtonLargeTokens.kt` blob `c94113f650b00e0940842b65215195c16befed31`,
`SplitButtonXLargeTokens.kt` blob `3493ff7157d427fee27f1e49f1d2d345550c7c48`
— all cross-verified against Gitiles' own tree-listing `id` field via `git
hash-object`. `leading-icon-size` per size deviates from the sourced
(single, non-scaling) `SplitButtonDefaults.LeadingIconSize`, instead
reusing `Button`'s own per-size icon scale — see ADR 0023 for why.

`FloatingToolbar` (T24) registers the same pinned revision,
`FloatingToolbar.kt` blob `41a86d779b71db88b812117312f5e151af58efe7`, and
generated `FloatingToolbarTokens.kt` blob
`59bfee49e6fce309167337d1e51f6896267ec707` for `ContainerHeight`/
`ContainerShape`/`ContainerLeadingSpace`/`ContainerTrailingSpace`/
`ContainerBetweenSpace`/`ContainerExternalPadding`/
`StandardContainerColor`/`VibrantContainerColor`. Content colors
(`standard-content-color`/`vibrant-content-color`) are not in the
generated token file — the source resolves `FloatingToolbarColors` from a
`ColorScheme` extension property this project didn't fetch — so this
project pairs each container color with Material's own conventional
on-container role instead (`onSurface`/`onPrimaryContainer`). Only the
plain (non-FAB-integrated) treatment is covered; see ADR 0024.

`FabMenu` (T24) registers the same pinned revision,
`FloatingActionButtonMenu.kt` blob
`8fc5e45ec2d9d0623233026b4688b2a9c1529aca`, and two generated token
files: `FabBaselineTokens.kt` blob `f4f350619e0c1210aea78817a832de5a255a914b`
(the collapsed trigger's `ContainerHeight`/`IconSize`) and
`FabMenuBaselineTokens.kt` blob `4c8771a6328389263c8735d7693309184c6c37f0`
(the expanded trigger's `CloseButtonContainerHeight`/`CloseButtonIconSize`,
and every `FabMenuItem` dimension) — all cross-verified against Gitiles'
own tree-listing `id` field via `git hash-object`. `trigger-shape-
collapsed` (`16dp`) is not in either generated token file — it is
`FloatingActionButtonMenu.kt`'s own internal `FabInitialCornerRadius`
constant (`private val FabInitialCornerRadius get() = 16.dp`), read
directly from the composable source since the pinned revision hasn't yet
promoted it to a generated token. See ADR 0024 for the full "trigger size
never changes, only shape/color/icon-size" analysis and every other
T24 web-specific deviation.

`Chip` (T38) registers AndroidX Material 3 revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`, accessed 2026-07-23,
from `Chip.kt` and the five generated token files
`AssistChipTokens.kt`, `FilterChipTokens.kt`, `InputChipTokens.kt`,
`SuggestionChipTokens.kt`, and Expressive `ChipsTokens.kt`. The generated
files declare 220 roles; the pinned implementation literally reads 118 and
leaves 102 unread. The registration therefore exposes 122 web tokens after
consolidating identical resolution paths instead of inventing interaction
states for unread generated roles. Cross-family reads are preserved rather
than normalized: elevated suggestion uses assist-chip disabled icon and
container-opacity roles, and elevated filter uses its disabled leading-icon
opacity for the trailing icon. Geometry defined directly by `Chip.kt`—the
48px minimum target, 8px/4px content arrangement, retained selectable slots,
avatar precedence, and Expressive shape transitions—is also represented.
The exhaustive generated-role, source-surface, first-party-test, and known-
anomaly ledger is recorded in ADR 0030 and the Chip conformance record.

`Slider` and `RangeSlider` (T39) register AndroidX Material 3 revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`, accessed 2026-07-23.
`Slider.kt` is blob `49ae732acecdaf0c62d6e3afe98c5fb2ced77377`;
generated `SliderTokens.kt` v2_3_5 is blob
`607a2e87f50827d26fd78cefc7cc8c380cb5d18a`; `SliderTest.kt` and
`SliderScreenshotTest.kt` are blobs
`4565310203edabcefeb84a5eee0ab5648575fdf9` and
`a63ff58deece394abf598768aef86480f4fafba4`.

The generated file declares 51 roles. The pinned implementation literally
reads 15: handle color/shape/4×44px dimensions, active/inactive and disabled
track colors/opacities, disabled handle color/opacity, 16px inactive-track
height, 6px active-handle leading space, and 4px stop size. The 36-role
complement stays unread; notably active track height, trailing handle space,
state-specific colors/widths, stop-color roles, and value-indicator roles do
not create fictitious web states. Direct implementation geometry contributes
the 2px thumb-facing corner, half-track 8px external corner, halved 2px
interaction handle, and 4px inset-focus padding. The 48px target and
forced-color-capable focus ring are web/foundation treatment. Crossed tick
color identities and disabled handle precomposition over `surface` are
preserved. ADR 0031, `Slider.source.test.ts`, and the Slider conformance record
hold the complete role/source/test/anomaly ledger.

`ListItem` and `SegmentedListItem` (T40) register AndroidX Material 3 revision
`a90df2fc27e026b9ad2ed569f203a260c1041fab`, accessed 2026-07-24.
`ListItem.kt` and `ListItemDefaults.kt` are blobs
`549d6a0fabca8f7e82cfa1a0cfcd1f1133bcc19e` and
`64a3db9821aac60854c43ea510d6e007f7468725`. Generated
`ListTokens.kt` and `ReorderListTokens.kt` v29.0.0 are blobs
`9c1823f65873878d6b3e746cf0393522c0b980c2` and
`b3a47ce590a467424d8e240c14899c57395e69d8`.

The generated files declare 120 and nine roles. The implementation literally
reads 46 List roles and seven Reorder List roles; their 74/2-role complements
remain recorded but unregistered. Reorder dragged colors and shape retain a
`reorder-dragged-*` name while Level 4 dragged elevation correctly remains a
List token. Direct source behavior contributes precision-pointer 12px block
padding and state precedence; the density target and forced-color-capable focus
ring are web/foundation treatment. ADR 0032, `ListItem.source.test.ts`, and the
conformance record contain the complete surface, source-test, screenshot, and
anomaly ledger.

`Badge` and `BadgeAnchor` (T43) register AndroidX Material 3 revision
`a90df2fc27e026b9ad2ed569f203a260c1041fab` — the revision T40 and T42 pin, so
the list, divider, and badge ledgers describe one upstream snapshot — with
`Badge.kt` blob `bce545ee63216779e5a3b3b5b655f6475173842e` and generated
`BadgeTokens.kt` blob `97c4e3d92de650350e58a93e722a0803c07ef4a7` (VERSION
`v0_103`, the oldest generated file any ledger here pins).

The generated file declares eight roles and `Badge.kt` reads six. `color` is
`Color` (`error`) through `BadgeDefaults.containerColor`; `size`/`large-size`
are `Size`/`LargeSize` (6dp/16dp); one `shape` covers `Shape` and `LargeShape`,
which are both `CornerFull` — the design specification's separate "3dp" and
"8dp" radii are that same value measured on a 6px dot and a 16px pill.
`LargeLabelTextFont` (`LabelSmall`) is read from the foundation typescale
rather than registered again, the established unread-typography-role
precedent. The two unread roles are recorded and not registered by name:
`LargeColor` repeats `Color`'s `error`, and `LargeLabelTextColor` (`onError`)
is what `contentColorFor(error)` already resolves, so `label-color` registers
`onError` on the strength of the read path with the unread role agreeing.

Four registered roles have no generated backing at all.
`large-horizontal-padding` (4px), `offset` (6px), `large-horizontal-offset`
(12px), and `large-vertical-offset` (14px) are internal `Dp` values in
`Badge.kt` — `BadgeWithContentHorizontalPadding`, `BadgeOffset`,
`BadgeWithContentHorizontalOffset`, and `BadgeWithContentVerticalOffset`. They
are registered because `BadgeAnchor` needs them at paint time and because the
design specification publishes them as measurements ("6x6dp" and "14x12dp"
from the anchor's top trailing corner, "4dp padding between badge and text
container"), the same internal-constant-over-absent-token precedent
`LinearProgress`'s `stop-trailing-space` set.

`NavigationDrawer` registers no badge role, which is the same rule applied
again. `NavigationDrawerTokens` declares `LargeBadgeLabelColor`
(`onSurfaceVariant`) and `LargeBadgeLabelFont` (`labelLarge`), and nothing in
the pinned `commonMain` reads either; `NavigationDrawerItem` resolves its badge
color from the item's own `selectedTextColor`/`unselectedTextColor`
(`onSecondaryContainer`/`onSurfaceVariant`), so the unread role is correct only
while the item is unselected. The drawer badge therefore reuses
`item-active-label-color`/`item-inactive-label-color`. `LargeBadgeLabelFont`
and the item's own read `LabelTextFont` are both `labelLarge`, so the
typescale is not in dispute. ADR 0035, `Badge.source.test.ts`, and the
conformance record carry the complete surface, generated-role, source-test,
and anomaly ledger.

## Bottom sheet (T45)

`SheetBottomTokens` declares nine roles and the four pinned sheet sources read
seven. Both unread roles are recorded rather than registered.
`DockedStandardContainerElevation` has no resolution path at all:
`BottomSheetDefaults.Elevation` reads `DockedModalContainerElevation`, and both
the modal and the standard sheet use it. The two are both `ElevationTokens.Level1`,
so `container-shadow` renders identically either way — but it is registered from
the role the source actually resolves, which is the "prefer the value the code
uses over an unread token" rule T42 had to apply retroactively to `Tabs`.
`FocusIndicatorColor` (`Secondary`) is likewise unread, and this library's focus
indication is the shared `sys.state` treatment, so there is no sheet-specific
role to attach it to.

`drag-handle-shape` is `MaterialTheme.shapes.extraLarge`, the source's own
default for `BottomSheetDefaults.DragHandle`, not `cornerFull`. At 28px against
the sourced 32x4 bar the corners clamp to a pill, so the two are visually
indistinguishable; the sourced role is registered so a theme that retunes
`cornerExtraLarge` moves the handle with it.

`peek-height` (56dp), `container-max-width` (640dp), and `drag-handle-spacing`
(the private `DragHandleVerticalPadding`, 22dp) are `BottomSheetDefaults`
constants rather than generated roles. The 22px is load-bearing rather than
decorative: 22 + 4 + 22 is the 48px target Material's accessibility guidance
requires of a sheet's resize affordance, so the sourced spacing and the
accessibility requirement agree.

`scrim-color`/`scrim-opacity` come from `ScrimTokens` (`Scrim` at `0.32f`),
which `BottomSheetDefaults.ScrimColor` composes. They carry the same values
`dialog` registered but with stronger provenance: the dialog pair had to be
cross-validated against material-web, because the pinned Compose dialog dims its
window with an Android platform default rather than a token, whereas the sheet
reads a real generated one. A theme test pins the two registrations together so
they cannot drift apart.

## App bar (T46)

`AppBarTokens` declares fourteen roles; the pinned top-bar composables resolve
six — the `topAppBarColors()` set — and every one is registered. Of the other
eight: `ContainerElevation` is read only by `FlexibleBottomAppBar`, which the
current design index files under Toolbars, so it travels with that row's
disposition rather than being registered for a family that never resolves it;
and seven are unread. Two of the unread roles matter beyond bookkeeping.
`LeadingSpace`/`TrailingSpace` are declared at 4dp, but the implementation
reads its own private `TopAppBarHorizontalPadding = 4.dp` instead — the values
agree today, yet only the constant is on the read path, so `horizontal-padding`
registers the constant, per the prefer-the-read-path rule T42 established.
`OnScrollContainerElevation` (Level2) is unread because top bars change color,
not elevation, on scroll — the registered pair is `container-color`/
`on-scroll-container-color`.

All fifteen tier-file roles are read. The seven height tokens carry them
(64/112/112/136/152/120/152), with the `LargeContainerHeight` roles selecting
the taller flexible container when a subtitle is present. Title and subtitle
fonts are consumed directly from the baseline typescale custom properties per
tier rather than re-registered, as every component here does.

Three hand-tuned source constants are registered because the code reads them:
`title-inset` (`TopAppBarTitleInset`, 16dp − 4dp — the icon-less title's extra
inset), and the two-row expanded-title bottom paddings (24dp medium, 28dp
large). `TopTitleAlphaEasing` — cubic-bezier(.8, 0, .8, .15) — is not a token;
it is evaluated in `useAppBarScroll`, since CSS cannot apply an easing curve to
a custom property, and the eased value reaches the stylesheet as
`--m3e-app-bar-top-title-alpha`.

## Search (T47)

Two generated files describe the family, exactly the split the design site's
token table names: `SearchBarTokens` (fifteen roles) covers the unfocused bar
and `SearchViewTokens` (thirteen) covers everything reached by interacting with
search. The pinned implementation resolves ten of the twenty-eight — seven bar
roles and three view roles — and all ten are registered.

Eighteen are unread, and three groups of them are worth stating. The whole
`SearchViewTokens.Header*` family plus both header heights are unread because
the expanded view reuses the collapsed field instead of composing a header of
its own; the composed geometry still lands on them, since a divided full-screen
header is 8 + 56 + 8, exactly the declared 72dp. `SearchBarTokens.
ContainerElevation` is Level3 while both `SearchBarDefaults` elevations are
Level0, so a search bar ships flat and no elevation token is registered. And
the two font roles are unread because the field takes its type from the ambient
text style, which resolves to the same body-large role the tokens name.

Two unread roles are registered anyway, the bounded exception ADR 0039 records:
`AvatarShape`/`AvatarSize` back the `avatar` slot the specification measures at
30dp, and `FocusIndicatorColor` backs the inset focus ring the source does draw
but colors from the ripple theme instead of from the role that names it.

Registered beside the generated roles are the `SearchBarDefaults` members and
private constants the code reads directly: the 360/720dp width bounds,
`SearchBarVerticalPadding`, the docked drop-down's 12dp corner, 2dp gap and
240dp minimum height, the `ScrimTokens` pair behind `dockedDropdownScrimColor`,
the two colors the source marks "TODO: replace with token"
(`fullScreenContainedSearchBarColor` and `scrolledSearchBarContainerColor`), and
the three app-bar paddings. The two horizontal paddings are the source's own
decomposition of its 16dp text inset — 12dp of text-field padding plus a 4dp
`SearchBarIconOffsetX` — which also puts a 48px icon target's glyph on the same
16dp line.

This family reads two other families' registrations rather than duplicating
them, in both cases because the source reads exactly those upstream families:
`--m3e-comp-app-bar-*` for the search app bar's container, on-scroll,
navigation, and action colors, and `--m3e-comp-text-field-disabled-*` for every
disabled color, which `inputFieldColors` resolves from `FilledTextFieldTokens`.

## Carousel (T48)

Carousel is the first family in this library with **no generated token file at
all**. Listing
`compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/`
at the pinned revision `a90df2fc27e026b9ad2ed569f203a260c1041fab` and at
`androidx-main` HEAD returns no `CarouselTokens.kt`. Every other family entry
above is an account of which generated roles the implementation reads; this one
has no roles to account for.

Its registry therefore draws on the two first-party sources that do describe the
family, and ADR 0040 records the exception so it is not read as licence to skip a
token file that does exist.

**From `CarouselDefaults` and the private constants beside it** — the four
numbers the pinned implementation reads: `MinSmallItemSize` (40dp),
`MaxSmallItemSize` (56dp), `AnchorSize` (10dp), and
`MediumLargeItemDiffThreshold` (0.85). These are the whole numeric contract of
the layout engine, so registering them is what makes the arrangement themable
rather than only its paint. `AnchorSize` is `internal` upstream and registered
anyway: it decides how far items travel past both container edges, which is a
layout number a theme should be able to change.

**From the design specification's own measurement tables**
(<https://m3.material.io/components/carousel/specs>, rendered and accessed
2026-07-25) — the values only the design owns: the 28dp item corner every layout
shares, the 16dp leading/trailing and 8dp block padding of multi-browse and both
hero layouts, the 8dp gap between items, the full-screen layout's 0dp padding
with a 16dp gap, and the `surface` container colour its colour table names.

Two registration choices follow from that split. `item-shape` is a reference to
`sys.shape.corners.cornerExtraLarge` rather than a literal 28px, because that
system role already carries exactly this value and a theme that reshapes its
corners should reshape carousel items too. And `uncontained-trailing-padding` is
registered as 0px rather than omitted — the measurement tables give the
uncontained layouts a *leading* padding only, since their items are meant to
bleed past the trailing edge, and one variable answering the question for every
layout is clearer than the absence of a variable meaning something.

The four arrangement numbers are read in JavaScript, from the resolved custom
properties, and the stylesheet deliberately never references them. A value with
two readers would have two sources of truth, so `Carousel.css.test.ts` asserts
that the stylesheet does not mention them.

No state-layer opacity is registered: the specs page lists enabled, hover, focus,
pressed, and disabled for a carousel item without giving any of them a value, so
the item paints the shared `--m3e-sys-state-*` opacities and only the layer's
colour is a carousel role.

## Date and time pickers (T66)

The date-picker domain is pinned to AndroidX Material 3 revision
`e8cac06846dd0164454bd44b77ed1c4e95ec7591`, accessed 2026-09-12. Its primary
generated source is
[`DatePickerModalTokens.kt`](https://android.googlesource.com/platform/frameworks/support/+/e8cac06846dd0164454bd44b77ed1c4e95ec7591/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/DatePickerModalTokens.kt).
`DatePicker` and `DateRangePicker` share this registration because they use the
same calendar cells, header, year grid, input spacing, and popup container.
Generated input-modal roles with no implementation read path remain accounted
for in the executable date source ledger rather than being assigned to an
unrelated web element.

The time-picker domain is pinned to AndroidX Material 3 revision
`8a0ee86845b2fb7c56fc5786971ecb687ad85527`, accessed 2026-09-12. Its primary
implementation source is
[`TimePicker.kt`](https://android.googlesource.com/platform/frameworks/support/+/8a0ee86845b2fb7c56fc5786971ecb687ad85527/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/TimePicker.kt),
with generated `TimePickerTokens` and `TimeInputTokens` contributing to one web
domain. Direct implementation geometry such as the clock radii stays in the
same attributable registration. The source's 24-hour dial places 00–11 on the
outer ring and 12–23 on the inner ring; the web component retains that observed
mapping.

Both registrations identify web-only viewport, focus-ring, and hidden
form-control values explicitly. `DateTimePicker` adds no third domain: it uses
the date input-spacing role and delegates the remaining geometry and paint to
its public children. ADR 0044 records the composition boundary.
