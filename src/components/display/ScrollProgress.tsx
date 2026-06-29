// ScrollProgress.tsx - Scroll progress indicator component
'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CircularProgress } from '../feedback/CircularProgress'

export interface ScrollProgressProps {
  percentage: number
  disableCompactShift?: boolean
  isScrolling: boolean
}

const scrollProgressVariants = {
  visible: {
    opacity: 1,
    pointerEvents: 'auto' as const,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  hidden: {
    opacity: 0,
    pointerEvents: 'none' as const,
    transition: { duration: 0.2, ease: 'easeIn', delay: 0.1 }
  }
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({
  percentage,
  disableCompactShift = false,
  isScrolling,
}) => {
  const containerClasses = `fixed bottom-8dp left-96dp medium:bottom-24dp medium:left-96dp ${
    !disableCompactShift ? 'compact:bottom-88dp compact:left-16dp' : ''
  } z-50`

  return (
    <AnimatePresence>
      {isScrolling && (
        <motion.div
          className={containerClasses}
          variants={scrollProgressVariants}
          initial='hidden'
          animate='visible'
          exit='hidden'
        >
          <CircularProgress value={percentage} size='md' bg />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
