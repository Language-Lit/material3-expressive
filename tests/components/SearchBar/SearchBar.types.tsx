import { createRef } from 'react'
import { SearchAppBar, SearchBar } from '../../../src/components/SearchBar'
import type {
  SearchAppBarProps,
  SearchAppBarScrollBehavior,
  SearchBarAppearance,
  SearchBarLayout,
  SearchBarProps,
} from '../../../src/components/SearchBar'

const ref = createRef<HTMLInputElement>()
const headerRef = createRef<HTMLElement>()
const containerRef = createRef<HTMLDivElement>()

const appearance: SearchBarAppearance = 'divided'
const layout: SearchBarLayout = 'adaptive'
const behavior: SearchAppBarScrollBehavior = 'enterAlways'
const props: SearchBarProps = { placeholder: 'Search' }
const appBarProps: SearchAppBarProps = {}
void appearance
void layout
void behavior
void props
void appBarProps

;<SearchBar placeholder="Search" />
;<SearchBar placeholder="Search" ref={ref} />
;<SearchBar placeholder="Search" defaultQuery="mail" onQueryChange={(next) => void next} />
;<SearchBar placeholder="Search" query="mail" onQueryChange={(next) => void next} />
;<SearchBar placeholder="Search" expanded onExpandedChange={(next) => void next} />
;<SearchBar placeholder="Search" defaultExpanded onSearch={(query) => void query} />
;<SearchBar placeholder="Search" appearance="contained" layout="docked" />
;<SearchBar placeholder="Search" appearance="divided" layout="fullScreen" />
;<SearchBar
  placeholder="Search"
  leadingIcon={<span />}
  trailingIcon={<span />}
  avatar={<img alt="" src="data:," />}
  disabled
/>
;<SearchBar placeholder="Search" id="q" name="q" lang="en" className="custom" />
;<SearchBar placeholder="Search">results</SearchBar>

;<SearchAppBar>
  <SearchBar placeholder="Search" />
</SearchAppBar>
;<SearchAppBar ref={headerRef} scrollBehavior="pinned">
  <SearchBar placeholder="Search" />
</SearchAppBar>
;<SearchAppBar
  navigationIcon={<button type="button" />}
  actions={<button type="button" />}
  scrollBehavior="enterAlways"
  scrollContainer={containerRef}
>
  <SearchBar placeholder="Search" />
</SearchAppBar>

// @ts-expect-error the appearance is a closed union
;<SearchBar placeholder="Search" appearance="outlined" />

// @ts-expect-error the layout is a closed union
;<SearchBar placeholder="Search" layout="modal" />

// @ts-expect-error the query is a string, not an arbitrary value
;<SearchBar placeholder="Search" query={12} onQueryChange={() => {}} />

// @ts-expect-error the field owns its value; `value` is not a search bar prop
;<SearchBar placeholder="Search" value="mail" />

// @ts-expect-error `onChange` is replaced by the query callbacks
;<SearchBar placeholder="Search" onChange={() => {}} />

// @ts-expect-error the field is an input, so the ref is an input ref
;<SearchBar placeholder="Search" ref={headerRef} />

// @ts-expect-error the search app bar has no scroll behavior for a second row
;<SearchAppBar scrollBehavior="exitUntilCollapsed">
  <SearchBar placeholder="Search" />
</SearchAppBar>

// @ts-expect-error the scroll container is an element ref, not an element
;<SearchAppBar scrollBehavior="pinned" scrollContainer={document.body}>
  <SearchBar placeholder="Search" />
</SearchAppBar>

// @ts-expect-error the uncontrolled query is `defaultQuery`, not the input's own
;<SearchBar placeholder="Search" defaultValue="mail" />

// @ts-expect-error the field's type is fixed, so a search keyboard is guaranteed
;<SearchBar placeholder="Search" type="text" />
