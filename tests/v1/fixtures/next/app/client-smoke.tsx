'use client'

import {
  defaultTokenSet,
  validateTokenSet,
} from '@language-lit/material3-expressive/v1'

export function ClientSmoke() {
  return (
    <output>
      Material {defaultTokenSet.metadata.materialVersion}:{' '}
      {validateTokenSet(defaultTokenSet).success ? 'valid' : 'invalid'}
    </output>
  )
}
