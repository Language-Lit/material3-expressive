// Carousel.tsx - Carousel container component
'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useAnimation, useDragControls } from 'framer-motion'
import clsx from 'clsx'
import { CarouselCard } from './CarouselCard'

export interface CarouselProps {
  items: string[] // Array of image URLs
  className?: string
}

export const Carousel: React.FC<CarouselProps> = ({ items, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const controls = useAnimation()
  const dragControls = useDragControls()
  const [containerWidth, setContainerWidth] = useState(0)

  const outerContainerClasses = clsx(
    'w-full overflow-hidden py-2 px-4',
    className
  )

  const innerContainerClasses = clsx(
    'w-full overflow-hidden aspect-[3/2]'
  )

  const carouselContentClasses = clsx(
    'flex gap-2 h-full'
  )

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const gap = 8
  const cardWidth = containerWidth / 3 // Assuming 3 cards are visible at a time

  const handleDragEnd = (_: unknown, info: { velocity: { x: number }; offset: { x: number } }) => {
    const velocity = info.velocity.x
    const offset = info.offset.x

    // Calculate how many cards to scroll based on velocity and offset
    const scrollCards = Math.round((velocity * 0.2 + offset) / cardWidth)
    
    const newIndex = Math.max(0, Math.min(items.length - 3, currentIndex - scrollCards))
    
    controls.start({ 
      x: -newIndex * (cardWidth + gap),
      transition: { type: 'tween', ease: 'easeOut', duration: 0.5 }
    })
    setCurrentIndex(newIndex)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragControls.start(event)
  }

  return (
    <div className={outerContainerClasses}>
      <div ref={containerRef} className={innerContainerClasses}>
        <motion.div 
          className={clsx(carouselContentClasses, 'touch-none')}
          drag='x'
          dragControls={dragControls}
          onPointerDown={handlePointerDown}
          dragConstraints={{ 
            left: -((items.length - 3) * (cardWidth + gap)), 
            right: 0 
          }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          animate={controls}
        >
          {items.map((imageUrl, index) => (
            <CarouselCard 
              key={index} 
              size={
                index === currentIndex ? 'large' :
                index === currentIndex + 1 ? 'medium' :
                index === currentIndex + 2 ? 'small' : 'medium'
              }
              imageUrl={imageUrl}
              dragControls={dragControls}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default Carousel
