'use client'

import { useEffect, useCallback } from 'react'

declare global {
  interface Window {
    __IMMEDIATE_THEME__?: string
  }
}

export interface ThemeColors {
  [key: string]: string
}

// Cache for loaded themes to avoid re-loading
const loadedThemes = new Set<string>()
const themeStyleElements = new Map<string, HTMLStyleElement>()

function generateThemeCSS(themeName: string, themeColors: ThemeColors): string {
  const cssVariables = Object.entries(themeColors)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n')

  return `[data-theme='${themeName}'] {\n${cssVariables}\n}`
}

export async function loadTheme(
  themeName: string,
  themeModules?: Record<string, () => Promise<any>>
): Promise<void> {
  // Skip if theme is already loaded
  if (loadedThemes.has(themeName)) {
    return
  }

  // Skip system themes (light/dark) as they should remain in globals.css
  if (themeName === 'light' || themeName === 'dark' || themeName === 'system') {
    return
  }

  if (!themeModules) {
    return
  }

  try {
    const themeModule = themeModules[themeName]
    if (!themeModule) {
      console.warn(`Theme '${themeName}' not found in theme modules`)
      return
    }

    const module = await themeModule()
    // Get the first exported value (the theme colors object)
    const themeColors = Object.values(module)[0] as ThemeColors

    if (!themeColors) {
      console.warn(`No theme colors found for '${themeName}'`)
      return
    }

    // Generate CSS for the theme
    const css = generateThemeCSS(themeName, themeColors)

    // Create and inject style element
    const styleElement = document.createElement('style')
    styleElement.setAttribute('data-theme-name', themeName)
    styleElement.textContent = css

    // Remove existing theme style if it exists
    const existingStyle = themeStyleElements.get(themeName)
    if (existingStyle && existingStyle.parentNode) {
      existingStyle.parentNode.removeChild(existingStyle)
    }

    // Add new style to head
    document.head.appendChild(styleElement)

    // Cache the loaded theme and style element
    loadedThemes.add(themeName)
    themeStyleElements.set(themeName, styleElement)
  } catch (error) {
    console.error(`Failed to load theme '${themeName}':`, error)
  }
}

export function unloadTheme(themeName: string): void {
  const styleElement = themeStyleElements.get(themeName)
  if (styleElement && styleElement.parentNode) {
    styleElement.parentNode.removeChild(styleElement)
  }

  loadedThemes.delete(themeName)
  themeStyleElements.delete(themeName)
}

export function isThemeLoaded(themeName: string): boolean {
  return loadedThemes.has(themeName)
}

// Preload a theme without applying it
export async function preloadTheme(
  themeName: string,
  themeModules?: Record<string, () => Promise<any>>
): Promise<void> {
  await loadTheme(themeName, themeModules)
}

export interface UseThemeLoaderOptions {
  theme?: string
  resolvedTheme?: string
  themeModules?: Record<string, () => Promise<any>>
}

export function useThemeLoader(options: UseThemeLoaderOptions = {}) {
  const { theme, resolvedTheme, themeModules } = options

  useEffect(() => {
    // Load the immediate theme if it was set by the blocking script
    const immediateTheme = window.__IMMEDIATE_THEME__
    if (immediateTheme) {
      loadTheme(immediateTheme, themeModules)
        .then(() => {
          // Show the page once theme is loaded
          document.documentElement.style.visibility = 'visible'
          // Clean up
          delete window.__IMMEDIATE_THEME__
        })
        .catch(() => {
          // Show page even if theme loading fails
          document.documentElement.style.visibility = 'visible'
          delete window.__IMMEDIATE_THEME__
        })
    }
  }, [themeModules])

  useEffect(() => {
    // Load the current theme when it changes
    const currentTheme = resolvedTheme || theme
    if (currentTheme && currentTheme !== 'system') {
      loadTheme(currentTheme, themeModules)
    }
  }, [theme, resolvedTheme, themeModules])

  const load = useCallback(
    (themeName: string) => loadTheme(themeName, themeModules),
    [themeModules]
  )

  const preload = useCallback(
    (themeName: string) => preloadTheme(themeName, themeModules),
    [themeModules]
  )

  return {
    loadTheme: load,
    preloadTheme: preload,
    unloadTheme,
    isThemeLoaded
  }
}
