// Icon component for Material Symbols
import React from 'react'
import clsx from 'clsx'
import { iconNames } from './Icon.names'

export type IconProps = {
  name: (typeof iconNames)[number] | string
  fill?: 0 | 1
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700
  grad?: -50 | 0 | 50 | 100 | 200
  opsz?: 18 | 20 | 24 | 40 | 48
  className?: string
}

export const Icon = ({ name, fill, weight, grad, opsz, className, ...props }: IconProps) => {
  const iconStyle = {
    '--font-FILL': fill,
    '--font-wght': weight,
    '--font-GRAD': grad,
    '--font-opsz': opsz,
  } as React.CSSProperties

  return (
    <span
      className={clsx('material-symbols-rounded', className)}
      style={iconStyle}
      {...props}
    >
      {name}
    </span>
  )
}

export { iconNames } from './Icon.names'
export type { IconName } from './Icon.names'
