// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { afterEach, vi } from 'vitest'
import { ListItem, SegmentedListItem } from '../../../src/components/ListItem'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('ListItem', () => {
  it('renders the complete sourced anatomy and derives one-, two-, and three-line geometry', () => {
    const { rerender } = render(
      <ListItem
        headline="Lesson"
        leadingContent={<span data-testid="leading">L</span>}
        trailingContent={<span data-testid="trailing">12 min</span>}
      />,
    )
    let item = screen.getByText('Lesson').closest('.m3e-list-item')
    expect(item?.tagName).toBe('DIV')
    expect(item?.getAttribute('data-m3e-lines')).toBe('1')
    expect(item?.getAttribute('data-m3e-has-leading')).toBe('true')
    expect(item?.getAttribute('data-m3e-has-trailing')).toBe('true')
    expect(item?.querySelector('.m3e-list-item__content')?.children).toHaveLength(1)

    rerender(<ListItem headline="Lesson" supportingText="Review vocabulary" />)
    item = screen.getByText('Lesson').closest('.m3e-list-item')
    expect(item?.getAttribute('data-m3e-lines')).toBe('2')

    rerender(
      <ListItem
        headline="Lesson"
        overline="Unit 4"
        supportingText="Review vocabulary"
      />,
    )
    item = screen.getByText('Lesson').closest('.m3e-list-item')
    expect(item?.getAttribute('data-m3e-lines')).toBe('3')
    expect(item?.querySelector('.m3e-list-item__content')?.textContent).toBe(
      'Unit 4LessonReview vocabulary',
    )

    rerender(<ListItem headline="Lesson" supportingText={'First line\nSecond line'} />)
    expect(
      screen.getByText('Lesson').closest('.m3e-list-item')?.getAttribute('data-m3e-lines'),
    ).toBe('3')
  })

  it('preserves passive native attributes, logical styles, div/list-item roots, and refs', () => {
    const ref = createRef<HTMLDivElement>()
    const { rerender } = render(
      <ListItem
        ref={ref}
        headline="Grammar"
        className="consumer"
        data-owner="lesson"
        style={{ marginInlineStart: 4 }}
      />,
    )
    expect(ref.current?.className).toBe('m3e-list-item consumer')
    expect(ref.current?.getAttribute('data-owner')).toBe('lesson')
    expect(ref.current?.getAttribute('style')).toContain('margin-inline-start: 4px')

    rerender(<ListItem as="li" headline="Listening" />)
    expect(screen.getByText('Listening').closest('.m3e-list-item')?.tagName).toBe('LI')
  })

  it('uses a safe native button default and preserves explicit form submission', async () => {
    const user = userEvent.setup()
    const ref = createRef<HTMLButtonElement>()
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <ListItem ref={ref} interaction="action" headline="Safe action" />
        <ListItem interaction="action" type="submit" headline="Submit action" />
      </form>,
    )
    const safe = screen.getByRole('button', { name: 'Safe action' })
    expect(ref.current).toBe(safe)
    expect(safe.getAttribute('type')).toBe('button')
    await user.click(safe)
    expect(onSubmit).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Submit action' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('supports uncontrolled native radio groups and reports resolved selection', async () => {
    const user = userEvent.setup()
    const onFirst = vi.fn()
    const onSecond = vi.fn()
    render(
      <form>
        <ListItem
          interaction="single"
          name="lesson"
          value="grammar"
          headline="Grammar"
          defaultSelected
          onSelectedChange={onFirst}
        />
        <ListItem
          interaction="single"
          name="lesson"
          value="listening"
          headline="Listening"
          onSelectedChange={onSecond}
        />
      </form>,
    )
    const grammar = screen.getByRole('radio', { name: 'Grammar' })
    const listening = screen.getByRole('radio', { name: 'Listening' })
    expect((grammar as HTMLInputElement).checked).toBe(true)
    expect((listening as HTMLInputElement).checked).toBe(false)
    await user.click(listening)
    expect((grammar as HTMLInputElement).checked).toBe(false)
    expect((listening as HTMLInputElement).checked).toBe(true)
    expect(onFirst).not.toHaveBeenCalled()
    expect(onSecond).toHaveBeenLastCalledWith(true)
  })

  it('reports controlled radio selection without mutating prop-owned state', async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    const { rerender } = render(
      <ListItem
        interaction="single"
        name="lesson"
        value="grammar"
        headline="Grammar"
        selected={false}
        onSelectedChange={onSelectedChange}
      />,
    )
    const radio = screen.getByRole('radio', { name: 'Grammar' })
    await user.click(radio)
    expect(onSelectedChange).toHaveBeenCalledWith(true)
    expect((radio as HTMLInputElement).checked).toBe(false)
    rerender(
      <ListItem
        interaction="single"
        name="lesson"
        value="grammar"
        headline="Grammar"
        selected
        onSelectedChange={onSelectedChange}
      />,
    )
    expect((radio as HTMLInputElement).checked).toBe(true)
  })

  it('supports controlled and uncontrolled native checkbox state', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    const { rerender } = render(
      <ListItem
        interaction="multiple"
        name="skills"
        value="reading"
        headline="Reading"
        defaultChecked
        onCheckedChange={onCheckedChange}
      />,
    )
    const checkbox = screen.getByRole('checkbox', { name: 'Reading' })
    await user.click(checkbox)
    expect((checkbox as HTMLInputElement).checked).toBe(false)
    expect(onCheckedChange).toHaveBeenLastCalledWith(false)

    rerender(
      <ListItem
        interaction="multiple"
        name="skills"
        value="reading"
        headline="Reading"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    )
    await user.click(checkbox)
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
    expect((checkbox as HTMLInputElement).checked).toBe(false)
  })

  it('participates in FormData and restores uncontrolled defaults on native reset', async () => {
    const user = userEvent.setup()
    render(
      <form data-testid="form">
        <ListItem
          interaction="single"
          name="level"
          value="beginner"
          headline="Beginner"
          defaultSelected
        />
        <ListItem
          interaction="single"
          name="level"
          value="advanced"
          headline="Advanced"
        />
        <ListItem
          interaction="multiple"
          name="skills"
          value="reading"
          headline="Reading"
          defaultChecked
        />
        <button type="reset">Reset</button>
      </form>,
    )
    const form = screen.getByTestId('form') as HTMLFormElement
    await user.click(screen.getByRole('radio', { name: 'Advanced' }))
    await user.click(screen.getByRole('checkbox', { name: 'Reading' }))
    let data = new FormData(form)
    expect(data.get('level')).toBe('advanced')
    expect(data.getAll('skills')).toEqual([])
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    data = new FormData(form)
    expect(data.get('level')).toBe('beginner')
    expect(data.getAll('skills')).toEqual(['reading'])
  })

  it('composes native change consumer-first and honors preventDefault cancellation', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn((event: React.ChangeEvent<HTMLInputElement>) =>
      event.preventDefault(),
    )
    const onCheckedChange = vi.fn()
    render(
      <ListItem
        interaction="multiple"
        headline="Writing"
        onChange={onChange}
        onCheckedChange={onCheckedChange}
      />,
    )
    const checkbox = screen.getByRole('checkbox', { name: 'Writing' })
    await user.click(checkbox)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect((checkbox as HTMLInputElement).checked).toBe(false)
  })

  it('keeps native disabled behavior for every interactive mode', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const onCheckedChange = vi.fn()
    render(
      <>
        <ListItem interaction="action" disabled headline="Action" onClick={onClick} />
        <ListItem
          interaction="multiple"
          disabled
          headline="Choice"
          onCheckedChange={onCheckedChange}
        />
        <ListItem disabled headline="Passive" />
      </>,
    )
    await user.click(screen.getByRole('button', { name: 'Action' }))
    await user.click(screen.getByRole('checkbox', { name: 'Choice' }))
    expect(onClick).not.toHaveBeenCalled()
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('checkbox') as HTMLInputElement).disabled).toBe(true)
    expect(
      screen
        .getByText('Passive')
        .closest('.m3e-list-item')
        ?.getAttribute('aria-disabled'),
    ).toBe('true')
  })

  it('exposes the sourced dragged state only through uncancelled native drag events', () => {
    const onDragStart = vi.fn()
    const onDragEnd = vi.fn()
    render(
      <ListItem
        interaction="action"
        draggable
        headline="Move lesson"
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />,
    )
    const item = screen.getByRole('button')
    fireEvent.dragStart(item)
    expect(onDragStart).toHaveBeenCalledTimes(1)
    expect(item.getAttribute('data-m3e-dragged')).toBe('true')
    fireEvent.dragEnd(item)
    expect(onDragEnd).toHaveBeenCalledTimes(1)
    expect(item.getAttribute('data-m3e-dragged')).toBe('false')
  })
})

describe('SegmentedListItem', () => {
  it.each([
    [0, 1, 'only'],
    [0, 3, 'first'],
    [1, 3, 'middle'],
    [2, 3, 'last'],
  ] as const)('derives index %i of %i as %s', (index, count, position) => {
    render(
      <SegmentedListItem
        interaction="action"
        index={index}
        count={count}
        headline={`${position} item`}
      />,
    )
    const item = screen.getByRole('button')
    expect(item.getAttribute('data-m3e-segmented')).toBe('true')
    expect(item.getAttribute('data-m3e-position')).toBe(position)
  })

  it('shares passive, action, radio, and checkbox semantics with ListItem', () => {
    render(
      <>
        <SegmentedListItem index={0} count={4} headline="Passive" />
        <SegmentedListItem interaction="action" index={1} count={4} headline="Action" />
        <SegmentedListItem
          interaction="single"
          index={2}
          count={4}
          name="segment"
          value="radio"
          headline="Radio"
        />
        <SegmentedListItem
          interaction="multiple"
          index={3}
          count={4}
          headline="Checkbox"
        />
      </>,
    )
    expect(screen.getByText('Passive').closest('.m3e-list-item')?.tagName).toBe('DIV')
    expect(screen.getByRole('button', { name: 'Action' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Radio' })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Checkbox' })).toBeTruthy()
  })

  it('warns and renders a safe only-item fallback for invalid runtime positions', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    render(
      <SegmentedListItem
        interaction="action"
        index={4}
        count={0}
        headline="Invalid"
      />,
    )
    const item = screen.getByRole('button')
    expect(item.getAttribute('data-m3e-position')).toBe('only')
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining('count must be a positive integer'),
    )
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining('index must be an integer'),
    )
  })

  it('warns about empty headlines and unsafe nested interactive slot content', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    render(
      <ListItem
        interaction="action"
        headline=" "
        trailingContent={<a href="/nested">Nested</a>}
      />,
    )
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining('provide non-empty headline'),
    )
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining('must not contain nested links'),
    )
  })
})
