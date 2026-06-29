// FAB.tsx - Floating Action Button
'use client'

import React from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon, IconProps } from '../display/Icon'
import { useMaterial3 } from '../../context/Material3Provider'

export type FABVariant = 'primary' | 'small'

export interface FABProps {
  /** Icon name to display */
  iconName: IconProps['name']
  /** FAB size variant */
  variant?: FABVariant
  /** Additional CSS classes */
  className?: string
  /** Click handler */
  onClick?: () => void
  /** Navigation href - if provided, FAB will be a link */
  href?: string
  /** Accessible label */
  'aria-label'?: string
}

export const FAB = ({ 
  iconName, 
  variant = 'primary', 
  className,
  onClick,
  href,
  'aria-label': ariaLabel,
}: FABProps) => {
  const { Link } = useMaterial3()
  const baseClasses = 'flex justify-center items-center bg-[var(--md-sys-color-primary-container)] rounded-[var(--md-sys-shape-corner-large)] relative overflow-hidden cursor-pointer'
  
  const variantClasses = {
    primary: 'w-56dp h-56dp',
    small: 'w-40dp h-40dp'
  }

  const content = (
    <>
      {/* State layer for hover effects */}
      <div className='absolute inset-0 bg-[var(--md-sys-color-on-primary-container)] opacity-0 hover:opacity-[var(--md-sys-state-hover-state-layer-opacity)] transition-opacity duration-medium-2' />
      
      <Icon name={iconName} className='relative z-10 text-[var(--md-sys-color-on-primary-container)]' />
    </>
  )

  const combinedClasses = twMerge(
    baseClasses,
    variantClasses[variant],
    className
  )

  if (href) {
    return (
      <Link 
        href={href}
        className={combinedClasses}
        aria-label={ariaLabel}
      >
        {content}
      </Link>
    )
  }

  return (
    <button 
      className={combinedClasses}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  )
}
