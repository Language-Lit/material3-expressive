import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  Material3Provider,
  createTheme,
  defaultTokenSet,
  validateTokenSet,
} from '@language-lit/material3-expressive/v1'
import '@language-lit/material3-expressive/v1/styles.css'
import { ButtonExample } from '../examples/Button.example'
import { CardExample } from '../examples/Card.example'
import { CheckboxExample } from '../examples/Checkbox.example'
import { FloatingActionButtonExample } from '../examples/FloatingActionButton.example'
import { IconExample } from '../examples/Icon.example'
import { IconButtonExample } from '../examples/IconButton.example'
import { SurfaceExample } from '../examples/Surface.example'
import { TextExample } from '../examples/Text.example'
import './playground.css'

const root = document.getElementById('root')
const workbenchTheme = createTheme({ density: { scale: -1 } })

if (!root) throw new Error('Missing playground root element')

createRoot(root).render(
  <React.StrictMode>
    <Material3Provider theme={workbenchTheme} colorMode="system">
      <main className="workbench">
        <h1>Material 3 Expressive React v1</h1>
        <p>Framework-neutral theme runtime ready.</p>
        <output>
          Material {defaultTokenSet.metadata.materialVersion}:{' '}
          {validateTokenSet(defaultTokenSet).success ? 'valid' : 'invalid'}
        </output>
        <SurfaceExample />
        <TextExample />
        <IconExample />
        <IconButtonExample />
        <FloatingActionButtonExample />
        <ButtonExample />
        <CardExample />
        <CheckboxExample />
      </main>
    </Material3Provider>
  </React.StrictMode>,
)
