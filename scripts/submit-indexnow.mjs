#!/usr/bin/env node
/**
 * Submits every URL the sitemap advertises to IndexNow, which fans the
 * notification out to Bing, Yandex, Seznam and Naver.
 *
 * This exists because the site has no inbound links. Organic discovery starts
 * when a crawler follows a link to the host, and until one does there is
 * nothing to follow — so the host announces itself instead. Run it after a
 * deploy that changed published content; the protocol is a hint, not a queue,
 * and resubmitting an unchanged site earns nothing.
 *
 * The key file must already be live at its own URL: IndexNow authenticates a
 * submission by fetching the key back from the host it claims to speak for, so
 * a submission made before the deploy that publishes the key is rejected. This
 * script checks that first and refuses rather than burning the attempt.
 *
 * Usage: node scripts/submit-indexnow.mjs [--dry-run]
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..')

const HOST = 'm3e.language-lit.com'
const KEY = 'e94586cd9ff700b2b20bfad852c0f2ae'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const SITEMAP = path.join(repoRoot, 'site/out/sitemap.xml')

const dryRun = process.argv.includes('--dry-run')

function fail(message) {
  console.error(`indexnow: ${message}`)
  process.exit(1)
}

async function readSitemapUrls() {
  let xml
  try {
    xml = await readFile(SITEMAP, 'utf8')
  } catch {
    fail(`no sitemap at ${path.relative(repoRoot, SITEMAP)} — run \`npm run site:build\` first`)
  }

  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim())
  if (urls.length === 0) fail('sitemap advertises no URLs')

  const foreign = urls.filter((url) => new URL(url).host !== HOST)
  if (foreign.length > 0) {
    fail(`sitemap contains URLs outside ${HOST}, starting with ${foreign[0]}`)
  }

  return urls
}

async function assertKeyIsLive() {
  let response
  try {
    response = await fetch(KEY_LOCATION)
  } catch (error) {
    fail(`could not reach ${KEY_LOCATION}: ${error.message}`)
  }

  if (!response.ok) {
    fail(
      `${KEY_LOCATION} returned ${response.status}. Deploy the site before submitting — ` +
        'IndexNow validates by fetching this file back.',
    )
  }

  const hosted = (await response.text()).trim()
  if (hosted !== KEY) fail(`${KEY_LOCATION} serves "${hosted}", expected "${KEY}"`)
}

/** The submission outcomes the protocol defines, so the exit says what happened. */
const OUTCOMES = {
  200: 'accepted',
  202: 'accepted — key validation pending',
  400: 'rejected: malformed request',
  403: 'rejected: key not valid for this host',
  422: 'rejected: URLs do not belong to the host, or the key does not match',
  429: 'rejected: too many requests',
}

const urls = await readSitemapUrls()

if (dryRun) {
  console.log(`indexnow: would submit ${urls.length} URLs for ${HOST}`)
  for (const url of urls) console.log(`  ${url}`)
  process.exit(0)
}

await assertKeyIsLive()

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls }),
})

const outcome = OUTCOMES[response.status] ?? `unexpected status ${response.status}`
console.log(`indexnow: ${urls.length} URLs submitted — ${outcome}`)

if (!response.ok) process.exit(1)
