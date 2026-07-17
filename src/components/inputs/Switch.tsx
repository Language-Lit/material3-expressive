'use client'

import { forwardRef, useCallback, useRef } from 'react'
import type { CSSProperties, ForwardedRef, KeyboardEvent } from 'react'
import { useSwitch, type AriaSwitchProps } from '@react-aria/switch'
import { useToggleState } from '@react-stately/toggle'
import { cva } from 'class-variance-authority'
import { Icon } from '../display/Icon'
import { iconNames } from '../display/Icon/Icon.names'
import { cn } from '../../utils/cn'

const switchStyles = cva(
  [
    'group relative inline-flex h-32dp w-[52px] shrink-0 select-none items-center overflow-visible align-middle',
    'touch-manipulation [-webkit-tap-highlight-color:transparent]',
  ],
  {
    variants: {
      disabled: {
        true: 'cursor-default',
        false: 'cursor-pointer',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  }
)

const trackStyles = cva(
  [
    'pointer-events-none absolute inset-0 box-border rounded-[var(--md-sys-shape-corner-full)] border-[2px]',
    'transition-[background-color,border-color,opacity] [transition-duration:67ms] ease-linear motion-reduce:transition-none',
    'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--md-sys-color-primary)]',
  ],
  {
    variants: {
      checked: {
        true: 'border-transparent bg-[var(--md-sys-color-primary)]',
        false: 'border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface-container-highest)]',
      },
      disabled: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        checked: true,
        disabled: true,
        className: 'border-[var(--md-sys-color-on-surface)] bg-[var(--md-sys-color-on-surface)] opacity-[0.12] peer-focus-visible:outline-none forced-colors:opacity-100 forced-colors:border-[GrayText] forced-colors:bg-[GrayText]',
      },
      {
        checked: false,
        disabled: true,
        className: 'border-[var(--md-sys-color-on-surface)] bg-[var(--md-sys-color-surface-container-highest)] opacity-[0.12] peer-focus-visible:outline-none forced-colors:opacity-100 forced-colors:border-[GrayText]',
      },
      {
        checked: true,
        disabled: false,
        className: 'forced-colors:border-[ButtonText] forced-colors:bg-[ButtonText]',
      },
      {
        checked: false,
        disabled: false,
        className: 'forced-colors:border-[ButtonText]',
      },
    ],
    defaultVariants: {
      checked: false,
      disabled: false,
    },
  }
)

const handleContainerStyles = cva(
  [
    'pointer-events-none absolute top-1/2 z-10 flex h-40dp w-40dp -translate-y-1/2 items-center justify-center',
    'transition-[inset-inline-start] [transition-duration:300ms] [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] motion-reduce:transition-none',
    '[--md-switch-state-layer-opacity:0]',
    'before:absolute before:inset-0 before:rounded-[var(--md-sys-shape-corner-full)] before:bg-[var(--md-switch-state-layer-color)] before:opacity-[var(--md-switch-state-layer-opacity)] before:transition-opacity before:[transition-duration:67ms] before:ease-linear before:content-[\'\'] before:motion-reduce:transition-none',
  ],
  {
    variants: {
      checked: {
        true: [
          'start-[16px]',
          '[--md-switch-handle-color:var(--md-sys-color-on-primary)]',
          '[--md-switch-icon-color:var(--md-sys-color-on-primary-container)]',
          '[--md-switch-state-layer-color:var(--md-sys-color-primary)]',
        ],
        false: [
          'start-[-4px]',
          '[--md-switch-handle-color:var(--md-sys-color-outline)]',
          '[--md-switch-icon-color:var(--md-sys-color-surface-container-highest)]',
          '[--md-switch-state-layer-color:var(--md-sys-color-on-surface)]',
        ],
      },
      disabled: {
        true: 'transition-none [--md-switch-state-layer-opacity:0]',
        false: [
          'group-hover:[--md-switch-state-layer-opacity:var(--md-sys-state-hover-state-layer-opacity)]',
          'peer-focus-visible:[--md-switch-state-layer-opacity:var(--md-sys-state-focus-state-layer-opacity)]',
        ],
      },
    },
    compoundVariants: [
      {
        checked: true,
        disabled: false,
        className: [
          'group-hover:[--md-switch-handle-color:var(--md-sys-color-primary-container)]',
          'peer-focus-visible:[--md-switch-handle-color:var(--md-sys-color-primary-container)]',
        ],
      },
      {
        checked: false,
        disabled: false,
        className: [
          'group-hover:[--md-switch-handle-color:var(--md-sys-color-on-surface-variant)]',
          'peer-focus-visible:[--md-switch-handle-color:var(--md-sys-color-on-surface-variant)]',
        ],
      },
      {
        checked: true,
        disabled: true,
        className: [
          '[--md-switch-handle-color:var(--md-sys-color-surface)]',
          '[--md-switch-icon-color:var(--md-sys-color-on-surface)]',
        ],
      },
      {
        checked: false,
        disabled: true,
        className: [
          '[--md-switch-handle-color:var(--md-sys-color-on-surface)]',
          '[--md-switch-icon-color:var(--md-sys-color-surface-container-highest)]',
        ],
      },
    ],
    defaultVariants: {
      checked: false,
      disabled: false,
    },
  }
)

const handleStyles = cva(
  [
    'relative flex items-center justify-center rounded-[var(--md-sys-shape-corner-full)]',
    'transition-[width,height] [transition-duration:250ms] [transition-timing-function:var(--md-sys-motion-easing-standard)] motion-reduce:transition-none',
  ],
  {
    variants: {
      checked: {
        true: 'h-24dp w-24dp',
        false: 'h-16dp w-16dp',
      },
      pressed: {
        true: 'h-[28px] w-[28px] [transition-duration:100ms] ease-linear',
        false: '',
      },
      hasIcon: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        checked: false,
        pressed: false,
        hasIcon: true,
        className: 'h-24dp w-24dp',
      },
    ],
    defaultVariants: {
      checked: false,
      pressed: false,
      hasIcon: false,
    },
  }
)

type SwitchBehaviorProps = Omit<
  AriaSwitchProps,
  'isSelected' | 'defaultSelected' | 'onChange' | 'isDisabled' | 'isReadOnly' | 'children'
>

export interface SwitchProps extends SwitchBehaviorProps {
  /** Controlled checked state. */
  checked?: boolean
  /** Initial checked state when the switch is uncontrolled. */
  defaultChecked?: boolean
  /** Existing boolean change callback retained for backwards compatibility. */
  onChange?: (checked: boolean) => void
  /** Preferred explicit callback name for new call sites. */
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  /** @deprecated Use `disabled` instead. */
  enabled?: boolean
  className?: string
  style?: CSSProperties
  icon?: (typeof iconNames)[number]
  unselectedIcon?: (typeof iconNames)[number]
}

type InteractionStyle = CSSProperties & {
  '--md-switch-state-layer-opacity'?: string
  '--md-switch-handle-color'?: string
  '--md-switch-icon-color'?: string
}

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({
  checked,
  defaultChecked,
  onChange,
  onCheckedChange,
  disabled = false,
  readOnly = false,
  required,
  enabled = true,
  className,
  style,
  icon,
  unselectedIcon,
  ...behaviorProps
}, forwardedRef) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const isDisabled = disabled || enabled === false
  const isRequired = required ?? behaviorProps.isRequired

  const handleCheckedChange = useCallback((nextChecked: boolean) => {
    onChange?.(nextChecked)
    onCheckedChange?.(nextChecked)
  }, [onChange, onCheckedChange])

  const ariaProps: AriaSwitchProps = {
    ...behaviorProps,
    isSelected: checked,
    defaultSelected: defaultChecked,
    onChange: handleCheckedChange,
    isDisabled,
    isReadOnly: readOnly,
    isRequired,
  }
  const state = useToggleState(ariaProps)
  const {
    inputProps,
    isPressed,
    isSelected,
  } = useSwitch(ariaProps, state, inputRef)

  const setInputRef = useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node
    assignRef(forwardedRef, node)
  }, [forwardedRef])

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    inputProps.onKeyDown?.(event)
    if (
      !event.defaultPrevented &&
      event.key === 'Enter' &&
      !isDisabled &&
      !readOnly
    ) {
      event.preventDefault()
      inputRef.current?.click()
    }
  }

  const interactionStyle: InteractionStyle | undefined = isDisabled
    ? { '--md-switch-state-layer-opacity': '0' }
    : isPressed
      ? {
          '--md-switch-state-layer-opacity': 'var(--md-sys-state-pressed-state-layer-opacity)',
          '--md-switch-handle-color': isSelected
            ? 'var(--md-sys-color-primary-container)'
            : 'var(--md-sys-color-on-surface-variant)',
          '--md-switch-icon-color': isSelected
            ? 'var(--md-sys-color-on-primary-container)'
            : 'var(--md-sys-color-surface-container-highest)',
        }
      : undefined

  const hasVisibleIcon = isSelected ? Boolean(icon) : Boolean(unselectedIcon)
  return (
    <span
      className={cn(switchStyles({ disabled: isDisabled }), className)}
      style={style}
      data-state={isSelected ? 'checked' : 'unchecked'}
      data-disabled={isDisabled ? '' : undefined}
      data-pressed={isPressed ? '' : undefined}
    >
      <input
        {...inputProps}
        ref={setInputRef}
        role='switch'
        required={isRequired}
        onKeyDown={handleKeyDown}
        className={cn(
          'peer absolute left-1/2 top-1/2 z-20 m-0 h-48dp w-full -translate-x-1/2 -translate-y-1/2',
          'appearance-none rounded-[var(--md-sys-shape-corner-full)] bg-transparent opacity-0 outline-none',
          isDisabled ? 'cursor-default' : 'cursor-pointer'
        )}
      />

      <span
        aria-hidden='true'
        className={trackStyles({ checked: isSelected, disabled: isDisabled })}
      />

      <span
        aria-hidden='true'
        className={handleContainerStyles({ checked: isSelected, disabled: isDisabled })}
        style={interactionStyle}
      >
        <span className={handleStyles({ checked: isSelected, pressed: isPressed, hasIcon: hasVisibleIcon })}>
          <span
            className={cn(
              'absolute inset-0 rounded-[inherit] bg-[var(--md-switch-handle-color)] transition-[background-color,opacity] [transition-duration:67ms] ease-linear motion-reduce:transition-none',
              isDisabled && !isSelected ? 'opacity-[0.38]' : 'opacity-100',
              isDisabled
                ? 'forced-colors:bg-[GrayText] forced-colors:opacity-100'
                : 'forced-colors:bg-[ButtonText]'
            )}
          />

          {isSelected && icon && (
            <span
              className={cn(
                'relative z-10 transition-opacity [transition-duration:67ms] ease-linear motion-reduce:transition-none',
                isDisabled ? 'opacity-[0.38] forced-colors:opacity-100' : 'opacity-100'
              )}
            >
              <Icon
                name={icon}
                className='text-[1rem] text-[var(--md-switch-icon-color)] transition-colors [transition-duration:67ms] ease-linear motion-reduce:transition-none forced-colors:text-[Canvas]'
                fill={1}
                opsz={20}
              />
            </span>
          )}
          {!isSelected && unselectedIcon && (
            <span
              className={cn(
                'relative z-10 transition-opacity [transition-duration:67ms] ease-linear motion-reduce:transition-none',
                isDisabled ? 'opacity-[0.38] forced-colors:opacity-100' : 'opacity-100'
              )}
            >
              <Icon
                name={unselectedIcon}
                className='text-[1rem] text-[var(--md-switch-icon-color)] transition-colors [transition-duration:67ms] ease-linear motion-reduce:transition-none forced-colors:text-[Canvas]'
                fill={1}
                opsz={20}
              />
            </span>
          )}
        </span>
      </span>
    </span>
  )
})

Switch.displayName = 'Switch'
