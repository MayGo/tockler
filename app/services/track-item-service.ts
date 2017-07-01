import { logManager } from "../log-manager";

import { models, sequelize } from "../models/index";
import { TrackItemAttributes, TrackItemInstance } from "../models/interfaces/track-item-interface";
import { Transaction } from "sequelize";
import * as moment from "moment";
import { settingsService } from "./settings-service";

export class TrackItemService {

  logger = logManager.getLogger('TrackItemService');

  async createTrackItem(trackItemAttributes: TrackItemAttributes): Promise<TrackItemInstance> {
    let trackItem = await models.TrackItem.create(trackItemAttributes);
    this.logger.info(`Created trackItem :`, trackItem.toJSON());
    return trackItem;
  }

  async updateTrackItem(name: string, trackItemAttributes: any): Promise<[number, Array<TrackItemInstance>]> {
    let results = await models.TrackItem.update(trackItemAttributes, { where: { name: name } });

    if (results.length > 0) {
      this.logger.info(`Updated trackItem with name ${name}.`);
    } else {
      this.logger.info(`TrackItem with name ${name} does not exist.`);
    }

    return results;
  }

  findAllItems(from, to, taskName, searchStr, paging) {

    var order = paging.order || 'beginDate';
    var orderSort = paging.orderSort || 'ASC';
    if (order.startsWith('-')) {
      order = order.substring(1);
      orderSort = 'DESC';
    }

    var limit = paging.limit || 10;
    var offset = paging.offset || 0;
    if (paging.page) {
      offset = (paging.page - 1) * limit;
    }

    var where: any = {
      endDate: {
        $gte: from,
        $lt: to
      },
      taskName: taskName
    };

    if (searchStr) {
      where.title = {
        $like: '%' + searchStr + '%'
      };
    }

    return models.TrackItem.findAndCountAll({
      where: where,
      raw: false,
      limit: limit,
      offset: offset,
      order: [
        [order, orderSort]
      ]
    });
  }

  findAllDayItems(from, to, taskName) {

    return models.TrackItem.findAll({
      where: {
        endDate: {
          $gte: from,
          $lte: to
        },
        taskName: taskName
      },
      raw: true,
      order: [
        ['beginDate', 'ASC']
      ]
    });
  }

  findAllFromDay(day, taskName) {

    var to = moment(day).add(1, 'days');
    console.log('findAllFromDay ' + taskName + ' from:' + day + ', to:' + to.toDate());

    return this.findAllDayItems(day, to.toDate(), taskName);
  }

  findFirstLogItems() {
    return models.TrackItem.findAll({
      where: {
        taskName: 'LogTrackItem'
      },
      limit: 10,
      order: [
        ['beginDate', 'DESC']
      ]
    });
  }

  findLastOnlineItem() {
    //ONLINE item can be just inserted, we want old one.
    // 2 seconds should be enough
    let beginDate = moment().subtract(5, 'seconds').toDate();

    return models.TrackItem.findAll({
      where: {
        app: 'ONLINE',
        beginDate: {
          $lte: beginDate
        },
        taskName: 'StatusTrackItem'
      },
      limit: 1,
      order: [
        ['endDate', 'DESC']
      ]
    });
  }

  async updateItem(itemData: TrackItemAttributes, id: number): Promise<[number, TrackItemInstance[]]> {

    let item = await models.TrackItem.update({
      app: itemData.app,
      title: itemData.title,
      color: itemData.color,
      beginDate: itemData.beginDate,
      endDate: itemData.endDate
    }, {
        fields: ['beginDate', 'endDate', 'app', 'title', 'color'],
        where: { id: id }
      });
    return item;
  }

  updateColorForApp(appName, color) {

    console.log("Updating app color:", appName, color);

    return models.TrackItem.update({ color: color }, {
      fields: ['color'],
      where: {
        app: appName
      }
    }).catch((error: Error) => {
      this.logger.error(error.message);

    });
  }

  findById(id) {

    return models.TrackItem.findById(id);
  }

  updateEndDateWithNow(id) {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      models.TrackItem.update({
        endDate: new Date()
      }, {
          fields: ['endDate'],
          where: { id: id }
        }).then(() => {
          console.log("Saved track item to DB with now:", id);
          resolve(id);
        }).catch((error: Error) => {
          this.logger.error(error.message);
          reject(error);
        });
    });
    return promise;
  }

  deleteById(id) {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {

      models.TrackItem.destroy({
        where: { id: id }
      }).then(() => {
        console.log("Deleted track item with ID:", id);
        resolve(id);
      }).catch((error: Error) => {
        this.logger.error(error.message);
        reject(error);
      });
    });
    return promise;
  }

  deleteByIds(ids) {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {

      models.TrackItem.destroy({
        where: {
          id: {
            $in: ids
          }
        }
      }).then(() => {
        console.log("Deleted track items with IDs:", ids);
        resolve(ids);
      }).catch((error: Error) => {
        this.logger.error(error.message);
        reject(error);
      });
    });
    return promise;
  }

  async findRunningLogItem() {
    let item = await settingsService.findByName('RUNNING_LOG_ITEM');

    if (!item) {
      this.logger.debug("No RUNNING_LOG_ITEM.");
      return null;
    }

    this.logger.debug("Found RUNNING_LOG_ITEM config: ", item.toJSON());

    let logTrackItemId = item.jsonDataParsed.id;
    if (!logTrackItemId) {
      this.logger.debug("No RUNNING_LOG_ITEM ref id");
      return null;
    }

    let logItem = await trackItemService.findById(logTrackItemId);
    if (!logItem) {
      this.logger.error("RUNNING_LOG_ITEM not found by id:", logTrackItemId);
      return null;
    }
    return logItem;
  }
}

export const trackItemService = new TrackItemService();
