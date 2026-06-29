'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/cn'

export interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  zIndex?: number
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  children,
  className,
  zIndex = 100
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onClose])

  if (typeof window === 'undefined' || !open) return null

  return createPortal(
    <div className='fixed inset-0 flex items-center justify-center p-24dp animate-fade-in' style={{ zIndex }}>
      <div
        className='fixed inset-0 bg-[var(--md-sys-color-scrim)] opacity-[0.32]'
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className={cn(
          'relative bg-[var(--md-sys-color-surface-container)] rounded-[var(--md-sys-shape-corner-medium)] shadow-3',
          'max-h-[calc(100vh-48dp)] overflow-y-auto',
          'mx-24dp md:mx-0',
          className
        )}
        style={{ zIndex: zIndex + 10 }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}
