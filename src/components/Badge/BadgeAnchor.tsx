import { forwardRef, type ForwardedRef } from 'react'
import type { BadgeAnchorProps } from './Badge.types'

function BadgeAnchorRender(
  { badge, children, className, ...spanProps }: BadgeAnchorProps,
  forwardedRef: ForwardedRef<HTMLSpanElement>,
) {
  const mergedClassName = className ? `m3e-badge-anchor ${className}` : 'm3e-badge-anchor'

  return (
    <span {...spanProps} ref={forwardedRef} className={mergedClassName}>
      {children}
      {badge != null && <span className="m3e-badge-anchor__badge">{badge}</span>}
    </span>
  )
}

const ForwardedBadgeAnchor = forwardRef<HTMLSpanElement, BadgeAnchorProps>(BadgeAnchorRender)
ForwardedBadgeAnchor.displayName = 'BadgeAnchor'

export const BadgeAnchor = ForwardedBadgeAnchor
