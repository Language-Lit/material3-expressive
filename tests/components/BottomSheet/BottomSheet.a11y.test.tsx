// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, vi } from 'vitest'
import { BottomSheet } from '../../../src/components/BottomSheet'
import { installDialogPolyfill } from '../Dialog/dialog-native-polyfill'

beforeAll(installDialogPolyfill)
afterEach(cleanup)

const NAME = { 'aria-label': 'Details' } as const

describe('BottomSheet accessibility', () => {
  it('exposes exactly one named pane per sheet and no nested interactive traps', () => {
    render(
      <div>
        <BottomSheet {...NAME} data-testid="modal" defaultValue="expanded">
          <p>Sheet body</p>
        </BottomSheet>
        <BottomSheet {...NAME} variant="standard" defaultValue="partiallyExpanded">
          <p>Docked body</p>
        </BottomSheet>
      </div>,
    )

    // One dialog (the modal root) and one region (the standard root), each named.
    expect(screen.getAllByRole('dialog', { name: 'Details' })).toHaveLength(1)
    expect(screen.getAllByRole('region', { name: 'Details' })).toHaveLength(1)
    // Every rendered handle is a real button, so it is reachable and operable.
    for (const handle of screen.getAllByRole('button')) {
      expect(handle.tagName).toBe('BUTTON')
      expect(handle.getAttribute('type')).toBe('button')
      expect(handle.getAttribute('aria-label')).toBeTruthy()
    }
  })

  it('names the modal root itself rather than an inner box, so the dialog is not left unnamed', () => {
    render(<BottomSheet {...NAME} data-testid="sheet" defaultValue="expanded" />)
    const sheet = screen.getByTestId('sheet')

    expect(sheet.getAttribute('aria-label')).toBe('Details')
    // The container is a presentational box; a second dialog role here would
    // leave an unnamed dialog wrapping a named one.
    expect(sheet.querySelector('[role="dialog"]')).toBeNull()
  })

  it('accepts aria-labelledby in place of a label', () => {
    render(
      <div>
        <h2 id="sheet-title">Filters</h2>
        <BottomSheet aria-labelledby="sheet-title" data-testid="sheet" defaultValue="expanded" />
      </div>,
    )

    expect(screen.getByTestId('sheet').getAttribute('aria-labelledby')).toBe('sheet-title')
  })

  it('exposes the standard variant as a named region, not a dialog', () => {
    render(<BottomSheet {...NAME} variant="standard" defaultValue="expanded" />)
    expect(screen.getByRole('region', { name: 'Details' })).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('labels the drag handle with the action its activation performs', () => {
    const { rerender } = render(<BottomSheet {...NAME} value="partiallyExpanded" onValueChange={() => {}} />)
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Expand bottom sheet')

    rerender(<BottomSheet {...NAME} value="expanded" onValueChange={() => {}} />)
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Dismiss bottom sheet')
  })

  it('labels a standard sheet handle as collapsing, since it has no hidden anchor', () => {
    render(<BottomSheet {...NAME} variant="standard" value="expanded" onValueChange={() => {}} />)
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Collapse bottom sheet')
  })

  it('reflects expansion on the handle and points it at the content it resizes', () => {
    render(<BottomSheet {...NAME} data-testid="sheet" defaultValue="expanded" />)
    const handle = screen.getByRole('button')
    const content = screen.getByTestId('sheet').querySelector('.m3e-bottom-sheet__content')

    expect(handle.getAttribute('aria-expanded')).toBe('true')
    expect(handle.getAttribute('aria-controls')).toBe(content?.id)
  })

  it('provides a single-pointer alternative to dragging, as the guidance requires', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <BottomSheet {...NAME} defaultValue="partiallyExpanded" onValueChange={onValueChange} />,
    )

    // No pointer drag involved: a plain activation reaches the next height.
    await user.click(screen.getByRole('button'))
    expect(onValueChange).toHaveBeenCalledWith('expanded')
  })

  it('blocks Escape dismissal when dismissOnEscape is false', () => {
    const onValueChange = vi.fn()
    render(
      <BottomSheet
        {...NAME}
        data-testid="sheet"
        defaultValue="expanded"
        dismissOnEscape={false}
        onValueChange={onValueChange}
      />,
    )

    const dialog = screen.getByTestId('sheet')
    const cancel = new Event('cancel', { cancelable: true })
    dialog.dispatchEvent(cancel)

    expect(cancel.defaultPrevented).toBe(true)
  })

  it('leaves Escape dismissal intact by default', () => {
    render(<BottomSheet {...NAME} data-testid="sheet" defaultValue="expanded" />)

    const cancel = new Event('cancel', { cancelable: true })
    screen.getByTestId('sheet').dispatchEvent(cancel)

    expect(cancel.defaultPrevented).toBe(false)
  })

  it('warns when a sheet has no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<BottomSheet defaultValue="expanded" />)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'))
    warn.mockRestore()
  })

  it('does not warn a correctly controlled sheet about passing both value and defaultValue', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<BottomSheet {...NAME} value="expanded" onValueChange={() => {}} />)

    // `defaultValue` must stay undefined when the consumer omits it, or every
    // controlled sheet is warned for a mistake it did not make.
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('still warns when value and defaultValue really are both passed', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <BottomSheet {...NAME} value="expanded" defaultValue="hidden" onValueChange={() => {}} />,
    )

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('not both'))
    warn.mockRestore()
  })

  it('warns when a peek height is given to a modal sheet, which has no peek anchor', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // @ts-expect-error the type system rejects this; the warning covers JS consumers.
    render(<BottomSheet {...NAME} defaultValue="expanded" peekHeight={72} />)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('peekHeight'))
    warn.mockRestore()
  })
})
