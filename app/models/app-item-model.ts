/* tslint:disable:variable-name */

import * as SequelizeStatic from "sequelize";
import { DataTypes, Sequelize } from "sequelize";
import { AppItemAttributes, AppItemInstance } from "./interfaces/app-item-interface";

export default function (sequelize: Sequelize, dataTypes: DataTypes):
  SequelizeStatic.Model<AppItemInstance, AppItemAttributes> {
  let AppItem = sequelize.define<AppItemInstance, AppItemAttributes>('AppItem', {
    name: Sequelize.STRING,
    color: Sequelize.STRING
  }, { timestamps: false });

  return AppItem;
}
