import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type KeyboardEventHandler,
  type ReactElement,
} from 'react'
import { useControllableState } from '../../internal/useControllableState'
import { BadgeAnchor } from '../Badge'
import type { TabItem, TabsProps } from './Tabs.types'

interface TabsComponent {
  (props: TabsProps): ReactElement | null
  displayName?: string
}

interface IndicatorRect {
  readonly left: number
  readonly width: number
}

function enabledIndicesOf(items: readonly TabItem[]): number[] {
  const indices: number[] = []
  items.forEach((item, index) => {
    if (!item.disabled) indices.push(index)
  })
  return indices
}

function TabsRender(
  {
    items,
    variant = 'primary',
    value,
    defaultValue,
    onValueChange,
    scrollable = false,
    className,
    style,
    id: idProp,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...divProps
  }: TabsProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const generatedId = useId()
  const baseId = idProp ?? generatedId

  const [resolvedValue, setValue] = useControllableState({
    value,
    defaultValue: defaultValue ?? items[0]?.value ?? '',
    onChange: onValueChange,
  })

  const selectedIndex = items.findIndex((item) => item.value === resolvedValue)
  const enabledIndices = useMemo(() => enabledIndicesOf(items), [items])
  const useLargeHeight = items.some((item) => item.icon != null && item.label != null)

  const listRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<(HTMLElement | null)[]>([])
  const contentRefs = useRef<(HTMLElement | null)[]>([])
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null)

  const measure = useCallback(() => {
    const list = listRef.current
    if (!list || selectedIndex === -1) return
    const target =
      variant === 'primary' ? contentRefs.current[selectedIndex] : tabRefs.current[selectedIndex]
    if (!target) return
    const listRect = list.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    // The indicator is absolutely positioned inside the scrollable list, so
    // it lives in the scrolled content's coordinate space, not the visible
    // box's — rect subtraction alone lands it scrollLeft px toward the
    // start once the row is scrolled. Adding the raw scrollLeft (negative
    // in RTL, matching the physical left: 0 anchor) converts to content
    // space, which is scroll-invariant, so no scroll listener is needed.
    setIndicator({
      left: targetRect.left - listRect.left + list.scrollLeft,
      width: targetRect.width,
    })
  }, [selectedIndex, variant])

  // A plain effect, not useLayoutEffect: Tabs renders its full DOM tree
  // during SSR (unlike Menu/Snackbar's client-only portal), so
  // useLayoutEffect would warn during server rendering for a one-frame
  // positioning delay nobody would perceive here.
  useEffect(() => {
    measure()
  }, [measure])

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const observer = new ResizeObserver(() => measure())
    observer.observe(list)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  // The pinned source's ScrollableTabRow keeps the selected tab centered
  // through its own scroll state (ScrollableTabData.calculateTabOffset),
  // never by moving anything outside the row. scrollBy on the list is the
  // web translation: the browser clamps the result to the scrollable range
  // in both LTR and RTL, and no scrollable ancestor moves — scrollIntoView
  // walked every one of them, so selecting a tab could scroll the page.
  const centeredOnceRef = useRef(false)
  useEffect(() => {
    if (!scrollable || selectedIndex === -1) return
    const list = listRef.current
    const tab = tabRefs.current[selectedIndex]
    if (!list || !tab) return
    const listRect = list.getBoundingClientRect()
    const tabRect = tab.getBoundingClientRect()
    const delta = tabRect.left + tabRect.width / 2 - (listRect.left + listRect.width / 2)
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // The source animates this scroll (animateScrollTo, DefaultSpatial);
    // the first centering runs on mount over a page that just appeared, so
    // only selection changes after that animate.
    list.scrollBy({
      left: delta,
      behavior: centeredOnceRef.current && !reduceMotion ? 'smooth' : 'auto',
    })
    centeredOnceRef.current = true
  }, [scrollable, selectedIndex])

  const selectAt = (index: number) => {
    const item = items[index]
    if (!item || item.disabled) return
    setValue(item.value)
    tabRefs.current[index]?.focus()
  }

  const moveFocus = (step: 1 | -1) => {
    if (enabledIndices.length === 0) return
    const position = enabledIndices.indexOf(selectedIndex)
    const nextPosition =
      position === -1 ? 0 : (position + step + enabledIndices.length) % enabledIndices.length
    selectAt(enabledIndices[nextPosition])
  }

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        moveFocus(1)
        return
      case 'ArrowLeft':
        event.preventDefault()
        moveFocus(-1)
        return
      case 'Home':
        event.preventDefault()
        if (enabledIndices.length > 0) selectAt(enabledIndices[0])
        return
      case 'End':
        event.preventDefault()
        if (enabledIndices.length > 0) selectAt(enabledIndices[enabledIndices.length - 1])
        return
      default:
        return
    }
  }

  const selectedItem = selectedIndex >= 0 ? items[selectedIndex] : undefined
  const hasAnyPanel = items.some((item) => item.panel != null)

  return (
    <div
      {...divProps}
      ref={forwardedRef}
      id={idProp}
      className={className ? `m3e-tabs ${className}` : 'm3e-tabs'}
      style={style as CSSProperties}
    >
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className="m3e-tabs__list"
        data-m3e-variant={variant}
        data-m3e-scrollable={scrollable}
        data-m3e-large={useLargeHeight}
        onKeyDown={handleKeyDown}
      >
        {items.map((item, index) => {
          const selected = index === selectedIndex
          const tabId = `${baseId}-tab-${index}`
          const panelId = item.panel != null ? `${baseId}-panel-${index}` : undefined
          const iconNode =
            item.icon != null ? (
              <span className="m3e-tabs__tab-icon" aria-hidden="true">
                {item.icon}
              </span>
            ) : null
          const labelNode =
            item.label != null ? (
              <span className="m3e-tabs__tab-label">{item.label}</span>
            ) : null
          // Material anchors a badge inside the icon's bounding box. A
          // label-only tab has no such box, so the label takes the anchor
          // instead of the badge losing its position entirely.
          const badgedIcon =
            iconNode != null && item.badge != null ? (
              <BadgeAnchor badge={item.badge}>{iconNode}</BadgeAnchor>
            ) : (
              iconNode
            )
          const badgedLabel =
            iconNode == null && labelNode != null && item.badge != null ? (
              <BadgeAnchor badge={item.badge}>{labelNode}</BadgeAnchor>
            ) : (
              labelNode
            )
          const content = (
            <span
              className="m3e-tabs__tab-content"
              ref={(node) => {
                contentRefs.current[index] = node
              }}
            >
              {badgedIcon}
              {badgedLabel}
            </span>
          )
          const sharedProps = {
            id: tabId,
            role: 'tab' as const,
            'aria-selected': selected,
            'aria-disabled': item.disabled || undefined,
            'aria-controls': panelId,
            tabIndex: selected ? 0 : -1,
            className: 'm3e-tabs__tab',
            'data-m3e-selected': selected,
          }
          return item.href != null ? (
            <a
              key={item.value}
              {...sharedProps}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              href={item.disabled ? undefined : item.href}
              onClick={() => {
                if (item.disabled) return
                setValue(item.value)
              }}
            >
              {content}
            </a>
          ) : (
            <button
              key={item.value}
              {...sharedProps}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return
                setValue(item.value)
              }}
            >
              {content}
            </button>
          )
        })}
        <span
          className="m3e-tabs__indicator"
          aria-hidden="true"
          data-m3e-ready={indicator !== null}
          style={
            indicator
              ? { transform: `translateX(${indicator.left}px)`, inlineSize: `${indicator.width}px` }
              : undefined
          }
        />
      </div>
      {hasAnyPanel && selectedItem?.panel != null && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${selectedIndex}`}
          aria-labelledby={`${baseId}-tab-${selectedIndex}`}
          tabIndex={0}
          className="m3e-tabs__panel"
        >
          {selectedItem.panel}
        </div>
      )}
    </div>
  )
}

const ForwardedTabs = forwardRef<HTMLDivElement, TabsProps>(TabsRender)
ForwardedTabs.displayName = 'Tabs'

export const Tabs = ForwardedTabs as TabsComponent
