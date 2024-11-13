import { setupMainHandler } from './setupMainHandler';
import { ipcMain } from 'electron';
import { settingsService } from './services/settings-service';
import { appSettingService } from './services/app-setting-service';
import { trackItemService } from './services/track-item-service';
import { stateManager } from './state-manager';
import { State } from './enums/state';
import AppManager from './app-manager';
import { sendToTrayWindow, sendToNotificationWindow } from './window-manager';
import { initBackgroundJob } from './initBackgroundJob';
import { machineId } from 'node-machine-id';
import { TrackItem } from './models/TrackItem';

const settingsActions = {
    fetchAnalyserSettingsJsonString: async () => {
        return settingsService.fetchAnalyserSettingsJsonString();
    },
    updateByName: async (payload: { name: string; jsonData: string }) => {
        if (payload.name === 'WORK_SETTINGS') {
            setTimeout(() => {
                sendToTrayWindow('WORK_SETTINGS_UPDATED');
            }, 1000);
        }

        return settingsService.updateByName(payload.name, payload.jsonData);
    },
    getRunningLogItemAsJson: async () => {
        return settingsService.getRunningLogItemAsJson();
    },
    updateByNameDataSettings: async (payload: { name: string; jsonData: string }) => {
        const result = await settingsService.updateByName(payload.name, payload.jsonData);
        await initBackgroundJob();
        return result;
    },

    fetchWorkSettingsJsonString: async () => {
        return settingsService.fetchWorkSettingsJsonString();
    },

    fetchDataSettingsJsonString: async () => {
        return settingsService.fetchDataSettingsJsonString();
    },
    saveThemeAndNotify: async (payload: { theme: string }) => {
        AppManager.saveThemeAndNotify(payload.theme);
    },
    notifyUser: async (payload: { message: string }) => {
        sendToNotificationWindow('notifyUser', payload.message);
    },
    getMachineId: async () => {
        return machineId(true);
    },
};

const appSettingsActions = {
    changeColorForApp: async (payload: { appName: string; color: string }) => {
        return appSettingService.changeColorForApp(payload.appName, payload.color);
    },
};
const trackItemActions = {
    findAllDayItems: async (payload: { from: string; to: string; taskName: string }) => {
        return trackItemService.findAllDayItems(payload.from, payload.to, payload.taskName);
    },

    createTrackItem: async (payload: { trackItem: TrackItem }) => {
        return trackItemService.createTrackItem(payload.trackItem);
    },
    updateTrackItem: async (payload: { trackItem: TrackItem; trackItemId: number }) => {
        return trackItemService.updateTrackItem(payload.trackItem, payload.trackItemId);
    },
    updateTrackItemColor: async (payload: { appName: string; color: string }) => {
        return trackItemService.updateTrackItemColor(payload.appName, payload.color);
    },
    deleteByIds: async (payload: { trackItemIds: number[] }) => {
        return trackItemService.deleteByIds(payload.trackItemIds);
    },
    searchFromItems: async (payload: {
        from: string;
        to: string;
        taskName: string;
        searchStr: string;
        paging: boolean;
        sumTotal: boolean;
    }) => {
        const { from, to, taskName, searchStr, paging, sumTotal } = payload;
        return trackItemService.findAllItems(from, to, taskName, searchStr, paging, sumTotal);
    },
    exportFromItems: async (payload: { from: string; to: string; taskName: string; searchStr: string }) => {
        const { from, to, taskName, searchStr } = payload;
        return trackItemService.findAndExportAllItems(from, to, taskName, searchStr);
    },
    findFirstLogItems: async () => {
        return trackItemService.findFirstLogItems();
    },
    findFirstTrackItem: async () => {
        return trackItemService.findFirstTrackItem();
    },
    getOnlineStartTime: async () => {
        const statusItem = stateManager.getCurrentStatusTrackItem();

        return statusItem && statusItem.app === State.Online ? statusItem.beginDate : null;
    },
};

export const initIpcActions = () =>
    setupMainHandler({ ipcMain } as any, { ...settingsActions, ...appSettingsActions, ...trackItemActions }, true);
