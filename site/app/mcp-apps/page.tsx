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
  title, description: mcpAppsDescription,
  alternates: { canonical: '/mcp-apps/' },
  openGraph: { url: absoluteUrl('/mcp-apps/'), title, description: mcpAppsDescription },
}

const steps = [
  ['A tool names its app', 'An MCP tool declares a ui:// HTML resource. Your connected client reads that resource and passes it to McpAppFrame.'],
  ['The frame connects', 'The SDK bridge initializes the sandboxed app and supplies host capabilities, Material style variables, light or dark mode, and container dimensions.'],
  ['Results become interactive', 'The host sends tool inputs and results. McpAppProvider exposes them to your Material components through useToolCall.'],
  ['Actions return to the host', 'The app can call server tools, request a display mode, update model context, or ask to add a chat message. The host decides which capabilities to enable.'],
]

const sample = `import { Material3Provider } from '@language-lit/material3-expressive'
import { McpAppFrame, useMcpAppResource } from
  '@language-lit/material3-expressive-mcp-apps'

export function ToolApp({ client, uri, toolResult }) {
  const { resource, error } = useMcpAppResource(client, uri)
  if (error) return <p role="alert">{error.message}</p>
  return <Material3Provider>
    {resource && <McpAppFrame client={client} resource={resource}
      toolResult={toolResult} title="Tool app" />}
  </Material3Provider>
}`

export default function McpAppsPage() {
  return <main className="mcp-page">
    <StructuredData data={breadcrumbList([{ name: 'MCP Apps', path: '/mcp-apps/' }])} />
    <section className="hero"><div className="section__inner mcp-hero">
      <div><p className="hero__eyebrow">MCP Apps for React</p><Text as="h1" variant="displayLarge" emphasis="emphasized" className="hero__title">Give your tools a <span className="hero__accent">Material interface.</span></Text></div>
      <div><Text as="p" variant="bodyLarge">Embed MCP Apps in a Material 3 Expressive host, or build a Material app that follows its host. Tool results become an interface people can explore and act on.</Text>
        <Text as="p" variant="bodyLarge">The companion connects the official MCP Apps SDK to Material components, theme context, and display modes.</Text>
        <div className="hero__actions"><LinkButton href="#demo">Try the demo</LinkButton><LinkButton href="/docs/mcp-apps-getting-started/" variant="outlined">Read the docs</LinkButton></div>
        <Text as="p" variant="bodySmall">Companion {mcpAppsVersions.companion}. This preview uses a locally packed build.</Text>
        <a href={mcpAppsSpecification}>MCP Apps specification and SDK</a>
      </div>
    </div></section>
    <section id="demo" className="mcp-section"><div className="section__inner">
      <Text as="h2" variant="headlineLarge">A tool result you can use</Text>
      <Text as="p" variant="bodyLarge">Scripted demo. No LLM or API key required.</Text>
      <Text as="p" variant="bodyMedium">Get a forecast, choose a day, and refresh it from inside the app. Try full screen or picture in picture, then return without losing your selection. The theme controls above also update the app.</Text>
      <McpAppsDemo />
    </div></section>
    <section className="mcp-section"><div className="section__inner"><Text as="h2" variant="headlineLarge">From a tool call to an app</Text><div className="mcp-grid">
      {steps.map(([heading, body], index) => <Surface key={heading} as="article" color="surface-container-low" shape="large" className="mcp-card"><Text as="h3" variant="titleLarge">{index + 1}. {heading}</Text><Text as="p">{body}</Text></Surface>)}
    </div></div></section>
    <section className="mcp-section"><div className="section__inner"><Text as="h2" variant="headlineLarge">One companion, two sides</Text><div className="mcp-grid">
      <Surface as="article" color="primary-container" shape="large" className="mcp-card"><Text as="h3" variant="titleLarge">Host an MCP App</Text><Text as="p">McpAppFrame owns the iframe and SDK bridge. Read a resource, pass the tool result, and enable the callbacks your host supports. Apps can use any UI framework.</Text></Surface>
      <Surface as="article" color="tertiary-container" shape="large" className="mcp-card"><Text as="h3" variant="titleLarge">Build a Material app</Text><Text as="p">McpAppProvider connects your app to its host. Read tool calls, access host capabilities, follow light or dark mode, and use the Material components you already know.</Text></Surface>
    </div><pre className="mcp-code"><code>{sample}</code></pre><Text as="p">Load the core stylesheet before the companion stylesheet in each document. The getting-started guide covers local installation and registering an app resource.</Text></div></section>
    <section className="mcp-section"><div className="section__inner"><Text as="h2" variant="headlineLarge">Compatibility and host policy</Text>
      <Text as="p">This preview tests ext-apps and the split MCP client/server SDK at {mcpAppsVersions.sdk}, Material 3 Expressive {mcpAppsVersions.core}, and React 19. The companion declares React 18 and 19 peers. External host interoperability has not been certified.</Text>
      <Text as="p">The host owns resource trust, tool authorization, allowed domains, and message dispatch. Direct embedding uses an opaque-origin iframe with a content security policy. A separate sandbox proxy is supported when your host supplies and operates it.</Text>
      <Text as="p">Full screen is a CSS display mode with exit controls, not a modal dialog. Host light or dark mode is automatic; matching a custom Material palette requires a shared theme. This companion is not part of the core Material conformance matrix.</Text>
      <nav className="mcp-links" aria-label="MCP Apps guides">{mcpAppsDocPages.map((page) => <LinkButton key={page.slug} href={`/docs/${page.slug}/`} variant="outlined">{page.title}</LinkButton>)}</nav>
    </div></section>
  </main>
}
