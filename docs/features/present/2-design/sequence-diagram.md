# Sequence Diagram: 발표 모드

## 시나리오 1: 발표 모드 진입

```
User          Editor         App.tsx        Present.tsx    Main Process
 |                |              |               |               |
 |--[발표 모드]-->|              |               |               |
 |                |--onPresent-->|               |               |
 |                |              |--setFullscreen(true)--------->|
 |                |              |--setScreen('present')         |
 |                |              |--render Present(slides, config, initialIndex)
 |                |              |               |               |
 |                |              |<----- Present 화면 렌더링 ----|
```

## 시나리오 2: ESC 키로 편집 모드 복귀

```
User          Present.tsx    App.tsx        Main Process
 |                |              |               |
 |--[ESC 키]----->|              |               |
 |                |--onExit()-->|               |
 |                |              |--setFullscreen(false)-------->|
 |                |              |--setScreen('editor')          |
 |                |              |                               |
```

## 시나리오 3: 화살표/스페이스 키로 슬라이드 이동

```
User          Present.tsx
 |                |
 |--[→ / Space]-->|
 |                |-- setCurrentIndex(min(idx+1, slides.length-1))
 |                |-- webview 교체 (새 슬라이드 src)
 |                |
 |--[←]---------->|
 |                |-- setCurrentIndex(max(idx-1, 0))
 |                |-- webview 교체
```

## 시나리오 4: 마우스 이동으로 오버레이 표시

```
User          Present.tsx
 |                |
 |--[mouse move]->|
 |                |-- setShowOverlay(true)
 |                |-- overlay 표시 (N/total)
 |                |-- setTimeout 3초 후 setShowOverlay(false)
```
