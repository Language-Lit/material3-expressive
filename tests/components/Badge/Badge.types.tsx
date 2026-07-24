import { createRef } from 'react'
import { Badge, BadgeAnchor } from '../../../src/components/Badge'
import { NavigationBar } from '../../../src/components/NavigationBar'
import { Tabs } from '../../../src/components/Tabs'

const spanRef = createRef<HTMLSpanElement>()

;<Badge />
;<Badge label="New notifications" />
;<Badge>3</Badge>
;<Badge label="3 unread">{3}</Badge>
;<Badge ref={spanRef} className="count" id="badge" />
;<BadgeAnchor badge={<Badge />}>icon</BadgeAnchor>
;<BadgeAnchor ref={spanRef} badge={<Badge>9</Badge>}>
  <span>icon</span>
</BadgeAnchor>
;<BadgeAnchor>icon</BadgeAnchor>

// The badge slot accepts any node, since the drawer's badge is plain text.
;<NavigationBar items={[{ value: 'a', label: 'A', icon: <span />, badge: '24' }]} />
;<NavigationBar items={[{ value: 'a', label: 'A', icon: <span />, badge: <Badge /> }]} />
;<Tabs items={[{ value: 'a', label: 'A', badge: <Badge>2</Badge> }]} />

// @ts-expect-error the accessible label is text, not arbitrary markup
;<Badge label={<span>3 unread</span>} />

// A mismatched element ref is deliberately not asserted here. `HTMLSpanElement`
// declares no members beyond `HTMLElement`, so every element interface is
// structurally assignable to it and TypeScript cannot reject one. The ref is
// covered by the runtime test that it receives an `HTMLSpanElement` instead.

// @ts-expect-error the accessible label is a string, not a count
;<Badge label={3}>3</Badge>

// @ts-expect-error the anchor's badge is a node, not a render callback
;<BadgeAnchor badge={() => <Badge />}>icon</BadgeAnchor>

// @ts-expect-error an item badge is a node. A boolean would not be rejected —
// `ReactNode` admits one, and React renders it as nothing — but a plain object
// is not renderable.
;<NavigationBar items={[{ value: 'a', label: 'A', icon: <span />, badge: { count: 3 } }]} />
