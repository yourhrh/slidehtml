import { Given, Then, When } from '@cucumber/cucumber'
import { expect } from '@playwright/test'
import { ElectronWorld } from '../support/world'

Given('앱이 실행되어 있다', async function (this: ElectronWorld) {
  // hooks.ts의 Before에서 이미 앱을 실행하므로 여기서는 상태 확인만
  expect(this.page).toBeDefined()
  expect(this.electronApp).toBeDefined()
})

Then('메인 창이 표시된다', async function (this: ElectronWorld) {
  const page = await this.getPage()
  await expect(page).toBeTruthy()

  const windowCount = await this.electronApp!.windows()
  expect(windowCount.length).toBeGreaterThanOrEqual(1)
})

Then('페이지 타이틀이 존재한다', async function (this: ElectronWorld) {
  const page = await this.getPage()
  const title = await page.title()
  expect(typeof title).toBe('string')
})

When('사용자가 {string} 버튼을 클릭한다', async function (this: ElectronWorld, buttonText: string) {
  const page = await this.getPage()
  await page.getByText(buttonText).click()
})

Then('{string} 텍스트가 보인다', async function (this: ElectronWorld, text: string) {
  const page = await this.getPage()
  await expect(page.getByText(text)).toBeVisible()
})

Then('{string} 텍스트가 보이지 않는다', async function (this: ElectronWorld, text: string) {
  const page = await this.getPage()
  await expect(page.getByText(text)).not.toBeVisible()
})

Then('{string} 엘리먼트가 존재한다', async function (this: ElectronWorld, selector: string) {
  const page = await this.getPage()
  await expect(page.locator(selector)).toBeAttached()
})
