# Step 4: 인수 테스트 검증 (E2E)

Step 1에서 작성한 `.feature` 파일의 Gherkin 시나리오가 **실제 빌드된 앱에서** 통과하는지 검증합니다.

**핵심 원칙: 실제 Electron 앱을 launch해서 검증하는 E2E 테스트**

인수 테스트는 사용자 관점에서 앱이 정상 동작하는지 검증하는 것이 목적입니다.

## 전제 조건

- Step 3(유닛 테스트 및 구현)이 완료되어 기능이 동작하는 상태
- `e2e/features/{feature-name}.feature` 파일이 존재 (Step 1에서 작성)
- `npm run build`로 앱이 빌드된 상태 (`out/main/index.js` 존재)

## 진행 순서

1. 앱 빌드 확인 (`npm run build`)
2. `.feature` 파일 확인 (Step 1에서 작성한 시나리오)
3. Step 정의 파일 생성 (`e2e/steps/{feature-name}.steps.ts`)
4. Electron launch 기반 E2E Step 작성
5. 인수 테스트 실행 및 실패 확인 (Red)
6. 실패 원인 분석 및 수정
7. 모든 시나리오 통과 확인 (Green)

---

## 산출물

```
e2e/steps/{feature-name}.steps.ts    # Step 정의 파일 (E2E)
```

---

## 1. 테스트 환경 구조

### 현재 E2E 테스트 설정 (이미 구현됨)

```
e2e/
├── features/            ← Gherkin .feature 파일
│   └── app.feature
├── steps/               ← Step 정의 파일
│   └── app.steps.ts
└── support/
    ├── hooks.ts         ← 앱 launch/close (Before/After)
    └── world.ts         ← ElectronWorld (electronApp, page)
```

**hooks.ts가 이미 하는 일:**
- `Before`: `npm run build`로 만든 `out/main/index.js`를 Playwright로 launch
- `After`: 실패 시 스크린샷 저장, 앱 close

### ElectronWorld 사용법

```typescript
// e2e/steps/{feature}.steps.ts
import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { ElectronWorld } from '../support/world'

Given('앱이 실행되어 있다', async function (this: ElectronWorld) {
  // hooks.ts Before에서 이미 launch됨
  expect(this.page).toBeDefined()
})
```

---

## 2. Feature 파일 확인

Step 1에서 작성한 `.feature` 파일을 확인합니다.

```gherkin
# e2e/features/home.feature

Feature: 홈 화면

  As a 발표 준비 중인 개발자
  I want 최근 폴더를 빠르게 다시 열고 싶다
  So that 바로 작업을 재개할 수 있다

  Background:
    Given 앱이 실행되어 있다

  Scenario: 홈 화면이 정상적으로 표시된다
    Then "SlideHTML" 텍스트가 보인다
    And "폴더 열기" 버튼이 보인다

  @nfr
  Scenario: 앱이 빠르게 시작된다
    Then 홈 화면이 2초 이내에 표시된다
```

---

## 3. E2E Step 작성 패턴

### 기본 구조

```typescript
// e2e/steps/{feature-name}.steps.ts
import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { ElectronWorld } from '../support/world'

// 타임아웃 설정
const UI_TIMEOUT = 5000    // UI 요소 대기
const APP_TIMEOUT = 10000  // 앱 동작 대기
```

### Given - 전제 조건

```typescript
// 앱 실행 (hooks.ts Before에서 이미 launch됨)
Given('앱이 실행되어 있다', async function (this: ElectronWorld) {
  expect(this.page).toBeDefined()
  expect(this.electronApp).toBeDefined()
})

// 특정 상태 전제
Given('히스토리에 {string} 폴더가 있다', async function (this: ElectronWorld, folderName: string) {
  const page = await this.getPage()
  // 앱의 내부 상태를 직접 조작하거나 UI를 통해 설정
  await expect(page.getByText(folderName)).toBeVisible({ timeout: UI_TIMEOUT })
})
```

### When - 사용자 행동

```typescript
// 버튼 클릭
When('{string} 버튼을 클릭한다', async function (this: ElectronWorld, buttonText: string) {
  const page = await this.getPage()
  await page.getByText(buttonText).click()
})

// 키보드 입력
When('{string} 키를 누른다', async function (this: ElectronWorld, key: string) {
  const page = await this.getPage()
  await page.keyboard.press(key)
})

// 우클릭
When('{string} 항목을 우클릭한다', async function (this: ElectronWorld, itemText: string) {
  const page = await this.getPage()
  await page.getByText(itemText).click({ button: 'right' })
})
```

### Then - 검증

```typescript
// 텍스트 존재 확인
Then('{string} 텍스트가 보인다', async function (this: ElectronWorld, text: string) {
  const page = await this.getPage()
  await expect(page.getByText(text)).toBeVisible({ timeout: UI_TIMEOUT })
})

// 텍스트 없음 확인
Then('{string} 텍스트가 보이지 않는다', async function (this: ElectronWorld, text: string) {
  const page = await this.getPage()
  await expect(page.getByText(text)).not.toBeVisible()
})

// 요소 존재 확인 (CSS selector)
Then('{string} 엘리먼트가 존재한다', async function (this: ElectronWorld, selector: string) {
  const page = await this.getPage()
  await expect(page.locator(selector)).toBeAttached()
})

// NFR - 성능 측정
Then('홈 화면이 {int}초 이내에 표시된다', async function (this: ElectronWorld, seconds: number) {
  const page = await this.getPage()
  const startTime = Date.now()
  await page.waitForSelector('[data-testid="home-screen"]', { timeout: seconds * 1000 })
  const elapsed = Date.now() - startTime
  expect(elapsed).toBeLessThan(seconds * 1000)
})
```

---

## 4. 실제 예시: 홈 화면 Step 정의

```typescript
// e2e/steps/home.steps.ts
import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { ElectronWorld } from '../support/world'

const UI_TIMEOUT = 5000

Given('앱이 실행되어 있다', async function (this: ElectronWorld) {
  expect(this.page).toBeDefined()
  expect(this.electronApp).toBeDefined()
})

Then('"SlideHTML" 텍스트가 보인다', async function (this: ElectronWorld) {
  const page = await this.getPage()
  await expect(page.getByText('SlideHTML')).toBeVisible({ timeout: UI_TIMEOUT })
})

Then('"폴더 열기" 버튼이 보인다', async function (this: ElectronWorld) {
  const page = await this.getPage()
  await expect(page.getByText('폴더 열기')).toBeVisible({ timeout: UI_TIMEOUT })
})
```

---

## 5. 실제 예시: 에디터 화면 Step 정의

```typescript
// e2e/steps/editor.steps.ts
import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { ElectronWorld } from '../support/world'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

let testFolder: string

// 테스트용 슬라이드 폴더 생성
Given('슬라이드 폴더가 준비되어 있다', async function (this: ElectronWorld) {
  // 임시 폴더 생성
  testFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'slidehtml-e2e-'))
  fs.mkdirSync(path.join(testFolder, '.slidehtml'))
  fs.mkdirSync(path.join(testFolder, 'slides'))
  fs.writeFileSync(
    path.join(testFolder, '.slidehtml', 'config.json'),
    JSON.stringify({ width: 1280, height: 720 })
  )

  // 테스트 슬라이드 생성
  fs.writeFileSync(
    path.join(testFolder, 'slides', '01.html'),
    '<html><body style="background:red">Slide 1</body></html>'
  )
  fs.writeFileSync(
    path.join(testFolder, 'slides', '02.html'),
    '<html><body style="background:blue">Slide 2</body></html>'
  )
})

// 정리
After(async function () {
  if (testFolder && fs.existsSync(testFolder)) {
    fs.rmSync(testFolder, { recursive: true, force: true })
  }
})

Then('슬라이드 목록에 {int}개 썸네일이 보인다', async function (this: ElectronWorld, count: number) {
  const page = await this.getPage()
  const thumbnails = page.locator('.thumbnail')
  await expect(thumbnails).toHaveCount(count, { timeout: 5000 })
})

When('→ 키를 누른다', async function (this: ElectronWorld) {
  const page = await this.getPage()
  await page.keyboard.press('ArrowRight')
})

Then('슬라이드 번호가 {string}로 표시된다', async function (this: ElectronWorld, counter: string) {
  const page = await this.getPage()
  await expect(page.getByText(counter)).toBeVisible({ timeout: 3000 })
})
```

---

## 6. 인수 테스트 실행

### 명령어

```bash
# 빌드 후 E2E 테스트 실행
npm run test:e2e:build

# 이미 빌드된 상태에서 E2E만 실행
npm run test:e2e

# 특정 Feature 테스트
npx cucumber-js --name "홈 화면이 정상적으로 표시된다"

# NFR 시나리오만 실행
npx cucumber-js --tags "@nfr"
```

### CI/CD 설정 (GitHub Actions 참고)

```yaml
# .github/workflows/e2e.yml
- name: Build app
  run: npm run build

- name: Run E2E tests
  run: npm run test:e2e
```

---

## 7. 실패 시 디버깅

### 일반적인 실패 원인 (Electron E2E 특화)

| 에러 | 원인 | 해결 |
|------|------|------|
| `빌드된 앱이 없습니다` | `out/main/index.js` 없음 | `npm run build` 먼저 실행 |
| `Timeout waiting for selector` | UI 요소가 없거나 늦게 렌더링 | selector 확인, timeout 증가 |
| `Cannot find element` | data-testid 누락 | 컴포넌트에 data-testid 추가 |
| 스크린샷으로 확인 | 실패 시 `e2e/results/screenshots/` 확인 | — |

### 디버깅 도구

```typescript
// 페이지 스크린샷 (디버깅용)
await page.screenshot({ path: 'debug.png' })

// 콘솔 로그 수집
page.on('console', msg => console.log('RENDERER:', msg.text()))

// 느리게 실행 (headful 모드)
this.electronApp = await electron.launch({
  args: [appPath],
  // slowMo: 500  // 각 동작 500ms 대기
})
```

---

## 검증 체크리스트

### 환경 설정
- [ ] `npm run build` 성공 확인
- [ ] `out/main/index.js` 존재 확인

### Step 정의 완성도
- [ ] 모든 Feature 파일의 시나리오에 대응하는 Step이 정의됨
- [ ] `data-testid` 속성이 필요한 컴포넌트에 추가됨
- [ ] 적절한 대기 전략 사용 (`waitForSelector`, `toBeVisible`)

### 테스트 통과
- [ ] 모든 기능 시나리오 통과 (Green)
- [ ] 모든 NFR 시나리오 통과 (`@nfr` 태그)
- [ ] 실패 시 스크린샷이 저장됨

---

## 참고 문서

- `@docs/develop-guide/step-1-requirements-analysis.md`: Feature 파일 작성 가이드
- `@docs/c4/current/`: 현재 구현 상태
- `e2e/support/hooks.ts`: 앱 launch/close 설정
- `e2e/support/world.ts`: ElectronWorld 컨텍스트

---

## 다음 단계

Step 5: 문서화로 진행합니다.
