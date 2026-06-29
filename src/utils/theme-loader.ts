/**
 * Theme loading utilities for Material 3 Expressive
 * 
 * These utilities help with dynamic theme loading and management.
 * Themes are applied via the `data-theme` attribute on the document element.
 */

/**
 * Theme colors type - a record of CSS custom property names to values
 */
export type ThemeColors = Record<string, string>

/**
 * Theme configuration for dynamic loading
 */
export interface ThemeConfig {
  name: string
  colors: ThemeColors
}

// Cache for loaded themes to avoid re-loading
const loadedThemes = new Set<string>()
const themeStyleElements = new Map<string, HTMLStyleElement>()

/**
 * Generate CSS for a theme from its color configuration
 */
function generateThemeCSS(themeName: string, themeColors: ThemeColors): string {
  const cssVariables = Object.entries(themeColors)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n')

  return `[data-theme='${themeName}'] {\n${cssVariables}\n}`
}

/**
 * Load a theme dynamically by injecting its CSS variables
 * 
 * @param themeName - The name of the theme (used for data-theme attribute)
 * @param themeColors - Optional theme colors to inject. If not provided, assumes theme is pre-defined in CSS.
 */
export async function loadTheme(themeName: string, themeColors?: ThemeColors): Promise<void> {
  // Skip if theme is already loaded
  if (loadedThemes.has(themeName)) {
    return
  }

  // Skip system themes (light/dark) as they should be defined in globals.css
  if (themeName === 'light' || themeName === 'dark' || themeName === 'system') {
    loadedThemes.add(themeName)
    return
  }

  // If no colors provided, assume theme is pre-defined
  if (!themeColors) {
    loadedThemes.add(themeName)
    return
  }

  try {
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

/**
 * Unload a dynamically loaded theme
 */
export function unloadTheme(themeName: string): void {
  const styleElement = themeStyleElements.get(themeName)
  if (styleElement && styleElement.parentNode) {
    styleElement.parentNode.removeChild(styleElement)
  }

  loadedThemes.delete(themeName)
  themeStyleElements.delete(themeName)
}

/**
 * Check if a theme is currently loaded
 */
export function isThemeLoaded(themeName: string): boolean {
  return loadedThemes.has(themeName)
}

/**
 * Apply a theme to the document
 */
export function applyTheme(themeName: string): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', themeName)
  }
}

/**
 * Get the currently applied theme
 */
export function getCurrentTheme(): string | null {
  if (typeof document !== 'undefined') {
    return document.documentElement.getAttribute('data-theme')
  }
  return null
}

/**
 * Preload a theme without applying it
 */
export async function preloadTheme(themeName: string, themeColors?: ThemeColors): Promise<void> {
  await loadTheme(themeName, themeColors)
}
