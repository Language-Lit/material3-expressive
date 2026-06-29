/**
 * Font loading utilities for Material 3 Expressive
 * 
 * These utilities help with dynamic font loading and management
 * for internationalization support.
 */

/**
 * Font configuration for a locale
 */
export interface FontConfig {
  /** CSS variable name for the font (e.g., '--font-noto-sans-ja') */
  variable: string
  /** CSS class name to apply to the body */
  className: string
}

/**
 * Font loader configuration
 */
export interface FontLoaderConfig {
  /** Function to get font config for a locale */
  getFontConfig: (locale: string) => FontConfig | null
  /** Base font variable to fall back to */
  baseFontVariable?: string
}

// Cache for loaded fonts to avoid re-loading
const loadedFonts = new Set<string>()
const fontStyleElements = new Map<string, HTMLStyleElement>()

/**
 * Generate CSS for applying a font
 */
function generateFontCSS(fontVariable: string, baseFontVariable = '--font-noto-sans'): string {
  return `
    body {
      font-family: var(${fontVariable}), var(${baseFontVariable}), sans-serif !important;
    }
  `
}

/**
 * Load a font for a specific locale
 * 
 * @param locale - The locale code (e.g., 'ja', 'ko', 'zh')
 * @param config - Font loader configuration
 */
export function loadFont(locale: string, config: FontLoaderConfig): void {
  const primaryLocale = locale.split('-')[0].toLowerCase()

  // Skip if font is already loaded
  if (loadedFonts.has(primaryLocale)) {
    return
  }

  try {
    const fontConfig = config.getFontConfig(locale)

    if (!fontConfig) {
      // No specific font needed for this locale
      return
    }

    // Generate CSS for the font
    const css = generateFontCSS(fontConfig.variable, config.baseFontVariable)

    // Create and inject style element
    const styleElement = document.createElement('style')
    styleElement.setAttribute('data-font-locale', primaryLocale)
    styleElement.textContent = css

    // Remove existing font style if it exists
    const existingStyle = fontStyleElements.get(primaryLocale)
    if (existingStyle && existingStyle.parentNode) {
      existingStyle.parentNode.removeChild(existingStyle)
    }

    // Add new style to head
    document.head.appendChild(styleElement)

    // Add the font class to the body
    if (typeof document !== 'undefined') {
      document.body.classList.add(fontConfig.className)
    }

    // Cache the loaded font and style element
    loadedFonts.add(primaryLocale)
    fontStyleElements.set(primaryLocale, styleElement)
  } catch (error) {
    console.error(`Failed to load font for locale '${locale}':`, error)
  }
}

/**
 * Unload a font for a specific locale
 */
export function unloadFont(locale: string): void {
  const primaryLocale = locale.split('-')[0].toLowerCase()
  
  const styleElement = fontStyleElements.get(primaryLocale)
  if (styleElement && styleElement.parentNode) {
    styleElement.parentNode.removeChild(styleElement)
  }

  loadedFonts.delete(primaryLocale)
  fontStyleElements.delete(primaryLocale)
}

/**
 * Check if a font is loaded for a locale
 */
export function isFontLoaded(locale: string): boolean {
  const primaryLocale = locale.split('-')[0].toLowerCase()
  return loadedFonts.has(primaryLocale)
}

/**
 * Preload a font without applying it
 */
export function preloadFont(locale: string, config: FontLoaderConfig): void {
  // For Next.js fonts, preloading is handled by the framework
  // This function ensures the font config is available
  try {
    config.getFontConfig(locale)
  } catch (error) {
    console.error(`Failed to preload font for locale '${locale}':`, error)
  }
}

/**
 * Get all currently loaded font locales
 */
export function getLoadedFonts(): string[] {
  return Array.from(loadedFonts)
}
