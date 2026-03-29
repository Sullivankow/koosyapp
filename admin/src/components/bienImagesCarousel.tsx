import React from 'react'
import type { BackendBienImage } from '../models/models'
import { API_BASE_URL } from '../utils/api'

interface BienImagesCarouselProps {
  images?: BackendBienImage[] | null
  alt: string
  heightClass?: string
  fit?: 'cover' | 'contain'
}

export const BienImagesCarousel: React.FC<BienImagesCarouselProps> = ({
  images,
  alt,
  heightClass = 'h-32',
  fit = 'cover',
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const validImages = images && images.length > 0 ? images : []

  React.useEffect(() => {
    if (currentIndex >= validImages.length) {
      setCurrentIndex(0)
    }
  }, [currentIndex, validImages.length])

  const goPrev = () => {
    if (validImages.length <= 1) return
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
  }

  const goNext = () => {
    if (validImages.length <= 1) return
    setCurrentIndex((prev) => (prev + 1) % validImages.length)
  }

  const buildImageUrl = (image: BackendBienImage | null): string | null => {
    if (!image) return null
    let url = image.url || ''
    url = url.replace(/\\\\/g, '/').replace(/^\.\//, '')

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

    if (!url.startsWith('uploads')) {
      url = `uploads/${url}`
    }

    return `${API_BASE_URL}/${url}`
  }

  const currentImage = validImages.length > 0 ? validImages[currentIndex] : null
  const imageUrl = buildImageUrl(currentImage)

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-[#F3F4F6] ${heightClass}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-[#E0F7F4] via-[#F9FBFF] to-[#E0F2FE]" />
      )}

      {validImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white text-xs hover:bg-black/60"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white text-xs hover:bg-black/60"
          >
            ›
          </button>

          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1">
            {validImages.map((img, index) => (
              <span
                key={img.id}
                className={`h-1.5 w-1.5 rounded-full border border-white/60 ${
                  index === currentIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default BienImagesCarousel
