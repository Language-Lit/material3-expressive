import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defaultTokenSet } from '../../../src/tokens'

const componentSource = readFileSync(
  fileURLToPath(new URL('../../../src/components/BottomSheet/BottomSheet.tsx', import.meta.url)),
  'utf8',
)
const css = readFileSync(
  fileURLToPath(new URL('../../../src/components/BottomSheet/BottomSheet.css', import.meta.url)),
  'utf8',
)
const barrel = readFileSync(
  fileURLToPath(new URL('../../../src/components/BottomSheet/index.ts', import.meta.url)),
  'utf8',
)
const split = (source: string) => source.trim().split(/\s+/)

/**
 * Git blob hashes of the pinned AndroidX files at revision
 * `a90df2fc27e026b9ad2ed569f203a260c1041fab`, the reference snapshot T44
 * adopted for the primitive tranche. Every one of these eleven files was
 * fetched at that revision and at `androidx-main` HEAD
 * (`0f056f78299610de8a8dc1511671519aab75657d`, 2026-07-23) and compared
 * byte-for-byte: all eleven are identical, so this family joins the unified
 * snapshot rather than opening a second one.
 */
const pinnedFiles = {
  'BottomSheet.kt': '9e89c1e5474b85727485047953b0add55bf4026b',
  'BottomSheetScaffold.kt': '8ba458300066b5e7055edc48d6e18f4c79a370af',
  'ModalBottomSheet.kt': '4ce44656075377a31ea687054e1204ce6808c6fd',
  'SheetDefaults.kt': 'e325ae4e16bd9436136790fad2c709633cfccf8f',
  'SheetBottomTokens.kt': 'e39cfbfee69b2c142c9bd7d73ffb2375198f0ee7',
  'BottomSheetTest.kt': '279ae04b9f0b98f45f683311fbec835faa5c9777',
  'BottomSheetScaffoldTest.kt': 'c9408c4a67aa1b23f6420dad72e0c556c44a959e',
  'ModalBottomSheetTest.kt': 'a5817b05adf47435e7b8d60b17f4e8d4aad60ca7',
  'ModalBottomSheetDialogTest.kt': 'd38f06a7196bbbb8d6be4caca3289f2739fb56bc',
  'ModalBottomSheetScreenshotTest.kt': '3d131b68e0959e5a1cc7a3189c687686c1d08d26',
  'SheetStateTest.kt': '980a978acc058526582830a4ca75eac6c3620871',
} as const

/** Every declaration in the generated `SheetBottomTokens.kt` (VERSION v0_210). */
const tokenDeclarations = split(`
  DockedContainerColor DockedContainerShape DockedDragHandleColor
  DockedDragHandleHeight DockedDragHandleWidth DockedMinimizedContainerShape
  DockedModalContainerElevation DockedStandardContainerElevation
  FocusIndicatorColor
`)

/** The seven roles the four pinned sheet sources resolve. */
const tokenReads = split(`
  DockedContainerColor DockedContainerShape DockedDragHandleColor
  DockedDragHandleHeight DockedDragHandleWidth DockedMinimizedContainerShape
  DockedModalContainerElevation
`)

/**
 * Declared but never resolved by any pinned sheet source.
 * `DockedStandardContainerElevation` loses to `DockedModalContainerElevation`,
 * which `BottomSheetDefaults.Elevation` reads for both variants;
 * `FocusIndicatorColor` has no resolution path at all.
 */
const tokenUnread = split(`
  DockedStandardContainerElevation FocusIndicatorColor
`)

const currentSurface = split(`
  BottomSheet BottomSheet.modifier BottomSheet.state BottomSheet.onDismissRequest
  BottomSheet.maxWidth BottomSheet.gesturesEnabled BottomSheet.backHandlerEnabled
  BottomSheet.dragHandle BottomSheet.contentWindowInsets BottomSheet.shape
  BottomSheet.containerColor BottomSheet.contentColor BottomSheet.tonalElevation
  BottomSheet.shadowElevation BottomSheet.content
  ModalBottomSheet ModalBottomSheet.onDismissRequest ModalBottomSheet.modifier
  ModalBottomSheet.sheetState ModalBottomSheet.sheetMaxWidth
  ModalBottomSheet.sheetGesturesEnabled ModalBottomSheet.shape
  ModalBottomSheet.containerColor ModalBottomSheet.contentColor
  ModalBottomSheet.tonalElevation ModalBottomSheet.scrimColor
  ModalBottomSheet.dragHandle ModalBottomSheet.contentWindowInsets
  ModalBottomSheet.properties ModalBottomSheet.content
  ModalBottomSheetProperties ModalBottomSheetProperties.shouldDismissOnBackPress
  ModalBottomSheetProperties.shouldDismissOnClickOutside ModalBottomSheetDefaults
  ModalBottomSheetDefaults.properties
  BottomSheetScaffold BottomSheetScaffold.sheetContent BottomSheetScaffold.modifier
  BottomSheetScaffold.scaffoldState BottomSheetScaffold.sheetPeekHeight
  BottomSheetScaffold.sheetMaxWidth BottomSheetScaffold.sheetShape
  BottomSheetScaffold.sheetContainerColor BottomSheetScaffold.sheetContentColor
  BottomSheetScaffold.sheetTonalElevation BottomSheetScaffold.sheetShadowElevation
  BottomSheetScaffold.sheetDragHandle BottomSheetScaffold.sheetSwipeEnabled
  BottomSheetScaffold.topBar BottomSheetScaffold.snackbarHost
  BottomSheetScaffold.containerColor BottomSheetScaffold.contentColor
  BottomSheetScaffold.content
  BottomSheetScaffoldState BottomSheetScaffoldState.bottomSheetState
  BottomSheetScaffoldState.snackbarHostState rememberBottomSheetScaffoldState
  SheetValue SheetValue.Hidden SheetValue.Expanded SheetValue.PartiallyExpanded
  SheetState SheetState.currentValue SheetState.targetValue SheetState.isVisible
  SheetState.isAnimationRunning SheetState.hasExpandedState
  SheetState.hasPartiallyExpandedState SheetState.requireOffset SheetState.expand
  SheetState.partialExpand SheetState.show SheetState.hide SheetState.Saver
  rememberBottomSheetState
  BottomSheetDefaults BottomSheetDefaults.HiddenShape
  BottomSheetDefaults.ExpandedShape BottomSheetDefaults.ContainerColor
  BottomSheetDefaults.Elevation BottomSheetDefaults.ScrimColor
  BottomSheetDefaults.SheetPeekHeight BottomSheetDefaults.SheetMaxWidth
  BottomSheetDefaults.standardWindowInsets BottomSheetDefaults.modalWindowInsets
  BottomSheetDefaults.DragHandle
`)

/**
 * Kotlin binary-compatibility and migration shims. The same class T44
 * classified for `RangeSliderLegacy`: they exist so an already-compiled caller
 * keeps linking, and a web port has no equivalent to preserve.
 */
const deprecatedSurface = split(`
  rememberModalBottomSheetState rememberStandardBottomSheetState
  BottomSheetDefaults.windowInsets SheetState.constructor.skipPartiallyExpanded
  SheetState.constructor.density SheetState.Saver.skipPartiallyExpanded
  SheetState.Saver.density
`)

const bottomSheetTests = split(`
  bottomSheet_fillsScreenWidth bottomSheet_imePadding
  bottomSheet_preservesLayoutDirection bottomSheet_respectsMaterialThemeMotionScheme
  bottomSheet_smallSheet_escapesDampeningAndDismisses
  bottomSheet_wideScreen_filledWidth_sheetFillsEntireWidth
  bottomSheet_wideScreen_fixedMaxWidth_sheetRespectsMaxWidthAndIsCentered
  bottomSheetContent_fullScreen_consumesOnlyProvidedContentWindowInsets
  bottomSheetContent_halfScreen_consumesSheetOffsetAsTopInsets
  bottomSheetContent_respectsProvidedInsets sheetWindowInsets_reportsOffset_asTopInset
`)

const bottomSheetScaffoldTests = split(`
  bottomSheetScaffold_AppbarAndContent_inColumn
  bottomSheetScaffold_bottomSheetOffsetTaggedAsMotionFrameOfReference
  bottomSheetScaffold_gesturesDisabled_doesNotParticipateInNestedScroll
  bottomSheetScaffold_innerPadding_lambdaParam
  bottomSheetScaffold_landscape_filledWidth_sheetFillsEntireWidth
  bottomSheetScaffold_landscape_sheetRespectsMaxWidthAndIsCentered
  bottomSheetScaffold_peekHeightMatchesContentHeight_containsExpandedAnchor
  bottomSheetScaffold_peekHeightZero_ambiguousAnchorRemovedAfterExpansion
  bottomSheetScaffold_peekHeightZero_animateToPartiallyExpanded
  bottomSheetScaffold_peekHeightZero_explicitHide
  bottomSheetScaffold_peekHeightZero_initialStatePartiallyExpanded
  bottomSheetScaffold_respectsConfirmStateChange
  bottomSheetScaffold_respectsMaterialThemeMotionScheme
  bottomSheetScaffold_revealAndConceal_manually bottomSheetScaffold_revealBySwiping
  bottomSheetScaffold_revealBySwiping_gesturesDisabled
  bottomSheetScaffold_sheetMaxWidth_sizeChanges_snapsToNewTarget
  bottomSheetScaffold_slotsPositionedAppropriately
  bottomSheetScaffold_testCollapseAction_whenExpanded
  bottomSheetScaffold_testDismissAction_whenEnabled
  bottomSheetScaffold_testDragHandleClick
  bottomSheetScaffold_testDragHandleClick_hiddenStateAllowed
  bottomSheetScaffold_testExpandAction_whenCollapsed
  bottomSheetScaffold_testHideReturnsIllegalStateException
  bottomSheetScaffold_testNestedScrollConnection
  bottomSheetScaffold_testNoCollapseExpandAction_whenPeekHeightIsSheetHeight
  bottomSheetScaffold_testOffset_whenCollapsed bottomSheetScaffold_testOffset_whenExpanded
  bottomSheetScaffold_topAppBarIsDrawnOnTopOfContent
  bottomSheetScaffold_withDragHandle_confirmValueChange_invokedForSemanticsAction
  modalBottomSheet_bottomSheetOffsetTaggedAsMotionFrameOfReference
  semanticsMatcher_hasActionLabel_findsNodeForAction test_stateSavedAndRestored
`)

const modalBottomSheetTests = split(`
  modalBottomSheet_assertSheetContentIsReadBeforeScrim
  modalBottomSheet_callsOnDismissRequest_onNestedScrollFling
  modalBottomSheet_defaultStateForLargeContentIsHalfExpanded
  modalBottomSheet_defaultStateForSmallContentIsFullExpanded
  modalBottomSheet_disabledClickOutside
  modalBottomSheet_doesNotDismissOnBack_whenPropertyFalse
  modalBottomSheet_emptySheet_expandDoesNotAnimate
  modalBottomSheet_gesturesDisabled_doesNotParticipateInNestedScroll
  modalBottomSheet_isDismissedOnSwipeDown modalBottomSheet_isDismissedOnTapOutside
  modalBottomSheet_isDismissedOnTapOutsideWithPadding
  modalBottomSheet_respectsContentWindowInsets_whenImeIsPresent
  modalBottomSheet_sheetMaxWidth_sizeChanges_snapsToNewTarget
  modalBottomSheet_shortSheet_isDismissedOnBackPress
  modalBottomSheet_shortSheet_sizeChanges_snapsToNewTarget
  modalBottomSheet_tallSheet_isDismissedOnBackPress modalBottomSheet_testDragHandleClick
`)

const modalBottomSheetDialogTests = split(`
  dialog_dismissOnBackPress_callsDismissRequest
  dialog_doesNotDismissOnBackPress_whenPropertyFalse dialog_securePolicy_setsWindowFlag
  dialog_showsContent dialog_updatesParameters_whenRecomposed
`)

const screenshotTests = split(`
  modalBottomSheet_predictiveBack_progress0 modalBottomSheet_predictiveBack_progress25
  modalBottomSheet_predictiveBack_progress50 modalBottomSheet_predictiveBack_progress75
  modalBottomSheet_predictiveBack_progress100
`)

const sheetStateTests = split(`
  state_anchorsChange_retainsCurrentValue state_constructor_initialValueContracts
  state_currentValue_mapsToSettledValue state_expand_hide_show_api
  state_missingAnchors_findsClosest
  state_nestedScroll_consumesWithinBounds_scrollsOutsideBounds
  state_respectsConfirmValueChange
  state_shortSheet_anchorChangeHandler_previousTargetNotInAnchors_reconciles
  state_tallSheet_anchorChangeHandler_previousTargetNotInAnchors_reconciles
  state_targetValue_fixLogic_handlesExactOffsetMatch
  state_targetValue_fixLogic_handlesNonExistentAnchor
  state_targetValue_mapsToCurrentValue_whenSettled
  state_zeroPeekHeight_partialExpandMethod
  state_zeroPeekHeight_partiallyExpandedMapsToHiddenOffset
`)

/** Every source concern deliberately not ported, each with its reason. */
const exclusions = split(`
  predictive-back-is-an-android-system-gesture-with-no-web-equivalent
  secure-policy-is-an-android-window-flag-with-no-web-equivalent
  vertical-scale-up-down-corrects-compose-spring-overshoot-that-css-does-not-produce
  nested-scroll-drag-consumption-replaced-by-a-handle-only-drag
  bottom-sheet-scaffold-app-shell-slots-are-a-recipe-not-an-export
  kotlin-binary-compatibility-shims-have-no-web-equivalent-to-preserve
`)

/**
 * Behaviours the pinned sources carry that this port answers with a native web
 * mechanism instead of its own code.
 */
const nativeWebAdaptations = split(`
  modal-window-and-scrim-become-native-dialog-showModal-and-backdrop
  focus-trap-and-focus-restoration-become-native-dialog-behaviour
  back-press-dismissal-becomes-the-native-dialog-cancel-event
  standard-window-insets-become-env-safe-area-inset-bottom
  drag-handle-click-cycle-becomes-a-native-button-with-space-and-enter
`)

describe('BottomSheet pinned-source completeness ledger', () => {
  it('freezes every pinned source file identity', () => {
    expect(Object.keys(pinnedFiles)).toHaveLength(11)
    expect(new Set(Object.values(pinnedFiles)).size).toBe(11)
    expect(Object.values(pinnedFiles).every((blob) => /^[0-9a-f]{40}$/.test(blob))).toBe(true)
  })

  it('classifies every generated SheetBottomTokens declaration as read or unread', () => {
    expect(tokenDeclarations).toHaveLength(9)
    expect(new Set(tokenDeclarations).size).toBe(9)
    expect(tokenReads).toHaveLength(7)
    expect(tokenUnread).toHaveLength(2)
    expect([...tokenReads, ...tokenUnread].sort()).toEqual([...tokenDeclarations].sort())
    expect(tokenReads.some((role) => tokenUnread.includes(role))).toBe(false)
  })

  it('registers a component token for every read generated role', () => {
    const registration = defaultTokenSet.componentTokens.find(
      (candidate) => candidate.component === 'bottom-sheet',
    )

    expect(registration?.task).toBe('T45')
    expect(registration?.source.revision).toBe('a90df2fc27e026b9ad2ed569f203a260c1041fab')
    expect(registration?.tokens['container-color'].value).toEqual({
      $ref: 'sys.color.surfaceContainerLow',
    })
    expect(registration?.tokens['container-shape'].value).toEqual({
      $ref: 'sys.shape.corners.cornerExtraLargeTop',
    })
    expect(registration?.tokens['hidden-container-shape'].value).toEqual({
      $ref: 'sys.shape.corners.cornerNone',
    })
    expect(registration?.tokens['drag-handle-color'].value).toEqual({
      $ref: 'sys.color.onSurfaceVariant',
    })
    expect(registration?.tokens['drag-handle-width'].value).toBe('32px')
    expect(registration?.tokens['drag-handle-height'].value).toBe('4px')
    expect(registration?.tokens['container-shadow'].value).toEqual({
      $ref: 'sys.elevation.level1.shadow',
    })
  })

  it('accounts for every current and deprecated source entry', () => {
    expect(currentSurface).toHaveLength(86)
    expect(new Set(currentSurface).size).toBe(86)
    expect(deprecatedSurface).toHaveLength(7)
    expect(new Set(deprecatedSurface).size).toBe(7)
  })

  it('freezes all 85 pinned test cases as audited inputs', () => {
    const all = [
      ...bottomSheetTests,
      ...bottomSheetScaffoldTests,
      ...modalBottomSheetTests,
      ...modalBottomSheetDialogTests,
      ...screenshotTests,
      ...sheetStateTests,
    ]

    expect(bottomSheetTests).toHaveLength(11)
    expect(bottomSheetScaffoldTests).toHaveLength(33)
    expect(modalBottomSheetTests).toHaveLength(17)
    expect(modalBottomSheetDialogTests).toHaveLength(5)
    expect(screenshotTests).toHaveLength(5)
    expect(sheetStateTests).toHaveLength(14)
    expect(all).toHaveLength(85)
    expect(new Set(all).size).toBe(85)
  })

  it('confines every screenshot case to predictive back, which is excluded', () => {
    expect(screenshotTests.every((name) => name.includes('predictiveBack'))).toBe(true)
    expect(exclusions).toContain(
      'predictive-back-is-an-android-system-gesture-with-no-web-equivalent',
    )
    expect(componentSource).not.toContain('predictiveBack')
    expect(css).not.toContain('predictive')
  })

  it('records every exclusion and native-web adaptation with its reason', () => {
    expect(exclusions).toHaveLength(6)
    expect(new Set(exclusions).size).toBe(6)
    expect(nativeWebAdaptations).toHaveLength(5)
    expect(new Set(nativeWebAdaptations).size).toBe(5)
  })

  it('collapses the two sheet composables onto one variant prop rather than two exports', () => {
    expect(componentSource).toContain("variant = 'modal'")
    expect(componentSource).toContain('data-m3e-variant={variant}')
    // The barrel is the contract: one component and its three types, with no
    // separate modal or scaffold export mirroring the source's three
    // composables. Prose in the implementation may still name them.
    expect(barrel.match(/export \{[^}]*\}/g)).toEqual(['export { BottomSheet }'])
    expect(barrel).not.toMatch(/export (const|function|\{)[^}]*ModalBottomSheet/)
    expect(barrel).not.toMatch(/export (const|function|\{)[^}]*BottomSheetScaffold/)
    expect(componentSource).not.toMatch(/export const (ModalBottomSheet|BottomSheetScaffold)/)
  })

  it('maps the three SheetValues onto the controllable state triple', () => {
    for (const state of ['hidden', 'partiallyExpanded', 'expanded']) {
      expect(componentSource).toContain(state)
    }
    expect(componentSource).toContain('useControllableState')
    expect(componentSource).toContain('confirmValueChange')
  })

  it('drives the modal variant through the native dialog lifecycle, never the open attribute', () => {
    expect(componentSource).toContain('showModal()')
    expect(componentSource).toContain(".close()")
    expect(componentSource).toContain("addEventListener('close'")
    expect(componentSource).not.toMatch(/<dialog[^>]*\bopen=/)
  })

  it('carries the sourced settle thresholds rather than invented ones', () => {
    expect(componentSource).toContain('const POSITIONAL_THRESHOLD = 56')
    expect(componentSource).toContain('const VELOCITY_THRESHOLD = 125')
  })

  it('adapts every sourced dimension to a component token rather than an inline style', () => {
    expect(css).toContain('var(--m3e-comp-bottom-sheet-peek-height)')
    expect(css).toContain('var(--m3e-comp-bottom-sheet-container-max-width)')
    expect(css).toContain('var(--m3e-comp-bottom-sheet-drag-handle-spacing)')
    // The only inline style the component writes is the live drag offset,
    // which is a runtime measurement rather than a themeable value.
    expect(componentSource).not.toContain('style={{')
    expect(componentSource.match(/setProperty\(/g) ?? []).toHaveLength(1)
  })
})
