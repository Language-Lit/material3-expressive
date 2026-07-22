import { absoluteUrl } from '../content/site'

/**
 * Emits a JSON-LD block.
 *
 * The site's prose already says what the package is, but it says it in
 * sentences — a retrieval system has to infer that "32 conformant components"
 * is a count, that the install line names the package, and that MIT is the
 * license. Schema.org states those as facts, which is the difference between a
 * summary that guesses and one that quotes.
 *
 * The payload is serialised with `<` escaped: JSON-LD sits in a raw text
 * element, so an unescaped `</script>` in any string would close the block
 * early. Nothing here contains one today, but the values come from the
 * inventory and the guide list, and that will not stay true by luck.
 */
export function StructuredData({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}

/**
 * The trail from the site root to `path`, as schema.org expects it: position 1
 * is the home page, and the final item is the page itself.
 */
export function breadcrumbList(
  trail: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  }
}
