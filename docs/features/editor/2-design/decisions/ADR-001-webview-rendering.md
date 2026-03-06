# ADR-001: Electron webview 스케일링 방법

**날짜**: 2026-03-06
**상태**: 승인됨

## 컨텍스트

에디터 메인 영역에서 슬라이드 HTML을 컨테이너 크기에 맞게 축소하여 표시해야 한다.
슬라이드는 고정 해상도(예: 1280×720)로 제작되며, 표시 영역은 가변 크기다.

## 결정

clip wrapper + webview `transform: scale()` 방식을 사용한다.

```tsx
// clip wrapper: 스케일된 크기로 overflow 클리핑
<div style={{ width: scaledW, height: scaledH, overflow: 'hidden' }}>
  // webview: 원본 크기 + transform으로 시각적 축소
  <webview style={{ width: slideWidth, height: slideHeight, transform: `scale(${scale})`, transformOrigin: 'top left' }} />
</div>
```

## 핵심 제약사항 (실험으로 검증됨)

### webview에 `display: block` 금지
- 증상: webview 내부 `window.innerHeight = 150` (HTML 기본값)
- 원인: `display: block`이 Electron webview의 내부 viewport 높이 계산을 방해
- 결과: 슬라이드 배경이 뷰포트를 채우지 못하고 콘텐츠 높이만 표시됨
- 해결: webview에 `display` 속성 미설정 (기본 inline 유지)

### webview 부모에 CSS `zoom` 금지
- 증상: webview 내부 `window.innerHeight = 150` (zoom 비율에 따라 왜곡)
- 원인: CSS `zoom`이 webview의 내부 viewport 크기 계산에 영향
- 해결: `zoom` 대신 `transform: scale()` 사용

### webview에 CSS `transform: scale()` 직접 적용 필요
- 썸네일(Thumbnail.tsx)과 동일한 패턴: webview에 직접 transform 적용
- wrapper에 transform을 적용하면 webview 내부 뷰포트가 올바르게 계산되지 않음

## 대안

### 대안 1: webview를 scaledW × scaledH 크기로 직접 설정
- 장점: transform 불필요, 단순
- 단점: 내부 viewport가 scaledW × scaledH로 설정됨 → 슬라이드가 축소된 뷰포트 기준으로 렌더링됨
- 선택하지 않은 이유: 슬라이드가 1280×720 기준으로 제작되므로 뷰포트가 달라지면 레이아웃 깨짐

### 대안 2: webview.setZoomFactor()
- 장점: 내부 뷰포트를 정확히 slideWidth × slideHeight로 유지하면서 시각적 축소 가능
- 단점: dom-ready 이벤트 후 비동기 적용 필요, scale 변경 시마다 재적용 필요
- 선택하지 않은 이유: transform 방식으로 충분히 해결됨

### 대안 3: CSS zoom on wrapper
- 장점: 코드 단순
- 단점: **webview 내부 viewport 오류** (innerHeight 왜곡)
- 선택하지 않은 이유: 검증 결과 렌더링 불가

## 결과

### 긍정적 결과
- 슬라이드 내부 viewport = slideWidth × slideHeight (정확한 렌더링)
- Thumbnail.tsx와 동일한 패턴으로 일관성 유지
- ResizeObserver로 컨테이너 크기 변화에 반응적으로 스케일 조정

### 부정적 결과 (Trade-off)
- clip wrapper가 overflow: hidden + transform으로 인해 레이아웃 박스가 시각적 크기와 다름
- scale > 0 조건부 렌더링 필요 (초기 ResizeObserver 미측정 상태 방지)

## 영향을 받는 컴포넌트

- `src/renderer/src/components/SlideView.tsx`: 위 패턴 적용
- `src/renderer/src/components/Thumbnail.tsx`: 동일 패턴 참조 구현
