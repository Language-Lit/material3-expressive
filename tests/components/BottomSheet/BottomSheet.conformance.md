# BottomSheet conformance

Task: T45
Status: conformant
Reviewed: 2026-07-24

## Primary references

- Material 3 Bottom sheets, accessed 2026-07-24:
  <https://m3.material.io/components/bottom-sheets/overview>
- Material 3 Bottom sheets specs, accessed 2026-07-24:
  <https://m3.material.io/components/bottom-sheets/specs>
- Material 3 Bottom sheets guidelines, accessed 2026-07-24:
  <https://m3.material.io/components/bottom-sheets/guidelines>
- Material 3 Bottom sheets accessibility, accessed 2026-07-24:
  <https://m3.material.io/components/bottom-sheets/accessibility>
- Pinned `BottomSheet.kt`, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/BottomSheet.kt>
- Pinned `ModalBottomSheet.kt`, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ModalBottomSheet.kt>
- Pinned `BottomSheetScaffold.kt`, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/BottomSheetScaffold.kt>
- Pinned `SheetDefaults.kt`, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/SheetDefaults.kt>
- Pinned generated `SheetBottomTokens.kt`, accessed 2026-07-24:
  <https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SheetBottomTokens.kt>
- HTML Standard, the `dialog` element, accessed 2026-07-24:
  <https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element>
- WAI-ARIA 1.2 `region` role, accessed 2026-07-24:
  <https://www.w3.org/TR/wai-aria-1.2/#region>

Supported baseline: AndroidX Material 3 revision
`a90df2fc27e026b9ad2ed569f203a260c1041fab` — the reference snapshot T44 adopted
for the primitive tranche. All eleven pinned sheet files were fetched at that
revision and at `androidx-main` HEAD
(`0f056f78299610de8a8dc1511671519aab75657d`, committed 2026-07-23) and compared
byte-for-byte; every one is identical, so this family joins the unified snapshot
rather than opening a second one. Generated `SheetBottomTokens.kt` identifies
version `v0_210`.

## Public-source surface ledger

Eighty-six current entries across `BottomSheet`, `ModalBottomSheet`,
`ModalBottomSheetProperties`, `ModalBottomSheetDefaults`, `BottomSheetScaffold`,
`BottomSheetScaffoldState`, `rememberBottomSheetScaffoldState`, `SheetValue`,
`SheetState`, `rememberBottomSheetState`, and `BottomSheetDefaults`. Seven
deprecated entries: `rememberModalBottomSheetState`,
`rememberStandardBottomSheetState`, `BottomSheetDefaults.windowInsets`, and the
four hidden binary-compatibility `SheetState` constructor and `Saver` overloads.

The two sheet composables map to one `variant` prop rather than two React
exports, following the one-component-per-variant rule `NavigationDrawer`
established for the same modal/non-modal split. They differ in exactly what the
prop selects: whether the sheet owns a window and a scrim.

`BottomSheetScaffold` is *not* mapped to an export. Beyond the sheet it is an
app-shell layout owning `topBar`, `snackbarHost`, and `content(PaddingValues)` —
composition that public components already express with no hidden behavior,
which the catalog roadmap's completeness contract names as the recipe case. Its
sheet behavior is fully retained: `sheetPeekHeight` is the anchor
`variant="standard"` rests on, and `sheetSwipeEnabled`, `sheetDragHandle`,
`sheetMaxWidth`, and `confirmValueChange` all have direct props.

`SheetState` is not exposed as an object. Its observable contract —
`currentValue`, `targetValue`, `isVisible`, `expand`/`partialExpand`/`show`/
`hide` — is expressed as the `value`/`defaultValue`/`onValueChange` triple this
library uses everywhere, so a consumer moves the sheet by setting state rather
than by calling suspend functions on a handle. `requireOffset`,
`anchoredDrag`, `newOffsetForDelta`, and the `Saver` machinery are Compose
plumbing with no React equivalent. `modifier`, `tonalElevation`, `shadowElevation`,
`shape`, `containerColor`, `contentColor`, and `scrimColor` are adapted to
component tokens rather than props, for the reason T42 recorded: an arbitrary
per-instance value would have to be emitted as an inline style, while a scoped
`--m3e-comp-bottom-sheet-*` override composes with the theme and survives server
rendering.

## Generated-role completeness ledger

`SheetBottomTokens` declares nine roles. The four pinned sheet sources resolve
seven of them, and both unread roles are recorded rather than quietly dropped:

| Role | Disposition |
| --- | --- |
| `DockedContainerColor` | read → `--m3e-comp-bottom-sheet-container-color` |
| `DockedContainerShape` | read → `--m3e-comp-bottom-sheet-container-shape` |
| `DockedMinimizedContainerShape` | read → `--m3e-comp-bottom-sheet-hidden-container-shape` |
| `DockedModalContainerElevation` | read → `--m3e-comp-bottom-sheet-container-shadow` |
| `DockedDragHandleColor` | read → `--m3e-comp-bottom-sheet-drag-handle-color` |
| `DockedDragHandleWidth` | read → `--m3e-comp-bottom-sheet-drag-handle-width` |
| `DockedDragHandleHeight` | read → `--m3e-comp-bottom-sheet-drag-handle-height` |
| `DockedStandardContainerElevation` | unread — never resolved |
| `FocusIndicatorColor` | unread — never resolved |

`DockedStandardContainerElevation` is the notable one.
`BottomSheetDefaults.Elevation` reads `DockedModalContainerElevation` and both
variants use it, so the standard role has no resolution path at all. Both are
`Level1` today, so registering the read role changes no rendered value — but it
keeps the registration on the path the source renders, which is exactly the
correction T42 had to apply retroactively to the `Tabs` divider. `FocusIndicatorColor`
has no sheet-specific expression here because focus indication is the shared
`sys.state` treatment.

Four sourced values are not generated roles: `SheetPeekHeight` (56dp),
`SheetMaxWidth` (640dp), the private `DragHandleVerticalPadding` (22dp), and
`BottomSheetDefaults.DragHandle`'s `MaterialTheme.shapes.extraLarge`. The scrim
is `ScrimTokens.ContainerColor` at `ContainerOpacity` (`Scrim`, `0.32f`) — the
same pair `dialog` registered, but with stronger provenance: the dialog values
had to be cross-validated against material-web because the pinned Compose dialog
dims its window with an Android platform default, whereas the sheet reads a real
generated token.

## Anatomy and slots

Container, optional drag handle, and content. The modal variant adds a scrim,
painted as the native `<dialog>`'s `::backdrop` rather than an author element.
The design specification lists exactly these elements and names the container as
the only required one, which matches: `dragHandle={false}` removes the handle
and the sheet still renders.

## States

`hidden`, `partiallyExpanded`, and `expanded`, mapping `SheetValue` one to one.

The partial anchor is variant-specific in the source and is reproduced as such.
A modal sheet anchors at `fullHeight - min(fullHeight / 2, sheetHeight)`, so it
reveals the lesser of half the container and its own content; `max-block-size:
50%` expresses that minimum exactly, because a shorter sheet keeps its content
height. A standard sheet anchors at `layoutHeight - peekHeightPx`, a fixed
visible band, so it is a `block-size` rather than a maximum.

A standard sheet has no hidden anchor by default: the source's
`rememberBottomSheetScaffoldState` builds its state with
`enabledValues = setOf(PartiallyExpanded, Expanded)`. Dragging or activating it
down therefore stops at the peek height, while a modal sheet dismisses.

## Motion

The container transitions `block-size`, `max-block-size`, and `transform` with
`--m3e-sys-motion-expressive-default-spatial-*`, matching the source's
`MaterialTheme.motionScheme.defaultSpatialSpec` for show and settle. The
transition is suppressed while a pointer is down so the sheet tracks the finger
rather than easing toward each intermediate offset, and removed entirely under
`prefers-reduced-motion`, which leaves an instant, correct height change.

Compose's `verticalScaleUp`/`verticalScaleDown` are not reproduced: they exist
to hide a gap when a spring overshoots past the min anchor, and a CSS transition
does not overshoot.

## DOM structure and native behavior

Modal renders `<dialog class="m3e-bottom-sheet">` opened with `showModal()`,
containing the sheet container. The `open` attribute is never written from JSX,
so server output always paints closed — a `<dialog open>` is a non-modal reveal
with no backdrop, focus trap, or inert background, which would be a different
component. This is the lifecycle ADR 0016 established for `Dialog` and ADR 0020
reused for `NavigationDrawer`, duplicated again here for the same reason those
two did not share it: only one variant needs it, and the dismissal nuances
differ.

Because the sheet is a *child* of the dialog rather than the dialog box itself,
a click whose target is the dialog element is unambiguously a scrim click. This
needs no bounding-rect test, unlike `Dialog` and `NavigationDrawer`, whose
dialog element *is* the visible box.

Standard renders a plain `<div role="region">` with no top layer and no scrim.

## Accessible name, role, state, and keyboard interaction

The accessible name sits on the root of either variant. A modal sheet's root is
a `<dialog>`, which already carries the `dialog` role and, once `showModal()`
runs, native modality; naming an inner box instead would leave an unnamed dialog
wrapping a named one. A standard sheet is exposed as a named `region` rather
than a dialog, because it docks inline and leaves the page interactive — the web
semantic for the source's `paneTitle`, and an instance of the specification's
rule that a native web semantic wins where the platforms differ.

The drag handle is a native `<button>`, so the accessibility guidance's keyboard
table — Tab to reach the handle, Space or Enter to move between heights — is
native rather than reconstructed, and the guidance's requirement of a
single-pointer alternative to dragging is satisfied by the same element. Its
activation runs the source's `clickable` cycle, and its label names the action
it will perform, mapping the source's `dismiss`/`expand`/`collapse` semantics
actions. `aria-expanded` reports expansion and `aria-controls` points at the
content region the handle resizes.

The handle's box is 48px tall: 22px of sourced padding above and below the
sourced 4px bar. The guidance independently requires a 48dp target for a
sheet's resize affordance, so the sourced spacing and the accessibility
requirement agree rather than needing reconciliation.

## Bidirectional and adaptive behavior

Every dimension uses logical properties, so the sheet survives a writing-mode
change. The container is centred and capped at the sourced 640px, which is the
source's own adaptive rule for medium and expanded windows.

The design guidance additionally suggests swapping a bottom sheet for a side
sheet at desktop-class widths. That is not implemented here and is not a defect
in this row: AndroidX has no side-sheet implementation at all, so the Side sheets
catalog family has no pinned source to port yet and remains Planned.

## Known web-specific deviations

- **Predictive back is excluded.** It is an Android system gesture with no web
  equivalent. Every one of the five pinned screenshot cases covers it, which is
  why this family's screenshot ledger contributes no visual case here.
- **`securePolicy` is excluded.** An Android window flag with no web equivalent.
- **Nested-scroll drag consumption is excluded.** The source drags the whole
  surface and steals scroll from sheet content; dragging here is handle-only,
  which avoids arbitrating against a scrollable content area and still satisfies
  the guidance's non-drag requirement. Release still settles with the source's
  own `PositionalThreshold` (56dp) and `VelocityThreshold` (125dp).
- **Kotlin binary-compatibility shims are excluded** — the same class T44
  classified for `RangeSliderLegacy`.
- **`standardWindowInsets` is adapted, not excluded.** `safeDrawing` restricted
  to its bottom side becomes `env(safe-area-inset-bottom)`, which is zero on
  displays with no such intrusion.
- **A controlled sheet's native dismissal is reported, not reverted.** The same
  native-truth rule ADR 0016 recorded for `Dialog`: a `<dialog>`'s open state
  has no React-owned reconciliation to snap it back.
