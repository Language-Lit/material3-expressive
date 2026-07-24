// @vitest-environment jsdom

import { createRef } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import { Divider } from '../../../src/components/Divider'

afterEach(cleanup)

describe('Divider', () => {
  it('renders a native hr in the horizontal orientation by default', () => {
    render(<Divider data-testid="divider" />)
    const divider = screen.getByTestId('divider')

    expect(divider.tagName).toBe('HR')
    expect(divider.getAttribute('data-m3e-orientation')).toBe('horizontal')
    expect(divider.className).toBe('m3e-divider')
  })

  it('marks the vertical orientation on the element', () => {
    render(<Divider data-testid="divider" orientation="vertical" />)
    expect(screen.getByTestId('divider').getAttribute('data-m3e-orientation')).toBe('vertical')
  })

  it('renders li so a divider can sit between list items, which hr cannot', () => {
    render(
      <ul>
        <li>First</li>
        <Divider as="li" data-testid="divider" />
        <li>Second</li>
      </ul>,
    )
    const divider = screen.getByTestId('divider')

    expect(divider.tagName).toBe('LI')
    expect(divider.parentElement?.tagName).toBe('UL')
  })

  it('renders div for layouts that accept neither hr nor li', () => {
    render(<Divider as="div" data-testid="divider" />)
    expect(screen.getByTestId('divider').tagName).toBe('DIV')
  })

  it('merges a consumer class after its own rather than replacing it', () => {
    render(<Divider className="custom" data-testid="divider" />)
    expect(screen.getByTestId('divider').className).toBe('m3e-divider custom')
  })

  it('forwards a ref to the rendered element', () => {
    const ref = createRef<HTMLHRElement>()
    render(<Divider ref={ref} data-testid="divider" />)
    expect(ref.current).toBe(screen.getByTestId('divider'))
  })

  it('forwards a ref through a non-default element', () => {
    const ref = createRef<HTMLLIElement>()
    render(
      <ul>
        <Divider as="li" ref={ref} data-testid="divider" />
      </ul>,
    )
    expect(ref.current).toBe(screen.getByTestId('divider'))
  })

  it('passes native attributes through to the element', () => {
    render(<Divider data-testid="divider" id="section-rule" lang="en" />)
    const divider = screen.getByTestId('divider')

    expect(divider.id).toBe('section-rule')
    expect(divider.getAttribute('lang')).toBe('en')
  })

  it('renders nothing inside itself in any orientation or element', () => {
    render(
      <div>
        <Divider data-testid="hr" />
        <Divider as="div" data-testid="div" orientation="vertical" />
      </div>,
    )

    expect(screen.getByTestId('hr').childNodes).toHaveLength(0)
    expect(screen.getByTestId('div').childNodes).toHaveLength(0)
  })
})
