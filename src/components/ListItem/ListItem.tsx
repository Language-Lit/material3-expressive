import {
  Children,
  Fragment,
  forwardRef,
  isValidElement,
  useState,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type DragEvent,
  type ElementType,
  type ForwardedRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'
import { composeEventHandlers } from '../../internal/composeEventHandlers'
import type {
  ActionListItemProps,
  ListItemElement,
  ListItemInteraction,
  ListItemProps,
  MultipleSelectionListItemProps,
  PassiveListItemProps,
  SegmentedListItemProps,
  SingleSelectionListItemProps,
} from './ListItem.types'

type ListItemSemanticElement = HTMLDivElement | HTMLButtonElement | HTMLInputElement
type ListItemPosition = 'first' | 'middle' | 'last' | 'only'

interface ListItemImplementationProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'checked' | 'children' | 'defaultChecked' | 'onChange'
  > {
  readonly as?: ListItemElement
  readonly interaction?: ListItemInteraction
  readonly headline?: ReactNode
  readonly leadingContent?: ReactNode
  readonly trailingContent?: ReactNode
  readonly overline?: ReactNode
  readonly supportingText?: ReactNode
  readonly selected?: boolean
  readonly defaultSelected?: boolean
  readonly onSelectedChange?: (selected: boolean) => void
  readonly checked?: boolean
  readonly defaultChecked?: boolean
  readonly onCheckedChange?: (checked: boolean) => void
  readonly onChange?: InputHTMLAttributes<HTMLInputElement>['onChange']
  readonly index?: number
  readonly count?: number
  readonly segmented?: boolean
}

interface ListItemComponent {
  (props: PassiveListItemProps): ReactElement | null
  (props: ActionListItemProps): ReactElement | null
  (props: SingleSelectionListItemProps): ReactElement | null
  (props: MultipleSelectionListItemProps): ReactElement | null
  displayName?: string
}

interface SegmentedListItemComponent {
  (props: SegmentedListItemProps): ReactElement | null
  displayName?: string
}

const UNSAFE_INTERACTIVE_DESCENDANTS = new Set([
  'a',
  'button',
  'details',
  'embed',
  'iframe',
  'input',
  'label',
  'select',
  'summary',
  'textarea',
])

function warn(component: 'ListItem' | 'SegmentedListItem', message: string): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn(`${component}: ${message}`)
  }
}

function hasSlotContent(content: ReactNode): boolean {
  return content !== null && content !== undefined && content !== false
}

function hasVisibleContent(content: ReactNode): boolean {
  let visible = false
  Children.forEach(content, (child) => {
    if (visible || child === null || child === undefined || typeof child === 'boolean') return
    visible = typeof child !== 'string' || child.trim().length > 0
  })
  return visible
}

function hasMultipleTextLines(content: ReactNode): boolean {
  let multiline = false
  Children.forEach(content, (child) => {
    if (multiline || child === null || child === undefined || typeof child === 'boolean') return
    if (typeof child === 'string' || typeof child === 'number') {
      multiline = String(child).includes('\n')
      return
    }
    if (!isValidElement(child)) return
    if (child.type === 'br') {
      multiline = true
      return
    }
    const props = child.props as { readonly children?: ReactNode }
    multiline = hasMultipleTextLines(props.children)
  })
  return multiline
}

function hasUnsafeInteractiveContent(content: ReactNode): boolean {
  let unsafe = false
  Children.forEach(content, (child) => {
    if (unsafe || !isValidElement(child)) return
    if (child.type === Fragment) {
      const props = child.props as { readonly children?: ReactNode }
      unsafe = hasUnsafeInteractiveContent(props.children)
      return
    }
    if (typeof child.type !== 'string') return
    const props = child.props as {
      readonly children?: ReactNode
      readonly contentEditable?: boolean | 'false' | 'true'
      readonly href?: string
      readonly tabIndex?: number
    }
    unsafe =
      UNSAFE_INTERACTIVE_DESCENDANTS.has(child.type) ||
      props.href !== undefined ||
      props.tabIndex !== undefined ||
      (props.contentEditable !== undefined &&
        props.contentEditable !== false &&
        props.contentEditable !== 'false')
    if (!unsafe) unsafe = hasUnsafeInteractiveContent(props.children)
  })
  return unsafe
}

function segmentedPosition(index: number, count: number): ListItemPosition {
  if (count === 1) return 'only'
  if (index === 0) return 'first'
  if (index === count - 1) return 'last'
  return 'middle'
}

function ListItemContent({
  headline,
  leadingContent,
  trailingContent,
  overline,
  supportingText,
}: {
  readonly headline: ReactNode
  readonly leadingContent: ReactNode
  readonly trailingContent: ReactNode
  readonly overline: ReactNode
  readonly supportingText: ReactNode
}) {
  return (
    <>
      {hasSlotContent(leadingContent) ? (
        <span className="m3e-list-item__leading">{leadingContent}</span>
      ) : null}
      <span className="m3e-list-item__content">
        {hasSlotContent(overline) ? (
          <span className="m3e-list-item__overline">{overline}</span>
        ) : null}
        <span className="m3e-list-item__headline">{headline}</span>
        {hasSlotContent(supportingText) ? (
          <span className="m3e-list-item__supporting">{supportingText}</span>
        ) : null}
      </span>
      {hasSlotContent(trailingContent) ? (
        <span className="m3e-list-item__trailing">{trailingContent}</span>
      ) : null}
    </>
  )
}

function ListItemRender(
  {
    as,
    interaction: requestedInteraction = 'none',
    headline,
    leadingContent,
    trailingContent,
    overline,
    supportingText,
    disabled = false,
    selected,
    defaultSelected,
    onSelectedChange,
    checked,
    defaultChecked,
    onCheckedChange,
    index,
    count,
    segmented = false,
    className,
    style,
    draggable = false,
    onDragStart,
    onDragEnd,
    onChange,
    type,
    ...nativeProps
  }: ListItemImplementationProps,
  forwardedRef: ForwardedRef<ListItemSemanticElement>,
) {
  const componentName = segmented ? 'SegmentedListItem' : 'ListItem'
  const validInteraction =
    requestedInteraction === 'none' ||
    requestedInteraction === 'action' ||
    requestedInteraction === 'single' ||
    requestedInteraction === 'multiple'
  const interaction: ListItemInteraction = validInteraction
    ? requestedInteraction
    : 'none'
  const hasLeading = hasSlotContent(leadingContent)
  const hasTrailing = hasSlotContent(trailingContent)
  const hasOverline = hasSlotContent(overline)
  const hasSupporting = hasSlotContent(supportingText)
  const supportingMultiline = hasMultipleTextLines(supportingText)
  const lines = hasOverline || supportingMultiline ? 3 : hasSupporting ? 2 : 1
  const rawCount = segmented ? count : undefined
  const rawIndex = segmented ? index : undefined
  const validCount =
    rawCount !== undefined && Number.isInteger(rawCount) && rawCount > 0
  const safeCount = validCount ? rawCount : 1
  const validIndex =
    rawIndex !== undefined &&
    Number.isInteger(rawIndex) &&
    rawIndex >= 0 &&
    rawIndex < safeCount
  const safeIndex = validIndex ? rawIndex : 0
  const position = segmented ? segmentedPosition(safeIndex, safeCount) : undefined
  const [dragged, setDragged] = useState(false)

  if (!validInteraction) {
    warn(componentName, 'interaction must be "none", "action", "single", or "multiple".')
  }
  if (!hasVisibleContent(headline)) {
    warn(componentName, 'provide non-empty headline content.')
  }
  if (interaction === 'none' && as !== undefined && as !== 'div' && as !== 'li') {
    warn(componentName, 'passive items support only as="div" or as="li".')
  }
  if (interaction !== 'none' && as !== undefined) {
    warn(componentName, 'interactive items own their native semantic element; remove `as`.')
  }
  if (
    interaction !== 'single' &&
    (selected !== undefined || defaultSelected !== undefined)
  ) {
    warn(componentName, 'selected/defaultSelected require interaction="single".')
  }
  if (interaction === 'single' && selected !== undefined && defaultSelected !== undefined) {
    warn(componentName, 'use either selected or defaultSelected, not both.')
  }
  if (interaction === 'single' && selected !== undefined && onSelectedChange === undefined) {
    warn(componentName, 'a controlled selected value requires onSelectedChange.')
  }
  if (
    interaction !== 'multiple' &&
    (checked !== undefined || defaultChecked !== undefined)
  ) {
    warn(componentName, 'checked/defaultChecked require interaction="multiple".')
  }
  if (interaction === 'multiple' && checked !== undefined && defaultChecked !== undefined) {
    warn(componentName, 'use either checked or defaultChecked, not both.')
  }
  if (interaction === 'multiple' && checked !== undefined && onCheckedChange === undefined) {
    warn(componentName, 'a controlled checked value requires onCheckedChange.')
  }
  if (segmented && !validCount) {
    warn(componentName, 'count must be a positive integer; rendering count=1.')
  }
  if (segmented && !validIndex) {
    warn(componentName, 'index must be an integer between 0 and count - 1; rendering index=0.')
  }

  const interactiveContent = [
    headline,
    leadingContent,
    trailingContent,
    overline,
    supportingText,
  ]
  if (interaction !== 'none' && hasUnsafeInteractiveContent(interactiveContent)) {
    warn(
      componentName,
      'interactive item slots must not contain nested links, controls, labels, or focusable content. Use interaction="none" when slots own actions.',
    )
  }

  const mergedClassName = className
    ? `m3e-list-item ${className}`
    : 'm3e-list-item'
  const commonRootProps = {
    className: mergedClassName,
    style,
    draggable,
    'data-m3e-interaction': interaction,
    'data-m3e-disabled': disabled,
    'data-m3e-dragged': dragged,
    'data-m3e-segmented': segmented,
    'data-m3e-position': position,
    'data-m3e-lines': lines,
    'data-m3e-has-leading': hasLeading,
    'data-m3e-has-trailing': hasTrailing,
    'data-m3e-has-overline': hasOverline,
    'data-m3e-has-supporting': hasSupporting,
    'data-m3e-supporting-multiline': supportingMultiline,
  } as const
  const handleDragStart = (event: DragEvent<HTMLElement>) => {
    ;(onDragStart as ((event: DragEvent<HTMLElement>) => void) | undefined)?.(event)
    if (draggable && !event.defaultPrevented) setDragged(true)
  }
  const handleDragEnd = (event: DragEvent<HTMLElement>) => {
    ;(onDragEnd as ((event: DragEvent<HTMLElement>) => void) | undefined)?.(event)
    setDragged(false)
  }
  const content = (
    <ListItemContent
      headline={headline}
      leadingContent={leadingContent}
      trailingContent={trailingContent}
      overline={overline}
      supportingText={supportingText}
    />
  )

  if (interaction === 'action') {
    return (
      <button
        {...nativeProps}
        {...commonRootProps}
        ref={forwardedRef as ForwardedRef<HTMLButtonElement>}
        type={type ?? 'button'}
        disabled={disabled}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {content}
      </button>
    )
  }

  if (interaction === 'single' || interaction === 'multiple') {
    const isSingle = interaction === 'single'
    const controlledValue = isSingle ? selected : checked
    const defaultValue = isSingle ? defaultSelected : defaultChecked
    const stateCallback = isSingle ? onSelectedChange : onCheckedChange
    const handleChange = composeEventHandlers<ChangeEvent<HTMLInputElement>>(
      onChange,
      (event) => stateCallback?.(event.currentTarget.checked),
    )

    return (
      <label
        {...commonRootProps}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <input
          {...(nativeProps as InputHTMLAttributes<HTMLInputElement>)}
          ref={forwardedRef as ForwardedRef<HTMLInputElement>}
          className="m3e-list-item__input"
          type={isSingle ? 'radio' : 'checkbox'}
          disabled={disabled}
          {...(controlledValue !== undefined
            ? { checked: controlledValue }
            : { defaultChecked: defaultValue ?? false })}
          onChange={handleChange}
        />
        {content}
      </label>
    )
  }

  const Element = (as === 'li' ? 'li' : 'div') as ElementType
  return (
    <Element
      {...(nativeProps as HTMLAttributes<HTMLElement>)}
      {...commonRootProps}
      ref={forwardedRef as Ref<HTMLElement>}
      aria-disabled={disabled || undefined}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {content}
    </Element>
  )
}

const ForwardedListItem = forwardRef<ListItemSemanticElement, ListItemImplementationProps>(
  ListItemRender,
)
ForwardedListItem.displayName = 'ListItem'

export const ListItem = ForwardedListItem as ListItemComponent

const ForwardedSegmentedListItem = forwardRef<
  ListItemSemanticElement,
  ListItemImplementationProps
>((props, ref) => <ListItemRenderBridge {...props} segmented ref={ref} />)
ForwardedSegmentedListItem.displayName = 'SegmentedListItem'

const ListItemRenderBridge = forwardRef<
  ListItemSemanticElement,
  ListItemImplementationProps
>((props, ref) => ListItemRender(props, ref))
ListItemRenderBridge.displayName = 'ListItemRenderBridge'

export const SegmentedListItem =
  ForwardedSegmentedListItem as SegmentedListItemComponent
