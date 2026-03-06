# Step 4: 인수 테스트 검증 (Visual E2E)

Step 1에서 작성한 `.feature` 파일의 Gherkin 시나리오를 **LLM이 직접 앱을 실행하고 스크린샷으로 확인**하여 검증합니다.

**핵심 원칙: Playwright로 Electron 앱을 launch → 시나리오별 조작 → 스크린샷 촬영 → LLM이 직접 눈으로 확인**

Cucumber Step 파일을 작성하는 것이 아니라, LLM이 시나리오 체크리스트를 만들고 하나씩 실행·확인합니다.

## 전제 조건

- Step 3(유닛 테스트 및 구현)이 완료되어 기능이 동작하는 상태
- `e2e/features/{feature-name}.feature` 파일이 존재 (Step 1에서 작성)
- `npm run build`로 앱이 빌드된 상태 (`out/main/index.js` 존재)

## 진행 순서

1. **빌드** — `npm run build`
2. **시나리오 체크리스트 작성** — `.feature` 파일에서 시나리오 목록 추출
3. **시나리오별 검증** — 각 시나리오마다:
   a. Playwright로 Electron 앱 launch
   b. 시나리오의 Given/When 조건을 코드로 조작
   c. Electron `capturePage()` 또는 Playwright `screenshot()`으로 스크린샷 촬영
   d. LLM이 스크린샷을 **직접 확인**하여 Then 조건 충족 여부 판단
4. **체크리스트 갱신** — 통과/실패 기록
5. **실패 시** — 원인 분석 → 코드 수정 → 재빌드 → 재검증

---

## 산출물

```
docs/features/{feature-name}/4-acceptance/checklist.md   # 시나리오 체크리스트 + 결과
```

---

## 1. 시나리오 체크리스트 작성

`.feature` 파일을 읽고 모든 시나리오를 체크리스트로 정리합니다.

### 예시

```markdown
# 홈 화면 인수 테스트 체크리스트

| # | 시나리오 | 검증 항목 | 결과 |
|---|---------|----------|------|
| 1 | 홈 화면 정상 표시 | "SlideHTML" 텍스트, "폴더 열기" 버튼 보임 | |
| 2 | 히스토리 우클릭 | 컨텍스트 메뉴 표시, 삭제 후 목록에서 제거 | |
| 3 | NFR: 빠른 시작 | 홈 화면이 2초 이내 표시 | |
```

---

## 2. 검증 스크립트 패턴

### Electron 앱 launch + 스크린샷

```typescript
// ts-node -e 로 실행하는 인라인 스크립트
const { _electron: electron } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const electronApp = await electron.launch({
    args: [path.join(process.cwd(), 'out/main/index.js')]
  });
  const page = await electronApp.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // === Given: 전제 조건 설정 ===
  // 예: 히스토리 추가
  await page.evaluate(({fp, ts}) =>
    (globalThis as any).api.addHistory({
      folderPath: fp, folderName: 'test',
      slideCount: 2, lastOpened: ts
    }), { fp: '/tmp/test-folder', ts: Date.now() });

  // === When: 사용자 행동 ===
  // 예: 버튼 클릭, 페이지 이동
  await page.locator('.history-item').first().click();
  await page.waitForTimeout(1500);

  // === Then: 스크린샷으로 확인 ===
  // 방법 1: Electron native (webview 포함)
  const b64 = await electronApp.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    return win.webContents.capturePage()
      .then(img => img.toPNG().toString('base64'));
  });
  fs.writeFileSync('/tmp/scenario-1.png', Buffer.from(b64, 'base64'));

  // 방법 2: Playwright (DOM 기반, webview 콘텐츠 제한적)
  await page.screenshot({ path: '/tmp/scenario-1-pw.png' });

  await electronApp.close();
})();
```

### 주의사항

- `page.evaluate()`에서 `async` 사용 시 `__awaiter` 에러 발생 → non-async arrow 사용
- webview 콘텐츠까지 캡처하려면 `electronApp.evaluate()` + `capturePage()` 사용
- `addHistory` 등 API 호출로 OS 다이얼로그 우회

---

## 3. 시나리오별 검증 방법

### LLM 검증 프로세스

각 시나리오마다:

1. **스크린샷 촬영** — 시나리오의 최종 상태 캡처
2. **LLM이 이미지를 Read tool로 확인** — `Read('/tmp/scenario-N.png')`
3. **Then 조건과 대조** — 스크린샷에서 기대하는 UI 요소가 보이는지 판단
4. **결과 기록** — 체크리스트에 통과/실패 기록

### 검증 기준

| 검증 유형 | 확인 방법 |
|----------|----------|
| 텍스트 존재 | 스크린샷에서 해당 텍스트가 보이는지 |
| UI 요소 존재 | 버튼, 썸네일, 사이드바 등 시각적 확인 |
| 레이아웃 | 요소 위치, 크기, 정렬 상태 |
| 상태 변화 | 조작 전/후 스크린샷 비교 |
| NFR (성능) | 스크립트 내 시간 측정 + console.log |

### DOM 기반 보조 검증

스크린샷으로 판단이 어려운 경우 `page.evaluate()`로 DOM 직접 확인:

```typescript
// 요소 존재 확인
const exists = await page.evaluate(() =>
  !!document.querySelector('[data-testid="home-screen"]')
);

// 텍스트 내용 확인
const text = await page.evaluate(() =>
  document.querySelector('[data-testid="slide-counter"]')?.textContent
);

// 요소 개수 확인
const count = await page.evaluate(() =>
  document.querySelectorAll('.thumbnail').length
);

console.log({ exists, text, count });
```

---

## 4. 실패 시 디버깅

### 일반적인 실패 원인

| 증상 | 원인 | 해결 |
|------|------|------|
| 빈 화면 | 빌드 안 됨 | `npm run build` 재실행 |
| 요소 안 보임 | 타이밍 문제 | `waitForTimeout` 증가 |
| webview 안 보임 | `display: block` 사용 | webview에 `display: block` 사용 금지 |
| 레이아웃 깨짐 | CSS grid/flex 이슈 | `min-height: 0` 추가 |
| 스크린샷 비어있음 | `capturePage` 타이밍 | 충분한 대기 후 촬영 |

### 디버깅 팁

```typescript
// DOM 상태 덤프
const html = await page.evaluate(() => document.body.innerHTML);
console.log(html.substring(0, 500));

// webview 내부 viewport 확인
const viewport = await page.evaluate(() => {
  const wv = document.querySelector('webview') as any;
  return wv?.executeJavaScript(
    'JSON.stringify({vw:window.innerWidth,vh:window.innerHeight})'
  );
});
console.log('webview viewport:', viewport);
```

---

## 검증 체크리스트 템플릿

```markdown
# {기능명} 인수 테스트 결과

## 환경
- 빌드: `npm run build` 성공
- 날짜: YYYY-MM-DD

## 시나리오 검증

| # | 시나리오 | 검증 항목 | 방법 | 결과 |
|---|---------|----------|------|------|
| 1 | | | 스크린샷 / DOM | Pass/Fail |
| 2 | | | 스크린샷 / DOM | Pass/Fail |

## 실패 항목 상세
(실패한 경우만 기록)

### 시나리오 N: {이름}
- 기대: ...
- 실제: ...
- 원인: ...
- 수정: ...
```

---

## 참고 문서

- `@docs/develop-guide/step-1-requirements-analysis.md`: Feature 파일 작성 가이드
- `@docs/c4/current/`: 현재 구현 상태
- `e2e/support/hooks.ts`: Electron launch 설정 참고

---

## 다음 단계

Step 5: 문서화로 진행합니다.
