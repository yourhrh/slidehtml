import React, { useState } from 'react'
import { Screen, ProjectConfig } from './types'
import { sortSlides } from './utils'
import Home from './screens/Home'
import Editor from './screens/Editor'
import Present from './screens/Present'

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('home')
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [slides, setSlides] = useState<string[]>([])
  const [config, setConfig] = useState<ProjectConfig>({ width: 1280, height: 720 })
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  function handleOpenFolder(folderPath: string, rawSlides: string[], cfg: ProjectConfig): void {
    setCurrentFolder(folderPath)
    setSlides(sortSlides(rawSlides))
    setConfig(cfg)
    setCurrentSlideIndex(0)
    setScreen('editor')
  }

  function handleGoHome(): void {
    window.api.unwatchFolder()
    setScreen('home')
  }

  function handlePresent(): void {
    window.api.setFullscreen(true)
    setScreen('present')
  }

  function handleExitPresent(): void {
    window.api.setFullscreen(false)
    setScreen('editor')
  }

  if (screen === 'home') {
    return <Home onOpenFolder={handleOpenFolder} />
  }

  if (screen === 'editor') {
    return (
      <Editor
        folderPath={currentFolder!}
        slides={slides}
        config={config}
        currentSlideIndex={currentSlideIndex}
        onSlideChange={setCurrentSlideIndex}
        onSlidesUpdated={(updated) => setSlides(sortSlides(updated))}
        onGoHome={handleGoHome}
        onPresent={handlePresent}
      />
    )
  }

  return (
    <Present
      slides={slides}
      config={config}
      initialIndex={currentSlideIndex}
      onExit={handleExitPresent}
    />
  )
}

export default App
