'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/cn'
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from '@floating-ui/react-dom'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { menuVariants } from './menu.variants'

/**
 * MenuList - Shared primitive for rendering positioned menu lists
 *
 * This component handles:
 * - Portalling to document.body
 * - Positioning with Floating UI
 * - Click outside detection
 * - Escape key handling
 *
 * Used by both Select and DropdownMenu components
 */

export interface MenuListProps {
  children: React.ReactNode
  onClose: () => void
  anchorEl?: HTMLElement | null
  className?: string
  fullWidth?: boolean
  customWidth?: number
  id?: string
  surface?: 'default' | 'elevated'
  isOpen?: boolean
  // For React Aria integration
  listBoxProps?: React.HTMLAttributes<HTMLUListElement>
  listBoxRef?: React.RefObject<HTMLUListElement | null>
  // Control whether to use click outside
  disableClickOutside?: boolean
}

export const MenuList: React.FC<MenuListProps> = ({
  children,
  onClose,
  anchorEl,
  className,
  fullWidth = false,
  customWidth,
  surface = 'default',
  id,
  isOpen = true,
  listBoxProps = {},
  listBoxRef: externalListBoxRef,
  disableClickOutside = false,
}) => {
  const [isMounted, setIsMounted] = useState(false)
  const anchorRef = useRef<HTMLElement | null>(null)
  const internalListBoxRef = useRef<HTMLUListElement | null>(null)

  const { x, y, strategy, refs } = useFloating({
    placement: 'bottom-start',
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  // Memoize the close handler
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  // Store anchor element in ref for click outside hook
  useEffect(() => {
    anchorRef.current = anchorEl ?? null
  }, [anchorEl])

  // Set the reference element when anchorEl changes
  useEffect(() => {
    if (anchorEl) {
      refs.setReference(anchorEl)
    }
  }, [anchorEl, refs])

  // Handle click outside using custom hook (only if not disabled)
  useOnClickOutside(
    refs.floating,
    disableClickOutside ? () => {} : handleClose,
    anchorRef
  )

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [handleClose, isOpen])

  // Set mounted state after component mounts on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Calculate width
  const menuWidth = React.useMemo(() => {
    if (fullWidth && anchorEl) {
      return anchorEl.offsetWidth
    }
    if (customWidth) {
      return customWidth
    }
    return 'auto'
  }, [fullWidth, anchorEl, customWidth])

  // Combine refs for listBox and floating (must be before early return)
  const setRefs = useCallback(
    (node: HTMLUListElement | null) => {
      // Handle both internal and external refs
      if (externalListBoxRef) {
        // External ref is readonly, handled by the parent
      } else {
        internalListBoxRef.current = node
      }
      refs.setFloating(node)
    },
    [refs, externalListBoxRef]
  )

  // Don't render if not open or not mounted
  if (!isMounted || !isOpen) return null

  return createPortal(
    <ul
      {...listBoxProps}
      ref={setRefs}
      className={cn(menuVariants({ surface }), className)}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        width: menuWidth,
      }}
      role="menu"
      aria-orientation="vertical"
      id={id}
    >
      {children}
    </ul>,
    document.body
  )
}
