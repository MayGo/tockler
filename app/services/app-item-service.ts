import { logManager } from "../log-manager";
import { models, sequelize } from "../models/index";
import { AppItemAttributes, AppItemInstance } from "../models/interfaces/app-item-interface";
import { Transaction } from "sequelize";
import * as randomcolor from "randomcolor";


export class AppItemService {
  logger = logManager.getLogger('AppItemService');

  createAppItem(appItemAttributes: AppItemAttributes): Promise<AppItemInstance> {
    let promise = new Promise<AppItemInstance>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.AppItem.create(appItemAttributes).then((appItem: AppItemInstance) => {
          this.logger.info(`Created appItem with title ${appItemAttributes.name}.`);
          resolve(appItem);
        }).catch((error: Error) => {
          this.logger.error(error.message);
          reject(error);
        });
      });
    });

    return promise;
  }

  retrieveAppItem(name: string): Promise<AppItemInstance> {
    let promise = new Promise<AppItemInstance>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.AppItem.findOne({ where: { name: name } }).then((appItem: AppItemInstance) => {
          if (appItem) {
            this.logger.info(`Retrieved appItem with name ${name}.`);
          } else {
            this.logger.info(`AppItem with name ${name} does not exist.`);
          }
          resolve(appItem);
        }).catch((error: Error) => {
          this.logger.error(error.message);
          reject(error);
        });
      });
    });

    return promise;
  }

  retrieveAppItems(params: any): Promise<Array<AppItemInstance>> {
    let promise = new Promise<Array<AppItemInstance>>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.AppItem.findAll(params).then((appItems: Array<AppItemInstance>) => {
          this.logger.debug("Retrieved all appItems.");
          resolve(appItems);
        }).catch((error: Error) => {
          this.logger.error(error.message);
          reject(error);
        });
      });
    });

    return promise;
  }

  updateAppItem(name: string, appItemAttributes: any): Promise<void> {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.AppItem.update(appItemAttributes, { where: { name: name } })
          .then((results: [number, Array<AppItemInstance>]) => {
            if (results.length > 0) {
              this.logger.info(`Updated appItem with name ${name}.`);
            } else {
              this.logger.info(`AppItem with name ${name} does not exist.`);
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

  deleteAppItem(name: string): Promise<void> {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.AppItem.destroy({ where: { name: name } }).then((afffectedRows: number) => {
          if (afffectedRows > 0) {
            this.logger.info(`Deleted appItem with name ${name}`);
          } else {
            this.logger.info(`AppItem with name ${name} does not exist.`);
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
      this.retrieveAppItems(params).then((appItems: Array<AppItemInstance>) => {
        if (appItems.length > 0) {
          resolve(appItems[0].color);
        } else {
          var color = randomcolor();
          this.createAppItem({ name: appName, color: color }).then((item) => {
            console.log("Created color item to DB:", item);
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

    console.log("Quering color with params:", params);

    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      this.retrieveAppItems(params).then((appItems: Array<AppItemInstance>) => {
        if (appItems.length > 0) {
          appItems[0].color = color;
          appItems[0].save();
          console.log("Saved color item to DB:", appItems[0]);

          resolve(appItems[0]);
        } else {
          this.createAppItem({ name: appName, color: color }).then((item) => {
            console.log("Created color item to DB:", item);
            resolve(item);
          });

        }
      });
    });
    return promise;
  }
}

export const appItemService = new AppItemService();
