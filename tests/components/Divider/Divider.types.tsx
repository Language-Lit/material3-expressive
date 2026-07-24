import { createRef } from 'react'
import { Divider } from '../../../src/components/Divider'

const hrRef = createRef<HTMLHRElement>()
const liRef = createRef<HTMLLIElement>()
const divRef = createRef<HTMLDivElement>()

;<Divider />
;<Divider ref={hrRef} />
;<Divider orientation="vertical" />
;<Divider decorative />
;<Divider as="li" ref={liRef} />
;<Divider as="div" ref={divRef} orientation="vertical" decorative />
;<Divider aria-label="End of results" id="rule" />

// @ts-expect-error orientation is a closed union
;<Divider orientation="diagonal" />

// @ts-expect-error only hr, div, and li can own divider styling
;<Divider as="span" />

// @ts-expect-error a divider is an empty line and renders no children
;<Divider>
  <span />
</Divider>

// @ts-expect-error the ref must match the rendered element
;<Divider as="li" ref={divRef} />

// @ts-expect-error decorative is a boolean flag, not a role name
;<Divider decorative="none" />
