import {
  forwardRef,
  useRef,
  type ForwardedRef,
  type ReactElement,
} from 'react'
import { composeRefs } from '../../internal/composeRefs'
import {
  useAppBarScroll,
  type AppBarScrollBehaviorKind,
} from '../../internal/useAppBarScroll'
import type { SearchAppBarProps } from './SearchBar.types'

interface SearchAppBarComponent {
  (props: SearchAppBarProps): ReactElement | null
  displayName?: string
}

/**
 * The search app bar: the app-bar variant the guidelines prescribe when search
 * is "the primary, global function". It wraps a `SearchBar` in app-bar chrome
 * rather than extending `AppBar`, because the source does the same — its
 * `AppBarWithSearch` composes `SearchBar` inside its own surface and never
 * touches a top app bar, borrowing only `AppBarTokens` for its colors.
 *
 * Scroll coupling is `AppBar`'s primitive under a private variable namespace.
 * The source ships one behavior here (`enterAlwaysSearchBarScrollBehavior`)
 * plus the null behavior that only recolors on overlap, which are exactly the
 * two the guidance lists: "scroll away with content, then reappear when a
 * person begins scrolling up" and "remain fixed at the top of the screen".
 */
function SearchAppBarRender(
  {
    navigationIcon,
    actions,
    scrollBehavior = 'none',
    scrollContainer,
    children,
    className,
    ...headerProps
  }: SearchAppBarProps,
  forwardedRef: ForwardedRef<HTMLElement>,
) {
  const barRef = useRef<HTMLElement | null>(null)
  // The two-row outputs have no meaning for a search app bar, which is always
  // one row; the primitive reads these as absent and never writes a fraction.
  const unusedRowRef = useRef<HTMLElement | null>(null)

  useAppBarScroll({
    behavior: scrollBehavior as AppBarScrollBehaviorKind,
    barRef,
    expandedRowRef: unusedRowRef,
    collapsedTitleRef: unusedRowRef,
    expandedTitleRef: unusedRowRef,
    scrollContainer,
    fallbackCollapseRange: 0,
    variablePrefix: 'search-app-bar',
  })

  const mergedClassName = className
    ? `m3e-search-app-bar ${className}`
    : 'm3e-search-app-bar'

  return (
    <header
      {...headerProps}
      ref={composeRefs(forwardedRef, barRef)}
      className={mergedClassName}
      data-m3e-scroll-behavior={scrollBehavior}
    >
      {navigationIcon != null && (
        <div className="m3e-search-app-bar__navigation">{navigationIcon}</div>
      )}
      <div className="m3e-search-app-bar__search">{children}</div>
      {actions != null && (
        <div className="m3e-search-app-bar__actions">{actions}</div>
      )}
    </header>
  )
}

const ForwardedSearchAppBar = forwardRef<HTMLElement, SearchAppBarProps>(
  SearchAppBarRender,
)
ForwardedSearchAppBar.displayName = 'SearchAppBar'

export const SearchAppBar = ForwardedSearchAppBar as SearchAppBarComponent
