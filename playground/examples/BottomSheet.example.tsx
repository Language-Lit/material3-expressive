import { useState } from 'react'
import {
  BottomSheet,
  Button,
  Divider,
  ListItem,
  Surface,
  Text,
  type BottomSheetState,
} from '@language-lit/material3-expressive'

export function BottomSheetExample() {
  const [modalValue, setModalValue] = useState<BottomSheetState>('hidden')
  const [standardValue, setStandardValue] = useState<BottomSheetState>('partiallyExpanded')

  return (
    <Surface
      as="section"
      aria-labelledby="bottom-sheet-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="bottom-sheet-example"
    >
      <Text
        as="h2"
        id="bottom-sheet-example-title"
        variant="titleLarge"
        emphasis="emphasized"
      >
        Bottom sheets
      </Text>
      <Text as="p" variant="bodyMedium">
        A modal sheet takes the top layer with a scrim and a native focus trap; a
        standard sheet docks inline and leaves the page live. The drag handle is
        a button, so Space and Enter move between heights without a pointer.
      </Text>

      <div className="bottom-sheet-example__actions">
        <Button onClick={() => setModalValue('partiallyExpanded')}>
          Open modal sheet
        </Button>
        <Button
          variant="outlined"
          onClick={() =>
            setStandardValue(
              standardValue === 'expanded' ? 'partiallyExpanded' : 'expanded',
            )
          }
        >
          Toggle standard sheet
        </Button>
      </div>

      <BottomSheet
        aria-label="Lesson actions"
        value={modalValue}
        onValueChange={setModalValue}
      >
        <div className="bottom-sheet-example__content">
          <Text as="h3" variant="titleMedium">
            Lesson actions
          </Text>
          <ul className="bottom-sheet-example__list">
            <ListItem as="li" headline="Add to favourites" />
            <Divider as="li" />
            <ListItem as="li" headline="Share lesson" />
            <Divider as="li" />
            <ListItem as="li" headline="Download for offline" />
          </ul>
        </div>
      </BottomSheet>

      <div className="bottom-sheet-example__dock">
        <Text as="p" variant="bodySmall">
          Page content stays interactive behind a standard sheet.
        </Text>
        <BottomSheet
          aria-label="Now playing"
          variant="standard"
          peekHeight={72}
          value={standardValue}
          onValueChange={setStandardValue}
        >
          <div className="bottom-sheet-example__content">
            <Text as="h3" variant="titleMedium">
              Unit 4 · Listening
            </Text>
            <Text as="p" variant="bodyMedium">
              Expand the sheet for the transcript, notes, and playback speed.
            </Text>
          </div>
        </BottomSheet>
      </div>
    </Surface>
  )
}
