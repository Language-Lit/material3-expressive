# BottomSheet

`BottomSheet` is the sheet that rises from the bottom edge to carry supporting
content or actions. One component covers both Material sheet variants through a
`variant` prop: a **modal** sheet renders a native `<dialog>` with a scrim and
blocks the page behind it, and a **standard** sheet docks inline and leaves the
page live.

```tsx
import { BottomSheet, Button } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

// A modal sheet, opened from a button.
const [value, setValue] = useState<BottomSheetState>('hidden')

<Button onClick={() => setValue('partiallyExpanded')}>Share</Button>
<BottomSheet aria-label="Share" value={value} onValueChange={setValue}>
  <p>Sheet content</p>
</BottomSheet>

// A standard sheet docked at the bottom of a positioned container.
<BottomSheet
  aria-label="Now playing"
  variant="standard"
  defaultValue="partiallyExpanded"
  peekHeight={72}
>
  <p>Track details</p>
</BottomSheet>

// A sheet that refuses to be dismissed until a choice is made.
<BottomSheet
  aria-label="Choose a plan"
  value={value}
  onValueChange={setValue}
  confirmValueChange={(next) => next !== 'hidden' || hasChosen}
>
  {/* … */}
</BottomSheet>
```

## Contract

`variant` selects the sheet and defaults to `"modal"`.

`value`, `defaultValue`, and `onValueChange` carry the sheet position over
`"hidden" | "partiallyExpanded" | "expanded"`, matching Material's `SheetValue`.
`onValueChange` reports every settled position, including one the sheet reached
natively through Escape, a scrim click, or a drag. A controlled sheet is not
forcibly reverted when a consumer ignores that callback — the same native-truth
rule `Dialog` documents, because a `<dialog>`'s open state has no React-owned
reconciliation.

`partiallyExpanded` rests at a different height per variant, exactly as the
Material source anchors it. A modal sheet reveals the lesser of half its
container and its own content height. A standard sheet reveals `peekHeight`,
which defaults to 56px and is rejected on a modal sheet, because the source has
no peek anchor there.

`confirmValueChange` vetoes a pending position. Returning `false` leaves the
sheet where it is, and it gates every path into a new position — drag, click,
keyboard, Escape, and scrim alike.

`dragHandle` (default `true`) renders the handle. `gesturesEnabled` (default
`true`) allows pointer dragging. `dismissOnEscape` and `dismissOnScrimClick`
(both default `true`) map the source's `shouldDismissOnBackPress` and
`shouldDismissOnClickOutside`; both are modal-only, because a standard sheet is
not in the top layer and has no scrim.

The sheet needs an accessible name: pass `aria-label` or `aria-labelledby`.
`className` is merged after the library class, `style` and every other native
attribute pass through, and `ref` forwards to the root element.

## Accessibility

A modal sheet's root is a native `<dialog>` opened with `showModal()`, so the
backdrop, focus trap, inert background, and focus restoration on close are all
native rather than reconstructed. Its accessible name sits on that element, not
on an inner box, so the dialog is never left unnamed. A standard sheet is not a
dialog at all — it docks inline and leaves the page interactive — so it is
exposed as a named `region`, the web semantic for the source's pane title.

The drag handle is a real `<button>`. Material's accessibility guidance requires
a single-pointer alternative to any drag and specifies the keyboard contract as
Tab to reach the handle and Space or Enter to move between the available
heights; because the handle is a native button, that contract is native too.
Activating it runs the source's own cycle: an expanded modal sheet dismisses, an
expanded standard sheet collapses to its peek height, a partially expanded sheet
expands. The handle's label names the action it will perform, and
`aria-expanded` reports whether the sheet is expanded.

The handle's interactive box is 48px tall — 22px of padding above and below the
sourced 4px bar — which is both the source's `DragHandleVerticalPadding` and the
target size the guidance requires.

Under `prefers-reduced-motion` the settle transition is removed and the sheet
changes height instantly, which preserves state comprehension. In forced-colors
mode the container takes a `CanvasText` border and the handle bar repaints,
because author backgrounds are overridden there.

## Tokens and source boundary

Thirteen tokens. Seven carry the roles the Material source's generated
`SheetBottomTokens` declares *and* reads; the rest carry `BottomSheetDefaults`
constants and the scrim, which the source composes from `ScrimTokens`.

| Token | Default |
| --- | --- |
| `--m3e-comp-bottom-sheet-container-color` | `sys.color.surfaceContainerLow` |
| `--m3e-comp-bottom-sheet-container-shape` | `sys.shape.corners.cornerExtraLargeTop` |
| `--m3e-comp-bottom-sheet-hidden-container-shape` | `sys.shape.corners.cornerNone` |
| `--m3e-comp-bottom-sheet-container-shadow` | `sys.elevation.level1.shadow` |
| `--m3e-comp-bottom-sheet-container-max-width` | `640px` |
| `--m3e-comp-bottom-sheet-peek-height` | `56px` |
| `--m3e-comp-bottom-sheet-drag-handle-color` | `sys.color.onSurfaceVariant` |
| `--m3e-comp-bottom-sheet-drag-handle-width` | `32px` |
| `--m3e-comp-bottom-sheet-drag-handle-height` | `4px` |
| `--m3e-comp-bottom-sheet-drag-handle-shape` | `sys.shape.corners.cornerExtraLarge` |
| `--m3e-comp-bottom-sheet-drag-handle-spacing` | `22px` |
| `--m3e-comp-bottom-sheet-scrim-color` | `sys.color.scrim` |
| `--m3e-comp-bottom-sheet-scrim-opacity` | `0.32` |

Two declared roles are deliberately unregistered.
`DockedStandardContainerElevation` is never resolved: both variants take their
elevation from `BottomSheetDefaults.Elevation`, which reads
`DockedModalContainerElevation`, so the registration follows the path the source
actually renders. `FocusIndicatorColor` has no resolution path in any pinned
sheet source, and this library's focus indication is the shared `sys.state`
treatment.

The Material catalog delivers this family as three composables. `BottomSheet`
and `ModalBottomSheet` become the two variants here. `BottomSheetScaffold` does
not become an export: beyond the sheet, it is an app-shell layout owning
`topBar`, `snackbarHost`, and a padded content slot, which public components
already compose without hidden behavior. Its sheet behavior is not lost — the
peek-height anchoring is what `variant="standard"` reproduces.

Dragging is handle-only. The source additionally drags the whole surface through
a nested-scroll connection that steals scroll from sheet content; a handle-only
drag does not have to arbitrate against a scrollable content area, and the
guidance requires a non-drag alternative regardless. Releases settle with the
source's own `PositionalThreshold` (56px of travel) and `VelocityThreshold`
(125px/s).

Predictive back is not reproduced — it is an Android system gesture with no web
equivalent, and every screenshot case in the pinned source covers it. The
source's `securePolicy` window flag and its Kotlin binary-compatibility shims
have no web equivalent either. The source's bottom window inset is reproduced,
not dropped: `standardWindowInsets` becomes `env(safe-area-inset-bottom)`.
