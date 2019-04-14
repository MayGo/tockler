import { TrackItemAttributes, TrackItemInstance } from './interfaces/track-item-interface';
import { AppSettingAttributes, AppSettingInstance } from './interfaces/app-setting-interface';
import { SettingsAttributes, SettingsInstance } from './interfaces/settings-interface';
import AppSettingModel from './app-setting-model';
import TrackItemModel from './track-item-model';
import SettingsModel from './settings-model';
import * as SequelizeStatic from 'sequelize';
import * as SequelizeMock from 'sequelize-mock';
import config from '../config';
import { Sequelize } from 'sequelize';

interface CustomModel<TInstance, TAttributes>
    extends SequelizeStatic.Model<TInstance, TAttributes> {
    $queueResult(s: any): any;
    $clearQueue();
}
export interface SequelizeModels {
    TrackItem: CustomModel<TrackItemInstance, TrackItemAttributes>;
    AppSetting: CustomModel<AppSettingInstance, AppSettingAttributes>;
    Settings: CustomModel<SettingsInstance, SettingsAttributes>;
}

class Database {
    private _models: SequelizeModels;
    private _sequelize: Sequelize;

    constructor() {
        let dbConfig = config.databaseConfig;

        if (config.isTest === true) {
            this._sequelize = new SequelizeMock('', '', '', {
                autoQueryFallback: false,
            });
        } else {
            this._sequelize = new SequelizeStatic(
                dbConfig.database,
                dbConfig.username,
                dbConfig.password,
                {
                    dialect: 'sqlite',
                    storage: dbConfig.outputPath,
                    logging: false,
                },
            );
        }

        let modules = [AppSettingModel, TrackItemModel, SettingsModel];

        this._models = {} as any;

        // Initialize models
        modules.forEach(module => {
            const model = module(this._sequelize);
            this._models[(model as any).name] = model;
        });

        // Apply associations
        Object.keys(this._models).forEach(key => {
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
