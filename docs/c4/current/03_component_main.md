# L3 — Component: Main Process (현재)

`src/main/`의 현재 구현 상태를 기술한다.

---

## 파일 구조

```
src/main/
├── index.ts         ← BrowserWindow 생성, IPC 핸들러, chokidar 감시
├── fileManager.ts   ← config.json, CLAUDE.md, GEMINI.md 관리
└── store.ts         ← 히스토리 JSON 저장 (userData/store.json)
```

---

## index.ts

### createWindow
BrowserWindow를 생성한다. 주요 설정:
- 크기: 1280x820, 최소 900x600
- `webviewTag: true` — Renderer에서 `<webview>` 사용 가능
- `contextIsolation: true`, `nodeIntegration: false`
- `autoHideMenuBar: true`

개발 환경: Vite dev server URL 로드 / 프로덕션: `../renderer/index.html` 로드

### 앱 생명주기
- `app.whenReady()`: `setAppUserModelId('com.slidehtml')` 설정 후 창 생성
- `activate` (macOS): 창 없으면 재생성
- `window-all-closed`: chokidar 종료 후 macOS 외 `app.quit()`

### File Watcher (chokidar)
```typescript
let watcher: any = null  // chokidar FSWatcher

async function startWatcher(folderPath: string): Promise<void>
```
- `slides/` 폴더를 감시 (`ignoreInitial: true`, `awaitWriteFinish`)
- `add` / `unlink` 이벤트: 슬라이드 목록 재계산 → `slides:updated` push, CLAUDE.md/GEMINI.md 갱신
- `change` 이벤트: `slide:changed` push (특정 파일 경로)
- `folder:unwatch` IPC 수신 시 watcher 종료

### 슬라이드 파일 조회
```typescript
function getSlideFiles(folderPath: string): string[]
```
- `slides/` 폴더의 `.html` 파일을 자연어 정렬(numeric locale compare)로 반환
- 파일 경로 절대경로로 반환

### IPC 핸들러 목록

| 핸들러 | 주요 동작 |
|--------|---------|
| `folder:open` | `dialog.showOpenDialog` |
| `folder:has-config` | `.slidehtml/config.json` 존재 확인 |
| `folder:setup` | `setupProject()` + `startWatcher()` |
| `folder:open-existing` | `startWatcher()` + `readConfig()` + `getSlideFiles()` |
| `folder:getSlides` | `getSlideFiles()` |
| `config:get` | `readConfig()` |
| `config:update` | `writeConfig()` + `updateInstructionFiles()` |
| `history:getAll` | `getHistory()` |
| `history:add` | `addHistory()` |
| `history:remove` | `removeHistory()` |
| `terminal:open` | macOS: iTerm2 osascript → Terminal.app fallback / Win: cmd |
| `window:setFullscreen` | `mainWindow.setFullScreen(boolean)` |

---

## fileManager.ts

```typescript
interface ProjectConfig { width: number; height: number }

function readConfig(folderPath: string): ProjectConfig
function writeConfig(folderPath: string, config: ProjectConfig): void
function hasConfig(folderPath: string): boolean
function setupProject(folderPath: string, config: ProjectConfig): void
function updateInstructionFiles(folderPath: string, config: ProjectConfig): void
```

### 주요 동작
- `readConfig`: `.slidehtml/config.json` 읽기. 없으면 기본값 `{1280, 720}` 반환
- `writeConfig`: `.slidehtml/` 없으면 생성 후 저장
- `hasConfig`: `.slidehtml/config.json` 존재 여부 확인
- `setupProject`: `.slidehtml/`, `slides/` 폴더 생성 + config 저장 + 인스트럭션 파일 생성
- `updateInstructionFiles`: `slides/` 내 HTML 파일 수 계산 → CLAUDE.md / GEMINI.md 갱신

### 생성되는 CLAUDE.md / GEMINI.md 내용
```
# SlideHTML

slides/ 폴더에 HTML 슬라이드를 순서대로 저장합니다.

## 파일 규칙
- 파일명: 01.html, 02.html, 03.html ... (숫자 2자리 권장)
- 각 슬라이드 body: width: {width}px; height: {height}px; overflow: hidden;
- 외부 CDN, 라이브러리, 이미지 URL 전부 사용 가능

## 현재 상태
- 슬라이드 수: {N}개
- 다음 파일명: {N+1 두자리}.html
```

---

## store.ts

```typescript
function getHistory(): HistoryItem[]
function addHistory(item: HistoryItem): void
function removeHistory(folderPath: string): void
```

### 주요 동작
- `app.getPath('userData')/store.json`에 JSON 파일로 저장
- 모듈 내 메모리 캐시(`storeData`)로 중복 파일 읽기 방지
- `addHistory`: 동일 `folderPath` 중복 제거 후 맨 앞에 추가, 최대 20개 유지
- `removeHistory`: `folderPath` 기준 필터링

---

## 미구현된 것

없음. Blueprint의 Main Process 컴포넌트는 모두 구현됨.
(blueprint에서 별도 디렉터리로 계획했던 `src/main/ipc/`, `src/main/watcher/` 등은
단일 `index.ts`로 통합 구현하였음)
