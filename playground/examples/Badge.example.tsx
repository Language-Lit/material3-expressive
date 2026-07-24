import {
  Badge,
  BadgeAnchor,
  Icon,
  NavigationBar,
  NavigationDrawer,
  Surface,
  Tabs,
  Text,
} from '@language-lit/material3-expressive'

export function BadgeExample() {
  return (
    <Surface
      as="section"
      aria-labelledby="badge-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="badge-example"
    >
      <Text
        as="h2"
        id="badge-example-title"
        variant="titleLarge"
        emphasis="emphasized"
      >
        Badges
      </Text>
      <Text as="p" variant="bodyMedium">
        A dot for "something is new", or a short count. The variant follows the
        content: no children is the small badge, any children is the large one.
      </Text>

      <div className="badge-example__row">
        <BadgeAnchor badge={<Badge label="New activity" />}>
          <Icon source="notifications" />
        </BadgeAnchor>
        <BadgeAnchor badge={<Badge label="3 unread lessons">3</Badge>}>
          <Icon source="school" />
        </BadgeAnchor>
        <BadgeAnchor badge={<Badge label="More than 99 unread">99+</Badge>}>
          <Icon source="mail" />
        </BadgeAnchor>
        <BadgeAnchor badge={<Badge label="999 or more waiting">999+</Badge>}>
          <Icon source="inbox" />
        </BadgeAnchor>
      </div>

      <Text as="p" variant="bodyMedium">
        On navigation destinations, where badges are most often used. The badge
        is announced after its destination.
      </Text>

      <NavigationBar
        className="badge-example__bar"
        items={[
          {
            value: 'lessons',
            label: 'Lessons',
            icon: <Icon source="school" />,
            badge: <Badge label="3 new lessons">3</Badge>,
          },
          {
            value: 'inbox',
            label: 'Inbox',
            icon: <Icon source="inbox" />,
            badge: <Badge label="Unread messages" />,
          },
          { value: 'profile', label: 'Profile', icon: <Icon source="person" /> },
        ]}
      />

      <Tabs
        className="badge-example__tabs"
        items={[
          {
            value: 'all',
            label: 'All',
            icon: <Icon source="list" />,
            badge: <Badge label="12 items">12</Badge>,
          },
          { value: 'saved', label: 'Saved', icon: <Icon source="bookmark" /> },
        ]}
      />

      <Text as="p" variant="bodyMedium">
        A drawer badge is a different affordance in Material: a trailing count in
        the item's own text color, not an anchored pill.
      </Text>

      <NavigationDrawer
        className="badge-example__drawer"
        variant="permanent"
        items={[
          {
            value: 'inbox',
            label: 'Inbox',
            icon: <Icon source="inbox" />,
            badge: '24',
          },
          {
            value: 'spam',
            label: 'Spam',
            icon: <Icon source="report" />,
            badge: '99+',
          },
          { value: 'trash', label: 'Trash', icon: <Icon source="delete" /> },
        ]}
      />
    </Surface>
  )
}
