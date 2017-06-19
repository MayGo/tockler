
import { TrackItemAttributes, TrackItemInstance } from './interfaces/track-item-interface';
import { AppItemAttributes, AppItemInstance } from './interfaces/app-item-interface';
import { SettingsAttributes, SettingsInstance } from './interfaces/settings-interface';
import * as fs from "fs";
import * as path from "path";
import * as SequelizeStatic from "sequelize";
import config from "../config";


import LogManager from "../log-manager";
const logger = LogManager.getLogger('Database');
import { Sequelize } from "sequelize";

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

    this._basename = path.basename(module.filename);
    this._models = ({} as any);

    fs.readdirSync(__dirname).filter((file: string) => {
      return (file !== this._basename) && (file !== "interfaces");
    }).forEach((file: string) => {
      let model = this._sequelize.import(path.join(__dirname, file));
      this._models[(model as any).name] = model;
    });

    Object.keys(this._models).forEach((modelName: string) => {
      if (typeof this._models[modelName].associate === "function") {
        this._models[modelName].associate(this._models);
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
