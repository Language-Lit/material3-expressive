import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@language-lit/material3-expressive/styles.css'
import '@language-lit/material3-expressive-mcp-apps/styles.css'
import './forecast.css'

import { McpAppProvider } from '@language-lit/material3-expressive-mcp-apps/app'
import { ForecastApp } from './ForecastApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <McpAppProvider
      appInfo={{ name: 'm3e-forecast', version: '0.1.0' }}
      capabilities={{ availableDisplayModes: ['inline', 'fullscreen', 'pip'] }}
    >
      <ForecastApp />
    </McpAppProvider>
  </StrictMode>,
)
