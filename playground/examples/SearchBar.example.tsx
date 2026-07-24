import { useMemo, useRef, useState } from 'react'
import {
  Icon,
  IconButton,
  ListItem,
  SearchAppBar,
  SearchBar,
  Surface,
  Text,
} from '@language-lit/material3-expressive'

const inbox = [
  'Invoice 4821 — Northwind',
  'Invoice 4822 — Contoso',
  'Receipts, March',
  'Receipts, April',
  'Trip itinerary, Lisbon',
]

const paragraphs = [
  'Scroll this panel: the search app bar stays at the top and fills with its on-scroll color, and the search bar inside it takes the scrolled container role.',
  'Click the field, type, or press the down key to expand it. Results appear docked on a wide window and full-screen on a narrow one.',
  'The down key moves from the field into the list; Escape collapses and puts focus back on the field.',
]

function matches(query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return inbox
  return inbox.filter((entry) => entry.toLowerCase().includes(needle))
}

export function SearchBarExample() {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [containedQuery, setContainedQuery] = useState('')
  const [dividedQuery, setDividedQuery] = useState('')
  const [lastSearch, setLastSearch] = useState<string | null>(null)

  const containedResults = useMemo(() => matches(containedQuery), [containedQuery])
  const dividedResults = useMemo(() => matches(dividedQuery), [dividedQuery])

  return (
    <Surface
      as="section"
      aria-labelledby="search-bar-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="search-bar-example"
    >
      <Text as="h2" id="search-bar-example-title" variant="titleLarge" emphasis="emphasized">
        Search
      </Text>
      <Text as="p" variant="bodyMedium">
        The search app bar is the variant to use when search is a product&rsquo;s
        primary, global function. The standalone bar below it shows the divided
        treatment, where a divider separates the field from the results.
      </Text>

      <div className="search-bar-example__panel" ref={scrollRef}>
        <SearchAppBar
          scrollBehavior="pinned"
          scrollContainer={scrollRef}
          navigationIcon={
            <IconButton aria-label="Open navigation">
              <Icon source="menu" />
            </IconButton>
          }
          actions={
            <IconButton aria-label="Account">
              <Icon source="account_circle" />
            </IconButton>
          }
        >
          <SearchBar
            placeholder="Search mail"
            query={containedQuery}
            onQueryChange={setContainedQuery}
            onSearch={setLastSearch}
            leadingIcon={
              <IconButton aria-label="Search">
                <Icon source="search" />
              </IconButton>
            }
            avatar={<span className="search-bar-example__avatar">RB</span>}
          >
            {containedResults.map((entry) => (
              <ListItem
                key={entry}
                interaction="action"
                headline={entry}
                onClick={() => setLastSearch(entry)}
              />
            ))}
          </SearchBar>
        </SearchAppBar>
        <div className="search-bar-example__content">
          {paragraphs.map((paragraph) => (
            <Text as="p" key={paragraph} variant="bodyMedium">
              {paragraph}
            </Text>
          ))}
        </div>
      </div>

      <div className="search-bar-example__standalone">
        <Text as="h3" variant="titleMedium">
          Divided treatment
        </Text>
        <SearchBar
          appearance="divided"
          placeholder="Search receipts"
          query={dividedQuery}
          onQueryChange={setDividedQuery}
          onSearch={setLastSearch}
          leadingIcon={
            <IconButton aria-label="Search receipts">
              <Icon source="search" />
            </IconButton>
          }
          trailingIcon={
            <IconButton aria-label="Search by voice">
              <Icon source="mic" />
            </IconButton>
          }
        >
          {dividedResults.map((entry) => (
            <ListItem
              key={entry}
              interaction="action"
              headline={entry}
              onClick={() => setLastSearch(entry)}
            />
          ))}
        </SearchBar>
      </div>

      <Text as="p" variant="bodySmall" aria-live="polite">
        {lastSearch ? `Last search: ${lastSearch}` : 'No search run yet.'}
      </Text>
    </Surface>
  )
}
