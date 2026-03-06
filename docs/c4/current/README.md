# SlideHTML — Current Architecture (실제 구현 상태)

> 현재 코드베이스의 실제 구현 상태를 기록한다.
> blueprint와의 차이를 파악하기 위한 문서다.

## 현재 상태 요약

MVP 핵심 구현 완료. Main Process IPC 핸들러, Preload contextBridge API, Renderer 화면/컴포넌트 기반 구조가 갖춰졌다. 빌드 및 E2E 검증 단계 진행 중.

## 문서 목록

- 01_context.md     : L1 현재 구현된 외부 관계
- 02_container.md   : L2 현재 컨테이너 구조
- 03_component_main.md      : L3 Main Process 현재 구현
- 04_component_renderer.md  : L3 Renderer Process 현재 구현
- 05_component_preload.md   : L3 Preload Script 현재 구현

## Blueprint 대비 구현 현황

| Blueprint 컴포넌트 | 파일 경로 | 상태 |
|--------------------|-----------|------|
| App Entry / Window Manager | `src/main/index.ts` | 구현됨 |
| IPC Handler | `src/main/index.ts` | 구현됨 |
| File Watcher (chokidar) | `src/main/index.ts` | 구현됨 |
| History Store | `src/main/store.ts` | 구현됨 |
| Config Manager | `src/main/fileManager.ts` | 구현됨 |
| Terminal Launcher | `src/main/index.ts` | 구현됨 |
| Instruction Generator | `src/main/fileManager.ts` | 구현됨 |
| Context Bridge | `src/preload/index.ts` | 구현됨 |
| IPC Type Definition | `src/preload/index.d.ts` | 구현됨 |
| App (Router Root) | `src/renderer/src/App.tsx` | 구현됨 (진행 중) |
| Home Screen | `src/renderer/src/screens/Home.tsx` | 구현됨 (진행 중) |
| Editor Screen | `src/renderer/src/screens/Editor.tsx` | 구현됨 (진행 중) |
| Present Screen | `src/renderer/src/screens/Present.tsx` | 구현됨 (진행 중) |
| Thumbnail | `src/renderer/src/components/Thumbnail.tsx` | 구현됨 (진행 중) |
| SlideView | `src/renderer/src/components/SlideView.tsx` | 미구현 |
| utils (sortSlides, toFileUrl 등) | `src/renderer/src/utils/index.ts` | 구현됨 |
