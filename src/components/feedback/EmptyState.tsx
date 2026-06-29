import { Text } from '../display/Text'
import { Icon, iconNames } from '../display/Icon'

export interface EmptyStateProps {
  message: string
  icon?: (typeof iconNames)[number]
  className?: string
}

export function EmptyState({ 
  message, 
  icon = 'lightbulb',
  className
}: EmptyStateProps) {
  return (
    <div className={className}>
      <div className="flex flex-col items-center justify-center py-32dp text-center">
        <div className="w-48dp h-48dp rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-surface-container-high)] flex items-center justify-center mb-16dp">
          <Icon 
            name={icon} 
            className="text-[var(--md-sys-color-on-surface-variant)]" 
            fill={0}
            weight={400}
            opsz={24}
          />
        </div>
        
        <Text
          type="body"
          size="large"
          className="max-w-384dp text-[var(--md-sys-color-on-surface-variant)]"
        >
          {message}
        </Text>
      </div>
    </div>
  )
}
