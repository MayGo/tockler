import { Instance } from "sequelize";

export interface AppItemAttributes {
  name?: string;
  color?: string;
}

export interface AppItemInstance extends Instance<AppItemAttributes> {
  dataValues: AppItemAttributes;
  color: string;
}
