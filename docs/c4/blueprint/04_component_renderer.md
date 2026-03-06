# L3 — Component: Renderer Process

`src/renderer/src/` 내부 컴포넌트 구성을 정의한다.
Renderer Process는 React 기반 UI 레이어로, 파일 시스템에 직접 접근하지 않고 모든 데이터를 IPC를 통해 Main Process에 요청한다.

---

## 컴포넌트 목록

### App (Router Root)
- 파일: `src/renderer/src/App.tsx`
- 역할: 애플리케이션의 루트 컴포넌트. 현재 화면 상태(Home / Editor / Present)를 관리하고, 각 Screen 컴포넌트로 라우팅한다.
  IPC 이벤트(slides:updated, slide:changed)를 구독하고 상태를 하위 컴포넌트에 전달한다.

### Home Screen
- 파일: `src/renderer/src/screens/Home.tsx`
- 역할: 앱 시작 화면. 폴더 열기 버튼과 최근 폴더 히스토리 목록을 보여준다.
  히스토리 항목에는 폴더명, 슬라이드 수, 마지막 열람일이 표시된다.
  항목 클릭 시 해당 폴더를 바로 열고 Editor Screen으로 전환한다.
  항목 우클릭 시 히스토리에서 삭제하는 컨텍스트 메뉴를 보여준다.
  폴더 열기 버튼은 `folder:open` IPC를 호출한다.

### Editor Screen
- 파일: `src/renderer/src/screens/Editor.tsx`
- 역할: 슬라이드 편집/탐색 화면. 왼쪽 썸네일 목록과 오른쪽 현재 슬라이드 큰 보기로 구성된다.
  슬라이드 번호 표시(N / 전체), 이전/다음 버튼 네비게이션, 발표 모드 전환 버튼, 터미널 열기 버튼을 제공한다.
  slides:updated IPC 이벤트를 받으면 썸네일 목록을 갱신한다.
  slide:changed IPC 이벤트를 받으면 해당 슬라이드의 webview를 새로고침한다.

### Present Screen
- 파일: `src/renderer/src/screens/Present.tsx`
- 역할: 발표 모드 전체화면 화면. 슬라이드를 화면 전체에 비율 유지하며 렌더링한다.
  키보드 이벤트를 등록해 ← → 화살표키, 스페이스바(다음 슬라이드), ESC(편집 모드 복귀)를 처리한다.
  슬라이드 번호는 우하단에 마우스 호버 시에만 표시한다.
  Electron fullscreen API를 통해 윈도우를 풀스크린으로 전환/해제한다.

### Thumbnail
- 파일: `src/renderer/src/components/Thumbnail.tsx`
- 역할: 슬라이드 목록의 각 항목을 미리보기로 렌더링하는 컴포넌트.
  `<webview>` 태그로 실제 HTML 슬라이드를 로드하고, CSS `transform: scale()`로 썸네일 크기에 맞게 축소한다.
  현재 선택된 슬라이드는 하이라이트 처리한다.
  클릭 시 Editor Screen에 선택 슬라이드 인덱스를 알린다.
  slide:changed 이벤트를 받으면 해당 webview의 src를 재설정해 새로고침한다.

### SlideView
- 파일: `src/renderer/src/components/SlideView.tsx`
- 역할: 현재 선택된 슬라이드를 크게 보여주는 컴포넌트. Editor Screen 오른쪽 영역과 Present Screen 전체에서 사용된다.
  컨테이너 크기를 기준으로 슬라이드 해상도(config의 width/height)에 맞는 scale 값을 계산해 적용한다.
  `<webview>` 태그로 HTML 파일을 로드하며, 외부 CDN 및 리소스 접근을 허용한다.

### fileManager (Utility)
- 파일: `src/renderer/src/utils/fileManager.ts`
- 역할: CLAUDE.md / GEMINI.md 파일 내용을 구성하는 템플릿 유틸리티.
  슬라이드 수, 다음 파일명, 해상도를 인자로 받아 마크다운 문자열을 반환한다.
  실제 파일 쓰기는 Main Process의 Instruction Generator가 담당하므로, 이 유틸은 순수 문자열 생성만 한다.
  (또는 이 로직을 Main Process로 완전히 이전하고 Renderer에서 제거할 수 있다 — 구현 시 결정.)

### sortSlides (Utility)
- 파일: `src/renderer/src/utils/sortSlides.ts`
- 역할: 슬라이드 파일명을 자연어 순서로 정렬한다.
  `natural-sort` 패키지를 사용해 `01.html`, `02.html`, `10.html`, `11.html`이 올바른 순서로 정렬되도록 한다.
  단순 문자열 sort를 쓰면 `10.html`이 `2.html`보다 앞에 오는 문제가 발생하므로 반드시 필요하다.

---

## 화면 전환 흐름

```
앱 시작
  → Home Screen (히스토리 표시)

Home Screen: 폴더 열기 or 히스토리 클릭
  → folder:open IPC 요청 → Main Process
  → 슬라이드 목록 수신
  → Editor Screen으로 전환

Editor Screen: 발표 모드 버튼
  → Present Screen으로 전환 + Electron fullscreen 진입

Present Screen: ESC 키
  → Editor Screen으로 복귀 + fullscreen 해제
```

## IPC 이벤트 수신 흐름

```
Main Process: slides:updated 이벤트 push
  → App (Router Root)에서 수신
  → Editor Screen의 썸네일 목록 갱신
  → Instruction Generator 호출 (Main 쪽에서 이미 처리)

Main Process: slide:changed 이벤트 push
  → 해당 슬라이드의 Thumbnail webview 새로고침
  → 현재 보고 있는 슬라이드라면 SlideView webview도 새로고침
```
