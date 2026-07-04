// NavigationItem.tsx
import { Icon } from '../display/Icon'
import { Text } from '../display/Text'
import { Badge } from '../feedback/Badge'
import { iconNames } from '../display/Icon/Icon.names'
import { tv, type VariantProps } from 'tailwind-variants'

const navigationItem = tv({
  slots: {
    // container must NOT clip (no overflow-hidden): the badge overlaps the
    // icon's top-end corner and may extend past the active-indicator pill,
    // per the M3 badge placement spec. background/stateLayer carry their own
    // corner-full radius, so nothing needs the clip.
    base: 'flex flex-col items-center group cursor-pointer select-none',
    container: 'w-[56px] rounded-[var(--md-sys-shape-corner-full)] relative bg-transparent',
    background: 'absolute inset-0 rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-secondary-container)] transform origin-center transition-transform',
    stateLayer: 'absolute inset-0 bg-[var(--md-sys-color-on-secondary-container)] transition-opacity rounded-[var(--md-sys-shape-corner-full)]',
    content: 'relative z-10 flex justify-center items-center h-full w-full',
    // Anchor box for the badge, sized to the icon (24dp) so the M3 offsets
    // (dot: top-end corner, 6dp overlap; large: start 12dp from the icon's
    // leading edge, top 2dp above) resolve against the icon, not the pill.
    iconAnchor: 'relative inline-flex',
    icon: 'h-[24px] w-[24px]',
    badgeDot: 'absolute top-0 start-[18px]',
    badgeLarge: 'absolute top-[-2px] start-[12px]',
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
  /**
   * M3 badge on the destination icon: `true` renders the small dot,
   * a number or string renders the large labeled badge (numbers above 999
   * render as "999+"). `false`, `0`, and `undefined` render nothing —
   * a badge communicates "something is waiting", so an empty count hides it.
   */
  badge?: boolean | number | string
  onClick?: () => void
  onMouseEnter?: () => void
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  label,
  isActive,
  iconName,
  badge,
  onClick,
  onMouseEnter
}) => {
  const styles = navigationItem({ hasLabel: !!label, isActive })
  const showBadge = badge !== undefined && badge !== false && badge !== 0

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
          <span className={styles.iconAnchor()}>
            <Icon
              name={iconName}
              className={styles.icon()}
              fill={isActive ? 1 : 0}
            />
            {showBadge && (
              <Badge
                value={badge === true ? undefined : badge}
                className={badge === true ? styles.badgeDot() : styles.badgeLarge()}
              />
            )}
          </span>
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
