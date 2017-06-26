import { TrackItemInstance } from '../models/interfaces/track-item-interface';
import { trackItemService } from './track-item-service';
import { logManager } from "../log-manager";

import { models, sequelize } from "../models/index";
import { SettingsAttributes, SettingsInstance } from "../models/interfaces/settings-interface";
import { Transaction } from "sequelize";

export class SettingsService {
  logger = logManager.getLogger('SettingsService');

  createSettings(settingsAttributes: SettingsAttributes): Promise<SettingsInstance> {
    let promise = new Promise<SettingsInstance>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.Settings.create(settingsAttributes).then((settings: SettingsInstance) => {
          this.logger.info(`Created settings with title ${settingsAttributes.name}.`);
          resolve(settings);
        }).catch((error: Error) => {
          this.logger.error(error.message);
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
            this.logger.info(`Retrieved settings with name ${name}.`);
          } else {
            this.logger.info(`Settings with name ${name} does not exist.`);
          }
          resolve(settings);
        }).catch((error: Error) => {
          this.logger.error(error.message);
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
          this.logger.info("Retrieved all settingss.");
          resolve(settingss);
        }).catch((error: Error) => {
          this.logger.error(error.message);
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
              this.logger.info(`Updated settings with name ${name}.`);
            } else {
              this.logger.info(`Settings with name ${name} does not exist.`);
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

  deleteSettings(name: string): Promise<void> {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.Settings.destroy({ where: { name: name } }).then((afffectedRows: number) => {
          if (afffectedRows > 0) {
            this.logger.info(`Deleted settings with name ${name}`);
          } else {
            this.logger.info(`Settings with name ${name} does not exist.`);
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

  async findByName(name: string) {
    let items = await models.Settings.findOrCreate({
      where: {
        name: name
      }
    });
    var item = items[0];
    item.jsonDataParsed = JSON.parse(item.jsonData);
    return item;
  }

  updateByName(name: string, jsonData: any) {

    return models.Settings.update({ jsonData: JSON.stringify(jsonData) }, {
      where: {
        name: name
      }
    });
  }

  async fetchWorkSettings() {
   let item = await this.findByName('WORK_SETTINGS');
   return item.jsonDataParsed;
  }

  async fetchAnalyserSettings() {
    let item = await this.findByName('ANALYSER_SETTINGS');
    return item.jsonDataParsed;
  }

  getRunningLogItem() {
    let promise = new Promise<TrackItemInstance>((resolve: Function, reject: Function) => {
      this.findByName('RUNNING_LOG_ITEM').then((item: any) => {
        //console.log("got RUNNING_LOG_ITEM: ", item);
        if (item.jsonDataParsed.id) {
          models.TrackItem.findById(item.jsonDataParsed.id).then((logItem) => {
            //console.log("resolved log item RUNNING_LOG_ITEM: ", logItem);
            resolve(logItem);
          });
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
      trackItemService.updateEndDateWithNow(logItemId).then((item) => {
        console.log("Updated log item to DB:", item);
      });
    }
  }
}

export const settingsService = new SettingsService();
