# L1 — System Context (현재)

현재 구현된 외부 관계를 기술한다.

---

## 사용자

사용자와의 상호작용은 Electron BrowserWindow를 통해 이루어진다.
앱을 실행하면 1280x820 크기의 창이 열리고 홈 화면이 표시된다.
사용자는 폴더를 열고, 슬라이드를 탐색하고, 발표 모드로 전환할 수 있다.

## 외부 시스템

### File System
- **읽기**: `slides/` 폴더의 HTML 파일 목록 조회 (`fs.readdirSync`)
- **쓰기**: `.slidehtml/config.json`, `CLAUDE.md`, `GEMINI.md` 생성/갱신
- **감시**: chokidar로 `slides/` 폴더 변경 감지 (add / unlink / change)
- **히스토리**: `app.getPath('userData')/store.json`에 JSON으로 저장

### LLM Tool
CLAUDE.md, GEMINI.md가 프로젝트 폴더에 자동 생성된다.
Claude Code, Gemini CLI 등 LLM 툴이 이 파일을 읽어 슬라이드 생성 컨텍스트를 얻는다.
파일에는 해상도, 현재 슬라이드 수, 다음 파일명이 기록된다.

### Terminal App
"터미널 열기" 기능으로 해당 프로젝트 폴더를 열 수 있다.
- macOS: iTerm2 우선, 없으면 Terminal.app
- Windows: cmd
- Linux: `shell.openPath`

### External CDN / Web
슬라이드 HTML은 `<webview>` 태그로 격리된 렌더러 프로세스에서 실행된다.
webview는 실제 Chromium처럼 동작하므로 CDN 라이브러리, 외부 이미지, 영상 embed가 모두 허용된다.
앱 자체의 외부 링크는 `shell.openExternal`로 시스템 브라우저에서 열린다.
