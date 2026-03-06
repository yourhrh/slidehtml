# L2 — Container

SlideHTML Electron 앱 내부의 프로세스 경계와 컨테이너 간 통신을 정의한다.
Electron은 Node.js Main Process와 Chromium Renderer Process를 분리하며, 이 둘은 IPC로만 통신한다.

---

## 컨테이너 목록

### Main Process
- 경로: `src/main/`
- 기술: Node.js, Electron
- 역할: 앱 생명주기 관리, BrowserWindow 생성, 파일 시스템 접근, IPC 허브, 터미널 실행, 인스트럭션 파일 생성.
  Node.js 전체 API를 사용할 수 있는 유일한 프로세스. 파일 읽기/쓰기, 폴더 감시, 외부 프로세스 실행을 모두 여기서 처리한다.

### Preload Script
- 경로: `src/preload/index.ts`
- 기술: Electron contextBridge
- 역할: Main Process와 Renderer Process 사이의 보안 IPC 브릿지.
  Node.js API를 직접 노출하지 않고, contextBridge를 통해 허용된 API만 window.api / window.electron으로 노출한다.
  Renderer가 실행할 수 있는 IPC 채널을 타입 안전하게 정의한다 (index.d.ts).

### Renderer Process
- 경로: `src/renderer/src/`
- 기술: React 18, TypeScript, Vite
- 역할: 전체 UI 렌더링. 홈 화면(히스토리), 편집 화면(썸네일 + 현재 슬라이드), 발표 모드 화면을 담당한다.
  파일 시스템에 직접 접근할 수 없고, 모든 데이터는 IPC를 통해 Main Process에 요청한다.

### Slide WebView
- 기술: Electron `<webview>` 태그 (독립 Chromium 렌더러 프로세스)
- 역할: 각 HTML 슬라이드를 격리된 렌더러 프로세스에서 실행.
  CDN, 외부 JS, 이미지, 영상, 애니메이션 등 실제 브라우저처럼 모든 리소스를 허용한다.
  CSS transform scale()을 사용해 컨테이너 크기에 맞게 비율을 유지하며 축소/확대한다.
  Renderer Process 내 Thumbnail.tsx와 SlideView.tsx가 이 webview를 렌더링한다.

### electron-store
- 경로: `~/.config/slidehtml/` (OS별 앱 데이터 디렉터리)
- 기술: electron-store (JSON 파일)
- 역할: 최근 열었던 폴더 히스토리를 앱 재시작 후에도 유지한다. 폴더 경로, 슬라이드 수, 마지막 열람일을 저장한다.

---

## 컨테이너 간 통신

### Renderer → Main (요청)
Renderer Process가 Preload Script의 window.api를 통해 Main Process에 요청한다.

| 채널 | 방향 | 설명 |
|------|------|------|
| folder:open | invoke | 폴더 열기 다이얼로그를 표시하고 선택된 경로를 반환 |
| folder:getSlides | invoke | 현재 폴더의 slides/ 목록을 반환 |
| terminal:open | send | 지정 폴더 경로에서 터미널 앱 실행 |

### Main → Renderer (푸시)
파일 시스템 변경 감지 시 Main Process가 Renderer에 이벤트를 push한다.

| 채널 | 설명 |
|------|------|
| slides:updated | 슬라이드 파일 추가/삭제 시 전체 목록 전달 |
| slide:changed | 특정 슬라이드 파일 수정 시 해당 파일 경로 전달 |

### Renderer → Slide WebView
`<webview src="file://...">` 속성으로 HTML 슬라이드 파일을 로드한다.
IPC가 아닌 DOM 속성 변경으로 제어한다.
