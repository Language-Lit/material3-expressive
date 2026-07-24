# ADR 0036: Primitive-family source refresh and partial revision unification

Status: accepted
Date: 2026-07-24
Task: T44

## Context

The [Material catalog parity roadmap](../MATERIAL_CATALOG_ROADMAP.md) leaves one
item in tranche P after Divider (T42) and Badges (T43): the primitive-family
source refresh. Every primitive family already has conformant coverage, so the
refresh adds no component. Its job is to confirm the fifteen primitive families
are current against upstream AndroidX and, following the precedent the Divider
and ListItem ledgers set — that families sharing an upstream file "must describe
one upstream snapshot to stay comparable" — to bring the tranche onto a
comparable snapshot before it is closed.

The pins were recent but scattered. Each primitive conformance record was
authored in a five-day window (2026-07-19 to 2026-07-24), and the pins cluster
into three groups: four one-off revisions for the T07–T10 families
(`dd849e20…` Button, `f0793303…` IconButton, `b0ef6d36…` FloatingActionButton,
`0be207d9…` Card), the dominant `225f50d4…` shared by nine families, and the
newest `a90df2fc…` shared by Divider, Badge, and ListItem. Task-number order
reflects build order, not source age — Button's T07 ledger already records the
current Expressive size ladder and shapes.

Both AndroidX source mirrors are reachable, so the refresh was executed as a
real diff rather than an assertion. For each family the pinned source, token,
and test files were fetched at the family's pinned revision, at the reference
snapshot `a90df2fc27e026b9ad2ed569f203a260c1041fab`, and at `androidx-main`
HEAD, and compared. For every primitive file examined the reference snapshot
equals HEAD, so the whole tranche is verified current.

## Decision

**The reference snapshot is `a90df2fc27e026b9ad2ed569f203a260c1041fab`.** It is
the newest pin, already shared by Divider, Badge, and ListItem, and it equals
`androidx-main` HEAD for every primitive file diffed.

**Eleven byte-identical components are re-pinned to the reference snapshot.**
Card, IconButton, Checkbox, Radio, Switch, TextField, TextArea, Chip,
LinearProgress, CircularProgress, and WavyProgress have source, token, and test
files that are byte-identical at the reference snapshot and at HEAD. Their
component-token registrations (ten — TextArea shares TextField's) and the schema
ledger move to the reference revision with access date 2026-07-24. Because the content is identical, every frozen git blob
identity is unchanged; only the revision label and access date move.

**Four families with a non-substantive delta retain their pins.** Button, the
FloatingActionButton, Slider, and LoadingIndicator differ from the reference
snapshot, but only in ways a web port cannot observe:

- **Button** and the **FloatingActionButton** drop `@ExperimentalMaterial3ExpressiveApi`
  from members this port already ships as stable (the Expressive size ladder and
  shapes; the FAB's `MediumIconSize`), plus internal helper and precision
  refactors. No variant, token, state, or behavior changed.
- **Slider** carries a binary-compatibility refactor — a hidden-deprecated
  `RangeSliderLegacy` shim beside a new `RangeSlider` overload with the same
  public contract, and thumb-scoped interaction-source parameter renames. These
  are Kotlin ABI shims with no web equivalent.
- **LoadingIndicator** differs only by five added `@material3expressive` KDoc
  tags — documentation, not code.

For these, re-pinning would rewrite an immutable blob identity for a change
invisible to the port, so the pin is retained and the delta is classified in the
conformance record. A substantive new-variant reconciliation, had the diff found
one, would have been recorded and deferred to its own approved feature task
rather than folded into a refresh; none was found.

**Unification is therefore partial by design.** Thirteen primitive components
sit on the reference snapshot and four retain their pins. This is acceptable
because the comparability the precedent protects matters only where families
share an upstream file, and the four retained families share none of their
pinned files with the re-pinned set.

## Consequences

No public export, prop, token value, or behavior changed, and the package still
ships no runtime dependencies — the refresh is provenance bookkeeping, not a
code change. The only `dist` delta is the exported provenance metadata itself —
the same-length revision and access-date strings — so every bundle budget is
unchanged.

The token defaults and the schema ledger record the re-pinned revisions and the
2026-07-24 access date for the ten re-pinned registrations. Each of the seventeen
primitive conformance records gains a dated "Source refresh (T44)" section: the
re-pinned families note the move to identical content, the retained families
name and classify their non-substantive delta, and Badge and Divider — already
on the reference snapshot — record that they were re-verified against HEAD. The
historical audit prose in each record is left intact, as it accurately describes
what was originally accessed.

Tranche P's source-refresh item is closed; the roadmap's tranche-P line is
marked done, leaving the composite tranche (C) next. Deep reconciliation of any
new upstream variant for a primitive family remains a tranche-A (final catalog
audit) concern, as the per-row roadmap ledger already states.
