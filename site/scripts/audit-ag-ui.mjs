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
await stat(path.join(output, 'ag-ui/index.html'))
const screenshots = await mkdtemp(path.join(tmpdir(), 'm3e-ag-ui-'))
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
  // The SDK logs intentional run failures and aborts. Those are exercised below.
  if (message.type() === 'error' && !/DEMO_UNAVAILABLE|sample departures|AbortError|Demo stopped/.test(message.text())) errors.push(message.text())
})
const waitText = async (text) => {
  await page.waitForFunction((value) => document.querySelector('.agui-demo__stage')?.textContent.includes(value), text)
}
const select = async (name) => {
  await page.getByRole('button', { name, exact: true }).click()
  await page.getByRole('button', { name: 'Play scenario', exact: true }).waitFor()
}
const play = async () => page.getByRole('button', { name: 'Play scenario', exact: true }).click()
const complete = async () => waitText('Demo complete.')
const reset = async () => {
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click()
  await page.waitForFunction(() => document.activeElement?.textContent === 'Play scenario')
}
const noOverflow = async () => {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow')
  const clippedTabs = await page.locator('.agui-weather [role="tab"], .agui-project [role="tab"]').evaluateAll((elements) => elements.filter((element) => {
    const card = element.closest('.agui-weather, .agui-project').getBoundingClientRect()
    const tab = element.getBoundingClientRect()
    return tab.left < card.left || tab.right > card.right
  }).map((element) => element.textContent))
  assert.deepEqual(clippedTabs, [], 'Tabs clipped by their card')
}
const progressValue = async () => Number(await page.getByRole('progressbar', { name: 'Project completion' }).getAttribute('aria-valuenow'))

try {
  await page.goto(`${origin}/ag-ui/`, { waitUntil: 'networkidle' })
  assert.equal(await page.locator('h1').count(), 1)
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://m3e.language-lit.com/ag-ui/')
  assert(await page.getByText('Scripted demo. No LLM or API key required.', { exact: true }).isVisible())
  assert(!(await page.locator('main').innerText()).includes('\u2014'), 'Em dash in page copy')
  assert(await page.getByText('CopilotKit 1.71.x v1 only', { exact: true }).isVisible())
  assert.equal(await page.locator('main input[type="password"], main input[type="text"], main textarea').count(), 0, 'Demo should not ask for credentials')

  // Disconnect before playing: every scenario, including approval/resume,
  // must work after the static page and its assets have loaded.
  await context.setOffline(true)
  const playButton = page.getByRole('button', { name: 'Play scenario', exact: true })
  await playButton.focus()
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: /Thinking|Thought process/ }).click()
  await waitText('scripted reasoning notes')
  await complete()
  assert(await page.getByText(/Material 3 Expressive uses color, shape, and motion/).isVisible())
  await reset()
  await play()
  await page.getByRole('button', { name: 'Stop', exact: true }).click()
  await waitText('Demo stopped.')
  const stopped = await page.locator('.agui-demo__transcript').textContent()
  await page.waitForTimeout(450)
  assert.equal(await page.locator('.agui-demo__transcript').textContent(), stopped, 'Stopped stream continued')
  await reset()

  await select('2. Tool call and result')
  await play()
  await page.getByRole('button', { name: /search_components/ }).click()
  await page.waitForFunction(() => {
    const card = document.querySelector('.m3e-agui-tool-call[data-status="streaming"]')
    const code = card?.querySelector('pre')?.textContent
    return code?.includes('query') && !code.includes('limit') && card.textContent.includes('still arriving')
  })
  await complete()
  assert(await page.getByText('Brief feedback about an operation.', { exact: false }).isVisible())

  await select('3. Weather card')
  await play()
  await page.getByRole('article', { name: 'Sample weather forecast' }).waitFor()
  await waitText('Receiving forecast details')
  await complete()
  assert(await page.getByRole('heading', { name: 'Kyoto' }).isVisible())
  await page.waitForFunction(() => {
    const selected = document.querySelector('.agui-weather [role="tab"][aria-selected="true"]')
    const indicator = document.querySelector('.agui-weather .m3e-tabs__indicator')
    return selected && indicator && Math.abs(selected.getBoundingClientRect().width - indicator.getBoundingClientRect().width) < 1
  })
  assert(await page.getByLabel('24° C', { exact: true }).isVisible())
  await page.getByRole('radio', { name: '°F', exact: true }).check()
  assert(await page.getByLabel('75° F', { exact: true }).isVisible())
  const tomorrow = page.getByRole('tab', { name: 'Tomorrow', exact: true })
  await tomorrow.focus()
  await page.keyboard.press('Enter')
  assert(await page.getByRole('tabpanel').getByText(/Rain in the afternoon/).isVisible())
  assert(await page.getByRole('tabpanel').getByText('60%', { exact: true }).isVisible())
  await page.getByRole('radio', { name: '°C', exact: true }).check()
  assert(await page.getByRole('tabpanel').getByText('23° C', { exact: true }).isVisible())

  await select('4. Project plan')
  await play()
  await complete()
  assert.equal(await progressValue(), 1 / 3)
  await page.getByRole('checkbox', { name: 'Build the prototype' }).focus()
  await page.keyboard.press('Space')
  await page.getByRole('checkbox', { name: 'Review with the team' }).check()
  await waitText('3 of 3 tasks complete')
  assert.equal(await progressValue(), 1)
  await page.getByRole('tab', { name: 'Schedule', exact: true }).click()
  assert.equal(await page.getByRole('tabpanel').getByText('Complete', { exact: true }).count(), 3)
  await page.getByRole('tab', { name: 'Checklist', exact: true }).click()
  assert(await page.getByRole('checkbox', { name: 'Build the prototype' }).isChecked())
  await reset()
  await play()
  await complete()
  assert.equal(await progressValue(), 1 / 3)
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1200 })
    for (const colorScheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme })
      await noOverflow()
      await page.locator('.agui-demo__stage').screenshot({ path: path.join(screenshots, `project-${width}-${colorScheme}.png`) })
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 })

  await select('5. Human approval')
  await play()
  await waitText('Waiting for your approval.')
  assert(await page.getByRole('article', { name: 'Sample invitation preview' }).isVisible())
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1200 })
    for (const colorScheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme })
      await noOverflow()
      await page.locator('.agui-demo__stage').screenshot({ path: path.join(screenshots, `approval-${width}-${colorScheme}.png`) })
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  const approve = page.getByRole('button', { name: 'Approve', exact: true })
  await approve.focus()
  await page.keyboard.press('Enter')
  await complete()
  assert(await page.getByText(/Approved. In a connected app/).isVisible())
  assert(await page.getByText('Approved in this demo. Nothing was sent.', { exact: true }).isVisible())
  assert.equal(await page.locator('.agui-demo__transcript').evaluate((element) => element === document.activeElement), true, 'Approval lost focus')
  await reset()
  await play()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await complete()
  assert(await page.getByText('Cancelled. The invitation will not be sent.', { exact: true }).isVisible())
  assert(await page.getByText('Cancelled. Nothing was sent.', { exact: true }).isVisible())

  await select('6. Failed run')
  await play()
  await waitText('Run failed:')
  assert(await page.getByRole('status').filter({ hasText: 'Run failed:' }).isVisible())
  await reset()
  await play()
  await waitText('Run failed:')

  // Switching scenarios aborts the old agent and leaves a clean transcript.
  await select('1. Streaming and reasoning')
  await play()
  await select('3. Weather card')
  await page.waitForTimeout(450)
  assert.equal(await page.locator('.m3e-agui-assistant-message').count(), 0)
  await play()
  await complete()
  await context.setOffline(false)

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const colorScheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme })
      await page.waitForTimeout(200)
      await noOverflow()
      if (width === 1440 || width === 390) {
        await page.evaluate(() => window.scrollTo(0, 0))
        await page.screenshot({ path: path.join(screenshots, `${width}-${colorScheme}.png`), fullPage: true })
        await page.locator('.agui-demo__stage').screenshot({ path: path.join(screenshots, `demo-${width}-${colorScheme}.png`) })
      }
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await select('1. Streaming and reasoning')
  await play()
  await page.waitForFunction(() => !!document.querySelector('.m3e-agui-caret'))
  assert.equal(await page.locator('.m3e-agui-caret').first().evaluate((element) => getComputedStyle(element).animationName), 'none')
  await complete()

  // The mobile drawer and desktop bar both expose the route.
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  assert(await page.getByRole('dialog').locator('a[href="/ag-ui/"]').isVisible())
  assert(await page.getByRole('dialog').getByRole('link', { name: 'AG-UI components and tool renderers', exact: true }).isVisible())
  await page.keyboard.press('Escape')
  const sitemap = await (await context.request.get(`${origin}/sitemap.xml`)).text()
  assert(sitemap.includes('https://m3e.language-lit.com/ag-ui/'))
  const discovery = await (await context.request.get(`${origin}/llms.txt`)).text()
  assert(discovery.includes('/ag-ui/'))

  // Local guides use the existing docs shell and are reachable from discovery.
  for (const slug of ['ag-ui-getting-started', 'ag-ui-components', 'ag-ui-copilotkit']) {
    assert(sitemap.includes(`/docs/${slug}/`))
    assert(discovery.includes(`/docs/${slug}/`))
    await page.goto(`${origin}/docs/${slug}/`, { waitUntil: 'networkidle' })
    assert.equal(await page.locator('h1').count(), 1)
    assert(!(await page.locator('article').innerText()).includes('\u2014'), 'Em dash in guide copy')
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://m3e.language-lit.com/docs/${slug}/`)
    const articleMetadata = await page.locator('script[type="application/ld+json"]').allTextContents()
    assert(articleMetadata.some((value) => {
      const data = JSON.parse(value)
      return data['@type'] === 'TechArticle' && data.about.name === '@language-lit/material3-expressive-ag-ui'
    }))
    const links = await page.locator('.prose a[href^="/"]').evaluateAll((elements) => elements.map((element) => element.getAttribute('href')))
    for (const href of new Set(links)) {
      const response = await context.request.get(`${origin}${href.split('#')[0]}`)
      assert.equal(response.status(), 200, `Broken guide link: ${href}`)
    }
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      for (const colorScheme of ['light', 'dark']) {
        await page.emulateMedia({ colorScheme })
        await noOverflow()
        if (width !== 320) await page.screenshot({ path: path.join(screenshots, `${slug}-${width}-${colorScheme}.png`), fullPage: true })
      }
    }
  }
  assert.deepEqual(requests.filter((request) => !request.url.startsWith(origin) || !['GET', 'HEAD'].includes(request.method)), [], 'Unexpected external or mutating request')
  assert.deepEqual(errors, [], 'Browser errors')
  console.log(`AG-UI production audit passed. Screenshots: ${screenshots}`)
} catch (error) {
  await page.screenshot({ path: path.join(screenshots, 'failure.png'), fullPage: true })
  console.error(`Audit screenshot: ${screenshots}/failure.png`)
  console.error('Browser errors:', errors)
  if (await page.locator('.agui-demo__stage').count()) console.error('Demo:', await page.locator('.agui-demo__stage').innerText())
  throw error
} finally {
  await browser.close()
  await new Promise((resolve) => server.close(resolve))
}
