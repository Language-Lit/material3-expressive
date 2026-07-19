import type { ReactNode } from 'react'
import '@language-lit/material3-expressive/v1/styles.css'

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
