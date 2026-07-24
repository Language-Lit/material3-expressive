import type { HTMLAttributes, ReactNode, Ref } from 'react'

/**
 * The two sheet composables the source exposes. `modal` wraps the sheet in a
 * dialog window with a scrim and blocks the content behind it; `standard` docks
 * the sheet inline, leaving the rest of the screen live.
 */
export type BottomSheetVariant = 'modal' | 'standard'

/**
 * Material's `SheetValue`. `partiallyExpanded` is the peeking rest position:
 * the source anchors it at `min(50%, content)` of the container for a modal
 * sheet and at `peekHeight` for a standard one.
 */
export type BottomSheetState = 'hidden' | 'partiallyExpanded' | 'expanded'

interface BottomSheetOwnProps {
  /** Which sheet composable this instance reproduces. */
  readonly variant?: BottomSheetVariant
  /** Controlled sheet position. */
  readonly value?: BottomSheetState
  /** Initial position for an uncontrolled sheet. */
  readonly defaultValue?: BottomSheetState
  /**
   * Called with every position the sheet settles on, including one it reached
   * natively through Escape, a scrim click, or a drag.
   */
  readonly onValueChange?: (value: BottomSheetState) => void
  /**
   * Vetoes a pending position change, mapping the source's
   * `confirmValueChange`. Returning `false` leaves the sheet where it is.
   */
  readonly confirmValueChange?: (value: BottomSheetState) => boolean
  /**
   * Positions the standard variant's `partiallyExpanded` rest height, mapping
   * `BottomSheetScaffold`'s `sheetPeekHeight`. The modal variant has no peek
   * height in the source — it anchors at half the container — so this is
   * rejected there.
   */
  readonly peekHeight?: number
  /** Whether the drag handle is rendered. Mapping the source's `dragHandle`. */
  readonly dragHandle?: boolean
  /** Whether pointer dragging settles the sheet. Mapping `gesturesEnabled`. */
  readonly gesturesEnabled?: boolean
  /**
   * Whether Escape dismisses the sheet, mapping `shouldDismissOnBackPress`.
   * Modal only: a standard sheet is not in the top layer and receives no
   * native cancel.
   */
  readonly dismissOnEscape?: boolean
  /**
   * Whether a scrim click dismisses the sheet, mapping
   * `shouldDismissOnClickOutside`. Modal only: a standard sheet has no scrim.
   */
  readonly dismissOnScrimClick?: boolean
  /** Accessible name for the sheet's own pane. */
  readonly 'aria-label'?: string
  /** Element labelling the sheet's own pane. */
  readonly 'aria-labelledby'?: string
  /** Sheet content. */
  readonly children?: ReactNode
}

type BottomSheetVariantProps =
  | ({ readonly variant?: 'modal' } & { readonly peekHeight?: never })
  | ({ readonly variant: 'standard' } & { readonly peekHeight?: number })

/**
 * Props for a Material bottom sheet. The variant union rejects `peekHeight` on
 * a modal sheet, which the source has no anchor for.
 */
export type BottomSheetProps = Omit<BottomSheetOwnProps, 'variant' | 'peekHeight'> &
  BottomSheetVariantProps &
  Omit<
    HTMLAttributes<HTMLElement>,
    keyof BottomSheetOwnProps | 'defaultValue' | 'onChange'
  > & {
    readonly ref?: Ref<HTMLElement>
  }
