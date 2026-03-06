# SlideHTML — C4 Architecture Blueprint

LLM으로 만든 HTML 파일을 슬라이드쇼로 보여주는 Electron 앱.
C4 모델 기준으로 Context → Container → Component 순서로 아키텍처를 기술한다.

## 문서 목록

- 01_context.md     : L1 System Context — 사용자, 외부 시스템과의 관계
- 02_container.md   : L2 Container — Electron 프로세스 경계와 컨테이너 간 통신
- 03_component_main.md      : L3 Component — Main Process 내부 구성 (src/main/)
- 04_component_renderer.md  : L3 Component — Renderer Process 내부 구성 (src/renderer/)
- 05_component_preload.md   : L3 Component — Preload Script (src/preload/)

## 실제 폴더 구조와 C4 대응

```
src/main/                    → Container: Main Process
  index.ts                   → App Entry, Window Manager
  ipc/index.ts               → IPC Handler
  watcher/index.ts           → File Watcher (chokidar)
  store/index.ts             → History Store (electron-store)
  config/index.ts            → Config Manager
  terminal/index.ts          → Terminal Launcher
  instruction/index.ts       → Instruction Generator

src/preload/                 → Container: Preload Script
  index.ts                   → Context Bridge
  index.d.ts                 → IPC API 타입 정의

src/renderer/src/            → Container: Renderer Process
  App.tsx                    → Router Root
  screens/Home.tsx           → Home Screen
  screens/Editor.tsx         → Editor Screen
  screens/Present.tsx        → Present Screen
  components/Thumbnail.tsx   → Slide Thumbnail (webview)
  components/SlideView.tsx   → Main Slide View (webview)
  utils/fileManager.ts       → Instruction File Utils
  utils/sortSlides.ts        → Natural Sort
```
