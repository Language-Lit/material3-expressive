/**
 * Parses npm's final JSON-array payload when lifecycle tools have written
 * human-readable output to the same stdout stream first.
 */
export function parseNpmJsonArray(output) {
  const match = /(?:^|\r?\n)(\[\s*\{[\s\S]*\]\s*)$/.exec(output)
  return JSON.parse(match?.[1] ?? output)
}
