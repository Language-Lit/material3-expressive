// @vitest-environment jsdom

import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { RangeSlider, Slider } from '../../../src'

describe('Slider server rendering', () => {
  it('renders deterministic markup for orientation, steps, centered, and range state', () => {
    const render = () =>
      renderToString(
        <>
          <Slider aria-label="Horizontal" defaultValue={0.25} />
          <Slider
            aria-label="Vertical"
            orientation="vertical"
            topToBottom={false}
            defaultValue={0.75}
          />
          <Slider aria-label="Centered" centered steps={3} defaultValue={0.5} />
          <RangeSlider
            startAriaLabel="Start"
            endAriaLabel="End"
            defaultValue={[0.2, 0.8]}
            steps={4}
          />
        </>,
      )

    expect(render()).toBe(render())
    expect(render()).toContain('type="range"')
    expect(render()).toContain('role="slider"')
    expect(render()).toContain('data-m3e-orientation="vertical"')
    expect(render()).toContain('data-m3e-centered="true"')
    expect(render()).toContain('data-m3e-stepped="true"')
    expect(render()).toContain('role="group"')
  })

  it('hydrates without changing markup or injecting styles', async () => {
    const tree = (
      <div>
        <Slider aria-label="Volume" defaultValue={0.4} steps={4} />
        <RangeSlider
          startAriaLabel="Minimum"
          endAriaLabel="Maximum"
          defaultValue={[0.2, 0.8]}
        />
      </div>
    )
    const container = document.createElement('div')
    container.innerHTML = renderToString(tree)
    document.body.append(container)
    const serverHtml = container.innerHTML
    const recoverableErrors: unknown[] = []
    const root = hydrateRoot(container, tree, {
      onRecoverableError: (error) => recoverableErrors.push(error),
    })

    await act(async () => {})
    expect(container.innerHTML).toBe(serverHtml)
    expect(recoverableErrors).toEqual([])
    expect(document.querySelector('style')).toBeNull()

    await act(async () => root.unmount())
    container.remove()
  })
})
