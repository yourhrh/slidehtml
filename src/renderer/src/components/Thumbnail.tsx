import React, { useRef, useEffect } from 'react'
import { toFileUrl } from '../utils'

interface ThumbnailProps {
  filePath: string
  slideWidth: number
  slideHeight: number
  displayWidth: number
  displayHeight: number
  isSelected: boolean
  index: number
  onClick: () => void
}

export default function Thumbnail({
  filePath,
  slideWidth,
  slideHeight,
  displayWidth,
  displayHeight,
  isSelected,
  index,
  onClick
}: ThumbnailProps): React.JSX.Element {
  const webviewRef = useRef<HTMLElement>(null)
  const scale = displayWidth / slideWidth

  useEffect(() => {
    const cleanup = window.api.onSlideChanged((changedPath) => {
      if (changedPath === filePath && webviewRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(webviewRef.current as any).reload?.()
      }
    })
    return cleanup
  }, [filePath])

  return (
    <div
      className={`thumbnail ${isSelected ? 'thumbnail-selected' : ''}`}
      onClick={onClick}
      title={filePath.split('/').pop()}
    >
      <div
        className="thumbnail-clip"
        style={{ width: displayWidth, height: displayHeight }}
      >
        <webview
          ref={webviewRef}
          src={toFileUrl(filePath)}
          style={{
            width: slideWidth,
            height: slideHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            pointerEvents: 'none'
          }}
        />
      </div>
      <div className="thumbnail-label">{index + 1}</div>
    </div>
  )
}
