'use client'

import {
  Button,
  Card,
  Checkbox,
  FloatingActionButton,
  Icon,
  IconButton,
  Radio,
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
  const cardRef = useRef<HTMLElementTagNameMap['article'] | null>(null)
  const cardButtonRef = useRef<HTMLButtonElement | null>(null)
  const checkboxRef = useRef<HTMLInputElement | null>(null)
  const radioRef = useRef<HTMLInputElement | null>(null)
  const iconButtonRef = useRef<HTMLButtonElement | null>(null)
  const fabRef = useRef<HTMLButtonElement | null>(null)
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
      <Card ref={cardRef} variant="filled">
        <Text as="h2" variant="titleMedium">Fixture card</Text>
        <Text as="p" variant="bodySmall">Passive rich content</Text>
      </Card>
      <Card
        interactive
        ref={cardButtonRef}
        variant="outlined"
        onClick={() => cardButtonRef.current?.setAttribute('data-activated', 'true')}
      >
        <span>Open fixture card</span>
      </Card>
      <label>
        <Checkbox
          ref={checkboxRef}
          name="fixture-preferences"
          value="mixed"
          indeterminate
          defaultChecked={false}
          onCheckedChange={(checked) =>
            checkboxRef.current?.setAttribute('data-fixture-checked', String(checked))
          }
        />
        Fixture checkbox
      </label>
      <label>
        <Radio
          ref={radioRef}
          name="fixture-plan"
          value="pro"
          defaultChecked
          onCheckedChange={(checked) =>
            radioRef.current?.setAttribute('data-fixture-checked', String(checked))
          }
        />
        Fixture radio
      </label>
      <IconButton
        ref={iconButtonRef}
        aria-label="Favorite"
        variant="outlined"
        toggle
        defaultSelected
        selectedIcon={<Icon source="favorite" fill={1} />}
        onSelectedChange={(selected) =>
          iconButtonRef.current?.setAttribute('data-fixture-selected', String(selected))
        }
      >
        <Icon source="favorite" />
      </IconButton>
      <FloatingActionButton
        ref={fabRef}
        aria-label="Creation actions"
        icon={<Icon source="add" />}
        selectedIcon={<Icon source="close" />}
        size="medium"
        toggle
        defaultSelected
        onSelectedChange={(selected) =>
          fabRef.current?.setAttribute('data-fixture-selected', String(selected))
        }
      />
    </Surface>
  )
}
