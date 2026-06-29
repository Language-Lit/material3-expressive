/**
 * Material 3 Expressive Library
 * 
 * A comprehensive React component library implementing Material 3 Expressive design system.
 * 
 * @packageDocumentation
 * 
 * ## Usage
 * 
 * ```tsx
 * // Import components
 * import { Button, Card, Icon } from '@material3-expressive'
 * 
 * // Import types
 * import type { ButtonProps, ThemeName } from '@material3-expressive'
 * 
 * // Import hooks
 * import { useThemeLoader, useDebounce } from '@material3-expressive'
 * 
 * // Import utilities
 * import { cn, dpToPx } from '@material3-expressive'
 * ```
 * 
 * ## Styles
 * 
 * Import the library styles in your CSS:
 * ```css
 * @import '@material3-expressive/styles';
 * ```
 * 
 * ## Tailwind
 * 
 * Use the Tailwind preset in your config:
 * ```js
 * import { material3Preset } from '@material3-expressive/tailwind-preset'
 * 
 * export default {
 *   presets: [material3Preset],
 *   // ...
 * }
 * ```
 */

// ============================================================================
// Component Exports
// ============================================================================

// Button components
export * from './components/buttons'

// Navigation components
export {
  NavigationBar,
  NavigationDrawer,
  NavigationRail,
  NavigationItem,
  Tabs,
  TabItem,
  TabsContainer,
  Select,
  SelectItem,
  DropdownMenu,
  MenuItem,
  MenuDivider,
  MenuList,
  MoreOptionsMenu,
  menuVariants,
  menuItemVariants,
  selectButtonVariants,
} from './components/navigation'

// Input components
export * from './components/inputs'

// Feedback components
export * from './components/feedback'

// Modal components
export * from './components/modals'

// Display components
export * from './components/display'

// ============================================================================
// Context / Provider Exports
// ============================================================================

export {
  Material3Provider,
  useMaterial3,
} from './context/Material3Provider'

// ============================================================================
// Hook Exports
// ============================================================================

// Export hooks - but not the utility functions that are also in utils
export {
  useOnClickOutside,
  useIntersectionObserver,
  useIntersectionOnce,
  useDebounce,
  useThemeLoader,
  useFontLoader,
} from './hooks'

// ============================================================================
// Utility Exports
// ============================================================================

export * from './utils'

// ============================================================================
// Type Exports
// ============================================================================

// Export types - explicitly to avoid duplicates
export type {
  ThemeName,
  ThemeMetadata,
  WrapperScheme,
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  FABProps,
  FABVariant,
  IconButtonProps,
  IconButtonVariant,
  IconButtonSize,
  RippleButtonProps,
  NavigationBarProps,
  NavigationItemData,
  NavigationDrawerProps,
  NavigationDrawerItemData,
  NavigationRailProps,
  NavigationRailItemData,
  NavigationItemProps,
  TabsProps,
  TabItemProps,
  TabsContainerProps,
  TabData,
  MenuListProps,
  MenuItemProps,
  SelectProps,
  DropdownMenuProps,
  MoreOptionsMenuProps,
  MenuAction,
  InputProps,
  TextAreaProps,
  CheckboxProps,
  RadioProps,
  SwitchProps,
  SegmentedButtonsProps,
  Tab,
  CircularProgressProps,
  LinearProgressProps,
  EmptyStateProps,
  HorizontalEmptyStateProps,
  DialogProps,
  ModalProps,
  IconProps,
  IconName,
  TextProps,
  ColorVariant,
  BentoGridProps,
  ScrollProgressProps,
  FlagProps,
  ImageComponentProps,
  CarouselProps,
  CarouselCardProps,
  UseThemeLoaderOptions,
  UseFontLoaderOptions,
  Material3ProviderProps,
  Material3ContextValue,
  M3LinkProps,
  M3ImageProps,
  LinkComponent,
  ImageComponent as ImageComponentType,
} from './types'
