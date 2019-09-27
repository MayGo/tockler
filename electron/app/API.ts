import { ipcMain } from 'electron';

import { setupMainHandler } from 'eiphop';
import { settingsService } from './services/settings-service';
import { appSettingService } from './services/app-setting-service';
import { trackItemService } from './services/track-item-service';
import { logManager } from './log-manager';

const logger = logManager.getLogger('API');

const settingsActions = {
    fetchAnalyserSettingsJsonString: async (req, res) => {
        const data = await settingsService.fetchAnalyserSettingsJsonString();
        res.send(data);
    },
    updateByName: async ({ payload }, res) => {
        const data = await settingsService.updateByName(payload.name, payload.jsonData);
        res.send(data);
    },
    getRunningLogItemAsJson: async (req, res) => {
        const data = await settingsService.getRunningLogItemAsJson();
        res.send(data);
    },
    fetchWorkSettings: async (req, res) => {
        const data = await settingsService.fetchWorkSettings();
        res.send(data);
    },
};

const appSettingsActions = {
    changeColorForApp: async ({ payload }, res) => {
        const data = await appSettingService.changeColorForApp(payload.appName, payload.color);
        res.send(data);
    },
};
const trackItemActions = {
    findAllDayItems: async ({ payload }, res) => {
        logger.error('findAllDayItems  11>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        const data = await trackItemService.findAllDayItems(
            payload.from,
            payload.to,
            payload.taskName,
        );
        logger.error('findAllDayItems  22>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        res.send(data);
    },

    createTrackItem: async ({ payload }, res) => {
        const data = await trackItemService.createTrackItem(payload.trackItem);
        res.send(data);
    },
    updateTrackItem: async ({ payload }, res) => {
        const data = await trackItemService.updateTrackItem(
            payload.trackItem,
            payload.trackItem.id,
        );
        res.send(data);
    },
    updateTrackItemColor: async ({ payload }, res) => {
        const data = await trackItemService.updateTrackItemColor(payload.appName, payload.color);
        res.send(data);
    },
    deleteByIds: async ({ payload }, res) => {
        const data = await trackItemService.deleteByIds(payload.trackItemIds);
        res.send(data);
    },
    findFirstLogItems: async (req, res) => {
        const data = await trackItemService.findFirstLogItems();
        res.send(data);
    },
};

export const initIpcActions = () =>
    setupMainHandler(
        { ipcMain } as any,
        { ...settingsActions, ...appSettingsActions, ...trackItemActions },
        true,
    );
