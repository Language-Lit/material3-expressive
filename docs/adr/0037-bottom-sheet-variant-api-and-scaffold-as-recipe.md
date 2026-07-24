# ADR 0037: One `BottomSheet` with a variant prop, the scaffold as a recipe, and a handle-only drag

Status: accepted
Date: 2026-07-24
Task: T45

## Context

T44 closed the catalog roadmap's primitive tranche, which gates tranche C.
Bottom sheets is catalog row 3 and the first composite implemented under that
gate.

The pinned revision is `a90df2fc27e026b9ad2ed569f203a260c1041fab`, the reference
snapshot T44 adopted. This was verified rather than assumed: all eleven upstream
sheet files — `BottomSheet.kt`, `BottomSheetScaffold.kt`, `ModalBottomSheet.kt`,
`SheetDefaults.kt`, generated `SheetBottomTokens.kt`, and the six pinned test
files — were fetched at that revision and at `androidx-main` HEAD
(`0f056f78299610de8a8dc1511671519aab75657d`, committed 2026-07-23) and compared
byte-for-byte. Every one is identical, so the family extends T44's unified
snapshot instead of opening a second one.

Upstream splits the family across three public composables, which is the central
translation problem:

- `BottomSheet` is the surface and gesture behavior, rendered inline in the
  composition. It provides no scrim and blocks nothing.
- `ModalBottomSheet` wraps that in `ModalBottomSheetDialog`, a platform dialog
  window, and adds a scrim, focus management, and outside-click and back-press
  dismissal.
- `BottomSheetScaffold` is an app-shell layout: it owns `topBar`,
  `snackbarHost`, and `content(PaddingValues)`, and docks a sheet beneath them
  at `sheetPeekHeight`.

The three do not partition cleanly by "sheet" versus "not sheet". The scaffold
genuinely owns sheet behavior the other two lack — a peek-height anchor rather
than the half-container anchor `BottomSheet` computes — while also owning layout
that has nothing to do with sheets.

`SheetState` carries the state machine: three `SheetValue`s, a
`confirmValueChange` veto, an `enabledValues` set that decides which anchors
exist, and suspend `expand`/`partialExpand`/`show`/`hide` methods. Notably,
`rememberBottomSheetScaffoldState` builds its state with
`enabledValues = setOf(PartiallyExpanded, Expanded)` — a standard sheet has no
hidden anchor unless one is asked for.

The web platform supplies, natively, most of what `ModalBottomSheetDialog`
implements by hand: `<dialog>` with `showModal()` gives a top layer, a
`::backdrop`, a focus trap, an inert background, and focus restoration on close.
ADR 0016 established that lifecycle for `Dialog` and ADR 0020 reused it for
`NavigationDrawer`.

Material's own accessibility page for this family is unusually specific: it
requires a single-pointer alternative to any drag, specifies a 48dp target for
the resize affordance, and gives a keyboard table — Tab reaches the drag handle,
Space or Enter moves between available heights.

## Decision

1. **One public `BottomSheet` with `variant="modal" | "standard"`.** This
   follows the one-component-per-variant rule `NavigationDrawer` set for the
   same modal/non-modal split, not the one-component-per-axis rule ADR 0031 set
   for `VerticalSlider`. The two source sheet composables differ in exactly what
   the prop selects — whether the sheet owns a window and a scrim — so a second
   export would duplicate the entire state, gesture, and token surface to vary
   one behavior.

2. **`BottomSheetScaffold` is a recipe, not an export; its sheet behavior is
   not.** The scaffold's `topBar`/`snackbarHost`/`content` slots are app-shell
   composition that public components already express with no hidden behavior,
   which the catalog roadmap's family-task completeness contract names as the
   recipe case. Splitting the row this way keeps the distinction honest: the
   scaffold's *layout* is excluded, while its *sheet* — the peek-height anchor,
   swipe toggle, drag-handle slot, and max width — is exactly what
   `variant="standard"` reproduces. A row is not satisfied by rendering an
   anatomy, so the sheet half had to be kept.

3. **The partial anchor stays variant-specific, because the source's is.** A
   modal sheet anchors at `fullHeight - min(fullHeight / 2, sheetHeight)`, which
   `max-block-size: 50%` expresses exactly — the CSS maximum yields the same
   minimum, since a shorter sheet keeps its content height. A standard sheet
   anchors at `layoutHeight - peekHeightPx`, a fixed visible band, so it is a
   `block-size`. `peekHeight` is therefore rejected by the type system on a
   modal sheet: the source has no peek anchor there, and silently ignoring the
   prop would be worse than refusing it.

4. **`SheetState` becomes the library's controllable-state triple.** `value`/
   `defaultValue`/`onValueChange` over `'hidden' | 'partiallyExpanded' |
   'expanded'` replaces a state object with suspend methods, so a consumer moves
   the sheet by setting state like every other component in this library.
   `confirmValueChange` is kept as a prop and gates every path into a new
   position — drag, click, keyboard, Escape, and scrim alike — matching the
   source, which checks it inside `animateTo`. The source's `enabledValues` is
   not exposed as a set; instead the variant implies it, because the only
   configuration the source itself ships is the scaffold's
   `{PartiallyExpanded, Expanded}` versus the modal's full three. This is why
   dragging a standard sheet down stops at its peek height while a modal sheet
   dismisses.

5. **Modal renders a native `<dialog>` and the sheet is its child.** The `open`
   attribute is never written from JSX — a `<dialog open>` is a non-modal reveal
   with no backdrop, focus trap, or inert background — so server output always
   paints closed and an effect performs every `showModal()`/`close()`. This
   duplicates the small lifecycle `Dialog` and `NavigationDrawer` already run
   rather than extracting a shared primitive, the same call ADR 0020 made and
   for the same reason: only one variant needs it, and the dismissal nuances
   differ per component.

   One nuance genuinely improves here. `Dialog` and `NavigationDrawer` must test
   a click's coordinates against `getBoundingClientRect()` to tell a backdrop
   click from a content click, because their dialog element *is* the visible
   box. This sheet's dialog element is a transparent full-viewport container
   with the sheet as a child, so `event.target === dialogElement` is already an
   unambiguous scrim click and no bounding-rect test is needed.

6. **The accessible name goes on the root of either variant, and a standard
   sheet is a `region`, not a dialog.** Naming an inner box would leave an
   unnamed `<dialog>` wrapping a named one. A standard sheet docks inline and
   leaves the page interactive, so `role="dialog"` would wrongly imply modality;
   `region` is the web semantic for the source's `paneTitle`. This is the
   specification's rule that a native web semantic wins where the platforms
   differ, applied to a case where Material's own vocabulary has one name
   ("sheet") for two different web semantics.

7. **The drag handle is a native `<button>`.** Material's accessibility guidance
   for this family specifies Tab-to-handle and Space/Enter-to-cycle, and
   requires a single-pointer alternative to dragging. A real button supplies all
   of that natively — focusability, key activation, and the alternative itself —
   instead of reconstructing it with `tabIndex` and key handlers. Its activation
   runs the source's own `clickable` cycle and its label names the action it
   will perform, mapping the source's `dismiss`/`expand`/`collapse` semantics
   actions.

   The sourced spacing and the accessibility requirement agree rather than
   conflicting: 22px of `DragHandleVerticalPadding` above and below the sourced
   4px bar is a 48px box, which is exactly the target size the guidance asks for.

8. **Dragging is handle-only.** The source drags the whole surface through a
   nested-scroll connection that steals scroll from sheet content. That
   arbitration exists because Compose must reconcile a draggable container with
   a scrollable child; a handle-only drag does not have the conflict at all, and
   the guidance requires a non-drag alternative regardless. Release still
   settles with the source's own `PositionalThreshold` (56dp of travel) and
   `VelocityThreshold` (125dp/s), so the settle decision is sourced even though
   the gesture surface is narrower. Recorded as a deliberate narrowing, not an
   omission.

9. **Excluded, each with a concrete reason.** Predictive back and all five of
   the family's pinned screenshot cases (an Android system gesture with no web
   equivalent — which is why this family contributes no screenshot case);
   `securePolicy` (an Android window flag); `verticalScaleUp`/`verticalScaleDown`
   (they hide a gap when a Compose spring overshoots the min anchor, and a CSS
   transition does not overshoot); and the deprecated
   `rememberModalBottomSheetState`/`rememberStandardBottomSheetState` and hidden
   `SheetState` constructor/`Saver` overloads (Kotlin binary-compatibility
   shims, the class T44 classified for `RangeSliderLegacy`).

   `standardWindowInsets` is adapted rather than excluded: `safeDrawing`
   restricted to its bottom side becomes `env(safe-area-inset-bottom)`, which is
   zero where there is no intrusion.

10. **Seven of nine generated roles are registered; both unread roles are
    recorded.** `DockedStandardContainerElevation` is declared but never
    resolved — `BottomSheetDefaults.Elevation` reads
    `DockedModalContainerElevation` for both variants — and `FocusIndicatorColor`
    has no resolution path in any pinned sheet source. Both are `Level1` and the
    shared `sys.state` focus treatment respectively, so registering the read
    role changes no rendered value; it keeps the registration on the path the
    source renders, which is the correction T42 had to apply retroactively to
    the `Tabs` divider. `drag-handle-shape` registers the source's
    `MaterialTheme.shapes.extraLarge` rather than the pill it visually clamps to
    at 32x4, for the same reason.

11. **Raise only the declaration-closure budget.** T45 measures a
    385,273-byte imported JavaScript closure (67,038 gzip), a 95,381-byte
    declaration closure (22,048 gzip), a 440,258-byte full stylesheet (47,946
    gzip), a 129,442-byte token stylesheet (11,368 gzip), and a 387,079-byte
    packed package. Only the declaration closure breaches its ceiling, and by
    about 2.5%; the overage is essentially this component's own declarations and
    their consumer-facing documentation comments. Unlike ADR 0031 — which
    rebased every baseline because four of five were breached — this raises the
    one breached artifact, preserving the headroom ratio that artifact already
    encoded, and leaves the four passing ceilings untouched so they keep
    catching regressions.

## Consequences

- Consumers get both Material sheet variants, all three positions, a veto hook,
  a scrim, a focus trap, and a keyboard-operable resize affordance from one
  component and one controlled/uncontrolled pair, with no focus-trap library,
  portal, or `aria-modal` bookkeeping.
- The catalog row is satisfied without an export for every source composable.
  Future composite rows can cite this split — layout slots to a recipe, sheet
  behavior to the component — when a source type mixes app-shell layout with
  component behavior.
- `region` versus `dialog` by variant establishes that one Material component
  name may map to two different web roles, and that the choice follows what the
  variant actually does to the page rather than what the family is called.
- A third component now runs the native-`<dialog>` lifecycle independently.
  If a fourth needs it, the duplication is worth revisiting as a shared internal
  primitive; three instances with genuinely different dismissal rules is the
  evidence, and this ADR is where that count is recorded.
- The handle-only drag is the one place this port is deliberately narrower than
  the source's gesture surface. If a future task ports whole-surface dragging,
  it must solve the drag-versus-scroll arbitration the source solves with
  nested scroll, and should not treat this decision as precedent for skipping it.
- Side sheets, the sibling row the design guidance points to for desktop-class
  widths, remains Planned and cannot be ported the same way yet: AndroidX ships
  no side-sheet implementation, so that row has no pinned source at all.
