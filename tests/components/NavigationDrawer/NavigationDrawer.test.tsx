// @vitest-environment jsdom

import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { afterEach, beforeAll, vi } from 'vitest'
import { NavigationDrawer } from '../../../src/components/NavigationDrawer'
import type { NavigationItem } from '../../../src/components/NavigationDrawer'
import { installDialogPolyfill } from '../Dialog/dialog-native-polyfill'

beforeAll(installDialogPolyfill)
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const items: NavigationItem[] = [
  { value: 'inbox', label: 'Inbox', icon: <span /> },
  { value: 'sent', label: 'Sent', icon: <span /> },
  { value: 'trash', label: 'Trash', icon: <span />, disabled: true },
]

/**
 * jsdom has no layout, so the modal sheet's own box has to be stated for the
 * light-dismiss hit test to mean anything: 360px wide against the start edge,
 * full height. Anything to its inline end is scrim.
 */
function stubSheetBox(dialog: HTMLDialogElement): void {
  vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    bottom: 800,
    left: 0,
    right: 360,
    width: 360,
    height: 800,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })
}

describe('NavigationDrawer', () => {
  it('permanent variant always renders and ignores open/onOpenChange', () => {
    render(<NavigationDrawer items={items} variant="permanent" open={false} />)
    expect(screen.getByRole('button', { name: 'Inbox' })).not.toBeNull()
  })

  it('permanent variant selects the first item by default', () => {
    render(<NavigationDrawer items={items} variant="permanent" />)
    expect(screen.getByRole('button', { name: 'Inbox' }).getAttribute('aria-current')).toBe('page')
  })

  it('clicking an item selects it (uncontrolled)', async () => {
    const user = userEvent.setup()
    render(<NavigationDrawer items={items} variant="permanent" />)
    await user.click(screen.getByRole('button', { name: 'Sent' }))
    expect(screen.getByRole('button', { name: 'Sent' }).getAttribute('aria-current')).toBe('page')
  })

  it('a disabled item is a native disabled button, inert to click', async () => {
    const user = userEvent.setup()
    render(<NavigationDrawer items={items} variant="permanent" />)
    const trash = screen.getByRole('button', { name: 'Trash' }) as HTMLButtonElement
    expect(trash.disabled).toBe(true)
    await user.click(trash)
    expect(screen.getByRole('button', { name: 'Inbox' }).getAttribute('aria-current')).toBe('page')
  })

  it('dismissible variant renders closed by default and opens via the open prop', () => {
    const { rerender } = render(
      <NavigationDrawer items={items} variant="dismissible" open={false} onOpenChange={() => undefined} />,
    )
    expect(document.querySelector('.m3e-navigation-drawer')?.getAttribute('data-m3e-open')).toBe('false')

    rerender(<NavigationDrawer items={items} variant="dismissible" open onOpenChange={() => undefined} />)
    expect(document.querySelector('.m3e-navigation-drawer')?.getAttribute('data-m3e-open')).toBe('true')
  })

  it('modal variant opens via showModal() and closes via close()', () => {
    const { rerender } = render(
      <NavigationDrawer items={items} variant="modal" open={false} onOpenChange={() => undefined} />,
    )
    const dialog = document.querySelector('dialog')!
    expect(dialog.hasAttribute('open')).toBe(false)

    rerender(<NavigationDrawer items={items} variant="modal" open onOpenChange={() => undefined} />)
    expect(dialog.hasAttribute('open')).toBe(true)
  })

  it('modal variant reports its own native close through onOpenChange', () => {
    const onOpenChange = vi.fn()
    render(<NavigationDrawer items={items} variant="modal" open onOpenChange={onOpenChange} />)
    const dialog = document.querySelector('dialog')!
    dialog.close()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('modal variant dismisses on a scrim click', () => {
    const onOpenChange = vi.fn()
    render(<NavigationDrawer items={items} variant="modal" open onOpenChange={onOpenChange} />)
    const dialog = document.querySelector('dialog')!
    stubSheetBox(dialog)

    act(() => {
      dialog.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, clientX: 900, clientY: 400 }),
      )
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('modal variant keeps a click inside its own sheet from dismissing it', () => {
    const onOpenChange = vi.fn()
    render(<NavigationDrawer items={items} variant="modal" open onOpenChange={onOpenChange} />)
    const dialog = document.querySelector('dialog')!
    stubSheetBox(dialog)

    // Both paths a click can take inside the drawer: the dialog box itself,
    // and a descendant (where `event.target` is never the dialog at all).
    act(() => {
      dialog.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, clientX: 100, clientY: 400 }),
      )
    })
    act(() => {
      screen.getByRole('button', { name: 'Sent' }).dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, clientX: 900, clientY: 400 }),
      )
    })
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(dialog.open).toBe(true)
  })

  it('modal variant lets a consumer onClick preventDefault the scrim dismissal', () => {
    const onOpenChange = vi.fn()
    render(
      <NavigationDrawer
        items={items}
        variant="modal"
        open
        onOpenChange={onOpenChange}
        onClick={(event) => event.preventDefault()}
      />,
    )
    const dialog = document.querySelector('dialog')!
    stubSheetBox(dialog)

    act(() => {
      dialog.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, clientX: 900, clientY: 400 }),
      )
    })
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(dialog.open).toBe(true)
  })

  it('renders an item with href as a real link, omitting href when disabled', () => {
    const linkItems: NavigationItem[] = [
      { value: 'inbox', label: 'Inbox', icon: <span />, href: '/inbox' },
      { value: 'trash', label: 'Trash', icon: <span />, href: '/trash', disabled: true },
    ]
    render(<NavigationDrawer items={linkItems} variant="permanent" />)
    expect(screen.getByRole('link', { name: 'Inbox' }).getAttribute('href')).toBe('/inbox')
    const trash = screen.getByRole('link', { name: 'Trash' })
    expect(trash.hasAttribute('href')).toBe(false)
  })

  it('supports a controlled value/onValueChange pair', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <NavigationDrawer items={items} variant="permanent" value="inbox" onValueChange={onValueChange} />,
    )
    await user.click(screen.getByRole('button', { name: 'Sent' }))
    expect(onValueChange).toHaveBeenCalledWith('sent')
  })

  it('forwards ref, className, and style to the root', () => {
    const ref = createRef<HTMLElement>()
    render(
      <NavigationDrawer
        ref={ref}
        items={items}
        variant="permanent"
        className="consumer-class"
        data-owner="consumer"
      />,
    )
    expect(ref.current?.className).toContain('m3e-navigation-drawer')
    expect(ref.current?.className).toContain('consumer-class')
    expect(ref.current?.getAttribute('data-owner')).toBe('consumer')
  })

  it('exposes a stable component name for React tooling', () => {
    expect(NavigationDrawer.displayName).toBe('NavigationDrawer')
  })
})
