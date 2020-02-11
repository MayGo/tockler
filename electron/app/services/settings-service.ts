import { logManager } from '../log-manager';
import { Settings } from '../models/Settings';
import { TrackItem } from '../models/TrackItem';

export class SettingsService {
    logger = logManager.getLogger('SettingsService');

    cache: any = {};

    async findByName(name: string) {
        if (this.cache[name]) {
            this.logger.debug(`Returning ${name} from cache:`, this.cache[name].toJSON());
            return this.cache[name];
        }

        const [item] = await Settings.findCreateFind({
            where: {
                name: name,
            },
            defaults: {
                name,
            },
        });

        this.logger.debug(`Setting ${name} to cache:`, item && item.toJSON());
        this.cache[name] = item;

        return item;
    }

    async updateByName(name: string, jsonDataStr: any) {
        this.logger.info('Updating Setting:', name, jsonDataStr);

        try {
            const jsonData = JSON.parse(jsonDataStr);

            let item = await this.findByName(name);

            if (item) {
                const savedItem = await item.update({ jsonData });

                this.cache[name] = savedItem;
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
        return item.jsonData;
    }
    async fetchWorkSettingsJsonString() {
        let item = await this.findByName('WORK_SETTINGS');

        return item.jsonData;
    }

    isObject(val) {
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

        if (settingsItem.jsonData.id) {
            let logItem = await TrackItem.findByPk(settingsItem.jsonData.id);
            if (!logItem) {
                this.logger.error(`No Track item found by pk: ${settingsItem.jsonData.id}`);
                return null;
            }

            return logItem.toJSON();
        }

        return null;
    }

    async saveRunningLogItemReference(logItemId) {
        const item = await this.updateByName('RUNNING_LOG_ITEM', JSON.stringify({ id: logItemId }));
        this.logger.info('Updated RUNNING_LOG_ITEM!', logItemId);
        return logItemId;
    }
}

export const settingsService = new SettingsService();
