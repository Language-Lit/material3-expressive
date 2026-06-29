// IconButton.tsx
import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'
import { Icon, IconProps } from '../display/Icon'

const iconButtonVariants = cva(
  'relative inline-flex items-center justify-center rounded-[var(--md-sys-shape-corner-full)] transition-colors focus:outline-none group select-none',
  {
    variants: {
      variant: {
        filled: '',
        outlined: 'border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]',
        standard: 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]',
        tonal: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:bg-[var(--md-sys-color-secondary-container)]',
      },
      size: {
        small: 'w-40dp h-40dp',
        medium: 'w-40dp h-40dp',
        large: 'w-48dp h-48dp',
      },
    },
    defaultVariants: {
      variant: 'standard',
      size: 'medium',
    },
  }
)

export type IconButtonVariant = 'filled' | 'outlined' | 'standard' | 'tonal'
export type IconButtonSize = 'small' | 'medium' | 'large'

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: IconProps['name']
  iconProps?: Omit<IconProps, 'name'>
  selected?: boolean
  /** Width of the inner button container (only for filled variant) */
  buttonWidth?: 'default' | 'narrow'
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  className,
  variant,
  size,
  icon,
  iconProps,
  selected,
  disabled,
  buttonWidth = 'default',
  ...props
}, ref) => {
  // Use opsz 20 for filled variant, 24 for others (unless explicitly set)
  const iconSize = iconProps?.opsz || (variant === 'filled' ? 20 : 24)

  const getIconColor = () => {
    if (disabled) return 'text-[var(--md-sys-color-on-surface)]/38'
    if (variant === 'filled') {
      return 'text-[var(--md-sys-color-on-primary)]'
    }
    if (variant === 'outlined' || variant === 'standard') {
      return selected ? 'text-[var(--md-sys-color-primary)] group-hover:text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-primary)]'
    }
    if (variant === 'tonal') {
      return selected ? 'text-[var(--md-sys-color-on-secondary-container)] group-hover:text-[var(--md-sys-color-on-secondary-container)]' : 'text-[var(--md-sys-color-secondary)] group-hover:text-[var(--md-sys-color-on-secondary-container)]'
    }
    return ''
  }

  const getOverlayColor = () => {
    if (variant === 'filled') {
      return 'bg-[var(--md-sys-color-on-primary)]'
    }
    return 'bg-current'
  }

  const getBackgroundColor = () => {
    if (disabled) {
      return 'color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent)'
    }
    if (variant === 'filled') {
      return 'var(--md-sys-color-primary)'
    }
    return undefined
  }

  // For filled variant, use two-layer approach
  if (variant === 'filled') {
    const innerWidth = buttonWidth === 'default' ? '32px' : '28px'
    const backgroundColor = getBackgroundColor()

    return (
      <button
        ref={ref}
        className={twMerge(
          'relative inline-flex items-center justify-center focus:outline-none group select-none',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          className
        )}
        style={{
          width: '48px',
          height: '48px',
        }}
        disabled={disabled}
        {...props}
      >
        {/* Visible button container */}
        <span
          className='relative inline-flex items-center justify-center rounded-[var(--md-sys-shape-corner-full)] transition-colors'
          style={{
            width: innerWidth,
            height: '32px',
            backgroundColor,
          }}
        >
          <Icon
            name={icon}
            opsz={iconSize}
            className={getIconColor()}
            {...iconProps}
          />
          {!disabled && (
            <span
              className={twMerge(
                'absolute inset-0 opacity-0 group-hover:opacity-[0.08] group-focus:opacity-[0.1] group-active:opacity-[0.1] rounded-[var(--md-sys-shape-corner-full)] transition-opacity',
                getOverlayColor()
              )}
            />
          )}
        </span>
      </button>
    )
  }

  // For other variants, use single-layer approach
  const buttonClasses = twMerge(
    iconButtonVariants({ variant, size }),
    disabled ? 'cursor-not-allowed bg-[var(--md-sys-color-on-surface)]/12 hover:bg-[var(--md-sys-color-on-surface)]/12' : 'cursor-pointer',
    className
  )

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={disabled}
      {...props}
    >
      <Icon
        name={icon}
        className={twMerge('transition-transform', getIconColor())}
        opsz={iconSize}
        {...iconProps}
      />
      {!disabled && (
        <span className='absolute inset-0 bg-current opacity-0 group-hover:opacity-[0.08] rounded-[var(--md-sys-shape-corner-full)] transition-opacity' />
      )}
    </button>
  )
})

IconButton.displayName = 'IconButton'
