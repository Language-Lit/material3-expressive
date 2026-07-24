import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type ForwardedRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { composeRefs } from '../../internal/composeRefs'
import {
  useAnchoredOverlay,
  type AnchoredOverlayPositionArgs,
} from '../../internal/useAnchoredOverlay'
import { useControllableState } from '../../internal/useControllableState'
import { usePortalThemeScope } from '../../theme/contexts'
import type { SearchBarLayout, SearchBarProps } from './SearchBar.types'

interface SearchBarComponent {
  (props: SearchBarProps): ReactElement | null
  displayName?: string
}

/**
 * Material's compact window class starts below 600dp — the same breakpoint
 * `NavigationSuite` resolves its tiers at. The guidance is explicit that search
 * results "should swap from full-screen in compact windows to docked in larger
 * window sizes", so `layout="adaptive"` is that rule rather than a preference.
 */
const COMPACT_BREAKPOINT_PX = 600

/** Margin the docked panel keeps from the viewport edge, as `Menu` and `Select` do. */
const VIEWPORT_MARGIN = 8

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function warn(message: string): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn(`SearchBar: ${message}`)
  }
}

function warnForInvalidProps({
  query,
  defaultQuery,
  onQueryChange,
  expanded,
  defaultExpanded,
  onExpandedChange,
}: {
  readonly query: string | undefined
  readonly defaultQuery: string | undefined
  readonly onQueryChange: ((query: string) => void) | undefined
  readonly expanded: boolean | undefined
  readonly defaultExpanded: boolean | undefined
  readonly onExpandedChange: ((expanded: boolean) => void) | undefined
}): void {
  if (query !== undefined && defaultQuery !== undefined) {
    warn('use either query or defaultQuery, not both.')
  }
  if (query !== undefined && onQueryChange === undefined) {
    warn('a controlled query requires onQueryChange.')
  }
  if (expanded !== undefined && defaultExpanded !== undefined) {
    warn('use either expanded or defaultExpanded, not both.')
  }
  if (expanded !== undefined && onExpandedChange === undefined) {
    warn('a controlled expanded state requires onExpandedChange.')
  }
}

/**
 * Resolves `adaptive` against the live window. Compact-first before the client
 * measures, matching `NavigationSuite`: a collapsed search bar renders
 * identically either way, and the expanded surface only exists after an
 * interaction, so the initial guess is never what the server painted.
 */
function useResolvedLayout(layout: SearchBarLayout): 'docked' | 'fullScreen' {
  const [isCompact, setIsCompact] = useState(true)

  useEffect(() => {
    if (layout !== 'adaptive') return undefined
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }
    // The same `min-width` query `NavigationSuite` registers for its medium
    // tier, so a page using both shares one MediaQueryList.
    const query = window.matchMedia(`(min-width: ${COMPACT_BREAKPOINT_PX}px)`)
    const update = () => setIsCompact(!query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [layout])

  if (layout !== 'adaptive') return layout
  return isCompact ? 'fullScreen' : 'docked'
}

/**
 * The docked surface sits *over* the collapsed bar rather than below it, so its
 * own copy of the input lands exactly where the collapsed one was — the
 * placement the source gives its popup (`state.collapsedBounds.topLeft`). Only
 * the viewport clamp is this library's, shared with `Menu` and `Select`.
 */
function computeDockedPosition({ anchor, overlay, viewport }: AnchoredOverlayPositionArgs) {
  const maxTop = Math.max(VIEWPORT_MARGIN, viewport.height - overlay.height - VIEWPORT_MARGIN)
  const maxLeft = Math.max(VIEWPORT_MARGIN, viewport.width - overlay.width - VIEWPORT_MARGIN)
  return {
    top: Math.min(Math.max(anchor.top, VIEWPORT_MARGIN), maxTop),
    left: Math.min(Math.max(anchor.left, VIEWPORT_MARGIN), maxLeft),
    width: anchor.width,
  }
}

function SearchBarRender(
  {
    query,
    // Deliberately not defaulted here: `warnForInvalidProps` has to tell "no
    // defaultQuery given" from "defaultQuery given", or every controlled bar
    // would be warned for passing both — the trap T45 and T46 both documented.
    defaultQuery,
    onQueryChange,
    expanded,
    defaultExpanded,
    onExpandedChange,
    onSearch,
    placeholder,
    leadingIcon,
    trailingIcon,
    avatar,
    appearance = 'contained',
    layout = 'adaptive',
    disabled = false,
    children,
    className,
    style,
    id: idProp,
    name,
    'aria-label': ariaLabel,
    onKeyDown: onKeyDownProp,
    onClick: onClickProp,
    ...inputProps
  }: SearchBarProps,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  const generatedId = useId()
  const fieldId = idProp ?? generatedId
  const resultsId = `${fieldId}-results`

  warnForInvalidProps({
    query,
    defaultQuery,
    onQueryChange,
    expanded,
    defaultExpanded,
    onExpandedChange,
  })

  const [resolvedQuery, setQuery] = useControllableState({
    value: query,
    defaultValue: defaultQuery ?? '',
    onChange: onQueryChange,
  })
  const [resolvedExpanded, setExpanded] = useControllableState({
    value: expanded,
    defaultValue: defaultExpanded ?? false,
    onChange: onExpandedChange,
  })
  const setExpandedRef = useRef(setExpanded)
  setExpandedRef.current = setExpanded

  const resolvedLayout = useResolvedLayout(layout)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const collapsedBarRef = useRef<HTMLDivElement | null>(null)
  const collapsedInputRef = useRef<HTMLInputElement | null>(null)
  const expandedInputRef = useRef<HTMLInputElement | null>(null)
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const resultsRef = useRef<HTMLDivElement | null>(null)

  const isFullScreen = resolvedLayout === 'fullScreen'
  const isDocked = !isFullScreen
  const isContained = appearance === 'contained'
  const dockedOpen = resolvedExpanded && isDocked
  const fullScreenOpen = resolvedExpanded && isFullScreen

  const { mounted, entered, popoverRef, style: overlayStyle, handleTransitionEnd } =
    useAnchoredOverlay({
      open: dockedOpen,
      anchorRef: collapsedBarRef,
      onRequestClose: () => setExpandedRef.current(false),
      computePosition: computeDockedPosition,
    })

  const themeScope = usePortalThemeScope()

  // Native `<dialog>`'s modality — top layer, focus trap, inert background,
  // focus restoration — exists only once `showModal()` runs, so SSR paints
  // closed and every open and close happens here (ADR 0016).
  useEffect(() => {
    const dialogEl = dialogRef.current
    if (!dialogEl) return
    if (fullScreenOpen && !dialogEl.open) dialogEl.showModal()
    else if (!fullScreenOpen && dialogEl.open) dialogEl.close()
  }, [fullScreenOpen])

  /*
   * The native `close` event is the single path back to the controlled value,
   * firing for Escape and for the dismissal handlers' own `close()` alike —
   * except when the effect above closed the dialog because the window crossed
   * the adaptive breakpoint. That close is a change of surface, not a
   * dismissal, and the docked panel is already taking over.
   */
  const isFullScreenRef = useRef(isFullScreen)
  isFullScreenRef.current = isFullScreen
  useEffect(() => {
    const dialogEl = dialogRef.current
    if (!dialogEl) return undefined
    const handleNativeClose = () => {
      if (!isFullScreenRef.current) return
      setExpandedRef.current(false)
    }
    dialogEl.addEventListener('close', handleNativeClose)
    return () => dialogEl.removeEventListener('close', handleNativeClose)
  }, [])

  /*
   * Both expanded surfaces carry their own copy of the input, as all four of
   * the source's expanded composables do — a docked panel is drawn over the
   * collapsed bar, and a full-screen one replaces it entirely. The in-page bar
   * is therefore made inert while a surface is open, so exactly one combobox is
   * ever focusable or exposed to assistive technology. `inert` is set on the
   * element rather than rendered as a prop because React 18 and 19 serialize
   * the attribute differently, and this library supports both.
   */
  useEffect(() => {
    const bar = collapsedBarRef.current
    if (!bar) return undefined
    bar.inert = resolvedExpanded
    return () => {
      bar.inert = false
    }
  }, [resolvedExpanded])

  // Expansion moves the caret, not just the focus: the query survives because
  // it is hoisted, and the selection survives because it is copied across.
  useEffect(() => {
    if (!resolvedExpanded) return
    const input = expandedInputRef.current
    if (!input) return
    const source = collapsedInputRef.current
    const start = source?.selectionStart ?? null
    const end = source?.selectionEnd ?? null
    input.focus()
    if (start !== null && end !== null) {
      input.setSelectionRange(start, end)
    }
  }, [resolvedExpanded, mounted])

  /*
   * Returning focus is conditional on where it currently is. A dismissal the
   * user drove from inside the surface — Escape, or activating a result — must
   * put focus back on the bar; an outside click already moved focus somewhere
   * deliberate and must not be overridden, the same rule `useAnchoredOverlay`
   * follows. The full-screen surface needs none of this: `<dialog>` restores
   * focus to the element that was focused when `showModal()` ran.
   */
  useEffect(() => {
    if (resolvedExpanded) return
    const active = typeof document === 'undefined' ? null : document.activeElement
    if (!active) return
    const insideSurface = [dialogRef.current, panelRef.current].some(
      (surface) => surface != null && surface.contains(active),
    )
    if (insideSurface) collapsedInputRef.current?.focus()
  }, [resolvedExpanded])

  const expand = () => {
    if (disabled || resolvedExpanded) return
    setExpanded(true)
  }

  const collapse = () => {
    if (!resolvedExpanded) return
    setExpanded(false)
  }

  const focusFirstResult = () => {
    const first = resultsRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
    first?.focus()
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value
    // "Expand search bar if the user starts typing" — the source watches for a
    // growing query, so deleting text never expands a collapsed bar.
    const grew = next.length > resolvedQuery.length
    setQuery(next)
    if (grew) expand()
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    onKeyDownProp?.(event)
    if (event.defaultPrevented || disabled) return

    if (event.key === 'Enter') {
      // The source merges `ImeAction.Search` into the field's keyboard options;
      // Enter is the web's own submit affordance for a search field.
      event.preventDefault()
      onSearch?.(resolvedQuery)
      return
    }
    if (event.key === 'Escape' && resolvedExpanded) {
      event.preventDefault()
      collapse()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      // Collapsed, the down key expands; expanded, it moves into the results —
      // the source's `expandOnDownKey` and its `moveFocus(FocusDirection.Down)`.
      if (!resolvedExpanded) expand()
      else focusFirstResult()
    }
  }

  const renderBar = (placement: 'collapsed' | 'expanded'): ReactNode => {
    const isCollapsedCopy = placement === 'collapsed'
    return (
      <div
        ref={isCollapsedCopy ? collapsedBarRef : undefined}
        className="m3e-search-bar__bar"
        data-m3e-placement={placement}
      >
        {leadingIcon != null && (
          <div className="m3e-search-bar__leading">{leadingIcon}</div>
        )}
        <input
          {...inputProps}
          ref={
            isCollapsedCopy
              ? composeRefs(forwardedRef, collapsedInputRef)
              : expandedInputRef
          }
          id={isCollapsedCopy ? fieldId : `${fieldId}-expanded`}
          name={isCollapsedCopy ? name : undefined}
          type="search"
          className="m3e-search-bar__input"
          value={resolvedQuery}
          placeholder={placeholder}
          disabled={disabled}
          role="combobox"
          aria-label={ariaLabel ?? placeholder}
          aria-expanded={resolvedExpanded}
          aria-controls={resolvedExpanded ? resultsId : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onClick={(event) => {
            onClickProp?.(event)
            if (event.defaultPrevented) return
            expand()
          }}
        />
        {avatar != null && <div className="m3e-search-bar__avatar">{avatar}</div>}
        {trailingIcon != null && (
          <div className="m3e-search-bar__trailing">{trailingIcon}</div>
        )}
      </div>
    )
  }

  const results = (
    <div ref={resultsRef} id={resultsId} className="m3e-search-bar__results">
      {children}
    </div>
  )

  // The divided treatment is the one that carries a divider; the contained
  // treatment separates the bar from the results with its own filled container.
  const divider = isContained ? null : (
    <div className="m3e-search-bar__divider" aria-hidden="true" />
  )

  const mergedClassName = className ? `m3e-search-bar ${className}` : 'm3e-search-bar'

  return (
    <div
      ref={rootRef}
      className={mergedClassName}
      style={style as CSSProperties}
      data-m3e-appearance={appearance}
      data-m3e-layout={layout}
      data-m3e-expanded={resolvedExpanded || undefined}
    >
      {renderBar('collapsed')}
      <dialog
        ref={dialogRef}
        className="m3e-search-bar__full-screen"
        aria-label={ariaLabel ?? placeholder}
      >
        {fullScreenOpen && (
          <>
            {renderBar('expanded')}
            {divider}
            {results}
          </>
        )}
      </dialog>
      {mounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className={[themeScope?.className, 'm3e-search-bar__portal']
              .filter(Boolean)
              .join(' ')}
            data-m3e-color-mode={themeScope?.colorMode}
            data-m3e-appearance={appearance}
            style={themeScope?.style}
          >
            {isContained && (
              <div className="m3e-search-bar__scrim" data-m3e-open={entered} />
            )}
            <div
              ref={composeRefs(popoverRef, panelRef)}
              className="m3e-search-bar__panel"
              data-m3e-open={entered}
              style={overlayStyle}
              onTransitionEnd={handleTransitionEnd}
            >
              {renderBar('expanded')}
              {divider}
              {results}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

const ForwardedSearchBar = forwardRef<HTMLInputElement, SearchBarProps>(SearchBarRender)
ForwardedSearchBar.displayName = 'SearchBar'

export const SearchBar = ForwardedSearchBar as SearchBarComponent
