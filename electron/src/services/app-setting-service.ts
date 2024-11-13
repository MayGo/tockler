import { logManager } from '../log-manager';
import randomcolor from 'randomcolor';
import { AppSetting } from '../models/AppSetting';

export class AppSettingService {
    logger = logManager.getLogger('AppSettingService');

    cache: any = {};

    async createAppSetting(appSettingAttributes: any): Promise<AppSetting> {
        const appSetting: AppSetting = await AppSetting.query().insert(appSettingAttributes);

        const { name } = appSettingAttributes;
        this.cache[name] = appSetting;
        this.logger.debug(`Created appSetting with title ${appSettingAttributes.name}.`);
        return appSetting;
    }

    async retrieveAppSettings(name: string) {
        if (this.cache[name]) {
            return this.cache[name];
        }

        const appSettings = await AppSetting.query().where('name', name);

        const item = appSettings.length > 0 ? appSettings[0] : null;
        this.cache[name] = item;
        this.logger.debug('Retrieved all appSettings.');

        return item;
    }

    async getAppColor(appName: string) {
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

        const appSetting = await this.retrieveAppSettings(appName);

        if (appSetting) {
            await appSetting.$query().patch({
                color,
            });

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
