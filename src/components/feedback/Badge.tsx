import { twMerge } from 'tailwind-merge'

/**
 * Material 3 Badge — https://m3.material.io/components/badges/specs
 *
 * Two sizes, chosen by the presence of a label:
 * - Small (dot): 6dp circle, error container, no label.
 * - Large: 16dp height / 16dp min-width, corner-full, error container,
 *   on-error label in label-small type, 4dp horizontal padding.
 *
 * Per M3 guidance the label should stay within 4 characters: numeric values
 * above `max` (default 999) render as "999+".
 */

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Label inside the badge. Omit for the small (6dp dot) badge. */
  value?: number | string
  /** Cap for numeric values; anything above renders as "{max}+". Default 999. */
  max?: number
}

export function formatBadgeLabel(value: number | string, max: number): string {
  if (typeof value === 'number' && value > max) return `${max}+`
  return `${value}`
}

export const Badge: React.FC<BadgeProps> = ({ value, max = 999, className, ...props }) => {
  const hasLabel = value !== undefined
  return (
    <span
      className={twMerge(
        'inline-flex items-center justify-center rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-error)]',
        hasLabel
          ? 'h-[16px] min-w-[16px] px-[4px] text-[var(--md-sys-color-on-error)] font-[var(--md-sys-typescale-label-small-weight)] text-[length:var(--md-sys-typescale-label-small-size)] leading-[var(--md-sys-typescale-label-small-line-height)] tracking-[var(--md-sys-typescale-label-small-tracking)]'
          : 'w-[6px] h-[6px]',
        className
      )}
      {...props}
    >
      {hasLabel && formatBadgeLabel(value, max)}
    </span>
  )
}
