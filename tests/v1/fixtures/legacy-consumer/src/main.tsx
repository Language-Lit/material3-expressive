import React from 'react'
import { createRoot } from 'react-dom/client'
import * as legacyPackage from '@language-lit/material3-expressive'
import * as legacyPreset from '@language-lit/material3-expressive/tailwind-preset'
import '@language-lit/material3-expressive/styles'

const publicRuntimeExports =
  Object.keys(legacyPackage).length + Object.keys(legacyPreset).length

const root = document.getElementById('root')
if (!root) throw new Error('Missing fixture root')

createRoot(root).render(
  <React.StrictMode>
    <output>{publicRuntimeExports} public legacy exports resolved</output>
  </React.StrictMode>,
)
