// @vitest-environment jsdom

import { createRef, useState } from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, vi } from 'vitest'
import {
  Carousel,
  type CarouselItem,
  type MultiAspectCarouselItem,
} from '../../../src/components/Carousel'
import {
  carouselItems,
  installCarouselLayout,
  readPixels,
  stubItemBox,
  type CarouselLayoutController,
} from './carousel-native-polyfill'

let layout: CarouselLayoutController

/**
 * The pinned `MultiBrowseTest` arrangement: a 380px container, a 186px preferred
 * item, and 8px spacing. Every geometric expectation below is stated in terms of
 * that arrangement's own numbers.
 */
const PINNED_CONTAINER = 380
const PINNED_ITEM_SIZE = 186
const PINNED_ITEM_SPACING = 8
const PINNED_ITEM_STRIDE = PINNED_ITEM_SIZE + PINNED_ITEM_SPACING

beforeEach(() => {
  layout = installCarouselLayout({ mainAxisSize: PINNED_CONTAINER })
})
afterEach(cleanup)

const photos = (count: number): CarouselItem[] =>
  Array.from({ length: count }, (_, index) => ({
    key: `photo-${index}`,
    label: `Photo ${index + 1}`,
    content: <img src={`/photo-${index}.jpg`} alt="" />,
  }))

const root = (): HTMLElement => document.querySelector('.m3e-carousel') as HTMLElement

const pinned = (count = 10, extra: Record<string, unknown> = {}) => (
  <Carousel
    preferredItemWidth={PINNED_ITEM_SIZE}
    itemSpacing={PINNED_ITEM_SPACING}
    items={photos(count)}
    {...extra}
  />
)

describe('Carousel structure and semantics', () => {
  it('renders a labelled carousel group holding one slide group per item', () => {
    render(<Carousel preferredItemWidth={186} items={photos(3)} aria-label="Recent photos" />)

    const carousel = screen.getByRole('group', { name: 'Recent photos' })
    expect(carousel.getAttribute('aria-roledescription')).toBe('carousel')
    expect(carousel.className).toBe('m3e-carousel')

    const slides = carouselItems()
    expect(slides).toHaveLength(3)
    slides.forEach((slide, index) => {
      expect(slide.getAttribute('role')).toBe('group')
      expect(slide.getAttribute('aria-roledescription')).toBe('slide')
      expect(slide.getAttribute('aria-label')).toBe(`Photo ${index + 1}, ${index + 1} of 3`)
    })
  })

  it('labels an unlabelled item by position alone', () => {
    render(<Carousel preferredItemWidth={186} items={[{ key: 'a', content: 'A' }]} />)
    expect(carouselItems()[0]!.getAttribute('aria-label')).toBe('1 of 1')
  })

  it('defaults to the multi-browse layout with snap scrolling', () => {
    render(<Carousel preferredItemWidth={186} items={photos(3)} />)
    expect(root().getAttribute('data-m3e-layout')).toBe('multiBrowse')
    expect(root().getAttribute('data-m3e-scroll')).toBe('snap')
    expect(root().getAttribute('data-m3e-axis')).toBe('inline')
  })

  it.each([
    ['uncontained', 'free'],
    ['multiAspect', 'free'],
    ['hero', 'snap'],
    ['centeredHero', 'snap'],
    ['fullScreen', 'snap'],
  ] as const)('gives the %s layout its recommended scrolling (%s)', (layoutName, scroll) => {
    const items =
      layoutName === 'multiAspect'
        ? ([{ key: 'a', content: 'A', aspectRatio: 16 / 9 }] as MultiAspectCarouselItem[])
        : photos(3)
    // The prop union is exercised properly by the type suite; one cast keeps
    // this table readable.
    render(<Carousel {...({ layout: layoutName, items, itemWidth: 200 } as never)} />)
    expect(root().getAttribute('data-m3e-scroll')).toBe(scroll)
  })

  it('scrolls the block axis in the full-screen layout', () => {
    render(<Carousel layout="fullScreen" items={photos(3)} />)
    expect(root().getAttribute('data-m3e-axis')).toBe('block')
  })

  it('honours an explicit scroll mode over the layout default', () => {
    render(<Carousel layout="uncontained" itemWidth={200} items={photos(3)} scroll="snap" />)
    expect(root().getAttribute('data-m3e-scroll')).toBe('snap')
  })

  it('forwards the ref, className, and native div props to the scroll container', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Carousel
        ref={ref}
        preferredItemWidth={186}
        items={photos(2)}
        className="gallery"
        id="recent"
        data-testid="carousel"
      />,
    )
    expect(ref.current).toBe(root())
    expect(root().className).toBe('m3e-carousel gallery')
    expect(root().getAttribute('id')).toBe('recent')
    expect(root().getAttribute('data-testid')).toBe('carousel')
  })

  it('lays items out with the same spacing the engine computes with', () => {
    // `itemSpacing` feeds every arrangement and snap offset, so the flex gap
    // must be the same number; leaving the gap on the registered token would
    // desync the strategy's geometry from the DOM's by their difference.
    render(pinned(3, { itemSpacing: 24 }))
    expect(root().style.gap).toBe('24px')

    cleanup()
    render(<Carousel preferredItemWidth={186} items={photos(3)} />)
    expect(root().style.gap).toBe('')

    cleanup()
    // A consumer's own style still rides along beside the resolved gap.
    render(pinned(3, { itemSpacing: 24, style: { outline: '1px solid red' } }))
    expect(root().style.gap).toBe('24px')
    expect(root().style.outline).toBe('1px solid red')
  })
})

describe('Carousel item content', () => {
  it('renders a passive item as a plain box', () => {
    render(<Carousel preferredItemWidth={186} items={[{ key: 'a', content: 'A' }]} />)
    expect(document.querySelector('.m3e-carousel__item-content')?.tagName).toBe('DIV')
  })

  it('renders an activatable item as a real button and reports activation', async () => {
    const onActivate = vi.fn()
    render(
      <Carousel
        preferredItemWidth={186}
        items={[{ key: 'a', label: 'Sunrise', content: 'A', onActivate }]}
      />,
    )
    const button = screen.getByRole('button', { name: 'Sunrise' })
    expect(button.className).toBe('m3e-carousel__item-content')
    await userEvent.click(button)
    expect(onActivate).toHaveBeenCalledTimes(1)
  })

  it('renders a linked item as a real anchor', () => {
    render(
      <Carousel
        preferredItemWidth={186}
        items={[{ key: 'a', label: 'Harbour', content: 'A', href: '/harbour' }]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Harbour' }).getAttribute('href')).toBe('/harbour')
  })

  it('disables an activatable item natively and marks its slide', async () => {
    const onActivate = vi.fn()
    render(
      <Carousel
        preferredItemWidth={186}
        items={[{ key: 'a', label: 'Sunrise', content: 'A', onActivate, disabled: true }]}
      />,
    )
    const button = screen.getByRole('button', { name: 'Sunrise' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    expect(carouselItems()[0]!.getAttribute('data-m3e-disabled')).toBe('true')
    await userEvent.click(button)
    expect(onActivate).not.toHaveBeenCalled()
  })

  it('renders a disabled link as a disabled button rather than a live href', () => {
    render(
      <Carousel
        preferredItemWidth={186}
        items={[{ key: 'a', label: 'Harbour', content: 'A', href: '/harbour', disabled: true }]}
      />,
    )
    expect(screen.queryByRole('link')).toBeNull()
    expect((screen.getByRole('button', { name: 'Harbour' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('writes each multi-aspect item its own ratio', () => {
    render(
      <Carousel
        layout="multiAspect"
        items={[
          { key: 'a', content: 'A', aspectRatio: 16 / 9 },
          { key: 'b', content: 'B', aspectRatio: 9 / 16 },
        ]}
      />,
    )
    const [wide, tall] = carouselItems()
    expect(wide!.style.getPropertyValue('--m3e-carousel-item-aspect')).toBe(String(16 / 9))
    expect(tall!.style.getPropertyValue('--m3e-carousel-item-aspect')).toBe(String(9 / 16))
  })
})

describe('Carousel keyboard reachability', () => {
  it('takes a tab stop when no item is actionable, so arrows are reachable at all', () => {
    render(<Carousel preferredItemWidth={186} items={photos(3)} />)
    expect(root().getAttribute('tabindex')).toBe('0')
  })

  it('gives up its own tab stop when items are actionable', () => {
    render(
      <Carousel preferredItemWidth={186} items={[{ key: 'a', content: 'A', onActivate: () => {} }]} />,
    )
    expect(root().hasAttribute('tabindex')).toBe(false)
  })

  it('lets a consumer override the tab stop', () => {
    render(<Carousel preferredItemWidth={186} items={photos(2)} tabIndex={-1} />)
    expect(root().getAttribute('tabindex')).toBe('-1')
  })
})

describe('Carousel layout pass', () => {
  it('writes the sourced focal item size for the pinned multi-browse arrangement', () => {
    render(pinned())
    expect(root().style.getPropertyValue('--m3e-carousel-item-size')).toBe(`${PINNED_ITEM_SIZE}px`)
  })

  it('writes a snap offset for every item', () => {
    render(pinned())
    carouselItems().forEach((item) => {
      expect(readPixels(item, '--m3e-carousel-item-snap')).not.toBeNull()
    })
    // A start-aligned arrangement rests its focal item against the container
    // start, so the first item's snap offset is zero.
    expect(readPixels(carouselItems()[0]!, '--m3e-carousel-item-snap')).toBe(0)
  })

  it('writes nothing while the container has no size', () => {
    installCarouselLayout({ mainAxisSize: 0, contentSize: 0 })
    render(pinned(4))
    expect(root().style.getPropertyValue('--m3e-carousel-item-size')).toBe('')
    expect(readPixels(carouselItems()[0]!, '--m3e-carousel-item-inset-start')).toBeNull()
  })

  it('rebuilds the arrangement when the container resizes', () => {
    render(pinned())
    expect(root().style.getPropertyValue('--m3e-carousel-item-size')).toBe('186px')

    // A 200px container cannot hold a 186px large item beside a small one, so
    // the arrangement must shrink the large size to fit.
    act(() => layout.resize(200))
    const resized = Number.parseFloat(root().style.getPropertyValue('--m3e-carousel-item-size'))
    expect(resized).toBeLessThan(PINNED_ITEM_SIZE)
  })
})

describe('Carousel paint pass', () => {
  it('masks items progressively away from the focal position', () => {
    render(pinned())
    const items = carouselItems()
    const sizeOf = (item: HTMLElement) => readPixels(item, '--m3e-carousel-item-current-size')!

    expect(sizeOf(items[0]!)).toBeGreaterThan(sizeOf(items[1]!))
    expect(sizeOf(items[1]!)).toBeGreaterThan(sizeOf(items[2]!))
    // A keyline mask is centred in the item's own box, so both insets match.
    expect(readPixels(items[2]!, '--m3e-carousel-item-inset-start')).toBe(
      readPixels(items[2]!, '--m3e-carousel-item-inset-end'),
    )
  })

  it('buckets item sizes into the three widths the anatomy names', () => {
    render(pinned())
    const buckets = carouselItems()
      .slice(0, 4)
      .map((item) => item.dataset.m3eSize)

    // The pinned arrangement is [anchor, 186, 122, 56, anchor]: one large item,
    // one medium, one small.
    expect(buckets[0]).toBe('large')
    expect(buckets).toContain('medium')
    expect(buckets).toContain('small')
  })

  it('stacks the focal item above its neighbours', () => {
    render(pinned())
    const z = (index: number) =>
      Number(carouselItems()[index]!.style.getPropertyValue('--m3e-carousel-item-z'))
    expect(z(0)).toBeGreaterThan(z(1))
    expect(z(1)).toBeGreaterThan(z(2))
  })

  it('repaints on scroll and leaves items outside the window untouched', () => {
    render(pinned())
    // Item 9 is far beyond the viewport at rest, so it keeps its natural
    // position: masking it would place a sliver at the container edge, and
    // hiding it would take it out of the tab order.
    expect(readPixels(carouselItems()[9]!, '--m3e-carousel-item-inset-start')).toBeNull()

    act(() => layout.scrollTo(9 * PINNED_ITEM_STRIDE))
    expect(readPixels(carouselItems()[9]!, '--m3e-carousel-item-inset-start')).not.toBeNull()
    expect(readPixels(carouselItems()[0]!, '--m3e-carousel-item-inset-start')).toBeNull()
  })

  it('clears every mask when reduced motion is preferred', () => {
    render(pinned())
    expect(readPixels(carouselItems()[1]!, '--m3e-carousel-item-inset-start')).not.toBeNull()

    act(() => layout.setReducedMotion(true))
    carouselItems().forEach((item) => {
      expect(readPixels(item, '--m3e-carousel-item-inset-start')).toBeNull()
      expect(item.dataset.m3eSize).toBeUndefined()
    })
    // The arrangement itself survives: every item stays at its focal size.
    expect(root().style.getPropertyValue('--m3e-carousel-item-size')).toBe('186px')
  })

  it('parallaxes multi-aspect content without moving the item box', () => {
    const controller = installCarouselLayout({ mainAxisSize: 400, contentSize: 800 })
    render(
      <Carousel
        layout="multiAspect"
        items={[
          { key: 'a', content: 'A', aspectRatio: 16 / 9 },
          { key: 'b', content: 'B', aspectRatio: 16 / 9 },
        ]}
      />,
    )
    carouselItems().forEach((item, index) => {
      stubItemBox(item, { width: 390, height: 220, left: index * 398 })
    })
    act(() => controller.scrollTo(200))

    const first = carouselItems()[0]!
    // Scrolled past the leading edge, the first item is masked from its start
    // and its content lags behind that mask.
    expect(readPixels(first, '--m3e-carousel-item-inset-start')!).toBeGreaterThan(0)
    expect(readPixels(first, '--m3e-carousel-item-parallax')!).toBeGreaterThan(0)
    expect(readPixels(first, '--m3e-carousel-item-translate')).toBe(0)
  })
})

describe('Carousel focal item', () => {
  it('reports the focal item as the container scrolls', () => {
    const onCurrentItemChange = vi.fn()
    render(pinned(10, { onCurrentItemChange }))
    onCurrentItemChange.mockClear()

    act(() => layout.scrollTo(2 * PINNED_ITEM_STRIDE))
    expect(onCurrentItemChange).toHaveBeenLastCalledWith(2)
  })

  it('scrolls to a controlled focal item', () => {
    const Controlled = () => {
      const [current, setCurrent] = useState(0)
      return (
        <>
          <button type="button" onClick={() => setCurrent(4)}>
            Go
          </button>
          <Carousel
            preferredItemWidth={PINNED_ITEM_SIZE}
            itemSpacing={PINNED_ITEM_SPACING}
            items={photos(10)}
            currentItem={current}
            onCurrentItemChange={setCurrent}
          />
        </>
      )
    }
    render(<Controlled />)

    act(() => {
      screen.getByRole('button', { name: 'Go' }).click()
    })
    expect(layout.scrollOffset()).toBe(4 * PINNED_ITEM_STRIDE)
  })

  it('applies an initial uncontrolled focal item without animating', () => {
    render(pinned(10, { defaultCurrentItem: 3 }))
    expect(layout.scrollOffset()).toBe(3 * PINNED_ITEM_STRIDE)
  })

  it('moves by item on the logical arrow keys and to the ends on Home and End', async () => {
    const onCurrentItemChange = vi.fn()
    render(pinned(10, { onCurrentItemChange }))
    root().focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(layout.scrollOffset()).toBe(PINNED_ITEM_STRIDE)
    await userEvent.keyboard('{ArrowLeft}')
    expect(layout.scrollOffset()).toBe(0)
    await userEvent.keyboard('{End}')
    expect(onCurrentItemChange).toHaveBeenLastCalledWith(9)
    await userEvent.keyboard('{Home}')
    expect(onCurrentItemChange).toHaveBeenLastCalledWith(0)
  })

  it('leaves the block arrows alone on a horizontal carousel', async () => {
    render(pinned())
    root().focus()

    await userEvent.keyboard('{ArrowDown}')
    expect(layout.scrollOffset()).toBe(0)
  })

  it('moves on the block arrows in the full-screen layout', async () => {
    const controller = installCarouselLayout({
      mainAxisSize: 600,
      vertical: true,
      contentSize: 3000,
    })
    render(<Carousel layout="fullScreen" items={photos(5)} />)
    root().focus()

    await userEvent.keyboard('{ArrowDown}')
    expect(controller.scrollOffset()).toBeGreaterThan(0)
  })

  it('lets a consumer cancel the library key handling', async () => {
    const onCurrentItemChange = vi.fn()
    render(pinned(10, { onCurrentItemChange, onKeyDown: (event: KeyboardEvent) => event.preventDefault() }))
    root().focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(onCurrentItemChange).not.toHaveBeenCalled()
  })

  it('takes focus with it when arrowing between actionable items', async () => {
    render(
      <Carousel
        preferredItemWidth={PINNED_ITEM_SIZE}
        itemSpacing={PINNED_ITEM_SPACING}
        items={photos(4).map((item) => ({ ...item, onActivate: () => {} }))}
      />,
    )
    const buttons = screen.getAllByRole('button')
    buttons[0]!.focus()

    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(buttons[1])
  })
})
