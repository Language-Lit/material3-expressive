import type { ReactNode } from 'react'
import RootLayout, { rootMetadata } from '../../views/RootLayout'

export const metadata = rootMetadata('en')

export default function Layout({ children }: { children: ReactNode }) {
  return <RootLayout locale="en">{children}</RootLayout>
}
