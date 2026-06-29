'use client'

import React, { useRef, useCallback } from 'react'
import { cn } from '../../utils/cn'
import { Text } from '../display/Text'
import { useOption } from '@react-aria/listbox'
import { ListState } from '@react-stately/list'
import { Node } from '@react-types/shared'
import { menuItemVariants } from './menu.variants'

/**
 * MenuItem - Shared menu item component
 *
 * Supports two modes:
 * 1. React Aria mode (with item + state) - For accessible select components
 * 2. Simple mode (with onClick) - For basic dropdown menus
 */

export interface MenuItemProps {
  children: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
  disabled?: boolean
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  selected?: boolean
  className?: string
  intent?: 'default' | 'destructive'
  // React Aria props
  item?: Node<any>
  state?: ListState<any>
}

export const MenuItem: React.FC<MenuItemProps> = ({
  children,
  onClick,
  disabled = false,
  leadingIcon,
  trailingIcon,
  selected = false,
  className,
  intent = 'default',
  item,
  state,
}) => {
  const ref = useRef<HTMLLIElement>(null)

  // Use React Aria's useOption if state and item are provided
  const { optionProps, isSelected, isFocused, isDisabled } = item && state
    ? useOption({ key: item.key }, state, ref)
    : {
        optionProps: {},
        isSelected: selected,
        isFocused: false,
        isDisabled: disabled,
      }

  // Determine the state variant
  const stateVariant = isDisabled
    ? 'disabled'
    : isSelected
    ? 'selected'
    : isFocused
    ? 'focused'
    : 'default'

  const { base, text, icon } = menuItemVariants({
    state: stateVariant,
    intent,
  })

  // Memoize click handler
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDisabled) return
      onClick?.(e)
    },
    [isDisabled, onClick]
  )

  return (
    <li
      {...optionProps}
      {...(!item && {
        onClick: handleClick,
        role: 'menuitem',
        tabIndex: isDisabled ? undefined : 0
      })}
      ref={ref}
      className={cn(base(), className)}
      aria-disabled={isDisabled}
    >
      {leadingIcon && (
        <span className={icon({ iconPosition: 'leading' })}>{leadingIcon}</span>
      )}
      <Text type="body" size="large" className={text()} as="span">
        {children}
      </Text>
      {trailingIcon && (
        <span className={icon({ iconPosition: 'trailing' })}>{trailingIcon}</span>
      )}
    </li>
  )
}

/**
 * MenuDivider - Simple divider for menu sections
 */
export const MenuDivider: React.FC = () => (
  <hr
    className="my-[4px] mx-0 border-t border-[var(--md-sys-color-outline-variant)]"
    role="separator"
    aria-orientation="horizontal"
  />
)
