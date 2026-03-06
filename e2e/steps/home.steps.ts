import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { ElectronWorld } from '../support/world'

const UI_TIMEOUT = 5000

Given('히스토리 목록이 존재한다', async function (this: ElectronWorld) {
  const page = await this.getPage()
  // page.evaluate 콜백은 renderer 프로세스에서 실행됨 (window.api 접근 가능)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await page.evaluate(async () => (globalThis as any).api.addHistory({
    folderPath: '/tmp/test-presentation',
    folderName: 'test-presentation',
    slideCount: 3,
    lastOpened: Date.now()
  }))
  // 페이지 새로고침 없이 history-item이 나타날 때까지 대기
  await expect(page.locator('.history-item').first()).toBeVisible({ timeout: UI_TIMEOUT })
})

When('히스토리 항목을 우클릭한다', async function (this: ElectronWorld) {
  const page = await this.getPage()
  await page.locator('.history-item').first().click({ button: 'right' })
})

Then('홈 화면이 {int}초 이내에 표시된다', async function (this: ElectronWorld, seconds: number) {
  const page = await this.getPage()
  await expect(page.locator('[data-testid="home-screen"]')).toBeVisible({ timeout: seconds * 1000 })
})
