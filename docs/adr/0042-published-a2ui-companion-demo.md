# ADR 0042: Published A2UI companion demo

Status: accepted
Date: 2026-09-11
Task: T63

## Context

The owner decided to support Google's A2UI protocol and asked for a public
demonstration and documentation on this site. The renderer lives in the
separately published `@language-lit/material3-expressive-a2ui` package,
which depends on the core library and on Google's `@a2ui/web_core` runtime.
ADR 0028 limits the site's UI dependencies to the core library, and ADR 0041
already grants one exception for the AG-UI companion.

## Decision

Allow the A2UI companion and its `@a2ui/web_core` peer in `site/` for the
dedicated `/a2ui/` route, on the same terms as ADR 0041. Pin the demonstrated
versions and consume only public exports. Do not copy the companion's
implementation into this repository.

The page runs scripted A2UI message streams that the site authors. It makes
no model or backend requests and asks for no credentials. Local guides cover
installation, the message-processor hook, the surface renderer, the
component mapping, binding, validation, actions, theming, catalog extension,
and use under Google's `@a2ui/react` surface.

Until the companion was published to npm, the site installed it from a
packed tarball of the sibling repository. Since the `0.1.0` release on
2026-09-12 the dependency pins the registry version. The site checks
recognize the package by name, so that switch needed no other change.

The companion is not a core component or a core conformance claim. It stays
out of the core inventory, export map, dependencies, and packed artifact. All
other ADR 0028 constraints remain in force.

## Consequences

The site demonstrates a second protocol integration while retaining its
theme provider and Material controls. The site import check recognizes the
companion's public entries and continues to reject private imports. The
dependency check recognizes the companion and `@a2ui/web_core` by name.

The A2UI guides use the existing Markdown pipeline and have their own
navigation section, docs index section, search entries, sitemap entries, and
machine-readable listings. Their examples follow the published companion's
types. They document the integration without adding its components to the
core conformance inventory.
