import React from 'react'
import { Carousel } from '../components/display/Carousel'

const testItems = [
  'https://picsum.photos/400/300?random=1',
  'https://picsum.photos/400/300?random=2',
  'https://picsum.photos/400/300?random=3',
  'https://picsum.photos/400/300?random=4',
  'https://picsum.photos/400/300?random=5',
]

export const CarouselShowcase = () => {
  return (
    <div>
      <Carousel items={testItems} />
    </div>
  )
}
