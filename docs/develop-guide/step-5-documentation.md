# Step 5: 문서화

구현이 완료된 후 C4 아키텍처 문서를 업데이트합니다.

## 진행 순서

1. **기존 C4 문서 확인**: 어떤 파일을 업데이트할지 결정
2. **`docs/c4/current/` 문서 업데이트**: 실제 구현 내용 반영
3. **중요한 아키텍처 결정사항이 있는 경우 ADR 작성**
4. **임시 문서 삭제**: 구현 과정에서 생성된 작업용 문서 제거

---

## 🔴 중요: 문서 작성 원칙

**절대 새로운 문서를 임의로 생성하지 마세요!**
- 기능 개발 시 항상 **기존 문서를 업데이트**합니다
- 새로운 문서가 필요하다고 판단되면 **반드시 사용자에게 확인을 요청**합니다

---

## 프로젝트 문서 구조

```
docs/
├── c4/
│   ├── blueprint/                  # 목표 아키텍처 (참조용, 수정하지 않음)
│   │   ├── README.md
│   │   ├── 01_context.md
│   │   ├── 02_container.md
│   │   ├── 03_component_main.md
│   │   ├── 04_component_renderer.md
│   │   └── 05_component_preload.md
│   │
│   └── current/                    # 현재 구현 상태 (업데이트 대상 ✅)
│       ├── README.md               ← Blueprint 대비 구현 현황 테이블
│       ├── 01_context.md
│       ├── 02_container.md         ← IPC 채널 현황
│       ├── 03_component_main.md    ← Main Process 구현 상태
│       ├── 04_component_renderer.md ← Renderer 구현 상태
│       └── 05_component_preload.md ← window.api 현황
│
├── develop-guide/                  # 현재 문서 (이 파일)
│
└── features/                       # 기능별 설계 문서
    └── {feature-name}/
        ├── 1-requirements/
        │   ├── ui-specification.md  ← 영구 보존
        │   └── ipc-contract.md      ← 영구 보존
        ├── 2-design/
        │   ├── sequence-diagram.md  ← 영구 보존
        │   ├── c4-analysis.md       ← 삭제 대상 (구현 후)
        │   ├── implementation-units.md ← 삭제 대상 (구현 후)
        │   └── decisions/           ← ADR (영구 보존)
        └── 3-implementation/
            └── impl-progress.md     ← 삭제 대상 (구현 완료 후)
```

---

## 업데이트할 문서 결정 플로우

```
구현 완료
    ↓
Q: 기존 docs/c4/current/ 문서에 해당하는 내용인가?
    ├─ YES → 해당 파일 업데이트
    │
    └─ NO → ⚠️ 사용자에게 확인 요청
```

### 업데이트 대상 결정표

| 개발 내용 | 업데이트할 파일 |
|----------|---------------|
| IPC 채널 추가/변경 | `current/02_container.md` |
| Main Process 함수 추가/변경 | `current/03_component_main.md` |
| React 화면/컴포넌트 추가/변경 | `current/04_component_renderer.md` |
| `window.api` 메서드 추가/변경 | `current/05_component_preload.md` |
| Blueprint 대비 구현 현황 변경 | `current/README.md` |

---

## 산출물

### C4 문서 업데이트
- `docs/c4/current/README.md` — Blueprint 대비 구현 현황 테이블 갱신
- `docs/c4/current/02_container.md` — IPC 채널 현황 갱신
- `docs/c4/current/03_component_main.md` — Main Process 구현 상태 갱신
- `docs/c4/current/04_component_renderer.md` — Renderer 구현 상태 갱신
- `docs/c4/current/05_component_preload.md` — window.api 현황 갱신

### ADR (필요시)
- `docs/features/{feature-name}/2-design/decisions/ADR-{번호}-{제목}.md`

---

## C4 Current 문서 업데이트 방법

### 상태 표기 규칙

| 표기 | 의미 |
|------|------|
| `구현됨` | 완전히 동작하는 상태 |
| `구현됨 (부분)` | 기본 구조는 있으나 일부 미구현 |
| `미구현` | 파일/기능 없음 |

### README.md 업데이트 예시

```markdown
## Blueprint 대비 구현 현황

| Blueprint 컴포넌트 | 파일 경로 | 상태 |
|--------------------|-----------|------|
| IPC Handler | `src/main/index.ts` | 구현됨 ← 변경 |
| File Watcher | `src/main/index.ts` | 구현됨 ← 변경 |
| History Store | `src/main/store.ts` | 구현됨 ← 변경 |
| Config Manager | `src/main/fileManager.ts` | 구현됨 ← 변경 |
| Home Screen | `src/renderer/src/screens/Home.tsx` | 구현됨 ← 변경 |
```

### container.md IPC 채널 업데이트 예시

```markdown
## 현재 IPC 채널

| 채널 | 방향 | 상태 | 설명 |
|------|------|------|------|
| folder:open | Renderer → Main | 구현됨 ← | 폴더 선택 다이얼로그 |
| folder:setup | Renderer → Main | 구현됨 ← | 신규 프로젝트 초기화 |
| slides:updated | Main → Renderer | 구현됨 ← | 슬라이드 목록 변경 push |
```

### component_main.md 업데이트 예시

```markdown
## 구현된 것

### createWindow
- webviewTag: true 설정 ← 추가됨

### IPC 핸들러 목록 ← 신규 섹션
- `folder:open`: 폴더 선택 다이얼로그
- `folder:setup`: 프로젝트 초기화
- ...

### File Watcher (chokidar) ← 신규 섹션
slides/ 폴더를 감시하고 변경 시 `slides:updated` push.

## 미구현된 것

(완료된 항목 삭제)
```

---

## 임시 문서 삭제

구현 과정에서 생성된 아래 문서들은 C4 문서 업데이트가 완료된 후 삭제합니다.

| 파일 | 생성 시점 | 삭제 이유 |
|------|----------|----------|
| `2-design/c4-analysis.md` | Step 2 설계 | 내용이 `c4/current/`에 흡수됨 |
| `2-design/implementation-units.md` | Step 2 설계 | 구현 완료로 역할 종료 |
| `3-implementation/impl-progress.md` | Step 3 구현 | 구현 완료로 역할 종료 |

```bash
rm docs/features/{feature-name}/2-design/c4-analysis.md
rm docs/features/{feature-name}/2-design/implementation-units.md
rm docs/features/{feature-name}/3-implementation/impl-progress.md
```

삭제 후 남아야 할 문서:
```
docs/features/{feature-name}/
├── 1-requirements/
│   ├── ui-specification.md    ← 영구 보존
│   └── ipc-contract.md        ← 영구 보존
└── 2-design/
    ├── sequence-diagram.md    ← 영구 보존
    └── decisions/             ← ADR (해당 시)
```

---

## ADR 작성 가이드

중요한 아키텍처 결정이 있는 경우에만 작성합니다.

### ADR이 필요한 경우

- 새로운 아키텍처 패턴 도입 (예: webview 대신 iframe 사용)
- 기존 패턴에서 벗어나는 결정
- 외부 라이브러리 선택 (예: chokidar vs fs.watch)
- IPC 설계 결정 (예: invoke vs send 선택 이유)

### ADR 템플릿

```markdown
# ADR-{번호}: {결정 제목}

**날짜**: YYYY-MM-DD
**상태**: 제안됨 | 승인됨 | 거부됨 | 폐기됨 | 대체됨

## 컨텍스트
{결정이 필요한 상황과 배경}

## 결정
{내린 결정}

## 대안

### 대안 1: {대안명}
- 장점: {장점}
- 단점: {단점}
- 선택하지 않은 이유: {이유}

## 결과

### 긍정적 결과
- {긍정적 영향}

### 부정적 결과 (Trade-off)
- {부정적 영향}

## 영향을 받는 컴포넌트
- `{파일경로}`: {어떤 영향}
```

### ADR 예시

```markdown
# ADR-001: 슬라이드 렌더링에 <webview> 사용

**날짜**: 2026-03-06
**상태**: 승인됨

## 컨텍스트
슬라이드 HTML 파일을 앱 내에서 렌더링해야 한다.
외부 CDN, 라이브러리, 이미지 URL을 모두 허용해야 한다.

## 결정
Electron `<webview>` 태그를 사용하여 슬라이드를 격리된 렌더러 프로세스에서 실행한다.

## 대안

### 대안 1: `<iframe>`
- 장점: 표준 HTML, 타입 선언 불필요
- 단점: 보안 격리 수준이 낮음, 일부 CDN 리소스 로드 제한
- 선택하지 않은 이유: 완전한 Chromium 브라우저 동작이 필요

## 결과

### 긍정적 결과
- 완전한 Chromium 환경에서 CDN 라이브러리 동작
- 앱 렌더러와 슬라이드 간 완전한 격리

### 부정적 결과 (Trade-off)
- JSX에 webview 타입 선언 추가 필요
- `webviewTag: true` BrowserWindow 옵션 필요

## 영향을 받는 컴포넌트
- `src/main/index.ts`: `webPreferences.webviewTag: true`
- `src/renderer/src/env.d.ts`: JSX 타입 선언
- `src/renderer/src/components/Thumbnail.tsx`
- `src/renderer/src/components/SlideView.tsx`
```

---

## 문서화 완료 체크리스트

### 필수
- [ ] `docs/c4/current/README.md` 구현 현황 테이블 업데이트
- [ ] 새로 추가된 IPC 채널 → `02_container.md` 반영
- [ ] 새로 추가된 Main 함수 → `03_component_main.md` 반영
- [ ] 새로 추가된 Renderer 화면/컴포넌트 → `04_component_renderer.md` 반영
- [ ] 새로 추가된 window.api 메서드 → `05_component_preload.md` 반영
- [ ] 임시 문서 삭제 (c4-analysis.md, implementation-units.md, impl-progress.md)

### 선택 (해당 시)
- [ ] 중요한 아키텍처 결정 → ADR 작성

### 검증
- [ ] 문서와 실제 코드 일치 확인
- [ ] `미구현` 표기된 항목이 실제로 구현된 경우 상태 갱신

---

## 참고 문서

- `@docs/c4/current/`: 현재 아키텍처 상태 (업데이트 대상)
- `@docs/c4/blueprint/`: 목표 아키텍처 (참조용)

---

## 다음 단계

코드 리뷰 및 배포 준비
