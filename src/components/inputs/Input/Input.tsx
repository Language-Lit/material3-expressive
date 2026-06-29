'use client'

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
} from 'react'
import { type VariantProps } from 'tailwind-variants'
import { Icon, IconProps } from '../../display/Icon'
import {
  inputContainer,
  inputWrapper,
  inputField,
  inputLabel,
  inputIcon,
  inputBottomIndicator,
  inputBottomIndicatorBar,
  inputSupportingText,
  inputRoot,
} from './Input.variants'

// Input component props
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputContainer> {
  label: string
  leadingIcon?: IconProps['name']
  trailingIcon?: IconProps['name']
  supportingText?: string
  error?: boolean
}

// InputIcon component
const InputIcon: React.FC<{
  position: 'left' | 'right'
  name: IconProps['name']
  variant: VariantProps<typeof inputContainer>['variant']
  focused: boolean
}> = ({ position, name, variant, focused }) => (
  <Icon
    className={inputIcon({ position, variant, focused })}
    opsz={24}
    name={name}
  />
)

// Main Input component
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      className,
      variant = 'filled',
      leadingIcon,
      trailingIcon,
      supportingText,
      error = false,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const handleFocus = () => setFocused(true)

    const handleBlur = () => {
      setFocused(false)
      checkValue()
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.trim().length > 0)
      if (props.onChange) {
        props.onChange(e)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab') {
        setFocused(false)
        checkValue()
      }
    }

    const handleContainerClick = () => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }

    const checkValue = () => {
      if (inputRef.current) {
        setHasValue(inputRef.current.value.trim().length > 0)
      }
    }

    useEffect(() => {
      checkValue()
    }, [props.value])

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          inputRef.current &&
          !inputRef.current.contains(event.target as Node)
        ) {
          setFocused(false)
          checkValue()
        }
      }

      document.addEventListener('mousedown', handleClickOutside)

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [])

    return (
      <div className={inputRoot()}>
        <div
          className={inputContainer({
            variant,
            hasLeadingIcon: !!leadingIcon,
            hasTrailingIcon: !!trailingIcon,
            focused,
            className,
          })}
          onClick={handleContainerClick}
        >
          {leadingIcon && (
            <InputIcon
              position='left'
              name={leadingIcon}
              variant={variant}
              focused={focused}
            />
          )}
          <div className={inputWrapper({ variant })}>
            <input
              ref={(el) => {
                inputRef.current = el
                if (typeof ref === 'function') {
                  ref(el)
                } else if (ref) {
                  ref.current = el
                }
              }}
              className={inputField({ variant, error })}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              onInput={checkValue}
              onKeyDown={handleKeyDown}
              {...props}
            />
          </div>
          <label
            className={inputLabel({
              variant,
              focused: focused || hasValue,
              hasLeadingIcon: !!leadingIcon,
            })}
          >
            {label}
          </label>
          {trailingIcon && (
            <InputIcon
              position='right'
              name={trailingIcon}
              variant={variant}
              focused={focused}
            />
          )}
          {variant === 'filled' && (
            <div className={inputBottomIndicator()}>
              <div className={inputBottomIndicatorBar({ focused })} />
            </div>
          )}
        </div>
        {supportingText && (
          <p className={inputSupportingText({ variant, focused })}>
            {supportingText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
