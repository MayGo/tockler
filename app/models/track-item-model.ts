import * as SequelizeStatic from "sequelize";
import { DataTypes, Sequelize } from "sequelize";
import { TrackItemAttributes, TrackItemInstance } from "./interfaces/track-item-interface";

export default function (sequelize: Sequelize, dataTypes: DataTypes):
  SequelizeStatic.Model<TrackItemInstance, TrackItemAttributes> {
  let TrackItem = sequelize.define<TrackItemInstance, TrackItemAttributes>('TrackItem', {
    app: Sequelize.STRING,
    taskName: Sequelize.STRING,
    title: Sequelize.STRING,
    color: Sequelize.STRING,
    beginDate: Sequelize.DATE,
    endDate: {
      type: Sequelize.DATE,
      validate: {
        isAfter: function (value) {
          if (this.beginDate > value) {
            throw new Error('BeginDate must be before endDate! ' + this.beginDate + ' - ' + value);
          }
        }
      }
    }
  }, { timestamps: false });

  return TrackItem;
}