import { useState } from 'react'
import { Button, Icon, NavigationDrawer, Surface, Text } from '@language-lit/material3-expressive/v1'

const items = [
  { value: 'inbox', label: 'Inbox', icon: <Icon source="inbox" /> },
  { value: 'sent', label: 'Sent', icon: <Icon source="send" /> },
  { value: 'trash', label: 'Trash', icon: <Icon source="delete" />, disabled: true },
]

export function NavigationDrawerExample() {
  const [dismissibleOpen, setDismissibleOpen] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <Surface
      as="section"
      aria-labelledby="navigation-drawer-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="navigation-drawer-example"
    >
      <Text as="h2" id="navigation-drawer-example-title" variant="titleLarge" emphasis="emphasized">
        Navigation drawer
      </Text>
      <Text as="p" variant="bodyMedium">
        Modal (native dialog, slides from the edge), dismissible (collapses
        in place), and permanent (always visible) variants.
      </Text>

      <div className="navigation-drawer-example__row">
        <Button variant="outlined" onClick={() => setDismissibleOpen((open) => !open)}>
          Toggle dismissible drawer
        </Button>
        <Button variant="outlined" onClick={() => setModalOpen(true)}>
          Open modal drawer
        </Button>
      </div>

      <div className="navigation-drawer-example__frame">
        <NavigationDrawer
          aria-label="Dismissible example"
          variant="dismissible"
          open={dismissibleOpen}
          onOpenChange={setDismissibleOpen}
          items={items}
        />
        <NavigationDrawer aria-label="Permanent example" variant="permanent" items={items} />
      </div>

      <NavigationDrawer
        aria-label="Modal example"
        variant="modal"
        open={modalOpen}
        onOpenChange={setModalOpen}
        items={items}
      />
    </Surface>
  )
}
