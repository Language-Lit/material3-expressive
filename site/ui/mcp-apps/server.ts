import { Client, InMemoryTransport } from '@modelcontextprotocol/client'
import { RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps'
import { registerAppResource, registerAppTool } from '@modelcontextprotocol/ext-apps/server'
import { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'

import { mcpAppsClientCapabilities } from '@language-lit/material3-expressive-mcp-apps'
import { forecastFor } from './forecast'

export const FORECAST_URI = 'ui://m3e-playground/forecast.html'

/**
 * An MCP server with one model-facing tool that opens the app, one app-only
 * tool the app calls back, and the UI resource, connected to a client over
 * the SDK's in-memory transport. No process, no network.
 */
export async function connectDemoServer(html: string) {
  const server = new McpServer({ name: 'm3e-forecast', version: '0.1.0' })

  registerAppResource(
    server,
    'forecast-view',
    FORECAST_URI,
    { _meta: { ui: { prefersBorder: true } } },
    async () => ({
      contents: [{ uri: FORECAST_URI, mimeType: RESOURCE_MIME_TYPE, text: html }],
    }),
  )

  registerAppTool(
    server,
    'get_forecast',
    {
      title: 'Five-day forecast',
      description: 'Shows the five-day forecast for a city.',
      inputSchema: z.object({ city: z.string().describe('City name') }),
      _meta: { ui: { resourceUri: FORECAST_URI } },
    },
    async ({ city }) => {
      const forecast = forecastFor(city)
      return {
        content: [{ type: 'text', text: `Forecast for ${city}: ${forecast.days.map((day) => `${day.weekday} ${day.high}°`).join(', ')}` }],
        structuredContent: forecast as unknown as Record<string, unknown>,
      }
    },
  )

  registerAppTool(
    server,
    'refresh_forecast',
    {
      title: 'Refresh forecast',
      description: 'Re-reads the forecast for a city. Called by the app, not the model.',
      inputSchema: z.object({ city: z.string(), seed: z.number().int() }),
      _meta: { ui: { resourceUri: FORECAST_URI, visibility: ['app'] } },
    },
    async ({ city, seed }) => {
      const forecast = forecastFor(city, seed)
      return {
        content: [{ type: 'text', text: `Refreshed forecast for ${city}.` }],
        structuredContent: forecast as unknown as Record<string, unknown>,
      }
    },
  )

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'm3e-playground', version: '0.1.0' }, { capabilities: mcpAppsClientCapabilities })
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  return { client, server }
}
