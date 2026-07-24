// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, beforeEach } from 'vitest'
import { SearchAppBar, SearchBar } from '../../../src/components/SearchBar'
import { installDialogPolyfill } from '../Dialog/dialog-native-polyfill'
import { installWidthMatchMedia } from '../NavigationSuite/navigation-suite-native-polyfill'

beforeAll(installDialogPolyfill)
beforeEach(() => {
  installWidthMatchMedia(420)
})
afterEach(cleanup)

const collapsedBar = (): HTMLElement =>
  document.querySelector('.m3e-search-bar__bar[data-m3e-placement="collapsed"]') as HTMLElement

const collapsedInput = (): HTMLInputElement =>
  collapsedBar().querySelector('.m3e-search-bar__input') as HTMLInputElement

describe('SearchBar accessibility', () => {
  it('exposes the field as a combobox named by the hinted search text', () => {
    render(<SearchBar placeholder="Search your messages">results</SearchBar>)
    const field = screen.getByRole('combobox', { name: 'Search your messages' })

    expect(field).toBe(collapsedInput())
  })

  it('announces the change of state through aria-expanded, not a live region', async () => {
    const user = userEvent.setup()
    render(<SearchBar placeholder="Search">results</SearchBar>)

    expect(collapsedInput().getAttribute('aria-expanded')).toBe('false')
    await user.click(collapsedInput())

    // Every rendered field reports the new state; the in-page one is inert and
    // the surface's copy is the live control. The source publishes the same
    // fact through a state description, which `aria-expanded` supersedes here.
    const fields = [...document.querySelectorAll('.m3e-search-bar__input')]
    expect(fields.every((node) => node.getAttribute('aria-expanded') === 'true')).toBe(true)
    expect(document.querySelector('[aria-live]')).toBeNull()
  })

  it('declares list autocomplete, so results are announced as selectable', () => {
    render(<SearchBar placeholder="Search">results</SearchBar>)
    expect(collapsedInput().getAttribute('aria-autocomplete')).toBe('list')
  })

  it('keeps exactly one field reachable while a surface is open', async () => {
    const user = userEvent.setup()
    render(<SearchBar placeholder="Search">results</SearchBar>)
    await user.click(collapsedInput())

    // The in-page bar is inert, so its field is neither focusable nor exposed.
    expect(collapsedBar().inert).toBe(true)
    const dialog = document.querySelector('.m3e-search-bar__full-screen') as HTMLDialogElement
    expect(dialog.querySelectorAll('.m3e-search-bar__input')).toHaveLength(1)
  })

  it('names the full-screen surface, which is a real modal dialog', async () => {
    const user = userEvent.setup()
    render(<SearchBar placeholder="Search your messages">results</SearchBar>)
    await user.click(collapsedInput())

    const dialog = document.querySelector('.m3e-search-bar__full-screen') as HTMLDialogElement
    expect(dialog.getAttribute('aria-label')).toBe('Search your messages')
    expect(dialog.hasAttribute('open')).toBe(true)
  })

  it('reports the disabled state natively', () => {
    render(<SearchBar placeholder="Search" disabled />)

    expect(collapsedInput().disabled).toBe(true)
    expect(collapsedInput().hasAttribute('aria-disabled')).toBe(false)
  })

  it('reaches the field, then the results, by keyboard alone', async () => {
    const user = userEvent.setup()
    render(
      <SearchBar placeholder="Search">
        <button type="button">Recent: invoices</button>
      </SearchBar>,
    )

    await user.tab()
    expect(document.activeElement).toBe(collapsedInput())

    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Recent: invoices' }),
    )
  })

  it('leaves the results container semantics to the content it is given', async () => {
    const user = userEvent.setup()
    render(
      <SearchBar placeholder="Search">
        <ul>
          <li>
            <button type="button">Invoices</button>
          </li>
        </ul>
      </SearchBar>,
    )
    await user.click(collapsedInput())

    const results = document.querySelector('.m3e-search-bar__results') as HTMLElement
    expect(results.hasAttribute('role')).toBe(false)
    expect(screen.getByRole('list')).not.toBeNull()
  })

  it('marks the decorative avatar wrapper as content, never as a control', () => {
    render(<SearchBar placeholder="Search" avatar={<img alt="" src="data:," />} />)
    const avatar = document.querySelector('.m3e-search-bar__avatar') as HTMLElement

    expect(avatar.tagName).toBe('DIV')
    expect(avatar.hasAttribute('role')).toBe(false)
    expect(avatar.hasAttribute('tabindex')).toBe(false)
  })

  it('gives the search app bar the banner landmark and keeps its actions reachable', async () => {
    const user = userEvent.setup()
    render(
      <SearchAppBar
        navigationIcon={<button type="button">Open navigation</button>}
        actions={<button type="button">Account</button>}
      >
        <SearchBar placeholder="Search mail" />
      </SearchAppBar>,
    )

    expect(screen.getByRole('banner')).not.toBeNull()
    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Open navigation' }),
    )
    await user.tab()
    expect(document.activeElement).toBe(collapsedInput())
  })
})
