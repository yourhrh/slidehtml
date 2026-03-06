# L2 — Container (현재)

현재 구현된 컨테이너 구조를 기술한다.

---

## 구현된 컨테이너

### Main Process
- 파일: `src/main/index.ts`, `src/main/fileManager.ts`, `src/main/store.ts`
- BrowserWindow 생성 (1280x820, `webviewTag: true`, `contextIsolation: true`)
- chokidar로 `slides/` 폴더 감시, 변경 시 Renderer에 push
- IPC 핸들러 전체 구현 (아래 채널 목록 참고)
- 히스토리를 `userData/store.json`에 JSON으로 저장 (electron-store 미사용)

### Preload Script
- 파일: `src/preload/index.ts`, `src/preload/index.d.ts`
- `window.api`에 전체 커스텀 API 노출 (아래 메서드 목록 참고)
- `window.electron`에 `@electron-toolkit/preload`의 electronAPI 노출
- ipcRenderer.on 구독/해제를 cleanup 함수로 반환

### Renderer Process
- 파일: `src/renderer/src/`
- React 기반 3-screen SPA (Home / Editor / Present)
- `App.tsx`가 `screen` 상태로 화면 전환 관리
- `<webview>` 태그로 슬라이드 HTML 렌더링

### Slide WebView
- Renderer 내의 `<webview>` 태그로 구현
- 슬라이드 HTML을 `file://` URL로 로드
- CSS `transform: scale()` 으로 썸네일 / 풀뷰 크기 조정
- webview 레벨에서 CDN 등 외부 리소스 모두 허용

---

## 현재 IPC 채널

### 렌더러 → 메인 (invoke/handle)

| 채널 | 파라미터 | 반환 | 설명 |
|------|---------|------|------|
| `folder:open` | — | `string \| null` | 폴더 선택 다이얼로그 |
| `folder:has-config` | `folderPath` | `boolean` | `.slidehtml/config.json` 존재 여부 |
| `folder:setup` | `folderPath, config` | `{slides, config}` | 신규 프로젝트 초기화 + 감시 시작 |
| `folder:open-existing` | `folderPath` | `{slides, config}` | 기존 프로젝트 열기 + 감시 시작 |
| `folder:getSlides` | `folderPath` | `string[]` | 슬라이드 파일 경로 목록 (정렬됨) |
| `config:get` | `folderPath` | `ProjectConfig` | `.slidehtml/config.json` 읽기 |
| `config:update` | `folderPath, config` | `ProjectConfig` | 설정 저장 + CLAUDE.md/GEMINI.md 갱신 |
| `history:getAll` | — | `HistoryItem[]` | 히스토리 전체 조회 |
| `history:add` | `HistoryItem` | — | 히스토리 추가 (중복 시 업데이트, 최대 20개) |
| `history:remove` | `folderPath` | — | 히스토리 항목 삭제 |
| `terminal:open` | `folderPath` | — | iTerm2 / Terminal.app / cmd 열기 |
| `window:setFullscreen` | `boolean` | — | 풀스크린 전환 (발표 모드용) |

### 렌더러 → 메인 (send, 단방향)

| 채널 | 설명 |
|------|------|
| `folder:unwatch` | chokidar 감시 중단 (홈으로 돌아갈 때) |

### 메인 → 렌더러 (push)

| 채널 | 페이로드 | 발생 시점 |
|------|---------|---------|
| `slides:updated` | `string[]` (전체 슬라이드 경로) | `slides/` 파일 추가 또는 삭제 |
| `slide:changed` | `string` (변경된 파일 경로) | `slides/` 특정 파일 내용 변경 |

---

## 타입 정의

```typescript
interface ProjectConfig {
  width: number   // 슬라이드 가로 px (기본: 1280)
  height: number  // 슬라이드 세로 px (기본: 720)
}

interface HistoryItem {
  folderPath: string   // 절대 경로
  folderName: string   // 폴더명 (basename)
  slideCount: number   // 마지막으로 열었을 때 슬라이드 수
  lastOpened: number   // Unix timestamp (ms)
}
```
