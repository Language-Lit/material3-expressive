import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { cn } from '../../utils/cn'
import { Icon, IconProps } from '../display/Icon'
import { Text } from '../display/Text'

interface TabsContextType {
  activeTab: string
  registerTab: (
    id: string,
    ref: React.RefObject<HTMLButtonElement | null>,
    contentRef: React.RefObject<HTMLDivElement | null>
  ) => void
  hasIcons: boolean
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export interface TabsProps {
  children: React.ReactNode
  value: string
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({ children, value, className }) => {
  const [tabs, setTabs] = useState<{
    [key: string]: {
      ref: React.RefObject<HTMLButtonElement | null>
      contentRef: React.RefObject<HTMLDivElement | null>
    }
  }>({})
  const controls = useAnimationControls()
  const tabsRef = useRef<HTMLDivElement | null>(null)
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [isMounted, setIsMounted] = useState(false)

  // Helper to find TabItem in nested structure (handles Link, div wrappers)
  const findTabItem = (
    element: React.ReactNode,
    depth = 0
  ): React.ReactElement<TabItemProps> | null => {
    if (depth > 3) return null // Prevent infinite recursion
    if (!React.isValidElement(element)) return null

    // @ts-expect-error - displayName exists on function components but not in JSXElementConstructor type
    if (element.type?.displayName === 'TabItem') {
      return element as React.ReactElement<TabItemProps>
    }

    // Check children - cast props to access children property
    const elementProps = element.props as { children?: React.ReactNode }
    const elementChildren = elementProps.children
    if (elementChildren) {
      if (React.isValidElement(elementChildren)) {
        return findTabItem(elementChildren, depth + 1)
      }
      if (Array.isArray(elementChildren)) {
        for (const child of elementChildren) {
          const found = findTabItem(child, depth + 1)
          if (found) return found
        }
      }
    }
    return null
  }

  const hasIcons = React.Children.toArray(children).some((child) => {
    const tabItem = findTabItem(child)
    return !!tabItem?.props.icon
  })

  const registerTab = useCallback(
    (
      id: string,
      ref: React.RefObject<HTMLButtonElement | null>,
      contentRef: React.RefObject<HTMLDivElement | null>
    ) => {
      setTabs((prev) => ({ ...prev, [id]: { ref, contentRef } }))
    },
    []
  )

  const updateActiveIndicator = useCallback(() => {
    // Only run animations after component is mounted
    if (!isMounted) return

    // Clear any pending animation
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    // Debounce rapid tab switches
    animationTimeoutRef.current = setTimeout(() => {
      const activeTabData = tabs[value]
      if (
        activeTabData &&
        activeTabData.ref.current &&
        activeTabData.contentRef.current &&
        tabsRef.current
      ) {
        const activeTabElement = activeTabData.ref.current
        const activeContentElement = activeTabData.contentRef.current

        const tabsRect = tabsRef.current.getBoundingClientRect()
        const activeTabRect = activeTabElement.getBoundingClientRect()
        const contentRect = activeContentElement.getBoundingClientRect()

        if (activeTabRect.width > 0 && contentRect.width > 0) {
          const indicatorWidth = contentRect.width
          const indicatorLeft =
            activeTabRect.left -
            tabsRect.left +
            tabsRef.current.scrollLeft +
            (activeTabRect.width - contentRect.width) / 2

          controls.start({
            width: indicatorWidth,
            x: indicatorLeft,
            transition: {
              type: 'spring',
              duration: 0.3,
              ease: [0.2, 0, 0, 1],
            },
          })
        } else {
          controls.start({ width: 0, x: 0, transition: { duration: 0 } })
        }
      } else {
        controls.start({ width: 0, x: 0, transition: { duration: 0 } })
      }
    }, 16) // Debounce to next frame
  }, [tabs, value, controls, isMounted])

  // Set mounted flag after first render
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    updateActiveIndicator()

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [updateActiveIndicator])

  return (
    <TabsContext.Provider
      value={{
        activeTab: value,
        registerTab,
        hasIcons,
      }}
    >
      <div className="relative w-full overflow-x-auto scrollbar-hide select-none">
        <div
          ref={tabsRef}
          className={cn(
            'flex flex-nowrap bg-[var(--md-sys-color-surface-container-low)] pl-[52px] expanded:pl-0',
            hasIcons ? 'h-64dp' : 'h-48dp',
            className
          )}
          role="tablist"
        >
          {children}
          <motion.span
            className="absolute bottom-0 left-0 h-[3px] rounded-t-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary)]"
            initial={{ width: 0, x: 0 }}
            animate={controls}
          />
        </div>
      </div>
    </TabsContext.Provider>
  )
}

export interface TabItemProps {
  id: string
  label: string
  icon?: IconProps['name']
  className?: string
  href?: string
  onClick?: () => void
  onMouseEnter?: () => void
}

export const TabItem = React.forwardRef<HTMLButtonElement, TabItemProps>(
  (
    { id, label, icon, className, href, onClick, onMouseEnter },
    forwardedRef
  ) => {
    const context = useContext(TabsContext)
    if (!context) throw new Error('TabItem must be used within Tabs')

    const { activeTab, registerTab, hasIcons } = context
    const isActive = activeTab === id
    const buttonRef = useRef<HTMLButtonElement | null>(null)
    const contentRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      if (typeof forwardedRef === 'function') {
        forwardedRef(buttonRef.current)
      } else if (forwardedRef) {
        forwardedRef.current = buttonRef.current
      }
    }, [forwardedRef])

    useEffect(() => {
      registerTab(id, buttonRef, contentRef)
    }, [id, registerTab])

    return (
      <button
        ref={buttonRef}
        role="tab"
        aria-selected={isActive}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        className={cn(
          'flex flex-col items-center justify-center transition-colors duration-[var(--md-sys-motion-duration-medium2)] focus:outline-none relative',
          'flex-shrink-0 px-6',
          'min-w-[120px]',
          hasIcons ? 'h-64dp' : 'h-48dp',
          className
        )}
      >
        <div className="absolute inset-0 bg-[var(--md-sys-color-on-surface)] opacity-0 hover:opacity-[var(--md-sys-state-hover-state-layer-opacity)] transition-opacity duration-[var(--md-sys-motion-duration-medium2)]" />

        <div ref={contentRef} className="flex flex-col items-center">
          {icon && (
            <Icon
              name={icon}
              className={cn(
                'mb-[2px] text-[24px]',
                isActive
                  ? 'icon-fill-1 text-[var(--md-sys-color-primary)]'
                  : 'icon-fill-0 text-[var(--md-sys-color-on-surface-variant)]'
              )}
            />
          )}
          <Text
            type="label"
            size="small"
            className={cn(
              isActive
                ? 'text-[var(--md-sys-color-primary)]'
                : 'text-[var(--md-sys-color-on-surface-variant)]'
            )}
          >
            {label}
          </Text>
        </div>
      </button>
    )
  }
)

TabItem.displayName = 'TabItem'
