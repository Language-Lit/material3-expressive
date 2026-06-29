'use client'

import React, { useState, useEffect, useRef, forwardRef } from 'react'
import { type VariantProps } from 'tailwind-variants'
import { Icon, IconProps } from '../../display/Icon'
import {
  textAreaContainer,
  textAreaWrapper,
  textAreaField,
  textAreaLabel,
  textAreaIcon,
  textAreaBottomIndicator,
  textAreaBottomIndicatorBar,
  textAreaSupportingText,
  textAreaRoot,
} from './TextArea.variants'

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textAreaContainer> {
  label: string
  leadingIcon?: IconProps['name']
  supportingText?: string
  error?: boolean
}

const TextAreaIcon: React.FC<{
  name: IconProps['name']
  variant: VariantProps<typeof textAreaContainer>['variant']
  focused: boolean
}> = ({ name, variant, focused }) => (
  <Icon
    className={textAreaIcon({ variant, focused })}
    opsz={24}
    name={name}
  />
)

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      className,
      variant = 'filled',
      leadingIcon,
      supportingText,
      error = false,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null)

    const handleFocus = () => setFocused(true)

    const handleBlur = () => {
      setFocused(false)
      checkValue()
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(e.target.value.trim().length > 0)
      if (props.onChange) {
        props.onChange(e)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        setFocused(false)
        checkValue()
      }
    }

    const handleContainerClick = () => {
      if (textAreaRef.current) {
        textAreaRef.current.focus()
      }
    }

    const checkValue = () => {
      if (textAreaRef.current) {
        setHasValue(textAreaRef.current.value.trim().length > 0)
      }
    }

    useEffect(() => {
      checkValue()
    }, [props.value])

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          textAreaRef.current &&
          !textAreaRef.current.contains(event.target as Node)
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
      <div className={textAreaRoot()}>
        <div
          className={textAreaContainer({
            variant,
            hasLeadingIcon: !!leadingIcon,
            focused,
            className,
          })}
          onClick={handleContainerClick}
        >
          {leadingIcon && (
            <TextAreaIcon
              name={leadingIcon}
              variant={variant}
              focused={focused}
            />
          )}
          <div className={textAreaWrapper()}>
            <textarea
              ref={(el) => {
                textAreaRef.current = el
                if (typeof ref === 'function') {
                  ref(el)
                } else if (ref) {
                  ref.current = el
                }
              }}
              rows={rows}
              className={textAreaField({ variant, error })}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              onInput={checkValue}
              onKeyDown={handleKeyDown}
              {...props}
            />
          </div>
          <label
            className={textAreaLabel({
              variant,
              focused: focused || hasValue,
              hasLeadingIcon: !!leadingIcon,
            })}
          >
            {label}
          </label>
          {variant === 'filled' && (
            <div className={textAreaBottomIndicator()}>
              <div className={textAreaBottomIndicatorBar({ focused })} />
            </div>
          )}
        </div>
        {supportingText && (
          <p
            className={textAreaSupportingText({
              variant,
              focused: variant === 'outlined' ? focused : false,
            })}
          >
            {supportingText}
          </p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'
