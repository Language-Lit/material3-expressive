import type { HTMLAttributes, InputHTMLAttributes, ReactNode, Ref, RefObject } from 'react'

/**
 * The specification's two search styles. `contained` is the Expressive default
 * the design site recommends: the bar keeps its filled pill in every state and
 * the results sit in their own surface. `divided` is the baseline treatment,
 * where a divider separates the bar from the results and the bar's own
 * container goes transparent once expanded.
 */
export type SearchBarAppearance = 'contained' | 'divided'

/**
 * Where suggestions and results appear once search is focused. `adaptive` is
 * the guidance itself — full-screen in a compact window, docked above it — and
 * resolves at the 600px compact breakpoint `NavigationSuite` already uses.
 */
export type SearchBarLayout = 'adaptive' | 'docked' | 'fullScreen'

/**
 * The two scroll couplings the guidance lists for a search bar: scroll away
 * with the content and reappear on the way back up, or remain fixed at the top.
 * They are the sourced `enterAlwaysSearchBarScrollBehavior` and the null
 * behavior of a bar that only changes color on overlap.
 */
export type SearchAppBarScrollBehavior = 'none' | 'pinned' | 'enterAlways'

interface SearchBarOwnProps {
  /** Current query. Pair with `onQueryChange` for a controlled field. */
  readonly query?: string
  readonly defaultQuery?: string
  readonly onQueryChange?: (query: string) => void
  /** Whether suggestions and results are showing. */
  readonly expanded?: boolean
  readonly defaultExpanded?: boolean
  readonly onExpandedChange?: (expanded: boolean) => void
  /**
   * Invoked when the query is submitted — the source's `ImeAction.Search`,
   * which on the web is the Enter key.
   */
  readonly onSearch?: (query: string) => void
  /**
   * Hinted search text. It is also the field's accessible name, as the
   * accessibility guidance requires, unless `aria-label` overrides it.
   */
  readonly placeholder?: string
  /** Leading slot: a navigational icon button, or a decorative search icon. */
  readonly leadingIcon?: ReactNode
  /** Trailing slot. The guidance allows at most two trailing icons. */
  readonly trailingIcon?: ReactNode
  /**
   * Trailing avatar, rendered at the specification's 30dp full-corner
   * measurement. The pinned implementation has no avatar slot; see ADR 0039.
   */
  readonly avatar?: ReactNode
  readonly appearance?: SearchBarAppearance
  readonly layout?: SearchBarLayout
  readonly disabled?: boolean
  /** Suggestions and results. The container is empty until you fill it. */
  readonly children?: ReactNode
}

/**
 * Props for a Material search bar. Everything not listed here reaches the
 * native `input`, the same split `Select` uses, so form, validation, and
 * event attributes stay platform-owned.
 */
export type SearchBarProps = SearchBarOwnProps &
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    keyof SearchBarOwnProps | 'value' | 'defaultValue' | 'onChange' | 'type'
  > & {
    readonly ref?: Ref<HTMLInputElement>
  }

interface SearchAppBarOwnProps {
  /** Leading slot before the search bar, typically an `IconButton`. */
  readonly navigationIcon?: ReactNode
  /** Trailing slot after the search bar. */
  readonly actions?: ReactNode
  readonly scrollBehavior?: SearchAppBarScrollBehavior
  /**
   * Scroll container the bar couples to. Defaults to the window; pass an
   * inner scrollable element's ref when the page does not scroll at the
   * document level.
   */
  readonly scrollContainer?: RefObject<HTMLElement | null>
  /** The search bar this app bar carries. */
  readonly children?: ReactNode
}

/**
 * Props for the search app bar — the app-bar variant to use when search is the
 * primary, global function. It wraps a `SearchBar`, exactly as the source's
 * `AppBarWithSearch` composes `SearchBar` rather than a top app bar.
 */
export type SearchAppBarProps = SearchAppBarOwnProps &
  Omit<HTMLAttributes<HTMLElement>, keyof SearchAppBarOwnProps> & {
    readonly ref?: Ref<HTMLElement>
  }
