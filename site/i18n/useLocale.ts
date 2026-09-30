'use client'

import { usePathname } from 'next/navigation'
import { parseLocalePath, type Locale } from './locales'

/** The current page's locale, read from its URL prefix. */
export function useLocale(): Locale {
  return parseLocalePath(usePathname() ?? '/').locale
}
