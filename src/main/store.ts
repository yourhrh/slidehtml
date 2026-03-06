import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'

export interface HistoryItem {
  folderPath: string
  folderName: string
  slideCount: number
  lastOpened: number
}

interface StoreData {
  history: HistoryItem[]
}

const DEFAULT_DATA: StoreData = {
  history: []
}

let storePath: string | null = null
let storeData: StoreData | null = null

function getStorePath(): string {
  if (!storePath) {
    storePath = path.join(app.getPath('userData'), 'store.json')
  }
  return storePath
}

function loadStore(): StoreData {
  if (storeData) return storeData
  try {
    const raw = fs.readFileSync(getStorePath(), 'utf-8')
    storeData = { ...DEFAULT_DATA, ...JSON.parse(raw) }
  } catch {
    storeData = { ...DEFAULT_DATA }
  }
  return storeData
}

function saveStore(data: StoreData): void {
  storeData = data
  try {
    fs.writeFileSync(getStorePath(), JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Failed to save store:', err)
  }
}

export function getHistory(): HistoryItem[] {
  return loadStore().history
}

export function addHistory(item: HistoryItem): void {
  const data = loadStore()
  const filtered = data.history.filter((h) => h.folderPath !== item.folderPath)
  saveStore({ ...data, history: [item, ...filtered].slice(0, 20) })
}

export function removeHistory(folderPath: string): void {
  const data = loadStore()
  saveStore({ ...data, history: data.history.filter((h) => h.folderPath !== folderPath) })
}
