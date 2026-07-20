# Material 3 Expressive React v1

v1 is the additive prerelease API of `@language-lit/material3-expressive`. It is
a framework-neutral React implementation with precompiled styles and no
Tailwind requirement.

## Start here

1. [Install and render v1](GETTING_STARTED.md).
2. [Configure themes and nested scopes](THEMING.md).
3. [Configure SSR and system color mode](SSR.md).
4. Browse the generated [supported-component matrix](SUPPORTED_COMPONENTS.md).

For an existing package user, read the [generic migration guide](MIGRATION.md),
the documented [web deviations](WEB_DEVIATIONS.md), and the
[prerelease notes](RELEASE_NOTES.md).

## Public entry points

| Entry | Purpose | Runtime boundary |
| --- | --- | --- |
| `@language-lit/material3-expressive/v1` | React components, providers, hooks, themes, and tokens | Client-capable React entry |
| `@language-lit/material3-expressive/v1/theme` | Theme creation, extension, parsing, and types | React-free; safe in server modules |
| `@language-lit/material3-expressive/v1/tokens` | Token schemas, defaults, validation, and CSS generation | React-free; safe in server modules |
| `@language-lit/material3-expressive/v1/styles.css` | Complete tokens and component styles | Import once per application bundle |

The package root and legacy subpaths do not redirect to v1 during the
prerelease.

## Support claim

The prerelease advertises only components marked `conformant` in
`component-inventory.json`. The generated matrix links each supported component
to its public page, while its colocated conformance record contains the detailed
source and verification evidence.

Additional Material components are not implied by the package name. Items such
as chips, sliders, search, sheets, list items, app bars, and carousel remain
outside the v1.0 matrix unless a later public task adds and verifies them.

## Contributing

Repository architecture and ownership rules are in [ARCHITECTURE.md](ARCHITECTURE.md).
Run the narrow documentation gate while editing guides:

```bash
npm run check:v1:docs
```

Regenerate the supported matrix after an approved inventory change:

```bash
npm run generate:v1:docs
```

The aggregate completion gate remains `npm run verify:v1`.
