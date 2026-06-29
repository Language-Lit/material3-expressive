// ImageComponent.tsx - Optimized image component with loading animation
'use client'

import React, { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useMaterial3 } from '../../context/Material3Provider'

// Default blur placeholder - a tiny base64 encoded blurred SVG image
const DEFAULT_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJiIj48ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyMCIvPjwvZmlsdGVyPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ2YXIoLS1tZC1zeXMtY29sb3Itc3VyZmFjZS1jb250YWluZXItaGlnaGVzdCwgI2U2ZTFlNikiIGZpbHRlcj0idXJsKCNiKSIvPjwvc3ZnPg=='

export interface ImageComponentProps {
  imageUrl: string
  onImageClick: () => void
  alt?: string
  blurDataUrl?: string
  className?: string
}

export const ImageComponent: React.FC<ImageComponentProps> = ({ 
  imageUrl, 
  onImageClick,
  alt = 'Image',
  blurDataUrl = DEFAULT_BLUR_DATA_URL,
  className = ''
}) => {
  const { Image } = useMaterial3()
  const [isLoaded, setIsLoaded] = useState(false)

  const handleImageTap = useCallback(() => {
    onImageClick()
  }, [onImageClick])

  return (
    <motion.div
      className={`relative w-full h-32 mb-4 cursor-pointer flex justify-center items-center ${className}`}
      onTap={handleImageTap}
    >
      <Image
        src={imageUrl}
        alt={alt}
        width={0}
        height={0}
        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        className={`border border-[var(--md-sys-color-outline-variant)] rounded-[var(--md-sys-shape-corner-medium)] transition-all duration-500 ease-out ${
          isLoaded ? 'scale-100 blur-0' : 'scale-105 blur-md'
        }`}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          pointerEvents: 'none',
        }}
        placeholder='blur'
        blurDataURL={blurDataUrl}
        onLoad={() => setIsLoaded(true)}
        draggable='false'
      />
    </motion.div>
  )
}
