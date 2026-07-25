// @vitest-environment jsdom

import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { Carousel } from '../../../src/components/Carousel'
import { Material3Provider, createTheme, defaultTheme } from '../../../src'
import { installCarouselLayout, type CarouselLayoutController } from './carousel-native-polyfill'

let layout: CarouselLayoutController

beforeEach(() => {
  layout = installCarouselLayout({ mainAxisSize: 380 })
})
afterEach(cleanup)

const registration = () =>
  defaultTheme.componentTokens.find((candidate) => candidate.component === 'carousel')

const items = Array.from({ length: 10 }, (_, index) => ({
  key: `item-${index}`,
  content: `Item ${index + 1}`,
}))

const root = (): HTMLElement => document.querySelector('.m3e-carousel') as HTMLElement

describe('Carousel theme integration', () => {
  it('registers the four sourced arrangement numbers from CarouselDefaults', () => {
    const tokens = registration()?.tokens

    expect(tokens?.['min-small-item-size'].value).toBe('40px')
    expect(tokens?.['max-small-item-size'].value).toBe('56px')
    expect(tokens?.['anchor-size'].value).toBe('10px')
    expect(tokens?.['medium-large-item-diff-threshold'].value).toBe(0.85)
  })

  it('registers the measurement tables the design specification owns', () => {
    const tokens = registration()?.tokens

    expect(tokens?.['item-shape'].value).toEqual({ $ref: 'sys.shape.corners.cornerExtraLarge' })
    expect(tokens?.['item-spacing'].value).toBe('8px')
    expect(tokens?.['leading-padding'].value).toBe('16px')
    expect(tokens?.['trailing-padding'].value).toBe('16px')
    expect(tokens?.['block-padding'].value).toBe('8px')
    // The uncontained layouts have a leading padding only, so their items can
    // bleed past the trailing edge.
    expect(tokens?.['uncontained-trailing-padding'].value).toBe('0px')
    // Full-screen carousels fill the window edge to edge with a wider gap.
    expect(tokens?.['full-screen-padding'].value).toBe('0px')
    expect(tokens?.['full-screen-item-spacing'].value).toBe('16px')
    expect(tokens?.['container-color'].value).toEqual({ $ref: 'sys.color.surface' })
  })

  it('records the pinned revision it was read at, and that no token file exists', () => {
    const source = registration()?.source

    expect(source?.revision).toBe('a90df2fc27e026b9ad2ed569f203a260c1041fab')
    expect(source?.accessed).toBe('2026-07-25')
    // The attribution points at the implementation, not a token file, because no
    // `CarouselTokens.kt` exists at any revision.
    expect(source?.url).toContain('carousel/Carousel.kt')
    expect(source?.url).not.toContain('tokens/')
  })

  it('lets a scoped theme change the arrangement, not only its paint', () => {
    // The engine reads these from the resolved custom properties, so raising the
    // small-item range is a themable change to the layout itself.
    const theme = createTheme({
      componentTokens: defaultTheme.componentTokens.map((entry) =>
        entry.component === 'carousel'
          ? {
              ...entry,
              tokens: {
                ...entry.tokens,
                'min-small-item-size': { kind: 'dimension', value: '48px' },
              },
            }
          : entry,
      ),
    })
    render(
      <Material3Provider theme={theme}>
        <Carousel preferredItemWidth={186} itemSpacing={8} items={items} />
      </Material3Provider>,
    )

    const provider = document.querySelector('.m3e-theme') as HTMLElement
    expect(provider.style.getPropertyValue('--m3e-comp-carousel-min-small-item-size')).toBe('48px')
  })

  it('takes an explicit prop over the themed small-item range', () => {
    render(
      <Carousel
        preferredItemWidth={186}
        itemSpacing={8}
        items={items}
        minSmallItemWidth={80}
        maxSmallItemWidth={96}
      />,
    )
    const withProp = root().style.getPropertyValue('--m3e-carousel-item-size')

    cleanup()
    layout = installCarouselLayout({ mainAxisSize: 380 })
    render(<Carousel preferredItemWidth={186} itemSpacing={8} items={items} />)

    // A wider small item leaves less room, so the large item cannot stay at 186.
    expect(withProp).not.toBe(root().style.getPropertyValue('--m3e-carousel-item-size'))
  })

  it('paints inside a nested theme scope without leaking variables upward', () => {
    render(
      <Material3Provider>
        <Carousel preferredItemWidth={186} itemSpacing={8} items={items} />
      </Material3Provider>,
    )

    // Every value the hook writes is namespaced to the instance, so the theme
    // scope above it is untouched.
    const provider = document.querySelector('.m3e-theme') as HTMLElement
    expect(provider.style.getPropertyValue('--m3e-carousel-item-size')).toBe('')
    expect(root().style.getPropertyValue('--m3e-carousel-item-size')).toBe('186px')
  })

  it('withdraws every written value when the carousel unmounts', () => {
    const { unmount } = render(<Carousel preferredItemWidth={186} itemSpacing={8} items={items} />)
    const container = root()
    const slide = container.querySelector('[data-m3e-carousel-item]') as HTMLElement
    expect(container.style.getPropertyValue('--m3e-carousel-item-size')).toBe('186px')

    act(() => unmount())
    expect(container.style.getPropertyValue('--m3e-carousel-item-size')).toBe('')
    expect(slide.style.getPropertyValue('--m3e-carousel-item-snap')).toBe('')
    expect(slide.style.getPropertyValue('--m3e-carousel-item-inset-start')).toBe('')
  })

  it('keeps working when the container is resized to nothing and back', () => {
    render(<Carousel preferredItemWidth={186} itemSpacing={8} items={items} />)
    act(() => layout.resize(0))
    expect(root().style.getPropertyValue('--m3e-carousel-item-size')).toBe('')

    act(() => layout.resize(380))
    expect(root().style.getPropertyValue('--m3e-carousel-item-size')).toBe('186px')
  })
})
