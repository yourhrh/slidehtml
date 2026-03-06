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

### App.tsx
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
- `handleOpenFolder(folderPath, slides, config)` → `'editor'`로 전환
- `handleGoHome()` → `window.api.unwatchFolder()` 호출 후 `'home'`으로
- `handlePresent()` → `window.api.setFullscreen(true)` 후 `'present'`로
- `handleExitPresent()` → `window.api.setFullscreen(false)` 후 `'editor'`로

### components/Thumbnail.tsx
- `<webview>` 태그로 슬라이드를 슬라이드 원본 크기로 렌더링
- CSS `transform: scale(displayWidth / slideWidth)` + `transformOrigin: 'top left'`로 축소
- `pointerEvents: 'none'`으로 클릭 이벤트 차단 (부모 div가 처리)
- `window.api.onSlideChanged` 구독 → 해당 파일 변경 시 webview `.reload()` 호출
- `isSelected` prop으로 선택 상태 스타일 적용

---

## 진행 중인 것

### screens/Home.tsx
- [ ] 폴더 열기 버튼 → `window.api.openFolderDialog()`
- [ ] 히스토리 목록 표시 (`window.api.getHistory()`)
- [ ] 히스토리 항목 클릭 → `hasConfig` 확인 후 열기 또는 해상도 모달 표시
- [ ] 우클릭 컨텍스트 메뉴 → `window.api.removeHistory()`
- [ ] 해상도 선택 모달 (신규 프로젝트 시)

### screens/Editor.tsx
- [ ] 좌측 썸네일 사이드바 (Thumbnail 목록)
- [ ] 메인 슬라이드 뷰 (SlideView)
- [ ] 하단 툴바 (◁ N/전체 ▷, 발표 모드 버튼, 터미널 버튼)
- [ ] 해상도 설정 모달
- [ ] `window.api.onSlidesUpdated` 구독

### screens/Present.tsx
- [ ] 풀스크린 슬라이드 뷰
- [ ] 키보드 네비게이션 (←→ Space ESC)
- [ ] 슬라이드 번호 오버레이 (마우스 호버 시만)

### components/SlideView.tsx
- [ ] 컨테이너 크기 기준 scale 자동 계산 (ResizeObserver)
- [ ] 현재 슬라이드 webview 렌더링
- [ ] `fillScreen` prop (발표 모드용)

---

## 미구현된 것

- `components/SlideView.tsx` — 아직 파일 없음
