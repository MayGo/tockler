import { logManager } from '../log-manager';
import { Settings } from '../models/Settings';
import { TrackItem } from '../models/TrackItem';

export class SettingsService {
    logger = logManager.getLogger('SettingsService');

    async findByName(name: string) {
        let items = await Settings.findOrCreate({
            where: {
                name: name,
            },
        });
        let item = items[0];

            return item;
    }

    updateByName(name: string, jsonDataStr: any) {
        this.logger.info('Updating Setting:', name, jsonDataStr);
        return Settings.update(
            { jsonData: JSON.parse(jsonDataStr) },
            {
                where: {
                    name: name,
                },
            },
        );
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
        let item = await this.findByName('ANALYSER_SETTINGS');
        this.logger.info(item.jsonData);
        if (!item || this.isObject(item.jsonData)) {
            // db default is object but this is initialized with array (when is initialized)
            return [];
        }
        return item.jsonData;
    }

    async fetchAnalyserSettingsJsonString() {
        this.logger.info('Fetching ANALYSER_SETTINGS:');
        let item = await this.findByName('ANALYSER_SETTINGS');
        this.logger.info('Fetched ANALYSER_SETTINGS:', item);
        if (!item) {
            // db default is object but this is initialized with array (when is initialized)
            return JSON.stringify([]);
        }
        this.logger.info('returning jsonData', item.jsonData);
        return JSON.stringify(item.jsonData);
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
