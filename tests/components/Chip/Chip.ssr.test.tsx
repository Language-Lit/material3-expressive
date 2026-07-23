// @vitest-environment jsdom

import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { Chip } from '../../../src'

describe('Chip server rendering', () => {
  it('renders deterministic markup for every purpose and supported treatment', () => {
    const render = () =>
      renderToString(
        <>
          <Chip kind="assist" variant="elevated">Assist</Chip>
          <Chip kind="filter" shape="expressive" defaultSelected>Filter</Chip>
          <Chip kind="filter" variant="elevated">Elevated filter</Chip>
          <Chip kind="input" avatar={<span>A</span>}>Input</Chip>
          <Chip kind="suggestion" variant="elevated">Suggestion</Chip>
        </>,
      )
    const html = render()

    expect(render()).toBe(html)
    expect(html.match(/<button/g)).toHaveLength(5)
    expect(html).toContain('data-m3e-kind="assist"')
    expect(html).toContain('data-m3e-kind="filter"')
    expect(html).toContain('data-m3e-kind="input"')
    expect(html).toContain('data-m3e-kind="suggestion"')
    expect(html).toContain('data-m3e-shape="expressive"')
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain('data-m3e-slot="avatar"')
  })

  it('hydrates without changing markup or injecting runtime styles', async () => {
    const tree = (
      <div>
        <Chip kind="assist" leadingIcon={<svg viewBox="0 0 18 18" />}>
          Assist
        </Chip>
        <Chip kind="filter" defaultSelected trailingIcon={<span>x</span>}>
          Filter
        </Chip>
        <Chip kind="input" shape="expressive">Input</Chip>
      </div>
    )
    const serverHtml = renderToString(tree)
    const container = document.createElement('div')
    container.innerHTML = serverHtml
    document.body.append(container)
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
