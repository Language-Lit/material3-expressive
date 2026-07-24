# ADR 0035: Badge family, the anchor component, and the two badge affordances

Status: accepted
Date: 2026-07-24
Task: T43

## Context

Badges are the last entry in the primitive tranche of the
[Material catalog parity roadmap](../MATERIAL_CATALOG_ROADMAP.md). The pinned
AndroidX source is small — `Badge.kt` exports `BadgedBox`, `Badge`, and
`BadgeDefaults`, and generated `BadgeTokens.kt` declares eight roles — but the
family raises four questions with no obvious default answer.

**How the two sizes are selected.** Material documents a small badge and a large
badge as distinct variants, and the specification lists separate sizes and corner
radii for each. The source exposes no parameter for the choice: `Badge` reads
`content != null` and picks `LargeSize`/`LargeShape` or `Size`/`Shape` from it.

**Whether the positioner is public.** `BadgedBox` is a custom `Layout`. What it
does is not decoration: it switches both offsets on whether the badge has
content, places relatively so the arrangement mirrors under RTL, and clamps the
badge against rulers published by the enclosing item. The roadmap's
family-task completeness contract says an entry becomes a public API when it owns
behavior and a tested recipe when it does not.

**How a badge is announced.** Compose badges carry no semantics at all; the
pinned `badge_notMergingDescendants_withOwnContentDescription` shows the
application supplying a description on the enclosing box. Transplanting that
silence to the web breaks, because the components a badge belongs on —
`NavigationBar`, `NavigationRail`, and `Tabs` — wrap their icon slots in
`aria-hidden="true"`, and `aria-hidden` on an ancestor removes a subtree
unconditionally.

**Which components own a badge.** A sweep of the pinned `commonMain` for the
word finds seven files, and they do not describe one feature. Five are
`Modifier.badgeBounds()` clamp sites: `NavigationBar.kt:535`,
`NavigationItem.kt:460` and `:512`, `NavigationRail.kt:541`, and `Tab.kt:113`.
None of them exposes a badge parameter. The remaining two are
`NavigationDrawer.kt` and `NavigationDrawerTokens.kt`, and they describe a
different thing entirely: `NavigationDrawerItem` takes a `badge` parameter
documented as "optional badge to show on this item from the end side" — trailing
text placed 12dp after the label and colored by
`NavigationDrawerItemColors.badgeColor(selected)`, which defaults to the item's
own text colors rather than the error container.

Investigating that last point also surfaced an existing gap.
`NavigationDrawer.conformance.md` mentioned `badge` neither as implemented nor as
excluded, while the drawer's inventory entry was conformant — the same class of
silent divergence T42 found in `Tabs`.

## Decision

**Content selects the variant; there is no size prop.** A childless `<Badge />`
is the 6px dot and `<Badge>3</Badge>` is the 16px pill, reproducing
`content != null` exactly. The presence test is `!= null` rather than
truthiness, so a zero count stays large. This is the same rule ADR 0034 applied
when one `Divider` with an `orientation` replaced two composables: the source's
own discriminator is preferred over a prop invented to describe it.

**`BadgedBox` becomes a public `BadgeAnchor`.** The placement is behavior the
source owns, so the completeness contract makes it an API rather than a recipe.
The Compose-only "Box" is dropped for the reason ADR 0034 gave for not
reintroducing the deprecated `Divider` alias: a name that carries no web meaning
is not preserved for traceability alone, which is what the conformance ledger is
for.

**`label` names the badge; its absence keeps the source's silence.** With a
label the badge is exposed as `role="img"` with that accessible name, which
prunes the visible glyph so a count is announced once rather than twice. Without
one it exposes no role, reproducing the source exactly. No default string is
synthesised: "New notification" is English, and a library that hardcoded it would
be announcing untranslated text in every other locale.

**The badge slot is added to both item shapes, and each component places it per
its own specification.** `NavigationItem` — shared by `NavigationBar`,
`NavigationRail`, `NavigationDrawer`, and `NavigationSuite` — and `TabItem` each
gain an optional `badge`. The bar, rail, and tabs anchor it to the icon; the
drawer renders it as an end-side label. One field with two renderings is not an
inconsistency: it is what the source does, and collapsing the two affordances
into one would put an error-colored pill where Material shows a plain count.

**The drawer's badge color follows the read path, not the generated role.**
`NavigationDrawerTokens.LargeBadgeLabelColor` (`onSurfaceVariant`) and
`LargeBadgeLabelFont` (`labelLarge`) are declared and never read. The
implementation resolves the item's own text colors, so the unread role is correct
only while the item is unselected. The badge reuses
`item-active-label-color`/`item-inactive-label-color` and registers nothing new.

## Consequences

The package gains two named exports, `Badge` and `BadgeAnchor`, and five
components gain an optional `badge` on their items. Every addition is optional,
so no existing usage changes. No export path, prop, or token is removed or
renamed, and the package still ships no runtime dependencies.

`--m3e-comp-badge-*` registers nine roles: the six generated ones the source
reads, collapsed where `Shape` and `LargeShape` are the same `CornerFull`, plus
the four geometry constants `Badge.kt` keeps as internal `Dp` values. The last
group has no generated backing at all, and is registered because `BadgeAnchor`
needs the values at paint time and because the design specification publishes
them as measurements.

Two limits are accepted rather than approximated. The ruler clamp is not
reproduced: it compares two boxes at layout time, which CSS absolute positioning
cannot express and which JavaScript measurement would only reach at the cost of
the zero-runtime-dependency contract. And `Modifier.size()` maps onto a CSS
`min-*` floor rather than a replacement, so shrinking a badge below its minimum
requires overriding the minimum too. Both are recorded in
`Badge.conformance.md`, and the rendering audit measures the real geometry
rather than trusting either.

The drawer's conformance record now states its badge parameter and the unread
token roles, closing a gap that had persisted under a conformant status.

The declaration-closure ceiling in `docs/bundle-budgets.json` rises from 91,300
to 93,000 bytes, and `measuredForTask` moves from T39 to T43. The measured
closure is 92,018 bytes — 718 over the previous ceiling, set when the package
had 34 components rather than 37. The overage is TSDoc, which TypeScript copies
into the declaration file; the comments were trimmed once already, recovering
about 600 bytes, and cutting further would have removed the inline
documentation editors show for the new API. Nothing else moved: the JavaScript
closure, both CSS artifacts, the packed package, and every gzip figure —
including the declaration closure's own 21,158 against an unchanged 21,300 —
stay inside their existing limits. Declarations are not shipped to browsers, so
this ceiling bounds install size rather than anything a user downloads at
runtime.
