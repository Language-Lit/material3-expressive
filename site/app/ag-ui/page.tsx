import type { Metadata } from 'next'
import { Surface, Text } from '@language-lit/material3-expressive'
import { AgUiDemo } from '../../ui/ag-ui/AgUiDemo'
import { InstallCommand } from '../../ui/InstallCommand'
import { LinkButton } from '../../ui/LinkButton'
import { StructuredData, breadcrumbList } from '../../ui/StructuredData'
import { absoluteUrl } from '../../content/site'
import { agUiDescription, agUiInstall, agUiNpm, agUiPackage, agUiReleases, agUiRepository } from '../../content/ag-ui'
import { agUiDocPages } from '../../content/docs'
import '@language-lit/material3-expressive-ag-ui/styles.css'
import './ag-ui.css'

const title = 'AG-UI for React'

export const metadata: Metadata = {
  title,
  description: agUiDescription,
  alternates: { canonical: '/ag-ui/' },
  openGraph: { url: absoluteUrl('/ag-ui/'), title, description: agUiDescription },
  twitter: { card: 'summary_large_image', title, description: agUiDescription },
}

export default function AgUiPage() {
  return (
    <main className="agui-page">
      <StructuredData data={breadcrumbList([{ name: 'AG-UI', path: '/ag-ui/' }])} />
      <section className="hero">
        <div className="section__inner agui-hero">
          <div>
            <p className="hero__eyebrow">AG-UI for React</p>
            <Text as="h1" variant="displayLarge" emphasis="emphasized" className="hero__title agui-hero__title">
              Give your agent a <span className="hero__accent">Material 3 Expressive interface.</span>
            </Text>
          </div>
          <div className="agui-hero__intro">
            <Text as="p" variant="bodyLarge">
              Build an interface for AI agents using AG-UI. Show replies as they
              arrive, turn tool calls into useful UI, and let people decide
              when an agent can act.
            </Text>
            <Text as="p" variant="bodyLarge">
              The AG-UI library brings conversations to the same React components,
              colors, and motion used across this site.
            </Text>
            <div className="hero__actions">
              <LinkButton href="#demo">Try the demo</LinkButton>
              <LinkButton href="/docs/ag-ui-getting-started/" variant="outlined">Read the docs</LinkButton>
            </div>
            <nav className="agui-links" aria-label="AG-UI package">
              <a href={agUiNpm}>npm</a>
              <a href={agUiRepository}>GitHub</a>
              <a href={agUiReleases}>Releases</a>
            </nav>
          </div>
        </div>
      </section>

      <section className="section section--tinted agui-demo-section" id="demo" aria-labelledby="demo-title">
        <div className="section__inner">
          <div className="section__head agui-demo-section__head">
            <div>
              <p className="section__eyebrow">Try it here</p>
              <Text as="h2" variant="headlineLarge" emphasis="emphasized" className="section__title" id="demo-title">
                Try an agent conversation.
              </Text>
            </div>
            <p className="agui-demo-label">Scripted demo. No LLM or API key required.</p>
          </div>
          <AgUiDemo />
        </div>
      </section>

      <section className="section" aria-labelledby="design-title">
        <div className="section__inner agui-about">
          <div>
            <p className="section__eyebrow">One design system</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="design-title">
              Match the rest of your app.
            </Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              Use Material 3 Expressive for your app’s controls and the AG-UI
              companion for its conversations. Both follow the same theme,
              including light and dark modes. Try the theme controls at the top
              of this page to see them change together.
            </Text>
            <LinkButton href="/components/" variant="outlined">Browse Material components</LinkButton>
          </div>
          <Surface color="secondary-container" shape="extra-large" className="agui-about__detail">
            <Text as="h3" variant="titleLarge">Use the whole chat or compose the parts</Text>
            <Text as="p" variant="bodyLarge">
              Start with AgentChat, or arrange messages, reasoning, tool calls,
              activity, and run status around your own layout. Register a tool
              renderer when a card or control works better than text.
            </Text>
            <Text as="p" variant="bodyMedium">
              The package renders AG-UI streams. It does not contain or call an
              LLM. You connect your own agent when you are ready.
            </Text>
          </Surface>
        </div>
      </section>

      <section className="section section--tinted" id="install" aria-labelledby="install-title">
        <div className="section__inner agui-install">
          <p className="section__eyebrow">Start building</p>
          <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="install-title">
            Add AG-UI to your React app.
          </Text>
          <Text as="p" variant="bodyLarge" className="section__lede">
            Install the native AG-UI package and its peers in a React 18 or 19 app.
          </Text>
          <InstallCommand command={agUiInstall} />
          <Text as="p" variant="bodyMedium">
            Import both stylesheets in this order, then use AgentProvider inside
            your Material3Provider to connect an agent.
          </Text>
          <pre className="agui-code"><code>{`import '@language-lit/material3-expressive/styles.css'
import '@language-lit/material3-expressive-ag-ui/styles.css'`}</code></pre>
          <div className="agui-links">
            <a href="/docs/ag-ui-getting-started/">Read the AG-UI setup guide</a>
            <a href="/docs/getting-started/">Set up Material 3 Expressive</a>
          </div>
          <Surface color="surface" shape="large" className="agui-copilot">
            <Text as="h3" variant="titleLarge">Already using CopilotKit?</Text>
            <Text as="p" variant="bodyLarge">
              The adapter supports <strong>CopilotKit 1.71.x v1 only</strong>.
              Import it from <code>{agUiPackage}/copilotkit</code> inside your
              existing CopilotKit setup. The v2 API is not supported.
            </Text>
            <a href="/docs/ag-ui-copilotkit/">Read the CopilotKit adapter guide</a>
          </Surface>
        </div>
      </section>
      <section className="section" aria-labelledby="agui-docs-title">
        <div className="section__inner">
          <div className="section__head">
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="agui-docs-title">Build your own agent interface.</Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              Start with a chat, then add the components your app needs.
              These guides cover the native API and the CopilotKit adapter.
            </Text>
          </div>
          <div className="agui-guide-cards">
            {agUiDocPages.map((page) => (
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
