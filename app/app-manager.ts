import { app, BrowserWindow, dialog } from "electron"
import config from "./config"
import { sequelize } from "./models/index";

import LogManager from "./log-manager.js";
var logger = LogManager.getLogger('BackgroundService');

export default class AppManager {
  constructor() {

  }
  static init() {
    AppManager.initLogging();
    AppManager.syncDb();
  }

  static syncDb() {
    sequelize.sync().then(() => {
      logger.info("Database synced.");

    }).catch((error: Error) => {
      logger.error(error.message);
    });
  }
  static initLogging() {
    LogManager.init({ userDir: app.getPath('userData') });
  }
}
