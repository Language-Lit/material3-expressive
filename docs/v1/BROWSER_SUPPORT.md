# v1 browser support

T01 pins the minimum production matrix to:

| Browser | Minimum |
| --- | ---: |
| Chrome | 120 |
| Edge | 120 |
| Firefox | 121 |
| Safari on macOS | 17.2 |
| Safari on iOS/iPadOS | 17.2 |

`docs/v1/browser-support.json` is the machine-readable source for the table,
`package.json` consumer metadata, and Lightning CSS compilation targets. The
`npm run check:v1:browsers` command keeps them aligned. CSS compilation, fixture
builds, and later browser tests must not silently raise the minimums. Changes
require an ADR and an explicit update to the matrix, tests, and documentation.

T01 consumer builds run on Node.js 20 in CI. Browser-level interaction and
visual suites become mandatory before the first prerelease as required by the
v1 specification.
