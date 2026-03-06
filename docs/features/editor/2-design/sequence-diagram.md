# 시퀀스 다이어그램: editor

**UI 명세 참조**: `/docs/features/editor/1-requirements/ui-specification.md`

## 주요 플로우

### 시나리오 1: 편집 화면 진입 (홈에서 폴더 열기)

```mermaid
sequenceDiagram
    participant User
    participant Home as Home.tsx
    participant App as App.tsx
    participant Editor as Editor.tsx
    participant Preload as window.api

    Note over Home,App: (홈에서 폴더 열기 완료 후)
    Home->>App: onOpenFolder(folderPath, slides, config)
    App->>App: setScreen('editor'), setSlides(sorted), setCurrentSlideIndex(0)
    App->>Editor: render <Editor slides config currentSlideIndex .../>
    Editor->>Preload: window.api.onSlidesUpdated(callback) 구독
    Editor-->>User: 슬라이드 목록(썸네일) + 메인뷰 표시
```

### 시나리오 2: 다음/이전 슬라이드 이동

```mermaid
sequenceDiagram
    participant User
    participant Editor as Editor.tsx
    participant App as App.tsx

    User->>Editor: "다음 슬라이드" 버튼 클릭
    Editor->>App: onSlideChange(currentIndex + 1)
    App->>App: setCurrentSlideIndex(newIndex)
    App->>Editor: re-render with new currentSlideIndex
    Editor-->>User: 슬라이드 번호 갱신, 메인뷰/선택 썸네일 변경
```

### 시나리오 3: chokidar → slides:updated push (자동 갱신)

```mermaid
sequenceDiagram
    participant FS as FileSystem (LLM writes file)
    participant Chokidar
    participant Main as Main (ipcMain)
    participant Renderer as Editor.tsx

    FS->>Chokidar: slides/ 파일 add/unlink
    Chokidar->>Main: 이벤트 콜백
    Main->>Main: getSlideFiles() 재계산
    Main->>Renderer: webContents.send('slides:updated', slides)
    Renderer->>Renderer: onSlidesUpdated callback 호출
    Renderer->>App: onSlidesUpdated(sortSlides(slides))
    App->>App: setSlides(sorted)
    App->>Editor: re-render with new slides
    Editor-->>FS: 썸네일 목록 자동 갱신
```

### 시나리오 4: 터미널 열기

```mermaid
sequenceDiagram
    participant User
    participant Editor as Editor.tsx
    participant Preload as window.api
    participant Main as Main

    User->>Editor: "터미널" 버튼 클릭
    Editor->>Preload: window.api.openTerminal(folderPath)
    Preload->>Main: ipcRenderer.invoke('terminal:open', folderPath)
    Main->>Main: iTerm2 / Terminal.app 실행
```

## 설계 결정사항

- SlideView는 별도 컴포넌트로 분리 (Editor에서 재사용, Present에서도 사용)
- `onSlidesUpdated` 구독은 Editor 마운트 시 등록, 언마운트 시 cleanup
- 슬라이드 없음 상태: 사이드바 빈 상태 + 메인뷰에 안내 텍스트 (SlideView 미렌더링)
- 현재 슬라이드 인덱스는 App.tsx에서 관리 (Present로 전환 시 유지)
