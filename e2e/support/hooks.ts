import { Before, After, AfterAll, BeforeAll, Status } from '@cucumber/cucumber'
import { _electron as electron } from 'playwright'
import { ElectronWorld } from './world'
import * as path from 'path'
import * as fs from 'fs'

const resultsDir = path.join(process.cwd(), 'e2e/results/screenshots')

BeforeAll(async function () {
  fs.mkdirSync(resultsDir, { recursive: true })
})

Before(async function (this: ElectronWorld) {
  const appPath = path.join(process.cwd(), 'out/main/index.js')

  if (!fs.existsSync(appPath)) {
    throw new Error(
      `빌드된 앱이 없습니다. 먼저 'npm run build'를 실행하세요.\n경로: ${appPath}`
    )
  }

  this.electronApp = await electron.launch({
    args: [appPath]
  })

  this.page = await this.electronApp.firstWindow()
  await this.page.waitForLoadState('domcontentloaded')
})

After(async function (this: ElectronWorld, scenario) {
  // 실패한 시나리오의 스크린샷 저장
  if (scenario.result?.status === Status.FAILED && this.page) {
    const screenshotName = scenario.pickle.name.replace(/[^a-z0-9]/gi, '_')
    await this.page.screenshot({
      path: path.join(resultsDir, `${screenshotName}_${Date.now()}.png`)
    })
  }

  await this.electronApp?.close()
})

AfterAll(async function () {
  // 정리 작업
})
