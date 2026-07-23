// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, vi } from 'vitest'
import { ListItem, SegmentedListItem } from '../../../src/components/ListItem'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('ListItem accessibility', () => {
  it('uses native roles, accessible names, and checked states without redundant ARIA', () => {
    render(
      <>
        <ListItem interaction="action" headline="Open lesson" />
        <ListItem
          interaction="single"
          name="lesson"
          value="grammar"
          headline="Grammar"
          supportingText="12 exercises"
          defaultSelected
        />
        <ListItem interaction="multiple" headline="Download" defaultChecked />
      </>,
    )
    expect(
      screen.getByRole('button', { name: 'Open lesson' }).hasAttribute('role'),
    ).toBe(false)
    const radio = screen.getByRole('radio', { name: /Grammar.*12 exercises/ })
    expect((radio as HTMLInputElement).checked).toBe(true)
    expect(radio.hasAttribute('aria-checked')).toBe(false)
    expect(
      (screen.getByRole('checkbox', { name: 'Download' }) as HTMLInputElement)
        .checked,
    ).toBe(true)
  })

  it('activates buttons and selection inputs with native keyboard behavior', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const onSelectedChange = vi.fn()
    const onCheckedChange = vi.fn()
    render(
      <>
        <ListItem interaction="action" headline="Open" onClick={onClick} />
        <ListItem
          interaction="single"
          name="choice"
          value="one"
          headline="One"
          onSelectedChange={onSelectedChange}
        />
        <ListItem
          interaction="multiple"
          headline="Many"
          onCheckedChange={onCheckedChange}
        />
      </>,
    )
    const button = screen.getByRole('button')
    button.focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(2)

    const radio = screen.getByRole('radio')
    radio.focus()
    await user.keyboard(' ')
    expect(onSelectedChange).toHaveBeenCalledWith(true)

    const checkbox = screen.getByRole('checkbox')
    checkbox.focus()
    await user.keyboard(' ')
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('removes disabled native controls from sequential focus and leaves passive content unfocusable', async () => {
    const user = userEvent.setup()
    render(
      <>
        <ListItem interaction="action" disabled headline="Disabled action" />
        <ListItem interaction="multiple" disabled headline="Disabled choice" />
        <ListItem headline="Passive" />
        <ListItem interaction="action" headline="Enabled action" />
      </>,
    )
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Enabled action' }),
    )
    expect(
      screen.getByText('Passive').closest('.m3e-list-item')?.hasAttribute('tabindex'),
    ).toBe(false)
  })

  it('keeps logical DOM order and semantics in RTL segmented content', () => {
    render(
      <div dir="rtl">
        <SegmentedListItem
          interaction="action"
          index={0}
          count={2}
          headline="Grammar"
          leadingContent={<span>Start</span>}
          trailingContent={<span>End</span>}
        />
      </div>,
    )
    const item = screen.getByRole('button')
    expect([...item.children].map((child) => child.className)).toEqual([
      'm3e-list-item__leading',
      'm3e-list-item__content',
      'm3e-list-item__trailing',
    ])
    expect(item.textContent).toBe('StartGrammarEnd')
  })
})
