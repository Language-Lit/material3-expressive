import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const playgroundDist = path.join(root, 'playground/dist')

/**
 * Browser rendering audit for the component set.
 *
 * The unit tests run in jsdom, which has no layout: it cannot know that an
 * element's shadow is being clipped by an ancestor, that a control's hit area
 * is too small, or that a hover state never paints. Those defects compile,
 * pass every existing gate, and are still wrong on screen — T29 exists because
 * one of them shipped.
 *
 * This is deliberately not part of `npm run verify`: it needs a real browser
 * and the built playground. Run it after changing component geometry, state
 * layers, or elevation:
 *
 *   npm run build && npm run playground:build && npm run audit:rendering
 *
 * Findings are reported, not thrown, except where they are unambiguous. Judge
 * each one — a clip can be a component's documented shape contract rather than
 * a defect. Cleared findings belong in the allowlists below with their reason.
 */

/**
 * Clipping that is a component's contract rather than a defect.
 *
 * `Surface` clips content to its shape, which is what Material's own
 * `Modifier.clip(shape)` does, and the progress components draw an oversized
 * path inside a clip to express their value. A child shadow cut by either is
 * expected.
 */
const legitimateClips = [
  { selector: 'm3e-surface', reason: 'Surface clips content to its shape by contract' },
  { selector: 'wave-clip', reason: 'WavyProgress clips an oversized wave path to the value' },
  { selector: 'progress', reason: 'Progress indicators clip their track/indicator geometry' },
  { selector: 'example__frame', reason: 'Playground example frame, not library CSS' },
]

/**
 * Controls whose measured hit area is smaller than 44px on an axis, with the
 * conformance reason. `SegmentedButtonGroup` matches the pinned Compose source,
 * which applies no `minimumInteractiveComponentSize` there.
 */
const smallTargetExemptions = [
  {
    selector: 'm3e-segmented-button__input',
    reason:
      'Pinned Compose source applies no minimumInteractiveComponentSize to segmented buttons; ' +
      '40px container height still clears WCAG 2.2 SC 2.5.8 (24px). Recorded in the component conformance file.',
  },
  {
    selector: 'm3e-split-button__trailing',
    reason:
      'Width is the sum of the pinned trailing-leading-space, icon size, and trailing-trailing-space ' +
      'tokens per size tier, so it is spec geometry rather than a layout choice. 48px tall and at least ' +
      '32px wide, which clears WCAG 2.2 SC 2.5.8 (24px).',
  },
]

/*
 * Hover, focus, and pressed rendering is deliberately NOT audited here.
 *
 * It was tried and removed. Measuring it reliably needs per-component knowledge
 * of where the state layer lives — it sits on a sibling for the native inputs
 * and on a descendant container for the buttons — and `:focus-visible` only
 * matches once keyboard modality is established, so a naive pass reports every
 * component as broken. Every state was verified by hand during T29 and paints
 * correctly. A gate that cries wolf is worse than no gate, so this file only
 * asserts what it can assert without false positives.
 */

function serve(directory, port) {
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
  }
  const server = createServer((request, response) => {
    const url = decodeURIComponent(request.url.split('?')[0])
    let file = path.join(directory, url)
    if (!existsSync(file) || statSync(file).isDirectory()) file = path.join(directory, 'index.html')
    response.setHeader('content-type', types[path.extname(file)] ?? 'application/octet-stream')
    createReadStream(file).pipe(response)
  })
  return new Promise((resolve) => server.listen(port, () => resolve(server)))
}

if (!existsSync(path.join(playgroundDist, 'index.html'))) {
  process.stderr.write(
    'playground/dist is missing. Run npm run build && npm run playground:build first.\n',
  )
  process.exit(1)
}

let chromium
try {
  ;({ chromium } = await import('playwright-core'))
} catch {
  process.stderr.write('playwright-core is not installed; skipping the rendering audit.\n')
  process.exit(0)
}

const executablePath = process.env.M3E_CHROMIUM_PATH
if (!executablePath) {
  process.stderr.write(
    'Set M3E_CHROMIUM_PATH to a Chromium/Chrome executable to run the rendering audit.\n',
  )
  process.exit(0)
}

const server = await serve(playgroundDist, 4599)
const browser = await chromium.launch({ executablePath })
const context = await browser.newContext({ viewport: { width: 1400, height: 1200 }, hasTouch: false })
const page = await context.newPage()
await page.goto('http://localhost:4599/', { waitUntil: 'networkidle' })
await page.waitForTimeout(900)

// The library gates hover styles behind `@media (hover: hover)`, correctly. An
// audit run without a fine pointer reports every hover state as missing, which
// is a harness failure rather than a finding.
const pointer = await page.evaluate(() => ({
  hover: matchMedia('(hover: hover)').matches,
  fine: matchMedia('(pointer: fine)').matches,
}))
if (!pointer.hover || !pointer.fine) {
  process.stderr.write(
    'This browser reports no hover-capable fine pointer; hover findings would all be false. Aborting.\n',
  )
  await browser.close()
  server.close()
  process.exit(1)
}

// Expand anything that hides content behind an interaction.
const trigger = await page.$('.m3e-fab-menu__trigger')
if (trigger) {
  await trigger.click()
  await page.waitForTimeout(1000)
}

const findings = []

// --- Elevation shadows clipped by an ancestor -------------------------------
const clipped = await page.evaluate(() => {
  const extentOf = (shadow) => {
    let extent = 0
    for (const layer of shadow.split(/,(?![^()]*\))/)) {
      const numbers = [...layer.matchAll(/(-?[\d.]+)px/g)].map((match) => parseFloat(match[1]))
      if (numbers.length >= 3) {
        extent = Math.max(extent, Math.abs(numbers[0]) + Math.abs(numbers[1]) + numbers[2] + (numbers[3] ?? 0))
      }
    }
    return extent
  }
  const results = []
  for (const element of document.querySelectorAll('*')) {
    const styles = getComputedStyle(element)
    if (!styles.boxShadow || styles.boxShadow === 'none' || styles.boxShadow.includes('inset')) continue
    const extent = extentOf(styles.boxShadow)
    if (extent < 2) continue
    const box = element.getBoundingClientRect()
    if (box.width < 6 || box.height < 6) continue
    let ancestor = element.parentElement
    while (ancestor && ancestor !== document.body) {
      const ancestorStyles = getComputedStyle(ancestor)
      if (/hidden|clip/.test(ancestorStyles.overflowX) || /hidden|clip/.test(ancestorStyles.overflowY)) {
        const ancestorBox = ancestor.getBoundingClientRect()
        const cut =
          box.left - extent < ancestorBox.left - 0.5 ||
          box.right + extent > ancestorBox.right + 0.5 ||
          box.top - extent < ancestorBox.top - 0.5 ||
          box.bottom + extent > ancestorBox.bottom + 0.5
        if (cut) {
          results.push({
            element: `${element.tagName}.${String(element.className).slice(0, 40)}`,
            clipper: String(ancestor.className).slice(0, 60),
            extent: Math.round(extent),
          })
        }
        break
      }
      ancestor = ancestor.parentElement
    }
    }
  return results
})

for (const hit of clipped) {
  const allowed = legitimateClips.find((entry) => hit.clipper.includes(entry.selector))
  if (allowed) continue
  findings.push(
    `Elevation shadow clipped: ${hit.element} (~${hit.extent}px) cut by .${hit.clipper}. ` +
      'A wrapper that clips a shadowed child without a shape of its own leaves only the shadow corners.',
  )
}

// --- Interactive target size ------------------------------------------------
const small = await page.evaluate(() => {
  const results = []
  const selector =
    'button,[role=tab],[role=menuitem],[role=menuitemcheckbox],input[type=checkbox],input[type=radio],input[type=range],a[href],[role=switch]'
  for (const element of document.querySelectorAll(selector)) {
    const box = element.getBoundingClientRect()
    if (box.width === 0 || box.height === 0) continue
    if (element.closest('[aria-hidden="true"]')) continue
    if (box.height < 44 || box.width < 44) {
      results.push({
        element: `${element.tagName}.${String(element.className).slice(0, 40)}`,
        size: `${Math.round(box.width)}x${Math.round(box.height)}`,
      })
    }
  }
  return results
})

for (const hit of small) {
  const exempt = smallTargetExemptions.find((entry) => hit.element.includes(entry.selector))
  if (exempt) continue
  findings.push(`Interactive target under 44px: ${hit.element} is ${hit.size}`)
}

// --- Chip source geometry ---------------------------------------------------
// T38 translates a 32dp visual container inside a 48dp interaction target,
// fixed 18dp icon / 24dp avatar slots, zero-width absent slots, and a flexible
// label that must not consume its trailing icon.
const chipGeometry = await page.evaluate(() => {
  const results = []
  for (const chip of document.querySelectorAll('.m3e-chip')) {
    const root = chip.getBoundingClientRect()
    const container = chip.querySelector('.m3e-chip__container')?.getBoundingClientRect()
    if (!container) {
      results.push('missing visual container')
      continue
    }
    if (root.width < 47.5 || root.height < 47.5) {
      results.push(`target ${Math.round(root.width)}x${Math.round(root.height)}`)
    }
    if (container.height < 31.5) {
      results.push(`visual height ${container.height.toFixed(1)}px`)
    }
    if (Math.abs(root.top + root.height / 2 - (container.top + container.height / 2)) > 1) {
      results.push('visual container is not centered in target')
    }

    for (const slot of chip.querySelectorAll('.m3e-chip__slot')) {
      const box = slot.getBoundingClientRect()
      const visible = slot.getAttribute('data-m3e-visible') === 'true'
      const expected = slot.getAttribute('data-m3e-slot') === 'avatar' ? 24 : 18
      if (visible && (Math.abs(box.width - expected) > 0.6 || Math.abs(box.height - expected) > 0.6)) {
        results.push(
          `${slot.getAttribute('data-m3e-slot')} slot ${box.width.toFixed(1)}x${box.height.toFixed(1)}`,
        )
      }
      if (!visible && box.width > 0.6) {
        results.push(`hidden ${slot.getAttribute('data-m3e-position')} slot is ${box.width.toFixed(1)}px`)
      }
    }

    const label = chip.querySelector('.m3e-chip__label')?.getBoundingClientRect()
    const trailing = chip.querySelector(
      '.m3e-chip__slot[data-m3e-position="trailing"][data-m3e-visible="true"]',
    )?.getBoundingClientRect()
    if (label && trailing) {
      const rtl = getComputedStyle(chip).direction === 'rtl'
      const overlaps = rtl ? label.left < trailing.right - 0.5 : label.right > trailing.left + 0.5
      if (overlaps) results.push('label overlaps trailing slot')
    }
  }
  return results
})

for (const finding of chipGeometry) findings.push(`Chip geometry: ${finding}`)

// --- List Item source geometry ---------------------------------------------
// T40 preserves the 56/72/88px minimum line heights, 16px logical edge
// padding, 12px slot spacing, full-row native selection input, and segmented
// 2px gap / logical outer-corner treatment.
const listItemGeometry = await page.evaluate(() => {
  const results = []
  const expectedMinimums = { 1: 56, 2: 72, 3: 88 }
  for (const item of document.querySelectorAll('.m3e-list-item')) {
    const root = item.getBoundingClientRect()
    const styles = getComputedStyle(item)
    const lines = item.getAttribute('data-m3e-lines')
    const expectedMinimum = expectedMinimums[lines]
    if (expectedMinimum && root.height < expectedMinimum - 0.5) {
      results.push(`${lines}-line height ${root.height.toFixed(1)}px`)
    }
    if (
      Math.abs(Number.parseFloat(styles.paddingInlineStart) - 16) > 0.6 ||
      Math.abs(Number.parseFloat(styles.paddingInlineEnd) - 16) > 0.6
    ) {
      results.push(
        `inline padding ${styles.paddingInlineStart}/${styles.paddingInlineEnd}`,
      )
    }

    const leading = item.querySelector('.m3e-list-item__leading')
    const trailing = item.querySelector('.m3e-list-item__trailing')
    if (
      leading &&
      Math.abs(Number.parseFloat(getComputedStyle(leading).marginInlineEnd) - 12) >
        0.6
    ) {
      results.push('leading slot spacing is not 12px')
    }
    if (
      trailing &&
      Math.abs(
        Number.parseFloat(getComputedStyle(trailing).marginInlineStart) - 12,
      ) > 0.6
    ) {
      results.push('trailing slot spacing is not 12px')
    }

    const input = item.querySelector('.m3e-list-item__input')
    if (input) {
      const inputBox = input.getBoundingClientRect()
      if (
        Math.abs(inputBox.left - root.left) > 0.6 ||
        Math.abs(inputBox.right - root.right) > 0.6 ||
        Math.abs(inputBox.top - root.top) > 0.6 ||
        Math.abs(inputBox.bottom - root.bottom) > 0.6
      ) {
        results.push('native selection input does not cover the row')
      }
    }

    if (item.getAttribute('data-m3e-segmented') !== 'true') continue
    const position = item.getAttribute('data-m3e-position')
    const radii = {
      topStart: Number.parseFloat(styles.borderStartStartRadius),
      topEnd: Number.parseFloat(styles.borderStartEndRadius),
      bottomStart: Number.parseFloat(styles.borderEndStartRadius),
      bottomEnd: Number.parseFloat(styles.borderEndEndRadius),
    }
    if (
      (position === 'middle' || position === 'last') &&
      Math.abs(Number.parseFloat(styles.marginBlockStart) - 2) > 0.6
    ) {
      results.push(`${position} segmented gap is not 2px`)
    }
    if (
      position === 'first' &&
      !(
        radii.topStart > radii.bottomStart &&
        radii.topEnd > radii.bottomEnd
      )
    ) {
      results.push('first segmented item lacks outer top corners')
    }
    if (
      position === 'last' &&
      !(
        radii.bottomStart > radii.topStart &&
        radii.bottomEnd > radii.topEnd
      )
    ) {
      results.push('last segmented item lacks outer bottom corners')
    }
    if (
      position === 'middle' &&
      input?.matches(':checked') &&
      new Set(Object.values(radii).map((value) => value.toFixed(1))).size !== 1
    ) {
      results.push('selected middle segmented item does not use one state shape')
    }
  }
  return results
})

for (const finding of listItemGeometry) findings.push(`List Item geometry: ${finding}`)

// --- Slider source geometry -------------------------------------------------
// T39 keeps a 16px track and 4x44px handle inside a minimum 48px target,
// transposes axes for vertical orientation, projects discrete points between
// the 8px corner centers, and clips ticks/stops out of physical thumb gaps.
const sliderGeometry = await page.evaluate(() => {
  const results = []
  for (const slider of document.querySelectorAll('.m3e-slider')) {
    const root = slider.getBoundingClientRect()
    const track = slider.querySelector('.m3e-slider__track')?.getBoundingClientRect()
    const thumbs = [...slider.querySelectorAll('.m3e-slider__thumb')].map((thumb) =>
      thumb.getBoundingClientRect(),
    )
    const vertical = slider.getAttribute('data-m3e-orientation') === 'vertical'
    const rtl = getComputedStyle(slider).direction === 'rtl'

    if (root.width < 47.5 || root.height < 47.5) {
      results.push(`target ${root.width.toFixed(1)}x${root.height.toFixed(1)}`)
    }
    if (!track) {
      results.push('missing track')
      continue
    }
    const trackThickness = vertical ? track.width : track.height
    if (Math.abs(trackThickness - 16) > 0.6) {
      results.push(`track thickness ${trackThickness.toFixed(1)}px`)
    }
    for (const thumb of thumbs) {
      const main = vertical ? thumb.height : thumb.width
      const cross = vertical ? thumb.width : thumb.height
      if (Math.abs(main - 4) > 0.6 || Math.abs(cross - 44) > 0.6) {
        results.push(
          `${vertical ? 'vertical' : 'horizontal'} handle ` +
            `${thumb.width.toFixed(1)}x${thumb.height.toFixed(1)}`,
        )
      }
      const rootCenter = vertical
        ? root.left + root.width / 2
        : root.top + root.height / 2
      const thumbCenter = vertical
        ? thumb.left + thumb.width / 2
        : thumb.top + thumb.height / 2
      if (Math.abs(rootCenter - thumbCenter) > 1) {
        results.push('handle is not centered on the cross axis')
      }

      const thumbMainCenter = vertical
        ? thumb.top + thumb.height / 2
        : thumb.left + thumb.width / 2
      const segmentBoxes = [
        ...slider.querySelectorAll('.m3e-slider__track-segment'),
      ].map((segment) => segment.getBoundingClientRect())
      const beforeEdges = segmentBoxes
        .map((segment) => (vertical ? segment.bottom : segment.right))
        .filter((edge) => edge <= thumbMainCenter + 0.5)
      const afterEdges = segmentBoxes
        .map((segment) => (vertical ? segment.top : segment.left))
        .filter((edge) => edge >= thumbMainCenter - 0.5)
      const before =
        beforeEdges.length > 0
          ? thumbMainCenter - Math.max(...beforeEdges)
          : undefined
      const after =
        afterEdges.length > 0
          ? Math.min(...afterEdges) - thumbMainCenter
          : undefined
      for (const gap of [before, after]) {
        if (gap === undefined || gap > 16) continue
        if (Math.abs(gap - 8) > 0.75) {
          results.push(`thumb-track gap ${gap.toFixed(1)}px`)
        }
      }
    }

    for (const window of slider.querySelectorAll(
      '.m3e-slider__tick-window,.m3e-slider__stop-window',
    )) {
      const styles = getComputedStyle(window)
      const mask = styles.maskImage || styles.webkitMaskImage
      if (!mask || mask === 'none') {
        results.push('tick/stop physical-gap mask is missing')
      }
    }

    for (const point of slider.querySelectorAll(
      '.m3e-slider__tick,.m3e-slider__stop',
    )) {
      const box = point.getBoundingClientRect()
      const pointCross = vertical
        ? box.left + box.width / 2
        : box.top + box.height / 2
      const trackCross = vertical
        ? track.left + track.width / 2
        : track.top + track.height / 2
      if (Math.abs(pointCross - trackCross) > 0.75) {
        results.push('tick/stop is not centered on the cross axis')
      }
    }

    for (const tick of slider.querySelectorAll('.m3e-slider__tick')) {
      if (vertical) continue
      const fraction = Number(tick.getAttribute('data-m3e-fraction'))
      const expectedOffset = 8 + fraction * (track.width - 16)
      const expected = rtl
        ? track.right - expectedOffset
        : track.left + expectedOffset
      const tickBox = tick.getBoundingClientRect()
      const actual = tickBox.left + tickBox.width / 2
      if (Math.abs(actual - expected) > 0.75) {
        results.push(
          `discrete ${rtl ? 'RTL ' : ''}tick position ` +
            `${actual.toFixed(1)}px, expected ${expected.toFixed(1)}px`,
        )
      }
    }

    if (slider.getAttribute('data-m3e-centered') === 'true') {
      const center = vertical
        ? track.top + track.height / 2
        : track.left + track.width / 2
      const segmentBoxes = [
        ...slider.querySelectorAll('.m3e-slider__track-segment'),
      ].map((segment) => segment.getBoundingClientRect())
      const beforeEdges = segmentBoxes
        .map((segment) => (vertical ? segment.bottom : segment.right))
        .filter((edge) => edge <= center + 0.5)
      const afterEdges = segmentBoxes
        .map((segment) => (vertical ? segment.top : segment.left))
        .filter((edge) => edge >= center - 0.5)
      if (beforeEdges.length > 0 && afterEdges.length > 0) {
        const centerGaps = [
          center - Math.max(...beforeEdges),
          Math.min(...afterEdges) - center,
        ].sort((a, b) => a - b)
        if (
          Math.abs(centerGaps[0]) > 0.75 ||
          Math.abs(centerGaps[1] - 6) > 0.75
        ) {
          results.push(
            `centered virtual-handle gaps ${centerGaps
              .map((gap) => gap.toFixed(1))
              .join('/')}px`,
          )
        }
      }
    }

    const reversedInput = slider.querySelector(
      'input[aria-label="Bottom to top level"]',
    )
    if (reversedInput) {
      const active = slider
        .querySelector('.m3e-slider__track-segment[data-m3e-active="true"]')
        ?.getBoundingClientRect()
      const thumb = thumbs[0]
      if (
        !active ||
        active.top < thumb.top + thumb.height / 2 ||
        Math.abs(active.bottom - track.bottom) > 0.75
      ) {
        results.push('bottom-to-top active track is not painted below its thumb')
      }
    }
  }
  return results
})

for (const finding of sliderGeometry) findings.push(`Slider geometry: ${finding}`)

const focusInput = page.getByRole('slider', { name: /Volume/ }).first()
if ((await focusInput.count()) > 0) {
  const focusRoot = focusInput.locator('..')
  await focusRoot.scrollIntoViewIfNeeded()
  const readFocusGeometry = () =>
    focusRoot.evaluate((slider) => {
      const track = slider.querySelector('.m3e-slider__track')?.getBoundingClientRect()
      const thumb = slider.querySelector('.m3e-slider__thumb')?.getBoundingClientRect()
      const handle = slider.querySelector('.m3e-slider__handle')?.getBoundingClientRect()
      if (!track || !thumb || !handle) return undefined
      const center = thumb.left + thumb.width / 2
      const segments = [
        ...slider.querySelectorAll('.m3e-slider__track-segment'),
      ].map((segment) => segment.getBoundingClientRect())
      const before = Math.max(
        ...segments
          .map((segment) => segment.right)
          .filter((edge) => edge <= center + 0.5),
      )
      const after = Math.min(
        ...segments
          .map((segment) => segment.left)
          .filter((edge) => edge >= center - 0.5),
      )
      return {
        track: [track.left, track.top, track.width, track.height],
        thumb: [thumb.left, thumb.top, thumb.width, thumb.height],
        handleWidth: handle.width,
        gaps: [center - before, after - center],
      }
    })
  const beforeFocus = await readFocusGeometry()
  await focusInput.evaluate((input) => input.focus({ preventScroll: true }))
  await page.waitForTimeout(50)
  const afterFocus = await readFocusGeometry()
  if (!beforeFocus || !afterFocus) {
    findings.push('Slider geometry: focus-invariance probe is missing')
  } else {
    for (const [before, after] of [
      [beforeFocus.track, afterFocus.track],
      [beforeFocus.thumb, afterFocus.thumb],
    ]) {
      if (before.some((value, index) => Math.abs(value - after[index]) > 0.5)) {
        findings.push('Slider geometry: focus moved the track or thumb anchor')
        break
      }
    }
    if (
      beforeFocus.gaps.some((gap) => Math.abs(gap - 8) > 0.75) ||
      afterFocus.gaps.some((gap) => Math.abs(gap - 12) > 0.75)
    ) {
      findings.push(
        `Slider geometry: focus gaps changed from ${beforeFocus.gaps
          .map((gap) => gap.toFixed(1))
          .join('/')} to ${afterFocus.gaps
          .map((gap) => gap.toFixed(1))
          .join('/')}px`,
      )
    }
    if (
      Math.abs(beforeFocus.handleWidth - 4) > 0.75 ||
      Math.abs(afterFocus.handleWidth - 2) > 0.75
    ) {
      findings.push(
        `Slider geometry: focus handle width changed from ` +
          `${beforeFocus.handleWidth.toFixed(1)} to ${afterFocus.handleWidth.toFixed(1)}px`,
      )
    }
  }
  await focusInput.evaluate((input) => input.blur())
}

async function sampleLocatorPixels(locator, points) {
  const screenshot = await locator.screenshot({ animations: 'disabled' })
  return page.evaluate(
    async ({ imageBase64, samplePoints }) => {
      const image = new Image()
      image.src = `data:image/png;base64,${imageBase64}`
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d', { willReadFrequently: true })
      context.drawImage(image, 0, 0)
      return samplePoints.map(({ x, y }) => [
        ...context.getImageData(
          Math.max(0, Math.min(canvas.width - 1, Math.round(x))),
          Math.max(0, Math.min(canvas.height - 1, Math.round(y))),
          1,
          1,
        ).data,
      ])
    },
    {
      imageBase64: screenshot.toString('base64'),
      samplePoints: points,
    },
  )
}

function pixelDistance(first, second) {
  return Math.max(
    Math.abs(first[0] - second[0]),
    Math.abs(first[1] - second[1]),
    Math.abs(first[2] - second[2]),
    Math.abs(first[3] - second[3]),
  )
}

// A DOM rectangle remains present when CSS masks its paint, so two pixel probes
// make the tick-gap assertion physical rather than merely checking declarations.
const centeredSlider = page
  .locator('.slider-example .m3e-slider[data-m3e-centered="true"]')
  .first()
if ((await centeredSlider.count()) > 0) {
  await centeredSlider.scrollIntoViewIfNeeded()
  const probe = await centeredSlider.evaluate((slider) => {
    const root = slider.getBoundingClientRect()
    const track = slider.querySelector('.m3e-slider__track')?.getBoundingClientRect()
    const centerTick = slider
      .querySelector('.m3e-slider__tick[data-m3e-fraction="0.5"]')
      ?.getBoundingClientRect()
    if (!track || !centerTick) return undefined
    const x = centerTick.left + centerTick.width / 2 - root.left
    const y = centerTick.top + centerTick.height / 2 - root.top
    return {
      points: [
        { x: x + 1, y },
        { x: x + 4, y },
      ],
    }
  })
  if (!probe) {
    findings.push('Slider geometry: centered tick-mask pixel probe is missing')
  } else {
    const [maskedCenter, adjacentTrack] = await sampleLocatorPixels(
      centeredSlider,
      probe.points,
    )
    if (pixelDistance(maskedCenter, adjacentTrack) > 12) {
      findings.push(
        'Slider geometry: centered tick still paints inside the 6px virtual-center gap',
      )
    }
  }
}

const narrowSlider = page.getByRole('slider', { name: 'Reading speed' }).locator('..')
if ((await narrowSlider.count()) > 0) {
  await narrowSlider.scrollIntoViewIfNeeded()
  const probe = await narrowSlider.evaluate(async (slider) => {
    slider.style.inlineSize = '48px'
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    )
    const root = slider.getBoundingClientRect()
    const nearTick = slider
      .querySelector('.m3e-slider__tick[data-m3e-fraction="0.5"]')
      ?.getBoundingClientRect()
    if (!nearTick) return undefined
    const x = nearTick.left + nearTick.width / 2 - root.left
    const y = nearTick.top + nearTick.height / 2 - root.top
    return {
      points: [
        { x, y },
        { x, y: y - 12 },
      ],
    }
  })
  if (!probe) {
    findings.push('Slider geometry: constrained tick-mask pixel probe is missing')
  } else {
    const [maskedGap, adjacentSurface] = await sampleLocatorPixels(
      narrowSlider,
      probe.points,
    )
    if (pixelDistance(maskedGap, adjacentSurface) > 12) {
      findings.push(
        'Slider geometry: constrained tick still paints inside the physical thumb gap',
      )
    }
  }
}

await browser.close()
server.close()

if (findings.length > 0) {
  process.stderr.write(
    `Rendering audit findings:\n${findings.map((line) => `  - ${line}`).join('\n')}\n`,
  )
  process.exit(1)
}

process.stdout.write(
  'Rendering audit passed: no clipped elevation shadows, undersized interactive targets outside ' +
    'the recorded exemptions, or Chip/List Item/Slider source-geometry defects\n',
)
