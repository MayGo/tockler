import { TrackItemType } from '../../enums/track-item-type';

import { Instance } from "sequelize";

export interface TrackItemAttributes {
  app?: string;
  taskName?: TrackItemType;
  title?: string;
  color?: string;
  beginDate?: Date;
  endDate?: Date;
}

export interface TrackItemInstance extends Instance<TrackItemAttributes> {
  dataValues: TrackItemAttributes;
  id?: number;
  app?: string;
  taskName?: TrackItemType;
  title?: string;
  color?: string;
  beginDate?: Date;
  endDate?: Date;
  endDateOverride?: Date;
}
