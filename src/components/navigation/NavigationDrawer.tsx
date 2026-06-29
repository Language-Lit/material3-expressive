// NavigationDrawer.tsx
'use client'

import { useEffect, useState } from 'react'
import { NavigationItem } from './NavigationItem'
import { Icon } from '../display/Icon'
import { iconNames } from '../display/Icon/Icon.names'

const FABButton = () => (
  <div 
    className='h-56dp w-56dp bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex justify-center items-center mb-24dp rounded-[var(--md-sys-shape-corner-large)] cursor-pointer select-none' 
  >
    <Icon name='exercise' />
  </div>
)

export interface NavigationDrawerItemData {
  iconName: (typeof iconNames)[number]
  label: string
  link: string
}

export interface NavigationDrawerProps {
  navigationItems: NavigationDrawerItemData[]
  /** Current pathname for active state detection */
  pathname?: string
  /** Callback when a navigation item is clicked */
  onNavigate?: (link: string) => void
  /** Render custom link wrapper */
  renderLink?: (props: { href: string; children: React.ReactNode }) => React.ReactNode
}

export const NavigationDrawer = ({ 
  navigationItems,
  pathname,
  onNavigate,
  renderLink
}: NavigationDrawerProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    if (pathname) {
      const currentIndex = navigationItems.findIndex(item => item.link === pathname)
      setActiveIndex(currentIndex)
    }
  }, [pathname, navigationItems])

  const handleItemClick = (index: number, link: string) => {
    setActiveIndex(index)
    onNavigate?.(link)
  }

  const renderNavItem = (item: NavigationDrawerItemData, index: number) => {
    const navItem = (
      <NavigationItem
        iconName={item.iconName}
        label={item.label}
        isActive={activeIndex === index}
        onClick={() => handleItemClick(index, item.link)}
      />
    )

    if (renderLink) {
      return renderLink({ href: item.link, children: navItem })
    }

    return navItem
  }

  return (
    <div className='w-[360px] h-full bg-[var(--md-sys-color-surface)] flex flex-col'>
      <div className='flex flex-col pt-40dp px-24dp items-start h-screen w-full'>
        <FABButton />
        <div className='mt-40dp w-full'>
          {navigationItems.map((item, index) => (
            <div key={index} className='mb-[12px] w-full'>
              {renderNavItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
