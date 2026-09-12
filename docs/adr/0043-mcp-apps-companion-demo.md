# ADR 0043: MCP Apps companion demonstration

Status: accepted
Date: 2026-09-12
Task: T65

## Context

The owner requested MCP Apps after the AG-UI and A2UI integrations and
authorized a sibling companion. Protocol dependencies cannot enter the core
package. ADR 0028 limits site UI dependencies; ADRs 0041 and 0042 establish
the companion-demo exception.

## Decision

Keep MCP Apps implementation in `@language-lit/material3-expressive-mcp-apps`.
Allow its public `.`, `./app`, and `./styles.css` entries in the site, together
with ext-apps, the split client/server SDK and Zod for the in-memory server.
The demo consumes the companion's packed artifact and authors only sample
data, app content and orchestration. It copies no companion implementation.

Until publication, commit the generated package tarball under `site/vendor/`
and resolve it locally from the lockfile. This makes clean site builds
independent of a sibling checkout. The page and guides must say unpublished;
switch to a registry release in a separately authorized release task.

Build the sample app into one HTML document with esbuild during site prebuild
and predev. The generated document is ignored by git. The host fetches it once
locally and registers it as an MCP resource. All subsequent interactions use
in-memory transports and postMessage, including app-to-server tool calls.

Direct embedding uses the companion's opaque-origin iframe and CSP. The demo
declares no remote resource/connection domains, never opens external links,
and records chat/model-context callbacks locally. It requests no credentials
and runs no model. Host trust policy remains a consumer responsibility.

## Consequences

The core exports, peers, dependency policy, component inventory and conformance
claims stay unchanged. The site adds one demo, two guides and their discovery
entries. Production checks must exercise the real iframe protocol, including
theme changes, callbacks, display modes, reset, failed tool results and layout.
The installed tarball and generated app are build artifacts, regenerated from
their source; they are never hand-edited.
