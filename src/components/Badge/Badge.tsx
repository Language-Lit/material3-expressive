import { forwardRef, type ForwardedRef } from 'react'
import type { BadgeProps } from './Badge.types'

function BadgeRender(
  { label, children, className, ...spanProps }: BadgeProps,
  forwardedRef: ForwardedRef<HTMLSpanElement>,
) {
  // The source picks its size and shape from `content != null` rather than from
  // a parameter, so the presence of children is the variant. `!= null` keeps a
  // zero count large, which is the case a `> 0` test would silently shrink.
  const variant = children != null ? 'large' : 'small'
  const mergedClassName = className ? `m3e-badge ${className}` : 'm3e-badge'

  return (
    <span
      {...spanProps}
      ref={forwardedRef}
      className={mergedClassName}
      data-m3e-variant={variant}
      // `img` names the badge and prunes its descendants, so a labelled count
      // is announced once, as the label, rather than twice.
      role={label != null ? 'img' : undefined}
      aria-label={label}
    >
      {children}
    </span>
  )
}

const ForwardedBadge = forwardRef<HTMLSpanElement, BadgeProps>(BadgeRender)
ForwardedBadge.displayName = 'Badge'

export const Badge = ForwardedBadge
