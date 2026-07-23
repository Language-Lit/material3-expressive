import { createRef } from 'react'
import {
  ListItem,
  SegmentedListItem,
  type ListItemInteraction,
  type ListItemProps,
} from '../../../src/components/ListItem'

const interaction: ListItemInteraction = 'action'
const passiveRef = createRef<HTMLDivElement>()
const listRef = createRef<HTMLLIElement>()
const buttonRef = createRef<HTMLButtonElement>()
const inputRef = createRef<HTMLInputElement>()

;<ListItem ref={passiveRef} headline="Passive" />
;<ListItem ref={listRef} as="li" headline="List child" />
;<ListItem ref={buttonRef} interaction={interaction} headline="Action" />
;<ListItem
  ref={inputRef}
  interaction="single"
  name="lesson"
  value="grammar"
  headline="Radio"
  selected
  onSelectedChange={() => undefined}
/>
;<ListItem interaction="multiple" headline="Checkbox" defaultChecked />
;<SegmentedListItem interaction="action" index={0} count={3} headline="First" />

const validProps: ListItemProps = {
  interaction: 'single',
  name: 'lesson',
  value: 'listening',
  headline: 'Listening',
  defaultSelected: true,
}
;<ListItem {...validProps} />

// @ts-expect-error controlled single selection requires its state callback
;<ListItem interaction="single" name="lesson" value="one" headline="One" selected />
// @ts-expect-error radio mode requires a native group name
;<ListItem interaction="single" value="one" headline="One" />
// @ts-expect-error radio mode requires a native submitted value
;<ListItem interaction="single" name="lesson" headline="One" />
// @ts-expect-error selected state belongs only to single selection
;<ListItem interaction="action" headline="Action" selected />
// @ts-expect-error checked state belongs only to multiple selection
;<ListItem interaction="single" name="x" value="x" headline="Wrong" checked />
// @ts-expect-error controlled and uncontrolled radio state cannot be mixed
;<ListItem interaction="single" name="x" value="x" headline="Mixed" selected defaultSelected onSelectedChange={() => undefined} />
// @ts-expect-error controlled checkbox state requires its state callback
;<ListItem interaction="multiple" headline="Controlled" checked />
// @ts-expect-error passive rows do not accept activation handlers
;<ListItem headline="Passive" onClick={() => undefined} />
// @ts-expect-error interactive rows own their native element
;<ListItem interaction="action" as="li" headline="Action" />
// @ts-expect-error segmented rows require index
;<SegmentedListItem interaction="action" count={2} headline="Missing index" />
// @ts-expect-error segmented rows require count
;<SegmentedListItem interaction="action" index={0} headline="Missing count" />
