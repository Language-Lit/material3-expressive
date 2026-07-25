import { createRef } from 'react'
import { Carousel } from '../../../src/components/Carousel'
import type {
  CarouselItem,
  CarouselLayout,
  CarouselProps,
  CarouselScroll,
  MultiAspectCarouselItem,
} from '../../../src/components/Carousel'

const ref = createRef<HTMLDivElement>()

const layout: CarouselLayout = 'centeredHero'
const scroll: CarouselScroll = 'free'
const item: CarouselItem = { key: 'a', content: 'A' }
const aspectItem: MultiAspectCarouselItem = { key: 'a', content: 'A', aspectRatio: 16 / 9 }
const props: CarouselProps = { items: [item], preferredItemWidth: 186 }
void layout
void scroll
void props

const items: CarouselItem[] = [
  { key: 'a', content: 'A' },
  { key: 'b', label: 'B', content: 'B', onActivate: () => {} },
  { key: 'c', label: 'C', content: 'C', href: '/c', disabled: true },
]

;<Carousel items={items} preferredItemWidth={186} />
;<Carousel items={items} preferredItemWidth={186} ref={ref} aria-label="Photos" />
;<Carousel
  layout="multiBrowse"
  items={items}
  preferredItemWidth={186}
  minSmallItemWidth={40}
  maxSmallItemWidth={56}
  itemSpacing={8}
  scroll="snap"
/>
;<Carousel layout="uncontained" items={items} itemWidth={200} scroll="free" />
;<Carousel layout="multiAspect" items={[aspectItem]} />
;<Carousel layout="hero" items={items} maxItemWidth={300} />
;<Carousel layout="centeredHero" items={items} />
;<Carousel layout="fullScreen" items={items} />
;<Carousel
  items={items}
  preferredItemWidth={186}
  currentItem={2}
  onCurrentItemChange={(index) => void index}
/>
;<Carousel items={items} preferredItemWidth={186} defaultCurrentItem={2} />

// @ts-expect-error the layout is a closed union
;<Carousel layout="carded" items={items} />

// @ts-expect-error the scroll mode is a closed union
;<Carousel items={items} preferredItemWidth={186} scroll="momentum" />

// @ts-expect-error the multi-browse layout requires its preferred item width
;<Carousel items={items} />

// @ts-expect-error the uncontained layout requires its item width
;<Carousel layout="uncontained" items={items} />

// @ts-expect-error `preferredItemWidth` belongs to the multi-browse layout alone
;<Carousel layout="uncontained" items={items} itemWidth={200} preferredItemWidth={186} />

// @ts-expect-error `maxItemWidth` belongs to the hero layouts alone
;<Carousel items={items} preferredItemWidth={186} maxItemWidth={300} />

// @ts-expect-error `itemWidth` belongs to the uncontained layout alone
;<Carousel layout="hero" items={items} itemWidth={200} />

// @ts-expect-error an aspect ratio only exists in the multi-aspect layout
;<Carousel items={[{ key: 'a', content: 'A', aspectRatio: 1 }]} preferredItemWidth={186} />

// @ts-expect-error the multi-aspect layout requires every item to declare a ratio
;<Carousel layout="multiAspect" items={[{ key: 'a', content: 'A' }]} />

// @ts-expect-error items are a list, not a count
;<Carousel items={3} preferredItemWidth={186} />

// @ts-expect-error the focal item is an index, not a key
;<Carousel items={items} preferredItemWidth={186} currentItem="b" />

// @ts-expect-error the role is fixed, so the carousel pattern is guaranteed
;<Carousel items={items} preferredItemWidth={186} role="listbox" />

// @ts-expect-error the carousel takes no children; content lives on its items
;<Carousel items={items} preferredItemWidth={186}>
  <span />
</Carousel>
