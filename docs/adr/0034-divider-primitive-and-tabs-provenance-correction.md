# ADR 0034: Divider primitive, element/semantics matrix, and the Tabs provenance correction

Status: accepted
Date: 2026-07-24
Task: T42

## Context

The [Material catalog parity roadmap](../MATERIAL_CATALOG_ROADMAP.md) leaves two
primitives before composite work may begin: Badges and Divider. Divider is the
smaller of the two and has consumers already in the tree.

The pinned AndroidX source is unusually small. `Divider.kt` exports
`HorizontalDivider` and `VerticalDivider`, both taking `modifier`, `thickness`,
and `color`; a deprecated `Divider` alias; and a `DividerDefaults` object.
Generated `DividerTokens.kt` declares exactly two roles, `Color`
(`OutlineVariant`) and `Thickness` (`1dp`), and the implementation reads both.

Three questions have no obvious default answer.

**Which element.** A divider is not always legal as the same element. `hr` is
the native separator, but the HTML content model for `ul` and `ol` is "zero or
more `li` and script-supporting elements", so an `hr` between list items is
invalid markup — and separating list items is one of the divider's two named
purposes in the Material specification.

**Which semantics.** Compose dividers carry no semantics at all: every source
divider is decorative. On the web the accessible default is the opposite, and
`hr` already carries an implicit `separator` role. A library that always emitted
a separator would add noise wherever the grouping is conveyed structurally; one
that never did would drop a real semantic the platform provides for free.

**Where thickness and color live.** The source takes both as per-call
parameters. Reproducing that as React props means emitting an inline style for
any non-default value, which does not compose with the theme, does not nest with
`Material3Provider`, and is the pattern every prior component task avoided.

Adding the component also exposed an existing defect. `Tabs` registered
`divider-color`/`divider-height` from `SecondaryNavigationTabTokens.DividerColor`
(`surfaceVariant`) and `DividerHeight`. `TabRow.kt` never reads either: every
`divider` parameter — `PrimaryTabRow`, `SecondaryTabRow`, both scrollable
variants, and the deprecated overloads — defaults to
`@Composable { HorizontalDivider() }`, whose color is `outlineVariant`. The
T19 registration therefore encoded a generated-but-unread role as runtime
behavior, which is precisely what the read/unread ledgers introduced by T38,
T39, and T40 exist to prevent. The T21 `LinearProgress` provenance note cites
that same `Tabs` registration as precedent for the opposite rule, "prefer the
value the code actually uses over an unread token", so the two records
contradicted each other. T19 had a real constraint — no `Divider` existed, so
the generic composable had nothing traceable to point at.

## Decision

1. One public `Divider` component with an `orientation` prop covering both
   source composables, following the one-component-per-axis translation ADR 0031
   applied to `VerticalSlider`. The deprecated Compose `Divider` alias is a
   migration artifact with no web meaning; the React export takes the Material
   catalog family name.
2. An `as` prop selects `hr` (default), `div`, or `li`. The set is closed and
   driven by HTML content models, not by preference. This mirrors the `div`/`li`
   choice `ListItem` already offers for passive items.
3. Semantics are exposed by default and opted out of with `decorative`. The
   component emits a role only where the element does not already carry the
   right one: nothing on a semantic `hr`, `role="separator"` on `div`/`li`,
   `role="none"` on a decorative `hr`/`li`, nothing on a decorative `div`.
   `aria-orientation="vertical"` is emitted only for vertical separators,
   because horizontal is the role's implicit value.
4. `thickness` and `color` are adapted to `--m3e-comp-divider-thickness` and
   `--m3e-comp-divider-color` rather than implemented as props.
5. `Dp.Hairline` is excluded. It exists to escape density scaling and paint one
   physical pixel; a CSS pixel is already density-independent, and the pinned
   `divider_hairlineThickness` test asserts the modern composables lay out at
   zero height, so there is no size to reproduce either.
6. Indentation stays composition. The pinned
   `divider_withIndent_doesNotChangeSize` applies a padding modifier around the
   divider and asserts its own size is unchanged, so margin or padding is the
   faithful translation and no `inset` prop is added.
7. `Tabs` is corrected to the value its source actually renders:
   `divider-color` moves from `surfaceVariant` to `outlineVariant`, and both
   divider tokens are documented as mirroring `DividerTokens`. The tokens keep
   their `tabs` namespace rather than being deleted or redirected, preserving
   both the public theming surface and the web equivalent of the source's
   per-call `divider` slot.
8. `Tabs` continues to paint its rule as a `border-block-end` rather than
   composing a `Divider` element. `role="tablist"` owns only `role="tab"`
   children, and a one-pixel rule under a container is a border on the web.

## Consequences

- The primitive tranche has one family left, Badges, before composite
  implementation may begin.
- Dividers between list items are expressible in valid HTML, which the Lists
  recipe tranche needs.
- A rendered color changes. Tab rows move from `surfaceVariant` to
  `outlineVariant`; both are low-emphasis outline roles, and the change makes
  the rule match every other Material divider. It ships in a minor release, not
  a patch, and is recorded in the release notes as a conformance repair.
- The contradiction between the `Tabs` and `LinearProgress` provenance notes is
  resolved in favour of the rule the ledgers already enforce. Both records now
  state the correction rather than silently agreeing.
- `Divider` is the first family with no unread generated roles, which makes it
  the reference example for what a complete ledger looks like.
- Consumers overriding `--m3e-comp-tabs-divider-color` are unaffected; no public
  token, export path, prop, or dependency is removed or renamed.
