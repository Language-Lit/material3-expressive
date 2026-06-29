'use client'

import { forwardRef } from 'react'
import { Icon } from '../display/Icon'
import { cn } from '../../utils/cn'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean
  label?: string
  error?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  checked,
  indeterminate,
  disabled,
  className,
  onChange,
  label,
  error,
  ...props
}, ref) => {
  const handleClick = () => {
    if (!disabled && onChange) {
      const event = new Event('change', { bubbles: true })
      Object.defineProperty(event, 'target', {
        writable: false,
        value: { checked: !checked }
      })
      onChange(event as unknown as React.ChangeEvent<HTMLInputElement>)
    }
  }

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-16dp',
        disabled && 'opacity-38',
        className
      )}
    >
      <div 
        className='relative w-[18px] h-[18px] flex-shrink-0'
        onClick={handleClick}
      >
        <input
          type='checkbox'
          ref={ref}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className='sr-only'
          {...props}
        />
        
        <div 
          className={cn(
            'absolute inset-0 rounded-[2px] border-2 transition-colors duration-short4',
            'hover:bg-[var(--md-sys-color-on-surface)]/hover',
            checked || indeterminate ? 'bg-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)]' : 'border-[var(--md-sys-color-outline)]',
            error && !checked && !indeterminate && 'border-[var(--md-sys-color-error)]',
            error && (checked || indeterminate) && 'bg-[var(--md-sys-color-error)] border-[var(--md-sys-color-error)]',
            disabled && (checked || indeterminate) ? 'bg-[var(--md-sys-color-on-surface)] border-on-surface' : '',
            disabled && !checked && !indeterminate ? 'border-on-surface' : ''
          )}
        />

        <Icon
          name={indeterminate ? 'remove' : 'check'}
          className={cn(
            'absolute inset-0 text-[var(--md-sys-color-on-primary)] transition-opacity duration-short4',
            checked || indeterminate ? 'opacity-100' : 'opacity-0',
            'text-[18px]',
            disabled && 'text-surface'
          )}
        />
      </div>
      
      {label && (
        <span 
          className={cn(
            'text-[var(--md-sys-color-on-surface)] text-body-large select-none',
            error && 'text-[var(--md-sys-color-error)]',
            disabled && 'text-[var(--md-sys-color-on-surface)]/38'
          )}
        >
          {label}
        </span>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'
