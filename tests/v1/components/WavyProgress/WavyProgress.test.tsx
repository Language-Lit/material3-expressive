// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach } from 'vitest'
import { WavyProgress } from '../../../../src/v1/components/WavyProgress'

afterEach(cleanup)

describe('WavyProgress', () => {
  it('defaults to shape="linear"', () => {
    render(<WavyProgress aria-label="Upload" value={0.4} />)
    expect(screen.getByRole('progressbar').getAttribute('data-m3e-shape')).toBe('linear')
  })

  it('renders role="progressbar" with min/max/now when determinate, for both shapes', () => {
    const { rerender } = render(<WavyProgress aria-label="Upload" value={0.4} />)
    let bar = screen.getByRole('progressbar', { name: 'Upload' })
    expect(bar.getAttribute('aria-valuemin')).toBe('0')
    expect(bar.getAttribute('aria-valuemax')).toBe('1')
    expect(bar.getAttribute('aria-valuenow')).toBe('0.4')

    rerender(<WavyProgress aria-label="Upload" shape="circular" value={0.4} />)
    bar = screen.getByRole('progressbar', { name: 'Upload' })
    expect(bar.getAttribute('data-m3e-shape')).toBe('circular')
    expect(bar.getAttribute('aria-valuenow')).toBe('0.4')
  })

  it('omits aria-valuenow when indeterminate, for both shapes', () => {
    const { rerender } = render(<WavyProgress aria-label="Syncing" />)
    expect(screen.getByRole('progressbar').hasAttribute('aria-valuenow')).toBe(false)

    rerender(<WavyProgress aria-label="Syncing" shape="circular" />)
    expect(screen.getByRole('progressbar').hasAttribute('aria-valuenow')).toBe(false)
  })

  it('clamps value into [0, max]', () => {
    const { rerender } = render(<WavyProgress aria-label="Upload" value={-1} />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0')

    rerender(<WavyProgress aria-label="Upload" value={5} />)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('1')
  })

  it('linear shape: sizes the wave-clip by the progress fraction', () => {
    render(<WavyProgress aria-label="Upload" value={0.3} />)
    const clip = document.querySelector('.m3e-wavy-progress__wave-clip') as HTMLElement
    expect(clip.style.inlineSize).toBe('30%')
  })

  it('linear shape: renders a stop dot only when determinate', () => {
    const { rerender } = render(<WavyProgress aria-label="Upload" value={0.5} />)
    expect(document.querySelector('.m3e-wavy-progress__stop')).not.toBeNull()

    rerender(<WavyProgress aria-label="Syncing" />)
    expect(document.querySelector('.m3e-wavy-progress__stop')).toBeNull()
  })

  it('linear shape: renders two indeterminate wave bars when indeterminate', () => {
    render(<WavyProgress aria-label="Syncing" />)
    expect(document.querySelector('.m3e-wavy-progress__indeterminate-bar1')).not.toBeNull()
    expect(document.querySelector('.m3e-wavy-progress__indeterminate-bar2')).not.toBeNull()
  })

  it('circular shape: renders a fixed 48x48 svg', () => {
    render(<WavyProgress aria-label="Progress" shape="circular" value={0.5} />)
    const svg = document.querySelector('.m3e-wavy-progress__circular-svg')
    expect(svg?.getAttribute('width')).toBe('48')
    expect(svg?.getAttribute('height')).toBe('48')
  })

  it('circular shape: sizes the sweep by the progress fraction via stroke-dasharray', () => {
    render(<WavyProgress aria-label="Progress" shape="circular" value={0.25} />)
    const sweep = document.querySelector('.m3e-wavy-progress__sweep') as SVGElement
    expect((sweep.style as CSSStyleDeclaration).strokeDasharray).toBe('25 75')
  })

  it('circular shape: renders no track element at all when indeterminate', () => {
    const { rerender } = render(<WavyProgress aria-label="Progress" shape="circular" value={0.5} />)
    expect(document.querySelector('.m3e-wavy-progress__track')).not.toBeNull()

    rerender(<WavyProgress aria-label="Syncing" shape="circular" />)
    expect(document.querySelector('.m3e-wavy-progress__track')).toBeNull()
  })

  it('ramps amplitude toward zero near the start and end of determinate progress', () => {
    const { rerender } = render(<WavyProgress aria-label="Upload" value={0.02} />)
    let amplitude = document.querySelector('.m3e-wavy-progress__wave-amplitude') as HTMLElement
    expect(amplitude.style.transform).toBe('scaleY(0)')

    rerender(<WavyProgress aria-label="Upload" value={0.5} />)
    amplitude = document.querySelector('.m3e-wavy-progress__wave-amplitude') as HTMLElement
    expect(amplitude.style.transform).toBe('scaleY(1)')

    rerender(<WavyProgress aria-label="Upload" value={0.99} />)
    amplitude = document.querySelector('.m3e-wavy-progress__wave-amplitude') as HTMLElement
    expect(amplitude.style.transform).toBe('scaleY(0)')
  })

  it('forwards ref, className, and style to the root', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <WavyProgress
        ref={ref}
        aria-label="Upload"
        value={0.5}
        className="consumer-class"
        data-owner="consumer"
      />,
    )
    expect(ref.current?.getAttribute('role')).toBe('progressbar')
    expect(ref.current?.className).toContain('m3e-wavy-progress')
    expect(ref.current?.className).toContain('consumer-class')
    expect(ref.current?.getAttribute('data-owner')).toBe('consumer')
  })

  it('exposes a stable component name for React tooling', () => {
    expect(WavyProgress.displayName).toBe('WavyProgress')
  })
})
