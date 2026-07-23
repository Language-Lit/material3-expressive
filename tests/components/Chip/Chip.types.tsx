import { createRef } from 'react'
import { Chip } from '../../../src/components/Chip'

const buttonRef = createRef<HTMLButtonElement>()

;<Chip kind="assist" ref={buttonRef} variant="elevated">Assist</Chip>
;<Chip kind="suggestion" leadingIcon={<span />} variant="flat">Suggestion</Chip>
;<Chip kind="filter" selected onSelectedChange={() => undefined}>Controlled</Chip>
;<Chip kind="filter" defaultSelected shape="expressive" variant="elevated">
  Uncontrolled
</Chip>
;<Chip kind="input" avatar={<span />} trailingIcon={<span />} shape="expressive">
  Input
</Chip>

// @ts-expect-error kind is required so the purpose and state model are explicit
;<Chip>Missing kind</Chip>

// @ts-expect-error input chips have no elevated source treatment
;<Chip kind="input" variant="elevated">Invalid input elevation</Chip>

// @ts-expect-error assist chips are momentary and cannot be selected
;<Chip kind="assist" selected>Invalid assist selection</Chip>

// @ts-expect-error suggestion chips are momentary and cannot have default selection
;<Chip kind="suggestion" defaultSelected>Invalid suggestion selection</Chip>

// @ts-expect-error controlled selectable chips require a change callback
;<Chip kind="filter" selected>Missing controlled callback</Chip>

// @ts-expect-error controlled and uncontrolled selection cannot be mixed
;<Chip kind="filter" selected defaultSelected onSelectedChange={() => undefined}>
  Mixed selection
</Chip>

// @ts-expect-error suggestion chips expose no trailing slot in the source
;<Chip kind="suggestion" trailingIcon={<span />}>Invalid trailing slot</Chip>

// @ts-expect-error only input chips expose the avatar slot
;<Chip kind="filter" avatar={<span />}>Invalid avatar</Chip>

// @ts-expect-error expressive shape overloads exist only for selectable filter/input chips
;<Chip kind="assist" shape="expressive">Invalid shape</Chip>
