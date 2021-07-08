import { ipcMain, shell } from 'electron';

import { setupMainHandler } from 'eiphop';
import { settingsService } from './services/settings-service';
import { appSettingService } from './services/app-setting-service';
import { trackItemService } from './services/track-item-service';
import { stateManager } from './state-manager';
import { State } from './enums/state';
import { appConstants } from './app-constants';
import { logService } from './services/log-service';
import { whitelistService } from './services/whitelist-service';
import { blacklistService } from './services/blacklist-service';

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
    loginInExternalBrowser: async () => {
        shell.openExternal(
            `${process.env.GITSTART_LOGIN_URL}?url=${appConstants.PROTOCOL_NAME}://`,
        );
    },
    fetchLoginSettings: async (req, res) => {
        const data = await settingsService.getLoginSettings();
        res.send(data);
    },
};

const appSettingsActions = {
    changeColorForApp: async ({ payload }, res) => {
        const data = await appSettingService.changeColorForApp(payload.appName, payload.color);
        res.send(data);
    },
};

const listActions = {
    // whitelist actions
    getWhitelist: async (_, res) => {
        const data = await whitelistService.getWhitelist();
        res.send(data);
    },
    upsertWhitelistItems: async ({ payload }, res) => {
        const data = await whitelistService.createOrUpdateWhitelistItem(payload.whitelistItems);
        res.send(data);
    },
    deleteWhitelistItems: async ({ payload }, res) => {
        const data = await whitelistService.deleteByIds(payload.ids);
        res.send(data);
    },

    // blacklist actions
    getBlacklist: async (_, res) => {
        const data = await blacklistService.getBlacklist();
        res.send(data);
    },
    upsertBlacklistItems: async ({ payload }, res) => {
        const data = await blacklistService.createOrUpdateBlacklistItem(payload.blacklistItems);
        res.send(data);
    },
    deleteBlacklistItems: async ({ payload }, res) => {
        const data = await blacklistService.deleteByIds(payload.ids);
        res.send(data);
    },
};

const logsActions = {
    findAllLogs: async ({ payload }, res) => {
        const data = await logService.findAllLogs(payload.from, payload.to);
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
    exportFromItems: async ({ payload }, res) => {
        const { from, to, taskName, searchStr } = payload;
        const data = await trackItemService.findAndExportAllItems(from, to, taskName, searchStr);
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
        {
            ...settingsActions,
            ...appSettingsActions,
            ...logsActions,
            ...trackItemActions,
            ...listActions,
        },
        true,
    );
