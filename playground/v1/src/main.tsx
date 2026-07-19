import React from 'react'
import { createRoot } from 'react-dom/client'
import * as Material3Expressive from '@language-lit/material3-expressive/v1'
import '@language-lit/material3-expressive/v1/styles.css'
import './playground.css'

const root = document.getElementById('root')

if (!root) throw new Error('Missing playground root element')

createRoot(root).render(
  <React.StrictMode>
    <main className="workbench">
      <h1>Material 3 Expressive React v1</h1>
      <p>T01 package boundary ready.</p>
      <output>{Object.keys(Material3Expressive).length} implemented public exports</output>
    </main>
  </React.StrictMode>,
)
