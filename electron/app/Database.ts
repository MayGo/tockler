import * as SequelizeMock from 'sequelize-mock';
import config from './config';
import { Sequelize } from 'sequelize-typescript';
import { AppSetting } from './models/AppSetting';
import { Settings } from './models/Settings';
import { TrackItem } from './models/TrackItem';

class Database {
    private _sequelize: Sequelize;

    constructor() {
        let dbConfig = config.databaseConfig;

        if (config.isTest === true) {
            this._sequelize = new SequelizeMock('', '', '', {
                autoQueryFallback: false,
            });
        } else {
            this._sequelize = new Sequelize({
                database: dbConfig.database,
                dialect: 'sqlite',
                username: dbConfig.username,
                password: dbConfig.password,
                storage: dbConfig.outputPath,
                logging: false,
            });
            this._sequelize.addModels([AppSetting, Settings, TrackItem]);
            console.info(`Models path ${__dirname + '/models'}`);
        }
    }

    getSequelize() {
        return this._sequelize;
    }
}

const database = new Database();
export const sequelize = database.getSequelize();
