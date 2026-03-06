# L1 — System Context (현재)

현재 구현된 외부 관계를 기술한다.

---

## 사용자

사용자와의 상호작용은 Electron 기본 윈도우를 통해 이루어진다.
앱을 실행하면 900x670 크기의 BrowserWindow가 열리고, 스캐폴드 템플릿 UI가 표시된다.
사용자가 할 수 있는 것은 F12로 DevTools를 열거나, "Send IPC" 링크를 클릭하는 것뿐이다.

## 외부 시스템

### File System
현재 연결 없음. 파일 시스템 접근 로직이 구현되지 않았다.

### LLM Tool
현재 연결 없음. CLAUDE.md / GEMINI.md가 생성되지 않으므로 LLM 툴과 연동되지 않는다.

### Terminal App
현재 연결 없음. 터미널 실행 기능이 구현되지 않았다.

### External CDN / Web
외부 링크를 클릭하면 `shell.openExternal`로 시스템 기본 브라우저에서 열린다.
이는 슬라이드 webview가 아닌 앱 내 일반 링크 처리다.
