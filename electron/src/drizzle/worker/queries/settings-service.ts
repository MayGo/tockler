import { eq } from 'drizzle-orm';
import { NewTrackItem, Setting, settings } from '../../schema';
import { db } from '../db';

const defaultSettings = {
    recentDaysCount: 7,
    backgroundJobInterval: 3,
};

const defaultWorkSettings = {
    hoursToWork: 8,
    sessionLength: 60,
    minBreakTime: 5,
    notificationDuration: 10,
    reNotifyInterval: 5,
    smallNotificationsEnabled: true,
};

const RUNNING_LOG_ITEM = 'RUNNING_LOG_ITEM';
const ANALYSER_ENABLED = 'ANALYSER_ENABLED';
const logger = console;

const cache: Record<string, Setting | null> = {};

async function findCreateFind(name: string): Promise<Setting> {
    const rows = await db.select().from(settings).where(eq(settings.name, name));

    if (rows.length === 0) {
        const [newSetting] = (await db.insert(settings).values({ name }).returning()) || [null];
        return newSetting!;
    } else {
        return rows[0]!;
    }
}

async function findByName(name: string): Promise<Setting | null> {
    if (cache[name]) {
        return cache[name];
    }

    const item = await findCreateFind(name);

    cache[name] = item || null;
    return item || null;
}

async function updateByName(name: string, jsonDataStr: any) {
    logger.debug('Updating Setting:', name, jsonDataStr);

    try {
        const jsonData = JSON.parse(jsonDataStr);

        let item = await findByName(name);

        if (item) {
            const [updated] = (await db
                .update(settings)
                .set({ jsonData: JSON.stringify(jsonData) })
                .where(eq(settings.id, item.id))
                .returning()) || [null];

            delete cache[name];

            if (name === 'WORK_SETTINGS') {
                const workSettings = parseWorkSettings(item.jsonData || '{}');
                if (workSettings.smallNotificationsEnabled !== jsonData.smallNotificationsEnabled) {
                    logger.debug('Emitting smallNotificationsEnabled-changed', jsonData.smallNotificationsEnabled);
                    //  appEmitter.emit('smallNotificationsEnabled-changed', jsonData.smallNotificationsEnabled);
                }
            }

            return updated!;
        } else {
            logger.error(`No item with ${name} found to update.`);
            return null;
        }
    } catch (e) {
        logger.error('Parsing jsonData failed:', e, jsonDataStr);
        return null;
    }
}

function parseWorkSettings(jsonData: string) {
    try {
        return JSON.parse(jsonData);
    } catch (e) {
        logger.error('Error parsing work settings:', e);
        return defaultWorkSettings;
    }
}

async function fetchWorkSettings() {
    let item = await findByName('WORK_SETTINGS');
    if (!item || !item.jsonData) {
        return defaultWorkSettings;
    }

    return parseWorkSettings(item.jsonData);
}

async function fetchDataSettings() {
    let item = await findByName('DATA_SETTINGS');
    if (!item || !item.jsonData) {
        // Default settings
        return defaultSettings;
    }

    try {
        return JSON.parse(item.jsonData);
    } catch (e) {
        logger.error('Error parsing data settings:', e);
        return defaultSettings;
    }
}

async function fetchWorkSettingsJsonString() {
    let jsonData = await fetchWorkSettings();
    return JSON.stringify(jsonData);
}

async function fetchDataSettingsJsonString() {
    let jsonData = await fetchDataSettings();
    return JSON.stringify(jsonData);
}

async function fetchAnalyserSettings() {
    let item = await findByName('ANALYSER_SETTINGS');
    if (!item || !item.jsonData) {
        return [];
    }

    try {
        return JSON.parse(item.jsonData);
    } catch (e) {
        logger.error('Error parsing analyser settings:', e);
        return [];
    }
}

async function fetchAnalyserSettingsJsonString() {
    let jsonData = await fetchAnalyserSettings();
    return JSON.stringify(jsonData);
}

async function getAnalyserEnabled() {
    let item = await findByName(ANALYSER_ENABLED);
    if (!item || !item.jsonData) {
        // Default to false
        return false;
    }

    try {
        return JSON.parse(item.jsonData);
    } catch (e) {
        logger.error('Error parsing ANALYSER_ENABLED setting:', e);
        return false;
    }
}

async function setAnalyserEnabled(enabled: boolean) {
    return updateByName(ANALYSER_ENABLED, JSON.stringify(enabled));
}

// TODO: cache this
async function getRunningLogItemAsJson() {
    let item = await findByName(RUNNING_LOG_ITEM);
    if (!item || !item.jsonData) {
        // logger.debug('No RUNNING_LOG_ITEM');
        return null;
    }

    try {
        const newTrackItem = JSON.parse(item.jsonData);

        if (!newTrackItem.app) {
            logger.debug('No app in RUNNING_LOG_ITEM.  Invalid item:', newTrackItem);
            return null;
        }

        delete newTrackItem.id;
        delete newTrackItem.url;
        delete newTrackItem.beginDate;
        delete newTrackItem.endDate;

        logger.debug('Running log item:', newTrackItem);

        return newTrackItem;
    } catch (e) {
        logger.error('Error parsing RUNNING_LOG_ITEM:', e);
        return null;
    }
}

async function saveRunningLogItemReference(newTrackItem: NewTrackItem | null) {
    if (!newTrackItem) {
        logger.debug('Clearing running log item');
        await updateByName(RUNNING_LOG_ITEM, '{}');
        return null;
    }

    logger.debug('Creating running log item: ', newTrackItem);

    return updateByName(RUNNING_LOG_ITEM, JSON.stringify(newTrackItem));
}

export const settingsService = {
    findCreateFind,
    findByName,
    updateByName,
    parseWorkSettings,
    fetchWorkSettings,
    fetchDataSettings,
    fetchWorkSettingsJsonString,
    fetchDataSettingsJsonString,
    fetchAnalyserSettings,
    fetchAnalyserSettingsJsonString,
    getAnalyserEnabled,
    setAnalyserEnabled,
    getRunningLogItemAsJson,
    saveRunningLogItemReference,
};

export type SettingsService = typeof settingsService;
