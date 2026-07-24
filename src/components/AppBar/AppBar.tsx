import {
  forwardRef,
  useRef,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react'
import { composeRefs } from '../../internal/composeRefs'
import {
  useAppBarScroll,
  type AppBarScrollBehaviorKind,
} from '../../internal/useAppBarScroll'
import type {
  AppBarProps,
  AppBarScrollBehavior,
  AppBarSize,
  AppBarTitleAlignment,
} from './AppBar.types'

interface AppBarImplementationProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  readonly title: ReactNode
  readonly subtitle?: ReactNode
  readonly size?: AppBarSize
  readonly flexible?: boolean
  readonly titleAlignment?: AppBarTitleAlignment
  readonly navigationIcon?: ReactNode
  readonly actions?: ReactNode
  readonly scrollBehavior?: AppBarScrollBehavior
  readonly scrollContainer?: RefObject<HTMLElement | null>
}

interface AppBarComponent {
  (props: AppBarProps): ReactElement | null
  displayName?: string
}

function warn(message: string): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn(`AppBar: ${message}`)
  }
}

/**
 * Sourced collapse ranges: the tier's expanded container height minus the
 * shared 64px collapsed row, with the taller flexible container selected when
 * a subtitle is present. Used only where the rendered range cannot be
 * measured; a themed height override is picked up by the measurement.
 */
function sourcedCollapseRange(
  size: AppBarSize,
  flexible: boolean,
  hasSubtitle: boolean,
): number {
  if (size === 'medium') {
    if (!flexible) return 112 - 64
    return (hasSubtitle ? 136 : 112) - 64
  }
  if (size === 'large') {
    if (!flexible) return 152 - 64
    return (hasSubtitle ? 152 : 120) - 64
  }
  return 0
}

function warnForInvalidProps({
  size,
  flexible,
  subtitle,
  titleAlignment,
  scrollBehavior,
}: {
  readonly size: AppBarSize
  readonly flexible: boolean
  readonly subtitle: ReactNode
  readonly titleAlignment: AppBarTitleAlignment | undefined
  readonly scrollBehavior: AppBarScrollBehavior
}): void {
  if (size === 'small' && flexible) {
    warn('the source has no small flexible bar; flexible applies to medium and large.')
  }
  if (size !== 'small' && !flexible && subtitle != null) {
    warn('a subtitle needs the flexible variant; the baseline medium and large bars have none.')
  }
  if (size !== 'small' && !flexible && titleAlignment !== undefined) {
    warn('titleAlignment needs the flexible variant on medium and large bars.')
  }
  if (size === 'small' && scrollBehavior === 'exitUntilCollapsed') {
    warn('a small bar has no second row to collapse; use pinned or enterAlways.')
  }
}

function AppBarRender(
  {
    title,
    subtitle,
    size = 'small',
    flexible = false,
    // Deliberately not defaulted here: `warnForInvalidProps` must be able to
    // tell "no alignment given" from "alignment given", or every baseline
    // medium/large bar would be warned for a prop it never passed — the same
    // trap T45 documented for `defaultValue`.
    titleAlignment,
    navigationIcon,
    actions,
    scrollBehavior = 'none',
    scrollContainer,
    className,
    ...headerProps
  }: AppBarImplementationProps,
  forwardedRef: ForwardedRef<HTMLElement>,
) {
  const barRef = useRef<HTMLElement | null>(null)
  const expandedRowRef = useRef<HTMLDivElement | null>(null)
  const collapsedTitleRef = useRef<HTMLDivElement | null>(null)
  const expandedTitleRef = useRef<HTMLDivElement | null>(null)

  warnForInvalidProps({ size, flexible, subtitle, titleAlignment, scrollBehavior })

  const isTwoRow = size !== 'small'
  const hasSubtitle = subtitle != null

  useAppBarScroll({
    behavior: scrollBehavior as AppBarScrollBehaviorKind,
    barRef,
    expandedRowRef,
    collapsedTitleRef,
    expandedTitleRef,
    scrollContainer,
    fallbackCollapseRange: sourcedCollapseRange(size, flexible, hasSubtitle),
  })

  const mergedClassName = className ? `m3e-app-bar ${className}` : 'm3e-app-bar'
  const resolvedTitleAlignment = titleAlignment ?? 'start'

  return (
    <header
      {...headerProps}
      ref={composeRefs(forwardedRef, barRef)}
      className={mergedClassName}
      data-m3e-size={size}
      data-m3e-flexible={flexible || undefined}
      data-m3e-subtitle={hasSubtitle || undefined}
      data-m3e-title-alignment={resolvedTitleAlignment}
      data-m3e-scroll-behavior={scrollBehavior}
    >
      <div className="m3e-app-bar__row">
        {navigationIcon != null && (
          <div className="m3e-app-bar__navigation">{navigationIcon}</div>
        )}
        {/*
         * A two-row bar renders the title twice, as the source does: a
         * small-typography copy in the collapsed row that fades in with the
         * sourced easing, and the expanded copy below. Only one is exposed
         * to assistive technology at a time; the scroll primitive swaps
         * aria-hidden at collapse fraction 0.5, matching the source's
         * semantics threshold.
         */}
        <div
          ref={collapsedTitleRef}
          className="m3e-app-bar__title-group"
          aria-hidden={isTwoRow || undefined}
        >
          <div className="m3e-app-bar__title">{title}</div>
          {hasSubtitle && <div className="m3e-app-bar__subtitle">{subtitle}</div>}
        </div>
        {actions != null && <div className="m3e-app-bar__actions">{actions}</div>}
      </div>
      {isTwoRow && (
        <div ref={expandedRowRef} className="m3e-app-bar__expanded-row">
          <div ref={expandedTitleRef} className="m3e-app-bar__title-group">
            <div className="m3e-app-bar__title">{title}</div>
            {hasSubtitle && <div className="m3e-app-bar__subtitle">{subtitle}</div>}
          </div>
        </div>
      )}
    </header>
  )
}

const ForwardedAppBar = forwardRef<HTMLElement, AppBarImplementationProps>(AppBarRender)
ForwardedAppBar.displayName = 'AppBar'

export const AppBar = ForwardedAppBar as AppBarComponent
