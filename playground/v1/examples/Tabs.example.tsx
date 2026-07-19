import { Icon, Surface, Tabs, Text } from '@language-lit/material3-expressive/v1'

export function TabsExample() {
  return (
    <Surface
      as="section"
      aria-labelledby="tabs-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="tabs-example"
    >
      <Text as="h2" id="tabs-example-title" variant="titleLarge" emphasis="emphasized">
        Tabs
      </Text>
      <Text as="p" variant="bodyMedium">
        Roving-focus tabs with a sliding indicator, icon+label rows, and
        panels switched in place.
      </Text>

      <Tabs
        aria-label="Library sections"
        items={[
          {
            value: 'photos',
            label: 'Photos',
            icon: <Icon source="photo" />,
            panel: <Text as="p" variant="bodyMedium">Your photo library.</Text>,
          },
          {
            value: 'shared',
            label: 'Shared',
            icon: <Icon source="folder_shared" />,
            panel: <Text as="p" variant="bodyMedium">Albums shared with you.</Text>,
          },
          {
            value: 'trash',
            label: 'Trash',
            icon: <Icon source="delete" />,
            disabled: true,
            panel: <Text as="p" variant="bodyMedium">Recently deleted items.</Text>,
          },
        ]}
      />

      <Tabs
        aria-label="Secondary section"
        variant="secondary"
        defaultValue="overview"
        items={[
          { value: 'overview', label: 'Overview' },
          { value: 'activity', label: 'Activity' },
          { value: 'settings', label: 'Settings' },
        ]}
      />
    </Surface>
  )
}
