import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const output = path.resolve(fileURLToPath(new URL('../out/', import.meta.url)))
const executablePath = process.env.M3E_CHROMIUM_PATH
assert(executablePath, 'Set M3E_CHROMIUM_PATH to a Chromium executable.')
await stat(path.join(output, 'index.html'))
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.txt': 'text/plain' }
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

let browser
try {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  browser = await chromium.launch({ executablePath })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.addInitScript(() => {
    window.themeWrites = 0
    window.eyeDropperCalls = 0
    window.EyeDropper = class {
      constructor() {
        window.eyeDropperCalls += 1
        throw new Error('Screen sampling must not be used by color selection')
      }
    }
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'm3e-site-theme') window.themeWrites += 1
      return original.call(this, key, value)
    }
  })
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle' })
  const theme = page.locator('.site-theme')
  const trigger = page.getByRole('button', { name: /^Theme(, customized)?$/ })
  const dialog = page.getByRole('dialog', { name: 'Theme', exact: true })
  const showcase = page.locator('.showcase')
  // Opening the React-controlled dialog proves hydration and effects completed.
  await trigger.click()
  await dialog.waitFor()
  assert.equal(await page.locator('input[type="color"]').count(), 0, 'No native color picker, including in hidden content')
  const baseline = await dialog.locator('.swatch[aria-pressed="true"]').getAttribute('aria-label')
  const writes = () => page.evaluate(() => window.themeWrites)
  const stored = () => page.evaluate(() => JSON.parse(localStorage.getItem('m3e-site-theme') ?? '{}'))
  const waitSource = async (name) => {
    await page.waitForFunction((expected) => {
      const rows = [...document.querySelectorAll('.swatches')]
      return rows.length === 2 && rows.every((row) =>
        row.querySelector('.swatch[aria-pressed="true"]')?.getAttribute('aria-label') === expected)
    }, name)
  }

  for (const container of [dialog, showcase]) {
    const presets = await container.locator('.swatch').all()
    assert.equal(presets.length, 6, 'Six source-color presets')
    for (const preset of presets) {
      const name = await preset.getAttribute('aria-label')
      const beforeWrites = await writes()
      await preset.click()
      await waitSource(name)
      assert.equal(await writes(), beforeWrites + 1, 'Each preset click saves once')
    }
    assert(await theme.getAttribute('style'), 'Custom palette reaches provider')
    await container.getByRole('button', { name: 'Cobalt', exact: true }).focus()
    await page.keyboard.press('Enter')
    await waitSource('Cobalt')
    assert.equal((await stored()).sourceColor, '#2f5bd0')

    const customTrigger = container.getByRole('button', { name: 'Custom source color', exact: true })
    const editor = page.getByRole('dialog', { name: 'Custom source color', exact: true })
    await customTrigger.click()
    await editor.waitFor()
    const hex = editor.getByRole('textbox', { name: 'Hex color', exact: true })
    assert.equal(await hex.inputValue(), '#2f5bd0')
    const beforeDraftWrites = await writes()
    const beforeDraftStyle = await theme.getAttribute('style')
    const red = editor.getByRole('slider', { name: 'Red', exact: true })
    await red.focus()
    await page.keyboard.press('Home')
    await page.keyboard.press('ArrowRight')
    assert.equal(await red.inputValue(), '1', 'RGB keyboard steps are one unit')
    const box = await red.boundingBox()
    assert(box)
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2, { steps: 80 })
    await page.mouse.up()
    assert(Number(await red.inputValue()) > 128, 'Pointer dragging changes the channel')
    assert.equal(await writes(), beforeDraftWrites, 'Dragging stays local')
    assert.equal(await theme.getAttribute('style'), beforeDraftStyle, 'Dragging does not reapply the site theme')
    await hex.fill('#xyz')
    assert.equal(await hex.getAttribute('aria-invalid'), 'true')
    assert(await editor.getByRole('button', { name: 'Apply', exact: true }).isDisabled())
    await hex.press('Enter')
    assert(await editor.isVisible(), 'Invalid hex cannot be applied with Enter')
    await hex.fill('287C65')
    assert.equal(await editor.locator('.source-color-editor__preview').evaluate((node) => getComputedStyle(node).backgroundColor), 'rgb(40, 124, 101)')

    if (container === dialog) {
      for (const width of [1440, 320]) {
        await page.setViewportSize({ width, height: 900 })
        for (const mode of ['light', 'dark']) {
          await page.emulateMedia({ colorScheme: mode })
          await editor.screenshot({ path: `/tmp/m3e-color-editor-${width}-${mode}.png` })
          assert(await editor.evaluate((node) => node.scrollWidth <= node.clientWidth), 'Editor has no horizontal overflow')
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Page has no horizontal overflow')
        }
      }
      await page.setViewportSize({ width: 1440, height: 1000 })
      await page.emulateMedia({ colorScheme: 'light' })
    }
    await editor.getByRole('button', { name: 'Apply', exact: true }).click()
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('m3e-site-theme')).sourceColor === '#287c65')
    assert.equal(await writes(), beforeDraftWrites + 1, 'Apply saves once')
    await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Custom source color')
    if (container === dialog) assert(await dialog.isVisible(), 'Parent theme dialog stays open')

    await customTrigger.click()
    assert.equal(await hex.inputValue(), '#287c65', 'Reopen starts from applied custom color')
    await hex.fill('#ff0000')
    await editor.getByRole('button', { name: 'Cancel', exact: true }).click()
    assert.equal((await stored()).sourceColor, '#287c65', 'Cancel discards draft')
    await customTrigger.click()
    assert.equal(await hex.inputValue(), '#287c65')
    await hex.fill('#00ff00')
    await page.keyboard.press('Escape')
    await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Custom source color')
    assert.equal((await stored()).sourceColor, '#287c65', 'Escape discards draft')
    assert.equal(await writes(), beforeDraftWrites + 1, 'Cancelled edits never persist')
    if (container === dialog) await dialog.getByRole('button', { name: 'Done', exact: true }).click()
  }

  await trigger.click()
  await dialog.getByRole('button', { name: 'Reset', exact: true }).click()
  await waitSource(baseline)
  assert(await dialog.getByRole('button', { name: 'Reset', exact: true }).isDisabled())
  await dialog.getByRole('radio', { name: 'Dark', exact: true }).check()
  assert.equal(await theme.getAttribute('data-m3e-color-mode'), 'dark')
  await dialog.getByRole('radio', { name: 'Light', exact: true }).check()
  assert.equal(await theme.getAttribute('data-m3e-color-mode'), 'light')
  await dialog.getByRole('button', { name: 'Viridian', exact: true }).click()
  await waitSource('Viridian')
  await page.reload({ waitUntil: 'networkidle' })
  await waitSource('Viridian')
  assert.equal((await stored()).sourceColor, '#1c7a5b')
  assert.equal(await theme.getAttribute('data-m3e-color-mode'), 'light')
  assert.equal(await page.locator('input[type="color"]').count(), 0)

  // Previously saved custom colors remain loadable, and Reset still clears them.
  await page.evaluate(() => localStorage.setItem('m3e-site-theme', JSON.stringify({
    sourceColor: '#287c65', colorMode: 'dark',
  })))
  await page.reload({ waitUntil: 'networkidle' })
  await trigger.click()
  await dialog.waitFor()
  assert.equal(await theme.getAttribute('data-m3e-color-mode'), 'dark')
  assert.equal(await page.locator('.swatch[aria-pressed="true"]').count(), 0)
  assert.equal(await page.locator('input[type="color"]').count(), 0)
  await dialog.getByRole('button', { name: 'Reset', exact: true }).click()
  await waitSource(baseline)
  assert.deepEqual(errors, [], 'No runtime errors')
  assert.equal(await page.evaluate(() => window.eyeDropperCalls), 0, 'No screen-sampling calls')
  console.log('Theme controls audit passed: custom RGB/hex selection, local drafts, Apply/Cancel/Escape, focus, narrow layouts, presets, Reset, modes, persistence; no native picker or eyedropper.')
} finally {
  await browser?.close()
  await new Promise((resolve) => server.close(resolve))
}
