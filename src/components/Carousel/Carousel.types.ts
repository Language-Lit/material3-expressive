import type { ComponentPropsWithRef, MouseEventHandler, ReactNode } from 'react'

/**
 * The six layouts the Material specification's own measurement tables
 * enumerate. Five run the keyline engine ported from the pinned
 * `Keylines.kt`/`Strategy.kt`; `multiAspect` runs the aspect-ratio engine from
 * `MultiAspectCarousel.kt`.
 */
export type CarouselLayout =
  | 'multiBrowse'
  | 'uncontained'
  | 'multiAspect'
  | 'hero'
  | 'centeredHero'
  | 'fullScreen'

/**
 * The two scrolling behaviors the specification names. `snap` aligns items to
 * the layout after a gesture and is recommended for multi-browse, both hero
 * layouts, and full-screen — which the specification requires it for. `free` is
 * standard scrolling, recommended for the uncontained layouts.
 */
export type CarouselScroll = 'snap' | 'free'

interface CarouselItemBase {
  /** Stable identity for this item across renders. */
  readonly key: string
  /** The item's visual content, laid out at the unmasked item size. */
  readonly content: ReactNode
  /**
   * Accessible name for this item. It is composed with the item's position, so
   * a labelled item announces "Sunrise, 3 of 8" and an unlabelled one "3 of 8".
   */
  readonly label?: string
  /**
   * Makes the item a real activatable control. The specification's keyboard
   * table — Space or Enter activates the focused item — is then the browser's
   * own button behavior rather than a synthesized one.
   */
  readonly onActivate?: MouseEventHandler<HTMLElement>
  /** Makes the item a real link. Mutually useful with, and preferred over, `onActivate`. */
  readonly href?: string
  readonly disabled?: boolean
}

/** An item in any layout but `multiAspect`, where every item takes the layout's own size. */
export interface CarouselItem extends CarouselItemBase {
  readonly aspectRatio?: never
}

/**
 * An item in the `multiAspect` layout, which sizes each item from its own
 * aspect ratio. The specification bounds useful ratios at 9:16 for the narrowest
 * item and 16:9 for the widest.
 */
export interface MultiAspectCarouselItem extends CarouselItemBase {
  /** Main-axis over cross-axis, so `16 / 9` is a wide item and `9 / 16` a tall one. */
  readonly aspectRatio: number
}

interface CarouselSharedProps {
  /** Space between items. Defaults to the registered item-spacing token. */
  readonly itemSpacing?: number
  /** Defaults to `snap` for every layout except the two uncontained ones. */
  readonly scroll?: CarouselScroll
  /** Controlled index of the item at a focal position. */
  readonly currentItem?: number
  /** Initial focal index when uncontrolled. Defaults to `0`. */
  readonly defaultCurrentItem?: number
  readonly onCurrentItemChange?: (index: number) => void
}

interface MultiBrowseCarouselProps extends CarouselSharedProps {
  readonly layout?: 'multiBrowse'
  readonly items: readonly CarouselItem[]
  /**
   * The width large, fully visible items would like to be. The arrangement
   * adjusts small items first, then medium ones, and only then this width, so it
   * is a target rather than a guarantee.
   */
  readonly preferredItemWidth: number
  /** Defaults to the registered min-small-item-size token (40px). */
  readonly minSmallItemWidth?: number
  /** Defaults to the registered max-small-item-size token (56px). */
  readonly maxSmallItemWidth?: number
  readonly itemWidth?: never
  readonly maxItemWidth?: never
}

interface UncontainedCarouselProps extends CarouselSharedProps {
  readonly layout: 'uncontained'
  readonly items: readonly CarouselItem[]
  /** The width of every item. The trailing item is cut off by the space that is left. */
  readonly itemWidth: number
  readonly preferredItemWidth?: never
  readonly maxItemWidth?: never
  readonly minSmallItemWidth?: never
  readonly maxSmallItemWidth?: never
}

interface MultiAspectCarouselProps extends CarouselSharedProps {
  readonly layout: 'multiAspect'
  /** Each item declares its own aspect ratio; the layout takes no width of its own. */
  readonly items: readonly MultiAspectCarouselItem[]
  readonly preferredItemWidth?: never
  readonly itemWidth?: never
  readonly maxItemWidth?: never
  readonly minSmallItemWidth?: never
  readonly maxSmallItemWidth?: never
}

interface HeroCarouselProps extends CarouselSharedProps {
  readonly layout: 'hero' | 'centeredHero'
  readonly items: readonly CarouselItem[]
  /**
   * Ceiling for the large item's width. Omitted, one large item fills the
   * viewport minus its small items; given, more large items are added as space
   * allows.
   */
  readonly maxItemWidth?: number
  /** Defaults to the registered min-small-item-size token (40px). */
  readonly minSmallItemWidth?: number
  /** Defaults to the registered max-small-item-size token (56px). */
  readonly maxSmallItemWidth?: number
  readonly preferredItemWidth?: never
  readonly itemWidth?: never
}

interface FullScreenCarouselProps extends CarouselSharedProps {
  /**
   * One edge-to-edge item that scrolls vertically. The specification restricts
   * this layout to portrait orientation and requires snap scrolling.
   */
  readonly layout: 'fullScreen'
  readonly items: readonly CarouselItem[]
  readonly preferredItemWidth?: never
  readonly itemWidth?: never
  readonly maxItemWidth?: never
  readonly minSmallItemWidth?: never
  readonly maxSmallItemWidth?: never
}

type CarouselOwnProps =
  | MultiBrowseCarouselProps
  | UncontainedCarouselProps
  | MultiAspectCarouselProps
  | HeroCarouselProps
  | FullScreenCarouselProps

type CarouselNativeProps = Omit<
  ComponentPropsWithRef<'div'>,
  | keyof CarouselSharedProps
  | 'children'
  | 'items'
  | 'layout'
  | 'preferredItemWidth'
  | 'itemWidth'
  | 'maxItemWidth'
  | 'minSmallItemWidth'
  | 'maxSmallItemWidth'
  | 'role'
>

export type CarouselProps = CarouselOwnProps & CarouselNativeProps
