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
await stat(path.join(output, 'a2ui/index.html'))
const screenshots = await mkdtemp(path.join(tmpdir(), 'm3e-a2ui-'))
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' }
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    let file = path.resolve(output, `.${pathname}`)
    if (file !== output && !file.startsWith(`${output}${path.sep}`)) throw new Error('Outside export')
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html')
    response.setHeader('Content-Type', mime[path.extname(file)] ?? 'application/octet-stream')
    response.end(await readFile(file))
  } catch {
    response.writeHead(404).end('Not found')
  }
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`
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
const stage = () => page.locator('.a2ui-demo__stage')
// The stage also holds the streamed JSON, so substring checks scope to the surfaces.
const surfaces = () => page.locator('.a2ui-demo__surfaces')
const waitText = async (text) => {
  await page.waitForFunction((value) => document.querySelector('.a2ui-demo__stage')?.textContent.includes(value), text)
}
const select = async (name) => {
  await page.getByRole('button', { name, exact: true }).click()
  await page.getByRole('button', { name: 'Play scenario', exact: true }).waitFor()
}
const play = async () => page.getByRole('button', { name: 'Play scenario', exact: true }).click()
const complete = async () => waitText('Stream complete.')
const reset = async () => {
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click()
  await page.waitForFunction(() => document.activeElement?.textContent === 'Play scenario')
}
const noOverflow = async () => {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow')
}
const actionCount = async () => page.locator('.a2ui-demo__actions > li').count()
const shoot = async (name) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1200 })
    for (const colorScheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme })
      await noOverflow()
      await stage().screenshot({ path: path.join(screenshots, `${name}-${width}-${colorScheme}.png`) })
    }
  }
  await page.emulateMedia({ colorScheme: 'light' })
  await page.setViewportSize({ width: 1440, height: 1000 })
}

try {
  await page.goto(`${origin}/a2ui/`, { waitUntil: 'networkidle' })
  assert.equal(await page.locator('h1').count(), 1)
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://m3e.language-lit.com/a2ui/')
  assert(await page.getByText('Scripted demo. No LLM or API key required.', { exact: true }).isVisible())
  assert(!(await page.locator('main').innerText()).includes('—'), 'Em dash in page copy')
  assert(await page.getByText(/React renderer for Google.s\s+A2UI protocol/).isVisible())
  assert.equal(await page.locator('.a2ui-table tbody th').count(), 18 + 5, 'Component and compatibility rows')
  assert.equal(await page.locator('main input[type="password"]').count(), 0, 'Demo should not ask for credentials')

  // Disconnect before playing: every scenario must work after the static
  // page and its assets have loaded. Surfaces carry only inline images.
  await context.setOffline(true)

  // 1. Streaming: placeholder first, then bindings, then a path update.
  const playButton = page.getByRole('button', { name: 'Play scenario', exact: true })
  await playButton.focus()
  await page.keyboard.press('Enter')
  // The root placeholder shows after createSurface; the card's own
  // placeholder shows once the heading and card arrive without the body.
  await page.locator('.m3e-a2ui-placeholder').first().waitFor()
  await page.getByRole('heading', { name: 'Your trip to Lisbon' }).waitFor()
  assert(await page.locator('.m3e-a2ui-card .m3e-a2ui-placeholder').count() >= 1, 'Card placeholder')
  await waitText('Tokyo (HND) to Lisbon (LIS)')
  // Siblings resolve in separate commits; every placeholder must be gone
  // once the body has rendered.
  await page.waitForFunction(() => document.querySelectorAll('.m3e-a2ui-placeholder').length === 0)
  assert(await stage().getByText('€640.00', { exact: true }).isVisible())
  assert(await stage().getByText(/Fri, Oct 2 at 10:40 AM/).isVisible())
  await complete()
  assert(await stage().getByText('Gate changed to 34. Boarding starts at 10:05.', { exact: true }).isVisible())
  assert(await stage().getByText('Trip agent', { exact: true }).isVisible(), 'Agent attribution')
  await page.locator('.a2ui-demo__stream > summary').click()
  assert((await page.locator('.a2ui-demo__stream pre').textContent()).includes('"createSurface"'))
  await shoot('streaming')
  await reset()
  await play()
  await page.getByRole('button', { name: 'Stop', exact: true }).click()
  await waitText('Demo stopped.')
  const stopped = await page.locator('.a2ui-demo__surfaces').textContent()
  await page.waitForTimeout(1200)
  assert.equal(await page.locator('.a2ui-demo__surfaces').textContent(), stopped, 'Stopped stream continued')
  await reset()

  // 2. Form: checks gate the button; the action carries the resolved model.
  await select('2. Bind, validate, and act')
  await play()
  await complete()
  const reserve = stage().getByRole('button', { name: 'Reserve', exact: true })
  assert(await reserve.isDisabled(), 'Reserve enabled before the data is valid')
  const name = stage().getByRole('textbox', { name: 'Name' })
  await name.fill('Ada')
  await name.press('Tab')
  const email = stage().getByRole('textbox', { name: 'Email' })
  await email.fill('ada')
  await email.press('Tab')
  assert(await stage().getByText('Enter a valid email address', { exact: true }).isVisible())
  assert(await reserve.isDisabled())
  await email.fill('ada@example.com')
  await page.waitForFunction(() => {
    const button = [...document.querySelectorAll('.a2ui-demo__stage button')].find((element) => element.textContent.trim() === 'Reserve')
    return button && !button.disabled
  })
  // Exclusive chips are toggle buttons, not radios.
  const counter = stage().getByRole('button', { name: 'Counter', exact: true })
  await counter.click()
  assert.equal(await counter.getAttribute('aria-pressed'), 'true', 'Chip did not select')
  assert.equal(await stage().getByRole('button', { name: 'Terrace', exact: true }).getAttribute('aria-pressed'), 'false', 'Exclusive chip kept the old choice')
  await reserve.focus()
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => document.querySelectorAll('.a2ui-demo__actions > li').length === 1)
  const context1 = await page.locator('.a2ui-demo__actions pre').first().textContent()
  const parsed = JSON.parse(context1)
  assert.equal(parsed.reservation.name, 'Ada')
  assert.equal(parsed.reservation.email, 'ada@example.com')
  assert.deepEqual(parsed.reservation.seating, ['counter'])
  assert.equal(parsed.reservation.guests, 2)
  assert.equal(parsed.reservation.confirm, true)
  assert((await page.locator('.a2ui-demo__actions').textContent()).includes('reserve'))
  await shoot('form')
  await reset()
  await play()
  await complete()
  assert.equal(await actionCount(), 0, 'Reset kept the action log')
  assert.equal(await stage().getByRole('textbox', { name: 'Name' }).inputValue(), '', 'Reset kept typed data')

  // 3. Layout: tabs by keyboard, modal opens and dispatches, Escape closes.
  await select('3. Cards, tabs, and a modal')
  await play()
  await complete()
  assert(await stage().locator('img.m3e-a2ui-image--header').isVisible())
  assert(await stage().getByRole('link', { name: 'Lisbon Cathedral' }).isVisible())
  const afternoon = stage().getByRole('tab', { name: 'Afternoon', exact: true })
  await afternoon.focus()
  await page.keyboard.press('Enter')
  assert(await stage().getByRole('tabpanel').getByText('Belém and the river', { exact: true }).isVisible())
  await stage().getByRole('tab', { name: 'Evening', exact: true }).click()
  assert.equal(await stage().getByRole('tabpanel').locator('.m3e-a2ui-list__item').count(), 3)
  await stage().getByRole('button', { name: 'Show booking details', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor()
  assert(await dialog.getByText('Two seats for the fado show', { exact: false }).isVisible())
  await page.waitForFunction(() => document.querySelectorAll('.a2ui-demo__actions > li').length === 1)
  assert((await page.locator('.a2ui-demo__actions').textContent()).includes('show_booking'))
  await page.keyboard.press('Escape')
  await page.waitForFunction(() => !document.querySelector('[role="dialog"]') || !document.querySelector('[role="dialog"]').checkVisibility())
  await shoot('layout')

  // 4. Live: path updates, template rows, a second surface, and deletion.
  await select('4. Live updates and a second surface')
  await play()
  await waitText('Rollout started.')
  await waitText('12 of 40 pods are on 2.4.')
  await waitText('One pod restarted')
  await waitText('Rollout complete.')
  await page.waitForFunction(() => document.querySelectorAll('.a2ui-demo__stage .m3e-a2ui-surface').length === 2)
  assert(await surfaces().getByText('Release 2.4 is live.', { exact: false }).isVisible())
  await complete()
  await page.waitForFunction(() => document.querySelectorAll('.a2ui-demo__stage .m3e-a2ui-surface').length === 1)
  // Log rows are Row > caption; the metric captions sit in Columns.
  assert.equal(await surfaces().locator('.m3e-a2ui-row > .m3e-a2ui-text--caption').count(), 4, 'Template rows')
  await shoot('live')

  // Switching scenarios during playback leaves a clean stage.
  await select('1. Streaming a surface')
  await play()
  await select('4. Live updates and a second surface')
  await page.waitForTimeout(600)
  assert.equal(await page.locator('.m3e-a2ui-surface').count(), 0)
  await context.setOffline(false)

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const colorScheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme })
      await noOverflow()
      await page.screenshot({ path: path.join(screenshots, `page-${width}-${colorScheme}.png`), fullPage: true })
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 1000 })

  for (const route of ['/docs/a2ui-getting-started/', '/docs/a2ui-components/']) {
    await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' })
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://m3e.language-lit.com${route}`)
    assert(await page.getByText('A2UI guide', { exact: true }).isVisible())
    assert(!(await page.locator('article').innerText()).includes('—'), `Em dash in ${route}`)
    const links = await page.locator('article a[href^="/"]').evaluateAll((elements) => elements.map((element) => element.getAttribute('href')))
    for (const href of links) {
      const target = href.split('#')[0]
      await stat(path.join(output, target, 'index.html')).catch(() => assert.fail(`${route} links to missing ${href}`))
    }
    const structured = await page.locator('script[type="application/ld+json"]').evaluateAll((elements) => elements.map((element) => JSON.parse(element.textContent)))
    const article = structured.find((entry) => entry['@type'] === 'TechArticle')
    assert.equal(article?.about?.name, '@language-lit/material3-expressive-a2ui', `${route} names the companion`)
  }

  const external = requests.filter((request) => !request.url.startsWith(origin))
  assert.deepEqual(external, [], 'External requests')
  const mutating = requests.filter((request) => !['GET', 'HEAD'].includes(request.method))
  assert.deepEqual(mutating, [], 'Mutating requests')
  assert.deepEqual(errors, [], 'Browser errors')
  process.stdout.write(`A2UI audit passed. Screenshots: ${screenshots}\n`)
} finally {
  await browser.close()
  server.close()
}
