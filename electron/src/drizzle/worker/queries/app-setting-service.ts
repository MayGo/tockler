import { eq } from 'drizzle-orm';
import randomcolor from 'randomcolor';
import { AppSetting, appSettings, NewAppSetting } from '../../schema';
import { db } from '../db';

const logger = console;

const cache: Record<string, AppSetting | null> = {};

export async function createAppSetting(appSettingAttributes: NewAppSetting): Promise<AppSetting> {
    const [appSetting] = (await db.insert(appSettings).values(appSettingAttributes).returning()) || [null];

    const { name } = appSettingAttributes;
    if (name) {
        cache[name] = appSetting || null;
    }

    logger.debug(`Created appSetting with title ${appSettingAttributes.name}.`);
    return appSetting!;
}

export async function retrieveAppSettings(name: string): Promise<AppSetting | null> {
    if (cache[name]) {
        return cache[name];
    }

    const results = await db.select().from(appSettings).where(eq(appSettings.name, name));

    const item = results.length > 0 ? results[0] : null;
    cache[name] = item || null;
    logger.debug('Retrieved appSetting:', name);

    return item || null;
}

export async function getAppColor(appName: string): Promise<string> {
    console.warn('getAppColor', appName);
    const appSetting = await retrieveAppSettings(appName);

    if (appSetting?.color) {
        console.warn('getAppColor:::', appSetting.color);
        return appSetting.color;
    } else {
        const color = randomcolor();
        console.warn('getAppColor randomcolor', color);
        const item = await createAppSetting({ name: appName, color: color });
        logger.debug('Created color item to DB:', item);

        return color;
    }
}

export async function changeColorForApp(appName: string, color: string) {
    logger.debug('Changing color with params:', appName, color);

    const appSetting = await retrieveAppSettings(appName);

    if (appSetting) {
        const [updated] = await db
            .update(appSettings)
            .set({ color })
            .where(eq(appSettings.id, appSetting.id))
            .returning();

        // Update cache
        if (updated) {
            cache[appName] = updated;
        }

        logger.debug('Saved color item to DB:', updated);
        return updated;
    } else {
        const item = await createAppSetting({ name: appName, color: color });
        logger.debug('Created color item to DB:', item);
        return item;
    }
}

export const appSettingService = {
    createAppSetting,
    retrieveAppSettings,
    getAppColor,
    changeColorForApp,
};

export type AppSettingService = typeof appSettingService;
