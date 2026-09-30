'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@language-lit/material3-expressive'
import type { SearchEntry } from '../content/search'
import type { NavigationGroup } from '../content/navigation'
import { MobileNav } from './MobileNav'
import { BrandMark } from './Ramp'
import { Search } from './Search'
import { ThemeControls } from './ThemeControls'
import { localeNames, localizePath, locales, parseLocalePath } from '../i18n/locales'
import { useLocale } from '../i18n/useLocale'
import { shellMessages } from '../i18n/messages/shell'

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
  const locale = useLocale()
  const t = shellMessages[locale]
  const { path } = parseLocalePath(usePathname() ?? '/')
  const href = (pathname: string) => localizePath(locale, pathname)

  return (
    <header className="bar">
      <Link href={href('/')} className="bar__brand">
        <BrandMark />
        <span className="bar__name">Material 3 Expressive</span>
        <span className="bar__version">v{version}</span>
      </Link>

      <nav className="bar__actions" aria-label={t.siteNav}>
        {/* `display: contents` belongs in the stylesheet, not here: as an inline
            style it outranked the media query that hides this group, so these
            links stayed on screen below 60rem and overlapped the wordmark. */}
        <div className="bar__desktop-only">
          <Link href={href('/ag-ui/')} className="sidebar__link">
            AG-UI
          </Link>
          <Link href={href('/a2ui/')} className="sidebar__link">
            A2UI
          </Link>
          <Link href={href('/mcp-apps/')} className="sidebar__link">MCP Apps</Link>
          <Link href={href('/components/')} className="sidebar__link">
            {t.components}
          </Link>
          <Link href={href('/docs/getting-started/')} className="sidebar__link">
            {t.guides}
          </Link>
        </div>
        <Search index={index} />
        {/* Each language names itself, so a reader who cannot read the
            current page can still find their own. A plain anchor: the two
            languages have separate root layouts, so the switch is a full load. */}
        <span className="bar__languages" aria-label={t.languageSwitch} role="group">
          {locales
            .filter((each) => each !== locale)
            .map((each) => (
              <a key={each} href={localizePath(each, path)} hrefLang={each} lang={each} className="sidebar__link">
                {localeNames[each]}
              </a>
            ))}
        </span>
        <MobileNav groups={groups} />
        <ThemeControls />
        {/* A link is an anchor. `IconButton` renders a native `<button>` by
            contract and deliberately offers no link mode, so navigation uses
            the platform element instead of a button that fakes one.

            `bar__icon-link` carries the icon-button metrics: `sidebar__link` is
            sized for text, and its inline padding pushed this symbol off the
            centre of its own hover shape. */}
        <a
          className="bar__icon-link"
          href={repositoryUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={t.openRepository}
        >
          <Icon source="code" />
        </a>
      </nav>
    </header>
  )
}
