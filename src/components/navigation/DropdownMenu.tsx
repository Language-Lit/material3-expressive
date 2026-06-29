'use client'

import React, { useEffect } from 'react'
import { MenuList } from './MenuList'

/**
 * DropdownMenu - Simple dropdown menu for actions
 *
 * Use this for:
 * - Profile menus
 * - More options menus
 * - Context menus
 * - Action menus
 *
 * Features:
 * - Automatic click outside detection
 * - Escape key to close
 * - Portal rendering
 * - Floating UI positioning
 *
 * Example:
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 * const buttonRef = useRef<HTMLButtonElement>(null)
 *
 * <button ref={buttonRef} onClick={() => setIsOpen(true)}>Open Menu</button>
 * <DropdownMenu
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   anchorEl={buttonRef.current}
 * >
 *   <MenuItem onClick={handleAction}>Action</MenuItem>
 * </DropdownMenu>
 * ```
 */

export interface DropdownMenuProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  anchorEl: HTMLElement | null
  className?: string
  fullWidth?: boolean
  customWidth?: number
  surface?: 'default' | 'elevated'
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  isOpen,
  onClose,
  anchorEl,
  className,
  fullWidth,
  customWidth,
  surface = 'default',
}) => {
  // Fix click-outside issue: Add small delay before enabling click outside detection
  // This prevents the click that opens the menu from immediately closing it
  const [enableClickOutside, setEnableClickOutside] = React.useState(false)

  useEffect(() => {
    if (isOpen) {
      // Small delay to let the opening click event complete
      const timer = setTimeout(() => {
        setEnableClickOutside(true)
      }, 10)
      return () => clearTimeout(timer)
    } else {
      setEnableClickOutside(false)
    }
  }, [isOpen])

  return (
    <MenuList
      isOpen={isOpen}
      onClose={onClose}
      anchorEl={anchorEl}
      className={className}
      fullWidth={fullWidth}
      customWidth={customWidth}
      surface={surface}
      disableClickOutside={!enableClickOutside}
    >
      {children}
    </MenuList>
  )
}
