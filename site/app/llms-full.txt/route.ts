import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getConformantComponents } from '../../content/inventory'
import { docPages, readDocSource } from '../../content/docs'
import { componentDocsRoot } from '../../content/paths'
import { absoluteUrl, packageName, siteName } from '../../content/site'

/**
 * Every guide and component document as one plain-text file.
 *
 * The rendered pages carry this same prose, but each one arrives wrapped in a
 * navigation drawer, a theme menu, and a live demo stage — and an assistant
 * answering a question about `TextField` would have to fetch forty-one of them
 * to be sure it had the whole picture. Serving the Markdown the pages are built
 * from costs one request and no extraction.
 *
 * The sources are the repository's own documents, so this file cannot drift
 * from the site: both render from the same bytes.
 */
export const dynamic = 'force-static'

export async function GET() {
  const components = await getConformantComponents()

  const sections: string[] = [
    `# ${siteName}`,
    '',
    `Complete documentation for ${packageName}, concatenated from the same`,
    `Markdown the site renders. Canonical HTML: ${absoluteUrl('/')}`,
    '',
    '---',
    '',
  ]

  for (const page of docPages) {
    sections.push(
      `# ${page.title}`,
      '',
      `Source: ${absoluteUrl(`/docs/${page.slug}/`)}`,
      '',
      (await readDocSource(page)).trim(),
      '',
      '---',
      '',
    )
  }

  for (const component of components) {
    const markdown = await readFile(
      path.join(componentDocsRoot, `${component.name}.md`),
      'utf8',
    )
    sections.push(
      `# ${component.name}`,
      '',
      `Source: ${absoluteUrl(`/components/${component.name}/`)}`,
      `Exports: ${component.publicExports.join(', ')}`,
      '',
      markdown.trim(),
      '',
      '---',
      '',
    )
  }

  return new Response(sections.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
    },
  })
}
