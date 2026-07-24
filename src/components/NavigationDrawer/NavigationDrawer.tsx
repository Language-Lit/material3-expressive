import {
  forwardRef,
  useEffect,
  useRef,
  type CSSProperties,
  type DialogHTMLAttributes,
  type ForwardedRef,
  type MouseEventHandler,
  type ReactElement,
} from 'react'
import { composeEventHandlers } from '../../internal/composeEventHandlers'
import { composeRefs } from '../../internal/composeRefs'
import { useControllableState } from '../../internal/useControllableState'
import type { NavigationDrawerProps, NavigationItem } from './NavigationDrawer.types'

interface NavigationDrawerComponent {
  (props: NavigationDrawerProps): ReactElement | null
  displayName?: string
}

function renderItem(
  item: NavigationItem,
  selected: boolean,
  onActivate: () => void,
): ReactElement {
  const sharedProps = {
    className: 'm3e-navigation-drawer__item',
    'aria-current': selected ? ('page' as const) : undefined,
    'aria-disabled': item.disabled || undefined,
    'data-m3e-selected': selected,
  }
  const content = (
    <>
      <span className="m3e-navigation-drawer__icon" aria-hidden="true">
        {selected && item.selectedIcon != null ? item.selectedIcon : item.icon}
      </span>
      <span className="m3e-navigation-drawer__label">{item.label}</span>
      {/*
       * The drawer's badge is a different affordance from the anchored pill the
       * bar and rail use: `NavigationDrawerItem` documents it as "optional badge
       * to show on this item from the end side", and colors it with the item's
       * own text color rather than the error container.
       */}
      {item.badge != null && (
        <span className="m3e-navigation-drawer__badge">{item.badge}</span>
      )}
    </>
  )
  return item.href != null ? (
    // A disabled link omits `href` (anchors have no native disabled state),
    // which also strips the implicit link role — `role="link"` keeps it
    // identifiable to assistive technology as a (disabled) link rather
    // than generic content.
    <a
      {...sharedProps}
      key={item.value}
      role="link"
      href={item.disabled ? undefined : item.href}
      onClick={onActivate}
    >
      {content}
    </a>
  ) : (
    <button {...sharedProps} key={item.value} type="button" disabled={item.disabled} onClick={onActivate}>
      {content}
    </button>
  )
}

function NavigationDrawerRender(
  {
    items,
    value,
    defaultValue,
    onValueChange,
    variant = 'modal',
    open,
    defaultOpen = false,
    onOpenChange,
    className,
    style,
    id: idProp,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...divProps
  }: NavigationDrawerProps,
  forwardedRef: ForwardedRef<HTMLElement>,
) {
  const [resolvedValue, setValue] = useControllableState({
    value,
    defaultValue: defaultValue ?? items[0]?.value ?? '',
    onChange: onValueChange,
  })
  const [resolvedOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  // Independently duplicates Dialog's own small native-<dialog> lifecycle
  // (see ADR) rather than sharing it: only 'modal' needs it at all, and
  // the two components' exact backdrop/escape nuances differ enough that
  // a forced shared abstraction would need its own parameterization.
  useEffect(() => {
    if (variant !== 'modal') return
    const dialogEl = dialogRef.current
    if (!dialogEl) return
    if (resolvedOpen && !dialogEl.open) dialogEl.showModal()
    else if (!resolvedOpen && dialogEl.open) dialogEl.close()
  }, [variant, resolvedOpen])

  useEffect(() => {
    if (variant !== 'modal') return
    const dialogEl = dialogRef.current
    if (!dialogEl) return undefined
    const handleNativeClose = () => setOpen(false)
    dialogEl.addEventListener('close', handleNativeClose)
    return () => dialogEl.removeEventListener('close', handleNativeClose)
  }, [variant, setOpen])

  // The pinned source's modal scrim is itself clickable
  // (`Scrim(onClick = if (drawerState.isOpen) onDismissRequest else null)`),
  // so tapping outside the sheet closes the drawer. Native `<dialog>` has no
  // automatic outside-click dismissal at this library's browser floor, so this
  // reuses Dialog's own manual light-dismiss technique: a click landing on the
  // dialog element itself — never a descendant — with coordinates outside its
  // own rendered box is a click on the backdrop.
  const handleClick: MouseEventHandler<HTMLDialogElement> = (event) => {
    const dialogEl = dialogRef.current
    if (!dialogEl || event.target !== dialogEl) return
    const rect = dialogEl.getBoundingClientRect()
    const clickedInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    if (!clickedInside) dialogEl.close()
  }

  const isOpen = variant === 'permanent' ? true : resolvedOpen
  const mergedClassName = className ? `m3e-navigation-drawer ${className}` : 'm3e-navigation-drawer'

  const nav = (
    <nav aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} className="m3e-navigation-drawer__nav">
      {items.map((item) => {
        const selected = item.value === resolvedValue
        return renderItem(item, selected, () => {
          if (item.disabled) return
          setValue(item.value)
        })
      })}
    </nav>
  )

  if (variant === 'modal') {
    const dialogProps = divProps as DialogHTMLAttributes<HTMLDialogElement>
    return (
      <dialog
        {...dialogProps}
        ref={composeRefs(forwardedRef, dialogRef)}
        id={idProp}
        className={mergedClassName}
        style={style as CSSProperties}
        data-m3e-variant={variant}
        onClick={composeEventHandlers(dialogProps.onClick, handleClick)}
      >
        {nav}
      </dialog>
    )
  }

  return (
    <div
      {...divProps}
      ref={forwardedRef as ForwardedRef<HTMLDivElement>}
      id={idProp}
      className={mergedClassName}
      style={style as CSSProperties}
      data-m3e-variant={variant}
      data-m3e-open={isOpen}
    >
      {nav}
    </div>
  )
}

const ForwardedNavigationDrawer = forwardRef<HTMLElement, NavigationDrawerProps>(NavigationDrawerRender)
ForwardedNavigationDrawer.displayName = 'NavigationDrawer'

export const NavigationDrawer = ForwardedNavigationDrawer as NavigationDrawerComponent
