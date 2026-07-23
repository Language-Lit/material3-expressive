// @vitest-environment jsdom

import { renderToString } from 'react-dom/server'
import { hydrateRoot } from 'react-dom/client'
import { act } from 'react'
import { vi } from 'vitest'
import { ListItem, SegmentedListItem } from '../../../src/components/ListItem'

describe('ListItem SSR', () => {
  it('renders deterministic passive, action, selected, checked, and segmented markup', () => {
    const tree = (
      <>
        <ListItem headline="Passive" />
        <ListItem interaction="action" headline="Action" />
        <ListItem
          interaction="single"
          name="lesson"
          value="grammar"
          headline="Selected"
          defaultSelected
        />
        <ListItem interaction="multiple" headline="Checked" defaultChecked />
        <SegmentedListItem index={0} count={1} headline="Only" />
      </>
    )
    expect(renderToString(tree)).toBe(renderToString(tree))
    const html = renderToString(tree)
    expect(html).toContain('data-m3e-interaction="none"')
    expect(html).toContain('type="button"')
    expect(html).toContain('type="radio"')
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('data-m3e-position="only"')
    expect(html).not.toContain('<style')
  })

  it('hydrates without mismatches or injected styles', async () => {
    const tree = (
      <SegmentedListItem
        interaction="multiple"
        index={1}
        count={3}
        headline="Hydrated"
        supportingText="Description"
        defaultChecked
      />
    )
    const container = document.createElement('div')
    container.innerHTML = renderToString(tree)
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    let root: ReturnType<typeof hydrateRoot>
    await act(async () => {
      root = hydrateRoot(container, tree)
    })
    expect(error).not.toHaveBeenCalled()
    expect(container.querySelector('style')).toBeNull()
    expect(container.querySelector('input:checked')).toBeTruthy()
    await act(async () => root.unmount())
  })
})
