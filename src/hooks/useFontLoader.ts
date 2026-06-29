'use client'

import { useEffect, useState, useCallback } from 'react'

export interface FontConfig {
  className: string
  variable: string
}

// Cache for loaded fonts to avoid re-loading
const loadedFonts = new Set<string>()
const fontStyleElements = new Map<string, HTMLStyleElement>()

function generateFontCSS(fontVariable: string): string {
  return `
    body {
      font-family: var(${fontVariable}), var(--font-noto-sans), sans-serif !important;
    }
  `
}

export function loadFont(
  locale: string,
  getFontConfig?: (locale: string) => FontConfig | null
): void {
  const primaryLocale = locale.split('-')[0].toLowerCase()

  // Skip if font is already loaded
  if (loadedFonts.has(primaryLocale)) {
    return
  }

  if (!getFontConfig) {
    return
  }

  try {
    const fontConfig = getFontConfig(locale)

    if (!fontConfig) {
      // No specific font needed for this locale
      return
    }

    // Generate CSS for the font
    const css = generateFontCSS(fontConfig.variable)

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
    document.body.classList.add(fontConfig.className)

    // Cache the loaded font and style element
    loadedFonts.add(primaryLocale)
    fontStyleElements.set(primaryLocale, styleElement)
  } catch (error) {
    console.error(`Failed to load font for locale '${locale}':`, error)
  }
}

export function preloadFont(
  locale: string,
  getFontConfig?: (locale: string) => FontConfig | null
): void {
  // For Next.js fonts, preloading is handled by the framework
  // We just need to ensure the font config is available
  if (!getFontConfig) {
    return
  }

  try {
    getFontConfig(locale)
  } catch (error) {
    console.error(`Failed to preload font for locale '${locale}':`, error)
  }
}

export interface UseFontLoaderOptions {
  locale: string
  getFontConfig?: (locale: string) => FontConfig | null
  preloadLocales?: string[]
}

export function useFontLoader(options: UseFontLoaderOptions) {
  const { locale, getFontConfig, preloadLocales = ['ja', 'ko', 'zh', 'ar', 'ru'] } = options
  const [fontClass, setFontClass] = useState<string>('')
  const [fontVariable, setFontVariable] = useState<string>('')

  useEffect(() => {
    const loadCurrentFont = () => {
      try {
        // Load the font for the current locale
        loadFont(locale, getFontConfig)

        // Get the font configuration to extract className and variable
        if (getFontConfig) {
          const fontConfig = getFontConfig(locale)
          if (fontConfig) {
            setFontClass(fontConfig.className)
            setFontVariable(fontConfig.variable)
          }
        }
      } catch (error) {
        console.error('Error loading font:', error)
      }
    }

    loadCurrentFont()
  }, [locale, getFontConfig])

  useEffect(() => {
    // Preload fonts for common locales after initial load
    const preloadCommonFonts = () => {
      const currentPrimaryLocale = locale.split('-')[0].toLowerCase()

      // Preload after a delay to not interfere with initial loading
      setTimeout(() => {
        preloadLocales.forEach(preloadLocale => {
          if (preloadLocale !== currentPrimaryLocale) {
            preloadFont(preloadLocale, getFontConfig)
          }
        })
      }, 2000)
    }

    preloadCommonFonts()
  }, [locale, getFontConfig, preloadLocales])

  const load = useCallback(
    (loc: string) => loadFont(loc, getFontConfig),
    [getFontConfig]
  )

  const preload = useCallback(
    (loc: string) => preloadFont(loc, getFontConfig),
    [getFontConfig]
  )

  return {
    fontClass,
    fontVariable,
    loadFont: load,
    preloadFont: preload
  }
}
