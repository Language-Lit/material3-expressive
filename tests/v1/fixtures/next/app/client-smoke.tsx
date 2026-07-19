'use client'

import {
  Surface,
  Text,
  defaultTokenSet,
  useResolvedColorMode,
  validateTokenSet,
} from '@language-lit/material3-expressive/v1'
import { useRef } from 'react'

export function ClientSmoke() {
  const mode = useResolvedColorMode()
  const surfaceRef = useRef<HTMLElementTagNameMap['article'] | null>(null)
  const textRef = useRef<HTMLParagraphElement | null>(null)
  return (
    <Surface as="article" ref={surfaceRef} color="surface-container" shape="medium">
      <Text as="p" ref={textRef} variant="bodyMedium">
        <output>
          Material {defaultTokenSet.metadata.materialVersion}:{' '}
          {validateTokenSet(defaultTokenSet).success ? 'valid' : 'invalid'} ({mode})
        </output>
      </Text>
    </Surface>
  )
}
