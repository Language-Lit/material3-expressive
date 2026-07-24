# Material catalog parity roadmap

This is the canonical roadmap for bringing the public Material 3 component
catalog into `@language-lit/material3-expressive`. It plans future work; it is
not a support matrix. The generated
[supported-component matrix](SUPPORTED_COMPONENTS.md), derived from
`component-inventory.json`, remains the only stable support claim. ADR
[0033](adr/0033-material-catalog-parity-roadmap.md) governs this separation and
the primitive-first order.

## Boundary and snapshot

Catalog authority:
[Material 3 Components](https://m3.material.io/components), rendered and
accessed 2026-07-24.

The snapshot contains 36 top-level component-family tiles. The index's
`all-buttons` route is an aggregate view rather than a 37th family. Library
foundations and web adaptations such as `Material3Provider`, `Surface`, `Text`,
`Icon`, `Select`, `TextArea`, `NavigationSuite`, and `WavyProgress` remain
supported where the inventory says so, but they do not create extra Material
catalog rows.

The catalog is evolving. Before the final task in each roadmap tranche, refresh
the rendered index, record the new access date, and add, rename, or retire rows
through an approved documentation task. A removed first-party family is not
silently deleted: preserve its disposition until an ADR decides whether the
library support remains, deprecates, or is removed.

## Delivery classes

- **Primitive** — a focused visual or interactive building block whose public
  contract is useful independently, such as a badge, divider, button, or
  checkbox.
- **Composite** — a coordinated widget or container with multiple parts,
  focus/overlay/adaptive behavior, or meaningful child orchestration, such as a
  date picker, search surface, or sheet.
- **Mixed** — one catalog family needs both public components and documented
  compositions.
- **Recipe** — a tested composition of public components. A recipe has
  documentation, a playground example, accessibility coverage, and real-browser
  coverage where layout or interaction matters, but it does not add an export
  merely to reproduce a catalog example.

Classification is about the package delivery contract, not the informal size of
a UI. A future task may revise a row from primitive to mixed or composite when
its pinned source ledger proves that the family owns behavior that cannot be a
recipe. Such a revision requires an ADR when it affects public API or
cross-component architecture.

## Status rules

- **Conformant** — the current public inventory has conformant implementation
  coverage for the family. This does not waive a later snapshot reconciliation
  if Material adds variants.
- **Partial** — useful family coverage is conformant, but one or more official
  components or recipes in the family remain to be reconciled.
- **Planned** — no family implementation is claimed yet.
- **Excluded** — the family or a bounded part of it will not be implemented.
  Every exclusion needs a concrete Material/web rationale and owner-approved
  ADR; “not needed yet” is not an exclusion.

Only the inventory statuses defined by the specification are package
conformance statuses. The capitalized labels above describe roadmap rows and
must never be projected into stable documentation as support claims.

## Catalog ledger

| # | Official family | Delivery | Current coverage | Roadmap status | Remaining completion work |
| ---: | --- | --- | --- | --- | --- |
| 1 | [App bars](https://m3.material.io/components/app-bars/overview) | Composite | `AppBar` | Partial | Reconcile the overflow-action system (`AppBarRow`/`AppBarColumn`, behavior-owning per the completeness contract) in its own approved task; the search app bar specimen shipped with row 25 as `SearchAppBar` (T47) |
| 2 | [Badges](https://m3.material.io/components/badges/overview) | Primitive | `Badge`, `BadgeAnchor` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 3 | [Bottom sheets](https://m3.material.io/components/bottom-sheets/overview) | Composite | `BottomSheet` | Conformant | Reconcile new upstream variants at the final catalog audit; publish the `BottomSheetScaffold` app-shell recipe |
| 4 | [Button groups](https://m3.material.io/components/button-groups/overview) | Composite | `ButtonGroup` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 5 | [Buttons](https://m3.material.io/components/buttons/overview) | Primitive | `Button` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 6 | [Cards](https://m3.material.io/components/cards/overview) | Primitive | `Card` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 7 | [Carousel](https://m3.material.io/components/carousel/overview) | Composite | None | Planned | Layout strategies, scrolling/snapping, focus, semantics, and responsive recipes |
| 8 | [Checkbox](https://m3.material.io/components/checkbox/overview) | Primitive | `Checkbox` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 9 | [Chips](https://m3.material.io/components/chips/overview) | Primitive | `Chip` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 10 | [Date pickers](https://m3.material.io/components/date-pickers/overview) | Composite | None | Planned | Docked/modal, single/range/input modes, calendar grid, locale boundary, and validation |
| 11 | [Dialogs](https://m3.material.io/components/dialogs/overview) | Composite | `Dialog` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 12 | [Divider](https://m3.material.io/components/divider/overview) | Primitive | `Divider` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 13 | [Extended FABs](https://m3.material.io/components/extended-fab/overview) | Primitive | `FloatingActionButton` extended mode | Conformant | Reconcile new upstream variants at the final catalog audit |
| 14 | [FAB menu](https://m3.material.io/components/fab-menu) | Composite | `FabMenu` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 15 | [Floating action buttons](https://m3.material.io/components/floating-action-button/overview) | Primitive | `FloatingActionButton` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 16 | [Icon buttons](https://m3.material.io/components/icon-buttons/overview) | Primitive | `IconButton` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 17 | [Lists](https://m3.material.io/components/lists/overview) | Mixed | `ListItem`, `SegmentedListItem` | Partial | Inventory every documented list composition, including expansion, grouping, headers/dividers, media, links, and trailing controls; expose only behavior-owning APIs and deliver the rest as tested recipes |
| 18 | [Loading indicator](https://m3.material.io/components/loading-indicator/overview) | Primitive | `LoadingIndicator` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 19 | [Menus](https://m3.material.io/components/menus/overview) | Composite | `Menu` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 20 | [Navigation bar](https://m3.material.io/components/navigation-bar/overview) | Composite | `NavigationBar` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 21 | [Navigation drawer](https://m3.material.io/components/navigation-drawer/overview) | Composite | `NavigationDrawer` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 22 | [Navigation rail](https://m3.material.io/components/navigation-rail/overview) | Composite | `NavigationRail` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 23 | [Progress indicators](https://m3.material.io/components/progress-indicators/overview) | Primitive | `LinearProgress`, `CircularProgress`, `WavyProgress` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 24 | [Radio button](https://m3.material.io/components/radio-button/overview) | Primitive | `Radio` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 25 | [Search](https://m3.material.io/components/search/overview) | Composite | `SearchBar`, `SearchAppBar` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 26 | [Segmented buttons](https://m3.material.io/components/segmented-buttons/overview) | Composite | `SegmentedButtonGroup` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 27 | [Side sheets](https://m3.material.io/components/side-sheets/overview) | Composite | None | Planned | Standard/modal behavior, logical-side placement, dismissal/focus, and adaptive recipes |
| 28 | [Sliders](https://m3.material.io/components/sliders/overview) | Primitive | `Slider`, `RangeSlider` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 29 | [Snackbar](https://m3.material.io/components/snackbar/overview) | Composite | `Snackbar` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 30 | [Split buttons](https://m3.material.io/components/split-button) | Composite | `SplitButton` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 31 | [Switch](https://m3.material.io/components/switch/overview) | Primitive | `Switch` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 32 | [Tabs](https://m3.material.io/components/tabs/overview) | Composite | `Tabs` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 33 | [Text fields](https://m3.material.io/components/text-fields/overview) | Primitive | `TextField`, `TextArea` | Conformant | Reconcile new upstream variants at the final catalog audit |
| 34 | [Time pickers](https://m3.material.io/components/time-pickers/overview) | Composite | None | Planned | Dial/input modes, locale boundary, validation, focus, and dialog composition |
| 35 | [Toolbars](https://m3.material.io/components/toolbars/overview) | Mixed | `FloatingToolbar` | Partial | Reconcile the full toolbar family, including docked/floating and expansion/overflow compositions, plus the bottom app bar the current design index files here (`BottomAppBar`/`FlexibleBottomAppBar`, pinned in row 1's `AppBar.kt`; the flexible variant already reads `DockedToolbarTokens` — T46 recorded the disposition) |
| 36 | [Tooltips](https://m3.material.io/components/tooltips/overview) | Composite | `Tooltip` | Conformant | Reconcile new upstream variants at the final catalog audit |

Snapshot accounting: 29 Conformant + 3 Partial + 4 Planned = 36 families;
0 Excluded. Changing those totals requires changing a row in the same approved
task.

## Required order

Roadmap IDs are durable tranche labels, not pre-approved implementation tasks.
Each implementation still needs the scope/files/checks approval required by
`ACTIVE_TASK.md`.

1. **P — finish primitives (complete).** Divider landed in T42 and Badges in
   T43, giving every primitive family coverage, and T44 refreshed the primitive
   sources: all fifteen families were diffed against `androidx-main` HEAD and
   verified current, the eleven byte-identical components were re-pinned onto the
   reference snapshot `a90df2fc…`, and the four with a non-substantive upstream
   delta (Button, FloatingActionButton, Slider, LoadingIndicator) retained their
   pins with the delta classified (ADR 0036). The tranche is closed; a newly
   discovered primitive catalog family reopens it.
2. **C — implement composites (in progress).** After P is complete, implement
   App bars, Bottom sheets, Carousel, Date pickers, Search, Side sheets, and
   Time pickers. Sequence individual tasks by shared-platform prerequisites, not
   by table order. Bottom sheets landed first in T45, reusing the native
   `<dialog>` lifecycle ADR 0016 established; its `BottomSheetScaffold`
   app-shell recipe is owed to tranche R. App bars followed in T46, and Search
   in T47 — sequenced after it because the search app bar reuses T46's scroll
   primitive, and after Menu/Select because its docked surface reuses their
   anchored-overlay portal. Side sheets is sequenced last of the
   overlay group for a source reason rather than a preference: AndroidX ships no
   side-sheet implementation at any revision, so that family has no pinned
   first-party source to satisfy the completeness contract, and its task must
   either wait for one or carry an ADR justifying a design-specification-only
   port.
3. **R — close partial families and recipes.** Complete Lists and Toolbars,
   including official variants such as expanding lists, and publish tested
   recipes where a new public abstraction would duplicate composition.
4. **A — final catalog audit.** Refresh all 36 rows against the then-current
   official index and every family's detailed specification. Resolve every
   delta before making a catalog-parity claim.

Source discovery and task drafting may happen ahead of its tranche. Runtime
implementation may not skip the P-before-C gate without an owner-approved
roadmap amendment.

## Family-task completeness contract

Before a future family task is activated, its proposed scope must identify
immutable first-party implementation/token/test sources where available and
the current official design pages. Its executable or reviewable ledger must
account for:

- every current and deprecated first-party component/API in the pinned source;
- every official variant, size, state, slot, token, motion, and adaptive path;
- every behavior and screenshot case in the pinned first-party tests;
- every composition presented as a distinct specimen in the detailed Material
  specification, including expansion, overflow, selection, grouped, and
  responsive examples where applicable.

Each ledger entry receives exactly one result:

- public component/API;
- tested recipe using public components;
- native-web adaptation with its semantic reason;
- exclusion with a concrete reason and, for a catalog-level exclusion, an ADR.

A family is not complete merely because one primitive renders its row anatomy.
Conversely, a catalog specimen does not justify a package export when public
components already compose it without hidden behavior.

## Catalog-parity completion gate

The project may claim Material catalog parity only when:

- the catalog snapshot has been refreshed in the active completion task;
- every current top-level family has exactly one roadmap row;
- no row remains Planned or Partial;
- every family ledger has no unclassified variant, state, token, behavior, test
  case, or official composition;
- every public component used to satisfy a row is Conformant in
  `component-inventory.json`;
- every recipe used to satisfy a row has documentation, a production
  playground example, accessibility coverage, and required real-browser
  audits;
- every exclusion has the required owner-approved rationale; and
- all package verification and release gates pass.

Until then, “complete” describes only the explicitly qualified supported matrix,
not the full Material catalog.
