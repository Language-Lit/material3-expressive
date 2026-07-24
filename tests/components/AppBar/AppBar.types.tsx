import { createRef } from 'react'
import { AppBar } from '../../../src/components/AppBar'
import type {
  AppBarProps,
  AppBarScrollBehavior,
  AppBarSize,
  AppBarTitleAlignment,
} from '../../../src/components/AppBar'

const ref = createRef<HTMLElement>()
const containerRef = createRef<HTMLDivElement>()

const size: AppBarSize = 'medium'
const alignment: AppBarTitleAlignment = 'center'
const behavior: AppBarScrollBehavior = 'exitUntilCollapsed'
const props: AppBarProps = { title: 'Inbox' }
void size
void alignment
void behavior
void props

;<AppBar title="Inbox" />
;<AppBar title="Inbox" ref={ref} />
;<AppBar title={<h1>Inbox</h1>} navigationIcon={<button type="button" />} actions={<button type="button" />} />
;<AppBar title="Inbox" subtitle="All accounts" titleAlignment="center" />
;<AppBar title="Inbox" scrollBehavior="pinned" />
;<AppBar title="Inbox" scrollBehavior="enterAlways" scrollContainer={containerRef} />
;<AppBar title="Inbox" size="medium" />
;<AppBar title="Inbox" size="medium" flexible subtitle="All accounts" />
;<AppBar title="Inbox" size="large" scrollBehavior="exitUntilCollapsed" />
;<AppBar title="Inbox" size="large" flexible subtitle="s" titleAlignment="center" />
;<AppBar title="Inbox" id="bar" lang="en" className="custom" />

// @ts-expect-error the source has no small flexible bar
;<AppBar title="Inbox" size="small" flexible />

// @ts-expect-error a subtitle needs the flexible variant on two-row bars
;<AppBar title="Inbox" size="medium" subtitle="All accounts" />

// @ts-expect-error title alignment needs the flexible variant on two-row bars
;<AppBar title="Inbox" size="large" titleAlignment="center" />

// @ts-expect-error a small bar has no second row to collapse
;<AppBar title="Inbox" scrollBehavior="exitUntilCollapsed" />

// @ts-expect-error size is a closed union
;<AppBar title="Inbox" size="huge" />

// @ts-expect-error scroll behavior is a closed union
;<AppBar title="Inbox" scrollBehavior="always" />

// @ts-expect-error a bar's content lives in its named slots, not children
;<AppBar title="Inbox">content</AppBar>

// @ts-expect-error the title slot is required
;<AppBar size="medium" />

// @ts-expect-error the scroll container is an element ref, not an element
;<AppBar title="Inbox" scrollBehavior="pinned" scrollContainer={document.body} />
