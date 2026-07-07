// BentoGrid.tsx - Bento grid layout component
import React from 'react'

export interface BentoGridProps {
  children: React.ReactNode
  className?: string
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children, className = '' }) => (
  <div className={`grid grid-cols-1 medium:grid-cols-2 expanded:grid-cols-3 large:grid-cols-4 extra-large:grid-cols-5 gap-16dp ${className}`}>
    {children}
  </div>
)
