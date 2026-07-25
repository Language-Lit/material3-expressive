// @vitest-environment jsdom

import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, vi } from 'vitest'
import { Carousel, type CarouselItem } from '../../../src/components/Carousel'
import {
  carouselItems,
  installCarouselLayout,
  type CarouselLayoutController,
} from './carousel-native-polyfill'

let layout: CarouselLayoutController

beforeEach(() => {
  layout = installCarouselLayout({ mainAxisSize: 380 })
})
afterEach(cleanup)

const items = (count: number): CarouselItem[] =>
  Array.from({ length: count }, (_, index) => ({
    key: `item-${index}`,
    label: `Item ${index + 1}`,
    content: <img src={`/item-${index}.jpg`} alt="" />,
  }))

const root = (): HTMLElement => document.querySelector('.m3e-carousel') as HTMLElement

describe('Carousel accessibility', () => {
  it('adopts the carousel pattern rather than inventing a role', () => {
    render(<Carousel preferredItemWidth={186} items={items(3)} aria-label="Featured" />)

    // There is no ARIA `carousel` role, so the source's `Role.Carousel` and the
    // specification's "container role" both resolve to a labelled group carrying
    // the carousel role description.
    const carousel = root()
    expect(carousel.getAttribute('role')).toBe('group')
    expect(carousel.getAttribute('aria-roledescription')).toBe('carousel')
    expect(carousel.getAttribute('aria-label')).toBe('Featured')
  })

  it('announces each item with its own name, its position, and the total', () => {
    render(<Carousel preferredItemWidth={186} items={items(4)} />)

    expect(carouselItems().map((slide) => slide.getAttribute('aria-label'))).toEqual([
      'Item 1, 1 of 4',
      'Item 2, 2 of 4',
      'Item 3, 3 of 4',
      'Item 4, 4 of 4',
    ])
  })

  it('renumbers every item when the collection changes', () => {
    const { rerender } = render(<Carousel preferredItemWidth={186} items={items(2)} />)
    expect(carouselItems()[0]!.getAttribute('aria-label')).toBe('Item 1, 1 of 2')

    rerender(<Carousel preferredItemWidth={186} items={items(5)} />)
    expect(carouselItems()[0]!.getAttribute('aria-label')).toBe('Item 1, 1 of 5')
  })

  it('accepts an external label reference on the container', () => {
    render(
      <>
        <h2 id="gallery-heading">Gallery</h2>
        <Carousel preferredItemWidth={186} items={items(2)} aria-labelledby="gallery-heading" />
      </>,
    )
    expect(screen.getByRole('group', { name: 'Gallery' })).toBe(root())
  })

  it('gives every actionable item a name and native activation', async () => {
    const onActivate = vi.fn()
    render(
      <Carousel
        preferredItemWidth={186}
        items={items(3).map((item) => ({ ...item, onActivate }))}
      />,
    )

    // The keyboard table's "Space or Enter activates the focused carousel item"
    // is the browser's own button behavior, not a synthesized key handler.
    const buttons = screen.getAllByRole('button')
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
      'Item 1',
      'Item 2',
      'Item 3',
    ])
    buttons[0]!.focus()
    await userEvent.keyboard(' ')
    await userEvent.keyboard('{Enter}')
    expect(onActivate).toHaveBeenCalledTimes(2)
  })

  it('keeps every item reachable by Tab rather than hiding the off-screen ones', () => {
    render(
      <Carousel
        preferredItemWidth={186}
        itemSpacing={8}
        items={items(10).map((item) => ({ ...item, onActivate: () => {} }))}
      />,
    )

    // Off-screen items keep their natural position and stay focusable, so the
    // specification's "Tab moves to the next carousel item" holds for the whole
    // collection and the browser scrolls each one into view on focus.
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(10)
    buttons.forEach((button) => {
      expect(button.hasAttribute('disabled')).toBe(false)
      expect(button.closest('[data-m3e-carousel-item]')!.getAttribute('aria-hidden')).toBeNull()
    })
  })

  it('exposes no tab stop of its own once items are actionable', () => {
    render(
      <Carousel
        preferredItemWidth={186}
        items={items(3).map((item) => ({ ...item, onActivate: () => {} }))}
      />,
    )
    // "Avoid focusing on the carousel container" — with focusable items there is
    // nothing the container needs a tab stop for.
    expect(root().hasAttribute('tabindex')).toBe(false)
  })

  it('remains keyboard operable when no item is actionable', async () => {
    const onCurrentItemChange = vi.fn()
    render(
      <Carousel
        preferredItemWidth={186}
        itemSpacing={8}
        items={items(6)}
        onCurrentItemChange={onCurrentItemChange}
      />,
    )
    // A scroll container with no focusable content cannot be reached at this
    // browser baseline, so the container itself takes the tab stop.
    expect(root().getAttribute('tabindex')).toBe('0')

    root().focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onCurrentItemChange).toHaveBeenLastCalledWith(1)
  })

  it('drops the parallax and the size changes under reduced motion', () => {
    render(<Carousel preferredItemWidth={186} itemSpacing={8} items={items(8)} />)
    act(() => layout.setReducedMotion(true))

    // "All items are the same size" — every mask, translation, and size bucket is
    // withdrawn, leaving items at their focal size.
    carouselItems().forEach((slide) => {
      expect(slide.style.getPropertyValue('--m3e-carousel-item-inset-start')).toBe('')
      expect(slide.style.getPropertyValue('--m3e-carousel-item-parallax')).toBe('')
      expect(slide.dataset.m3eSize).toBeUndefined()
    })
  })

  it('reports a disabled item as unavailable rather than merely dimmed', () => {
    render(
      <Carousel
        preferredItemWidth={186}
        items={[{ key: 'a', label: 'Archived', content: 'A', onActivate: () => {}, disabled: true }]}
      />,
    )
    const button = screen.getByRole('button', { name: 'Archived' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })
})
