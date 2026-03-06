export interface ProjectConfig {
  width: number
  height: number
}

export interface HistoryItem {
  folderPath: string
  folderName: string
  slideCount: number
  lastOpened: number
}

export type Screen = 'home' | 'editor' | 'present'
