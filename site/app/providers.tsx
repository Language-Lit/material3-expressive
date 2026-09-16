'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  Material3Provider,
  useResolvedColorMode,
  type ColorMode,
} from '@language-lit/material3-expressive'
import { createTheme, type Material3Theme } from '@language-lit/material3-expressive/theme'
import { buildPalette, defaultSourceColor } from '../theme/palette'

/*
 * Palette consumers subscribe separately from controls so choosing a source
 * color does not also re-render the site's component sampler and dialog shell.
 */

/** The selected source color and its derived palette. */
interface SiteSourceValue {
  sourceColor: string
  /** The tonal palette for `sourceColor`, derived once and shared. */
  palette: Record<string, string>
}

/** Controls that do not need the source palette. */
interface SiteThemeControlsValue {
  setSourceColor: (color: string) => void
  colorMode: ColorMode
  setColorMode: (mode: ColorMode) => void
  /** Present when the generated palette failed the library's own validation. */
  themeError: string | null
  resetTheme: () => void
  isCustomized: boolean
}

const SiteSourceContext = createContext<SiteSourceValue | null>(null)
const SiteThemeControlsContext = createContext<SiteThemeControlsValue | null>(null)

/** Subscribes to committed source-color changes. */
export function useSiteSource(): SiteSourceValue {
  const value = useContext(SiteSourceContext)
  if (!value) throw new Error('useSiteSource must be used inside SiteProviders')
  return value
}

/** Subscribes to the controls. Sits still while the source color changes. */
export function useThemeControls(): SiteThemeControlsValue {
  const value = useContext(SiteThemeControlsContext)
  if (!value) throw new Error('useThemeControls must be used inside SiteProviders')
  return value
}

const storageKey = 'm3e-site-theme'

interface StoredPreferences {
  sourceColor?: string
  colorMode?: ColorMode
}

function readStored(): StoredPreferences {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) ?? '{}') as StoredPreferences
  } catch {
    return {}
  }
}

/**
 * Mirrors the provider's resolved color mode onto the document element.
 *
 * The theme scope is a div inside `body`, so the browser canvas, scrollbars,
 * and native form controls have no way to know which palette the page settled
 * on. `color-scheme` is the one signal they read. This is the site adapting to
 * the library's deliberate choice not to mutate the document root.
 */
function ColorSchemeSync() {
  const mode = useResolvedColorMode()

  useEffect(() => {
    const previous = document.documentElement.style.colorScheme
    document.documentElement.style.colorScheme = mode
    return () => {
      document.documentElement.style.colorScheme = previous
    }
  }, [mode])

  return null
}

export function SiteProviders({ children }: { children: ReactNode }) {
  // The first client render must match the server markup, so preferences load
  // in an effect rather than during render. `systemModeFallback` gives the
  // server a deterministic snapshot; static CSS still paints the browser's
  // real scheme before hydration.
  const [sourceColor, setSourceColorState] = useState(defaultSourceColor)
  const [colorMode, setColorModeState] = useState<ColorMode>('system')

  useEffect(() => {
    const stored = readStored()
    if (stored.sourceColor) setSourceColorState(stored.sourceColor)
    if (stored.colorMode) setColorModeState(stored.colorMode)
  }, [])

  const persist = useCallback((next: StoredPreferences) => {
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ ...readStored(), ...next }),
      )
    } catch {
      // A site preference is not worth failing a render over.
    }
  }, [])

  const setSourceColor = useCallback(
    (color: string) => {
      setSourceColorState(color)
      persist({ sourceColor: color })
    },
    [persist],
  )

  const setColorMode = useCallback(
    (mode: ColorMode) => {
      setColorModeState(mode)
      persist({ colorMode: mode })
    },
    [persist],
  )

  const resetTheme = useCallback(() => {
    setSourceColor(defaultSourceColor)
  }, [setSourceColor])

  // Every consumer that paints a tonal ramp — the palettes, the section rules,
  // the brand mark, the shape field — wants the palette for this exact source
  // color, and so does `createTheme` below. Deriving it once here and passing
  // it down replaces six identical computations per change with one.
  const palette = useMemo(() => buildPalette(sourceColor), [sourceColor])

  // `createTheme` validates the complete resulting theme, including role-pair
  // contrast. A generated palette that fails is reported rather than swallowed:
  // the library rejecting an inaccessible theme is a feature worth showing.
  const { theme, themeError } = useMemo((): {
    theme: Material3Theme | undefined
    themeError: string | null
  } => {
    if (sourceColor === defaultSourceColor) return { theme: undefined, themeError: null }
    try {
      return { theme: createTheme({ reference: { palette } }), themeError: null }
    } catch (error) {
      return {
        theme: undefined,
        themeError: error instanceof Error ? error.message : String(error),
      }
    }
  }, [palette, sourceColor])

  const sourceValue = useMemo(
    (): SiteSourceValue => ({ sourceColor, palette }),
    [sourceColor, palette],
  )

  const isCustomized = sourceColor !== defaultSourceColor

  // Setters stay stable; `isCustomized` changes only when entering or leaving
  // the default palette.
  const controlsValue = useMemo(
    (): SiteThemeControlsValue => ({
      setSourceColor,
      colorMode,
      setColorMode,
      themeError,
      resetTheme,
      isCustomized,
    }),
    [setSourceColor, colorMode, setColorMode, themeError, resetTheme, isCustomized],
  )

  return (
    <SiteThemeControlsContext.Provider value={controlsValue}>
      <SiteSourceContext.Provider value={sourceValue}>
        <Material3Provider
          theme={theme}
          colorMode={colorMode}
          systemModeFallback="light"
          className="site-theme"
        >
          <ColorSchemeSync />
          {children}
        </Material3Provider>
      </SiteSourceContext.Provider>
    </SiteThemeControlsContext.Provider>
  )
}
