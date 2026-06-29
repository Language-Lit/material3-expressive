// CarouselCard.tsx - Individual carousel card component
'use client'

import React from 'react'
import { motion, DragControls } from 'framer-motion'
import clsx from 'clsx'
import { useMaterial3 } from '../../../context/Material3Provider'

export interface CarouselCardProps {
  size: 'small' | 'medium' | 'large'
  imageUrl: string
  dragControls: DragControls
}

const variants = {
  small: { width: 'calc(20% - 3.2px)' },
  medium: { width: 'calc(30% - 4.8px)' },
  large: { width: 'calc(50% - 8px)' },
}

export const CarouselCard: React.FC<CarouselCardProps> = ({ size, imageUrl, dragControls }) => {
  const { Image } = useMaterial3()
  const cardClasses = clsx(
    'carousel-card aspect-[3/4] flex-shrink-0 rounded-[var(--md-sys-shape-corner-extra-large)] overflow-hidden relative'
  )

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragControls.start(e)
  }

  return (
    <motion.div
      className={cardClasses}
      animate={{ width: variants[size].width }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onPointerDown={handlePointerDown}
    >
      <div className='absolute inset-0 flex items-center justify-center overflow-hidden'>
        <div 
          style={{
            width: '100%',
            height: '100%',
            maxWidth: 'none',
            maxHeight: 'none'
          }}
          className='relative'
        >
          <Image
            src={imageUrl}
            alt='Carousel item'
            fill
            style={{ objectFit: 'cover' }}
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            priority
          />
        </div>
      </div>
    </motion.div>
  )
}

export default CarouselCard
