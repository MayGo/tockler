import { Instance } from 'sequelize';

export interface AppSettingAttributes {
    name?: string;
    color?: string;
}

export interface AppSettingInstance extends Instance<AppSettingAttributes> {
    dataValues: AppSettingAttributes;
    name: string;
    color: string;
}
