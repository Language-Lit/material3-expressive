'use client'

import React, { useRef, ReactNode } from 'react'
import { useSelectState } from '@react-stately/select'
import { useSelect, HiddenSelect } from '@react-aria/select'
import { useButton } from '@react-aria/button'
import { useListBox } from '@react-aria/listbox'
import { Item } from '@react-stately/collections'
import { Text } from '../display/Text'
import { Icon } from '../display/Icon'
import { MenuList } from './MenuList'
import { selectButtonVariants } from './menu.variants'

/**
 * Select - React Aria-based select component
 *
 * Use this for:
 * - Language selection
 * - Timezone selection
 * - Any form select input that needs accessibility
 *
 * Features:
 * - Full keyboard navigation
 * - Screen reader support
 * - React Aria integration
 * - Proper ARIA attributes
 *
 * Example:
 * ```tsx
 * <Select
 *   label="Select Language"
 *   selectedKey={selectedLang}
 *   onSelectionChange={handleChange}
 * >
 *   <SelectItem key="en">English</SelectItem>
 *   <SelectItem key="es">Spanish</SelectItem>
 * </Select>
 * ```
 */

import { MenuItem } from './MenuItem'

export { Item as SelectItem }

export interface SelectProps<T extends string | number> {
  label: string
  children: React.ReactElement<any> | React.ReactElement<any>[]
  selectedKey?: T | null
  onSelectionChange?: (key: T) => void
  className?: string
  placeholder?: string
  renderValue?: (key: T) => ReactNode
  renderOption?: (item: any) => ReactNode
  fullWidth?: boolean
  customWidth?: number
  disabled?: boolean
  name?: string
}

export function Select<T extends string | number>({
  label,
  children,
  selectedKey,
  onSelectionChange,
  className,
  placeholder,
  renderValue,
  renderOption,
  fullWidth = false,
  customWidth,
  disabled = false,
  name,
}: SelectProps<T>) {
  // React Stately: Manage select state
  const state = useSelectState({
    children,
    selectedKey: selectedKey as any,
    onSelectionChange: onSelectionChange as any,
    isDisabled: disabled,
  })

  // Refs
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listBoxRef = useRef<HTMLUListElement>(null)

  // React Aria: Get select props
  const { labelProps, triggerProps, valueProps, menuProps } = useSelect(
    {
      label,
      'aria-label': label,
      isDisabled: disabled,
    },
    state,
    triggerRef
  )

  // React Aria: Get listbox props
  const { listBoxProps } = useListBox(
    {
      label,
      autoFocus: state.selectionManager.focusedKey ? false : 'first',
      shouldSelectOnPressUp: true,
      disallowEmptySelection: true,
    },
    state,
    listBoxRef
  )

  // React Aria: Get button props for trigger
  const { buttonProps } = useButton(triggerProps, triggerRef)

  const { base, content, divider, icon } = selectButtonVariants({
    isOpen: state.isOpen,
    hasValue: !!selectedKey,
  })

  // Get the display value
  const selectedItem = state.selectedKey ? state.collection.getItem(state.selectedKey) : null
  const displayValue = selectedKey && renderValue
    ? renderValue(selectedKey)
    : selectedItem?.rendered

  return (
    <div className={className}>
      <Text
        {...labelProps}
        type='label'
        size='medium'
        className='mb-8dp text-[var(--md-sys-color-on-surface-variant)]'
      >
        {label}
      </Text>

      <HiddenSelect
        state={state}
        triggerRef={triggerRef}
        label={label}
        name={name}
      />

      <button
        {...buttonProps}
        ref={triggerRef}
        className={base()}
        disabled={disabled}
      >
        <div {...valueProps} className={content()}>
          {displayValue ? (
            displayValue
          ) : (
            <Text type="body" size="large" className='text-[var(--md-sys-color-on-surface-variant)]' as="span">
              {placeholder || 'Select an option'}
            </Text>
          )}
        </div>
        <span className={divider()}>
          <Icon
            name='expand_more'
            className={icon()}
            opsz={24}
            weight={400}
          />
        </span>
      </button>

      <MenuList
        {...menuProps}
        isOpen={state.isOpen}
        onClose={() => state.close()}
        anchorEl={triggerRef.current}
        fullWidth={fullWidth}
        customWidth={customWidth}
        listBoxProps={listBoxProps}
        listBoxRef={listBoxRef}
        disableClickOutside={false}
      >
        {Array.from(state.collection).map((item) => {
          // Use renderOption if provided, otherwise use default rendering
          if (renderOption) {
            return (
              <MenuItem key={item.key} item={item} state={state}>
                {renderOption(item)}
              </MenuItem>
            )
          }
          return (
            <MenuItem key={item.key} item={item} state={state}>
              {item.rendered}
            </MenuItem>
          )
        })}
      </MenuList>
    </div>
  )
}
