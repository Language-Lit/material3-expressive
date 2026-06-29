import { useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'
import { Icon, IconProps } from '../display/Icon'

const segmentedButtonContainerVariants = cva(
  'inline-flex rounded-[var(--md-sys-shape-corner-full)] border border-[var(--md-sys-color-outline)] overflow-hidden h-40dp',
  {
    variants: {
      disabled: {
        true: 'opacity-38',
        false: '',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  }
)

const segmentedButtonVariants = cva(
  'flex items-center justify-center px-12dp py-8dp transition-all duration-medium-2 relative overflow-hidden',
  {
    variants: {
      state: {
        active: 'bg-[var(--md-sys-color-secondary-container)]',
        inactive: 'bg-[var(--md-sys-color-surface)]',
      },
      disabled: {
        true: 'pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      state: 'inactive',
      disabled: false,
    },
  }
)

const stateLayerVariants = cva(
  'absolute inset-0 transition-opacity duration-medium-1 ease-standard opacity-0',
  {
    variants: {
      state: {
        active: 'bg-[var(--md-sys-color-on-secondary-container)]',
        inactive: 'bg-[var(--md-sys-color-on-surface)]',
      },
    },
    defaultVariants: {
      state: 'inactive',
    },
  }
)

const labelVariants = cva(
  'text-label-large font-medium tracking-[0.1px] leading-5 transition-colors duration-medium-1',
  {
    variants: {
      state: {
        active: 'text-[var(--md-sys-color-on-secondary-container)] group-hover:text-[var(--md-sys-color-on-secondary-container)]',
        inactive: 'text-[var(--md-sys-color-on-surface)] group-hover:text-[var(--md-sys-color-on-surface)]',
      },
    },
    defaultVariants: {
      state: 'inactive',
    },
  }
)

const iconVariants = cva(
  'w-18dp h-18dp mr-8dp transition-colors duration-medium-1',
  {
    variants: {
      state: {
        active: 'text-[var(--md-sys-color-on-secondary-container)] group-hover:text-[var(--md-sys-color-on-secondary-container)]',
        inactive: 'text-[var(--md-sys-color-on-surface)] group-hover:text-[var(--md-sys-color-on-surface)]',
      },
    },
    defaultVariants: {
      state: 'inactive',
    },
  }
)

interface TabButtonProps extends VariantProps<typeof segmentedButtonVariants> {
  tab: string
  label: string
  icon?: IconProps['name']
  isActive: boolean
  onClick: (tab: string) => void
}

const TabButton: React.FC<TabButtonProps> = ({ tab, label, icon, isActive, onClick, state, disabled }) => (
  <button
    onClick={() => onClick(tab)}
    className={twMerge(segmentedButtonVariants({ state, disabled }), 'group')}
    disabled={disabled!!}
  >
    {/* State layer */}
    <div className={twMerge(
      stateLayerVariants({ state }),
      'group-hover:opacity-[var(--md-sys-state-hover-state-layer-opacity)] group-focus:opacity-[var(--md-sys-state-focus-state-layer-opacity)] group-active:opacity-[var(--md-sys-state-pressed-state-layer-opacity)]'
    )} />
    
    {icon && (
      <Icon 
        name={isActive ? 'check' : icon}
        className={iconVariants({ state })}
        fill={0}
        weight={400}
        grad={0}
        opsz={18}
      />
    )}
    <span className={labelVariants({ state })}>
      {label}
    </span>
  </button>
)

export interface Tab {
  key: string
  label: string
  icon?: IconProps['name']
}

export interface SegmentedButtonsProps {
  tabs: Tab[]
  onChange: (tab: string) => void
  defaultTab?: string
  disabled?: boolean
}

export const SegmentedButtons: React.FC<SegmentedButtonsProps> = ({ 
  tabs, 
  onChange, 
  defaultTab,
  disabled = false
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0].key)

  const handleTabClick = (tab: string) => {
    if (!disabled) {
      setActiveTab(tab)
      onChange(tab)
    }
  }

  return (
    <div className={segmentedButtonContainerVariants({ disabled })}>
      {tabs.map((tab) => (
        <TabButton
          key={tab.key}
          tab={tab.key}
          label={tab.label}
          icon={tab.icon}
          isActive={activeTab === tab.key}
          state={activeTab === tab.key ? 'active' : 'inactive'}
          onClick={handleTabClick}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
