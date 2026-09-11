'use client'

import Link from 'next/link'
import { Icon } from '@language-lit/material3-expressive'
import type { SearchEntry } from '../content/search'
import type { NavigationGroup } from '../content/navigation'
import { MobileNav } from './MobileNav'
import { BrandMark } from './Ramp'
import { Search } from './Search'
import { ThemeControls } from './ThemeControls'

/**
 * `repositoryUrl` arrives as a prop rather than an import: it lives in
 * `content/site`, which reaches `node:fs/promises` through the doc inventory
 * and so cannot be pulled into a client bundle. The layout reads it on the
 * server and hands it down, keeping the one canonical definition.
 */
export function SiteBar({
  version,
  index,
  groups,
  repositoryUrl,
}: {
  version: string
  index: SearchEntry[]
  groups: NavigationGroup[]
  repositoryUrl: string
}) {
  return (
    <header className="bar">
      <Link href="/" className="bar__brand">
        <BrandMark />
        <span className="bar__name">Material 3 Expressive</span>
        <span className="bar__version">v{version}</span>
      </Link>

      <nav className="bar__actions" aria-label="Site">
        {/* `display: contents` belongs in the stylesheet, not here: as an inline
            style it outranked the media query that hides this group, so these
            links stayed on screen below 60rem and overlapped the wordmark. */}
        <div className="bar__desktop-only">
          <Link href="/ag-ui/" className="sidebar__link">
            AG-UI
          </Link>
          <Link href="/a2ui/" className="sidebar__link">
            A2UI
          </Link>
          <Link href="/components/" className="sidebar__link">
            Components
          </Link>
          <Link href="/docs/getting-started/" className="sidebar__link">
            Guides
          </Link>
        </div>
        <Search index={index} />
        <MobileNav groups={groups} />
        <ThemeControls />
        {/* A link is an anchor. `IconButton` renders a native `<button>` by
            contract and deliberately offers no link mode, so navigation uses
            the platform element instead of a button that fakes one. */}
        <a
          className="sidebar__link"
          href={repositoryUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open the repository on GitHub"
          style={{ display: 'grid', placeItems: 'center', inlineSize: '2.5rem', blockSize: '2.5rem' }}
        >
          <Icon source="code" />
        </a>
      </nav>
    </header>
  )
}
