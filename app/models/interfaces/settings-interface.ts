import { Instance } from "sequelize";

export interface SettingsAttributes {
  name?: string;
  jsonData?: string;
}

export interface SettingsInstance extends Instance<SettingsAttributes> {
  dataValues: SettingsAttributes;
  name?: string;
  jsonData?: string;
  jsonDataParsed?: string;
}
