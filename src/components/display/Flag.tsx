// Flag.tsx - Country flag component
import React from 'react'
import { cn } from '../../utils'
import { flag, FlagType } from '../../data/flags'

export interface FlagProps {
  /** The flag name/key to look up */
  name: FlagType
  /** Optional custom class name */
  className?: string
}

export const Flag: React.FC<FlagProps> = ({ name, className = '' }) => {
  const dArr = flag[name]

  if (!dArr) {
    return (
      <img
        src='/images/whale3.png'
        alt='Default flag'
        className={cn('w-full h-full rounded-[var(--md-sys-shape-corner-full)]', className)}
      />
    )
  }

  const newDArr = dArr.reduce((acc, _, idx, arr) => {
    if (idx % 2 === 0) acc.push(arr.slice(idx, idx + 2))
    return acc
  }, [] as string[][])

  return (
    <svg className={cn('w-full h-full', className)} viewBox='0 0 32 32' fill='none'>
      {newDArr.map((item: string[], idx: number) => (
        <path key={`${name}-${idx}`} d={item[0]} fill={item[1]} />
      ))}
    </svg>
  )
}
