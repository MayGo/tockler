import { app, BrowserWindow, dialog } from "electron"
import { autoUpdater } from "electron-updater"
import * as os from "os"
import config from "./config"

export default class AppUpdater {
  constructor() {
  }

  static init() {
    if (config.isDev) {
      return
    }

    const platform = os.platform()
    if (platform === "linux") {
      return
    }

    const log = require("electron-log")
    log.transports.file.level = "info"
    autoUpdater.logger = log

    autoUpdater.signals.updateDownloaded(versionInfo => {
      const dialogOptions = {
        type: "question",
        defaultId: 0,
        message: `The update is ready to install, Version ${versionInfo.version} has been downloaded and will be automatically installed when you click OK`
      }
      let focusedWindow = BrowserWindow.getFocusedWindow()

      BrowserWindow.getAllWindows()
      dialog.showMessageBox(focusedWindow, dialogOptions, function () {
        setImmediate(() => {
          app.removeAllListeners("window-all-closed")
          if (focusedWindow != null) {
            focusedWindow.close()
          }
          autoUpdater.quitAndInstall(false)
        })
      })
    })
    autoUpdater.checkForUpdates()
  }
}

// function notify(title: string, message: string) {
//   let windows = BrowserWindowElectron.getAllWindows()
//   if (windows.length == 0) {
//     return
//   }
//
//   windows[0].webContents.send("notify", title, message)
// }