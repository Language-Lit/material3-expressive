import { useEffect, useState, type ReactNode } from 'react'
import {
  Badge,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  EmptyState,
  FAB,
  Icon,
  IconButton,
  Input,
  LinearProgress,
  Radio,
  SegmentedButtons,
  Switch,
  Text,
  TextArea,
} from '../src'
import { IconShowcase, Typography } from '../src/showcase'

const navigation = [
  { id: 'foundations', label: 'Foundations', icon: 'palette' },
  { id: 'buttons', label: 'Buttons', icon: 'smart_button' },
  { id: 'inputs', label: 'Inputs', icon: 'check_box' },
  { id: 'feedback', label: 'Feedback', icon: 'progress_activity' },
  { id: 'typography', label: 'Typography', icon: 'text_fields' },
  { id: 'icons', label: 'Icons', icon: 'interests' },
] as const

const colorTokens = [
  ['Primary', '--md-sys-color-primary', '--md-sys-color-on-primary'],
  ['Primary container', '--md-sys-color-primary-container', '--md-sys-color-on-primary-container'],
  ['Secondary', '--md-sys-color-secondary', '--md-sys-color-on-secondary'],
  ['Tertiary', '--md-sys-color-tertiary', '--md-sys-color-on-tertiary'],
  ['Error', '--md-sys-color-error', '--md-sys-color-on-error'],
  ['Surface', '--md-sys-color-surface-container-high', '--md-sys-color-on-surface'],
] as const

const buttonVariants = ['elevated', 'filled', 'tonal', 'outlined', 'text'] as const

function Section({ id, title, source, children }: {
  id: string
  title: string
  source: string
  children: ReactNode
}) {
  return (
    <section id={id} className="workbench-section scroll-mt-24">
      <div className="section-heading">
        <div>
          <Text type="headline" size="medium" emphasis="emphasized">{title}</Text>
          <code>{source}</code>
        </div>
        <a href="#top" aria-label={`Back to top from ${title}`}>
          <Icon name="arrow_upward" opsz={20} />
        </a>
      </div>
      {children}
    </section>
  )
}

function Sample({ title, children, className = '' }: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`sample ${className}`}>
      <Text type="label" size="medium" emphasis="emphasized">{title}</Text>
      <div className="sample-stage">{children}</div>
    </div>
  )
}

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [checked, setChecked] = useState(true)
  const [radio, setRadio] = useState('one')
  const [switched, setSwitched] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeSegment, setActiveSegment] = useState('all')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'light' ? '#fdf7ff' : '#141318',
    )
  }, [theme])

  return (
    <div id="top" className="workbench-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Material 3 Expressive workbench home">
          <span className="brand-mark"><Icon name="shapes" fill={1} /></span>
          <span>
            <strong>Material 3</strong>
            <small>Expressive workbench</small>
          </span>
        </a>

        <nav aria-label="Component sections">
          {navigation.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              <Icon name={item.icon} opsz={20} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-note">
          <Icon name="bolt" fill={1} />
          <span>Components import directly from <code>src</code>. Save a file to see it update.</span>
        </div>
      </aside>

      <main>
        <header className="hero">
          <div className="hero-copy">
            <span className="eyebrow">LOCAL COMPONENT LAB</span>
            <Text type="display" size="medium" emphasis="emphasized">
              See the system while you shape it.
            </Text>
            <Text type="body" size="large" color="on-surface-variant">
              A live, responsive surface for developing the library’s components, tokens, states, and motion.
            </Text>
            <div className="hero-actions">
              <Button as="a" href="#buttons" variant="filled">Browse components</Button>
              <Button as="a" href="#foundations" variant="tonal">Inspect tokens</Button>
            </div>
          </div>

          <div className="theme-control">
            <Icon name={theme === 'light' ? 'light_mode' : 'dark_mode'} fill={1} />
            <span>Dark theme</span>
            <Switch
              aria-label="Dark theme"
              checked={theme === 'dark'}
              onChange={(next) => setTheme(next ? 'dark' : 'light')}
              icon="check"
            />
          </div>
        </header>

        <div className="content">
          <Section id="foundations" title="Foundations" source="src/styles/tokens">
            <div className="token-grid">
              {colorTokens.map(([label, background, foreground]) => (
                <div
                  className="token"
                  key={background}
                  style={{ backgroundColor: `var(${background})`, color: `var(${foreground})` }}
                >
                  <span>{label}</span>
                  <code>{background.replace('--md-sys-color-', '')}</code>
                </div>
              ))}
            </div>
          </Section>

          <Section id="buttons" title="Buttons" source="src/components/buttons">
            <div className="sample-grid">
              <Sample title="Variants" className="sample-wide">
                <div className="component-row">
                  {buttonVariants.map((variant) => (
                    <Button key={variant} variant={variant}>{variant}</Button>
                  ))}
                  <Button disabled>disabled</Button>
                </div>
              </Sample>

              <Sample title="Icon buttons">
                <div className="component-row">
                  <IconButton icon="add" variant="filled" aria-label="Add" />
                  <IconButton icon="favorite" variant="tonal" selected aria-label="Favorite" />
                  <IconButton icon="edit" variant="outlined" aria-label="Edit" />
                  <IconButton icon="more_vert" aria-label="More" />
                </div>
              </Sample>

              <Sample title="Floating actions">
                <div className="component-row">
                  <FAB iconName="add" aria-label="Add item" />
                  <FAB iconName="edit" variant="small" aria-label="Edit item" />
                </div>
              </Sample>
            </div>
          </Section>

          <Section id="inputs" title="Inputs & selection" source="src/components/inputs">
            <div className="sample-grid">
              <Sample title="Text fields" className="sample-wide">
                <div className="field-grid">
                  <Input label="Filled field" leadingIcon="search" supportingText="Supporting text" />
                  <Input label="Outlined field" variant="outlined" trailingIcon="visibility" defaultValue="Editable value" />
                  <TextArea label="Long-form field" variant="outlined" supportingText="Try typing here" />
                </div>
              </Sample>

              <Sample title="Selection controls">
                <div className="control-stack">
                  <Checkbox
                    label="Send me updates"
                    checked={checked}
                    onChange={(event) => setChecked(event.target.checked)}
                  />
                  <label className="radio-label">
                    <Radio
                      name="workbench-radio"
                      checked={radio === 'one'}
                      onChange={() => setRadio('one')}
                    />
                    First option
                  </label>
                  <label className="radio-label">
                    <Radio
                      name="workbench-radio"
                      checked={radio === 'two'}
                      onChange={() => setRadio('two')}
                    />
                    Second option
                  </label>
                  <label className="switch-label">
                    <Switch
                      checked={switched}
                      onChange={setSwitched}
                      icon="check"
                    />
                    Live updates
                  </label>
                </div>
              </Sample>

              <Sample title={`Segments · ${activeSegment}`}>
                <SegmentedButtons
                  tabs={[
                    { key: 'all', label: 'All', icon: 'apps' },
                    { key: 'saved', label: 'Saved', icon: 'bookmark' },
                    { key: 'recent', label: 'Recent', icon: 'history' },
                  ]}
                  defaultTab="all"
                  onChange={setActiveSegment}
                />
              </Sample>
            </div>
          </Section>

          <Section id="feedback" title="Feedback & status" source="src/components/feedback + modals">
            <div className="sample-grid">
              <Sample title="Badges">
                <div className="component-row badge-row">
                  <span className="badge-anchor"><Icon name="notifications" /><Badge /></span>
                  <span className="badge-anchor"><Icon name="mail" /><Badge value={8} /></span>
                  <span className="badge-anchor"><Icon name="chat" /><Badge value={1200} /></span>
                </div>
              </Sample>

              <Sample title="Progress">
                <div className="progress-stage">
                  <CircularProgress value={68} />
                  <CircularProgress indeterminate />
                  <div className="linear-stack">
                    <LinearProgress value={68} />
                    <LinearProgress value={42} buffer={72} size="lg" />
                  </div>
                </div>
              </Sample>

              <Sample title="Empty state" className="sample-wide">
                <EmptyState message="Nothing here yet. This is the component’s default empty state." />
              </Sample>

              <Sample title="Dialog">
                <Button variant="tonal" onClick={() => setDialogOpen(true)}>Open dialog</Button>
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} className="dialog-card">
                  <Text type="headline" size="small" emphasis="emphasized">A live dialog</Text>
                  <Text color="on-surface-variant">Use this surface to inspect overlays, focus, and responsive behavior.</Text>
                  <div className="dialog-actions">
                    <Button variant="text" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => setDialogOpen(false)}>Done</Button>
                  </div>
                </Dialog>
              </Sample>
            </div>
          </Section>

          <Section id="typography" title="Typography" source="src/showcase/Typography.tsx">
            <div className="showcase-frame"><Typography /></div>
          </Section>

          <Section id="icons" title="Icons" source="src/showcase/IconShowcase.tsx">
            <div className="showcase-frame"><IconShowcase /></div>
          </Section>
        </div>
      </main>
    </div>
  )
}
