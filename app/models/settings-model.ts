/* tslint:disable:variable-name */

import * as SequelizeStatic from "sequelize";
import { DataTypes, Sequelize } from "sequelize";
import { SettingsAttributes, SettingsInstance } from "./interfaces/settings-interface";

export default function (sequelize: Sequelize, dataTypes: DataTypes):
  SequelizeStatic.Model<SettingsInstance, SettingsAttributes> {
  let Settings = sequelize.define<SettingsInstance, SettingsAttributes>('Settings', {
    name: Sequelize.STRING,
    jsonData: { type: Sequelize.TEXT, defaultValue: '{}' }
  });

  return Settings;
}
