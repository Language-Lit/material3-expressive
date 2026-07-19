// @vitest-environment jsdom

import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Button } from '../../../src/components/buttons'
import { CardContent } from '../../../src/components/cards'
import { MenuItem } from '../../../src/components/navigation'
import { Input } from '../../../src/components/inputs'
import { Badge } from '../../../src/components/feedback'
import { Modal } from '../../../src/components/modals'
import { Text } from '../../../src/components/display'

afterEach(() => cleanup())

describe('frozen legacy representative renders', () => {
  it('buttons', () => {
    const { container } = render(<Button>Continue</Button>)
    expect(container.innerHTML).toMatchSnapshot()
  })

  it('cards', () => {
    const stableDate = {
      toLocaleDateString: () => '1/2/2024',
    } as unknown as Date
    const { container } = render(
      <CardContent
        title="Japanese basics"
        description="First lesson"
        language="Japanese"
        uploadedAt={stableDate}
      />,
    )
    expect(container.innerHTML).toMatchSnapshot()
  })

  it('navigation', () => {
    const { container } = render(<MenuItem selected>Saved</MenuItem>)
    expect(container.innerHTML).toMatchSnapshot()
  })

  it('inputs', () => {
    const { container } = render(<Input label="Email" name="email" supportingText="Required" />)
    expect(container.innerHTML).toMatchSnapshot()
  })

  it('feedback', () => {
    const { container } = render(<Badge value={1200} aria-label="Notifications" />)
    expect(container.innerHTML).toMatchSnapshot()
  })

  it('modals', () => {
    render(<Modal isOpen onClose={() => undefined}>Modal content</Modal>)
    expect(document.body.innerHTML).toMatchSnapshot()
  })

  it('display', () => {
    const { container } = render(<Text as="span" type="label" size="large">Label</Text>)
    expect(container.innerHTML).toMatchSnapshot()
  })
})
