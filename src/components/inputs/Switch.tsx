import React from 'react'
import { Icon } from '../display/Icon'
import { cva, type VariantProps } from 'class-variance-authority'
import { iconNames } from '../display/Icon/Icon.names'

const switchStyles = cva(
  [
    'relative inline-flex items-center',
    'w-[52px] h-32dp',
    'cursor-pointer',
  ],
  {
    variants: {
      enabled: {
        true: 'opacity-100',
        false: 'opacity-[var(--md-sys-state-dragged-state-layer-opacity)] cursor-not-allowed',
      },
    },
    defaultVariants: {
      enabled: true,
    },
  }
)

const trackStyles = cva(
  [
    'absolute inset-0',
    'rounded-[var(--md-sys-shape-corner-full)]',
    'transition-all duration-[var(--md-sys-motion-duration-medium-4)] ease-[var(--md-sys-motion-easing-standard)]',
    'border-[2px]',
  ],
  {
    variants: {
      checked: {
        true: 'bg-[var(--md-sys-color-primary)] border-[var(--md-sys-color-primary)]',
        false: 'bg-[var(--md-sys-color-surface-container-highest)] border-[var(--md-sys-color-outline)]',
      },
    },
    defaultVariants: {
      checked: false,
    },
  }
)

const handleStyles = cva(
  [
    'absolute',
    'rounded-[var(--md-sys-shape-corner-full)]',
    'flex items-center justify-center',
    'transition-all duration-[var(--md-sys-motion-duration-medium-4)] ease-[var(--md-sys-motion-easing-standard)]',
  ],
  {
    variants: {
      checked: {
        true: 'bg-[var(--md-sys-color-on-primary)] w-24dp h-24dp translate-x-24dp',
        false: 'bg-[var(--md-sys-color-outline)] w-16dp h-16dp translate-x-8dp',
      },
      pressed: {
        true: 'w-[28px] h-[28px] scale-110',
        false: 'scale-100',
      },
      largeUnchecked: {
        true: 'w-24dp h-24dp',
        false: '',
      },
    },
    compoundVariants: [
      {
        checked: false,
        largeUnchecked: true,
        class: 'w-24dp h-24dp translate-x-4dp',
      },
    ],
    defaultVariants: {
      checked: false,
      pressed: false,
      largeUnchecked: false,
    },
  }
)

const handleShadowStyles = cva(
  [
    'absolute inset-0',
    'rounded-[var(--md-sys-shape-corner-full)]',
    'transition-all duration-[var(--md-sys-motion-duration-medium-4)] ease-[var(--md-sys-motion-easing-standard)]',
  ],
  {
    variants: {
      checked: {
        true: 'shadow-[0_1px_2px_0_rgba(var(--shadow),0.3),0_1px_3px_1px_rgba(var(--shadow),0.15)]',
        false: 'shadow-[0_1px_3px_0_rgba(var(--shadow),0.3),0_4px_8px_3px_rgba(var(--shadow),0.15)]',
      },
    },
    defaultVariants: {
      checked: false,
    },
  }
)

export interface SwitchProps extends VariantProps<typeof switchStyles> {
  checked: boolean
  onChange: (checked: boolean) => void
  icon?: (typeof iconNames)[number]
  unselectedIcon?: (typeof iconNames)[number]
}

export const Switch: React.FC<SwitchProps> = ({ 
  checked, 
  onChange, 
  enabled = true, 
  icon,
  unselectedIcon
}) => {
  const [isPressed, setIsPressed] = React.useState(false)
  const shouldUseLargeUnchecked = !!unselectedIcon

  return (
    <div
      className={switchStyles({ enabled })}
      onClick={() => enabled && onChange(!checked)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <div className={trackStyles({ checked })} />
      <div className={handleStyles({ checked, pressed: isPressed, largeUnchecked: shouldUseLargeUnchecked })}>
        <div className={handleShadowStyles({ checked })} />
        {checked && icon && (
          <Icon
            name={icon}
            className='text-[var(--md-sys-color-primary)] text-[1rem]'
            fill={1}
            opsz={20}
          />
        )}
        {!checked && unselectedIcon && (
          <Icon
            name={unselectedIcon}
            className='text-surface-container-highest text-[1rem]'
            fill={1}
            opsz={20}
          />
        )}
      </div>
    </div>
  )
}
