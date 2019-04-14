/* tslint:disable:variable-name */

import * as SequelizeStatic from 'sequelize';
import { Sequelize } from 'sequelize';
import { SettingsAttributes, SettingsInstance } from './interfaces/settings-interface';

export default function(
    sequelize: Sequelize,
): SequelizeStatic.Model<SettingsInstance, SettingsAttributes> {
    let Settings = sequelize.define<SettingsInstance, SettingsAttributes>('Settings', {
        name: SequelizeStatic.STRING,
        jsonData: { type: SequelizeStatic.STRING, defaultValue: '{}' },
    });

    return Settings;
}
