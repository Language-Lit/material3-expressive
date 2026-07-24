// @vitest-environment jsdom

import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { beforeAll, beforeEach } from 'vitest'
import { SearchAppBar, SearchBar } from '../../../src/components/SearchBar'
import { installDialogPolyfill } from '../Dialog/dialog-native-polyfill'
import { installWidthMatchMedia } from '../NavigationSuite/navigation-suite-native-polyfill'

beforeAll(installDialogPolyfill)
beforeEach(() => {
  installWidthMatchMedia(1280)
})

describe('SearchBar server rendering', () => {
  it('renders deterministic markup with no injected style tags', () => {
    const render = () => renderToString(<SearchBar placeholder="Search">results</SearchBar>)
    const first = render()

    expect(first).toBe(render())
    expect(first).toContain('class="m3e-search-bar"')
    expect(first).not.toContain('<style')
  })

  it('paints the surface closed, whatever the expanded prop says', () => {
    // Native modality only exists once `showModal()` runs on the client, and
    // the docked surface is a portal that has no server equivalent at all.
    const html = renderToString(
      <SearchBar placeholder="Search" defaultExpanded>
        results
      </SearchBar>,
    )

    expect(html).toContain('m3e-search-bar__full-screen')
    expect(html).not.toContain('open=""')
    expect(html).not.toContain('m3e-search-bar__panel')
  })

  it('serialises one field, never a surface copy', () => {
    const html = renderToString(<SearchBar placeholder="Search">results</SearchBar>)

    expect(html.match(/m3e-search-bar__input/g)).toHaveLength(1)
    expect(html).toContain('data-m3e-placement="collapsed"')
    expect(html).not.toContain('data-m3e-placement="expanded"')
  })

  it('always serialises the resting scroll state of a coupled app bar', () => {
    const html = renderToString(
      <SearchAppBar scrollBehavior="enterAlways">
        <SearchBar placeholder="Search" />
      </SearchAppBar>,
    )

    expect(html).not.toContain('data-m3e-scrolled')
    expect(html).not.toContain('--m3e-search-app-bar-offset')
  })

  it('hydrates a collapsed bar with zero markup delta', async () => {
    const tree = (
      <SearchBar
        placeholder="Search your messages"
        leadingIcon={<span>S</span>}
        trailingIcon={<button type="button">Voice</button>}
      >
        results
      </SearchBar>
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
    expect(recoverableErrors).toEqual([])
    expect(document.querySelector('style')).toBeNull()
    expect(container.innerHTML).toBe(serverHtml)

    await act(async () => root.unmount())
    container.remove()
  })

  it('hydrates a coupled search app bar with zero markup delta', async () => {
    const tree = (
      <SearchAppBar
        scrollBehavior="pinned"
        navigationIcon={<button type="button">Menu</button>}
        actions={<button type="button">Account</button>}
      >
        <SearchBar placeholder="Search mail" />
      </SearchAppBar>
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
    expect(recoverableErrors).toEqual([])
    expect(container.innerHTML).toBe(serverHtml)

    await act(async () => root.unmount())
    container.remove()
  })
})
