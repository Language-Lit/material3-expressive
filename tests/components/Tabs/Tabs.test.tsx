// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { afterEach, beforeAll, vi } from 'vitest'
import { Tabs } from '../../../src/components/Tabs'
import type { TabItem } from '../../../src/components/Tabs'
import { installTabsNativePolyfills } from './tabs-native-polyfill'

beforeAll(installTabsNativePolyfills)
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

/**
 * jsdom performs no layout, so these geometry tests supply the rects and
 * scroll positions a real scrolled row would report. The arithmetic under
 * test is the component's, not the mock's: the unrepaired component fails
 * each positive case here by exactly the mocked scroll distance.
 */
function domRect(left: number, width: number): DOMRect {
  return {
    left,
    width,
    right: left + width,
    top: 0,
    bottom: 0,
    height: 0,
    x: left,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect
}

const basicItems: TabItem[] = [
  { value: 'photos', label: 'Photos' },
  { value: 'shared', label: 'Shared', disabled: true },
  { value: 'files', label: 'Files' },
]

describe('Tabs', () => {
  it('renders role="tablist" with role="tab" children in display order', () => {
    render(<Tabs aria-label="Library" items={basicItems} />)
    const tablist = screen.getByRole('tablist', { name: 'Library' })
    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((tab) => tab.textContent)).toEqual(['Photos', 'Shared', 'Files'])
    expect(tablist.contains(tabs[0])).toBe(true)
  })

  it('selects the first item by default and marks it aria-selected with tabindex 0', () => {
    render(<Tabs aria-label="Library" items={basicItems} />)
    const photos = screen.getByRole('tab', { name: 'Photos' })
    expect(photos.getAttribute('aria-selected')).toBe('true')
    expect(photos.getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('tab', { name: 'Files' }).getAttribute('tabindex')).toBe('-1')
  })

  it('clicking a tab selects it (uncontrolled)', async () => {
    const user = userEvent.setup()
    render(<Tabs aria-label="Library" items={basicItems} />)
    await user.click(screen.getByRole('tab', { name: 'Files' }))
    expect(screen.getByRole('tab', { name: 'Files' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: 'Photos' }).getAttribute('aria-selected')).toBe('false')
  })

  it('clicking a disabled tab does nothing', async () => {
    const user = userEvent.setup()
    render(<Tabs aria-label="Library" items={basicItems} />)
    await user.click(screen.getByRole('tab', { name: 'Shared' }))
    expect(screen.getByRole('tab', { name: 'Photos' }).getAttribute('aria-selected')).toBe('true')
  })

  it('ArrowRight/ArrowLeft move focus and select, wrapping and skipping disabled tabs', async () => {
    const user = userEvent.setup()
    render(<Tabs aria-label="Library" items={basicItems} />)
    screen.getByRole('tab', { name: 'Photos' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Files' }))
    expect(screen.getByRole('tab', { name: 'Files' }).getAttribute('aria-selected')).toBe('true')
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Photos' }))
    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Files' }))
  })

  it('Home/End jump to the first/last enabled tab', async () => {
    const user = userEvent.setup()
    render(<Tabs aria-label="Library" items={basicItems} />)
    screen.getByRole('tab', { name: 'Photos' }).focus()
    await user.keyboard('{End}')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Files' }))
    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Photos' }))
  })

  it('renders an item with href as a real link, and omits href when that item is disabled', () => {
    const items: TabItem[] = [
      { value: 'overview', label: 'Overview', href: '/overview' },
      { value: 'billing', label: 'Billing', href: '/billing', disabled: true },
    ]
    render(<Tabs aria-label="Account" items={items} />)
    const overview = screen.getByRole('tab', { name: 'Overview' })
    expect(overview.tagName).toBe('A')
    expect(overview.getAttribute('href')).toBe('/overview')

    const billing = screen.getByRole('tab', { name: 'Billing' })
    expect(billing.tagName).toBe('A')
    expect(billing.hasAttribute('href')).toBe(false)
    expect(billing.getAttribute('aria-disabled')).toBe('true')
  })

  it('renders an item without href as a native button', () => {
    render(<Tabs aria-label="Library" items={basicItems} />)
    expect(screen.getByRole('tab', { name: 'Photos' }).tagName).toBe('BUTTON')
  })

  it('renders one role="tabpanel" for the selected item only when items define panel', async () => {
    const user = userEvent.setup()
    const items: TabItem[] = [
      { value: 'photos', label: 'Photos', panel: <p>Photo grid</p> },
      { value: 'files', label: 'Files', panel: <p>File list</p> },
    ]
    render(<Tabs aria-label="Library" items={items} />)
    expect(screen.getByRole('tabpanel').textContent).toBe('Photo grid')
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1)

    await user.click(screen.getByRole('tab', { name: 'Files' }))
    expect(screen.getByRole('tabpanel').textContent).toBe('File list')
  })

  it('renders no tabpanel region at all when no item defines panel', () => {
    render(<Tabs aria-label="Library" items={basicItems} />)
    expect(screen.queryByRole('tabpanel')).toBeNull()
  })

  it('associates the tabpanel with its tab via aria-controls/aria-labelledby', () => {
    const items: TabItem[] = [{ value: 'photos', label: 'Photos', panel: <p>Photo grid</p> }]
    render(<Tabs aria-label="Library" items={items} />)
    const tab = screen.getByRole('tab', { name: 'Photos' })
    const panel = screen.getByRole('tabpanel')
    expect(tab.getAttribute('aria-controls')).toBe(panel.id)
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id)
  })

  it('supports a controlled value/onValueChange pair', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Tabs aria-label="Library" items={basicItems} value="photos" onValueChange={onValueChange} />)
    await user.click(screen.getByRole('tab', { name: 'Files' }))
    expect(onValueChange).toHaveBeenCalledWith('files')
    // Controlled: the prop still governs the rendered selection.
    expect(screen.getByRole('tab', { name: 'Photos' }).getAttribute('aria-selected')).toBe('true')
  })

  it('supports uncontrolled defaultValue', () => {
    render(<Tabs aria-label="Library" items={basicItems} defaultValue="files" />)
    expect(screen.getByRole('tab', { name: 'Files' }).getAttribute('aria-selected')).toBe('true')
  })

  it('exposes the variant on the tablist as a data attribute', () => {
    render(<Tabs aria-label="Library" items={basicItems} variant="secondary" />)
    expect(screen.getByRole('tablist').getAttribute('data-m3e-variant')).toBe('secondary')
  })

  it('forwards ref, className, and style to the root', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Tabs
        ref={ref}
        aria-label="Library"
        items={basicItems}
        className="consumer-class"
        data-owner="consumer"
      />,
    )
    const tablist = screen.getByRole('tablist')
    expect(ref.current?.contains(tablist)).toBe(true)
    expect(ref.current?.className).toContain('m3e-tabs')
    expect(ref.current?.className).toContain('consumer-class')
    expect(ref.current?.getAttribute('data-owner')).toBe('consumer')
  })

  it('exposes a stable component name for React tooling', () => {
    expect(Tabs.displayName).toBe('Tabs')
  })

  it('marks the indicator ready after the first client measurement', () => {
    render(<Tabs aria-label="Library" items={basicItems} />)
    const indicator = document.querySelector('.m3e-tabs__indicator')
    expect(indicator?.getAttribute('data-m3e-ready')).toBe('true')
  })

  it('measures the indicator in the scrolled content coordinate space, not the visible box', async () => {
    const user = userEvent.setup()
    render(<Tabs aria-label="Library" items={basicItems} scrollable />)
    const list = screen.getByRole('tablist')
    // The row is scrolled 120px, and the target tab's content sits 40px
    // from the row's visible left edge. The indicator is absolutely
    // positioned inside the scroller, so it needs the content-space offset:
    // 40 + 120. The unrepaired component reported the viewport-space 40 —
    // exactly scrollLeft short.
    list.scrollLeft = 120
    vi.spyOn(list, 'getBoundingClientRect').mockReturnValue(domRect(0, 400))
    const files = screen.getByRole('tab', { name: 'Files' })
    const content = files.querySelector('.m3e-tabs__tab-content') as HTMLElement
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(domRect(40, 64))
    await user.click(files)
    const indicator = document.querySelector('.m3e-tabs__indicator') as HTMLElement
    expect(indicator.style.transform).toBe('translateX(160px)')
    expect(indicator.style.inlineSize).toBe('64px')
  })

  it('adds the raw, sign-carrying scrollLeft, so an RTL row (negative scroll) measures correctly', async () => {
    const user = userEvent.setup()
    render(<Tabs aria-label="Library" items={basicItems} scrollable />)
    const list = screen.getByRole('tablist')
    // Every target browser reports scrollLeft as 0-or-negative in RTL. The
    // content-space conversion is the same signed addition — an absolute
    // value here would re-break RTL while fixing LTR.
    list.scrollLeft = -80
    vi.spyOn(list, 'getBoundingClientRect').mockReturnValue(domRect(0, 400))
    const files = screen.getByRole('tab', { name: 'Files' })
    const content = files.querySelector('.m3e-tabs__tab-content') as HTMLElement
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(domRect(40, 64))
    await user.click(files)
    const indicator = document.querySelector('.m3e-tabs__indicator') as HTMLElement
    expect(indicator.style.transform).toBe('translateX(-40px)')
  })

  it('centers the selected tab by scrolling only the row itself, never an ancestor', async () => {
    const user = userEvent.setup()
    render(<Tabs aria-label="Library" items={basicItems} scrollable />)
    const list = screen.getByRole('tablist')
    vi.spyOn(list, 'getBoundingClientRect').mockReturnValue(domRect(0, 400))
    const files = screen.getByRole('tab', { name: 'Files' })
    vi.spyOn(files, 'getBoundingClientRect').mockReturnValue(domRect(340, 120))
    const scrollBy = vi.spyOn(list, 'scrollBy').mockImplementation(() => {})
    const scrollIntoView = vi.fn()
    files.scrollIntoView = scrollIntoView
    await user.click(files)
    // The tab's center (400) sits 200px past the row's own center (200):
    // the source's ScrollableTabData.calculateTabOffset centers the
    // selected tab, translated here to a scrollBy the browser clamps to
    // the row's scrollable range. scrollIntoView is never used — it walks
    // every scrollable ancestor, so selecting a tab could scroll the page.
    expect(scrollBy).toHaveBeenCalledWith({ left: 200, behavior: 'smooth' })
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('centers instantly on mount, and never scrolls a fixed row', () => {
    const scrollBy = vi.spyOn(Element.prototype, 'scrollBy').mockImplementation(() => {})
    render(<Tabs aria-label="Library" items={basicItems} scrollable defaultValue="files" />)
    // The first centering runs over a page that just appeared, so it must
    // not animate; only selection changes after mount do.
    expect(scrollBy).toHaveBeenCalledTimes(1)
    expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }))

    scrollBy.mockClear()
    render(<Tabs aria-label="Fixed" items={basicItems} defaultValue="files" />)
    expect(scrollBy).not.toHaveBeenCalled()
  })

  it('does not animate the centering scroll under reduced motion', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true, addEventListener() {}, removeEventListener() {} }),
    )
    const user = userEvent.setup()
    render(<Tabs aria-label="Library" items={basicItems} scrollable />)
    const list = screen.getByRole('tablist')
    const scrollBy = vi.spyOn(list, 'scrollBy').mockImplementation(() => {})
    await user.click(screen.getByRole('tab', { name: 'Files' }))
    expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }))
  })
})
