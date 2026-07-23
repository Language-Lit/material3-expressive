# ADR 0030: One native-button Chip family with a pinned source ledger

Status: accepted
Date: 2026-07-23
Task: T38

## Context

The pinned AndroidX revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc` exposes ten current Chip
composable paths: flat/elevated assist, standard/Expressive flat filter,
standard/Expressive elevated filter, standard/Expressive input, and
flat/elevated suggestion. It also retains deprecated overloads for binary
compatibility, four defaults objects, five current public value classes plus
deprecated `ChipBorder`, two distinct content implementations, and five
generated token files.

The source API shape is strongly Compose-specific. It separates each purpose
into a top-level composable, passes behavior through `Modifier`,
`MutableInteractionSource`, and composable lambdas, and accepts per-instance
color/elevation/border/shape objects. Its selectable chips publish Compose
`Role.Checkbox`, while their rendered interaction surface is button-like and
their label may contain decorative leading/trailing content.

There are also details that disappear in a superficial port:

- every content row always has three children, so a missing zero-width slot
  still contributes arrangement spacing;
- the Expressive arrangement uses a different leading gap when only a trailing
  icon exists;
- input avatar content replaces, rather than accompanies, a leading icon;
- selectable slots retain their old content while exiting;
- `SelectableChipElevation` does not resolve on selected state despite selected
  names in the generated tokens;
- generated hover/focus/press color roles are not read by `ChipColors` or
  `SelectableChipColors`;
- elevated suggestion defaults read assist-chip disabled icon and container
  opacity roles even though same-valued suggestion roles exist;
- elevated filter's disabled trailing icon reads the leading-icon opacity role
  despite having an identically-valued trailing opacity role;
- the customizable `elevatedAssistChipColors(...)` overload copies suggestion
  defaults, while its zero-argument sibling reads the correct assist defaults;
- both elevation value classes omit `draggedElevation` from equality and hash
  behavior even though they store and render it;
- the source exposes dragged elevation through its interaction stream.

T38 is explicitly completeness-gated: each of these paths must be translated,
adapted with a named web contract, or excluded with a concrete reason.

## Decision

1. **Expose one discriminated `Chip` component.** `kind` is required and is
   `assist`, `filter`, `input`, or `suggestion`. `variant` is `flat` or
   `elevated` where the source defines both; the input branch statically accepts
   only `flat`. `shape="expressive"` is available only to filter and input,
   matching the source's `ChipShapes` overloads. This maps every current
   composable path without multiplying nearly identical React exports.

2. **Render one native `<button>` root.** It owns native pointer, Enter, Space,
   focus, disabled, form, ref, and event-cancellation behavior. Its default
   `type="button"` makes form submission opt-in. Assist and suggestion are
   momentary buttons. Filter and input are native toggle buttons with
   `aria-pressed`, replacing Compose `Role.Checkbox`; a semantic
   `<input type="checkbox">` cannot contain the source's label and visual slots,
   while a button with pressed state directly represents this button-shaped
   control on the web.

3. **Selection follows the shared controlled/uncontrolled contract.** Filter
   and input accept either `selected` plus required `onSelectedChange`, or
   `defaultSelected` plus an optional callback. Consumer `onClick` runs first,
   and `preventDefault()` cancels the internal toggle. Momentary branches
   reject selection props at the type boundary.

4. **Keep the source's stable three-child content row.** The visual container
   always renders leading slot, label, and trailing slot. A missing slot has
   zero inline size but retains its adjacent arrangement gap, reproducing the
   source's zero-width `Spacer`. Standard 8px spacing and Expressive 4/8px
   conditional spacing are CSS variables over stable `data-m3e-*` attributes.
   Input's 4/8px logical edge padding follows avatar/leading/trailing presence.

5. **Slots are decorative and owned by the button's name.** Both outer slot
   wrappers are `aria-hidden`; visible label content, `aria-label`, or
   `aria-labelledby` names the root. Input avatar takes precedence over
   `leadingIcon`. Suggestion exposes no trailing slot. Direct public `Icon`,
   SVG, and image children are constrained to the sourced 18px icon box; input
   avatar is clipped to the sourced 24px full corner.

6. **Retain selectable slot content during exit.** A ref stores the last
   non-null leading and trailing nodes. Visibility controls width and opacity,
   while the old node stays mounted until replaced, which is the React
   equivalent of `rememberRetainedState`. Standard selectable slots use the
   source's slow-effects/fast-spatial entrance and
   fast-effects/default-effects exit. Expressive overloads use
   default-effects opacity and fast-spatial size in both directions.

7. **Translate shapes and elevation into CSS state.** Standard chips keep the
   small corner. Expressive chips use medium unselected, full selected, and
   small pressed corners with fast-spatial motion. Enabled elevation changes
   use the theme's effects projection; disabled snaps through native state
   resolution and reduced motion removes all transitions. Native `draggable`
   events set a private dragged state so the source's Level 4 path remains
   reachable without adding a new public prop.

8. **Register only roles the pinned implementation observes.** Same-valued
   enabled hover/focus/press colors collapse to the base role because the
   source's color resolvers never read the generated state-specific names; the
   state layer conveys interaction. The conformance ledger and
   `Chip.source.test.ts` record every generated role as read or unread.
   Cross-family suggestion reads remain explicit references to assist-chip
   variables instead of being normalized away. Provider-level component token
   overrides replace Compose's arbitrary per-instance colors/elevations/borders.

9. **Exclude compatibility and platform plumbing, not observable output.**
   Deprecated overloads exist only for Android binary/source compatibility and
   are not separate React APIs. `Modifier`, `MutableInteractionSource`,
   `BorderStroke`, `PaddingValues`, `Arrangement.Horizontal`, Compose
   `State<Color>`, and custom measure policies are platform mechanisms.
   Their observable semantics, geometry, color, outline, state, and motion
   results remain implemented and tested.

10. **Freeze the audit inputs in executable tests.** The source ledger records
    all 19 current public composable/default/value-class entries, all 14
    deprecated compatibility entries, eight pinned implementation anomalies,
    every generated token declaration and its literal read/unread partition,
    all 59 pinned `ChipTest` cases, and all 34 pinned screenshot cases. Focused
    behavior, accessibility, CSS, type, theme, SSR, source, playground, and
    real-browser checks enforce their web translations.

## Consequences

- The package gains one component and four named types without adding a package
  export path, runtime dependency, or non-React peer.
- Consumers select purpose explicitly. Invalid combinations such as elevated
  input, selected assist, suggestion trailing icon, or filter avatar fail in
  TypeScript; development warnings make untyped runtime misuse visible.
- A source update can be audited mechanically: changed generated-role or
  first-party-test counts fail the frozen ledger until each new item is
  classified.
- The DOM stays one native interactive root. Slot nodes cannot become nested
  actions; interactive multi-action content belongs in another component.
- Simultaneous CSS pseudo-class elevation follows stable pressed/dragged/hover/
  focus cascade priority rather than reproducing Compose's last-interaction
  list ordering. Each individual source state and value is preserved.
- Per-instance arbitrary Material token objects are intentionally absent.
  Stable theme tokens keep the API smaller and preserve SSR without runtime
  stylesheet injection.
