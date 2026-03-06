import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, basename } from 'path'
import { existsSync, readdirSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  readConfig,
  writeConfig,
  setupProject,
  updateInstructionFiles,
  hasConfig,
  ProjectConfig
} from './fileManager'
import { getHistory, addHistory, removeHistory, HistoryItem } from './store'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let watcher: any = null
let mainWindow: BrowserWindow | null = null

function sortSlideFiles(files: string[]): string[] {
  return files.sort((a, b) => {
    const nameA = basename(a)
    const nameB = basename(b)
    return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' })
  })
}

function getSlideFiles(folderPath: string): string[] {
  const slidesDir = join(folderPath, 'slides')
  if (!existsSync(slidesDir)) return []
  const files = readdirSync(slidesDir)
    .filter((f) => f.toLowerCase().endsWith('.html'))
    .map((f) => join(slidesDir, f))
  return sortSlideFiles(files)
}

async function startWatcher(folderPath: string): Promise<void> {
  if (watcher) {
    await watcher.close()
    watcher = null
  }

  const slidesDir = join(folderPath, 'slides')
  if (!existsSync(slidesDir)) return

  const chokidar = await import('chokidar')

  watcher = chokidar.watch(slidesDir, {
    ignoreInitial: true,
    ignored: /(^|[/\\])\../,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  })

  const sendUpdate = (): void => {
    const slides = getSlideFiles(folderPath)
    mainWindow?.webContents.send('slides:updated', slides)
    try {
      const config = readConfig(folderPath)
      updateInstructionFiles(folderPath, config)
    } catch (err) {
      console.error('Failed to update instruction files:', err)
    }
  }

  watcher
    .on('add', sendUpdate)
    .on('unlink', sendUpdate)
    .on('change', (changedPath: string) => {
      mainWindow?.webContents.send('slide:changed', changedPath)
    })
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// IPC Handlers
ipcMain.handle('folder:open', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: '프레젠테이션 폴더 열기'
  })
  if (result.canceled || !result.filePaths[0]) return null
  return result.filePaths[0]
})

ipcMain.handle('folder:has-config', async (_, folderPath: string) => {
  return hasConfig(folderPath)
})

ipcMain.handle('folder:setup', async (_, folderPath: string, config: ProjectConfig) => {
  setupProject(folderPath, config)
  await startWatcher(folderPath)
  const slides = getSlideFiles(folderPath)
  return { slides, config }
})

ipcMain.handle('folder:open-existing', async (_, folderPath: string) => {
  await startWatcher(folderPath)
  const config = readConfig(folderPath)
  const slides = getSlideFiles(folderPath)
  return { slides, config }
})

ipcMain.handle('folder:getSlides', async (_, folderPath: string) => {
  return getSlideFiles(folderPath)
})

ipcMain.handle('config:get', async (_, folderPath: string) => {
  return readConfig(folderPath)
})

ipcMain.handle('config:update', async (_, folderPath: string, config: ProjectConfig) => {
  writeConfig(folderPath, config)
  updateInstructionFiles(folderPath, config)
  return config
})

ipcMain.handle('history:getAll', async () => {
  return getHistory()
})

ipcMain.handle('history:add', async (_, item: HistoryItem) => {
  addHistory(item)
})

ipcMain.handle('history:remove', async (_, folderPath: string) => {
  removeHistory(folderPath)
})

ipcMain.handle('terminal:open', async (_, folderPath: string) => {
  if (process.platform === 'darwin') {
    try {
      const { exec } = await import('child_process')
      exec(
        `osascript -e 'tell application "iTerm2" to create window with default profile command "cd \\"${folderPath}\\""'`,
        (err) => {
          if (err) {
            exec(`open -a Terminal "${folderPath}"`)
          }
        }
      )
    } catch {
      shell.openPath(folderPath)
    }
  } else if (process.platform === 'win32') {
    const { exec } = await import('child_process')
    exec(`start cmd /K "cd /d "${folderPath}""`)
  } else {
    shell.openPath(folderPath)
  }
})

ipcMain.handle('window:setFullscreen', async (_, fullscreen: boolean) => {
  mainWindow?.setFullScreen(fullscreen)
})

ipcMain.on('folder:unwatch', async () => {
  if (watcher) {
    await watcher.close()
    watcher = null
  }
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.slidehtml')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', async () => {
  if (watcher) {
    await watcher.close()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
