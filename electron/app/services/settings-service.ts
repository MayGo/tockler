import { logManager } from '../log-manager';

import { models } from '../models/index';

export class SettingsService {
    logger = logManager.getLogger('SettingsService');

    async findByName(name: string) {
        let items = await models.Settings.findOrCreate({
            where: {
                name: name,
            },
        });
        let item = items[0];

        item.jsonDataParsed = JSON.parse(item.jsonData);
        return item;
    }

    updateByName(name: string, jsonData: any) {
        return models.Settings.update(
            { jsonData: JSON.stringify(jsonData) },
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

    isObject(val) {
        return val instanceof Object;
    }

    async fetchAnalyserSettings() {
        let item = await this.findByName('ANALYSER_SETTINGS');
        if (this.isObject(item)) {
            // db default is object but this is initialized with array (when is initialized)
            return [];
        }
        return item.jsonDataParsed;
    }

    async getRunningLogItem() {
        let settingsItem = await this.findByName('RUNNING_LOG_ITEM');
        // console.log("got RUNNING_LOG_ITEM: ", item);
        if (settingsItem.jsonDataParsed.id) {
            let logItem = await models.TrackItem.findById(settingsItem.jsonDataParsed.id);
            return logItem;
        }
        return null;
    }

    async saveRunningLogItemReference(logItemId) {
        const item = await this.updateByName('RUNNING_LOG_ITEM', { id: logItemId });
        console.log('Updated RUNNING_LOG_ITEM!', logItemId);
        return logItemId;
    }
}

export const settingsService = new SettingsService();
