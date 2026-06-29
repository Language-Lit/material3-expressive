'use client'

import { Text } from '../display/Text'
import { Icon, iconNames } from '../display/Icon'
import { IconButton } from '../buttons/IconButton'
import { useMaterial3 } from '../../context/Material3Provider'

export interface HorizontalEmptyStateProps {
  message: string
  icon?: (typeof iconNames)[number]
  buttonIcon: (typeof iconNames)[number]
  buttonLabel: string // Used for aria-label
  onButtonClick?: () => void
  buttonPath?: string
  className?: string
}

export function HorizontalEmptyState({
  message,
  icon = 'lightbulb',
  buttonIcon,
  buttonLabel,
  onButtonClick,
  buttonPath,
  className
}: HorizontalEmptyStateProps) {
  const { Link } = useMaterial3()
  const button = (
    <IconButton
      icon={buttonIcon}
      onClick={onButtonClick}
      aria-label={buttonLabel}
      className='flex-shrink-0'
    />
  )

  return (
    <div className={`flex items-center justify-between p-16dp bg-[var(--md-sys-color-surface-container)] rounded-[var(--md-sys-shape-corner-large)] w-full ${className || ''}`}>
      <div className='flex items-center gap-16dp'>
        <div className='w-40dp h-40dp rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-surface-container-high)] flex items-center justify-center flex-shrink-0'>
          <Icon
            name={icon}
            className='text-[var(--md-sys-color-on-surface-variant)]'
            fill={0}
            weight={400}
            opsz={24}
          />
        </div>
        <Text type='body' size='large' className='text-[var(--md-sys-color-on-surface-variant)]'>
          {message}
        </Text>
      </div>
      {buttonPath ? (
        <Link href={buttonPath}>
          {button}
        </Link>
      ) : (
        button
      )}
    </div>
  )
}
