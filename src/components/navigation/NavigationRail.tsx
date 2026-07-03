// NavigationRail.tsx
'use client'

import { useEffect, useState } from 'react'
import { NavigationItem } from './NavigationItem'
import { IconButton } from '../buttons/IconButton'
import { iconNames } from '../display/Icon/Icon.names'
import { useMaterial3 } from '../../context/Material3Provider'

export interface navigationItemsProps {
  iconName: (typeof iconNames)[number]
  label: string
  link: string
}

export interface NavigationRailProps {
  navigationItems: navigationItemsProps[]
  /** Current location used to compute the active item (e.g. the router pathname). */
  activeLink: string
  /** Called when an item is selected. The consumer performs navigation. */
  onNavigate: (link: string) => void
  /** Optional prefetch hook, called on mount and on hover. */
  onPrefetch?: (link: string) => void
  /** Optional handler for the bottom settings button; the button renders only when provided. */
  onSettingsClick?: () => void
  /**
   * Optional FAB rendered docked at the top of the rail, above the
   * destinations — Material 3 spec position for a rail FAB.
   */
  fab?: React.ReactNode
}

export const NavigationRail = ({
  navigationItems,
  activeLink,
  onNavigate,
  onPrefetch,
  onSettingsClick,
  fab,
}: NavigationRailProps) => {
  const { Link } = useMaterial3()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Prefetch all routes on mount
  useEffect(() => {
    if (!onPrefetch) return
    navigationItems.forEach(item => onPrefetch(item.link))
  }, [navigationItems, onPrefetch])

  useEffect(() => {
    if (activeLink) {
      const currentIndex = navigationItems.findIndex(item => {
        const [basePath] = item.link.split('?')
        return activeLink.startsWith(basePath)
      })
      setActiveIndex(currentIndex)
    }
  }, [activeLink, navigationItems])

  const handleItemClick = (e: React.MouseEvent, link: string) => {
    e.preventDefault()
    onNavigate(link)
  }

  return (
    <div className='w-[80px] h-full bg-[var(--md-sys-color-surface-container-low)] flex flex-col pt-[44px] items-center'>
      <div className='flex flex-col pt-[40px] items-center h-screen'>
        {/* FAB docked at the top of the rail - Material 3 spec */}
        {fab && <div className='mt-[4px]'>{fab}</div>}
        <div className='mt-[40px] flex flex-col gap-[12px]'>
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              href={item.link}
              prefetch={true}
              onClick={(e) => handleItemClick(e, item.link)}
              onMouseEnter={() => onPrefetch?.(item.link)}
            >
              <NavigationItem
                iconName={item.iconName}
                label={item.label}
                isActive={activeIndex === index}
              />
            </Link>
          ))}
        </div>

        {/* Settings button at bottom - Material 3 spec */}
        {onSettingsClick && (
          <div className='mt-auto mb-24dp'>
            <IconButton
              icon='settings'
              variant='standard'
              onClick={onSettingsClick}
              aria-label='Settings'
            />
          </div>
        )}
      </div>
    </div>
  )
}
