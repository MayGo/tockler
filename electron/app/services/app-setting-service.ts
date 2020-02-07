import { logManager } from '../log-manager';
import * as randomcolor from 'randomcolor';
import { AppSetting } from '../models/AppSetting';

export class AppSettingService {
    logger = logManager.getLogger('AppSettingService');

    cache: any = {};

    async createAppSetting(appSettingAttributes: any): Promise<AppSetting> {
        const appSetting: AppSetting = await AppSetting.create(appSettingAttributes);

        const { name } = appSettingAttributes;
        this.cache[name] = appSettingAttributes;
        this.logger.info(`Created appSetting with title ${appSettingAttributes.name}.`);
        return appSetting;
    }

    async retrieveAppSettings(name): Promise<AppSetting> {
        if (this.cache[name]) {
            return this.cache[name];
        }

        const params = {
            where: {
                name,
            },
        };
        const appSettings = await AppSetting.findAll(params);

        const item = appSettings.length > 0 ? appSettings[0] : null;
        this.cache[name] = item;
        this.logger.debug('Retrieved all appSettings.');

        return item;
    }

    async getAppColor(appName) {
        const appSetting: AppSetting = await this.retrieveAppSettings(appName);
        if (appSetting) {
            return appSetting.color;
        } else {
            let color = randomcolor();
            let item = await this.createAppSetting({ name: appName, color: color });
            this.logger.debug('Created color item to DB:', item.toJSON());

            return color;
        }
    }

    async changeColorForApp(appName: string, color: string) {
        this.logger.debug('Quering color with params:', appName, color);

        const appSetting: AppSetting = await this.retrieveAppSettings(appName);

        if (appSetting) {
            appSetting.color = color;
            appSetting.save();
            this.logger.debug('Saved color item to DB:', appSetting.toJSON());

            return appSetting;
        } else {
            const item = await this.createAppSetting({ name: appName, color: color });
            this.logger.debug('Created color item to DB:', item.toJSON());
            return item;
        }
    }
}

export const appSettingService = new AppSettingService();
