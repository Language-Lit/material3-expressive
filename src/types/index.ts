/**
 * Material 3 Expressive Library - Type Exports
 * 
 * This file exports all TypeScript types and interfaces for the library.
 */

// ============================================================================
// Theme Types
// ============================================================================

/**
 * Available theme names
 */
export type ThemeName = 'light' | 'dark' | 'system'

/**
 * Theme metadata for UI display
 */
export interface ThemeMetadata {
  name: string
  value: ThemeName
  color: string
}

/**
 * Theme colors - a record of CSS custom property names to values
 */
export type { ThemeColors } from '../utils/theme-loader'
export type { ThemeConfig } from '../utils/theme-loader'

// ============================================================================
// Wrapper Types
// ============================================================================

export type { WrapperScheme } from './wrapper'

// ============================================================================
// Button Component Types
// ============================================================================

export type { ButtonProps, ButtonVariant, ButtonSize } from '../components/buttons/Button'
export type { FABProps, FABVariant } from '../components/buttons/FAB'
export type { IconButtonProps, IconButtonVariant, IconButtonSize } from '../components/buttons/IconButton'
export type { RippleButtonProps } from '../components/buttons/RippleButton'

// ============================================================================
// Navigation Component Types
// ============================================================================

export type { NavigationBarProps, navigationItemsProps as NavigationItemData } from '../components/navigation/NavigationBar'
export type { NavigationDrawerProps, NavigationDrawerItemData } from '../components/navigation/NavigationDrawer'
export type { NavigationRailProps, navigationItemsProps as NavigationRailItemData } from '../components/navigation/NavigationRail'
export type { NavigationItemProps } from '../components/navigation/NavigationItem'
export type { TabsProps, TabItemProps } from '../components/navigation/Tabs'
export type { TabsContainerProps, TabData } from '../components/navigation/TabsContainer'
export type { MenuListProps } from '../components/navigation/MenuList'
export type { MenuItemProps } from '../components/navigation/MenuItem'
export type { SelectProps } from '../components/navigation/Select'
export type { DropdownMenuProps } from '../components/navigation/DropdownMenu'
export type { MoreOptionsMenuProps, MenuAction } from '../components/navigation/MoreOptionsMenu'

// ============================================================================
// Input Component Types
// ============================================================================

export type { InputProps } from '../components/inputs/Input/Input'
export type { TextAreaProps } from '../components/inputs/Input/TextArea'
export type { CheckboxProps } from '../components/inputs/Checkbox'
export type { RadioProps } from '../components/inputs/Radio'
export type { SwitchProps } from '../components/inputs/Switch'
export type { SegmentedButtonsProps, Tab } from '../components/inputs/SegmentedButtons'

// ============================================================================
// Feedback Component Types
// ============================================================================

export type { CircularProgressProps } from '../components/feedback/CircularProgress'
export type { LinearProgressProps } from '../components/feedback/LinearProgress'
export type { EmptyStateProps } from '../components/feedback/EmptyState'
export type { HorizontalEmptyStateProps } from '../components/feedback/HorizontalEmptyState'

// ============================================================================
// Modal Component Types
// ============================================================================

export type { DialogProps } from '../components/modals/Dialog'
export type { ModalProps } from '../components/modals/Modal'

// ============================================================================
// Display Component Types
// ============================================================================

export type { IconProps, IconName } from '../components/display/Icon'
export type { TextProps, ColorVariant } from '../components/display/Text'
export type { BentoGridProps } from '../components/display/BentoGrid'
export type { ScrollProgressProps } from '../components/display/ScrollProgress'
export type { FlagProps } from '../components/display/Flag'
export type { ImageComponentProps } from '../components/display/ImageComponent'
export type { CarouselProps } from '../components/display/Carousel/Carousel'
export type { CarouselCardProps } from '../components/display/Carousel/CarouselCard'

// ============================================================================
// Hook Types
// ============================================================================

export type { UseThemeLoaderOptions } from '../hooks/useThemeLoader'
export type { FontConfig, UseFontLoaderOptions } from '../hooks/useFontLoader'

// ============================================================================
// Context / Provider Types
// ============================================================================

export type {
  Material3ProviderProps,
  Material3ContextValue,
  M3LinkProps,
  M3ImageProps,
  LinkComponent,
  ImageComponent,
} from '../context/Material3Provider'

// ============================================================================
// Utility Types
// ============================================================================

export type { DpValue } from '../utils/spacing'
export type { FontLoaderConfig } from '../utils/font-loader'
