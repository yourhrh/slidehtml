# L1 — System Context

SlideHTML은 HTML 파일을 슬라이드쇼로 보여주는 Electron 데스크탑 앱이다.
이 레벨에서는 앱이 어떤 사람, 어떤 외부 시스템과 관계를 맺는지 정의한다.

---

## 사용자 (Person)

### Developer / Presenter
LLM 툴(Claude Code, Gemini CLI, Cursor)을 사용해 HTML 슬라이드를 만들고 발표하는 사람.
SlideHTML 앱을 통해 폴더를 열고, 슬라이드를 탐색하고, 발표 모드를 실행한다.

---

## 외부 시스템 (External Systems)

### LLM Tool (Claude Code / Gemini CLI / Cursor)
사용자가 프롬프트를 입력하면 HTML 파일을 생성해주는 AI 개발 도구.
SlideHTML이 자동 생성한 CLAUDE.md / GEMINI.md 인스트럭션을 읽고, slides/ 폴더에 HTML 슬라이드를 작성한다.
SlideHTML 앱과 직접 통신하지 않고, 파일 시스템을 통해 간접적으로 연결된다.

### File System (사용자 프로젝트 폴더)
사용자의 프레젠테이션 프로젝트가 저장되는 로컬 디렉터리.
SlideHTML은 이 폴더를 chokidar로 감시하고, CLAUDE.md / GEMINI.md / .slidehtml/config.json을 읽고 쓴다.
LLM Tool도 이 폴더에 slides/*.html을 생성한다.

### Terminal App (iTerm2 / Terminal.app / cmd / PowerShell)
사용자가 LLM CLI 도구를 실행하는 터미널.
SlideHTML의 "터미널 열기" 버튼을 누르면, 해당 프로젝트 폴더를 열어준다.

### External CDN / Web
슬라이드 HTML 파일이 직접 참조하는 외부 리소스. JS 라이브러리, 이미지, 영상, 폰트 등.
Electron webview가 실제 Chromium처럼 동작하므로 별도 제한 없이 로드된다.

---

## 관계 요약

```
Developer
  → SlideHTML 앱 조작 (폴더 열기, 슬라이드 탐색, 발표 모드)
  → LLM Tool에 프롬프트 입력 ("slides/01.html 만들어줘")

LLM Tool
  → File System에 slides/*.html 생성/수정

SlideHTML
  → File System 감시 및 읽기/쓰기 (chokidar + fs-extra)
  → Terminal App 실행 (해당 폴더 열기)
  → External CDN/Web 접근 (webview 내에서 슬라이드가 직접 fetch)
```
