'use client'

import { useState } from 'react'
import { Icon, IconButton } from '@language-lit/material3-expressive'
import { useLocale } from '../i18n/useLocale'
import { shellMessages } from '../i18n/messages/shell'

export function InstallCommand({ command }: { command: string }) {
  const locale = useLocale()
  const t = shellMessages[locale]
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="install">
      <code className="install__command">{command}</code>
      <IconButton
        aria-label={copied ? t.commandCopied : t.copyCommand}
        variant="standard"
        onClick={copy}
      >
        <Icon source={copied ? 'check' : 'content_copy'} />
      </IconButton>
    </div>
  )
}
