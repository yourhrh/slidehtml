import { Given, When, Then, After } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { ElectronWorld } from '../support/world'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const UI_TIMEOUT = 5000

let testFolder: string | null = null

function createTestFolder(slideCount: number): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'slidehtml-e2e-editor-'))
  fs.mkdirSync(path.join(dir, '.slidehtml'))
  fs.mkdirSync(path.join(dir, 'slides'))
  fs.writeFileSync(
    path.join(dir, '.slidehtml', 'config.json'),
    JSON.stringify({ width: 1280, height: 720 })
  )
  for (let i = 1; i <= slideCount; i++) {
    const num = String(i).padStart(2, '0')
    fs.writeFileSync(
      path.join(dir, 'slides', `${num}.html`),
      `<html><body style="background:#${i}00">Slide ${i}</body></html>`
    )
  }
  return dir
}

After(async function () {
  if (testFolder && fs.existsSync(testFolder)) {
    fs.rmSync(testFolder, { recursive: true, force: true })
    testFolder = null
  }
})

Given('슬라이드 폴더가 열려 있다', async function (this: ElectronWorld) {
  testFolder = createTestFolder(0)
  const folderPath = testFolder
  const page = await this.getPage()
  // window.api를 통해 직접 편집 화면으로 이동 (OS 다이얼로그 우회)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await page.evaluate(async (fp) => (globalThis as any).api.openExistingFolder(fp), folderPath)
  // App.tsx가 openExistingFolder 결과를 받을 수 없으므로 history 경유로 네비게이션
  // 대신 IPC를 직접 호출하여 편집화면 진입: 홈 화면의 히스토리 항목 클릭 시뮬레이션
  await page.evaluate(async (fp) => {
    const api = (globalThis as any).api
    await api.addHistory({ folderPath: fp, folderName: 'test', slideCount: 0, lastOpened: Date.now() })
  }, folderPath)
  await page.reload()
  await page.waitForLoadState('domcontentloaded')
  // 히스토리 항목 클릭하여 편집 화면 진입
  await page.locator('.history-item').first().click()
  await expect(page.locator('[data-testid="editor-screen"]')).toBeVisible({ timeout: UI_TIMEOUT })
})

Given('슬라이드 폴더가 비어 있다', async function (this: ElectronWorld) {
  // 이미 createTestFolder(0)으로 빈 폴더 생성됨 — 추가 작업 불필요
})

Given('slides\\/ 폴더에 HTML 파일이 {int}개 있다', async function (this: ElectronWorld, count: number) {
  if (!testFolder) return
  // 기존 slides 파일 삭제 후 재생성
  const slidesDir = path.join(testFolder, 'slides')
  for (const f of fs.readdirSync(slidesDir)) {
    fs.unlinkSync(path.join(slidesDir, f))
  }
  for (let i = 1; i <= count; i++) {
    const num = String(i).padStart(2, '0')
    fs.writeFileSync(
      path.join(slidesDir, `${num}.html`),
      `<html><body>Slide ${i}</body></html>`
    )
  }
  // chokidar가 변경을 감지할 때까지 잠시 대기
  await new Promise((r) => setTimeout(r, 800))
})

Given('현재 슬라이드가 1번이다', async function (this: ElectronWorld) {
  // 편집화면 진입 시 기본적으로 첫 번째 슬라이드 — 확인만
  const page = await this.getPage()
  await expect(page.locator('[data-testid="slide-counter"]')).toContainText('1 /', { timeout: UI_TIMEOUT })
})

When('{string} 버튼을 클릭한다', async function (this: ElectronWorld, buttonText: string) {
  const page = await this.getPage()
  await page.getByText(buttonText).click()
})

Then('썸네일이 {int}개 표시된다', async function (this: ElectronWorld, count: number) {
  const page = await this.getPage()
  await expect(page.locator('.thumbnail')).toHaveCount(count, { timeout: UI_TIMEOUT })
})

Then('슬라이드 번호가 {string}으로 표시된다', async function (this: ElectronWorld, counter: string) {
  const page = await this.getPage()
  await expect(page.locator('[data-testid="slide-counter"]')).toContainText(counter, { timeout: UI_TIMEOUT })
})

Then('1초 이내에 슬라이드 번호가 업데이트된다', async function (this: ElectronWorld) {
  const page = await this.getPage()
  await expect(page.locator('[data-testid="slide-counter"]')).toContainText('2 /', { timeout: 1000 })
})
