import { ElectronAPI } from '@electron-toolkit/preload'

interface ProjectConfig {
  width: number
  height: number
}

interface HistoryItem {
  folderPath: string
  folderName: string
  slideCount: number
  lastOpened: number
}

interface SlideHTMLAPI {
  openFolderDialog: () => Promise<string | null>
  hasConfig: (folderPath: string) => Promise<boolean>
  setupFolder: (
    folderPath: string,
    config: ProjectConfig
  ) => Promise<{ slides: string[]; config: ProjectConfig }>
  openExistingFolder: (
    folderPath: string
  ) => Promise<{ slides: string[]; config: ProjectConfig }>
  getSlides: (folderPath: string) => Promise<string[]>
  unwatchFolder: () => void
  getConfig: (folderPath: string) => Promise<ProjectConfig>
  updateConfig: (folderPath: string, config: ProjectConfig) => Promise<ProjectConfig>
  getHistory: () => Promise<HistoryItem[]>
  addHistory: (item: HistoryItem) => Promise<void>
  removeHistory: (folderPath: string) => Promise<void>
  openTerminal: (folderPath: string) => Promise<void>
  setFullscreen: (fullscreen: boolean) => Promise<void>
  onSlidesUpdated: (callback: (slides: string[]) => void) => () => void
  onSlideChanged: (callback: (filePath: string) => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: SlideHTMLAPI
  }
}
