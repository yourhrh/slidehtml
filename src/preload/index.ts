import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

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

const api = {
  openFolderDialog: (): Promise<string | null> => ipcRenderer.invoke('folder:open'),

  hasConfig: (folderPath: string): Promise<boolean> =>
    ipcRenderer.invoke('folder:has-config', folderPath),

  setupFolder: (
    folderPath: string,
    config: ProjectConfig
  ): Promise<{ slides: string[]; config: ProjectConfig }> =>
    ipcRenderer.invoke('folder:setup', folderPath, config),

  openExistingFolder: (
    folderPath: string
  ): Promise<{ slides: string[]; config: ProjectConfig }> =>
    ipcRenderer.invoke('folder:open-existing', folderPath),

  getSlides: (folderPath: string): Promise<string[]> =>
    ipcRenderer.invoke('folder:getSlides', folderPath),

  unwatchFolder: (): void => ipcRenderer.send('folder:unwatch'),

  getConfig: (folderPath: string): Promise<ProjectConfig> =>
    ipcRenderer.invoke('config:get', folderPath),

  updateConfig: (folderPath: string, config: ProjectConfig): Promise<ProjectConfig> =>
    ipcRenderer.invoke('config:update', folderPath, config),

  getHistory: (): Promise<HistoryItem[]> => ipcRenderer.invoke('history:getAll'),

  addHistory: (item: HistoryItem): Promise<void> => ipcRenderer.invoke('history:add', item),

  removeHistory: (folderPath: string): Promise<void> =>
    ipcRenderer.invoke('history:remove', folderPath),

  openTerminal: (folderPath: string): Promise<void> =>
    ipcRenderer.invoke('terminal:open', folderPath),

  setFullscreen: (fullscreen: boolean): Promise<void> =>
    ipcRenderer.invoke('window:setFullscreen', fullscreen),

  onSlidesUpdated: (callback: (slides: string[]) => void): (() => void) => {
    const handler = (_: unknown, slides: string[]): void => callback(slides)
    ipcRenderer.on('slides:updated', handler)
    return (): void => {
      ipcRenderer.removeListener('slides:updated', handler)
    }
  },

  onSlideChanged: (callback: (filePath: string) => void): (() => void) => {
    const handler = (_: unknown, filePath: string): void => callback(filePath)
    ipcRenderer.on('slide:changed', handler)
    return (): void => {
      ipcRenderer.removeListener('slide:changed', handler)
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
