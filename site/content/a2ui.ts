export const a2uiPackage = '@language-lit/material3-expressive-a2ui'
export const a2uiRepository = 'https://github.com/Language-Lit/material3-expressive-a2ui'
export const a2uiNpm = `https://www.npmjs.com/package/${a2uiPackage}`
export const a2uiReleases = `${a2uiRepository}/releases`
export const a2uiSpecification = 'https://a2ui.org'
export const a2uiProject = 'https://github.com/a2ui-project/a2ui'
export const a2uiDescription = 'A React renderer for Google A2UI that maps every A2UI basic-catalog component to Material 3 Expressive. Stream agent-generated surfaces, bind inputs, validate, and send actions back. Try the live demo and read the guides.'
export const a2uiInstall = 'npm install @language-lit/material3-expressive-a2ui @language-lit/material3-expressive @a2ui/web_core'

/** The versions the companion was built and tested against. */
export const a2uiVersions = {
  protocol: 'v0.9.1',
  catalog: 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
  webCore: '0.10.7',
  officialReact: '0.11.0',
  designSystem: '^1.2.0',
  react: '18 or 19',
} as const

/** The basic catalog, and what each component renders as. */
export const a2uiComponentMap: readonly { component: string; renders: string; notes: string }[] = [
  { component: 'Text', renders: 'Text', notes: 'h1 to h5 map to headline and title roles. Markdown subset: bold, italic, code, links, headings, lists.' },
  { component: 'Image', renders: 'Image with variant sizing', notes: 'icon, avatar, smallFeature, mediumFeature, largeFeature, header.' },
  { component: 'Icon', renders: 'Icon', notes: 'Catalog names render as embedded glyphs. No icon font required.' },
  { component: 'Video', renders: 'Native video player', notes: 'Controls enabled.' },
  { component: 'AudioPlayer', renders: 'Native audio player', notes: 'Controls enabled.' },
  { component: 'Row', renders: 'Flex row', notes: 'justify, align, and child weight.' },
  { component: 'Column', renders: 'Flex column', notes: 'justify, align, and child weight.' },
  { component: 'List', renders: 'List', notes: 'Vertical or horizontal, static children or a template.' },
  { component: 'Card', renders: 'Card', notes: 'Outlined, passive container.' },
  { component: 'Tabs', renders: 'Tabs', notes: 'Keyboard operable.' },
  { component: 'Modal', renders: 'Dialog', notes: 'The trigger opens the dialog and still dispatches its action.' },
  { component: 'Divider', renders: 'Divider', notes: 'Horizontal or vertical.' },
  { component: 'Button', renders: 'Button', notes: 'primary filled, default tonal, borderless text. Disabled while checks fail.' },
  { component: 'TextField', renders: 'TextField or TextArea', notes: 'shortText, longText, obscured, number.' },
  { component: 'CheckBox', renders: 'Checkbox', notes: 'Labeled.' },
  { component: 'ChoicePicker', renders: 'Radio, Checkbox, or filter Chip', notes: 'Exclusive or multiple, optional filter field.' },
  { component: 'Slider', renders: 'Slider', notes: 'Decimal precision follows the range.' },
  { component: 'DateTimeInput', renders: 'Native date and time input', notes: 'Material tokens. ISO 8601 both ways, zone aware.' },
]
