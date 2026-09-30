import type { ReactNode } from 'react'
import RootLayout, { rootMetadata } from '../../views/RootLayout'

export const metadata = rootMetadata('ja')

export default function Layout({ children }: { children: ReactNode }) {
  return <RootLayout locale="ja">{children}</RootLayout>
}
