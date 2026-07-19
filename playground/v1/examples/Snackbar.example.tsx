import { useState } from 'react'
import { Button, Snackbar, Surface, Text } from '@language-lit/material3-expressive/v1'

export function SnackbarExample() {
  const [savedOpen, setSavedOpen] = useState(false)
  const [removedOpen, setRemovedOpen] = useState(false)

  return (
    <Surface
      as="section"
      aria-labelledby="snackbar-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="snackbar-example"
    >
      <Text as="h2" id="snackbar-example-title" variant="titleLarge" emphasis="emphasized">
        Snackbar
      </Text>
      <Text as="p" variant="bodyMedium">
        Transient status feedback that auto-dismisses unless it carries an
        action, and pauses its countdown while hovered or focused.
      </Text>

      <div className="snackbar-example__row">
        <Button variant="outlined" onClick={() => setSavedOpen(true)}>
          Show short snackbar
        </Button>
        <Button variant="outlined" onClick={() => setRemovedOpen(true)}>
          Show snackbar with action
        </Button>
      </div>

      <Snackbar message="Saved" open={savedOpen} onOpenChange={setSavedOpen} dismissible />
      <Snackbar
        message="Conversation removed"
        action={{ label: 'Undo', onClick: () => setRemovedOpen(false) }}
        open={removedOpen}
        onOpenChange={setRemovedOpen}
      />
    </Surface>
  )
}
