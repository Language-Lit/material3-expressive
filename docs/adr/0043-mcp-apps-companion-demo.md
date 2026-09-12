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

Consume the published `0.2.1` companion from the registry. Clean site builds
must not depend on a sibling checkout or a committed preview tarball.

Build the sample app into one HTML document with esbuild during site prebuild
and predev. The generated document is ignored by git. The host fetches it once
locally and registers it as an MCP resource. All subsequent interactions use
in-memory transports and postMessage, including app-to-server tool calls.

Browser embedding uses the existing `material3-expressive.vercel.app` alias as
a separate origin from the canonical `m3e.language-lit.com` host. The generated
static proxy is deliberately limited to this deterministic demo: it ignores
arbitrary resource HTML and loads only the generated forecast document. Vercel
CSP headers restrict the outer proxy to the canonical host and the inner app to
the proxy alias. The proxy validates its host-origin parameter, the demo
explicitly authorizes only the typed `refresh_forecast` call, and the MCP server
retains its own tool validation.

This fixed proxy is not a general hosting service and is not an example for
untrusted or user-specific resources. Those hosts use the companion's standalone
sandbox service with signed, expiring tickets, authenticated issuance, resource
policy grants, and backend tool authorization. The demo declares no remote
resource or connection domains, never opens external links, records chat and
model-context callbacks locally, requests no credentials, and runs no model.

## Consequences

The core exports, peers, dependency policy, component inventory and conformance
claims stay unchanged. The site adds one demo, two guides and their discovery
entries. Production checks must exercise the real iframe protocol, including
theme changes, callbacks, display modes, reset, failed tool results and layout.
The generated app and fixed proxy are build artifacts regenerated from source;
they are never hand-edited.
