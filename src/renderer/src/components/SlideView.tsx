import React, { useRef, useEffect, useState } from 'react'
import { toFileUrl } from '../utils'

interface SlideViewProps {
  filePath: string
  slideWidth: number
  slideHeight: number
}

export default function SlideView({ filePath, slideWidth, slideHeight }: SlideViewProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const webviewRef = useRef<HTMLElement>(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      const scaleX = width / slideWidth
      const scaleY = height / slideHeight
      setScale(Math.min(scaleX, scaleY))
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [slideWidth, slideHeight])

  useEffect(() => {
    const cleanup = window.api.onSlideChanged((changedPath) => {
      if (changedPath === filePath && webviewRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(webviewRef.current as any).reload?.()
      }
    })
    return cleanup
  }, [filePath])

  const scaledW = slideWidth * scale
  const scaledH = slideHeight * scale

  return (
    <div className="slide-view-container" ref={containerRef}>
      {scale > 0 && (
        <div
          className="slide-view-wrapper"
          style={{
            width: scaledW,
            height: scaledH,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <webview
            ref={webviewRef}
            src={toFileUrl(filePath)}
            style={{
              width: slideWidth,
              height: slideHeight,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}
    </div>
  )
}
