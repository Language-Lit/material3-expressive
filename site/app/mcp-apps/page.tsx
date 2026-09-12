import type { Metadata } from 'next'
import { Surface, Text } from '@language-lit/material3-expressive'
import { McpAppsDemo } from '../../ui/mcp-apps/McpAppsDemo'
import { LinkButton } from '../../ui/LinkButton'
import { StructuredData, breadcrumbList } from '../../ui/StructuredData'
import { absoluteUrl } from '../../content/site'
import { mcpAppsDescription, mcpAppsSpecification, mcpAppsVersions } from '../../content/mcp-apps'
import { mcpAppsDocPages } from '../../content/docs'
import '@language-lit/material3-expressive-mcp-apps/styles.css'
import './mcp-apps.css'

const title = 'MCP Apps for React'

export const metadata: Metadata = {
  title,
  description: mcpAppsDescription,
  alternates: { canonical: '/mcp-apps/' },
  openGraph: { url: absoluteUrl('/mcp-apps/'), title, description: mcpAppsDescription },
  twitter: { card: 'summary_large_image', title, description: mcpAppsDescription },
}

const steps = [
  {
    title: 'A tool names its app',
    body: 'An MCP tool declares a ui:// HTML resource. Your connected client reads that resource and passes it to McpAppFrame.',
  },
  {
    title: 'The frame connects',
    body: 'The SDK bridge initializes the sandboxed app and supplies host capabilities, Material style variables, light or dark mode, and container dimensions.',
  },
  {
    title: 'Results become interactive',
    body: 'The host sends tool inputs and results. McpAppProvider exposes them to your Material components through useToolCall.',
  },
  {
    title: 'Actions return to the host',
    body: 'The app can call server tools, request a display mode, update model context, or ask to add a chat message. The host decides which capabilities to enable.',
  },
]

const sample = `import { Material3Provider } from '@language-lit/material3-expressive'
import { McpAppFrame, useMcpAppResource } from
  '@language-lit/material3-expressive-mcp-apps'

export function ToolApp({ client, uri, toolResult }) {
  const { resource, error } = useMcpAppResource(client, uri)
  if (error) return <p role="alert">{error.message}</p>
  return <Material3Provider>
    {resource && <McpAppFrame client={client} resource={resource}
      toolResult={toolResult} title="Tool app" sandboxUrl={sandboxUrl}
      onAuthorizeToolCall={authorizeToolCall} />}
  </Material3Provider>
}`

export default function McpAppsPage() {
  return (
    <main className="mcp-page">
      <StructuredData data={breadcrumbList([{ name: 'MCP Apps', path: '/mcp-apps/' }])} />
      <section className="hero">
        <div className="section__inner mcp-hero">
          <div>
            <p className="hero__eyebrow">MCP Apps for React</p>
            <Text as="h1" variant="displayLarge" emphasis="emphasized" className="hero__title mcp-hero__title">
              Give your tools a <span className="hero__accent">Material interface.</span>
            </Text>
          </div>
          <div className="mcp-hero__intro">
            <Text as="p" variant="bodyLarge">
              Embed MCP Apps in a Material 3 Expressive host, or build a Material
              app that follows its host. Tool results become an interface people
              can explore and act on.
            </Text>
            <Text as="p" variant="bodyLarge">
              The companion connects the official MCP Apps SDK to Material
              components, theme context, and display modes.
            </Text>
            <div className="hero__actions">
              <LinkButton href="#demo">Try the demo</LinkButton>
              <LinkButton href="/docs/mcp-apps-getting-started/" variant="outlined">Read the docs</LinkButton>
            </div>
            <nav className="mcp-links" aria-label="MCP Apps references">
              <a href={mcpAppsSpecification}>MCP Apps specification and SDK</a>
              <span className="mcp-links__note">Companion {mcpAppsVersions.companion}</span>
            </nav>
          </div>
        </div>
      </section>

      <section className="section section--tinted mcp-demo-section" id="demo" aria-labelledby="demo-title">
        <div className="section__inner">
          <div className="section__head mcp-demo-section__head">
            <div>
              <p className="section__eyebrow">Try it here</p>
              <Text as="h2" variant="headlineLarge" emphasis="emphasized" className="section__title" id="demo-title">
                A tool result you can use.
              </Text>
              <Text as="p" variant="bodyLarge" className="section__lede">
                Get a forecast, choose a day, and refresh it from inside the app.
                Try full screen or picture in picture, then return without losing
                your selection. The theme controls above also update the app.
              </Text>
            </div>
            <p className="mcp-demo-label">Scripted demo. No LLM or API key required.</p>
          </div>
          <McpAppsDemo />
        </div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <div className="section__inner">
          <div className="section__head">
            <p className="section__eyebrow">How it works</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="how-title">
              From a tool call to an app.
            </Text>
          </div>
          <ol className="mcp-steps">
            {steps.map((step, index) => (
              <li key={step.title}>
                <Surface color="surface-container-low" shape="large" className="mcp-step">
                  <span className="mcp-step__number" aria-hidden="true">{index + 1}</span>
                  <Text as="h3" variant="titleLarge">{step.title}</Text>
                  <Text as="p" variant="bodyMedium">{step.body}</Text>
                </Surface>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--tinted" id="install" aria-labelledby="sides-title">
        <div className="section__inner mcp-install">
          <div className="section__head">
            <p className="section__eyebrow">Start building</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="sides-title">
              One companion, two sides.
            </Text>
          </div>
          <div className="mcp-sides">
            <Surface as="article" color="primary-container" shape="large" className="mcp-card">
              <Text as="h3" variant="titleLarge">Host an MCP App</Text>
              <Text as="p" variant="bodyMedium">
                McpAppFrame owns the iframe and SDK bridge. Read a resource, pass
                the tool result, and enable the callbacks your host supports.
                Apps can use any UI framework.
              </Text>
            </Surface>
            <Surface as="article" color="tertiary-container" shape="large" className="mcp-card">
              <Text as="h3" variant="titleLarge">Build a Material app</Text>
              <Text as="p" variant="bodyMedium">
                McpAppProvider connects your app to its host. Read tool calls,
                access host capabilities, follow light or dark mode, and use the
                Material components you already know.
              </Text>
            </Surface>
          </div>
          <pre className="mcp-code"><code>{sample}</code></pre>
          <Text as="p" variant="bodyMedium">
            Load the core stylesheet before the companion stylesheet in each
            document. The getting-started guide covers local installation and
            registering an app resource.
          </Text>
        </div>
      </section>

      <section className="section" id="compatibility" aria-labelledby="compat-title">
        <div className="section__inner mcp-compat">
          <div className="mcp-compat__intro">
            <div className="section__head">
              <p className="section__eyebrow">Compatibility</p>
              <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title" id="compat-title">
                Compatibility and host policy.
              </Text>
              <Text as="p" variant="bodyLarge" className="section__lede">
                This preview tests ext-apps and the split MCP client/server SDK
                at {mcpAppsVersions.sdk}, Material 3 Expressive {mcpAppsVersions.core},
                and React 19. The companion declares React 18 and 19 peers.
                External host interoperability has not been certified.
              </Text>
            </div>
            <Text as="p" variant="bodyMedium">
              Full screen is a CSS display mode with exit controls, not a modal
              dialog. Host light or dark mode is automatic; matching a custom
              Material palette requires a shared theme. This companion is not
              part of the core Material conformance matrix.
            </Text>
            <nav className="mcp-actions" aria-label="MCP Apps guides">
              {mcpAppsDocPages.map((page) => (
                <LinkButton key={page.slug} href={`/docs/${page.slug}/`} variant="outlined">{page.title}</LinkButton>
              ))}
            </nav>
          </div>
          <Surface color="secondary-container" shape="extra-large" className="mcp-compat__policy">
            <Text as="h3" variant="titleLarge">The host stays in charge</Text>
            <ul className="mcp-list">
              <li>The host owns resource trust, tool authorization, allowed domains, and message dispatch.</li>
              <li>Browser embedding requires a separate-origin sandbox proxy.</li>
              <li>App-originated tool calls are denied unless the host explicitly authorizes each call.</li>
            </ul>
          </Surface>
        </div>
      </section>
    </main>
  )
}
