import { createContext, useContext } from 'react'
import type { TokenCustomProperties } from '../tokens/css'
import { defaultTheme } from './theme'
import type { ColorMode, Material3Theme, ResolvedColorMode } from './theme.types'

export const Material3ThemeContext = createContext<Material3Theme>(defaultTheme)
export const ResolvedColorModeContext = createContext<ResolvedColorMode>('light')

/** The class every provider scope carries; see ADR 0003 §2. */
export const THEME_SCOPE_CLASS = 'm3e-theme'

/**
 * Everything that makes an element a token scope: the `.m3e-theme` class the
 * generated stylesheet keys its base and alias declarations on, the color-mode
 * attribute its light/dark rules select through, and the provider's inline
 * differences from the default theme.
 *
 * A portaled overlay renders into `document.body`, which is a *sibling* of the
 * provider's element rather than a descendant, so it inherits none of the three
 * and falls back to the light defaults `:root` carries. Re-applying this triple
 * to a portal root reconstitutes the nearest provider's scope at the top of the
 * body — the same values on the same contract, not a second mechanism.
 */
export interface ThemeScope {
  readonly className: typeof THEME_SCOPE_CLASS
  readonly colorMode: ColorMode
  readonly style: TokenCustomProperties
}

export const ThemeScopeContext = createContext<ThemeScope | null>(null)

export function useMaterial3Theme(): Material3Theme {
  return useContext(Material3ThemeContext)
}

export function useResolvedColorMode(): ResolvedColorMode {
  return useContext(ResolvedColorModeContext)
}

/**
 * The scope a portaled overlay must re-apply to its portal root, or `undefined`
 * when no provider encloses it.
 *
 * `undefined` is deliberate rather than a light-mode default: without a
 * provider the document's own scope governs, which is how an application that
 * puts `.m3e-theme` and `data-m3e-color-mode` on `<html>` itself already themes
 * `document.body`. Emitting a mode there would override that with a mode the
 * library was never told about.
 */
export function usePortalThemeScope(): ThemeScope | undefined {
  return useContext(ThemeScopeContext) ?? undefined
}
