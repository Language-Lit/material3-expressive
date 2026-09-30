# ADR 0045: Site internationalization

Status: accepted
Date: 2026-09-30
Task: T74

## Context

The owner requested a Japanese version of the whole documentation site, with
more languages possible later. The site is a static export (`output:
'export'`), so Next.js request-time locale routing and middleware are not
available. English URLs are already indexed and must not move. ADR 0028 keeps
the site free of new UI dependencies.

## Decision

English stays at the root and each other locale is served under its own
prefix (`/ja/`). The route tree has two root layouts, `app/(en)` and
`app/(ja)/ja`, so every page is exported with the correct `<html lang>`. Page
bodies live once in `site/views/` and take a `locale`; the route files in each
tree are thin wrappers. Because neither root layout covers an unknown URL,
`app/global-not-found.tsx` frames the 404 page (Next's `globalNotFound`
flag). `llms.txt`, `llms-full.txt`, `robots.txt`, the sitemap, and the social
card stay at the root.

Long-form documents stay Markdown, the format they are written, reviewed, and
rendered in. Translations mirror the published English sources under
`docs/<locale>/`. A translated heading ends in `{#id}` carrying the English
heading's id, so a `#fragment` means the same section in every language.

Short UI strings live in typed modules under `site/i18n/messages/`. Each
exports `Record<Locale, typeof en>`, so a missing translation fails the site
typecheck without a runtime library. Client components read the locale from
the URL prefix.

Each page emits a canonical URL and hreflang alternates for every locale; the
sitemap lists every route in every locale with the same alternates. The site
bar links each page to its translation.

Code, API and component names, `llms.txt`, and `llms-full.txt` remain English.

## Consequences

`npm run check:site` fails when a published document has no translation. It
does not detect a translation that has fallen behind its English source; that
is reviewed when the English document changes. Adding a locale means adding it
to `site/i18n/locales.ts`, a route tree, a message entry per module, and a
`docs/<locale>/` mirror.
