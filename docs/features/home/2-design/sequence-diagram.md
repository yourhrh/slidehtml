# 시퀀스 다이어그램: home

**UI 명세 참조**: `/docs/features/home/1-requirements/ui-specification.md`

## 주요 플로우

### 시나리오 1: 앱 시작 → 홈 화면 표시

```mermaid
sequenceDiagram
    participant User
    participant Renderer as Renderer (Home.tsx)
    participant Preload as Preload (window.api)
    participant Main as Main (ipcMain)

    User->>Renderer: 앱 실행
    Renderer->>Preload: window.api.getHistory()
    Preload->>Main: ipcRenderer.invoke('history:getAll')
    Main-->>Preload: HistoryItem[]
    Preload-->>Renderer: HistoryItem[]
    Renderer-->>User: 히스토리 목록 + 폴더 열기 버튼 표시
```

### 시나리오 2: 폴더 열기 → 기존 프로젝트 열기

```mermaid
sequenceDiagram
    participant User
    participant Renderer as Renderer (Home.tsx)
    participant Preload as Preload (window.api)
    participant Main as Main (ipcMain)
    participant FS as FileSystem

    User->>Renderer: "폴더 열기" 클릭
    Renderer->>Preload: window.api.openFolderDialog()
    Preload->>Main: ipcRenderer.invoke('folder:open')
    Main->>FS: dialog.showOpenDialog()
    FS-->>Main: folderPath
    Main-->>Preload: folderPath
    Preload-->>Renderer: folderPath

    Renderer->>Preload: window.api.hasConfig(folderPath)
    Preload->>Main: ipcRenderer.invoke('folder:has-config', folderPath)
    Main->>FS: .slidehtml/config.json 존재 확인
    FS-->>Main: true
    Main-->>Preload: true
    Preload-->>Renderer: true

    Renderer->>Preload: window.api.openExistingFolder(folderPath)
    Preload->>Main: ipcRenderer.invoke('folder:open-existing', folderPath)
    Main->>FS: getSlides() + readConfig() + chokidar 감시 시작
    FS-->>Main: {slides, config}
    Main-->>Preload: {slides, config}
    Preload-->>Renderer: {slides, config}

    Renderer->>Preload: window.api.addHistory(item)
    Preload->>Main: ipcRenderer.invoke('history:add', item)
    Main->>FS: store.json 저장
    Main-->>Preload: void

    Renderer-->>User: 편집 화면으로 전환 (App.tsx handleOpenFolder 호출)
```

### 시나리오 3: 폴더 열기 → 신규 프로젝트 (해상도 모달)

```mermaid
sequenceDiagram
    participant User
    participant Renderer as Renderer (Home.tsx)
    participant Preload as Preload (window.api)
    participant Main as Main (ipcMain)
    participant FS as FileSystem

    User->>Renderer: "폴더 열기" 클릭
    Renderer->>Preload: window.api.openFolderDialog()
    Preload->>Main: ipcRenderer.invoke('folder:open')
    Main-->>Preload: folderPath
    Preload-->>Renderer: folderPath

    Renderer->>Preload: window.api.hasConfig(folderPath)
    Preload->>Main: ipcRenderer.invoke('folder:has-config', folderPath)
    Main->>FS: .slidehtml/config.json 존재 확인
    FS-->>Main: false
    Main-->>Preload: false
    Preload-->>Renderer: false

    Renderer-->>User: 해상도 선택 모달 표시

    User->>Renderer: 해상도 선택 후 "확인" 클릭
    Renderer->>Preload: window.api.setupFolder(folderPath, config)
    Preload->>Main: ipcRenderer.invoke('folder:setup', folderPath, config)
    Main->>FS: .slidehtml/ + slides/ + CLAUDE.md + GEMINI.md 생성 + 감시 시작
    FS-->>Main: {slides, config}
    Main-->>Preload: {slides, config}
    Preload-->>Renderer: {slides, config}

    Renderer->>Preload: window.api.addHistory(item)
    Preload->>Main: ipcRenderer.invoke('history:add', item)
    Main-->>Preload: void

    Renderer-->>User: 편집 화면으로 전환
```

### 시나리오 4: 히스토리 항목 우클릭 → 삭제

```mermaid
sequenceDiagram
    participant User
    participant Renderer as Renderer (Home.tsx)
    participant Preload as Preload (window.api)
    participant Main as Main (ipcMain)

    User->>Renderer: 히스토리 항목 우클릭
    Renderer-->>User: 컨텍스트 메뉴 표시 ("히스토리에서 제거")

    User->>Renderer: "히스토리에서 제거" 클릭
    Renderer->>Preload: window.api.removeHistory(folderPath)
    Preload->>Main: ipcRenderer.invoke('history:remove', folderPath)
    Main-->>Preload: void
    Preload-->>Renderer: void
    Renderer-->>User: 히스토리 목록에서 해당 항목 제거
```

## 설계 결정사항

- 컨텍스트 메뉴: 네이티브 Menu 대신 커스텀 DOM 컨텍스트 메뉴로 구현 (contextmenu 이벤트 차단 + 절대 위치 div)
- 해상도 모달: 별도 컴포넌트 없이 Home.tsx 인라인 상태로 관리 (MVPs 단순성)
- 히스토리 추가: 편집 화면 전환 직전 Home에서 처리 (App.tsx에서 하지 않음)
