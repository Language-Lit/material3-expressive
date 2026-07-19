import { Material3Provider } from '@language-lit/material3-expressive/v1'
import { createTheme } from '@language-lit/material3-expressive/v1/theme'
import { ClientSmoke } from './client-smoke'

const serverTheme = createTheme({ density: { scale: -1 } })

export default function Page() {
  return (
    <Material3Provider theme={serverTheme} colorMode="system" systemModeFallback="light">
      <main>
        <h1>Material 3 Expressive React v1 SSR fixture</h1>
        <ClientSmoke />
      </main>
    </Material3Provider>
  )
}
