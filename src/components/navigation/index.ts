/**
 * Navigation Component System
 *
 * Material 3 Expressive navigation components following best practices
 * from Radix UI, React Aria, and Material Design
 *
 * Architecture:
 * - NavigationBar: Bottom navigation for mobile
 * - NavigationDrawer: Side navigation drawer
 * - NavigationRail: Vertical navigation rail for larger screens
 * - NavigationItem: Individual navigation item
 * - Tabs/TabItem: Tab navigation
 * - TabsContainer: Tabs wrapper with content area
 * - MenuList: Shared primitive for positioned menus (portal, positioning, click outside)
 * - MenuItem: Shared item component (works with both React Aria and simple onClick)
 * - Select: React Aria-based select for form inputs
 * - DropdownMenu: Simple dropdown for action menus
 * - MoreOptionsMenu: Three-dot options menu
 *
 * Usage:
 *
 * For navigation:
 * ```tsx
 * import { NavigationBar, NavigationRail } from '@material3-expressive/components/navigation'
 *
 * <NavigationBar
 *   navigationItems={items}
 *   pathname={pathname}
 *   onNavigate={handleNavigate}
 * />
 * ```
 *
 * For form selects:
 * ```tsx
 * import { Select, SelectItem } from '@material3-expressive/components/navigation'
 *
 * <Select label="Choose option" selectedKey={value} onSelectionChange={onChange}>
 *   <SelectItem key="1">Option 1</SelectItem>
 *   <SelectItem key="2">Option 2</SelectItem>
 * </Select>
 * ```
 *
 * For dropdown menus:
 * ```tsx
 * import { DropdownMenu, MenuItem } from '@material3-expressive/components/navigation'
 *
 * <DropdownMenu isOpen={open} onClose={close} anchorEl={buttonRef.current}>
 *   <MenuItem onClick={handleAction}>Action</MenuItem>
 * </DropdownMenu>
 * ```
 */

// Navigation components
export { NavigationBar } from './NavigationBar'
export type { NavigationBarProps, navigationItemsProps } from './NavigationBar'

export { NavigationDrawer } from './NavigationDrawer'
export type { NavigationDrawerProps, NavigationDrawerItemData } from './NavigationDrawer'

export { NavigationRail } from './NavigationRail'
export type { NavigationRailProps, navigationItemsProps as NavigationRailItemData } from './NavigationRail'

export { NavigationItem } from './NavigationItem'
export type { NavigationItemProps } from './NavigationItem'

// Tab components
export { Tabs, TabItem } from './Tabs'
export type { TabsProps, TabItemProps } from './Tabs'

export { default as TabsContainer } from './TabsContainer'
export type { TabsContainerProps, TabData } from './TabsContainer'

// Menu primitives
export { MenuList } from './MenuList'
export type { MenuListProps } from './MenuList'

export { MenuItem, MenuDivider } from './MenuItem'
export type { MenuItemProps } from './MenuItem'

// High-level menu components
export { Select, SelectItem } from './Select'
export type { SelectProps } from './Select'

export { DropdownMenu } from './DropdownMenu'
export type { DropdownMenuProps } from './DropdownMenu'

export { MoreOptionsMenu } from './MoreOptionsMenu'
export type { MoreOptionsMenuProps, MenuAction } from './MoreOptionsMenu'

// Variants (for advanced customization)
export { menuVariants, menuItemVariants, selectButtonVariants } from './menu.variants'
