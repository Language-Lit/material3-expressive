import type {
  ChangeEventHandler,
  ComponentPropsWithRef,
  CSSProperties,
  DragEventHandler,
  ReactNode,
} from 'react'

/** Native-web interaction modes represented by the Material List Item overloads. */
export type ListItemInteraction = 'none' | 'action' | 'single' | 'multiple'

/** Passive container elements supported by a non-interactive List Item. */
export type ListItemElement = 'div' | 'li'

interface ListItemAnatomyProps {
  /** Main content of the item, corresponding to Material's headline/content slot. */
  readonly headline: ReactNode
  /** Optional content before the headline column, such as an icon or avatar. */
  readonly leadingContent?: ReactNode
  /** Optional content after the headline column, such as metadata or a passive control. */
  readonly trailingContent?: ReactNode
  /** Optional short label above the headline. */
  readonly overline?: ReactNode
  /** Optional descriptive content below the headline. */
  readonly supportingText?: ReactNode
  /** Whether the item is visually and semantically unavailable. */
  readonly disabled?: boolean
  /** Consumer class applied to the visual/semantic root. */
  readonly className?: string
  /** Consumer style applied to the visual/semantic root. */
  readonly style?: CSSProperties
  /** Enable native drag events and the sourced reorder-list dragged appearance. */
  readonly draggable?: boolean
  readonly onDragStart?: DragEventHandler<HTMLElement>
  readonly onDragEnd?: DragEventHandler<HTMLElement>
}

interface PassiveListItemInteractionProps {
  readonly interaction?: 'none'
  readonly selected?: never
  readonly defaultSelected?: never
  readonly onSelectedChange?: never
  readonly checked?: never
  readonly defaultChecked?: never
  readonly onCheckedChange?: never
}

type PassiveListItemNativeProps<Element extends 'div' | 'li'> = Omit<
  ComponentPropsWithRef<Element>,
  | keyof ListItemAnatomyProps
  | keyof PassiveListItemInteractionProps
  | 'as'
  | 'children'
  | 'onClick'
  | 'onDoubleClick'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'tabIndex'
>

/** Props for a passive Material List Item. */
export type PassiveListItemProps =
  | (ListItemAnatomyProps &
      PassiveListItemInteractionProps &
      PassiveListItemNativeProps<'div'> & {
        readonly as?: 'div'
      })
  | (ListItemAnatomyProps &
      PassiveListItemInteractionProps &
      PassiveListItemNativeProps<'li'> & {
        readonly as: 'li'
      })

interface ActionListItemInteractionProps {
  readonly interaction: 'action'
  readonly as?: never
  readonly selected?: never
  readonly defaultSelected?: never
  readonly onSelectedChange?: never
  readonly checked?: never
  readonly defaultChecked?: never
  readonly onCheckedChange?: never
}

type ActionListItemNativeProps = Omit<
  ComponentPropsWithRef<'button'>,
  | keyof ListItemAnatomyProps
  | keyof ActionListItemInteractionProps
  | 'aria-checked'
  | 'aria-pressed'
  | 'children'
  | 'draggable'
  | 'onDragEnd'
  | 'onDragStart'
  | 'role'
>

/** Props for a whole-row native-button List Item action. */
export type ActionListItemProps = ListItemAnatomyProps &
  ActionListItemInteractionProps &
  ActionListItemNativeProps

interface ControlledSingleListItemState {
  readonly selected: boolean
  readonly defaultSelected?: never
  readonly onSelectedChange: (selected: boolean) => void
}

interface UncontrolledSingleListItemState {
  readonly selected?: never
  readonly defaultSelected?: boolean
  readonly onSelectedChange?: (selected: boolean) => void
}

interface SingleListItemInteractionProps {
  readonly interaction: 'single'
  readonly as?: never
  /** Native radio-group name. Required so single-choice items group natively. */
  readonly name: string
  /** Native submitted value for this item. */
  readonly value: string
  readonly checked?: never
  readonly defaultChecked?: never
  readonly onCheckedChange?: never
}

interface ControlledMultipleListItemState {
  readonly checked: boolean
  readonly defaultChecked?: never
  readonly onCheckedChange: (checked: boolean) => void
}

interface UncontrolledMultipleListItemState {
  readonly checked?: never
  readonly defaultChecked?: boolean
  readonly onCheckedChange?: (checked: boolean) => void
}

interface MultipleListItemInteractionProps {
  readonly interaction: 'multiple'
  readonly as?: never
  readonly selected?: never
  readonly defaultSelected?: never
  readonly onSelectedChange?: never
}

type SelectionListItemNativeProps = Omit<
  ComponentPropsWithRef<'input'>,
  | keyof ListItemAnatomyProps
  | 'checked'
  | 'children'
  | 'className'
  | 'defaultChecked'
  | 'disabled'
  | 'draggable'
  | 'onChange'
  | 'onDragEnd'
  | 'onDragStart'
  | 'role'
  | 'style'
  | 'type'
>

interface SelectionChangeProps {
  /** Native change event, composed before the Material state callback. */
  readonly onChange?: ChangeEventHandler<HTMLInputElement>
}

/** Props for a native-radio-backed single-selection List Item. */
export type SingleSelectionListItemProps = ListItemAnatomyProps &
  SingleListItemInteractionProps &
  (ControlledSingleListItemState | UncontrolledSingleListItemState) &
  SelectionListItemNativeProps &
  SelectionChangeProps

/** Props for a native-checkbox-backed multiple-selection List Item. */
export type MultipleSelectionListItemProps = ListItemAnatomyProps &
  MultipleListItemInteractionProps &
  (ControlledMultipleListItemState | UncontrolledMultipleListItemState) &
  SelectionListItemNativeProps &
  SelectionChangeProps

/** Props shared by `ListItem`; interaction is a native-semantic discriminant. */
export type ListItemProps =
  | PassiveListItemProps
  | ActionListItemProps
  | SingleSelectionListItemProps
  | MultipleSelectionListItemProps

interface SegmentedPositionProps {
  /** Zero-based item position used to derive first/middle/last/only corners. */
  readonly index: number
  /** Total number of items in this segmented list. Must be a positive integer. */
  readonly count: number
}

/** Props for `SegmentedListItem`, sharing every interaction mode with `ListItem`. */
export type SegmentedListItemProps = ListItemProps & SegmentedPositionProps
