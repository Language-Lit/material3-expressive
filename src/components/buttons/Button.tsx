// Button.tsx
import React, { ButtonHTMLAttributes, ElementType } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
  // Base styles
  'relative inline-flex items-center justify-center rounded-[var(--md-sys-shape-corner-full)] transition-all focus:outline-none group select-none',
  {
    variants: {
      variant: {
        elevated: 'bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-primary)] shadow-md hover:shadow-lg',
        filled: 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]',
        tonal: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]',
        outlined: 'border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)]',
        text: 'text-[var(--md-sys-color-primary)]',
      },
      size: {
        small: 'text-sm px-3 py-2',
        medium: 'text-base px-4 py-2',
        large: 'text-lg px-6 py-3',
      },
    },
    defaultVariants: {
      variant: 'filled',
      size: 'medium',
    },
  }
)

export type ButtonVariant = 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text'
export type ButtonSize = 'small' | 'medium' | 'large'

export interface ButtonProps<T extends ElementType = 'button'>
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  as?: T
  children: React.ReactNode
}

export const Button = <T extends ElementType = 'button'>({
  className,
  variant,
  size,
  as,
  disabled,
  children,
  ...props
}: ButtonProps<T> & Omit<React.ComponentPropsWithoutRef<T>, keyof ButtonProps<T>>) => {
  const Component = as || 'button'

  const buttonClasses = twMerge(
    buttonVariants({ variant, size }),
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    className
  )

  // Only use inline styles for disabled state background
  const inlineStyles = disabled ? {
    backgroundColor: 'color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent)',
    color: 'color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent)'
  } : undefined

  return (
    <Component
      className={buttonClasses}
      style={inlineStyles}
      disabled={disabled}
      {...props}
    >
      {children}
      {!disabled && variant === 'filled' && (
        <span className='absolute inset-0 bg-[var(--md-sys-color-on-primary)] opacity-0 group-hover:opacity-[0.08] group-focus:opacity-[0.1] group-active:opacity-[0.1] rounded-[var(--md-sys-shape-corner-full)] transition-opacity' />
      )}
      {!disabled && variant !== 'filled' && (
        <span className='absolute inset-0 bg-[var(--md-sys-color-on-surface)] opacity-0 group-hover:opacity-[var(--md-sys-state-hover-state-layer-opacity)] group-focus:opacity-[var(--md-sys-state-focus-state-layer-opacity)] group-active:opacity-[var(--md-sys-state-pressed-state-layer-opacity)] rounded-[var(--md-sys-shape-corner-full)] transition-opacity duration-medium-1 ease-standard' />
      )}
    </Component>
  )
}
