'use client'

import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  name: string
  /** Applied to the 40dp visual state-layer wrapper. */
  className?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  checked,
  defaultChecked,
  disabled,
  className,
  ...props
}, ref) => {
  return (
    <span
      className={cn(
        'relative inline-flex h-40dp w-40dp shrink-0 items-center justify-center overflow-visible align-middle',
        className
      )}
      data-disabled={disabled ? '' : undefined}
    >
      <input
        {...props}
        ref={ref}
        type='radio'
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className={cn(
          'peer absolute left-1/2 top-1/2 z-20 m-0 h-48dp w-48dp -translate-x-1/2 -translate-y-1/2',
          'appearance-none rounded-[var(--md-sys-shape-corner-full)] bg-transparent opacity-0 outline-none',
          disabled ? 'cursor-default' : 'cursor-pointer'
        )}
      />

      <span
        aria-hidden='true'
        className={cn(
          'pointer-events-none absolute inset-0 rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-on-surface)] opacity-0',
          'transition-opacity [transition-duration:67ms] ease-linear motion-reduce:transition-none',
          'peer-hover:opacity-[var(--md-sys-state-hover-state-layer-opacity)]',
          'peer-focus-visible:opacity-[var(--md-sys-state-focus-state-layer-opacity)]',
          'peer-active:opacity-[var(--md-sys-state-pressed-state-layer-opacity)]',
          'peer-checked:bg-[var(--md-sys-color-primary)] peer-disabled:opacity-0'
        )}
      />

      <span
        aria-hidden='true'
        className={cn(
          'pointer-events-none relative h-20dp w-20dp rounded-[var(--md-sys-shape-corner-full)] border-2dp border-[var(--md-sys-color-on-surface-variant)]',
          'transition-[border-color,opacity] [transition-duration:67ms] ease-linear motion-reduce:transition-none',
          'after:absolute after:inset-0 after:m-auto after:h-0 after:w-0 after:rounded-[var(--md-sys-shape-corner-full)] after:bg-[var(--md-sys-color-primary)] after:content-[\'\']',
          'after:transition-[width,height,background-color] after:[transition-duration:var(--md-sys-motion-duration-short2)] after:[transition-timing-function:var(--md-sys-motion-easing-standard)] after:motion-reduce:transition-none',
          'peer-hover:border-[var(--md-sys-color-on-surface)]',
          'peer-focus-visible:border-[var(--md-sys-color-on-surface)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-[8px] peer-focus-visible:outline-[var(--md-sys-color-primary)]',
          'peer-checked:border-[var(--md-sys-color-primary)] peer-checked:after:h-8dp peer-checked:after:w-8dp',
          'peer-disabled:border-[var(--md-sys-color-on-surface)] peer-disabled:opacity-[0.38] peer-disabled:after:bg-[var(--md-sys-color-on-surface)] peer-disabled:cursor-default',
          'forced-colors:border-[ButtonText] forced-colors:after:bg-[ButtonText] peer-disabled:forced-colors:border-[GrayText] peer-disabled:forced-colors:after:bg-[GrayText] peer-disabled:forced-colors:opacity-100'
        )}
      />
    </span>
  )
})

Radio.displayName = 'Radio'
