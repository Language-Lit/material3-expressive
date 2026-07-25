import { useMemo, useState, type ReactNode } from 'react'
import {
  Button,
  Carousel,
  Surface,
  Text,
  type CarouselItem,
  type CarouselLayout,
  type MultiAspectCarouselItem,
} from '@language-lit/material3-expressive'

/**
 * Deterministic gradient covers, so the example needs no network asset and the
 * rendering audit measures the same pixels on every run.
 */
const albums = [
  { title: 'Coastal Static', year: '2019', hue: 210 },
  { title: 'Long Exposure', year: '2020', hue: 268 },
  { title: 'Harbour Lights', year: '2020', hue: 330 },
  { title: 'Night Ferry', year: '2021', hue: 18 },
  { title: 'Second Summer', year: '2021', hue: 46 },
  { title: 'Low Tide', year: '2022', hue: 150 },
  { title: 'Signal Hill', year: '2022', hue: 188 },
  { title: 'Winter Sessions', year: '2023', hue: 240 },
  { title: 'Open Water', year: '2023', hue: 300 },
  { title: 'Last Train', year: '2024', hue: 8 },
] as const

const ratios = [16 / 9, 1, 9 / 16, 4 / 3, 3 / 4, 16 / 9, 1, 9 / 16] as const

function cover(hue: number) {
  return `linear-gradient(140deg, hsl(${hue} 62% 46%), hsl(${(hue + 42) % 360} 58% 30%))`
}

/**
 * The specification's adaptive-content rule: the large item shows its title, the
 * medium item hides it, and the small item abbreviates the label. Both spans are
 * marked so the stylesheet withdraws them at the right widths.
 */
function AlbumContent({ title, year, hue }: { title: string; year: string; hue: number }) {
  return (
    <div className="carousel-example__cover" style={{ backgroundImage: cover(hue) }}>
      <div className="carousel-example__caption">
        <span data-m3e-carousel-hide="medium">{title}</span>
        <span data-m3e-carousel-hide="small">{year}</span>
      </div>
    </div>
  )
}

const albumItems = (onActivate: (title: string) => void): CarouselItem[] =>
  albums.map((album) => ({
    key: album.title,
    label: album.title,
    content: <AlbumContent {...album} />,
    onActivate: () => onActivate(album.title),
  }))

const aspectItems: MultiAspectCarouselItem[] = ratios.map((ratio, index) => ({
  key: `ratio-${index}`,
  label: `Clip ${index + 1}`,
  aspectRatio: ratio,
  content: (
    <div
      className="carousel-example__cover"
      style={{ backgroundImage: cover(albums[index % albums.length]!.hue) }}
    />
  ),
}))

function Row({
  id,
  label,
  description,
  children,
}: {
  id: CarouselLayout | 'showAll'
  label: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="carousel-example__row">
      <Text as="h3" variant="titleSmall" id={`carousel-example-${id}`}>
        {label}
      </Text>
      {description === undefined ? null : (
        <Text as="p" variant="bodySmall">
          {description}
        </Text>
      )}
      {children}
    </div>
  )
}

export function CarouselExample() {
  const [opened, setOpened] = useState<string | null>(null)
  const [current, setCurrent] = useState(0)
  const items = useMemo(() => albumItems(setOpened), [])

  return (
    <Surface
      as="section"
      aria-labelledby="carousel-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="carousel-example"
    >
      <Text as="h2" id="carousel-example-title" variant="titleLarge" emphasis="emphasized">
        Carousel
      </Text>
      <Text as="p" variant="bodyMedium">
        Items change size as they move through the container, and their captions
        adapt with them: the large item shows its title and year, the medium item
        drops the title, the small item shows neither. Scroll each row, or use the
        arrow keys, Home, and End.
      </Text>

      <Row id="multiBrowse" label="Multi-browse">
        <Carousel
          aria-labelledby="carousel-example-multiBrowse"
          data-example-layout="multiBrowse"
          preferredItemWidth={186}
          items={items}
        />
      </Row>

      <Row id="hero" label="Hero">
        <Carousel
          aria-labelledby="carousel-example-hero"
          data-example-layout="hero"
          layout="hero"
          maxItemWidth={320}
          items={items}
        />
      </Row>

      <Row id="centeredHero" label="Center-aligned hero">
        <Carousel
          aria-labelledby="carousel-example-centeredHero"
          data-example-layout="centeredHero"
          layout="centeredHero"
          items={items}
        />
      </Row>

      <Row id="uncontained" label="Uncontained">
        <Carousel
          aria-labelledby="carousel-example-uncontained"
          data-example-layout="uncontained"
          layout="uncontained"
          itemWidth={220}
          items={items}
        />
      </Row>

      <Row id="multiAspect" label="Uncontained multi-aspect ratio">
        <Carousel
          aria-labelledby="carousel-example-multiAspect"
          data-example-layout="multiAspect"
          layout="multiAspect"
          items={aspectItems}
        />
      </Row>

      <Row
        id="fullScreen"
        label="Full-screen"
        description="One edge-to-edge item that scrolls vertically, snapping to each in turn."
      >
        <Carousel
          aria-labelledby="carousel-example-fullScreen"
          data-example-layout="fullScreen"
          className="carousel-example__full-screen"
          layout="fullScreen"
          items={items}
          currentItem={current}
          onCurrentItemChange={setCurrent}
        />
        <Text as="p" variant="bodySmall">
          Showing item {current + 1} of {items.length}.
        </Text>
      </Row>

      <Row
        id="showAll"
        label="Show all"
        description={
          'On a vertically scrolling page a carousel needs a route to every item that ' +
          'does not involve scrolling sideways. Material asks for a Show all button ' +
          'below it \u2014 a composition, not a prop.'
        }
      >
        <Carousel
          aria-labelledby="carousel-example-showAll"
          data-example-layout="showAll"
          preferredItemWidth={186}
          items={items}
        />
        <Button variant="text" onClick={() => setOpened('all albums')}>
          Show all
        </Button>
      </Row>

      <Text as="p" variant="bodySmall" aria-live="polite">
        {opened === null ? 'Activate an item to see it reported here.' : `Opened ${opened}.`}
      </Text>
    </Surface>
  )
}
