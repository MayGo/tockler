import { logManager } from '../log-manager';
import { Settings } from '../models/Settings';
import { TrackItem } from '../models/TrackItem';

export class SettingsService {
    logger = logManager.getLogger('SettingsService');

    cache: any = {};

    async findByName(name: string) {
        if (this.cache[name]) {
            // this.logger.debug(`Returning ${name} from cache:`, this.cache[name]);
            return this.cache[name];
        }

        const [item] = await Settings.findCreateFind({
            where: {
                name: name,
            },
        });

        this.logger.debug(`Setting ${name} to cache:`, item.toJSON());
        this.cache[name] = item;

        return item;
    }

    async updateByName(name: string, jsonDataStr: any) {
        this.logger.info('Updating Setting:', name, jsonDataStr);

        try {
            const jsonData = JSON.parse(jsonDataStr);
            const [count, items] = await Settings.update(
                { jsonData },
                {
                    where: {
                        name: name,
                    },
                },
            );

            this.cache[name] = items[0];
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
