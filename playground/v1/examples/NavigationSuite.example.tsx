import { Icon, NavigationSuite, Surface, Text } from '@language-lit/material3-expressive/v1'

export function NavigationSuiteExample() {
  return (
    <Surface
      as="section"
      aria-labelledby="navigation-suite-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="navigation-suite-example"
    >
      <Text as="h2" id="navigation-suite-example-title" variant="titleLarge" emphasis="emphasized">
        Navigation suite
      </Text>
      <Text as="p" variant="bodyMedium">
        Adaptive: renders Navigation bar below 600px, Navigation rail from
        600–839px, and a permanent Navigation drawer at 840px and up. Resize
        the window to see it switch live.
      </Text>

      <div className="navigation-suite-example__frame">
        <NavigationSuite
          aria-label="Example sections"
          items={[
            { value: 'home', label: 'Home', icon: <Icon source="home" /> },
            { value: 'favorites', label: 'Favorites', icon: <Icon source="favorite" /> },
            { value: 'settings', label: 'Settings', icon: <Icon source="settings" /> },
          ]}
        />
      </div>
    </Surface>
  )
}
