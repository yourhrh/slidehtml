# SlideHTML — Current Architecture (실제 구현 상태)

> 현재 코드베이스의 실제 구현 상태를 기록한다.
> blueprint와의 차이를 파악하기 위한 문서다.

## 현재 상태 요약

electron-vite 초기 스캐폴드 상태. 커스텀 비즈니스 로직은 아직 없다.

## 문서 목록

- 01_context.md     : L1 현재 구현된 외부 관계
- 02_container.md   : L2 현재 컨테이너 구조
- 03_component_main.md      : L3 Main Process 현재 구현
- 04_component_renderer.md  : L3 Renderer Process 현재 구현
- 05_component_preload.md   : L3 Preload Script 현재 구현

## Blueprint 대비 구현 현황

| Blueprint 컴포넌트 | 파일 경로 | 상태 |
|--------------------|-----------|------|
| App Entry / Window Manager | `src/main/index.ts` | 구현됨 (스캐폴드) |
| IPC Handler | `src/main/ipc/` | 미구현 |
| File Watcher | `src/main/watcher/` | 미구현 |
| History Store | `src/main/store/` | 미구현 |
| Config Manager | `src/main/config/` | 미구현 |
| Terminal Launcher | `src/main/terminal/` | 미구현 |
| Instruction Generator | `src/main/instruction/` | 미구현 |
| Context Bridge | `src/preload/index.ts` | 구현됨 (스캐폴드, api 비어 있음) |
| IPC Type Definition | `src/preload/index.d.ts` | 구현됨 (스캐폴드 기본 타입만) |
| App (Router Root) | `src/renderer/src/App.tsx` | 구현됨 (스캐폴드 템플릿) |
| Home Screen | `src/renderer/src/screens/Home.tsx` | 미구현 |
| Editor Screen | `src/renderer/src/screens/Editor.tsx` | 미구현 |
| Present Screen | `src/renderer/src/screens/Present.tsx` | 미구현 |
| Thumbnail | `src/renderer/src/components/Thumbnail.tsx` | 미구현 |
| SlideView | `src/renderer/src/components/SlideView.tsx` | 미구현 |
| fileManager | `src/renderer/src/utils/fileManager.ts` | 미구현 |
| sortSlides | `src/renderer/src/utils/sortSlides.ts` | 미구현 |
