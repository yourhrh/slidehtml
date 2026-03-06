import { World, setWorldConstructor, IWorldOptions } from '@cucumber/cucumber'
import { ElectronApplication, Page } from 'playwright'

export class ElectronWorld extends World {
  electronApp?: ElectronApplication
  page?: Page

  constructor(options: IWorldOptions) {
    super(options)
  }

  async getPage(): Promise<Page> {
    if (!this.page) throw new Error('Page not initialized')
    return this.page
  }
}

setWorldConstructor(ElectronWorld)
