import type { HTMLAttributes, ReactNode, Ref, RefObject } from 'react'

/**
 * The three top-app-bar size tiers. Center alignment is not a size: the
 * current Material catalog merged the center-aligned specimen into the small
 * bar as a title-alignment configuration, which is exactly how the source
 * implements it.
 */
export type AppBarSize = 'small' | 'medium' | 'large'

export type AppBarTitleAlignment = 'start' | 'center'

/**
 * The sourced scroll couplings. `pinned` keeps the bar resting and swaps its
 * container color once content scrolls under it; `enterAlways` hides the bar
 * on any downward scroll and reveals it on any upward one; and
 * `exitUntilCollapsed` shrinks a two-row bar to its collapsed row and keeps
 * it there until the content is scrolled back to the top.
 */
export type AppBarScrollBehavior =
  | 'none'
  | 'pinned'
  | 'enterAlways'
  | 'exitUntilCollapsed'

interface AppBarCommonProps {
  /** Bar headline. A slot, not a heading: document structure stays yours. */
  readonly title: ReactNode
  /** Leading slot, mapping the source's `navigationIcon`. */
  readonly navigationIcon?: ReactNode
  /** Trailing slot, mapping the source's end-aligned `actions` row. */
  readonly actions?: ReactNode
  /**
   * Scroll container the bar couples to. Defaults to the window; pass the
   * ref of an inner scrollable element when the page does not scroll at the
   * document level. Compose wires this through a nested-scroll connection,
   * which has no web analog, so the container is named explicitly.
   */
  readonly scrollContainer?: RefObject<HTMLElement | null>
  readonly children?: never
}

/**
 * A small bar is single-row: it carries a subtitle and title alignment (the
 * source's subtitle overload and `CenterAlignedTopAppBar`), never `flexible`
 * (upstream has no small-flexible variant), and cannot collapse — there is no
 * second row to collapse — so `exitUntilCollapsed` is rejected.
 */
interface AppBarSmallProps {
  readonly size?: 'small'
  readonly flexible?: never
  readonly subtitle?: ReactNode
  readonly titleAlignment?: AppBarTitleAlignment
  readonly scrollBehavior?: Exclude<AppBarScrollBehavior, 'exitUntilCollapsed'>
}

/**
 * The baseline medium/large bars predate the Expressive additions: no
 * subtitle, no title alignment. The current design guidance recommends the
 * flexible variants instead, but the source keeps these stable, so they ship.
 */
interface AppBarBaselineProps {
  readonly size: 'medium' | 'large'
  readonly flexible?: false
  readonly subtitle?: never
  readonly titleAlignment?: never
  readonly scrollBehavior?: AppBarScrollBehavior
}

/** The Expressive flexible tiers: subtitle and alignment, taller with both. */
interface AppBarFlexibleProps {
  readonly size: 'medium' | 'large'
  readonly flexible: true
  readonly subtitle?: ReactNode
  readonly titleAlignment?: AppBarTitleAlignment
  readonly scrollBehavior?: AppBarScrollBehavior
}

type AppBarVariantProps = AppBarSmallProps | AppBarBaselineProps | AppBarFlexibleProps

/**
 * Props for a Material top app bar. The variant union rejects `flexible` on a
 * small bar, `subtitle`/`titleAlignment` on the baseline two-row bars, and
 * `exitUntilCollapsed` on a bar with no row to collapse.
 */
export type AppBarProps = AppBarCommonProps &
  AppBarVariantProps &
  Omit<
    HTMLAttributes<HTMLElement>,
    keyof AppBarCommonProps | 'title' | 'children'
  > & {
    readonly ref?: Ref<HTMLElement>
  }
