import type { ComponentPropsWithRef, ReactNode } from 'react'

interface BadgeOwnProps {
  /**
   * Text announced in place of the badge — "3 unread messages" rather than the
   * bare "3" it shows. It names the badge and prunes the visible glyph, so the
   * count is read once. Without it the badge exposes no role, matching the
   * Material source, where badges carry no semantics.
   */
  readonly label?: string
  /**
   * Short count or status text, capped at four characters including a `+`. Its
   * presence selects the variant, as the source's `content != null` does: a
   * childless badge is the small dot, any content makes it the large pill.
   */
  readonly children?: ReactNode
}

/** Props for a Material badge. */
export type BadgeProps = BadgeOwnProps & Omit<ComponentPropsWithRef<'span'>, keyof BadgeOwnProps>

interface BadgeAnchorOwnProps {
  /** The badge to position, typically a `Badge`. */
  readonly badge?: ReactNode
  /** The content the badge is anchored to, typically an icon. */
  readonly children?: ReactNode
}

/**
 * Props for the badge positioner. The anchor measures only its `children`: the
 * badge is taken out of flow, so adding one never changes the surrounding
 * layout.
 */
export type BadgeAnchorProps = BadgeAnchorOwnProps &
  Omit<ComponentPropsWithRef<'span'>, keyof BadgeAnchorOwnProps>
