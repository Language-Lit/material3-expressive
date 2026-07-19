'use client'

import {
  defaultTokenSet,
  useResolvedColorMode,
  validateTokenSet,
} from '@language-lit/material3-expressive/v1'

export function ClientSmoke() {
  const mode = useResolvedColorMode()
  return (
    <output>
      Material {defaultTokenSet.metadata.materialVersion}:{' '}
      {validateTokenSet(defaultTokenSet).success ? 'valid' : 'invalid'} ({mode})
    </output>
  )
}
