// NavigationBar.tsx
'use client'

import React, { useEffect, useState, startTransition } from 'react'
import { iconNames } from '../display/Icon/Icon.names'
import { NavigationItem } from './NavigationItem'

export interface navigationItemsProps {
  iconName: (typeof iconNames)[number]
  label: string
  link: string
  /** M3 badge on the icon: `true` = dot, number/string = labeled badge (0/false/undefined = none). */
  badge?: boolean | number | string
}

export interface NavigationBarProps {
  navigationItems: navigationItemsProps[]
  /** Current location used to compute the active item (e.g. the router pathname). */
  activeLink: string
  /** Called when an item is selected. The consumer performs navigation. */
  onNavigate: (link: string) => void
  /** Optional prefetch hook, called once per item on mount. */
  onPrefetch?: (link: string) => void
  /** Optional floating action button rendered bottom-right. */
  fab?: React.ReactNode
}

export const NavigationBar = ({
  navigationItems,
  activeLink,
  onNavigate,
  onPrefetch,
  fab,
}: NavigationBarProps) => {
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

  const handleItemClick = (link: string, index: number) => {
    setActiveIndex(index) // Optimistic UI
    startTransition(() => onNavigate(link))
  }

  return (
    <>
      <div className='fixed bottom-0 left-0 right-0 bg-[var(--md-sys-color-surface-container)] flex justify-evenly pt-12dp pb-16dp'>
        {navigationItems.map((item, index) => (
          <div className='flex-1' key={index}>
            <NavigationItem
              iconName={item.iconName}
              label={item.label}
              badge={item.badge}
              isActive={activeIndex === index}
              onClick={() => handleItemClick(item.link, index)}
            />
          </div>
        ))}
      </div>
      {fab && (
        <div className='fixed bottom-96dp right-24dp z-10'>
          {fab}
        </div>
      )}
    </>
  )
}
