'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dialog, Icon, IconButton } from '@language-lit/material3-expressive'
import type { NavigationGroup } from '../content/navigation'
import { useLocale } from '../i18n/useLocale'
import { shellMessages } from '../i18n/messages/shell'

/**
 * Navigation for viewports that cannot show the sidebar.
 *
 * It presents the same groups as the sidebar rather than a reduced set: below
 * 60rem the sidebar is hidden, so without this the component pages would be
 * reachable only through search.
 */
export function MobileNav({ groups }: { groups: NavigationGroup[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const locale = useLocale()

  // Navigating away must close the drawer; the route change alone does not.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <span className="bar__mobile-only">
      <IconButton
        aria-label={shellMessages[locale].mobileNavigationOpen}
        aria-expanded={open}
        variant="standard"
        onClick={() => setOpen(true)}
      >
        <Icon source="menu" />
      </IconButton>

      <Dialog open={open} onOpenChange={setOpen} title={shellMessages[locale].mobileNavigationTitle}>
        <nav aria-label={shellMessages[locale].documentationNav}>
          {groups.map((group) => (
            <div className="sidebar__group" key={group.label}>
              {/* A group label, not a section heading — see `Sidebar`. */}
              <p className="sidebar__title">{group.label}</p>
              <ul className="sidebar__list" aria-label={group.label}>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="sidebar__link"
                      aria-current={pathname === link.href ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </Dialog>
    </span>
  )
}
