import { ipcMain } from 'electron';

import { setupMainHandler } from 'eiphop';
import { settingsService } from './services/settings-service';
import { appSettingService } from './services/app-setting-service';
import { trackItemService } from './services/track-item-service';
import { stateManager } from './state-manager';
import { State } from './enums/state';

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
        const data = await trackItemService.findAllDayItems(
            payload.from,
            payload.to,
            payload.taskName,
        );

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
    searchFromItems: async ({ payload }, res) => {
        const { from, to, taskName, searchStr, paging } = payload;
        const data = await trackItemService.findAllItems(from, to, taskName, searchStr, paging);
        res.send(data);
    },
    findFirstLogItems: async (req, res) => {
        const data = await trackItemService.findFirstLogItems();
        res.send(data);
    },
    getOnlineStartTime: async (req, res) => {
        const statusItem = stateManager.getCurrentStatusTrackItem();

        res.send(statusItem && statusItem.app === State.Online ? statusItem.beginDate : null);
    },
};

export const initIpcActions = () =>
    setupMainHandler(
        { ipcMain } as any,
        { ...settingsActions, ...appSettingsActions, ...trackItemActions },
        true,
    );
