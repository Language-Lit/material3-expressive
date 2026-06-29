// NavigationItem.tsx
import { Icon } from '../display/Icon'
import { Text } from '../display/Text'
import { iconNames } from '../display/Icon/Icon.names'
import { tv, type VariantProps } from 'tailwind-variants'

const navigationItem = tv({
  slots: {
    base: 'flex flex-col items-center group cursor-pointer select-none',
    container: 'w-[56px] rounded-[var(--md-sys-shape-corner-full)] relative overflow-hidden bg-transparent',
    background: 'absolute inset-0 rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-secondary-container)] transform origin-center transition-transform',
    stateLayer: 'absolute inset-0 bg-[var(--md-sys-color-on-secondary-container)] transition-opacity rounded-[var(--md-sys-shape-corner-full)]',
    content: 'relative z-10 flex justify-center items-center h-full w-full',
    icon: 'h-[24px] w-[24px]',
    label: 'cursor-pointer',
  },
  variants: {
    hasLabel: {
      true: { container: 'h-[32px]' },
      false: { container: 'h-[56px]' },
    },
    isActive: {
      true: {
        background: 'scale-x-100 duration-[var(--md-sys-motion-duration-medium3)]',
        icon: 'text-[var(--md-sys-color-on-secondary-container)]',
        label: 'font-bold text-[var(--md-sys-color-secondary)]',
        stateLayer: 'opacity-0 group-hover:opacity-[var(--md-sys-state-hover-state-layer-opacity)] group-focus:opacity-[var(--md-sys-state-focus-state-layer-opacity)] group-active:opacity-[var(--md-sys-state-pressed-state-layer-opacity)]',
      },
      false: {
        background: 'scale-x-0 duration-[var(--md-sys-motion-duration-medium2)]',
        icon: 'text-[var(--md-sys-color-on-surface-variant)]',
        label: 'text-[var(--md-sys-color-on-surface-variant)]',
        stateLayer: 'opacity-0 group-hover:opacity-[var(--md-sys-state-hover-state-layer-opacity)] group-focus:opacity-[var(--md-sys-state-focus-state-layer-opacity)] group-active:opacity-[var(--md-sys-state-pressed-state-layer-opacity)]',
      },
    },
  },
})

export interface NavigationItemProps extends VariantProps<typeof navigationItem> {
  label?: string
  iconName: (typeof iconNames)[number]
  onClick?: () => void
  onMouseEnter?: () => void
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  label,
  isActive,
  iconName,
  onClick,
  onMouseEnter
}) => {
  const styles = navigationItem({ hasLabel: !!label, isActive })

  return (
    <div
      className={styles.base()}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <div className={styles.container()}>
        <div className={styles.background()} />
        <div className={styles.stateLayer()} />
        <div className={styles.content()}>
          <Icon
            name={iconName}
            className={styles.icon()}
            fill={isActive ? 1 : 0}
          />
        </div>
      </div>

      {label && (
        <Text type='label' size='medium' className={styles.label()}>
          {label}
        </Text>
      )}
    </div>
  )
}
