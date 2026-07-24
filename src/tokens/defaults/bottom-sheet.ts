import type { ComponentTokenRegistration } from '../schema'

/**
 * AndroidX Material 3 `SheetBottomTokens` at the pinned T45 revision, the
 * reference snapshot T44 adopted. The generated file declares nine roles and
 * the pinned sheet sources read seven of them; the two unread roles are
 * recorded rather than registered, following the read/unread partition T42
 * established for `DividerTokens`:
 *
 * - `DockedStandardContainerElevation` is declared but never resolved. Both
 *   variants take their elevation from `BottomSheetDefaults.Elevation`, which
 *   reads `DockedModalContainerElevation`. Both happen to be `Level1`, so
 *   registering the read role loses nothing today, and it keeps the
 *   registration on the path the source actually renders — the correction T42
 *   applied to the `Tabs` divider, applied here before it can drift.
 * - `FocusIndicatorColor` is declared but never resolved by any of the four
 *   pinned sheet sources. This library's focus indication is the shared
 *   `sys.state` focus treatment, so there is no sheet-specific role to attach.
 *
 * `scrim-color`/`scrim-opacity` come from `ScrimTokens` (`Scrim` at `0.32f`),
 * which `BottomSheetDefaults.ScrimColor` composes. They carry the same values
 * `dialog` registered, but by a stronger provenance: the dialog pair had to be
 * cross-validated against material-web because the pinned Compose dialog dims
 * its window with an Android platform default, whereas the sheet reads a real
 * generated token.
 *
 * `peek-height` (56dp) and `max-width` (640dp) are `BottomSheetDefaults`
 * constants rather than generated roles, and `drag-handle-spacing` is the
 * source's private `DragHandleVerticalPadding` (22dp). `hidden-container-shape`
 * is `DockedMinimizedContainerShape`, the shape the source applies in the
 * `Hidden` state.
 *
 * `drag-handle-shape` is `MaterialTheme.shapes.extraLarge` — the source's own
 * default for `BottomSheetDefaults.DragHandle`, not a pill. At 28px against a
 * 32x4 box the corners clamp to a pill anyway, so the two are indistinguishable
 * when rendered; the sourced role is registered because a theme that retunes
 * `cornerExtraLarge` must move the handle with it.
 *
 * The 22px spacing is load-bearing for accessibility rather than decorative:
 * 22 + 4 + 22 makes the handle's interactive box exactly the 48px target the
 * Material accessibility guidance requires of a sheet's resize affordance.
 */
export const defaultBottomSheetTokens = {
  component: 'bottom-sheet',
  task: 'T45',
  source: {
    id: 'androidx-material3-sheet-bottom',
    url: 'https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/SheetBottomTokens.kt',
    revision: 'a90df2fc27e026b9ad2ed569f203a260c1041fab',
    accessed: '2026-07-24',
  },
  tokens: {
    'container-color': {
      kind: 'color', value: { $ref: 'sys.color.surfaceContainerLow' },
    },
    'container-shape': {
      kind: 'shape', value: { $ref: 'sys.shape.corners.cornerExtraLargeTop' },
    },
    'hidden-container-shape': {
      kind: 'shape', value: { $ref: 'sys.shape.corners.cornerNone' },
    },
    'container-shadow': {
      kind: 'shadow', value: { $ref: 'sys.elevation.level1.shadow' },
    },
    'container-max-width': { kind: 'dimension', value: '640px' },
    'peek-height': { kind: 'dimension', value: '56px' },
    'drag-handle-color': {
      kind: 'color', value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'drag-handle-width': { kind: 'dimension', value: '32px' },
    'drag-handle-height': { kind: 'dimension', value: '4px' },
    'drag-handle-shape': {
      kind: 'shape', value: { $ref: 'sys.shape.corners.cornerExtraLarge' },
    },
    'drag-handle-spacing': { kind: 'dimension', value: '22px' },
    'scrim-color': { kind: 'color', value: { $ref: 'sys.color.scrim' } },
    'scrim-opacity': { kind: 'opacity', value: 0.32 },
  },
} as const satisfies ComponentTokenRegistration
