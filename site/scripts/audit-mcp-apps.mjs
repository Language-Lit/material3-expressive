import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, stat, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(site, 'out')
const executablePath = process.env.M3E_CHROMIUM_PATH
assert(executablePath, 'Set M3E_CHROMIUM_PATH to a Chromium executable.')
await stat(path.join(output, 'mcp-apps/index.html'))
const screenshots = await mkdtemp(path.join(tmpdir(), 'm3e-mcp-apps-'))
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' }
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    let file = path.resolve(output, `.${pathname}`)
    if (file !== output && !file.startsWith(`${output}${path.sep}`)) throw new Error('Outside export')
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html')
    response.setHeader('Content-Type', mime[path.extname(file)] ?? 'application/octet-stream')
    if (pathname === '/mcp-apps/sandbox.html') {
      response.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; frame-src 'self'; frame-ancestors http://127.0.0.1:* http://localhost:*")
    }
    if (pathname === '/mcp-apps/forecast.html') {
      response.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; frame-ancestors http://127.0.0.1:* http://localhost:*")
    }
    response.end(await readFile(file))
  } catch {
    response.writeHead(404).end('Not found')
  }
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
const proxyOrigin = `http://localhost:${server.address().port}`
const browser = await chromium.launch({ executablePath })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
const page = await context.newPage()
const errors = []
const requests = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('request', (request) => requests.push({ url: request.url(), method: request.method() }))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
const proxy = () => page.frameLocator('.mcp-demo iframe')
const frame = () => proxy().frameLocator('iframe')
const waitReady = async () => page.locator('.mcp-demo [data-status="ready"]').waitFor()
const run = async () => {
  await page.getByRole('button', { name: 'Get forecast', exact: true }).click()
  await frame().getByRole('heading', { name: 'Lisbon', exact: true }).waitFor()
}
const reset = async () => {
  await context.setOffline(false)
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click()
  await waitReady()
  await frame().getByText('Waiting for the forecast.', { exact: true }).waitFor()
  await context.setOffline(true)
}
const noOverflow = async () => {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Page overflow')
  assert(await frame().locator('html').evaluate((element) => element.scrollWidth <= window.innerWidth), 'Iframe overflow')
}

try {
  await page.goto(`${origin}/mcp-apps/`, { waitUntil: 'networkidle' })
  await waitReady()
  assert.equal(await page.locator('h1').count(), 1)
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://m3e.language-lit.com/mcp-apps/')
  assert(await page.getByText('Scripted demo. No LLM or API key required.', { exact: true }).isVisible())
  assert(!(await page.locator('main').innerText()).includes('—'))
  assert.equal(await page.locator('.mcp-demo iframe').getAttribute('sandbox'), 'allow-scripts allow-same-origin allow-forms')
  assert.equal(await proxy().locator('iframe').getAttribute('sandbox'), 'allow-scripts allow-forms')
  assert.equal(new URL(page.frames()[1].url()).origin, proxyOrigin)
  assert(await frame().locator('html').evaluate(() => {
    try { return !window.parent.document } catch { return true }
  }), 'App can access host DOM')

  await context.setOffline(true)
  const button = page.getByRole('button', { name: 'Get forecast', exact: true })
  await button.focus()
  await page.keyboard.press('Enter')
  await frame().getByRole('heading', { name: 'Lisbon' }).waitFor()
  const chips = frame().getByRole('group', { name: 'Days' }).getByRole('button')
  assert.equal(await chips.count(), 5)
  const initial = await frame().locator('.fc__summary').textContent()
  await chips.nth(2).focus()
  await page.keyboard.press('Enter')
  assert.equal(await chips.nth(2).getAttribute('aria-pressed'), 'true')
  await page.waitForFunction(() => document.querySelector('.mcp-demo__events')?.textContent.includes('The user is looking at Wed'))
  await frame().getByRole('button', { name: 'Add to chat', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('.mcp-demo__events')?.textContent.includes('Chat message: Plan around Wed'))
  const firstDay = await chips.first().textContent()
  await frame().getByRole('button', { name: 'Refresh', exact: true }).click()
  await chips.first().filter({ hasNotText: firstDay }).waitFor()
  await frame().getByRole('button', { name: 'Refresh', exact: true }).waitFor()
  await page.waitForFunction(() => document.querySelector('.mcp-demo__events')?.textContent.includes('high') || document.querySelector('.mcp-demo__events')?.textContent.includes('°'))

  // The same app instance must retain the selected day when its frame moves.
  await frame().getByRole('button', { name: 'Full screen', exact: true }).click()
  await page.locator('.mcp-demo [data-display-mode="fullscreen"]').waitFor()
  assert.equal(await chips.nth(2).getAttribute('aria-pressed'), 'true')
  await frame().getByRole('button', { name: 'Back inline', exact: true }).click()
  await page.locator('.mcp-demo [data-display-mode="inline"]').waitFor()
  await page.getByRole('button', { name: 'Picture in picture', exact: true }).click()
  await page.locator('.mcp-demo [data-display-mode="pip"]').waitFor()
  assert.equal(await chips.nth(2).getAttribute('aria-pressed'), 'true')
  await page.getByRole('button', { name: 'Return to the conversation', exact: true }).click()
  await page.locator('.mcp-demo [data-display-mode="inline"]').waitFor()

  await frame().getByRole('button', { name: 'About MCP Apps', exact: true }).click()
  await page.waitForFunction(() => document.querySelector('.mcp-demo__events')?.textContent.includes('Link requested:'))
  assert.equal(context.pages().length, 1)
  await reset()
  assert(await page.getByRole('button', { name: 'Get forecast', exact: true }).evaluate((element) => element === document.activeElement))
  await run()
  assert.equal(await chips.nth(0).getAttribute('aria-pressed'), 'true')
  assert.equal(await frame().locator('.fc__summary').textContent(), initial, 'Replay kept refreshed data')
  await page.getByRole('button', { name: 'Show failed tool', exact: true }).click()
  await frame().getByRole('alert').waitFor()
  await reset()
  await run()

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 })
    for (const colorScheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme })
      await frame().getByText(new RegExp(`${colorScheme} theme`)).waitFor()
      await noOverflow()
      const size = await page.locator('.mcp-demo iframe').boundingBox()
      assert(size.height > 200 && size.height <= 621, `Inline auto size at ${width}px: ${JSON.stringify(size)}`)
      await page.locator('.mcp-demo').screenshot({ path: path.join(screenshots, `demo-${width}-${colorScheme}.png`) })
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  assert.equal(await page.locator('.m3e-mcp-frame__viewport').evaluate((element) => getComputedStyle(element).transitionDuration), '0s')
  await context.setOffline(false)
  await page.setViewportSize({ width: 1440, height: 1100 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await frame().locator('.fc__title').scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  await page.screenshot({ path: path.join(screenshots, 'page.png'), fullPage: true })

  for (const route of ['/docs/mcp-apps-getting-started/', '/docs/mcp-apps-hosting/']) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' })
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://m3e.language-lit.com${route}`)
    assert(await page.getByText('MCP Apps guide', { exact: true }).isVisible())
    assert(!(await page.locator('article').innerText()).includes('—'))
    const links = await page.locator('article a[href^="/"]').evaluateAll((elements) => elements.map((element) => element.getAttribute('href')))
    for (const href of links) await stat(path.join(output, href.split('#')[0], 'index.html'))
    const structured = await page.locator('script[type="application/ld+json"]').evaluateAll((elements) => elements.map((element) => JSON.parse(element.textContent)))
    assert.equal(structured.find((entry) => entry['@type'] === 'TechArticle')?.about?.name, '@language-lit/material3-expressive-mcp-apps')
  }
  for (const name of ['sitemap.xml', 'llms.txt', 'llms-full.txt']) {
    const text = await readFile(path.join(output, name), 'utf8')
    assert(text.includes('mcp-apps-getting-started') || text.includes('Getting started with MCP Apps'), name)
  }
  assert.deepEqual(requests.filter((request) => !request.url.startsWith(origin) && !request.url.startsWith(proxyOrigin)), [], 'External requests')
  assert.deepEqual(requests.filter((request) => !['GET', 'HEAD'].includes(request.method)), [], 'Mutating requests')
  assert.deepEqual(errors, [], 'Browser errors')
  process.stdout.write(`MCP Apps audit passed. Screenshots: ${screenshots}\n`)
} catch (error) {
  console.error('Browser errors:', errors)
  console.error('Demo:', await page.locator('.mcp-demo').innerText().catch(() => 'unavailable'))
  for (const child of page.frames().slice(1)) console.error('Frame:', child.url(), await child.locator('body').innerText().catch(() => 'unavailable'))
  await page.screenshot({ path: path.join(screenshots, 'failure.png'), fullPage: true })
  console.error('Screenshots:', screenshots)
  throw error
} finally {
  await browser.close()
  server.close()
}
