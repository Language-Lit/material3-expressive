// @vitest-environment jsdom

import { createElement, createRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { cleanup, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Radio } from './Radio'
import { Switch } from './Switch'

afterEach(() => {
  cleanup()
})

describe('selection control sizing', () => {
  it('keeps the switch track fixed while exposing a 48dp touch target', () => {
    const markup = renderToStaticMarkup(
      createElement(Switch, {
        checked: false,
        onChange: () => undefined,
        'aria-label': 'Notifications',
      })
    )

    expect(markup).toContain('shrink-0')
    expect(markup).toContain('w-[52px]')
    expect(markup).toContain('h-32dp')
    expect(markup).toContain('h-48dp')
    expect(markup).toContain('h-40dp w-40dp')
  })

  it('keeps the radio state layer fixed around a 48dp native target', () => {
    const markup = renderToStaticMarkup(
      createElement(Radio, {
        checked: false,
        name: 'size',
        onChange: () => undefined,
        'aria-label': 'Small',
      })
    )

    expect(markup).toContain('shrink-0')
    expect(markup).toContain('h-40dp w-40dp')
    expect(markup).toContain('h-48dp w-48dp')
    expect(markup).toContain('h-20dp w-20dp')
  })
})

describe('Switch', () => {
  it('renders a named native checkbox with switch semantics and form props', () => {
    const inputRef = createRef<HTMLInputElement>()
    const { getByRole } = render(createElement(Switch, {
      ref: inputRef,
      defaultChecked: true,
      name: 'notifications',
      value: 'enabled',
      required: true,
      'aria-label': 'Notifications',
    }))

    const input = getByRole('switch', { name: 'Notifications' }) as HTMLInputElement

    expect(input.type).toBe('checkbox')
    expect(input.checked).toBe(true)
    expect(input.required).toBe(true)
    expect(input.name).toBe('notifications')
    expect(input.value).toBe('enabled')
    expect(inputRef.current).toBe(input)
  })

  it('supports pointer, Space, and Enter changes in uncontrolled mode', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { getByRole } = render(createElement(Switch, {
      defaultChecked: false,
      onChange,
      'aria-label': 'Low power mode',
    }))
    const input = getByRole('switch', { name: 'Low power mode' }) as HTMLInputElement

    await user.click(input)
    expect(input.checked).toBe(true)
    expect(onChange).toHaveBeenLastCalledWith(true)

    input.focus()
    await user.keyboard(' ')
    expect(input.checked).toBe(false)
    expect(onChange).toHaveBeenLastCalledWith(false)

    await user.keyboard('{Enter}')
    expect(input.checked).toBe(true)
    expect(onChange).toHaveBeenLastCalledWith(true)
  })

  it('blocks interaction when disabled without fading the whole control', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container, getByRole } = render(createElement(Switch, {
      checked: false,
      onChange,
      disabled: true,
      'aria-label': 'Disabled setting',
    }))
    const input = getByRole('switch', { name: 'Disabled setting' }) as HTMLInputElement
    const root = container.firstElementChild as HTMLElement

    expect(input.disabled).toBe(true)
    expect(root.hasAttribute('data-disabled')).toBe(true)
    expect(root.className).not.toContain('dragged-state-layer-opacity')

    await user.click(input)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('participates in native form submission', () => {
    const { container } = render(createElement(
      'form',
      null,
      createElement(Switch, {
        defaultChecked: true,
        name: 'notifications',
        value: 'enabled',
        'aria-label': 'Notifications',
      })
    ))
    const form = container.querySelector('form') as HTMLFormElement

    expect(new FormData(form).get('notifications')).toBe('enabled')
  })

  it('uses logical handle positions so RTL can reverse the direction', () => {
    const unchecked = renderToStaticMarkup(createElement(Switch, {
      checked: false,
      onChange: () => undefined,
      'aria-label': 'Unchecked',
    }))
    const checked = renderToStaticMarkup(createElement(Switch, {
      checked: true,
      onChange: () => undefined,
      'aria-label': 'Checked',
    }))

    expect(unchecked).toContain('start-[-4px]')
    expect(checked).toContain('start-[16px]')
    expect(unchecked).not.toContain('translate-x-8dp')
    expect(checked).not.toContain('translate-x-24dp')
  })

  it('centers selected and unselected icons in a fixed 16dp box', () => {
    const checked = renderToStaticMarkup(createElement(Switch, {
      checked: true,
      icon: 'check',
      'aria-label': 'Checked',
    }))
    const unchecked = renderToStaticMarkup(createElement(Switch, {
      checked: false,
      unselectedIcon: 'close',
      'aria-label': 'Unchecked',
    }))

    for (const markup of [checked, unchecked]) {
      expect(markup).toContain('flex h-16dp w-16dp items-center justify-center leading-none')
    }
  })
})

describe('Radio', () => {
  it('forwards native semantics and supports the full row-label pattern', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { getByRole } = render(createElement(
      'label',
      null,
      createElement(Radio, {
        defaultChecked: false,
        name: 'text-size',
        value: 'large',
        onChange,
      }),
      'Large'
    ))
    const input = getByRole('radio', { name: 'Large' }) as HTMLInputElement

    await user.click(input)

    expect(input.checked).toBe(true)
    expect(input.value).toBe('large')
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})
