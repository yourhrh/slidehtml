# L3 — Component: Main Process

`src/main/` 내부 컴포넌트 구성을 정의한다.
Main Process는 Node.js 전체 API를 사용하는 유일한 프로세스로, 파일 시스템 접근과 IPC 허브 역할을 담당한다.

---

## 컴포넌트 목록

### App Entry
- 파일: `src/main/index.ts`
- 역할: `app.whenReady()` 진입점. 앱이 초기화되면 Window Manager를 호출하고, IPC Handler를 등록한다.
  macOS에서 독 아이콘 클릭 시 윈도우 재생성 로직(activate 이벤트), 전체 윈도우 닫힐 때 앱 종료(win32 한정)도 처리한다.

### Window Manager
- 파일: `src/main/index.ts` (createWindow 함수)
- 역할: `BrowserWindow`를 생성하고, preload 스크립트를 연결한다.
  개발 환경에서는 Vite dev server URL을 로드하고, 프로덕션에서는 빌드된 index.html을 로드한다.
  외부 링크를 webContents.setWindowOpenHandler로 차단하고 shell.openExternal로 시스템 브라우저에 위임한다.

### IPC Handler
- 파일: `src/main/ipc/index.ts`
- 역할: 모든 IPC 채널을 등록하고 라우팅하는 허브.
  Renderer의 요청을 받아 적절한 내부 컴포넌트(Config Manager, History Store, File Watcher, Terminal Launcher, Instruction Generator)에 위임한다.
  파일 변경 이벤트를 받아 Renderer로 push한다.
  처리 채널: `folder:open`, `folder:getSlides`, `terminal:open`
  푸시 채널: `slides:updated`, `slide:changed`

### File Watcher
- 파일: `src/main/watcher/index.ts`
- 기술: chokidar
- 역할: 사용자가 폴더를 열 때 해당 `slides/` 디렉터리를 감시 시작한다.
  HTML 파일이 추가/수정/삭제되면 IPC Handler에 이벤트를 전달한다.
  다른 폴더를 열 때 이전 watcher를 닫고 새 watcher를 시작한다.
  변경 감지 시 Instruction Generator에도 알려 CLAUDE.md / GEMINI.md를 최신 상태로 유지한다.

### History Store
- 파일: `src/main/store/index.ts`
- 기술: electron-store
- 역할: 최근 열었던 폴더 목록을 JSON 파일로 영구 저장한다.
  저장 항목: 폴더 경로, 슬라이드 수, 마지막 열람 시각.
  IPC Handler의 `folder:open` 요청 시 히스토리에 추가하고, 항목 삭제 요청도 처리한다.

### Config Manager
- 파일: `src/main/config/index.ts`
- 역할: 프로젝트 폴더 내 `.slidehtml/config.json`을 읽고 쓴다.
  저장 항목: `{ "width": 1280, "height": 720 }` (슬라이드 해상도).
  폴더 열기 시 config.json이 없으면 기본값으로 생성한다.
  해상도 변경 시 Instruction Generator를 호출해 CLAUDE.md / GEMINI.md도 함께 업데이트한다.

### Terminal Launcher
- 파일: `src/main/terminal/index.ts`
- 역할: 플랫폼별로 적절한 터미널 앱을 해당 폴더에서 실행한다.
  macOS: iTerm2가 설치돼 있으면 iTerm2, 없으면 Terminal.app.
  Windows: PowerShell 또는 cmd.
  Linux: 기본 터미널 에뮬레이터.
  `child_process.spawn`으로 터미널 프로세스를 분리 실행한다.

### Instruction Generator
- 파일: `src/main/instruction/index.ts`
- 역할: CLAUDE.md와 GEMINI.md를 자동 생성하고 최신 상태로 유지한다.
  생성 트리거: 폴더 최초 열기.
  업데이트 트리거: slides/ 파일 추가/삭제(슬라이드 수 변경), 해상도 설정 변경.
  파일 내용: 슬라이드 파일 규칙, 현재 슬라이드 수, 다음 파일명, 해상도(body 크기).

---

## 주요 흐름

### 폴더 열기
```
Renderer: folder:open IPC 요청
  → IPC Handler: dialog.showOpenDialog 실행
  → Config Manager: .slidehtml/config.json 읽기 or 기본값 생성
  → Instruction Generator: CLAUDE.md / GEMINI.md 생성
  → File Watcher: slides/ 감시 시작
  → History Store: 히스토리 추가
  → IPC Handler: 슬라이드 목록 + config 반환
```

### 파일 변경 감지
```
File Watcher: slides/*.html 변경 감지
  → IPC Handler: Renderer로 slides:updated or slide:changed push
  → Instruction Generator: 슬라이드 수 재계산 → CLAUDE.md / GEMINI.md 업데이트
```
