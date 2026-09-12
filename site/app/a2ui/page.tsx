import type { Metadata } from 'next'
import { Surface, Text } from '@language-lit/material3-expressive'
import { A2uiDemo } from '../../ui/a2ui/A2uiDemo'
import { InstallCommand } from '../../ui/InstallCommand'
import { LinkButton } from '../../ui/LinkButton'
import { StructuredData, breadcrumbList } from '../../ui/StructuredData'
import { absoluteUrl } from '../../content/site'
import {
  a2uiComponentMap,
  a2uiDescription,
  a2uiInstall,
  a2uiNpm,
  a2uiPackage,
  a2uiProject,
  a2uiReleases,
  a2uiRepository,
  a2uiSpecification,
  a2uiVersions,
} from '../../content/a2ui'
import { a2uiDocPages } from '../../content/docs'
import '@language-lit/material3-expressive-a2ui/styles.css'
import './a2ui.css'

const title = 'A2UI for React'

export const metadata: Metadata = {
  title,
  description: a2uiDescription,
  alternates: { canonical: '/a2ui/' },
  openGraph: { url: absoluteUrl('/a2ui/'), title, description: a2uiDescription },
  twitter: { card: 'summary_large_image', title, description: a2uiDescription },
}

const steps = [
  {
    title: 'Messages arrive',
    body: 'Your agent streams A2UI JSON messages over A2A, HTTP, or a WebSocket. You parse each line and pass it to processMessages.',
  },
  {
    title: 'web_core keeps the models',
    body: 'Google’s @a2ui/web_core validates every message, owns the surface and data models, and evaluates bindings and catalog functions.',
  },
  {
    title: 'Surfaces render',
    body: 'A2uiSurface subscribes to each component and renders it with a Material 3 Expressive component. Children named before they arrive show as placeholders.',
  },
  {
    title: 'Actions go back',
    body: 'Inputs write into the data model. A button dispatches its event with the resolved context to your onAction callback, ready to send to the agent.',
  },
]

const sample = `import { Material3Provider } from '@language-lit/material3-expressive'
import { A2uiSurface, useA2ui } from '@language-lit/material3-expressive-a2ui'

export function AgentPanel({ send }) {
  const { surfaces, processMessages } = useA2ui({
    onAction: (action) => send(action),
  })
  // Call processMessages(messages) with each batch your agent delivers.
  return (
    <Material3Provider>
      {surfaces.map((surface) => (
        <A2uiSurface key={surface.id} surface={surface} />
      ))}
    </Material3Provider>
  )
}`

const compatibility = [
  ['A2UI protocol', `${a2uiVersions.protocol} (v0.9 accepted). The basic catalog.`],
  ['@a2ui/web_core', `^${a2uiVersions.webCore}, tested with ${a2uiVersions.webCore}.`],
  ['@language-lit/material3-expressive', `${a2uiVersions.designSystem}.`],
  ['React and React DOM', `${a2uiVersions.react}.`],
  ['@a2ui/react', `The catalog is tested under ${a2uiVersions.officialReact}. Not a dependency; it needs React 19 itself.`],
]

export default function A2uiPage() {
  return (
    <main className="a2ui-page">
      <StructuredData data={breadcrumbList([{ name: 'A2UI', path: '/a2ui/' }])} />
      <section className="hero">
        <div className="section__inner a2ui-hero">
          <div>
            <p className="hero__eyebrow">A2UI for React</p>
            <Text as="h1" variant="displayLarge" emphasis="emphasized" className="hero__title a2ui-hero__title">
              Render Google A2UI with <span className="hero__accent">Material 3 Expressive.</span>
            </Text>
          </div>
          <div className="a2ui-hero__intro">
            <Text as="p" variant="bodyLarge">
              Material 3 Expressive for A2UI is a React renderer for Google&rsquo;s
              A2UI protocol. It maps every component of the A2UI basic catalog
              to Google&rsquo;s Material 3 Expressive design system, so the
              interfaces your agents generate share one theme with the rest of
              your app.
            </Text>
            <Text as="p" variant="bodyLarge">
              Stream surfaces as messages arrive, bind inputs to the data model,
              validate with checks, and send actions back to the agent.
            </Text>
            <div className="hero__actions">
              <LinkButton href="#demo">Try the demo</LinkButton>
              <LinkButton href="/docs/a2ui-getting-started/" variant="outlined">Read the docs</LinkButton>
            </div>
            <nav className="a2ui-links" aria-label="A2UI package">
              <a href={a2uiNpm}>npm</a>
              <a href={a2uiRepository}>GitHub</a>
              <a href={a2uiReleases}>Releases</a>
              <a href={a2uiSpecification}>A2UI specification</a>
            </nav>
          </div>
        </div>
      </section>

      <section className="section section--tinted a2ui-demo-section" id="demo" aria-labelledby="demo-title">
        <div className="section__inner">
          <div className="section__head a2ui-demo-section__head">
            <div>
              <p className="section__eyebrow">Try it here</p>
              <Text as="h2" variant="headlineLarge" emphasis="emphasized" className="section__title" id="demo-title">
                Stream an agent surface.
              </Text>
            </div>
            <p className="a2ui-demo-label">Scripted demo. No LLM or API key required.</p>
          </div>
          <A2uiDemo />
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="section__inner a2ui-how">
          <div className="section__head">
            <p className="section__eyebrow">How it works</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="how-title">
              From a message stream to Material components.
            </Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              The renderer sits between Google&rsquo;s protocol runtime and the
              design system. It adds no runtime dependencies and no transport.
            </Text>
          </div>
          <ol className="a2ui-steps">
            {steps.map((step, index) => (
              <li key={step.title}>
                <Surface color="surface-container-low" shape="large" className="a2ui-step">
                  <span className="a2ui-step__number" aria-hidden="true">{index + 1}</span>
                  <Text as="h3" variant="titleLarge">{step.title}</Text>
                  <Text as="p" variant="bodyMedium">{step.body}</Text>
                </Surface>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--tinted" id="components" aria-labelledby="components-title">
        <div className="section__inner a2ui-components">
          <div className="section__head">
            <p className="section__eyebrow">Supported components</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="components-title">
              The whole A2UI basic catalog.
            </Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              All {a2uiComponentMap.length} components of the {a2uiVersions.protocol} basic
              catalog render with Material 3 Expressive components and tokens. Every
              color, type style, corner, and motion value follows your theme in
              light and dark modes.
            </Text>
          </div>
          <div className="a2ui-table-wrap">
            <table className="a2ui-table">
              <thead>
                <tr>
                  <th scope="col">A2UI component</th>
                  <th scope="col">Renders as</th>
                  <th scope="col">Notes</th>
                </tr>
              </thead>
              <tbody>
                {a2uiComponentMap.map((row) => (
                  <tr key={row.component}>
                    <th scope="row"><code>{row.component}</code></th>
                    <td>{row.renders}</td>
                    <td>{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a className="a2ui-inline-link" href="/docs/a2ui-components/">Read the component and rendering rules</a>
        </div>
      </section>

      <section className="section" id="compatibility" aria-labelledby="compat-title">
        <div className="section__inner a2ui-compat">
          <div>
            <p className="section__eyebrow">Compatibility</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="compat-title">
              Versions and limits.
            </Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              The package is an independent community implementation. It is not
              affiliated with Google. A2UI and Material Design are Google projects.
            </Text>
            <div className="a2ui-table-wrap">
              <table className="a2ui-table">
                <caption className="a2ui-visually-hidden">Supported versions</caption>
                <tbody>
                  {compatibility.map(([name, value]) => (
                    <tr key={name}>
                      <th scope="row"><code>{name}</code></th>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Surface color="secondary-container" shape="extra-large" className="a2ui-compat__limits">
            <Text as="h3" variant="titleLarge">Known limits</Text>
            <ul className="a2ui-list">
              <li>The basic catalog only, by default. Register other catalogs with <code>createMaterial3Catalog</code>.</li>
              <li>Icon names outside the catalog fall back to a Material Symbols ligature, which needs that font.</li>
              <li>The Markdown subset has no tables, images, raw HTML, or nested lists.</li>
              <li><code>DateTimeInput</code> uses the Material picker exports in 1.3.0-rc.1 and keeps a platform-input fallback for the compatible 1.2 peer line.</li>
              <li><code>primaryColor</code> from the agent is exposed as a custom property. It does not re-theme the surface.</li>
              <li>Transport, authentication, persistence, and orchestration stay in your application.</li>
            </ul>
          </Surface>
        </div>
      </section>

      <section className="section section--tinted" id="install" aria-labelledby="install-title">
        <div className="section__inner a2ui-install">
          <p className="section__eyebrow">Start building</p>
          <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="install-title">
            Add A2UI to your React app.
          </Text>
          <Text as="p" variant="bodyLarge" className="section__lede">
            Install the renderer and its peers in a React 18 or 19 app.
          </Text>
          <InstallCommand command={a2uiInstall} />
          <Text as="p" variant="bodyMedium">
            Import both stylesheets in this order, then own a processor with
            useA2ui and render each surface inside your Material3Provider.
          </Text>
          <pre className="a2ui-code"><code>{`import '@language-lit/material3-expressive/styles.css'
import '@language-lit/material3-expressive-a2ui/styles.css'`}</code></pre>
          <pre className="a2ui-code"><code>{sample}</code></pre>
          <div className="a2ui-links">
            <a href="/docs/a2ui-getting-started/">Read the A2UI setup guide</a>
            <a href="/docs/getting-started/">Set up Material 3 Expressive</a>
          </div>
          <Surface color="surface" shape="large" className="a2ui-official">
            <Text as="h3" variant="titleLarge">Already rendering with Google&rsquo;s React surface?</Text>
            <Text as="p" variant="bodyLarge">
              <code>material3Catalog</code> from <code>{a2uiPackage}</code> is a
              web_core catalog in the render-only shape that <code>@a2ui/react</code> consumes.
              Register it with your existing processor and keep your own surface,
              transport, and fallback policy.
            </Text>
            <a href="/docs/a2ui-components/#use-the-catalog-under-googles-react-surface">Read how to register the catalog</a>
          </Surface>
        </div>
      </section>

      <section className="section" aria-labelledby="a2ui-docs-title">
        <div className="section__inner">
          <div className="section__head">
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="a2ui-docs-title">Build your own agent surfaces.</Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              Start with the setup guide, then read how each component renders
              and how to extend the catalog. The protocol itself is documented
              by the <a href={a2uiProject}>A2UI project</a>.
            </Text>
          </div>
          <div className="a2ui-guide-cards">
            {a2uiDocPages.map((page) => (
              <Surface key={page.slug} color="surface-container-low" shape="large">
                <Text as="h3" variant="titleLarge"><a href={`/docs/${page.slug}/`}>{page.title}</a></Text>
                <Text as="p" variant="bodyMedium">{page.summary}</Text>
              </Surface>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
