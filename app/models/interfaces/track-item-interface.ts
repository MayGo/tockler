import { Instance } from "sequelize";

export interface TrackItemAttributes {
  app?: string;
  taskName?: string;
  title?: string;
  color?: string;
  beginDate?: Date;
  endDate?: Date;
}

export interface TrackItemInstance extends Instance<TrackItemAttributes> {
  dataValues: TrackItemAttributes;
}
