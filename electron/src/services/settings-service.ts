import { logManager } from '../log-manager';
import { Setting } from '../models/Setting';
import { TrackItem } from '../models/TrackItem';

export class SettingsService {
    logger = logManager.getLogger('SettingsService');

    cache: any = {};

    async findCreateFind(name: string) {
        return Setting.query()
            .where('name', name)
            .then(function (rows) {
                if (rows.length === 0) {
                    return Setting.query().insert({ name });
                } else {
                    return rows[0];
                }
            });
    }

    async findByName(name: string) {
        if (this.cache[name]) {
            // this.logger.debug(`Returning ${name} from cache:`, this.cache[name].toJSON());
            return this.cache[name];
        }

        const item = await this.findCreateFind(name);

        //  this.logger.debug(`Setting ${name} to cache:`, item && item.toJSON());
        this.cache[name] = item;

        return item;
    }

    async updateByName(name: string, jsonDataStr: any) {
        this.logger.debug('Updating Setting:', name, jsonDataStr);

        try {
            const jsonData = JSON.parse(jsonDataStr);

            let item = await this.findByName(name);

            if (item) {
                const savedItem = await item.$query().patchAndFetch({ jsonData });

                delete this.cache[name];
                return savedItem;
            } else {
                this.logger.error(`No item with ${name} found to update.`);
            }
        } catch (e) {
            this.logger.error('Parsing jsonData failed:', e, jsonDataStr);
        }
    }

    async fetchWorkSettings() {
        let item = await this.findByName('WORK_SETTINGS');
        if (!item || !item.jsonData) {
            return {};
        }

        return item.jsonData;
    }

    async fetchDataSettings() {
        let item = await this.findByName('DATA_SETTINGS');
        if (!item || !item.jsonData) {
            return { idleAfterSeconds: 60, backgroundJobInterval: 3 };
        }

        const { idleAfterSeconds, backgroundJobInterval } = item.jsonData;

        return { idleAfterSeconds: +idleAfterSeconds, backgroundJobInterval: +backgroundJobInterval };
    }

    async fetchWorkSettingsJsonString() {
        const data = await this.fetchWorkSettings();

        return JSON.stringify(data);
    }

    async fetchDataSettingsJsonString() {
        const data = await this.fetchDataSettings();

        return JSON.stringify(data);
    }

    isObject(val: any) {
        return val instanceof Object;
    }

    async fetchAnalyserSettings() {
        // this.logger.debug('Fetching ANALYSER_SETTINGS:');
        let item = await this.findByName('ANALYSER_SETTINGS');
        // this.logger.debug('Fetched ANALYSER_SETTINGS:', item.toJSON());
        if (!item || !Array.isArray(item.jsonData)) {
            // db default is object but this is initialized with array (when is initialized)
            return [];
        }
        return item.jsonData;
    }

    async fetchAnalyserSettingsJsonString() {
        const data = await this.fetchAnalyserSettings();

        return JSON.stringify(data);
    }

    async getRunningLogItemAsJson() {
        let settingsItem = await this.findByName('RUNNING_LOG_ITEM');

        if (settingsItem && settingsItem.jsonData && settingsItem.jsonData.id) {
            let logItem = await TrackItem.query().findById(settingsItem.jsonData.id);
            if (!logItem) {
                this.logger.error(`No Track item found by pk: ${settingsItem.jsonData.id}`);
                return null;
            }

            return logItem.toJSON();
        }

        return null;
    }

    async saveRunningLogItemReference(logItemId: number | null) {
        await this.updateByName('RUNNING_LOG_ITEM', JSON.stringify({ id: logItemId }));
        this.logger.debug('Updated RUNNING_LOG_ITEM!', logItemId);
        return logItemId;
    }
}

export const settingsService = new SettingsService();
