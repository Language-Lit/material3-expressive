// RippleButton/index.tsx
'use client'

import React, { MouseEvent } from 'react'
import clsx from 'clsx'
import { WrapperScheme } from '../../../types/wrapper'
// Ripple styles ship via the library stylesheet (`@language-lit/material3-expressive/styles`).

export interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  color: WrapperScheme
  children: React.ReactNode
}

const RippleButton: React.FC<RippleButtonProps> = ({ className, color, children, ...props }) => {
  const handleRipple = (e: MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget
    const ripple = document.createElement('span')
    const diameter = Math.max(button.clientWidth, button.clientHeight)
    const radius = diameter / 2

    ripple.style.width = ripple.style.height = `${diameter}px`
    ripple.style.left = `${button.clientWidth / 2 - radius}px`
    ripple.style.top = `${button.clientHeight / 2 - radius}px`
    ripple.classList.add('ripple')

    const rippleContainer = button.getElementsByClassName('ripple')[0]
    if (rippleContainer) {
      rippleContainer.remove()
    }

    button.appendChild(ripple)
  }

  return ( 
    <button
      className={clsx(
        'relative overflow-hidden m-2 px-8 py-2 rounded-[var(--md-sys-shape-corner-small)] text-lg shadow-md focus:outline-none',
        `bg-${color} text-white h-80dp w-200dp`,
        className
      )}
      onClick={handleRipple}
      {...props}
    >
      {children}
    </button>
  )
}

export default RippleButton
