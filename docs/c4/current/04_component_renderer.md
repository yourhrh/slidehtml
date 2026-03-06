# L3 — Component: Renderer Process (현재)

`src/renderer/src/`의 현재 구현 상태를 기술한다.

---

## 파일 구조

```
src/renderer/src/
├── main.tsx                      ← React 진입점 (#root 마운트)
├── App.tsx                       ← 화면 라우터 (screen state 관리)
├── env.d.ts                      ← vite/client + webview JSX 타입 선언
├── types/
│   └── index.ts                  ← 공유 타입 (ProjectConfig, HistoryItem, Screen)
├── utils/
│   └── index.ts                  ← 순수 유틸 함수
├── screens/
│   ├── Home.tsx                  ← 홈 화면 (진행 중)
│   ├── Editor.tsx                ← 편집 화면 (진행 중)
│   └── Present.tsx               ← 발표 모드 (진행 중)
└── components/
    ├── Thumbnail.tsx             ← 슬라이드 썸네일 webview (진행 중)
    └── SlideView.tsx             ← 메인 슬라이드 webview (미구현)
```

---

## 구현된 것

### types/index.ts
```typescript
interface ProjectConfig { width: number; height: number }
interface HistoryItem { folderPath: string; folderName: string; slideCount: number; lastOpened: number }
type Screen = 'home' | 'editor' | 'present'
```

### utils/index.ts
```typescript
function sortSlides(slides: string[]): string[]
// → 파일명 기준 자연어 정렬 (numeric locale compare)
// → '01.html', '02.html', '10.html', '11.html' 올바른 순서

function basename(filePath: string): string
// → 크로스플랫폼 파일명 추출 (backslash 처리 포함)

function toFileUrl(filePath: string): string
// → 절대경로 → file:// URL 변환
// → Mac: /Users/... → file:///Users/...
// → Win: C:\... → file:///C:/...

function formatRelativeTime(timestamp: number): string
// → Unix timestamp → '방금 전', 'N분 전', 'N시간 전', 'N일 전'
```

### env.d.ts
`<webview>` 태그의 JSX 인트린직 타입 선언 포함.
`src`, `allowpopups`, `disablewebsecurity`, `nodeintegration` 등 속성 타입 정의.

### App.tsx ✅
screen 상태 (`'home' | 'editor' | 'present'`)로 화면 전환 관리.

```typescript
// 보관하는 상태
screen: Screen
currentFolder: string | null
slides: string[]
config: ProjectConfig
currentSlideIndex: number
```

화면 전환 핸들러:
- `handleOpenFolder(folderPath, slides, config)` → `sortSlides()` 후 `'editor'`로 전환
- `handleGoHome()` → `window.api.unwatchFolder()` 호출 후 `'home'`으로
- `handlePresent()` → `window.api.setFullscreen(true)` 후 `'present'`로
- `handleExitPresent()` → `window.api.setFullscreen(false)` 후 `'editor'`로

### screens/Home.tsx ✅
홈 화면. `data-testid="home-screen"` 속성 포함.

- 마운트 시 `window.api.getHistory()` 호출 → 최근 항목 목록 표시
- "폴더 열기" 버튼 → `openFolderDialog()` → `hasConfig()` 분기
  - 기존 프로젝트: `openExistingFolder()` → `addHistory()` → onOpenFolder 콜백
  - 신규 프로젝트: 해상도 선택 모달 → `setupFolder()` → `addHistory()` → onOpenFolder 콜백
- 히스토리 항목 클릭 → `hasConfig()` 분기 (위와 동일)
- 히스토리 항목 우클릭 → 커스텀 컨텍스트 메뉴 → `removeHistory()`
- 해상도 옵션: 1280x720(HD), 1920x1080(FHD), 1024x768(XGA)

### components/Thumbnail.tsx
- `<webview>` 태그로 슬라이드를 슬라이드 원본 크기로 렌더링
- CSS `transform: scale(displayWidth / slideWidth)` + `transformOrigin: 'top left'`로 축소
- `pointerEvents: 'none'`으로 클릭 이벤트 차단 (부모 div가 처리)
- `window.api.onSlideChanged` 구독 → 해당 파일 변경 시 webview `.reload()` 호출
- `isSelected` prop으로 선택 상태 스타일 적용

---

## 진행 중인 것

### screens/Editor.tsx ✅
- `data-testid="editor-screen"` 포함
- 좌측 썸네일 사이드바 (Thumbnail 목록, THUMB_W=180, THUMB_H=101)
- 메인 SlideView (현재 선택 슬라이드)
- 하단 툴바: ◁, `data-testid="slide-counter"` (N / 전체), 다음 슬라이드, 발표 모드, 터미널, 홈
- `window.api.onSlidesUpdated` 구독 + cleanup
- 슬라이드 없음 상태: "슬라이드가 없습니다" 표시

### screens/Present.tsx ✅
- `data-testid="present-screen"` 포함
- SlideView 재사용으로 전체화면 슬라이드 렌더링
- 키보드 네비게이션: ← → Space (이동), ESC (종료 → onExit)
- 마우스 이동 시 슬라이드 번호 오버레이 3초간 표시 (`data-testid="present-overlay"`)
- 상태: `currentIndex`, `showOverlay`

### components/SlideView.tsx ✅
- ResizeObserver로 컨테이너 크기 감지 → `scale = min(w/slideW, h/slideH)`
- scale > 0 일 때만 webview 마운트 (초기 scale=0으로 시작)
- clip wrapper: `width: scaledW, height: scaledH, overflow: hidden`
- webview: `width: slideWidth, height: slideHeight, transform: scale(scale), transformOrigin: top left`
- **주의**: webview에 `display: block` 금지 → 내부 viewport 높이가 150px(기본값)으로 망가짐
- **주의**: webview에 CSS `zoom` 금지 → 내부 viewport 계산 오류 발생
- `window.api.onSlideChanged` 구독 → 파일 변경 시 webview `.reload()`
- ADR: `docs/features/editor/2-design/decisions/ADR-001-webview-rendering.md`

---

## 미구현된 것

- `screens/Present.tsx` — 스텁만 존재 (발표 모드 미구현)
