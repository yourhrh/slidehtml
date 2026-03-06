import React, { useEffect } from 'react'
import { ProjectConfig } from '../types'
import Thumbnail from '../components/Thumbnail'
import SlideView from '../components/SlideView'

const THUMB_W = 180
const THUMB_H = 101

interface EditorProps {
  folderPath: string
  slides: string[]
  config: ProjectConfig
  currentSlideIndex: number
  onSlideChange: (index: number) => void
  onSlidesUpdated: (slides: string[]) => void
  onGoHome: () => void
  onPresent: () => void
}

export default function Editor({
  folderPath,
  slides,
  config,
  currentSlideIndex,
  onSlideChange,
  onSlidesUpdated,
  onGoHome,
  onPresent
}: EditorProps): React.JSX.Element {
  useEffect(() => {
    const cleanup = window.api.onSlidesUpdated((updated) => {
      onSlidesUpdated(updated)
    })
    return cleanup
  }, [onSlidesUpdated])

  function handlePrev(): void {
    if (currentSlideIndex > 0) onSlideChange(currentSlideIndex - 1)
  }

  function handleNext(): void {
    if (currentSlideIndex < slides.length - 1) onSlideChange(currentSlideIndex + 1)
  }

  function handleTerminal(): void {
    window.api.openTerminal(folderPath)
  }

  const currentSlide = slides[currentSlideIndex]

  return (
    <div className="editor" data-testid="editor-screen">
      <div className="editor-sidebar">
        {slides.length === 0 ? (
          <div className="sidebar-empty">슬라이드 없음</div>
        ) : (
          slides.map((slide, i) => (
            <Thumbnail
              key={slide}
              filePath={slide}
              slideWidth={config.width}
              slideHeight={config.height}
              displayWidth={THUMB_W}
              displayHeight={THUMB_H}
              isSelected={i === currentSlideIndex}
              index={i}
              onClick={() => onSlideChange(i)}
            />
          ))
        )}
      </div>

      <div className="editor-main">
        {slides.length === 0 ? (
          <div className="empty-state">슬라이드가 없습니다</div>
        ) : (
          <SlideView
            filePath={currentSlide}
            slideWidth={config.width}
            slideHeight={config.height}
          />
        )}
      </div>

      <div className="editor-toolbar">
        <div className="toolbar-nav">
          <button className="btn-icon" onClick={handlePrev} disabled={currentSlideIndex === 0}>
            ◁
          </button>
          <span className="slide-counter" data-testid="slide-counter">
            {slides.length === 0 ? '0 / 0' : `${currentSlideIndex + 1} / ${slides.length}`}
          </span>
          <button
            className="btn-icon"
            onClick={handleNext}
            disabled={currentSlideIndex >= slides.length - 1}
          >
            다음 슬라이드
          </button>
        </div>
        <div className="toolbar-actions">
          <button className="btn-secondary" onClick={onPresent} disabled={slides.length === 0}>
            발표 모드
          </button>
          <button className="btn-secondary" onClick={handleTerminal}>
            터미널
          </button>
          <button className="btn-ghost" onClick={onGoHome}>
            홈
          </button>
        </div>
      </div>
    </div>
  )
}
