import { TrackItemInstance } from '../models/interfaces/track-item-interface';
import { trackItemService } from './track-item-service';
import { logManager } from "../log-manager";

import { models, sequelize } from "../models/index";
import { SettingsAttributes, SettingsInstance } from "../models/interfaces/settings-interface";
import { Transaction } from "sequelize";

export class SettingsService {
  logger = logManager.getLogger('SettingsService');

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
