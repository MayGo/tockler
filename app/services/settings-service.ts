import { TrackItemService } from './track-item-service';
const LogManager = require("./log-manager.js");
const logger = LogManager.getLogger('Database');

import { models, sequelize } from "../models/index";
import { SettingsAttributes, SettingsInstance } from "../models/interfaces/settings-interface";
import { Transaction } from "sequelize";

export class SettingsService {
  private trackItemService: TrackItemService;
  constructor() {
    this.trackItemService = new TrackItemService();
  }
  createSettings(settingsAttributes: SettingsAttributes): Promise<SettingsInstance> {
    let promise = new Promise<SettingsInstance>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.Settings.create(settingsAttributes).then((settings: SettingsInstance) => {
          logger.info(`Created settings with title ${settingsAttributes.name}.`);
          resolve(settings);
        }).catch((error: Error) => {
          logger.error(error.message);
          reject(error);
        });
      });
    });

    return promise;
  }

  retrieveSettings(name: string): Promise<SettingsInstance> {
    let promise = new Promise<SettingsInstance>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.Settings.findOne({ where: { name: name } }).then((settings: SettingsInstance) => {
          if (settings) {
            logger.info(`Retrieved settings with name ${name}.`);
          } else {
            logger.info(`Settings with name ${name} does not exist.`);
          }
          resolve(settings);
        }).catch((error: Error) => {
          logger.error(error.message);
          reject(error);
        });
      });
    });

    return promise;
  }

  retrieveSettingss(): Promise<Array<SettingsInstance>> {
    let promise = new Promise<Array<SettingsInstance>>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.Settings.findAll().then((settingss: Array<SettingsInstance>) => {
          logger.info("Retrieved all settingss.");
          resolve(settingss);
        }).catch((error: Error) => {
          logger.error(error.message);
          reject(error);
        });
      });
    });

    return promise;
  }

  updateSettings(name: string, settingsAttributes: any): Promise<void> {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.Settings.update(settingsAttributes, { where: { name: name } })
          .then((results: [number, Array<SettingsInstance>]) => {
            if (results.length > 0) {
              logger.info(`Updated settings with name ${name}.`);
            } else {
              logger.info(`Settings with name ${name} does not exist.`);
            }
            resolve(null);
          }).catch((error: Error) => {
            logger.error(error.message);
            reject(error);
          });
      });
    });

    return promise;
  }

  deleteSettings(name: string): Promise<void> {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.Settings.destroy({ where: { name: name } }).then((afffectedRows: number) => {
          if (afffectedRows > 0) {
            logger.info(`Deleted settings with name ${name}`);
          } else {
            logger.info(`Settings with name ${name} does not exist.`);
          }
          resolve(null);
        }).catch((error: Error) => {
          logger.error(error.message);
          reject(error);
        });
      });
    });

    return promise;
  }

  findByName(name: string) {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      models.Settings.findCreateFind({
        where: {
          name: name
        }
      }).then((items) => {
        var item = items[0];
        item.jsonDataParsed = JSON.parse(item.jsonData);
        resolve(item);
      });
    });
    return promise;
  }

  updateByName(name: string, jsonData: any) {

    return models.Settings.update({ jsonData: JSON.stringify(jsonData) }, {
      where: {
        name: name
      }
    })
  }

  fetchWorkSettings() {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      this.findByName('WORK_SETTINGS').then((item: any) => {
        //console.log('Fetched work item:', item);
        resolve(item.jsonDataParsed)
      });
    });
    return promise;
  }

  fetchAnalyserSettings() {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      this.findByName('ANALYSER_SETTINGS').then((item: any) => {
        //console.log('Fetched work item:', item);
        resolve(item.jsonDataParsed)
      }).catch((error: Error) => {
        logger.error(error.message);
        reject(error);
      })
    });
    return promise;
  }

  getRunningLogItem() {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      this.findByName('RUNNING_LOG_ITEM').then((item: any) => {
        //console.log("got RUNNING_LOG_ITEM: ", item);
        if (item.jsonDataParsed.id) {
          models.TrackItem.findById(item.jsonDataParsed.id).then((logItem) => {
            //console.log("resolved log item RUNNING_LOG_ITEM: ", logItem);
            resolve(logItem)
          })
        } else {
          console.log("No RUNNING_LOG_ITEM ref id");
          resolve();
        }
      });
    });
    return promise;
  }

  saveRunningLogItemReferemce(logItemId) {
    this.updateByName('RUNNING_LOG_ITEM', { id: logItemId }).then((item) => {
      console.log("Updated RUNNING_LOG_ITEM!", item);
    });
    if (logItemId) {
      //Lets update items end date
      this.trackItemService.updateEndDateWithNow(logItemId).then((item) => {
        console.log("Updated log item to DB:", item);
      });
    }
  };
}

export const settingsService = new SettingsService();
