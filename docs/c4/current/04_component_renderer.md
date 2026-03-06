# L3 — Component: Renderer Process (현재)

`src/renderer/src/`의 현재 구현 상태를 기술한다.

---

## 구현된 것

### main.tsx
React 앱 진입점. `App` 컴포넌트를 `#root`에 마운트한다.

### App.tsx
electron-vite 기본 템플릿 UI를 렌더링한다.
- Electron 로고 이미지 표시
- "Powered by electron-vite" 텍스트
- "Send IPC" 링크 — 클릭 시 `window.electron.ipcRenderer.send('ping')` 호출
- Versions 컴포넌트 표시

### components/Versions.tsx
`window.electron.process.versions`에서 Chrome, Node.js, Electron 버전을 읽어 표시한다.
스캐폴드 기본 컴포넌트.

### assets/
- `main.css`, `base.css`: 스캐폴드 기본 스타일
- `electron.svg`: Electron 로고
- `wavy-lines.svg`: 배경 장식 SVG

---

## 미구현된 것

아래 파일과 디렉터리가 존재하지 않는다.

- `src/renderer/src/screens/Home.tsx`
- `src/renderer/src/screens/Editor.tsx`
- `src/renderer/src/screens/Present.tsx`
- `src/renderer/src/components/Thumbnail.tsx`
- `src/renderer/src/components/SlideView.tsx`
- `src/renderer/src/utils/fileManager.ts`
- `src/renderer/src/utils/sortSlides.ts`
