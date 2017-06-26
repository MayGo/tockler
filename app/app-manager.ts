import { appSettingService } from './services/app-setting-service';
import { trackItemService } from './services/track-item-service';
import { app, BrowserWindow, dialog, ipcMain } from "electron";
import config from "./config";
import { sequelize } from "./models/index";

import { logManager } from "./log-manager";
import { settingsService } from "./services/settings-service";
var logger = logManager.getLogger('AppManager');

export default class AppManager {

  static init() {
    AppManager.syncDb();
    AppManager.initGlobalClasses();
    AppManager.initIpc();
  
  }

  static initIpc() {
    ipcMain.on('TIMELINE_LOAD_DAY_REQUEST', (event, startDate, taskName) => {
      console.log('TIMELINE_LOAD_DAY_REQUEST', startDate, taskName);
      trackItemService.findAllFromDay(startDate, taskName).then((items) => event.sender.send('TIMELINE_LOAD_DAY_RESPONSE', startDate, taskName, items))
    });
  }

  static syncDb() {
    sequelize.sync().then(() => {
      logger.info("Database synced.");

    }).catch((error: Error) => {
      logger.error(error.message);
    });
  }

  static initGlobalClasses() {
    // Share configs between multiple windows
    (<any>global).shared = config;

    (<any>global).SettingsService = settingsService;
    (<any>global).AppSettingService = appSettingService;
    (<any>global).TrackItemService = trackItemService;
  }
}
