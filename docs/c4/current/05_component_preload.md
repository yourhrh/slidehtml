# L3 — Component: Preload Script (현재)

`src/preload/`의 현재 구현 상태를 기술한다.

---

## 구현된 것

### index.ts
contextBridge를 통해 두 가지를 Renderer의 window에 노출한다.

- `window.electron`: `@electron-toolkit/preload`의 electronAPI.
  `ipcRenderer.send`, `ipcRenderer.invoke`, `ipcRenderer.on` 등의 래퍼와 `process.versions` 접근을 포함한다.
- `window.api`: 빈 객체 `{}`. 커스텀 API가 아직 없다.

contextIsolation이 비활성화된 환경을 위한 fallback 분기도 포함돼 있다.

### index.d.ts
`window.electron`과 `window.api`의 타입을 전역으로 선언한다.
`window.api`는 현재 빈 Record 타입이다.

---

## 미구현된 것

커스텀 IPC 래퍼 메서드가 없다. Blueprint에서 정의한 아래 API들이 아직 없다.

- `openFolder()`
- `getSlides()`
- `openTerminal(path)`
- `onSlidesUpdated(callback)`
- `onSlideChanged(callback)`
