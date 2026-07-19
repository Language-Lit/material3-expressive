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

## AndroidX Material 3

Primary revision: `0be207d91046b7376beeef5544d331a02d6fa87c`

- Motion API and slot meanings: [MotionScheme.kt](https://android.googlesource.com/platform/frameworks/support/+/0be207d91046b7376beeef5544d331a02d6fa87c/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MotionScheme.kt)
- Expressive spring values: [ExpressiveMotionTokens.kt](https://android.googlesource.com/platform/frameworks/support/+/0be207d91046b7376beeef5544d331a02d6fa87c/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt)
- Standard spring values: [StandardMotionTokens.kt](https://android.googlesource.com/platform/frameworks/support/+/0be207d91046b7376beeef5544d331a02d6fa87c/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/StandardMotionTokens.kt)
- Tonal elevation behavior: [ColorScheme.kt](https://android.googlesource.com/platform/frameworks/support/+/0be207d91046b7376beeef5544d331a02d6fa87c/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ColorScheme.kt)

Motion is represented by the same standard/expressive, fast/default/slow, and
spatial/effects slots as AndroidX. The library does not invent duration
equivalents for springs. CSS string generation preserves spring parameters as
custom properties for the later motion service to consume.

Tonal surface-container roles are the preferred web elevation colors. The
AndroidX tonal overlay formula remains represented for custom schemes and later
theme services; it does not replace the sourced default surface-container roles.

## Web accessibility adaptations

- Required default text-role contrast is 4.5:1, following [WCAG 2.2 Success Criterion 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum).
- Material's 48dp minimum interactive target is represented as 48 CSS pixels at
  the component-token boundary, following the [Material 3 minimum interactive component size API](https://developer.android.com/reference/kotlin/androidx/compose/material3/package-summary#minimumInteractiveComponentSize()).

The component-token registry intentionally has no defaults. Each later component
task must cite its own current first-party token or specification source before
adding values.
