// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createElement,
  createRef,
  type ComponentType,
  type ReactNode,
} from 'react'
import { afterEach, vi } from 'vitest'
import { Chip, type ChipKind } from '../../../src/components/Chip'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function icon(name: string): ReactNode {
  return <svg data-testid={name} viewBox="0 0 18 18" />
}

describe('Chip', () => {
  it.each([
    ['assist', false],
    ['filter', true],
    ['input', true],
    ['suggestion', false],
  ] satisfies ReadonlyArray<readonly [ChipKind, boolean]>)(
    'renders %s through one native button and the sourced three-child content row',
    (kind, selectable) => {
      render(
        <Chip
          kind={kind}
          {...(selectable ? { defaultSelected: false } : {})}
          data-testid="chip"
        >
          Label
        </Chip>,
      )
      const chip = screen.getByTestId('chip')
      const container = chip.querySelector('.m3e-chip__container')

      expect(chip.tagName).toBe('BUTTON')
      expect(chip.getAttribute('type')).toBe('button')
      expect(chip.getAttribute('data-m3e-kind')).toBe(kind)
      expect(chip.getAttribute('data-m3e-variant')).toBe('flat')
      expect(chip.getAttribute('data-m3e-shape')).toBe('standard')
      expect(chip.getAttribute('data-m3e-selectable')).toBe(String(selectable))
      expect(chip.hasAttribute('aria-pressed')).toBe(selectable)
      expect(container?.children).toHaveLength(3)
      expect(container?.children[0]?.getAttribute('data-m3e-position')).toBe('leading')
      expect(container?.children[1]?.classList.contains('m3e-chip__label')).toBe(true)
      expect(container?.children[2]?.getAttribute('data-m3e-position')).toBe('trailing')
    },
  )

  it.each([
    ['assist', 'flat'],
    ['assist', 'elevated'],
    ['filter', 'flat'],
    ['filter', 'elevated'],
    ['input', 'flat'],
    ['suggestion', 'flat'],
    ['suggestion', 'elevated'],
  ] as const)('serializes the supported %s/%s treatment', (kind, variant) => {
    render(
      <Chip
        kind={kind}
        variant={variant}
        {...(kind === 'filter' || kind === 'input' ? { defaultSelected: false } : {})}
      >
        {kind}-{variant}
      </Chip>,
    )
    const chip = screen.getByRole('button')
    expect(chip.getAttribute('data-m3e-kind')).toBe(kind)
    expect(chip.getAttribute('data-m3e-variant')).toBe(variant)
  })

  it('preserves native attributes, form opt-in, consumer classes, and the button ref', async () => {
    const user = userEvent.setup()
    const ref = createRef<HTMLButtonElement>()
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    render(
      <form id="chip-form" onSubmit={onSubmit}>
        <Chip
          kind="assist"
          ref={ref}
          form="chip-form"
          name="intent"
          value="translate"
          data-owner="consumer"
          className="custom-chip"
          style={{ marginInlineStart: 4 }}
        >
          Safe default
        </Chip>
        <Chip kind="assist" type="submit" form="chip-form">
          Submit
        </Chip>
      </form>,
    )

    const safe = screen.getByRole('button', { name: 'Safe default' })
    expect(ref.current).toBe(safe)
    expect(safe.getAttribute('class')).toBe('m3e-chip custom-chip')
    expect(safe.getAttribute('data-owner')).toBe('consumer')
    expect(safe.getAttribute('name')).toBe('intent')
    expect(safe.getAttribute('value')).toBe('translate')
    expect(safe.getAttribute('style')).toContain('margin-inline-start: 4px')
    await user.click(safe)
    expect(onSubmit).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('owns uncontrolled filter selection and reports each resolved state', async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    render(
      <Chip kind="filter" defaultSelected onSelectedChange={onSelectedChange}>
        Grammar
      </Chip>,
    )
    const chip = screen.getByRole('button', { name: 'Grammar' })

    expect(chip.getAttribute('aria-pressed')).toBe('true')
    await user.click(chip)
    expect(chip.getAttribute('aria-pressed')).toBe('false')
    expect(chip.getAttribute('data-m3e-selected')).toBe('false')
    expect(onSelectedChange).toHaveBeenLastCalledWith(false)
    await user.click(chip)
    expect(chip.getAttribute('aria-pressed')).toBe('true')
    expect(onSelectedChange).toHaveBeenLastCalledWith(true)
  })

  it('reports controlled selection without mutating the prop-owned state', async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    const { rerender } = render(
      <Chip kind="input" selected={false} onSelectedChange={onSelectedChange}>
        Aiko
      </Chip>,
    )
    const chip = screen.getByRole('button', { name: 'Aiko' })

    await user.click(chip)
    expect(onSelectedChange).toHaveBeenCalledWith(true)
    expect(chip.getAttribute('aria-pressed')).toBe('false')

    rerender(
      <Chip kind="input" selected onSelectedChange={onSelectedChange}>
        Aiko
      </Chip>,
    )
    expect(chip.getAttribute('aria-pressed')).toBe('true')
  })

  it('composes click consumer-first and lets preventDefault cancel selection', async () => {
    const user = userEvent.setup()
    const onSelectedChange = vi.fn()
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault())
    render(
      <Chip
        kind="filter"
        defaultSelected={false}
        onClick={onClick}
        onSelectedChange={onSelectedChange}
      >
        Listening
      </Chip>,
    )
    const chip = screen.getByRole('button', { name: 'Listening' })

    await user.click(chip)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onSelectedChange).not.toHaveBeenCalled()
    expect(chip.getAttribute('aria-pressed')).toBe('false')
  })

  it('uses avatar before leadingIcon and preserves independent trailing content', () => {
    render(
      <Chip
        kind="input"
        avatar={<span data-testid="avatar">A</span>}
        leadingIcon={icon('leading')}
        trailingIcon={icon('trailing')}
      >
        Aiko
      </Chip>,
    )
    const chip = screen.getByRole('button', { name: 'Aiko' })
    const leading = chip.querySelector('[data-m3e-position="leading"]')
    const trailing = chip.querySelector('[data-m3e-position="trailing"]')

    expect(chip.getAttribute('data-m3e-has-avatar')).toBe('true')
    expect(leading?.getAttribute('data-m3e-slot')).toBe('avatar')
    expect(screen.getByTestId('avatar')).toBeTruthy()
    expect(screen.queryByTestId('leading')).toBeNull()
    expect(trailing?.contains(screen.getByTestId('trailing'))).toBe(true)
  })

  it('retains selectable slot content while its exit state is hidden', () => {
    const { rerender } = render(
      <Chip
        kind="filter"
        leadingIcon={icon('leading')}
        trailingIcon={icon('trailing')}
      >
        Reading
      </Chip>,
    )

    rerender(<Chip kind="filter">Reading</Chip>)
    const chip = screen.getByRole('button', { name: 'Reading' })
    const leading = chip.querySelector('[data-m3e-position="leading"]')
    const trailing = chip.querySelector('[data-m3e-position="trailing"]')

    expect(leading?.getAttribute('data-m3e-visible')).toBe('false')
    expect(trailing?.getAttribute('data-m3e-visible')).toBe('false')
    expect(leading?.querySelector('[data-testid="leading"]')).toBeTruthy()
    expect(trailing?.querySelector('[data-testid="trailing"]')).toBeTruthy()
  })

  it('tracks the source dragged elevation state through native draggable events', () => {
    const onDragStart = vi.fn()
    const onDragEnd = vi.fn()
    render(
      <Chip
        kind="suggestion"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        Move me
      </Chip>,
    )
    const chip = screen.getByRole('button', { name: 'Move me' })

    fireEvent.dragStart(chip)
    expect(onDragStart).toHaveBeenCalledTimes(1)
    expect(chip.getAttribute('data-m3e-dragged')).toBe('true')
    fireEvent.dragEnd(chip)
    expect(onDragEnd).toHaveBeenCalledTimes(1)
    expect(chip.getAttribute('data-m3e-dragged')).toBe('false')
  })

  it('uses native disabled behavior and leaves selection unchanged', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const onSelectedChange = vi.fn()
    render(
      <Chip
        kind="filter"
        disabled
        defaultSelected
        onClick={onClick}
        onSelectedChange={onSelectedChange}
      >
        Locked
      </Chip>,
    )
    const chip = screen.getByRole('button', { name: 'Locked' })

    await user.click(chip)
    expect(onClick).not.toHaveBeenCalled()
    expect(onSelectedChange).not.toHaveBeenCalled()
    expect(chip.getAttribute('aria-pressed')).toBe('true')
    expect((chip as HTMLButtonElement).disabled).toBe(true)
  })

  it('warns and safely adapts invalid runtime-only combinations', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const UntypedChip = Chip as ComponentType<Record<string, unknown>>
    render(
      createElement(
        UntypedChip,
        {
          kind: 'input',
          variant: 'elevated',
          avatar: createElement('span', null, 'A'),
          leadingIcon: createElement('span', null, 'ignored'),
        },
        'Input',
      ),
    )
    render(
      createElement(
        UntypedChip,
        {
          kind: 'suggestion',
          selected: true,
          shape: 'expressive',
          trailingIcon: createElement('span', null, 'ignored'),
        },
        'Suggestion',
      ),
    )

    expect(warning).toHaveBeenCalledWith(
      'Chip: input chips have no elevated Material variant; rendering the flat treatment.',
    )
    expect(warning).toHaveBeenCalledWith(
      'Chip: shape="expressive" is available only for filter and input chips.',
    )
    expect(warning).toHaveBeenCalledWith(
      'Chip: selected and defaultSelected require kind="filter" or kind="input".',
    )
    expect(warning).toHaveBeenCalledWith(
      'Chip: suggestion chips support only a leading icon; trailingIcon is ignored.',
    )
    expect(screen.getByRole('button', { name: 'Input' }).getAttribute('data-m3e-variant')).toBe(
      'flat',
    )
    expect(screen.getByRole('button', { name: 'Suggestion' }).hasAttribute('aria-pressed')).toBe(
      false,
    )
  })

  it('exposes a stable component name for React tooling', () => {
    expect(Chip.displayName).toBe('Chip')
  })
})
