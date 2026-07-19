import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  defaultTokenSet,
  validateTokenSet,
} from '@language-lit/material3-expressive/v1'
import '@language-lit/material3-expressive/v1/styles.css'
import './playground.css'

const root = document.getElementById('root')

if (!root) throw new Error('Missing playground root element')

createRoot(root).render(
  <React.StrictMode>
    <main className="workbench">
      <h1>Material 3 Expressive React v1</h1>
      <p>Framework-neutral token foundation ready.</p>
      <output>
        Material {defaultTokenSet.metadata.materialVersion}:{' '}
        {validateTokenSet(defaultTokenSet).success ? 'valid' : 'invalid'}
      </output>
    </main>
  </React.StrictMode>,
)
