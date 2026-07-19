'use client'

import {
  Surface,
  defaultTokenSet,
  useResolvedColorMode,
  validateTokenSet,
} from '@language-lit/material3-expressive/v1'
import { useRef } from 'react'

export function ClientSmoke() {
  const mode = useResolvedColorMode()
  const surfaceRef = useRef<HTMLElementTagNameMap['article'] | null>(null)
  return (
    <Surface as="article" ref={surfaceRef} color="surface-container" shape="medium">
      <output>
        Material {defaultTokenSet.metadata.materialVersion}:{' '}
        {validateTokenSet(defaultTokenSet).success ? 'valid' : 'invalid'} ({mode})
      </output>
    </Surface>
  )
}
