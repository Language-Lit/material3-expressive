'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from '../i18n/useLocale'
import { shellMessages } from '../i18n/messages/shell'

export interface SidebarGroup {
  label: string
  links: { label: string; href: string }[]
}

export function Sidebar({ groups }: { groups: SidebarGroup[] }) {
  const pathname = usePathname()
  const t = shellMessages[useLocale()]

  return (
    <nav className="sidebar" aria-label={t.documentationNav}>
      {groups.map((group) => (
        <div className="sidebar__group" key={group.label}>
          {/*
           * A group label, not a section heading. As an `h2` it entered the
           * document outline ahead of the page's own `h1` — nine of them, on
           * every route — so anything reading the page by its headings met
           * "Guides, Overview, Foundations…" before it met the subject. The
           * label is carried on the list instead, which keeps the accessible
           * name without claiming to start a section.
           */}
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
  )
}
