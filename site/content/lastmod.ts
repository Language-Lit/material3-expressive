import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { repoRoot } from './paths'

const run = promisify(execFile)

/**
 * Build-time git lookups, memoised. The sitemap asks for forty-one paths and
 * several share a source; a static export builds once, so a plain map is the
 * whole cache story.
 */
const cache = new Map<string, Promise<Date | undefined>>()

async function readCommitDate(relativePath: string): Promise<Date | undefined> {
  try {
    const { stdout } = await run(
      'git',
      ['log', '-1', '--format=%cI', '--', relativePath],
      { cwd: repoRoot },
    )

    const stamp = stdout.trim()
    if (!stamp) return undefined

    const parsed = new Date(stamp)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  } catch {
    // git absent, not a repository, or the path untracked.
    return undefined
  }
}

/**
 * The commit date of the repository file behind a route, or `undefined` when
 * git cannot answer.
 *
 * Undefined is a supported outcome, not a failure. Deployment clones are
 * shallow, so a file untouched inside the fetched depth has no reachable
 * commit. Omitting `lastmod` for it tells a crawler the date is unknown, which
 * is true; the recently-changed files — the ones worth recrawling — are exactly
 * the ones inside the depth, so the hint survives where it matters. The
 * alternative, stamping every URL with the build time, would claim the whole
 * site changed on every deploy and earn one wasted recrawl before it stopped
 * being believed.
 */
export function lastCommitDate(relativePath: string): Promise<Date | undefined> {
  let pending = cache.get(relativePath)

  if (!pending) {
    pending = readCommitDate(relativePath)
    cache.set(relativePath, pending)
  }

  return pending
}
