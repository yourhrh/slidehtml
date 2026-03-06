# L2 — Container (현재)

현재 구현된 컨테이너 구조를 기술한다.

---

## 구현된 컨테이너

### Main Process
- 파일: `src/main/index.ts`
- 상태: electron-vite 스캐폴드 기본 구현.
  BrowserWindow를 생성하고, preload를 연결하고, 앱 생명주기 이벤트(activate, window-all-closed)를 처리한다.
  커스텀 IPC 핸들러는 `ipcMain.on('ping', () => console.log('pong'))` 하나만 등록돼 있다.

### Preload Script
- 파일: `src/preload/index.ts`
- 상태: electron-vite 스캐폴드 기본 구현.
  `window.electron`에 `@electron-toolkit/preload`의 electronAPI를 노출한다.
  `window.api`는 빈 객체 `{}`로 노출되어 있다. 커스텀 API 없음.

### Renderer Process
- 파일: `src/renderer/src/`
- 상태: electron-vite 스캐폴드 템플릿 UI.
  Electron 로고, 버전 정보, "Send IPC" 링크를 보여주는 기본 페이지가 렌더링된다.

## 미구현 컨테이너

### Slide WebView
HTML 슬라이드를 격리 실행하는 `<webview>` 태그가 아직 없다.

### electron-store
히스토리 저장소가 연결되지 않았다.

---

## 현재 IPC 채널

| 채널 | 방향 | 상태 | 설명 |
|------|------|------|------|
| ping | Renderer → Main | 구현됨 | 스캐폴드 테스트용. console.log('pong')만 출력 |
| folder:open | Renderer → Main | 미구현 | — |
| folder:getSlides | Renderer → Main | 미구현 | — |
| terminal:open | Renderer → Main | 미구현 | — |
| slides:updated | Main → Renderer | 미구현 | — |
| slide:changed | Main → Renderer | 미구현 | — |
