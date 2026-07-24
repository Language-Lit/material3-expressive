import { createRef } from 'react'
import { BottomSheet } from '../../../src/components/BottomSheet'
import type {
  BottomSheetProps,
  BottomSheetState,
  BottomSheetVariant,
} from '../../../src/components/BottomSheet'

const ref = createRef<HTMLElement>()

const state: BottomSheetState = 'partiallyExpanded'
const variant: BottomSheetVariant = 'standard'
const props: BottomSheetProps = { 'aria-label': 'Details' }
void state
void variant
void props

;<BottomSheet aria-label="Details" />
;<BottomSheet aria-label="Details" ref={ref} />
;<BottomSheet aria-labelledby="title" />
;<BottomSheet aria-label="Details" defaultValue="expanded" />
;<BottomSheet aria-label="Details" value="hidden" onValueChange={() => {}} />
;<BottomSheet aria-label="Details" confirmValueChange={(next) => next !== 'hidden'} />
;<BottomSheet aria-label="Details" dragHandle={false} gesturesEnabled={false} />
;<BottomSheet aria-label="Details" dismissOnEscape={false} dismissOnScrimClick={false} />
;<BottomSheet aria-label="Details" variant="standard" peekHeight={72} />
;<BottomSheet aria-label="Details" id="sheet" lang="en" className="custom" />
;<BottomSheet aria-label="Details">
  <p>Sheet body</p>
</BottomSheet>

// @ts-expect-error variant is a closed union
;<BottomSheet aria-label="Details" variant="floating" />

// @ts-expect-error the sheet state is a closed union
;<BottomSheet aria-label="Details" defaultValue="collapsed" />

// @ts-expect-error the source has no peek anchor for a modal sheet
;<BottomSheet aria-label="Details" variant="modal" peekHeight={72} />

// @ts-expect-error peekHeight is equally unavailable on the default variant
;<BottomSheet aria-label="Details" peekHeight={72} />

// @ts-expect-error confirmValueChange answers with a boolean, not a state
;<BottomSheet aria-label="Details" confirmValueChange={() => 'expanded'} />

// @ts-expect-error a peek height is a number of pixels, not a CSS length
;<BottomSheet aria-label="Details" variant="standard" peekHeight="72px" />

// @ts-expect-error the drag handle is present or absent, not a mode
;<BottomSheet aria-label="Details" dragHandle="always" />

// @ts-expect-error onValueChange receives a sheet state, not an event
;<BottomSheet aria-label="Details" value="hidden" onValueChange={(e: MouseEvent) => void e} />

/*
 * The root ref is deliberately `HTMLElement`: the rendered root is a
 * `<dialog>` for the modal variant and a `<div>` for the standard one, so no
 * single concrete element type is correct for both. A narrower ref therefore
 * stays assignable, which is a property of the two-variant API rather than a
 * gap in it, and is asserted positively rather than as a rejection.
 */
;<BottomSheet aria-label="Details" ref={createRef<HTMLDialogElement>()} />
