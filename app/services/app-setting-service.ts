import { logManager } from "../log-manager";
import { models, sequelize } from "../models/index";
import { AppSettingAttributes, AppSettingInstance } from "../models/interfaces/app-setting-interface";
import { Transaction } from "sequelize";
import * as randomcolor from "randomcolor";


export class AppSettingService {
  logger = logManager.getLogger('AppSettingService');

  createAppSetting(appSettingAttributes: AppSettingAttributes): Promise<AppSettingInstance> {
    let promise = new Promise<AppSettingInstance>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.AppSetting.create(appSettingAttributes).then((appSetting: AppSettingInstance) => {
          this.logger.info(`Created appSetting with title ${appSettingAttributes.name}.`);
          resolve(appSetting);
        }).catch((error: Error) => {
          this.logger.error(error.message);
          reject(error);
        });
      });
    });

    return promise;
  }

  retrieveAppSetting(name: string): Promise<AppSettingInstance> {
    let promise = new Promise<AppSettingInstance>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.AppSetting.findOne({ where: { name: name } }).then((appSetting: AppSettingInstance) => {
          if (appSetting) {
            this.logger.info(`Retrieved appSetting with name ${name}.`);
          } else {
            this.logger.info(`AppSetting with name ${name} does not exist.`);
          }
          resolve(appSetting);
        }).catch((error: Error) => {
          this.logger.error(error.message);
          reject(error);
        });
      });
    });

    return promise;
  }

  retrieveAppSettings(params: any): Promise<Array<AppSettingInstance>> {
    let promise = new Promise<Array<AppSettingInstance>>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.AppSetting.findAll(params).then((appSettings: Array<AppSettingInstance>) => {
          this.logger.debug("Retrieved all appSettings.");
          resolve(appSettings);
        }).catch((error: Error) => {
          this.logger.error(error.message);
          reject(error);
        });
      });
    });

    return promise;
  }

  updateAppSetting(name: string, appSettingAttributes: any): Promise<void> {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.AppSetting.update(appSettingAttributes, { where: { name: name } })
          .then((results: [number, Array<AppSettingInstance>]) => {
            if (results.length > 0) {
              this.logger.info(`Updated appSetting with name ${name}.`);
            } else {
              this.logger.info(`AppSetting with name ${name} does not exist.`);
            }
            resolve(null);
          }).catch((error: Error) => {
            this.logger.error(error.message);
            reject(error);
          });
      });
    });

    return promise;
  }

  deleteAppSetting(name: string): Promise<void> {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.AppSetting.destroy({ where: { name: name } }).then((afffectedRows: number) => {
          if (afffectedRows > 0) {
            this.logger.info(`Deleted appSetting with name ${name}`);
          } else {
            this.logger.info(`AppSetting with name ${name} does not exist.`);
          }
          resolve(null);
        }).catch((error: Error) => {
          this.logger.error(error.message);
          reject(error);
        });
      });
    });

    return promise;
  }

  getAppColor(appName) {

    var params = {
      where: {
        name: appName
      }
    };
    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      this.retrieveAppSettings(params).then((appSettings: Array<AppSettingInstance>) => {
        if (appSettings.length > 0) {
         
          resolve(appSettings[0].color);
        } else {
          var color = randomcolor();
          this.createAppSetting({ name: appName, color: color }).then((item) => {
            this.logger.info("Created color item to DB:", item);
          });
          resolve(color);
        }
      });
    });

    return promise;
  }

  changeColorForApp(appName: string, color: string) {


    var params = {
      where: {
        name: appName
      }
    };

    this.logger.debug("Quering color with params:", params);

    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      this.retrieveAppSettings(params).then((appSettings: Array<AppSettingInstance>) => {
        if (appSettings.length > 0) {
          appSettings[0].color = color;
          appSettings[0].save();
          this.logger.info("Saved color item to DB:", appSettings[0]);

          resolve(appSettings[0]);
        } else {
          this.createAppSetting({ name: appName, color: color }).then((item) => {
            this.logger.info("Created color item to DB:", item);
            resolve(item);
          });

        }
      });
    });
    return promise;
  }
}

export const appSettingService = new AppSettingService();
