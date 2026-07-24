# Divider conformance

Task: T42
Status: conformant
Reviewed: 2026-07-24

## Primary references

- Material 3 Divider, accessed 2026-07-24:
  <https://m3.material.io/components/divider/overview>
- AndroidX `HorizontalDivider` API, accessed 2026-07-24:
  <https://developer.android.com/reference/kotlin/androidx/compose/material3/HorizontalDivider.composable>
- AndroidX `VerticalDivider` API, accessed 2026-07-24:
  <https://developer.android.com/reference/kotlin/androidx/compose/material3/VerticalDivider.composable>
- Pinned `Divider.kt`, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Divider.kt>
- Pinned generated `DividerTokens.kt`, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/DividerTokens.kt>
- HTML Standard, grouping content, accessed 2026-07-24:
  <https://html.spec.whatwg.org/multipage/grouping-content.html>
- WAI-ARIA 1.2 `separator` role, accessed 2026-07-24:
  <https://www.w3.org/TR/wai-aria-1.2/#separator>

Supported baseline: AndroidX Material 3 revision
`a90df2fc27e026b9ad2ed569f203a260c1041fab` — the same revision T40 pinned, so
the four `ListTokens.Divider*Space` roles frozen there describe the same
upstream snapshot. Generated `DividerTokens.kt` identifies version `v0_117`.

## Public-source surface ledger

Eleven current entries: `HorizontalDivider` and `VerticalDivider` with their
`modifier`/`thickness`/`color` parameters, plus `DividerDefaults` and its
`Thickness`/`color` members. Four deprecated entries: the renamed `Divider`
composable and its three parameters.

The two current composables differ only in which axis they fill, so they map to
one `orientation` prop rather than two nearly identical React exports — the same
one-component-per-axis translation T39 applied to `VerticalSlider`. The
deprecated `Divider` name is not reintroduced; the React export is named
`Divider` after the Material catalog family, and the collision with a
Compose-only migration alias carries no web meaning.

`modifier` is Compose plumbing with no React equivalent. `thickness` and `color`
are adapted rather than implemented as props: an arbitrary per-instance value
would have to be emitted as an inline style, and this library's equivalent is a
scoped `--m3e-comp-divider-*` override, which composes with the theme and
survives server rendering.

## Generated-role completeness ledger

`DividerTokens` declares exactly two roles and the pinned `Divider.kt` reads
both, so this is the first component family in the library with no unread
remainder. `Color` resolves `OutlineVariant` and becomes
`--m3e-comp-divider-color`; `Thickness` is `1dp` and becomes
`--m3e-comp-divider-thickness` at `1px`.

The divider has no expressive shape, elevation, state-layer, or motion role of
its own: it is not interactive, and its generated token file was not part of the
expressive refresh.

## Anatomy, geometry, and orientation

A horizontal divider fills the inline axis and takes its thickness on the block
axis; a vertical divider is the transpose. The line is painted as a filled box,
which is geometrically identical to the source's `drawLine` stroke of the same
width centred at `thickness / 2`.

Both orientations fill their length by stretching rather than by a percentage.
`align-self: stretch` is the translation of the source's `fillMaxHeight()`:
both fill the cross axis of a bounded parent and both collapse without one, so
a vertical divider needs a flex or grid parent, or an explicit block size. A
percentage block size was rejected because it resolves to zero against the
auto-height flex row that is the common case. The horizontal orientation sets
no inline size at all — auto/stretch sizing fills a block, flex-column, or grid
parent minus any inline margins, where `inline-size: 100%` would keep the full
width under a margin inset and overflow the parent's end edge, verified by
measurement in the rendering audit.

Indentation is composition, not a prop. The pinned
`divider_withIndent_doesNotChangeSize` applies `Modifier.padding` around the
divider and asserts its own size is unchanged while the drawn line shortens
inside the indent; the web equivalent is an inline margin on the divider —
which subtracts from the stretched line the same way — or padding on its
container, so no `inset` prop is added.

## Accessibility

The default element is `hr`, whose implicit `separator` role is left implicit
rather than restated. `div` and `li` carry an explicit `role="separator"`.
`aria-orientation="vertical"` is emitted only for vertical separators, since the
role's implicit orientation is already horizontal.

`decorative` removes the line from the accessibility tree for cases where the
grouping is already conveyed structurally. It emits `role="none"` on `hr` and
`li` — both of which have an implicit role to strip — and nothing on `div`,
which has none. A decorative divider emits no `aria-orientation`, because it
exposes no role to qualify.

`li` exists because `ul` and `ol` accept only `li` and script-supporting
children, so an `hr` between list items is invalid HTML. This mirrors the
`div`/`li` choice `ListItem` already offers for passive items.

The divider is never focusable and exposes no keyboard model, matching the
source. Forced-colors mode overrides author backgrounds, so the line repaints as
`CanvasText` rather than disappearing.

## Pinned implementation anomalies

- The KDoc on both current composables states that `Dp.Hairline` "will produce a
  single pixel divider regardless of screen density". The pinned
  `divider_hairlineThickness` test asserts the opposite for the modern path —
  `heightPx` is `0`. Only the deprecated `Divider` converts hairline to one
  physical pixel.
- The deprecated `Divider` fills a `Box` background; the two current composables
  stroke a `Canvas`. The rendered result is the same, but the mechanisms differ.
- `DividerTokens.kt` carries generator version `v0_117`, shared with
  `RadioButtonTokens.kt` and `ScrimTokens.kt`, while the `ListTokens.kt`/
  `ReorderListTokens.kt` T40 pinned at this same revision are already `29.0.0`.
  The tokens directory spans 19 generator versions in total — the divider was
  left behind by the token refreshes.
- Screenshot coverage is asymmetric: horizontal has light and dark cases,
  vertical has light only.

## Pinned-test completeness ledger

All six `DividerTest` cases and all four `DividerScreenshotTest` cases are
frozen in `Divider.source.test.ts`. Default and custom sizing on both axes are
covered by the orientation rules and the thickness token; the indent case is
covered by the composition note above.

`divider_hairlineThickness` is the one case with no reproduction. `Dp.Hairline`
exists to escape density scaling and paint exactly one physical pixel; a CSS
pixel is already density-independent, so the concept has no equivalent, and the
pinned test shows the modern composables lay out at zero anyway. It is recorded
as an exclusion with that reason rather than approximated.

## Web-specific deviations and exclusions

- `thickness` and `color` are component tokens rather than props. See the
  surface ledger above.
- `Dp.Hairline` is excluded. See the test ledger above.
- The `as` prop is a web addition with no source counterpart, required by the
  HTML content models named above.
- `decorative` is a web addition. Compose dividers carry no semantics at all, so
  every source divider is decorative by default; on the web the accessible
  default is the semantic one, and opting out is the explicit choice.
- `Tabs` paints its rule as a `border-block-end` rather than composing a
  `Divider` element, because `role="tablist"` owns only `role="tab"` children.
  Its `divider-color`/`divider-height` tokens track `DividerTokens` so the two
  cannot drift; T19 had registered the unread
  `SecondaryNavigationTabTokens.DividerColor` instead, which this task
  corrected. See `Tabs.conformance.md`.

## Source refresh (T44 — 2026-07-24)

This family already pins the reference snapshot `a90df2fc27e026b9ad2ed569f203a260c1041fab`. On 2026-07-24 its
pinned files were re-diffed against `androidx-main` HEAD and found
byte-identical, so the pin is verified current with no change.
