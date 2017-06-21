
import { TrackItemAttributes, TrackItemInstance } from './interfaces/track-item-interface';
import { AppItemAttributes, AppItemInstance } from './interfaces/app-item-interface';
import { SettingsAttributes, SettingsInstance } from './interfaces/settings-interface';
import AppItemModel from './app-item-model';
import TrackItemModel from './track-item-model';
import SettingsModel from './settings-model';
import * as fs from "fs";
import * as path from "path";
import * as SequelizeStatic from "sequelize";
import config from "../config";


import { DataTypes, Sequelize } from "sequelize";

export interface SequelizeModels {
  TrackItem: SequelizeStatic.Model<TrackItemInstance, TrackItemAttributes>;
  AppItem: SequelizeStatic.Model<AppItemInstance, AppItemAttributes>;
  Settings: SequelizeStatic.Model<SettingsInstance, SettingsAttributes>;
}

class Database {
  private _basename: string;
  private _models: SequelizeModels;
  private _sequelize: Sequelize;

  constructor() {

    let dbConfig = config.databaseConfig;

    this._sequelize = new SequelizeStatic(dbConfig.database, dbConfig.username,
      dbConfig.password, {
        dialect: 'sqlite',
        storage: dbConfig.outputPath,
        logging: false
      });

    this._basename = path.basename("index.js");

    let modules = [
      AppItemModel,
      TrackItemModel,
      SettingsModel,
    ];
    this._models = ({} as any);
    console.log(__dirname)

    // Initialize models
    modules.forEach((module) => {
      const model = module(this._sequelize);
      this._models[(model as any).name] = model;
    });

    // Apply associations
    Object.keys(this._models).forEach((key) => {
      if ('associate' in this._models[key]) {
        this._models[key].associate(this._models);
      }
    });



  }

  getModels() {
    return this._models;
  }

  getSequelize() {
    return this._sequelize;
  }
}

const database = new Database();
export const models = database.getModels();
export const sequelize = database.getSequelize();
