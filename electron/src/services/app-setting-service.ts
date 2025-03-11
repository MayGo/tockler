import { eq } from 'drizzle-orm';
import randomcolor from 'randomcolor';
import { db } from '../drizzle/db';
import { AppSetting, appSettings, NewAppSetting } from '../drizzle/schema';
import { logManager } from '../utils/log-manager';

export class AppSettingService {
    logger = logManager.getLogger('AppSettingService');

    cache: Record<string, AppSetting | null> = {};

    async createAppSetting(appSettingAttributes: NewAppSetting): Promise<AppSetting> {
        const [appSetting] = (await db.insert(appSettings).values(appSettingAttributes).returning()) || [null];

        const { name } = appSettingAttributes;
        if (name) {
            this.cache[name] = appSetting || null;
        }

        this.logger.debug(`Created appSetting with title ${appSettingAttributes.name}.`);
        return appSetting!;
    }

    async retrieveAppSettings(name: string): Promise<AppSetting | null> {
        if (this.cache[name]) {
            return this.cache[name];
        }

        const results = await db.select().from(appSettings).where(eq(appSettings.name, name));

        const item = results.length > 0 ? results[0] : null;
        this.cache[name] = item || null;
        this.logger.debug('Retrieved appSetting:', name);

        return item || null;
    }

    async getAppColor(appName: string): Promise<string> {
        const appSetting = await this.retrieveAppSettings(appName);

        if (appSetting?.color) {
            return appSetting.color;
        } else {
            const color = randomcolor();
            const item = await this.createAppSetting({ name: appName, color: color });
            this.logger.debug('Created color item to DB:', item);

            return color;
        }
    }

    async changeColorForApp(appName: string, color: string) {
        this.logger.debug('Changing color with params:', appName, color);

        const appSetting = await this.retrieveAppSettings(appName);

        if (appSetting) {
            const [updated] = await db
                .update(appSettings)
                .set({ color })
                .where(eq(appSettings.id, appSetting.id))
                .returning();

            // Update cache
            if (updated) {
                this.cache[appName] = updated;
            }

            this.logger.debug('Saved color item to DB:', updated);
            return updated;
        } else {
            const item = await this.createAppSetting({ name: appName, color: color });
            this.logger.debug('Created color item to DB:', item);
            return item;
        }
    }
}

export const appSettingService = new AppSettingService();
