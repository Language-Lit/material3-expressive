import { defaultTokenSet } from '@language-lit/material3-expressive/v1'
import { ClientSmoke } from './client-smoke'

export default function Page() {
  return (
    <main>
      <h1>Material 3 Expressive React v1 SSR fixture</h1>
      <p>Material token version {defaultTokenSet.metadata.materialVersion}</p>
      <ClientSmoke />
    </main>
  )
}
