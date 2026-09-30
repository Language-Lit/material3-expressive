import type { ReactNode } from 'react'
import { buildNavigationGroups } from '../content/navigation'
import { Sidebar } from './Sidebar'
import type { Locale } from '../i18n/locales'

export async function DocsShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const groups = await buildNavigationGroups(locale)
  return (
    <div className="shell">
      <Sidebar groups={groups} />
      <main className="shell__main">{children}</main>
    </div>
  )
}
