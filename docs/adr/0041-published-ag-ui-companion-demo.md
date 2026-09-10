# ADR 0041: Published AG-UI companion demo

Status: accepted
Date: 2026-09-10
Task: T62

## Context

The owner requested a public demonstration of the separately published
`@language-lit/material3-expressive-ag-ui` package. ADR 0028 limits the site's
UI dependencies to the core library. A real companion demo needs to consume
that companion package, which itself renders Material 3 Expressive components.

## Decision

Allow the published AG-UI companion and its native AG-UI peers in `site/` for
the dedicated `/ag-ui/` route. Pin the demonstrated companion to 0.1.0 and
consume only public exports. Do not copy its implementation into this repository.
Keep site-authored scripts and weather content separate from package components.
RxJS is a site dependency because AbstractAgent returns an Observable. Its
version matches the SDK's dependency to share one instance and one type identity.

The page runs a local scripted agent. It makes no model or backend requests and
asks for no credentials. Local guides cover native composition, tool renderers,
state, interrupts, and CopilotKit 1.71.x v1 support;
the adapter and its optional peers are not needed by the native demo.

The companion is not a core component or a core conformance claim. It stays out
of the core inventory, export map, dependencies, and packed artifact. All other
ADR 0028 constraints remain in force.

## Consequences

The site demonstrates the released integration while retaining its existing
theme provider and Material controls. The site import check recognizes the
companion's public entries and continues to reject private imports.

The AG-UI guides use the existing Markdown pipeline and have their own navigation
section. Their examples follow the published companion's types. They document
the integration without adding its components to the core conformance inventory.
