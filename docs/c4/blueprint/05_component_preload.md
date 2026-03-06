# L3 — Component: Preload Script

`src/preload/` 내부 구성을 정의한다.
Preload Script는 Main Process와 Renderer Process 사이의 보안 경계를 구현한다.
Renderer는 Node.js API에 직접 접근할 수 없으며, 오직 이 스크립트가 노출한 API만 사용할 수 있다.

---

## 컴포넌트 목록

### Context Bridge
- 파일: `src/preload/index.ts`
- 역할: Electron의 `contextBridge.exposeInMainWorld`를 사용해 허용된 IPC 채널만 Renderer의 `window` 객체에 노출한다.
  두 개의 네임스페이스를 노출한다:
  - `window.electron`: `@electron-toolkit/preload`의 기본 electronAPI (ipcRenderer 래퍼 포함)
  - `window.api`: 앱 전용 커스텀 API. 슬라이드 관련 IPC 채널을 타입 안전하게 래핑한 메서드들.

  노출할 API 예시:
  - `openFolder()` → `folder:open` IPC invoke
  - `getSlides()` → `folder:getSlides` IPC invoke
  - `openTerminal(path)` → `terminal:open` IPC send
  - `onSlidesUpdated(callback)` → `slides:updated` 이벤트 구독
  - `onSlideChanged(callback)` → `slide:changed` 이벤트 구독

### IPC Type Definition
- 파일: `src/preload/index.d.ts`
- 역할: `window.api`와 `window.electron`의 타입을 전역으로 선언한다.
  Renderer Process의 TypeScript 코드가 `window.api.openFolder()` 등을 타입 안전하게 호출할 수 있게 한다.
  실제 구현체 없이 타입만 정의하는 ambient declaration 파일이다.

---

## 보안 원칙

contextBridge는 다음 규칙을 강제한다.

- Renderer는 Node.js `require`, `fs`, `path` 등에 직접 접근 불가.
- 노출된 API만 호출 가능하며, 그 외 IPC 채널은 Renderer에서 send/invoke 불가.
- preload 스크립트 자체는 Node.js 컨텍스트에서 실행되지만, Renderer에는 명시적으로 허용한 것만 전달된다.

## Main Process와의 관계

```
Renderer
  → window.api.openFolder() 호출
  → Preload: ipcRenderer.invoke('folder:open')
  → Main Process: ipcMain.handle('folder:open', ...)
  → 결과를 Promise로 반환
  → Renderer에서 await으로 수신
```

```
Main Process
  → mainWindow.webContents.send('slides:updated', slideList)
  → Preload: ipcRenderer.on('slides:updated', callback)
  → Renderer: window.api.onSlidesUpdated(callback)으로 등록한 함수 실행
```
