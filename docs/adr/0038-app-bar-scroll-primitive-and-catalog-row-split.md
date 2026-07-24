# ADR 0038: One `AppBar` across six top-bar variants, a web-native scroll primitive, and a catalog row split three ways

Status: accepted
Date: 2026-07-24
Task: T46

## Context

App bars is catalog row 1 and the second composite of tranche C. The pinned
revision is `a90df2fc27e026b9ad2ed569f203a260c1041fab`: all eighteen upstream
app-bar files were fetched at that revision and at `androidx-main` HEAD
(`477f94858de4569261d2ba58329e928d2683b7eb`, 2026-07-24) and are byte-identical,
extending the unified snapshot for a third consecutive task.

Three facts shaped every decision below.

**The source file and the design family have different boundaries.**
`AppBar.kt` holds six top-bar composables, a generic `TwoRowsTopAppBar`
builder, and the two bottom-bar composables — but the current design catalog no
longer files bottom bars under App bars at all. They moved to Toolbars, marked
"no longer recommended... replaced with the docked toolbar", and
`FlexibleBottomAppBar` already takes its geometry from `DockedToolbarTokens`,
another family's token file. Meanwhile the catalog's App bars page lists a
"Search app bar" specimen whose source is `SearchBar.kt`'s `AppBarWithSearch` —
a composable that borrows `AppBarTokens` colors but composes no top app bar.

**Scroll coupling is Compose-specific machinery.** Every sourced behavior —
`pinnedScrollBehavior`, `enterAlwaysScrollBehavior`,
`exitUntilCollapsedScrollBehavior` — is a `NestedScrollConnection` that the
consumer attaches to a scrollable and hands to the bar, letting the bar consume
scroll deltas before the list sees them. The web has no nested-scroll protocol:
a sticky header is `position: sticky`, and everything else is derived from the
scroll position of a named container. The source's own test file spends 24 of
its 105 cases on the scroll-driven color matrix across container flavors, which
is a measure of where this family's risk lives.

**The Expressive additions are a token axis, not new anatomy.**
`MediumFlexibleTopAppBar`/`LargeFlexibleTopAppBar` differ from the baseline
bars in heights and type roles (large: 152px/headline-medium; large flexible:
120px/display-small, 152px with subtitle) plus subtitle/alignment support. The
old `CenterAlignedTopAppBar` is the small bar with a centered title, and the
current catalog merged the specimen away entirely.

## Decision

1. **One public `AppBar` with `size` × `flexible` × `titleAlignment` ×
   `subtitle`.** The source's six composables collapse along axes the source
   itself already treats as configuration. The type surface is a discriminated
   union: `flexible` is rejected on small (no such variant exists),
   `subtitle`/`titleAlignment` are rejected on baseline medium/large (they are
   flexible-only upstream), and `exitUntilCollapsed` is rejected on small
   (no second row to collapse). Runtime warnings mirror each rejection for JS
   consumers.

2. **The catalog row splits three ways, and lands Partial.** Bottom bars are
   dispositioned to row 35, where the design catalog now files them — the
   first time one row's pinned file carries another row's components, which
   the ledger accounts for at composable granularity. The search app bar is
   row 25's source. The overflow-action system is deferred to a named
   follow-up but keeps this row Partial: auto-overflow measures available
   width and relocates actions into a menu, which is hidden behavior a recipe
   composed from `Menu` and `IconButton` cannot express, so under the
   completeness contract it must eventually be an API. This is the `Lists`
   pattern (Partial with named remainder), deliberately not the
   `BottomSheetScaffold` pattern (Conformant with a recipe owed), because a
   recipe cannot discharge behavior-owning surface.

3. **A scroll primitive with exactly three outputs.** `useAppBarScroll`
   observes one container — the window by default, an element ref opt-in —
   and produces a scrolled flag, a collapse fraction, and an enter-always
   offset, written imperatively as data attributes and custom properties.
   React renders the resting state once; scroll-frequency updates never
   re-render. A page restored mid-scroll applies its position at mount, and a
   page at rest writes nothing, so server and client markup stay identical.
   `position: sticky` supplies pinning natively; the primitive never
   repositions the bar.

4. **The behaviors map with their character preserved.** Pinned swaps the
   container color at any overlap (the source animates a binary swap past
   `overlappedFraction > 0.01`; the web reading is `scrollTop > 0` with the
   default-effects transition). Enter-always accumulates raw deltas into an
   offset clamped to the bar's height — hide on any down-scroll, begin
   revealing on any up-scroll — and replaces the source's velocity
   fling-settle with a 150ms idle snap to the nearer edge, transitioning only
   while settling so the bar otherwise tracks the finger exactly (the same
   rule as T45's drag). Exit-until-collapsed derives the fraction
   deterministically from scroll position over the sourced collapse range,
   which subsumes "remain small until scrolled back to the top" and leaves no
   independent state for the source's mid-collapse snap to act on; that snap
   is recorded as excluded-by-construction rather than omitted.

5. **Two color models, because the source has two.** A single-row bar snaps
   between container and on-scroll color. A two-row bar lerps continuously
   with the collapse fraction; the port paints an overlay in the on-scroll
   color whose opacity is the fraction, and alpha-compositing an opaque color
   over an opaque color is arithmetically the source's srgb lerp. The overlay
   is a negative-z-index `::before` inside an isolated stacking context, so it
   sits above the bar's background and below its content.

6. **The title crossfade carries the sourced curve and threshold.** The
   collapsed title's alpha is `TopTitleAlphaEasing` —
   cubic-bezier(.8, 0, .8, .15) — evaluated in the primitive, because CSS
   cannot apply an easing function to a custom property; the expanded title
   fades as `1 − fraction` in CSS. Exactly one title copy is exposed to
   assistive technology at a time, swapping at fraction 0.5, the source's own
   `hideTopRowSemantics` threshold.

7. **`<header>`, slot title, focus reveal.** The root is a `banner` landmark
   in body context. The title is a slot, never an automatic heading — the
   specification forbids coupling typography to document structure. The
   accessibility page's "maintain access to app bar actions when content is
   scrolled" is satisfied structurally by pinned/collapsing bars and by a
   focus-within reveal on enter-always bars; the source's own affordance for
   the same requirement (auto-disabling behaviors under TalkBack) is an
   Android service query with no web equivalent, and the focus reveal is the
   web-native answer.

8. **Collapse fraction is not controllable.** It is a measurement of the
   user's scroll position; a controlled fraction would be a controlled scroll.
   This is the same class of deviation from the controlled/uncontrolled rule
   as T45's drag offset, documented rather than papered over with a prop no
   consumer could honestly drive.

9. **Token registration follows the read path.** Six `AppBarTokens` color
   roles registered; `ContainerElevation` travels with the bottom-bar
   disposition; seven roles recorded unread — including
   `LeadingSpace`/`TrailingSpace`, which the implementation shadows with its
   own hand-tuned 4dp constant, so `horizontal-padding` registers the
   constant the code actually reads (T42's rule). All fifteen tier roles are
   read: seven height tokens, with typography consumed from the baseline
   typescale in CSS as every component here does.

10. **The rendering audit learns to scroll.** jsdom sees none of this
    family's substance — sticky pinning, collapse geometry, the color swap,
    the 64/112/136/120/152 heights are all layout facts. The audit gains a
    probe that scrolls the page and asserts them, and the probe must be
    proven non-vacuous like T42's and T45's.

## Consequences

- Consumers get all six top-bar variants, three scroll couplings, sourced
  collapse geometry, and the accessibility contract from one export with no
  scroll-listener code of their own.
- The row-split precedent is now explicit: a catalog row follows the design
  index's family boundary, not the source file's, and a pinned file may carry
  entries whose disposition points at another row — accounted, never silently
  skipped.
- `useAppBarScroll` is deliberately app-bar-shaped, not a generic scroll
  service. If Search's bar or a future docked toolbar needs the same coupling,
  extracting the shared core is that task's decision, with two consumers in
  hand rather than one.
- The overflow-action follow-up inherits a clean seam: `AppBar`'s `actions`
  slot is where an `AppBarRow` equivalent will mount, and nothing in this
  design presumes its API.
- Enter-always plus an inner `scrollContainer` requires the consumer to place
  the bar inside that container for `position: sticky` to pin it there — the
  documented cost of the web having no nested-scroll protocol.
