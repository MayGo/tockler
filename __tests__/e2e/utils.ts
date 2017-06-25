import { resolve } from 'path'
import { Application } from 'spectron'

export const LONG_TIMEOUT = 60000

export function getElectronPath() {
  const extension = process.platform === 'win32' ? '.cmd' : ''
  return `node_modules/.bin/electron${extension}`
}

export function createApplication(options?: any) {

  return new Application(Object.assign(
    {
      path: exports.getElectronPath(),
      args: ['./dist']
    },
    options
  ))
}

export function startApplication(app: any) {
  if (!app || app.isRunning()) {
    return
  }

  return app.start()
}

export function stopApplication(app: any) {
  if (!app || !app.isRunning()) {
    return
  }

  return app.stop()
}
