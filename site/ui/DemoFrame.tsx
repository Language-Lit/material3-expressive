'use client'

import { useId, useState } from 'react'
import { Button, Icon } from '@language-lit/material3-expressive'
import { getDemo } from '../demos/registry'
// The playground's own example styles. Reused rather than reimplemented so a
// demo looks the same here as it does in the workbench the components are
// developed against.
import '../../playground/src/playground.css'
import { useLocale } from '../i18n/useLocale'
import { shellMessages } from '../i18n/messages/shell'

export function DemoFrame({
  component,
  sourceHtml,
  source,
}: {
  component: string
  sourceHtml: string
  source: string
}) {
  const [showSource, setShowSource] = useState(false)
  const [copied, setCopied] = useState(false)
  const sourceId = useId()
  const locale = useLocale()
  const t = shellMessages[locale]
  const Demo = getDemo(component)

  if (!Demo) return null

  async function copy() {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="demo">
      <div className="demo__stage">
        <Demo />
      </div>

      <div className="demo__bar">
        <span className="demo__label">
          {t.codeExamplePath(component)}
        </span>
        <span style={{ display: 'flex', gap: '0.25rem' }}>
          <Button
            variant="text"
            size="extra-small"
            aria-expanded={showSource}
            aria-controls={sourceId}
            leadingIcon={<Icon source={showSource ? 'expand_less' : 'code'} />}
            onClick={() => setShowSource((current) => !current)}
          >
            {showSource ? t.hideCode : t.showCode}
          </Button>
          <Button
            variant="text"
            size="extra-small"
            leadingIcon={<Icon source={copied ? 'check' : 'content_copy'} />}
            onClick={copy}
          >
            {copied ? t.copied : t.copy}
          </Button>
        </span>
      </div>

      <div className="demo__source" id={sourceId} hidden={!showSource}>
        <div dangerouslySetInnerHTML={{ __html: sourceHtml }} />
      </div>
    </div>
  )
}
