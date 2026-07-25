// @vitest-environment jsdom

import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { beforeEach } from 'vitest'
import { Carousel, type CarouselItem } from '../../../src/components/Carousel'
import { carouselItems, installCarouselLayout } from './carousel-native-polyfill'

beforeEach(() => {
  installCarouselLayout({ mainAxisSize: 380 })
})

const items: CarouselItem[] = [
  { key: 'a', label: 'Sunrise', content: 'A' },
  { key: 'b', label: 'Harbour', content: 'B', onActivate: () => {} },
  { key: 'c', label: 'Bridge', content: 'C', href: '/bridge' },
]

describe('Carousel server rendering', () => {
  it('renders deterministic markup with no injected style tags', () => {
    const render = () =>
      renderToString(<Carousel preferredItemWidth={186} items={items} aria-label="Photos" />)
    const first = render()

    expect(first).toBe(render())
    expect(first).toContain('class="m3e-carousel"')
    expect(first).toContain('aria-roledescription="carousel"')
    expect(first).toContain('aria-roledescription="slide"')
    expect(first).not.toContain('<style')
  })

  it('renders the resting arrangement, leaving every measured value to the client', () => {
    const html = renderToString(<Carousel preferredItemWidth={186} items={items} />)

    // Nothing the layout or paint pass writes may appear in server markup: the
    // server has no container to measure, and emitting a guess would make the
    // first client frame a correction.
    expect(html).not.toContain('--m3e-carousel-item-size')
    expect(html).not.toContain('--m3e-carousel-item-inset-start')
    expect(html).not.toContain('--m3e-carousel-item-snap')
    expect(html).not.toContain('data-m3e-size')
  })

  it('renders every layout without touching a browser global', () => {
    for (const layout of ['multiBrowse', 'uncontained', 'multiAspect', 'hero', 'centeredHero', 'fullScreen'] as const) {
      const props =
        layout === 'multiAspect'
          ? { layout, items: items.map((item) => ({ ...item, aspectRatio: 16 / 9 })) }
          : { layout, items, preferredItemWidth: 186, itemWidth: 200 }
      const html = renderToString(<Carousel {...(props as never)} />)
      expect(html, layout).toContain(`data-m3e-layout="${layout}"`)
    }
  })

  it('hydrates the server markup without a mismatch and then measures', () => {
    const container = document.createElement('div')
    container.innerHTML = renderToString(
      <Carousel preferredItemWidth={186} itemSpacing={8} items={items} aria-label="Photos" />,
    )
    document.body.append(container)
    const warn = console.error
    const messages: unknown[] = []
    console.error = (...args: unknown[]) => messages.push(args)

    act(() => {
      hydrateRoot(
        container,
        <Carousel preferredItemWidth={186} itemSpacing={8} items={items} aria-label="Photos" />,
      )
    })
    console.error = warn

    expect(messages).toHaveLength(0)
    const root = container.querySelector('.m3e-carousel') as HTMLElement
    // The client's first pass is what introduces the arrangement.
    expect(root.style.getPropertyValue('--m3e-carousel-item-size')).toBe('186px')
    expect(carouselItems()).toHaveLength(3)

    container.remove()
  })

  it('renders an activatable item as a button and a linked one as an anchor on the server', () => {
    const html = renderToString(<Carousel preferredItemWidth={186} items={items} />)

    expect(html).toContain('<button')
    expect(html).toContain('href="/bridge"')
    expect(html).toContain('aria-label="Sunrise, 1 of 3"')
  })
})
