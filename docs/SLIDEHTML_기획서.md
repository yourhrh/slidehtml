# SlideHTML — 기획서
> 2026.03.06
> LLM으로 만든 HTML 파일을 슬라이드쇼로 보여주는 Electron 앱

---

## 1. 한 줄 정의

> **"HTML 파일이 있으면 슬라이드가 된다"**

---

## 2. 배경

```
기존 PPT 도구의 문제:
- PowerPoint/Keynote = 바이너리 포맷 → LLM이 직접 생성 불가
- Gamma = 독자 포맷 → LLM이 모름
- Marp = Markdown만 가능 → 디자인 한계

HTML의 장점:
- LLM의 모국어 (Claude Code, Gemini CLI, Cursor 등)
- 뭐든 가능: CDN, 애니메이션, 3D, 차트, 영상 embed
- 파일 기반 → Git 관리 가능
- 외부 리소스 제한 없음
```

---

## 3. 핵심 워크플로우

```
1. 앱에서 폴더 열기
       ↓
2. CLAUDE.md / GEMINI.md 자동 생성
       ↓
3. 사용자가 Claude Code / Gemini CLI 실행
   "slides/01.html 만들어줘. 투자자 피치 타이틀 슬라이드."
       ↓
4. LLM이 HTML 파일 생성 → slides/ 폴더에 저장
       ↓
5. 앱이 변경 즉시 감지 → 슬라이드 자동 반영
       ↓
6. 발표 모드로 전환 → 바로 발표
```

---

## 4. 타깃

```
주 타깃: LLM 툴(Claude Code, Gemini CLI, Cursor)을 쓰는 개발자/기획자
부 타깃: HTML/CSS 할 줄 아는 누구나

Pain:
"LLM으로 콘텐츠는 만들 수 있는데
 PPT로 만들려면 결국 손으로 옮겨야 함"
```

---

## 5. 기술 스택

### 5-1. 코어 프레임워크

| 패키지 | 버전 | 역할 |
|--------|------|------|
| `electron` | 최신 안정 | 앱 프레임워크 |
| `electron-vite` | 최신 | Electron + Vite 통합 빌드 |
| `react` + `react-dom` | 18 | UI 렌더러 |
| `typescript` | 5 | 타입 안정성 |

### 5-2. 파일 시스템

| 패키지 | 역할 | 이유 |
|--------|------|------|
| `chokidar` | 폴더 변경 감지 | fs.watch보다 안정적, 크로스플랫폼 |
| `natural-sort` | 파일명 정렬 | 01,02,10,11 올바른 순서 처리 |
| `fs-extra` | 파일 조작 | 폴더 생성, 파일 읽기 편의 |

### 5-3. 저장소

| 패키지 | 역할 | 이유 |
|--------|------|------|
| `electron-store` | 히스토리 영구 저장 | localStorage 대신 앱 전용 |

### 5-4. 슬라이드 렌더링

```
Electron <webview> 태그
→ 독립 렌더러 프로세스 (보안 격리)
→ CDN, 외부 JS, 이미지, 영상 전부 허용
→ 실제 Chromium 브라우저처럼 동작
→ preload.js로 IPC 브릿지

스케일링: CSS transform scale()
→ container 크기 기준으로 비율 유지하며 축소/확대
```

### 5-5. 패키징 / 배포

| 패키지 | 역할 |
|--------|------|
| `electron-builder` | .dmg / .exe / .AppImage 빌드 |
| GitHub Actions | 자동 빌드 + Release |

### 5-6. 프로젝트 초기 구조

```
slidehtml/
├── electron/
│   ├── main.ts          ← 메인 프로세스 (Node.js)
│   │   - 윈도우 생성
│   │   - dialog (폴더 열기)
│   │   - chokidar 파일 감시
│   │   - IPC 핸들러
│   └── preload.ts       ← IPC 브릿지 (contextBridge)
├── src/
│   ├── App.tsx
│   ├── screens/
│   │   ├── Home.tsx     ← 홈 + 히스토리
│   │   ├── Editor.tsx   ← 편집 화면
│   │   └── Present.tsx  ← 발표 모드
│   ├── components/
│   │   ├── Thumbnail.tsx   ← 슬라이드 썸네일
│   │   └── SlideView.tsx   ← 현재 슬라이드 webview
│   └── utils/
│       ├── fileManager.ts  ← CLAUDE.md 생성
│       └── sortSlides.ts   ← 자연어 정렬
├── package.json
├── electron-builder.yml
└── vite.config.ts
```

### 5-7. IPC 채널 설계

```
메인 → 렌더러:
  slides:updated   슬라이드 목록 변경
  slide:changed    특정 슬라이드 파일 변경

렌더러 → 메인:
  folder:open      폴더 열기 다이얼로그
  folder:getSlides 슬라이드 목록 요청
  terminal:open    터미널 열기 (해당 폴더)
```

---

## 6. 기능 리스트

### 🟢 v1 — MVP (출시)

**홈 화면**
- [ ] 폴더 열기 버튼 (dialog.showOpenDialog)
- [ ] 최근 폴더 히스토리 목록 (electron-store)
- [ ] 히스토리 항목: 폴더명 + 슬라이드 수 + 마지막 열람일
- [ ] 히스토리 항목 클릭 → 바로 열기
- [ ] 히스토리 항목 우클릭 → 삭제

**프로젝트 설정**
- [ ] 해상도 선택 (1280×720 / 1920×1080 / 1024×768 / 커스텀)
- [ ] .slidehtml/config.json 자동 생성
- [ ] slides/ 폴더 자동 생성 (없을 경우)

**인스트럭션 파일 생성**
- [ ] CLAUDE.md 자동 생성
- [ ] GEMINI.md 자동 생성
- [ ] 슬라이드 수 변경 시 "다음 파일명" 자동 업데이트
- [ ] config.json 해상도 변경 시 두 파일 자동 업데이트

**편집 화면**
- [ ] 왼쪽 썸네일 목록 (webview scale 렌더링)
- [ ] 파일명 기준 자연어 정렬 (01, 02, 10, 11 올바른 순서)
- [ ] 썸네일 클릭 → 현재 슬라이드 전환
- [ ] 현재 슬라이드 크게 보기 (비율 유지 scale)
- [ ] 슬라이드 번호 표시 (N / 전체)
- [ ] ◁ ▷ 버튼 네비게이션
- [ ] 발표 모드 버튼

**실시간 파일 감지 (chokidar)**
- [ ] HTML 파일 추가 → 썸네일 자동 추가
- [ ] HTML 파일 수정 → 썸네일 + 현재 슬라이드 자동 새로고침
- [ ] HTML 파일 삭제 → 썸네일 자동 제거
- [ ] CLAUDE.md "다음 파일명" 자동 업데이트

**발표 모드**
- [ ] 풀스크린 전환
- [ ] 슬라이드 비율 유지 + 화면 꽉 채우기
- [ ] ← → 키보드 네비게이션
- [ ] 스페이스바 → 다음 슬라이드
- [ ] ESC → 편집 모드 복귀
- [ ] 슬라이드 번호 (우하단, 마우스 호버시만)

**터미널 연동**
- [ ] "터미널 열기" 버튼 → 해당 폴더로 iTerm / Terminal 실행 (Mac)
- [ ] Windows: cmd / PowerShell

---

### 🟡 v2 — 안정화

- [ ] PDF 내보내기 (Puppeteer로 각 슬라이드 캡처)
- [ ] 슬라이드 발표자 노트 (.notes 파일 또는 HTML 주석)
- [ ] 발표 타이머 (경과 시간 표시)
- [ ] 앱 다크/라이트 테마
- [ ] 썸네일 줌 레벨 조절
- [ ] .cursorrules 자동 생성 (Cursor용)
- [ ] .github/copilot-instructions.md 자동 생성

---

### 🔵 v3 — 확장

- [ ] 슬라이드 전환 애니메이션 옵션
- [ ] 레이저 포인터 모드 (발표 중 마우스 강조)
- [ ] 두 번째 모니터 발표자 뷰
- [ ] 폴더 없이 단일 HTML 파일 열기
- [ ] PNG/JPG 슬라이드 이미지 export

---

## 7. 파일 구조 (사용자 프로젝트)

```
my-presentation/
├── .slidehtml/
│   └── config.json       ← { "width": 1280, "height": 720 }
├── slides/
│   ├── 01.html           ← 슬라이드 1
│   ├── 02.html           ← 슬라이드 2
│   └── 03.html           ← 슬라이드 3
├── CLAUDE.md             ← Claude Code용 인스트럭션
└── GEMINI.md             ← Gemini CLI용 인스트럭션
```

**CLAUDE.md / GEMINI.md 내용:**
```markdown
# SlideHTML

slides/ 폴더에 HTML 슬라이드를 순서대로 저장합니다.

## 파일 규칙
- 파일명: 01.html, 02.html, 03.html ... (숫자 2자리 권장)
- 각 슬라이드 body: width: 1280px; height: 720px; overflow: hidden;
- 외부 CDN, 라이브러리, 이미지 URL 전부 사용 가능

## 현재 상태
- 슬라이드 수: {N}개
- 다음 파일명: {N+1}.html
```

---

## 8. INSTR 파일 자동 업데이트 로직

```
슬라이드 추가/삭제 감지
  → slides/ 내 HTML 파일 수 재계산
  → CLAUDE.md "슬라이드 수" + "다음 파일명" 업데이트
  → GEMINI.md 동일 업데이트

해상도 변경
  → config.json 저장
  → CLAUDE.md body 사이즈 업데이트
  → GEMINI.md 동일 업데이트
```

---

## 9. 오픈소스 전략

```
목표: GitHub 스타 + LLM 개발자 커뮤니티

README 구성:
  1. 30초 데모 GIF (Claude Code로 슬라이드 생성하는 장면)
  2. 설치: brew install / dmg 다운로드 / npm
  3. 사용법: 폴더 열기 → Claude Code 실행 → 발표
  4. "왜 HTML인가?" 섹션

배포:
  GitHub Releases
  → Mac: .dmg (Apple Silicon + Intel 유니버설)
  → Win: .exe (NSIS 인스톨러)
  → Linux: .AppImage

GitHub Actions:
  → 태그 푸시 → 자동 빌드 → Release 첨부
```

---

## 10. MVP 범위 요약

```
✅ 포함
홈 화면 + 히스토리
폴더 열기 + 해상도 설정
CLAUDE.md / GEMINI.md 자동 생성 + 자동 업데이트
슬라이드 편집 화면 (썸네일 + 현재 슬라이드)
chokidar 실시간 파일 감지
발표 모드 (풀스크린 + 키보드)
터미널 열기 버튼
GitHub 오픈소스 배포 (.dmg / .exe / .AppImage)

❌ 제외
내장 터미널
슬라이드 내부 편집
PDF 내보내기
클라우드 저장
협업
```

---

## 11. 빌드 순서

```
1. electron-vite 프로젝트 초기화
2. 메인 프로세스: dialog + chokidar + IPC
3. 홈 화면 + electron-store 히스토리
4. 해상도 설정 + config.json
5. CLAUDE.md / GEMINI.md 생성 로직
6. 편집 화면: 썸네일 + webview
7. 실시간 파일 감지 → UI 업데이트
8. 발표 모드 풀스크린
9. 터미널 열기
10. electron-builder 패키징
11. GitHub Actions CI
12. README + 데모 GIF
```

---

*이 앱 자체도 Claude Code로 만든다.*
*dog fooding — 앱 소개 슬라이드를 SlideHTML로 발표한다.*
