'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ForwardedRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { composeEventHandlers } from '../../internal/composeEventHandlers'
import { composeRefs } from '../../internal/composeRefs'
import { useControllableState } from '../../internal/useControllableState'
import type {
  CarouselItem,
  CarouselLayout,
  CarouselProps,
  MultiAspectCarouselItem,
} from './Carousel.types'
import { useCarouselMask } from './useCarouselMask'

interface CarouselComponent {
  (props: CarouselProps): ReactElement | null
  displayName?: string
}

type AnyCarouselItem = CarouselItem | MultiAspectCarouselItem

/**
 * The specification recommends snap scrolling for multi-browse, both hero
 * layouts, and full-screen — where it is required — and standard scrolling for
 * the uncontained layouts, whose items are meant to stop anywhere.
 */
function defaultScrollFor(layout: CarouselLayout): 'snap' | 'free' {
  return layout === 'uncontained' || layout === 'multiAspect' ? 'free' : 'snap'
}

/**
 * Composes the label the accessibility page asks for: the item's own name
 * together with its position and the total. This is the web's form of "the label
 * reads out the total amount of items and the current item in focus".
 */
function slideLabelOf(item: AnyCarouselItem, index: number, count: number): string {
  const position = `${index + 1} of ${count}`
  return item.label === undefined ? position : `${item.label}, ${position}`
}

function CarouselRender(
  {
    items,
    layout = 'multiBrowse',
    itemSpacing,
    scroll,
    currentItem: currentItemProp,
    defaultCurrentItem,
    onCurrentItemChange,
    preferredItemWidth,
    itemWidth,
    maxItemWidth,
    minSmallItemWidth,
    maxSmallItemWidth,
    className,
    style,
    onKeyDown,
    tabIndex,
    ...divProps
  }: CarouselProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const actionRefs = useRef<(HTMLElement | null)[]>([])
  const mountedRef = useRef(false)
  const appliedIndexRef = useRef(0)

  const resolvedScroll = scroll ?? defaultScrollFor(layout)
  const vertical = layout === 'fullScreen'
  const itemCount = items.length

  const [currentItem, setCurrentItem] = useControllableState<number>({
    value: currentItemProp,
    defaultValue: defaultCurrentItem ?? 0,
    onChange: onCurrentItemChange,
  })

  const handleFocalItemChange = useCallback(
    (index: number) => {
      appliedIndexRef.current = index
      setCurrentItem(index)
    },
    [setCurrentItem],
  )

  const { scrollToItem } = useCarouselMask({
    containerRef,
    layout,
    itemCount,
    itemSpacing,
    preferredItemWidth,
    itemWidth,
    maxItemWidth,
    minSmallItemWidth,
    maxSmallItemWidth,
    onFocalItemChange: handleFocalItemChange,
  })

  // A change that did not come from scrolling is a request to move: apply it
  // instantly on the first pass, because an animated scroll on mount would be
  // motion the consumer never asked for.
  useEffect(() => {
    if (appliedIndexRef.current === currentItem) return
    const animate = mountedRef.current
    appliedIndexRef.current = currentItem
    scrollToItem(currentItem, animate)
  }, [currentItem, scrollToItem])

  useEffect(() => {
    mountedRef.current = true
  }, [])

  const moveBy = useCallback(
    (delta: number) => {
      const next = Math.min(Math.max(currentItem + delta, 0), Math.max(itemCount - 1, 0))
      if (next === currentItem) return
      appliedIndexRef.current = next
      setCurrentItem(next)
      scrollToItem(next, true)
      // Arrow movement between items must take focus with it when the item is
      // something you can act on, or the next Enter would activate the item the
      // carousel has just scrolled away from.
      actionRefs.current[next]?.focus({ preventScroll: true })
    },
    [currentItem, itemCount, scrollToItem, setCurrentItem],
  )

  const moveTo = useCallback(
    (index: number) => {
      const next = Math.min(Math.max(index, 0), Math.max(itemCount - 1, 0))
      appliedIndexRef.current = next
      setCurrentItem(next)
      scrollToItem(next, true)
      actionRefs.current[next]?.focus({ preventScroll: true })
    },
    [itemCount, scrollToItem, setCurrentItem],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      // The keyboard table gives arrows item movement and Space/Enter
      // activation; activation belongs to the item's own native control, so only
      // movement is handled here.
      const forward = vertical ? 'ArrowDown' : 'ArrowRight'
      const backward = vertical ? 'ArrowUp' : 'ArrowLeft'
      const rtl =
        !vertical && containerRef.current !== null
          ? getComputedStyle(containerRef.current).direction === 'rtl'
          : false

      switch (event.key) {
        case forward:
          event.preventDefault()
          moveBy(rtl ? -1 : 1)
          return
        case backward:
          event.preventDefault()
          moveBy(rtl ? 1 : -1)
          return
        case 'Home':
          event.preventDefault()
          moveTo(0)
          return
        case 'End':
          event.preventDefault()
          moveTo(itemCount - 1)
          return
        default:
        // Up and down on a horizontal carousel are deliberately left alone. The
        // specification's "use up and down to leave the carousel" is a screen
        // reader idiom; on the web leaving is Tab, and swallowing those keys
        // would break page scrolling.
      }
    },
    [itemCount, moveBy, moveTo, vertical],
  )

  const hasActionableItem = useMemo(
    () => items.some((item) => item.onActivate !== undefined || item.href !== undefined),
    [items],
  )

  // A scroll container is only reachable by keyboard when something in it is
  // focusable. When no item is actionable the container takes the tab stop
  // itself, so arrow movement is available at all; when items are actionable it
  // does not, which is what the accessibility page's "avoid focusing on the
  // carousel container" asks for.
  const resolvedTabIndex = tabIndex ?? (hasActionableItem ? undefined : 0)

  // The engine reads `itemSpacing` for every arrangement and snap offset, so
  // the same number must reach the flex gap the items are actually laid out
  // with — otherwise the strategy's geometry and the DOM's disagree by the
  // difference between the prop and the registered token.
  const resolvedStyle =
    itemSpacing === undefined ? style : { ...style, gap: `${itemSpacing}px` }

  return (
    <div
      {...divProps}
      ref={composeRefs(forwardedRef, containerRef)}
      className={className ? `m3e-carousel ${className}` : 'm3e-carousel'}
      style={resolvedStyle}
      data-m3e-layout={layout}
      data-m3e-scroll={resolvedScroll}
      data-m3e-axis={vertical ? 'block' : 'inline'}
      role="group"
      aria-roledescription="carousel"
      tabIndex={resolvedTabIndex}
      onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
    >
      {items.map((item, index) => {
        const itemStyle =
          item.aspectRatio === undefined
            ? undefined
            : ({ '--m3e-carousel-item-aspect': String(item.aspectRatio) } as CSSProperties)
        return (
          <div
            key={item.key}
            className="m3e-carousel__item"
            data-m3e-carousel-item=""
            data-m3e-disabled={item.disabled ? 'true' : undefined}
            role="group"
            aria-roledescription="slide"
            aria-label={slideLabelOf(item, index, itemCount)}
            style={itemStyle}
          >
            <ItemContent
              item={item}
              index={index}
              onRef={(node) => {
                actionRefs.current[index] = node
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

interface ItemContentProps {
  readonly item: AnyCarouselItem
  readonly index: number
  readonly onRef: (node: HTMLElement | null) => void
}

/**
 * The item's inner box. It is the element the parallax translates, and it is a
 * real `a` or `button` when the item is something you can act on, so activation,
 * focus, and scroll-into-view are the browser's.
 */
function ItemContent({ item, onRef }: ItemContentProps): ReactNode {
  const shared = {
    className: 'm3e-carousel__item-content',
    'aria-label': item.label,
  } as const

  if (item.href !== undefined && !item.disabled) {
    return (
      <a
        {...shared}
        ref={onRef as ForwardedRef<HTMLAnchorElement>}
        href={item.href}
        onClick={item.onActivate}
      >
        <Media>{item.content}</Media>
      </a>
    )
  }

  if (item.onActivate !== undefined || item.href !== undefined) {
    return (
      <button
        {...shared}
        ref={onRef as ForwardedRef<HTMLButtonElement>}
        type="button"
        disabled={item.disabled}
        onClick={item.onActivate}
      >
        <Media>{item.content}</Media>
      </button>
    )
  }

  return (
    <div className="m3e-carousel__item-content">
      <Media>{item.content}</Media>
    </div>
  )
}

/**
 * The box the multi-aspect parallax translates. It exists so the content can lag
 * behind its own mask; without a box of its own the content would carry the clip
 * with it and there would be no parallax to see.
 */
function Media({ children }: { readonly children: ReactNode }): ReactNode {
  return <div className="m3e-carousel__item-media">{children}</div>
}

const ForwardedCarousel = forwardRef<HTMLDivElement, CarouselProps>(CarouselRender)
ForwardedCarousel.displayName = 'Carousel'

export const Carousel = ForwardedCarousel as CarouselComponent
