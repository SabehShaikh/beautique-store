'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: string[]
  productName: string
  className?: string
}

export function ImageGallery({
  images,
  productName,
  className,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const displayImages = images.length > 0 ? images : ['/images/placeholder.png']

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image - use object-contain to show full image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-50">
        <Image
          src={displayImages[selectedIndex]}
          alt={`${productName} - Image ${selectedIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all',
                selectedIndex === index
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-transparent hover:border-muted-foreground/50'
              )}
            >
              <Image
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
