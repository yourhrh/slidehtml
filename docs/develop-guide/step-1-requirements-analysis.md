# Step 1: 요구사항 분석

기능 요청을 분석하여 **유저 스토리 수준의 시나리오**와 **UI/IPC 명세**를 작성하는 단계입니다.

## 진행 순서

1. 기능 요청 확인
2. 기존 코드 참고 (electron/main, preload, renderer)
3. 기능 요구사항 작성 (Gherkin 시나리오 + 비기능 요구사항)
4. UI Specification 작성 (UI가 있는 경우)
5. IPC Contract 작성 (새로운 IPC 채널이 필요한 경우)
6. 최종 요구사항 확인

## 산출물

```
# 요구사항 = Gherkin 시나리오 (기능 + 비기능 모두 포함)
/e2e/features/{feature-name}.feature

# UI/IPC 명세 (해당 시)
/docs/features/{feature-name}/1-requirements/
├── ui-specification.md          # UI가 있는 경우
└── ipc-contract.md              # 새로운 IPC 채널이 있는 경우
```

---

## 1. .feature 파일 (요구사항)

`.feature` 파일 하나가 기능 요구사항과 비기능 요구사항을 모두 담습니다.

### 템플릿

```gherkin
Feature: {기능명}

  As a {사용자 역할}
  I want {원하는 행동}
  So that {얻고자 하는 가치}

  # --- 기능 요구사항 ---

  Scenario: {정상 케이스 제목}
    Given {전제 조건}
    When {사용자 행동}
    Then {예상 결과}
    And {추가 검증}

  Scenario: {예외 케이스 제목}
    Given {전제 조건}
    When {예외 상황}
    Then {예상 에러 처리}

  # --- 비기능 요구사항 ---

  @nfr
  Scenario: {성능 요구사항}
    Given {전제 조건}
    When {사용자 행동}
    Then {측정 가능한 기준}
```

### 작성 가이드

- **Feature 설명**: `As a / I want / So that` 형식으로 유저 스토리 기술
- **Scenario**: 각 시나리오가 하나의 인수 기준. 정상/예외 케이스 모두 포함
- **한글 작성**: `Feature`, `Scenario`, `Given`, `When`, `Then`, `And` 키워드 외 모든 내용은 한글
- **`@nfr` 태그**: 비기능 요구사항에 반드시 태그 부착, 측정 가능한 수치 사용

### 실제 예시

```gherkin
# e2e/features/home.feature

Feature: 홈 화면

  As a 발표 준비 중인 개발자
  I want 최근에 열었던 프레젠테이션 폴더를 빠르게 다시 열고 싶다
  So that 매번 폴더를 찾아다닐 필요 없이 바로 작업을 재개할 수 있다

  Scenario: 홈 화면이 정상적으로 표시된다
    Given 앱이 실행되어 있다
    Then "SlideHTML" 제목이 보인다
    And "폴더 열기" 버튼이 보인다

  Scenario: 히스토리 항목 우클릭으로 삭제할 수 있다
    Given 히스토리에 "my-presentation" 폴더가 있다
    When "my-presentation" 항목을 우클릭한다
    Then 컨텍스트 메뉴가 표시된다
    And "히스토리에서 제거" 버튼을 클릭하면 목록에서 사라진다

  @nfr
  Scenario: 앱이 빠르게 시작된다
    Given 앱이 실행되어 있다
    Then 홈 화면이 2초 이내에 표시된다
```

---

## 2. ui-specification.md

UI가 있는 기능의 경우 작성합니다.

### 템플릿

```markdown
# UI Specification: {feature-name}

## 화면 개요
- **화면명**: {화면 이름}
- **위치**: {App.tsx의 screen 상태값 - 'home' | 'editor' | 'present'}
- **목적**: {이 화면이 제공하는 가치}

---

## 레이아웃

### 전체 구조
```
┌─────────────────────────┐
│       Header            │
├──────────┬──────────────┤
│ Sidebar  │ Main Content │
├──────────┴──────────────┤
│       Toolbar           │
└─────────────────────────┘
```

### 섹션별 구성

#### 1. {섹션명}
- **위치**: {상단/좌측/중앙/하단}
- **컴포넌트**: {사용할 React 컴포넌트}
- **내용**: {표시할 정보 요약}

---

## 상태별 UI

| 상태 | 표시 내용 |
|------|----------|
| 슬라이드 없음 | {빈 상태 안내 메시지} |
| 슬라이드 있음 | {썸네일 목록 + 메인 뷰} |
| 발표 모드 | {풀스크린 슬라이드} |

---

## 사용자 상호작용

| 요소 | 액션 | 결과 |
|------|------|------|
| {버튼/요소} | 클릭 | {동작} |
| {키보드} | 키 입력 | {동작} |
```

---

## 3. ipc-contract.md

새로운 IPC 채널이 필요한 기능의 경우 작성합니다.

### 채널 설계 원칙

```
렌더러 → 메인 (invoke/handle):
  양방향 통신이 필요할 때. ipcRenderer.invoke + ipcMain.handle

렌더러 → 메인 (send/on):
  단방향, 응답 불필요할 때. ipcRenderer.send + ipcMain.on

메인 → 렌더러 (send):
  서버 푸시. mainWindow.webContents.send
  렌더러에서 ipcRenderer.on으로 구독
```

### 템플릿

```markdown
# IPC Contract: {feature-name}

## 렌더러 → 메인 (invoke)

### {채널명}
- **방향**: 렌더러 → 메인 → 렌더러
- **요청**: `ipcRenderer.invoke('{채널명}', {파라미터})`
- **응답**: `{반환 타입}`
- **에러**: `{에러 케이스}`

## 메인 → 렌더러 (push)

### {채널명}
- **방향**: 메인 → 렌더러
- **페이로드**: `{타입}`
- **발생 시점**: {언제 발생하는지}
```

---

## 검토 체크리스트

### .feature 파일
- [ ] Feature 설명에 유저 스토리(As a/I want/So that)가 포함됨
- [ ] Scenario가 정상/예외 케이스를 모두 포함
- [ ] `@nfr` 시나리오가 측정 가능한 수치로 정의됨

### ui-specification.md (해당 시)
- [ ] 모든 상태(빈 상태/데이터 있을 때/에러) 정의됨
- [ ] 키보드 인터랙션 정의됨 (발표 모드 화살표 키 등)

### ipc-contract.md (해당 시)
- [ ] 모든 채널의 방향, 파라미터, 반환값 정의됨
- [ ] 에러 케이스 명시됨

---

## 다음 단계

Step 2: 설계로 진행합니다.
