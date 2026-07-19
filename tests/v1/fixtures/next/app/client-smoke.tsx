'use client'

import {
  Button,
  Icon,
  Surface,
  Text,
  defaultTokenSet,
  useResolvedColorMode,
  validateTokenSet,
  type IconSourceProps,
} from '@language-lit/material3-expressive/v1'
import { useRef } from 'react'

function ClientMark(props: IconSourceProps) {
  return (
    <svg {...props} viewBox="0 0 24 24">
      <path d="M4 4h16v16H4Z" />
    </svg>
  )
}

export function ClientSmoke() {
  const mode = useResolvedColorMode()
  const surfaceRef = useRef<HTMLElementTagNameMap['article'] | null>(null)
  const textRef = useRef<HTMLParagraphElement | null>(null)
  const iconRef = useRef<HTMLSpanElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  return (
    <Surface as="article" ref={surfaceRef} color="surface-container" shape="medium">
      <Text as="p" ref={textRef} variant="bodyMedium">
        <output>
          Material {defaultTokenSet.metadata.materialVersion}:{' '}
          {validateTokenSet(defaultTokenSet).success ? 'valid' : 'invalid'} ({mode})
        </output>
      </Text>
      <Icon
        ref={iconRef}
        source={ClientMark}
      />
      <Button
        ref={buttonRef}
        variant="tonal"
        size="medium"
        leadingIcon={<Icon source="add" />}
        onClick={() => buttonRef.current?.setAttribute('data-activated', 'true')}
      >
        Client action
      </Button>
    </Surface>
  )
}
