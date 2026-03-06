# L3 — Component: Preload Script (현재)

`src/preload/`의 현재 구현 상태를 기술한다.

---

## 파일 구조

```
src/preload/
├── index.ts     ← contextBridge로 window.api 노출
└── index.d.ts   ← window.api 타입 전역 선언
```

---

## index.ts

contextBridge를 통해 두 가지를 Renderer의 `window`에 노출한다.

- `window.electron`: `@electron-toolkit/preload`의 electronAPI (기존 유지)
- `window.api`: 커스텀 SlideHTML API (전체 구현됨)

---

## window.api 메서드 목록

### 폴더 조작

```typescript
openFolderDialog(): Promise<string | null>
// dialog.showOpenDialog → 선택된 폴더 경로 반환, 취소 시 null

hasConfig(folderPath: string): Promise<boolean>
// .slidehtml/config.json 존재 여부 확인

setupFolder(folderPath: string, config: ProjectConfig): Promise<{ slides: string[]; config: ProjectConfig }>
// 신규 프로젝트 초기화: .slidehtml/, slides/, CLAUDE.md, GEMINI.md 생성 + 감시 시작

openExistingFolder(folderPath: string): Promise<{ slides: string[]; config: ProjectConfig }>
// 기존 프로젝트 열기: 감시 시작 + config/slides 반환

getSlides(folderPath: string): Promise<string[]>
// slides/ 폴더의 HTML 파일 경로 목록 (정렬됨)

unwatchFolder(): void
// chokidar 감시 중단 (send, 단방향)
```

### 설정

```typescript
getConfig(folderPath: string): Promise<ProjectConfig>
// .slidehtml/config.json 읽기

updateConfig(folderPath: string, config: ProjectConfig): Promise<ProjectConfig>
// config.json 저장 + CLAUDE.md/GEMINI.md 갱신
```

### 히스토리

```typescript
getHistory(): Promise<HistoryItem[]>
// 최근 열었던 폴더 목록 (최대 20개)

addHistory(item: HistoryItem): Promise<void>
// 히스토리 추가 (같은 경로 중복 제거, 최신이 맨 앞)

removeHistory(folderPath: string): Promise<void>
// 특정 폴더 히스토리 삭제
```

### 시스템

```typescript
openTerminal(folderPath: string): Promise<void>
// 해당 폴더를 터미널에서 열기 (iTerm2 / Terminal.app / cmd)

setFullscreen(fullscreen: boolean): Promise<void>
// BrowserWindow 풀스크린 전환 (발표 모드 진입/퇴장)
```

### 이벤트 구독 (Main → Renderer push)

```typescript
onSlidesUpdated(callback: (slides: string[]) => void): () => void
// slides/ 파일 추가/삭제 시 호출. 반환값은 cleanup 함수 (리스너 해제)

onSlideChanged(callback: (filePath: string) => void): () => void
// 특정 슬라이드 파일 변경 시 호출. 반환값은 cleanup 함수
```

---

## index.d.ts

`window.api`를 `SlideHTMLAPI` 타입으로 전역 선언.
`src/renderer/src/`에서 `window.api.{method}()` 호출 시 타입 안전성 보장.

`tsconfig.web.json`의 `include`에 `src/preload/*.d.ts`가 포함되어 있어
Renderer 컴파일 타임에 자동으로 적용된다.

---

## 미구현된 것

없음. Blueprint의 Preload 컴포넌트는 모두 구현됨.
