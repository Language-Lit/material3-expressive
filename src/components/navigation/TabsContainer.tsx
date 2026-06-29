'use client'

import React, { useEffect } from 'react'
import { Tabs, TabItem } from './Tabs'
import { IconProps } from '../display/Icon'
import { useMaterial3 } from '../../context/Material3Provider'

export type TabData = {
  id: string
  label: string
  icon?: IconProps['name']
}

export interface TabsContainerProps {
  children?: React.ReactNode
  tabs: TabData[]
  basePath: string
  /** Active tab id (e.g. derived from the `?tab=` query param). Defaults to the first tab. */
  activeTab?: string
  onPrefetch?: (tabId: string) => void
  onTabChange?: (tabId: string) => void
  /**
   * Called with the full tab href when a tab is clicked. The consumer performs
   * navigation. When omitted, the rendered link navigates natively.
   */
  onNavigate?: (href: string) => void
}

const TabsContainer = ({
  children,
  tabs,
  basePath,
  activeTab,
  onPrefetch,
  onTabChange,
  onNavigate,
}: TabsContainerProps) => {
  const { Link } = useMaterial3()

  const activeTabId = (activeTab && tabs.find(t => t.id === activeTab)?.id) || tabs[0]?.id

  // Notify parent of tab changes
  useEffect(() => {
    if (activeTabId && onTabChange) {
      onTabChange(activeTabId)
    }
  }, [activeTabId, onTabChange])

  // Prefetch data for all tabs on mount
  useEffect(() => {
    tabs.forEach(tab => {
      onPrefetch?.(tab.id)
    })
  }, [tabs, onPrefetch])

  const handleTabClick = (e: React.MouseEvent, href: string) => {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(href)
    }
    // Otherwise let the anchor navigate natively.
  }

  return (
    <div className='flex flex-col h-full'>
      <Tabs value={activeTabId || ''}>
        {tabs.map(tabData => {
          const href = `${basePath}?tab=${tabData.id}`
          return (
            <Link
              key={tabData.id}
              href={href}
              scroll={false}
              onClick={(e) => handleTabClick(e, href)}
            >
              <TabItem
                id={tabData.id}
                label={tabData.label}
                icon={tabData.icon}
              />
            </Link>
          )
        })}
      </Tabs>
      {children && (
        <div className='flex-1 overflow-hidden flex flex-col'>
          <div className='flex-1 overflow-auto bg-[var(--md-sys-color-surface)] medium:[border-radius:var(--md-sys-shape-corner-small)] p-24dp'>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export default TabsContainer
