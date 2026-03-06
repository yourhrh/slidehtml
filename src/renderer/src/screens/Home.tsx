import React, { useState, useEffect, useCallback } from 'react'
import { HistoryItem, ProjectConfig } from '../types'
import { formatRelativeTime } from '../utils'

interface HomeProps {
  onOpenFolder: (folderPath: string, slides: string[], config: ProjectConfig) => void
}

const RESOLUTIONS: { label: string; config: ProjectConfig }[] = [
  { label: '1280 x 720 (HD)', config: { width: 1280, height: 720 } },
  { label: '1920 x 1080 (Full HD)', config: { width: 1920, height: 1080 } },
  { label: '1024 x 768 (XGA)', config: { width: 1024, height: 768 } }
]

export default function Home({ onOpenFolder }: HomeProps): React.JSX.Element {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderPath: string } | null>(null)
  const [pendingFolder, setPendingFolder] = useState<string | null>(null)
  const [selectedConfig, setSelectedConfig] = useState<ProjectConfig>({ width: 1280, height: 720 })

  const loadHistory = useCallback(async () => {
    const items = await window.api.getHistory()
    setHistory(items)
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useEffect(() => {
    function handleClickOutside(): void {
      setContextMenu(null)
    }
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  async function openAndNavigate(folderPath: string, slides: string[], config: ProjectConfig): Promise<void> {
    const folderName = folderPath.split('/').pop() || folderPath.split('\\').pop() || folderPath
    await window.api.addHistory({
      folderPath,
      folderName,
      slideCount: slides.length,
      lastOpened: Date.now()
    })
    onOpenFolder(folderPath, slides, config)
  }

  async function openExisting(folderPath: string): Promise<void> {
    const result = await window.api.openExistingFolder(folderPath)
    await openAndNavigate(folderPath, result.slides, result.config)
  }

  async function handleOpenFolderClick(): Promise<void> {
    const folderPath = await window.api.openFolderDialog()
    if (!folderPath) return
    const exists = await window.api.hasConfig(folderPath)
    if (exists) {
      await openExisting(folderPath)
    } else {
      setSelectedConfig({ width: 1280, height: 720 })
      setPendingFolder(folderPath)
    }
  }

  async function handleHistoryClick(item: HistoryItem): Promise<void> {
    const exists = await window.api.hasConfig(item.folderPath)
    if (exists) {
      await openExisting(item.folderPath)
    } else {
      setSelectedConfig({ width: 1280, height: 720 })
      setPendingFolder(item.folderPath)
    }
  }

  async function handleModalConfirm(): Promise<void> {
    if (!pendingFolder) return
    const result = await window.api.setupFolder(pendingFolder, selectedConfig)
    await openAndNavigate(pendingFolder, result.slides, result.config)
    setPendingFolder(null)
  }

  function handleContextMenu(e: React.MouseEvent, folderPath: string): void {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, folderPath })
  }

  async function handleRemoveHistory(folderPath: string): Promise<void> {
    await window.api.removeHistory(folderPath)
    setHistory((prev) => prev.filter((item) => item.folderPath !== folderPath))
    setContextMenu(null)
  }

  return (
    <div className="home" data-testid="home-screen">
      <div className="home-content">
        <h1 className="home-title">SlideHTML</h1>
        <button className="btn-primary" onClick={handleOpenFolderClick}>
          폴더 열기
        </button>

        {history.length > 0 && (
          <div className="history-section">
            <h2 className="history-heading">최근 항목</h2>
            <ul className="history-list">
              {history.map((item) => (
                <li
                  key={item.folderPath}
                  className="history-item"
                  onClick={() => handleHistoryClick(item)}
                  onContextMenu={(e) => handleContextMenu(e, item.folderPath)}
                >
                  <span className="history-name">{item.folderName}</span>
                  <span className="history-meta">
                    {item.slideCount}개 · {formatRelativeTime(item.lastOpened)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="context-menu-item"
            onClick={() => handleRemoveHistory(contextMenu.folderPath)}
          >
            히스토리에서 제거
          </button>
        </div>
      )}

      {pendingFolder && (
        <div className="modal-backdrop" onClick={() => setPendingFolder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">슬라이드 해상도 선택</h2>
            <ul className="resolution-list">
              {RESOLUTIONS.map((r) => (
                <li key={r.label}>
                  <label className="resolution-option">
                    <input
                      type="radio"
                      name="resolution"
                      checked={selectedConfig.width === r.config.width && selectedConfig.height === r.config.height}
                      onChange={() => setSelectedConfig(r.config)}
                    />
                    {r.label}
                  </label>
                </li>
              ))}
            </ul>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setPendingFolder(null)}>
                취소
              </button>
              <button className="btn-primary" onClick={handleModalConfirm}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
