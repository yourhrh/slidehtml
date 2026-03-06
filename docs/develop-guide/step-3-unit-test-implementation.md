# Step 3: 유닛 테스트 작성 및 구현

TDD 방식으로 유닛 테스트를 작성하고 구현합니다.

## 🔴 필수: 파일 기반 구현 추적 (대화 압축 대응)

**Step 3 시작 시 반드시 해야 할 일:**

### 1단계: impl-progress.md 파일 생성 (필수!)

```
위치: /docs/features/{feature-name}/3-implementation/impl-progress.md

목적: 대화 압축 후에도 진행 상황 복구 가능
```

**⚠️ 이 파일 없이는 Step 3 진행 금지!**

### 2단계: impl-progress.md 템플릿

```markdown
# 구현 진행 상황: {feature-name}

**생성일**: YYYY-MM-DD
**마지막 업데이트**: YYYY-MM-DD HH:MM

---

## 📊 전체 진행률

- **Phase 1 (Main)**: 0/N 완료 (0%)
- **Phase 2 (Preload)**: 0/N 완료 (0%)
- **Phase 3 (Renderer)**: 0/N 완료 (0%)
- **전체**: 0/N 완료 (0%)

---

## Phase 1: Main Process

### ⏳ 1.1 [수정/신규] {구체적 유닛명}

**상태**: `pending`
**구현 파일**: `src/main/{파일}.ts`
**테스트 파일**: `src/main/__tests__/{파일}.test.ts` (해당 시)

**계획**: (implementation-units.md에서 복사)

**참고**: implementation-units.md Phase 1.1

---

## 📌 체크리스트 (빠른 확인용)

### Phase 1 (Main)
- [ ] 1.1 {유닛명}

### Phase 2 (Preload)
- [ ] 2.1 {유닛명}

### Phase 3 (Renderer)
- [ ] 3.1 {유닛명}

---

## 🚨 문제 및 해결

(발생한 문제와 해결 방법 기록)

---

## 📚 참고 문서

- `@docs/features/{feature-name}/2-design/implementation-units.md`
- `@docs/features/{feature-name}/2-design/sequence-diagram.md`
- `@docs/c4/current/03_component_main.md`
- `@docs/c4/current/04_component_renderer.md`
```

### 상태 코드 및 이모지

| 상태 | 코드 | 이모지 | 의미 |
|------|------|--------|------|
| Pending | `pending` | ⏳ | 아직 시작 안 함 |
| In Progress | `in_progress` | 🔄 | 구현 진행 중 |
| Testing | `testing` | 🧪 | 구현 완료, 테스트 진행 중 |
| Completed | `completed` | ✅ | 테스트 통과, 완료 |
| Blocked | `blocked` | ❌ | 의존성 문제로 차단됨 |

---

## 유닛 테스트 작성 원칙

**중요: 설계 단계의 c4-analysis.md에서 식별한 신규/수정 코드에 대해서만 테스트 및 구현**
**중요: 하나의 유닛에 대한 테스트 작성, 구현, 테스트통과, 다음 유닛 테스트 작성 순으로 진행**

### 1. 테스트 대상 명확화
- ❌ 모든 함수를 테스트하지 않음
- ✅ 비즈니스 로직이 있는 유닛만 테스트
- ✅ 설계에서 식별한 핵심 동작만 검증
- ✅ 경계 테스트 작성

### 2. 테스트 범위
- 각 유닛의 **핵심 책임**만 테스트
- 단순 getter/setter, 생성자는 테스트 제외
- IPC 채널 연결 자체보다 **비즈니스 로직** 함수를 테스트
- 외부 의존성(chokidar, fs)은 mock 처리

### 3. Electron 특수 고려사항
- Main process 함수: `app`, `dialog` 등 Electron API는 mock 처리
- 파일시스템 함수(`fileManager.ts`, `store.ts`): 임시 디렉터리로 테스트
- Renderer 컴포넌트: `window.api`를 mock 처리

---

## 프로젝트 구조

```
src/
├── main/
│   ├── index.ts          ← IPC 핸들러 (Electron API 의존 → mock 필요)
│   ├── fileManager.ts    ← 파일 조작 (fs 의존 → tmp dir 활용)
│   └── store.ts          ← 히스토리 저장 (fs 의존 → tmp dir 활용)
│
├── preload/
│   ├── index.ts          ← contextBridge (ipcRenderer mock 필요)
│   └── index.d.ts        ← 타입 정의
│
└── renderer/src/
    ├── App.tsx            ← 화면 라우팅
    ├── screens/
    │   ├── Home.tsx
    │   ├── Editor.tsx
    │   └── Present.tsx
    ├── components/
    │   ├── Thumbnail.tsx  ← webview 포함
    │   └── SlideView.tsx  ← webview 포함
    └── utils/
        └── index.ts       ← 순수 함수 (테스트 쉬움)

e2e/
├── features/             ← Gherkin .feature 파일
├── steps/                ← Cucumber Step 정의
└── support/
    ├── hooks.ts           ← Electron 앱 launch/close
    └── world.ts           ← ElectronWorld 컨텍스트
```

---

## 진행 순서

1. **시퀀스 다이어그램 기반 구현 범위 확인**: `sequence-diagram.md`의 메서드 호출 흐름 확인
2. 각 유닛의 **핵심 동작**에 대한 테스트만 작성 (Red)
3. 테스트를 통과하는 최소한의 코드 구현 (Green)
4. 설계에 따라 구현하므로 대규모 리팩토링은 불필요
5. 필요시 코드 정리 수준의 minor refactoring

---

## 테스트 프레임워크 설정

**package.json에 추가:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

---

## Main Process 유닛 테스트 예시

### fileManager.ts 테스트 (순수 파일 조작)

```typescript
// src/main/__tests__/fileManager.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { readConfig, writeConfig, hasConfig, setupProject } from '../fileManager'

describe('fileManager', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slidehtml-test-'))
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  describe('readConfig', () => {
    it('config.json이 없으면 기본값을 반환한다', () => {
      const config = readConfig(tmpDir)
      expect(config).toEqual({ width: 1280, height: 720 })
    })

    it('저장된 config.json을 읽는다', () => {
      writeConfig(tmpDir, { width: 1920, height: 1080 })
      const config = readConfig(tmpDir)
      expect(config).toEqual({ width: 1920, height: 1080 })
    })
  })

  describe('setupProject', () => {
    it('slides/ 폴더를 생성한다', () => {
      setupProject(tmpDir, { width: 1280, height: 720 })
      expect(fs.existsSync(path.join(tmpDir, 'slides'))).toBe(true)
    })

    it('CLAUDE.md와 GEMINI.md를 생성한다', () => {
      setupProject(tmpDir, { width: 1280, height: 720 })
      expect(fs.existsSync(path.join(tmpDir, 'CLAUDE.md'))).toBe(true)
      expect(fs.existsSync(path.join(tmpDir, 'GEMINI.md'))).toBe(true)
    })

    it('CLAUDE.md에 해상도 정보가 포함된다', () => {
      setupProject(tmpDir, { width: 1920, height: 1080 })
      const content = fs.readFileSync(path.join(tmpDir, 'CLAUDE.md'), 'utf-8')
      expect(content).toContain('1920px')
      expect(content).toContain('1080px')
    })
  })
})
```

### store.ts 테스트

```typescript
// src/main/__tests__/store.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

// app.getPath mock
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => tmpDir)
  }
}))

let tmpDir: string

describe('store', () => {
  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slidehtml-store-test-'))
    vi.resetModules() // storePath 캐시 초기화
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('초기 히스토리는 빈 배열이다', async () => {
    const { getHistory } = await import('../store')
    expect(getHistory()).toEqual([])
  })

  it('히스토리를 추가하면 최신 항목이 앞에 온다', async () => {
    const { getHistory, addHistory } = await import('../store')
    addHistory({ folderPath: '/a', folderName: 'a', slideCount: 1, lastOpened: 1 })
    addHistory({ folderPath: '/b', folderName: 'b', slideCount: 2, lastOpened: 2 })
    expect(getHistory()[0].folderPath).toBe('/b')
  })

  it('같은 폴더를 추가하면 중복 없이 최신으로 업데이트된다', async () => {
    const { getHistory, addHistory } = await import('../store')
    addHistory({ folderPath: '/a', folderName: 'a', slideCount: 1, lastOpened: 1 })
    addHistory({ folderPath: '/a', folderName: 'a', slideCount: 3, lastOpened: 2 })
    expect(getHistory()).toHaveLength(1)
    expect(getHistory()[0].slideCount).toBe(3)
  })
})
```

---

## Renderer 유틸 테스트 예시

```typescript
// src/renderer/src/utils/__tests__/utils.test.ts
import { describe, it, expect } from 'vitest'
import { sortSlides, toFileUrl, basename } from '../index'

describe('sortSlides', () => {
  it('숫자 파일명을 자연어 순서로 정렬한다', () => {
    const slides = ['/path/10.html', '/path/2.html', '/path/1.html']
    expect(sortSlides(slides).map(basename)).toEqual(['1.html', '2.html', '10.html'])
  })

  it('두 자리 숫자 파일명을 올바르게 정렬한다', () => {
    const slides = ['/path/02.html', '/path/11.html', '/path/01.html', '/path/10.html']
    expect(sortSlides(slides).map(basename)).toEqual(['01.html', '02.html', '10.html', '11.html'])
  })
})

describe('toFileUrl', () => {
  it('Mac 경로를 file:// URL로 변환한다', () => {
    expect(toFileUrl('/Users/john/slides/01.html')).toBe('file:///Users/john/slides/01.html')
  })

  it('Windows 경로를 file:// URL로 변환한다', () => {
    expect(toFileUrl('C:\\Users\\john\\slides\\01.html')).toBe('file:///C:/Users/john/slides/01.html')
  })
})
```

---

## Renderer 컴포넌트 테스트 예시

```typescript
// src/renderer/src/screens/__tests__/Home.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '../Home'

// window.api mock
const mockApi = {
  getHistory: vi.fn().mockResolvedValue([]),
  openFolderDialog: vi.fn().mockResolvedValue(null),
  hasConfig: vi.fn().mockResolvedValue(false),
  openExistingFolder: vi.fn(),
  setupFolder: vi.fn(),
  addHistory: vi.fn(),
  removeHistory: vi.fn(),
}
vi.stubGlobal('api', mockApi)

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.getHistory.mockResolvedValue([])
  })

  it('"폴더 열기" 버튼이 렌더링된다', async () => {
    render(<Home onOpenFolder={vi.fn()} />)
    expect(screen.getByText('폴더 열기')).toBeInTheDocument()
  })

  it('히스토리가 있으면 목록이 표시된다', async () => {
    mockApi.getHistory.mockResolvedValue([
      { folderPath: '/test', folderName: 'test', slideCount: 3, lastOpened: Date.now() }
    ])
    render(<Home onOpenFolder={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument()
    })
  })
})
```

---

## 테스트 실행 명령어

```bash
# 전체 유닛 테스트
npm run test

# Watch 모드
npm run test:watch

# 커버리지
npm run test:coverage

# 타입 체크
npm run typecheck

# Lint
npm run lint

# 빌드 검증
npm run build
```

---

## 산출물

### 필수 파일
- **`/docs/features/{feature-name}/3-implementation/impl-progress.md`** ⭐ 필수!

### 구현 코드
- `src/main/{module}.ts`
- `src/preload/index.ts` + `index.d.ts`
- `src/renderer/src/{screens,components,utils}/*.tsx`

### 테스트 파일
- `src/main/__tests__/*.test.ts`
- `src/renderer/src/**/__tests__/*.test.ts`

---

## 구현 완료 체크리스트

### 필수 확인
- [ ] **impl-progress.md 최종 업데이트** (모든 유닛 `completed`)
- [ ] 모든 유닛 테스트 통과 (`npm run test`)
- [ ] Lint 체크 통과 (`npm run lint`)
- [ ] 타입 체크 통과 (`npm run typecheck`)
- [ ] 빌드 성공 (`npm run build`)

---

## 참고 문서

- `@docs/c4/current/`: 현재 구현 상태
- `@docs/c4/blueprint/`: 목표 아키텍처
- `@docs/features/{feature-name}/2-design/`: 설계 문서

---

## 다음 단계

Step 4: 인수 테스트 검증으로 진행합니다.
