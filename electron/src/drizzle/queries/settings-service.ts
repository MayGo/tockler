import { eq } from 'drizzle-orm';
import { logManager } from '../../utils/log-manager';
import { db } from '../db';
import { NewTrackItem, Setting, settings } from '../schema';

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

export class SettingsService {
    logger = logManager.getLogger('SettingsService');
    cache: Record<string, Setting | null> = {};

    async findCreateFind(name: string): Promise<Setting> {
        const rows = await db.select().from(settings).where(eq(settings.name, name));

        if (rows.length === 0) {
            const [newSetting] = (await db.insert(settings).values({ name }).returning()) || [null];
            return newSetting!;
        } else {
            return rows[0]!;
        }
    }

    async findByName(name: string): Promise<Setting | null> {
        if (this.cache[name]) {
            return this.cache[name];
        }

        const item = await this.findCreateFind(name);

        this.cache[name] = item || null;
        return item || null;
    }

    async updateByName(name: string, jsonDataStr: any) {
        this.logger.debug('Updating Setting:', name, jsonDataStr);

        try {
            const jsonData = JSON.parse(jsonDataStr);

            let item = await this.findByName(name);

            if (item) {
                const [updated] = (await db
                    .update(settings)
                    .set({ jsonData: JSON.stringify(jsonData) })
                    .where(eq(settings.id, item.id))
                    .returning()) || [null];

                delete this.cache[name];
                return updated!;
            } else {
                this.logger.error(`No item with ${name} found to update.`);
                return null;
            }
        } catch (e) {
            this.logger.error('Parsing jsonData failed:', e, jsonDataStr);
            return null;
        }
    }

    async fetchWorkSettings() {
        let item = await this.findByName('WORK_SETTINGS');
        if (!item || !item.jsonData) {
            return defaultWorkSettings;
        }

        try {
            return JSON.parse(item.jsonData);
        } catch (e) {
            this.logger.error('Error parsing work settings:', e);
            return defaultWorkSettings;
        }
    }

    async fetchDataSettings() {
        let item = await this.findByName('DATA_SETTINGS');
        if (!item || !item.jsonData) {
            // Default settings
            return defaultSettings;
        }

        try {
            return JSON.parse(item.jsonData);
        } catch (e) {
            this.logger.error('Error parsing data settings:', e);
            return defaultSettings;
        }
    }

    async fetchWorkSettingsJsonString() {
        let jsonData = await this.fetchWorkSettings();
        return JSON.stringify(jsonData);
    }

    async fetchDataSettingsJsonString() {
        let jsonData = await this.fetchDataSettings();
        return JSON.stringify(jsonData);
    }

    isObject(val: any) {
        return typeof val === 'object';
    }

    async fetchAnalyserSettings() {
        let item = await this.findByName('ANALYSER_SETTINGS');
        if (!item || !item.jsonData) {
            return [];
        }

        try {
            return JSON.parse(item.jsonData);
        } catch (e) {
            this.logger.error('Error parsing analyser settings:', e);
            return [];
        }
    }

    async fetchAnalyserSettingsJsonString() {
        let jsonData = await this.fetchAnalyserSettings();
        return JSON.stringify(jsonData);
    }

    async getAnalyserEnabled() {
        let item = await this.findByName(ANALYSER_ENABLED);
        if (!item || !item.jsonData) {
            // Default to false
            return false;
        }

        try {
            return JSON.parse(item.jsonData);
        } catch (e) {
            this.logger.error('Error parsing ANALYSER_ENABLED setting:', e);
            return false;
        }
    }

    async setAnalyserEnabled(enabled: boolean) {
        return this.updateByName(ANALYSER_ENABLED, JSON.stringify(enabled));
    }

    // TODO: cache this
    async getRunningLogItemAsJson() {
        let item = await this.findByName(RUNNING_LOG_ITEM);
        if (!item || !item.jsonData) {
            // this.logger.debug('No RUNNING_LOG_ITEM');
            return null;
        }

        try {
            const newTrackItem = JSON.parse(item.jsonData);

            if (!newTrackItem.app) {
                this.logger.debug('No app in RUNNING_LOG_ITEM.  Invalid item:', newTrackItem);
                return null;
            }

            delete newTrackItem.id;
            delete newTrackItem.url;
            delete newTrackItem.beginDate;
            delete newTrackItem.endDate;

            this.logger.debug('Running log item:', newTrackItem);

            return newTrackItem;
        } catch (e) {
            this.logger.error('Error parsing RUNNING_LOG_ITEM:', e);
            return null;
        }
    }

    async saveRunningLogItemReference(newTrackItem: NewTrackItem | null) {
        if (!newTrackItem) {
            this.logger.debug('Clearing running log item');
            await this.updateByName(RUNNING_LOG_ITEM, '{}');
            return null;
        }

        this.logger.debug('Creating running log item: ', newTrackItem);

        return this.updateByName(RUNNING_LOG_ITEM, JSON.stringify(newTrackItem));
    }
}

export const settingsService = new SettingsService();
