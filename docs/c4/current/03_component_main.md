# L3 — Component: Main Process (현재)

`src/main/index.ts`의 현재 구현 상태를 기술한다.
현재 모든 코드가 index.ts 단일 파일에 있다.

---

## 구현된 것

### createWindow 함수
BrowserWindow를 생성한다. 설정값:
- 크기: 900x670
- autoHideMenuBar: true
- preload: `src/preload/index.js` 연결
- sandbox: false

개발 환경에서는 `ELECTRON_RENDERER_URL`(Vite dev server)을 로드하고,
프로덕션에서는 빌드된 `../renderer/index.html`을 로드한다.

외부 링크 클릭 시 `shell.openExternal`로 시스템 브라우저에 위임하고 앱 내 팝업을 차단한다.

### 앱 생명주기 처리
- `app.whenReady()`: 앱 초기화 완료 시 createWindow 호출.
- `browser-window-created`: `optimizer.watchWindowShortcuts`로 단축키 감시 등록 (F12 DevTools 등).
- `activate` (macOS): 윈도우가 없으면 재생성.
- `window-all-closed`: macOS가 아니면 `app.quit()`.

### ping IPC
`ipcMain.on('ping', () => console.log('pong'))` — 스캐폴드 테스트용.
Renderer의 "Send IPC" 버튼 클릭 시 Main 콘솔에 'pong'을 출력한다.

---

## 미구현된 것

아래 디렉터리와 모듈이 존재하지 않는다.

- `src/main/ipc/` — IPC Handler
- `src/main/watcher/` — File Watcher
- `src/main/store/` — History Store
- `src/main/config/` — Config Manager
- `src/main/terminal/` — Terminal Launcher
- `src/main/instruction/` — Instruction Generator
