import { ipcMain } from 'electron';
import { machineId } from 'node-machine-id';
import AppManager from './app/app-manager';
import { taskAnalyser } from './app/task-analyser';
import { sendToNotificationWindow, sendToTrayWindow } from './app/window-manager';
import { initBackgroundJob } from './background/initBackgroundJob';
import { appSettingService } from './drizzle/queries/app-setting-service';
import { settingsService } from './drizzle/queries/settings-service';
import { OrderByKey, trackItemService } from './drizzle/queries/track-item-service';
import { TrackItem } from './drizzle/schema';
import { setupMainHandler } from './utils/setupMainHandler';

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
    notifyUser: async (payload: { durationMs: number }) => {
        sendToNotificationWindow('notifyUser', payload.durationMs);
    },
    getMachineId: async () => {
        return machineId(true);
    },
    getTaskAnalyserEnabled: async () => {
        return taskAnalyser.isEnabled;
    },
    setTaskAnalyserEnabled: async (payload: { enabled: boolean }) => {
        await taskAnalyser.setEnabled(payload.enabled);
        return taskAnalyser.isEnabled;
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
        paging: { limit: number; offset: number; sortByKey?: OrderByKey; sortByOrder?: 'asc' | 'desc' };
        sumTotal: boolean;
    }) => {
        const { from, to, taskName, searchStr, paging, sumTotal } = payload;
        return trackItemService.findAllItems(from, to, taskName, searchStr, paging, sumTotal);
    },
    exportFromItems: async (payload: {
        from: string;
        to: string;
        taskName: string;
        searchStr: string;
        format?: 'csv' | 'json';
    }) => {
        const { from, to, taskName, searchStr, format = 'csv' } = payload;
        return trackItemService.findAndExportAllItems(from, to, taskName, searchStr, format);
    },
    findFirstChunkLogItems: async () => {
        return trackItemService.findFirstChunkLogItems();
    },
    findFirstTrackItem: async () => {
        return trackItemService.findFirstTrackItem();
    },
};

export const initIpcActions = () =>
    setupMainHandler({ ipcMain } as any, { ...settingsActions, ...appSettingsActions, ...trackItemActions }, true);
