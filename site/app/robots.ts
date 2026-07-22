import type { MetadataRoute } from 'next'
import { absoluteUrl } from '../content/site'

/**
 * Before this file the site had no robots.txt at all: `/robots.txt` fell
 * through the static export to the 404 page, which answers a crawler's first
 * request with 404 and an HTML body carrying `<meta name="robots" content=
 * "noindex">`. RFC 9309 reads a missing robots.txt as allow-all, but an
 * assistant fetcher that gets an HTML error document where a policy should be
 * has nothing to act on, and no pointer to the sitemap either.
 *
 * Answering plainly is the fix. The retrieval agents are named explicitly
 * rather than left to the wildcard so the allowance is a documented decision:
 * this is MIT-licensed documentation for a public package, and being quoted by
 * an assistant is the distribution the site wants.
 */
// `output: 'export'` treats a metadata route as dynamic unless told otherwise,
// and refuses the build rather than emit a file it cannot prove is static.
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const retrievalAgents = [
    // OpenAI: training crawler, search index, and the live browse fetcher.
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    // Anthropic.
    'ClaudeBot',
    'Claude-User',
    'Claude-SearchBot',
    'anthropic-ai',
    // Google's assistant surfaces are gated separately from Googlebot.
    'Google-Extended',
    // Others that answer questions from crawled pages.
    'PerplexityBot',
    'Perplexity-User',
    'Applebot',
    'Applebot-Extended',
    'Amazonbot',
    'Bingbot',
    'CCBot',
  ]

  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: retrievalAgents, allow: '/' },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
