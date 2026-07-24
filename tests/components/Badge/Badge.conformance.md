# Badge conformance

Task: T43
Status: conformant
Reviewed: 2026-07-24

## Primary references

- Material 3 Badges overview, rendered and accessed 2026-07-24:
  <https://m3.material.io/components/badges/overview>
- Material 3 Badges specs, rendered and accessed 2026-07-24:
  <https://m3.material.io/components/badges/specs>
- Material 3 Badges guidelines, rendered and accessed 2026-07-24:
  <https://m3.material.io/components/badges/guidelines>
- Material 3 Badges accessibility, rendered and accessed 2026-07-24:
  <https://m3.material.io/components/badges/accessibility>
- Pinned `Badge.kt`, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Badge.kt>
- Pinned generated `BadgeTokens.kt`, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/BadgeTokens.kt>
- WAI-ARIA 1.2 `img` role, accessed 2026-07-24:
  <https://www.w3.org/TR/wai-aria-1.2/#img>

Supported baseline: AndroidX Material 3 revision
`a90df2fc27e026b9ad2ed569f203a260c1041fab` — the revision T40 and T42 pin, so
the list, divider, and badge ledgers describe one upstream snapshot. Generated
`BadgeTokens.kt` identifies version `v0_103`.

## Public-source surface ledger

Eleven current entries: `BadgedBox` with its `badge`/`modifier`/`content`
parameters, `Badge` with its `modifier`/`containerColor`/`contentColor`/`content`
parameters, and `BadgeDefaults` with its `containerColor` member. There are no
deprecated entries in this family.

`Badge` maps to `Badge`. `BadgedBox` maps to `BadgeAnchor`: the placement it
performs is behavior the source owns — an offset that changes with the badge's
own content, `placeRelative` mirroring, and a ruler clamp — so the roadmap's
completeness contract makes it a public API rather than a documented recipe. The
Compose-only "Box" is dropped for the same reason T42 did not reintroduce the
deprecated `Divider` alias.

`modifier` is Compose plumbing with no React equivalent. `containerColor` and
`contentColor` are adapted to component tokens for the reason T42 recorded: an
arbitrary per-instance value would have to be emitted as an inline style, while
a scoped custom-property override composes with the theme and survives server
rendering.

The source has no `variant` or `size` parameter, and neither does this library.
`Badge` selects its geometry from `content != null`, so a childless badge is the
small dot and any content makes it the large pill.

## Generated-role completeness ledger

`BadgeTokens` declares eight roles and the pinned `Badge.kt` reads six. `Color`
becomes `--m3e-comp-badge-color` through `BadgeDefaults.containerColor`; `Size`
and `LargeSize` become `--m3e-comp-badge-size` and `--m3e-comp-badge-large-size`;
`Shape` and `LargeShape` are both `CornerFull` and collapse into one
`--m3e-comp-badge-shape`; `LargeLabelTextFont` is `LabelSmall`, read straight
from the foundation typescale rather than registered again, matching every prior
task's unread-typography-role precedent.

Two roles are unread, and neither contradicts the code — unlike the `Tabs`
divider role T42 corrected:

- `LargeColor` is `Error`, the same value as `Color`. The implementation sizes
  one container by content instead of selecting a second color.
- `LargeLabelTextColor` is `OnError`, which is exactly what
  `contentColorFor(Error)` resolves. `--m3e-comp-badge-label-color` registers
  `onError` on the strength of the read path, and the unread role agrees.

Four values the anchor needs have no generated role at all. `BadgeOffset` (6dp),
`BadgeWithContentHorizontalOffset` (12dp), `BadgeWithContentVerticalOffset`
(14dp), and `BadgeWithContentHorizontalPadding` (4dp) are internal `Dp` values
in `Badge.kt`. They are registered because the design specification publishes
them as measurements — "6x6dp" and "14x12dp" from the anchor's top trailing
corner, and "4dp padding between badge and text container".

The badge has no expressive elevation, state-layer, or motion role: it is not
interactive, and its generated token file was not part of the expressive
refresh.

## Anatomy, geometry, and placement

Both variants are one container. The small one is a 6px dot; the large one has a
16px minimum on both axes with 4px inline padding, so a growing count widens it
while the height holds. Both minimums are floors rather than fixed sizes, which
is what the source's `defaultMinSize` is.

`CornerFull` covers both radii the specification lists separately: a fully
rounded 6px dot has a 3px radius, and a fully rounded 16px pill has an 8px one.
One shape role therefore expresses both rows of the measurement table.

`BadgeAnchor` reproduces the source's placement arithmetic. The source computes
`x = anchor.width - horizontalOffset` and `y = -badge.height + verticalOffset`,
switching both offsets on whether the badge has content, and places relatively so
the whole arrangement mirrors under RTL. The CSS is the same statement:
`inset-inline-start: calc(100% - <offset>)` fixes the leading edge — which is why
a longer count expands outward rather than moving, as the guidelines require —
and `inset-block-start: calc(<verticalOffset> - <height>)` reproduces the
vertical overlap. For the small variant those resolve to the anchor's exact
top-trailing corner, which is the specification's "anchor badges inside the icon
bounding box".

The badge is absolutely positioned, so the anchor measures exactly its content.
That is what the pinned `badgeBox_size` asserts: a `BadgedBox` reports its
icon's size, not the union with its badge.

## Accessibility

Compose badges carry no semantics at all; the pinned
`badge_notMergingDescendants_withOwnContentDescription` shows the application
supplying a description on the enclosing box. On the web the surrounding
components make silence the wrong default: the icon slots of `NavigationBar`,
`NavigationRail`, and `Tabs` are `aria-hidden="true"`, and `aria-hidden` on an
ancestor removes a subtree unconditionally, so a badge rendered inside one could
never be announced.

`label` therefore exposes the badge as `role="img"` with that accessible name.
The `img` role prunes its descendants, so a labelled count is announced once, as
the label, rather than twice. This matches the guidance that a badge is read
after its destination and that a count reads as its number while a non-counting
badge reads as a notification — with the wording left to the application rather
than a hardcoded English string in a library.

Without `label` the badge exposes no role, which reproduces the source exactly: a
labelled badge's own text is still read as ordinary content, and an unlabelled
dot stays silent.

The badge is never focusable and has no keyboard model. In forced-colors mode it
repaints as `CanvasText` on `Canvas` with a `Canvas` ring, because author
backgrounds are dropped there and the badge would otherwise read as bare text
sitting on top of the icon it overlaps.

## Components that anchor a badge

The pinned `commonMain` mentions a badge in exactly seven files. Five are
`Modifier.badgeBounds()` clamp sites — `NavigationBar.kt:535`,
`NavigationItem.kt:460` and `:512`, `NavigationRail.kt:541`, and `Tab.kt:113`.
None of them exposes a `badge` parameter: they publish `BadgeTopRuler` and
`BadgeEndRuler` so that a badge the application passes through the icon slot
cannot escape the item.

This library reaches the same result with an optional `badge` on the shared
`NavigationItem` shape and on `TabItem`, which is the web-idiomatic form of the
same composition and is what allows the badge to be rendered outside the
`aria-hidden` icon wrapper. `NavigationSuite` forwards `items` wholesale, so it
inherits the field without a change of its own.

The sixth and seventh files are the second, unrelated affordance. See below.

## The drawer's badge is a different component

`NavigationDrawerItem` takes its own `badge` parameter, documented as "optional
badge to show on this item from the end side". It is end-aligned text placed
12dp after the label, colored by `NavigationDrawerItemColors.badgeColor(selected)`
— not the error container, and not the `Badge` composable. Collapsing the two
would have produced an error-colored pill where Material shows a plain count.

`NavigationDrawerTokens` declares `LargeBadgeLabelColor` (`OnSurfaceVariant`)
and `LargeBadgeLabelFont` (`LabelLarge`), and nothing in the pinned `commonMain`
reads either. `badgeColor(selected)` defaults to the item's own
`selectedTextColor`/`unselectedTextColor`, which are `ActiveLabelTextColor`
(`OnSecondaryContainer`) and `InactiveLabelTextColor` (`OnSurfaceVariant`). The
unread role therefore agrees only while the item is unselected. The drawer badge
reuses the item's label colors rather than registering a third value under a
name the source never reads — the rule T42 established. `LargeBadgeLabelFont`
and the item's own `LabelTextFont` are both `LabelLarge`, so the typescale is
not in dispute.

`NavigationDrawer.conformance.md` recorded this parameter neither as implemented
nor as excluded while its inventory entry was conformant. That gap is closed
here.

## Pinned implementation anomalies

- `BadgeTokens.LargeColor` duplicates `Color`. Both are `Error`, and only the
  latter is read.
- `BadgeTokens.LargeLabelTextColor` is unread because `contentColorFor` already
  resolves the same `OnError`.
- `badgeBox_shortContent_position` and `badgeBox_longContent_position` are
  assertion-identical: the two bodies differ only in the badge text, so the
  long-content case adds no coverage over the short one despite existing to test
  a wider badge.
- Both labelled-position tests add `BadgeWithContentHorizontalPadding` to the
  expected left edge, which the placement code never adds. The expectation only
  holds because the queried `onSibling()` node is the badge's content rather
  than its container.
- `badgeBox_shortContent_position` is suppressed above SDK 34 for b/384973010.
- `BadgeTokens.kt` is generator version `v0_103` — older than the `v0_117`
  divider file and far older than the `29.0.0` list files this same revision
  carries, making it the oldest generated file any ledger in this library pins.
- The drawer's badge affordance and its two unread generated roles, recorded
  above.

## Pinned-test completeness ledger

All 11 `BadgeTest` cases and all four `BadgeScreenshotTest` cases are frozen in
`Badge.source.test.ts`. Screenshot coverage is symmetric — light and dark for
both variants — unlike the divider's.

`badge_shortContent_customSizeModifier_size` is the one case whose mechanism does
not carry over exactly. `Modifier.size()` replaces Compose's default minimum,
while a CSS `min-*` is a floor that an author's smaller size cannot lower. The
test's own values still hold, because the custom height is applied where the
library sets only a minimum and the custom width exceeds it; shrinking a badge
below the minimum requires overriding the minimum too. Recorded as a deviation
rather than smoothed over by dropping the minimum, which would misrepresent
`defaultMinSize`.

The ruler clamp in `badgeBox_smallGreatGrandParentAndLargeAnchor_adjustedBadge`
is excluded. CSS absolute positioning has no equivalent of a layout ruler: the
clamp compares two boxes at layout time, which on the web would require
measuring in JavaScript and defeating the zero-runtime-dependency contract. The
rendering audit measures the real overhang instead, and the four-character cap
the guidelines set bounds it.

## Web-specific deviations and exclusions

- `containerColor` and `contentColor` are component tokens rather than props.
  See the surface ledger above.
- `BadgedBox` is renamed `BadgeAnchor`. See the surface ledger above.
- `label` is a web addition with no source counterpart, required because the
  anchoring components hide their icon slots from assistive technology.
- The ruler clamp is excluded, and `Modifier.size()` maps onto a floor rather
  than a replacement. See the test ledger above.
- The drawer's badge is a separate affordance implemented as an end-side label.
  See above and `NavigationDrawer.conformance.md`.

## Source refresh (T44 — 2026-07-24)

This family already pins the reference snapshot `a90df2fc27e026b9ad2ed569f203a260c1041fab`. On 2026-07-24 its
pinned files were re-diffed against `androidx-main` HEAD and found
byte-identical, so the pin is verified current with no change.
