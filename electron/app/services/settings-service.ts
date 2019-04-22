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

        item.jsonDataParsed = JSON.parse(item.jsonData);
        return item;
    }

    updateByName(name: string, jsonDataStr: any) {
        this.logger.info('Updating Setting:', name, jsonDataStr);
        return Settings.update(
            { jsonData: jsonDataStr },
            {
                where: {
                    name: name,
                },
            },
        );
    }

    async fetchWorkSettings() {
        let item = await this.findByName('WORK_SETTINGS');
        return item.jsonDataParsed;
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

        if (!item || this.isObject(item.jsonDataParsed)) {
            // db default is object but this is initialized with array (when is initialized)
            return [];
        }
        return item.jsonDataParsed;
    }

    async fetchAnalyserSettingsJsonString() {
        let item = await this.findByName('ANALYSER_SETTINGS');
        this.logger.info('Fetching ANALYSER_SETTINGS:');
        if (!item) {
            // db default is object but this is initialized with array (when is initialized)
            return JSON.stringify([]);
        }
        this.logger.info('returning jsonData', item.jsonData);
        return item.jsonData;
    }

    async getRunningLogItem() {
        let settingsItem = await this.findByName('RUNNING_LOG_ITEM');

        if (settingsItem.jsonDataParsed.id) {
            let logItem = await TrackItem.findById(settingsItem.jsonDataParsed.id);
            return logItem;
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
