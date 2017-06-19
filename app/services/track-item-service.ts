const LogManager = require("./log-manager.js");
const logger = LogManager.getLogger('Database');

import { models, sequelize } from "../models/index";
import { TrackItemAttributes, TrackItemInstance } from "../models/interfaces/track-item-interface";
import { Transaction } from "sequelize";
import * as moment from "moment";

export class TrackItemService {
  createTrackItem(trackItemAttributes: TrackItemAttributes): Promise<TrackItemInstance> {
    let promise = new Promise<TrackItemInstance>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.TrackItem.create(trackItemAttributes).then((trackItem: TrackItemInstance) => {
          logger.info(`Created trackItem with title ${trackItemAttributes.title}.`);
          resolve(trackItem);
        }).catch((error: Error) => {
          logger.error(error.message);
          reject(error);
        });
      });
    });

    return promise;
  }

  retrieveTrackItem(name: string): Promise<TrackItemInstance> {
    let promise = new Promise<TrackItemInstance>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.TrackItem.findOne({ where: { name: name } }).then((trackItem: TrackItemInstance) => {
          if (trackItem) {
            logger.info(`Retrieved trackItem with name ${name}.`);
          } else {
            logger.info(`TrackItem with name ${name} does not exist.`);
          }
          resolve(trackItem);
        }).catch((error: Error) => {
          logger.error(error.message);
          reject(error);
        });
      });
    });

    return promise;
  }

  retrieveTrackItems(): Promise<Array<TrackItemInstance>> {
    let promise = new Promise<Array<TrackItemInstance>>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.TrackItem.findAll().then((trackItems: Array<TrackItemInstance>) => {
          logger.info("Retrieved all trackItems.");
          resolve(trackItems);
        }).catch((error: Error) => {
          logger.error(error.message);
          reject(error);
        });
      });
    });

    return promise;
  }

  updateTrackItem(name: string, trackItemAttributes: any): Promise<void> {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.TrackItem.update(trackItemAttributes, { where: { name: name } })
          .then((results: [number, Array<TrackItemInstance>]) => {
            if (results.length > 0) {
              logger.info(`Updated trackItem with name ${name}.`);
            } else {
              logger.info(`TrackItem with name ${name} does not exist.`);
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

  deleteTrackItem(name: string): Promise<void> {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      sequelize.transaction((t: Transaction) => {
        return models.TrackItem.destroy({ where: { name: name } }).then((afffectedRows: number) => {
          if (afffectedRows > 0) {
            logger.info(`Deleted trackItem with name ${name}`);
          } else {
            logger.info(`TrackItem with name ${name} does not exist.`);
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
      }
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

    return module.exports.findAllDayItems(day, to.toDate(), taskName);
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

  createItem = function (itemData) {
    'use strict';
    return this.createTrackItem(itemData);
  }

  updateItem = function (itemData) {

    let promise = new Promise<void>((resolve: Function, reject: Function) => {
      models.TrackItem.update({
        app: itemData.app,
        title: itemData.title,
        color: itemData.color,
        beginDate: itemData.beginDate,
        endDate: itemData.endDate
      }, {
          fields: ['beginDate', 'endDate', 'app', 'title', 'color'],
          where: { id: itemData.id }
        }).then(() => {
          //console.log("Saved track item to DB:", itemData.id);
          resolve(itemData);
        }).catch((error: Error) => {
          logger.error(error.message);
          reject(error);
        })
    });
    return promise;
  }

  updateColorForApp = function (appName, color) {

    console.log("Updating app color:", appName, color);

    return models.TrackItem.update({ color: color }, {
      fields: ['color'],
      where: {
        app: appName
      }
    }).catch((error: Error) => {
      logger.error(error.message);

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
        }).then(function () {
          console.log("Saved track item to DB with now:", id);
          resolve(id);
        }).catch((error: Error) => {
          logger.error(error.message);
          reject(error);
        });
    });
    return promise;
  }

  deleteById(id) {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {

      models.TrackItem.destroy({
        where: { id: id }
      }).then(function () {
        console.log("Deleted track item with ID:", id);
        resolve(id);
      }).catch((error: Error) => {
        logger.error(error.message);
        reject(error);
      });
    });
    return promise;
  }

  deleteByIds = function (ids) {
    let promise = new Promise<void>((resolve: Function, reject: Function) => {

      models.TrackItem.destroy({
        where: {
          id: {
            $in: ids
          }
        }
      }).then(function () {
        console.log("Deleted track items with IDs:", ids);
        resolve(ids);
      }).catch((error: Error) => {
        logger.error(error.message);
        reject(error);
      });
    });
    return promise;
  }
}

export const trackItemService = new TrackItemService();
