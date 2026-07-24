// @vitest-environment jsdom

import { createRef, useState } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, vi } from 'vitest'
import { BottomSheet } from '../../../src/components/BottomSheet'
import type { BottomSheetState } from '../../../src/components/BottomSheet'
import { installDialogPolyfill } from '../Dialog/dialog-native-polyfill'

beforeAll(installDialogPolyfill)
afterEach(cleanup)

const NAME = { 'aria-label': 'Details' } as const

describe('BottomSheet', () => {
  it('renders a native dialog for the modal variant', () => {
    render(<BottomSheet {...NAME} data-testid="sheet" defaultValue="expanded" />)
    const sheet = screen.getByTestId('sheet')

    expect(sheet.tagName).toBe('DIALOG')
    expect(sheet.getAttribute('data-m3e-variant')).toBe('modal')
    expect(sheet.className).toBe('m3e-bottom-sheet')
  })

  it('renders an inline region for the standard variant', () => {
    render(
      <BottomSheet {...NAME} variant="standard" data-testid="sheet" defaultValue="expanded" />,
    )
    const sheet = screen.getByTestId('sheet')

    expect(sheet.tagName).toBe('DIV')
    expect(sheet.getAttribute('role')).toBe('region')
    expect(sheet.getAttribute('data-m3e-variant')).toBe('standard')
  })

  it('paints closed on first render and opens through showModal, never the open attribute', () => {
    const { rerender } = render(
      <BottomSheet {...NAME} data-testid="sheet" value="hidden" onValueChange={() => {}} />,
    )
    expect(screen.getByTestId('sheet').hasAttribute('open')).toBe(false)

    rerender(
      <BottomSheet {...NAME} data-testid="sheet" value="expanded" onValueChange={() => {}} />,
    )
    expect(screen.getByTestId('sheet').hasAttribute('open')).toBe(true)
  })

  it('never opens the standard variant as a dialog', () => {
    render(
      <BottomSheet {...NAME} variant="standard" data-testid="sheet" defaultValue="expanded" />,
    )
    expect(screen.getByTestId('sheet').hasAttribute('open')).toBe(false)
  })

  it('exposes every state on the root for styling and testing', () => {
    const states: readonly BottomSheetState[] = ['hidden', 'partiallyExpanded', 'expanded']
    for (const state of states) {
      cleanup()
      render(<BottomSheet {...NAME} data-testid="sheet" defaultValue={state} />)
      expect(screen.getByTestId('sheet').getAttribute('data-m3e-state')).toBe(state)
    }
  })

  it('cycles partiallyExpanded to expanded when the drag handle is activated', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <BottomSheet
        {...NAME}
        defaultValue="partiallyExpanded"
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('button'))
    expect(onValueChange).toHaveBeenCalledWith('expanded')
  })

  it('dismisses a modal sheet from expanded, matching the source click cycle', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<BottomSheet {...NAME} defaultValue="expanded" onValueChange={onValueChange} />)

    await user.click(screen.getByRole('button'))
    expect(onValueChange).toHaveBeenCalledWith('hidden')
  })

  it('collapses rather than dismisses a standard sheet, which has no hidden anchor', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <BottomSheet
        {...NAME}
        variant="standard"
        defaultValue="expanded"
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('button'))
    expect(onValueChange).toHaveBeenCalledWith('partiallyExpanded')
  })

  it('operates the drag handle with Space and Enter, per the Material keyboard contract', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    // Controlled and pinned, so both keys exercise the same transition rather
    // than the second acting on the state the first already advanced to.
    render(<BottomSheet {...NAME} value="partiallyExpanded" onValueChange={onValueChange} />)

    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('button'))

    await user.keyboard('{ }')
    expect(onValueChange).toHaveBeenCalledWith('expanded')

    onValueChange.mockClear()
    await user.keyboard('{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('expanded')
  })

  it('omits the drag handle when it is turned off', () => {
    render(<BottomSheet {...NAME} defaultValue="expanded" dragHandle={false} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('reports a native close back through onValueChange', () => {
    const onValueChange = vi.fn()
    render(
      <BottomSheet {...NAME} data-testid="sheet" defaultValue="expanded" onValueChange={onValueChange} />,
    )

    const dialog = screen.getByTestId('sheet') as HTMLDialogElement
    dialog.close()
    expect(onValueChange).toHaveBeenCalledWith('hidden')
  })

  it('dismisses on a scrim click, which targets the dialog element itself', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <BottomSheet {...NAME} data-testid="sheet" defaultValue="expanded" onValueChange={onValueChange} />,
    )

    await user.click(screen.getByTestId('sheet'))
    expect(onValueChange).toHaveBeenCalledWith('hidden')
  })

  it('keeps a click inside the sheet from dismissing it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <BottomSheet {...NAME} defaultValue="expanded" onValueChange={onValueChange}>
        <p>Sheet body</p>
      </BottomSheet>,
    )

    await user.click(screen.getByText('Sheet body'))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('honours dismissOnScrimClick=false', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <BottomSheet
        {...NAME}
        data-testid="sheet"
        defaultValue="expanded"
        dismissOnScrimClick={false}
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByTestId('sheet'))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('vetoes a state change when confirmValueChange returns false', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <BottomSheet
        {...NAME}
        defaultValue="partiallyExpanded"
        confirmValueChange={() => false}
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('button'))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('passes the pending state to confirmValueChange', async () => {
    const user = userEvent.setup()
    const confirmValueChange = vi.fn(() => true)
    render(
      <BottomSheet
        {...NAME}
        defaultValue="partiallyExpanded"
        confirmValueChange={confirmValueChange}
        onValueChange={() => {}}
      />,
    )

    await user.click(screen.getByRole('button'))
    expect(confirmValueChange).toHaveBeenCalledWith('expanded')
  })

  it('drives an uncontrolled sheet from its own state', async () => {
    const user = userEvent.setup()
    render(<BottomSheet {...NAME} data-testid="sheet" defaultValue="partiallyExpanded" />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByTestId('sheet').getAttribute('data-m3e-state')).toBe('expanded')
  })

  it('leaves a controlled sheet on the value its consumer commits', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [value, setValue] = useState<BottomSheetState>('partiallyExpanded')
      return (
        <BottomSheet {...NAME} data-testid="sheet" value={value} onValueChange={setValue} />
      )
    }
    render(<Controlled />)

    await user.click(screen.getByRole('button'))
    expect(screen.getByTestId('sheet').getAttribute('data-m3e-state')).toBe('expanded')
  })

  it('merges a consumer class after its own rather than replacing it', () => {
    render(<BottomSheet {...NAME} className="custom" data-testid="sheet" defaultValue="expanded" />)
    expect(screen.getByTestId('sheet').className).toBe('m3e-bottom-sheet custom')
  })

  it('forwards a ref to the root element of either variant', () => {
    const modalRef = createRef<HTMLElement>()
    const standardRef = createRef<HTMLElement>()
    render(
      <>
        <BottomSheet {...NAME} ref={modalRef} data-testid="modal" defaultValue="expanded" />
        <BottomSheet
          {...NAME}
          ref={standardRef}
          variant="standard"
          data-testid="standard"
          defaultValue="expanded"
        />
      </>,
    )

    expect(modalRef.current).toBe(screen.getByTestId('modal'))
    expect(standardRef.current).toBe(screen.getByTestId('standard'))
  })

  it('composes a consumer click handler rather than replacing the scrim handler', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const onValueChange = vi.fn()
    render(
      <BottomSheet
        {...NAME}
        data-testid="sheet"
        defaultValue="expanded"
        onClick={onClick}
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByTestId('sheet'))
    expect(onClick).toHaveBeenCalled()
    expect(onValueChange).toHaveBeenCalledWith('hidden')
  })

  it('renders its children inside the scrollable content region', () => {
    render(
      <BottomSheet {...NAME} defaultValue="expanded">
        <p>Sheet body</p>
      </BottomSheet>,
    )

    const content = screen.getByText('Sheet body').parentElement
    expect(content?.className).toBe('m3e-bottom-sheet__content')
  })

  it('passes native attributes through to the root', () => {
    render(<BottomSheet {...NAME} data-testid="sheet" defaultValue="expanded" lang="en" />)
    expect(screen.getByTestId('sheet').getAttribute('lang')).toBe('en')
  })
})
