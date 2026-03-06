import React, { useState, useEffect, useRef } from 'react'
import { ProjectConfig } from '../types'
import SlideView from '../components/SlideView'

interface PresentProps {
  slides: string[]
  config: ProjectConfig
  initialIndex: number
  onExit: () => void
}

export default function Present({ slides, config, initialIndex, onExit }: PresentProps): React.JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [showOverlay, setShowOverlay] = useState(false)
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        setCurrentIndex((i) => Math.min(i + 1, slides.length - 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Escape') {
        onExit()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [slides, onExit])

  const handleMouseMove = (): void => {
    setShowOverlay(true)
    if (overlayTimer.current) clearTimeout(overlayTimer.current)
    overlayTimer.current = setTimeout(() => setShowOverlay(false), 3000)
  }

  useEffect(() => {
    return () => {
      if (overlayTimer.current) clearTimeout(overlayTimer.current)
    }
  }, [])

  return (
    <div
      data-testid="present-screen"
      onMouseMove={handleMouseMove}
      style={{ width: '100%', height: '100%', background: '#000', position: 'relative' }}
    >
      {slides[currentIndex] && (
        <SlideView
          filePath={slides[currentIndex]}
          slideWidth={config.width}
          slideHeight={config.height}
        />
      )}
      {showOverlay && (
        <div
          data-testid="present-overlay"
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: 6,
            fontSize: 14,
            pointerEvents: 'none',
          }}
        >
          {currentIndex + 1} / {slides.length}
        </div>
      )}
    </div>
  )
}
