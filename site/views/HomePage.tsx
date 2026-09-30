import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Icon, Surface, Text } from '@language-lit/material3-expressive'
import { getConformantComponents } from '../content/inventory'
import { repoRoot, docsRoot } from '../content/paths'
import { Ramp, RampRule } from '../ui/Ramp'
import { HeroShowcase } from '../ui/HeroShowcase'
import { InstallCommand } from '../ui/InstallCommand'
import { LinkButton } from '../ui/LinkButton'
import { ThemeShowcase } from '../ui/ThemeShowcase'
import { StructuredData } from '../ui/StructuredData'
import {
  packageName,
  repositoryUrl,
  siteDescription,
  siteName,
  siteUrl,
} from '../content/site'

/**
 * Package figures are read from the repository at build time. Google research
 * figures are separately attributed and linked in the research section.
 */
async function getFacts() {
  const [components, budgets, browsers, packageJson] = await Promise.all([
    getConformantComponents(),
    readFile(path.join(docsRoot, 'bundle-budgets.json'), 'utf8').then(JSON.parse),
    readFile(path.join(docsRoot, 'browser-support.json'), 'utf8').then(JSON.parse),
    readFile(path.join(repoRoot, 'package.json'), 'utf8').then(JSON.parse),
  ])

  const kilobytes = (bytes: number) => Math.round(bytes / 102.4) / 10

  return {
    componentCount: components.length,
    jsGzip: kilobytes(budgets.artifacts['dist/index.js'].baselineGzipBytes),
    cssGzip: kilobytes(budgets.artifacts['dist/styles.css'].baselineGzipBytes),
    runtimeDependencies: Object.keys(packageJson.dependencies ?? {}).length,
    browsers: browsers.browsers.map(
      (browser: { name: string; minimum: string }) =>
        `${browser.name} ${browser.minimum}`,
    ),
  }
}

export default async function HomePage() {
  const facts = await getFacts()

  return (
    // The docs routes get their `main` from `DocsShell`; the home page has no
    // shell, and without this the only landmark on it was `body`.
    <main>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: packageName,
          alternateName: siteName,
          description: siteDescription,
          url: siteUrl,
          codeRepository: repositoryUrl,
          programmingLanguage: ['TypeScript', 'JavaScript'],
          runtimePlatform: ['React 18', 'React 19'],
          license: 'https://opensource.org/licenses/MIT',
          author: { '@type': 'Person', name: 'Romullo Queiroz', url: repositoryUrl },
          // The figures below are the same build-time reads the page renders,
          // so the structured claim and the visible claim cannot disagree.
          keywords: [
            'Material 3 Expressive',
            'Material Design 3',
            'React components',
            'design tokens',
            `${facts.componentCount} components`,
            `${facts.runtimeDependencies} runtime dependencies`,
          ].join(', '),
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />
      <section className="hero">
        <div className="hero__grid">
          <div>
            <p className="hero__eyebrow">Open source · Made for the web</p>
            <Text as="h1" variant="displayLarge" emphasis="emphasized" className="hero__title">
              Google’s Material 3 Expressive.<br />
              <span className="hero__accent">Built for React.</span>
            </Text>
            <Text as="p" variant="bodyLarge" className="hero__lede">
              Bring Google’s bold new Material design to the web with React
              components, expressive motion, and a theme that fits your product.
            </Text>
            <div className="hero__actions">
              <LinkButton href="/components/" trailingIcon={<Icon source="arrow_forward" mirrored />}>
                Try the components
              </LinkButton>
              <LinkButton href="/docs/getting-started/" variant="outlined">Get started</LinkButton>
            </div>
            <ul className="hero__facts" aria-label="Library at a glance">
              <li>React 18 &amp; 19</li><li>TypeScript</li><li>MIT licensed</li>
              <li>{facts.runtimeDependencies} runtime dependencies</li>
            </ul>
            <p className="hero__attribution">An independent implementation of Google’s design system.</p>
          </div>
          <HeroShowcase />
        </div>
      </section>

      <section className="section section--research">
        <div className="section__inner research">
          <div>
            <p className="section__eyebrow">Why expressive?</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title">
              Meet Google’s next evolution of Material Design.
            </Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              Material 3 Expressive uses shape, color, size, and motion to draw
              attention to the right actions. It gives familiar interfaces more
              character without throwing away the patterns people already know.
            </Text>
            <a className="research__link" href="https://design.google/library/expressive-material-design-google-research">
              See the research from Google <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="research__evidence">
            <div className="research__numbers">
              <p><strong>46</strong><span>research studies</span></p>
              <p><strong>18,000+</strong><span>participants worldwide</span></p>
            </div>
            <p>Google tested hundreds of designs to learn what makes an interface
              easier to use, more distinct, and more appealing.</p>
          </div>
        </div>
      </section>

      <section className="section section--tinted" id="theming">
        <div className="section__inner">
          <div className="section__head">
            <p className="section__eyebrow">Built around your brand</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title">
              Pick a color. The whole interface follows.
            </Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              Choose one of our presets or use your own source color. Then try
              the same components in light and dark mode.
            </Text>
          </div>
          <ThemeShowcase />
          <details className="theme-details">
            <summary>Show the tonal palettes behind this demo</summary>
            <figure className="ramp-readout">
              <Ramp />
              <figcaption><Text as="span" variant="bodySmall">
                This site generates palettes from your source color and passes them
                to the library’s typed theme API, which validates references and role-pair contrast.
              </Text></figcaption>
            </figure>
          </details>
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <div className="section__head">
            <p className="section__eyebrow">Made for real React apps</p>
            <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title">
              Material design that behaves properly on the web.
            </Text>
            <Text as="p" variant="bodyLarge" className="section__lede">
              Buttons are buttons. Checkboxes submit with forms. Keyboard
              interaction, RTL, reduced motion, and forced colors are built in
              and documented.
            </Text>
          </div>
          <div className="claims">
            <Surface as="article" color="primary-container" shape="extra-large" className="claim">
              <span className="claim__value">{facts.componentCount}</span>
              <Text as="h3" variant="titleMedium">Conformant components</Text>
              <Text as="p" variant="bodyMedium" className="claim__body">
                Build with buttons, inputs, navigation, overlays, and more. Every
                component comes with a live example and conformance record.
              </Text>
              <a href="/components/" className="claim__link">Browse all components →</a>
            </Surface>
            <Surface as="article" color="tertiary-container" shape="large-increased" className="claim">
              <span className="claim__value">{facts.runtimeDependencies}</span>
              <Text as="h3" variant="titleMedium">Extra runtime dependencies</Text>
              <Text as="p" variant="bodyMedium" className="claim__body">
                React and React DOM are the only peers. Styles ship as precompiled
                CSS, with no Tailwind setup or runtime style injection.
              </Text>
              <a href="/docs/getting-started/" className="claim__link">See the setup →</a>
            </Surface>
            <Surface as="article" color="secondary-container" shape="extra-large-increased" className="claim">
              <span className="claim__value">SSR</span>
              <Text as="h3" variant="titleMedium">Tested with server rendering</Text>
              <Text as="p" variant="bodyMedium" className="claim__body">
                Built and checked with Next.js and Vite consumer fixtures.
                Follow the guide for hydration and system color mode.
              </Text>
              <a href="/docs/ssr/" className="claim__link">Read the SSR guide →</a>
            </Surface>
          </div>
          <div className="implementation-notes">
            <p>See how we handle <a href="/docs/web-deviations/">Material adaptations and accessibility on the web</a>.</p>
            <p>Bundle baselines: {facts.jsGzip} kB gzip JavaScript entry + {facts.cssGzip} kB
              gzip complete CSS. Tracked in CI.</p>
            <p>Supported browsers: {facts.browsers.join(', ')}.</p>
          </div>
        </div>
      </section>

      <section className="section section--inverse">
        <div className="section__inner">
          <RampRule />
          <div className="getting-started">
            <div>
              <p className="section__eyebrow">Try it in your project</p>
              <Text as="h2" variant="headlineMedium" emphasis="emphasized" className="section__title">
                Add your first expressive component.
              </Text>
              <Text as="p" variant="bodyLarge" className="section__lede">
                Install the package, import the stylesheet once, and add the
                provider. The default theme is ready to use.
              </Text>
              <InstallCommand command="npm install @language-lit/material3-expressive react react-dom" />
              <div className="hero__actions">
                <LinkButton href="/docs/getting-started/" variant="tonal">Read the installation guide</LinkButton>
                <LinkButton href={repositoryUrl} variant="text" external>View on GitHub</LinkButton>
              </div>
            </div>
            <div className="starter-code">
              <p className="starter-code__label">App.tsx</p>
              <pre tabIndex={0} aria-label="Minimal React setup"><code>{`import {
  Button,
  Material3Provider,
} from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

export default function App() {
  return (
    <Material3Provider>
      <Button variant="filled">Get started</Button>
    </Material3Provider>
  )
}`}</code></pre>
              <p>Using Next.js? Import the stylesheet in your root layout.
                <a href="/docs/ssr/"> See the framework guide →</a></p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
