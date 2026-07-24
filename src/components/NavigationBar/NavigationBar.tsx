import { forwardRef, type CSSProperties, type ForwardedRef, type ReactElement } from 'react'
import { useControllableState } from '../../internal/useControllableState'
import { BadgeAnchor } from '../Badge'
import type { NavigationBarProps } from './NavigationBar.types'

interface NavigationBarComponent {
  (props: NavigationBarProps): ReactElement | null
  displayName?: string
}

function NavigationBarRender(
  { items, value, defaultValue, onValueChange, className, style, ...navProps }: NavigationBarProps,
  forwardedRef: ForwardedRef<HTMLElement>,
) {
  const [resolvedValue, setValue] = useControllableState({
    value,
    defaultValue: defaultValue ?? items[0]?.value ?? '',
    onChange: onValueChange,
  })

  return (
    <nav
      {...navProps}
      ref={forwardedRef}
      className={className ? `m3e-navigation-bar ${className}` : 'm3e-navigation-bar'}
      style={style as CSSProperties}
    >
      {items.map((item) => {
        const selected = item.value === resolvedValue
        const handleActivate = () => {
          if (item.disabled) return
          setValue(item.value)
        }
        const sharedProps = {
          className: 'm3e-navigation-bar__item',
          'aria-current': selected ? ('page' as const) : undefined,
          'aria-disabled': item.disabled || undefined,
          'data-m3e-selected': selected,
        }
        const icon = (
          <span className="m3e-navigation-bar__icon" aria-hidden="true">
            {selected && item.selectedIcon != null ? item.selectedIcon : item.icon}
          </span>
        )
        const content = (
          <>
            {/*
             * The indicator is decoration, but a badge inside it is not, and
             * `aria-hidden` on an ancestor removes a subtree unconditionally.
             * Hiding it only while there is no badge keeps the pill silent and
             * still lets the badge's own name reach the accessibility tree,
             * where it is announced after this destination's label.
             */}
            <span
              className="m3e-navigation-bar__indicator"
              aria-hidden={item.badge == null ? true : undefined}
            >
              {item.badge == null ? (
                icon
              ) : (
                <BadgeAnchor badge={item.badge}>{icon}</BadgeAnchor>
              )}
            </span>
            <span className="m3e-navigation-bar__label">{item.label}</span>
          </>
        )
        return item.href != null ? (
          // A disabled link omits `href` (anchors have no native disabled
          // state), which also strips the implicit link role — `role="link"`
          // keeps it identifiable to assistive technology as a (disabled)
          // link rather than generic content.
          <a
            {...sharedProps}
            key={item.value}
            role="link"
            href={item.disabled ? undefined : item.href}
            onClick={handleActivate}
          >
            {content}
          </a>
        ) : (
          <button
            {...sharedProps}
            key={item.value}
            type="button"
            disabled={item.disabled}
            onClick={handleActivate}
          >
            {content}
          </button>
        )
      })}
    </nav>
  )
}

const ForwardedNavigationBar = forwardRef<HTMLElement, NavigationBarProps>(NavigationBarRender)
ForwardedNavigationBar.displayName = 'NavigationBar'

export const NavigationBar = ForwardedNavigationBar as NavigationBarComponent
