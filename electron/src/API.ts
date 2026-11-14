import { ipcMain } from 'electron';
import { machineId } from 'node-machine-id';
import AppManager from './app/app-manager';
import { exportFile } from './app/exportFile';
import { taskAnalyser } from './app/task-analyser';
import { sendToNotificationWindow, sendToTrayWindow } from './app/window-manager';
import { getLastItemsAll, getOngoingItemWithDuration } from './background/background.utils';
import { initBackgroundJob } from './background/initBackgroundJob';
import { dbClient } from './drizzle/dbClient';
import { OrderByKey } from './drizzle/query.utils';
import { NewCategory, TrackItem } from './drizzle/schema';
import { setupMainHandler } from './utils/setupMainHandler';

const settingsActions = {
    fetchAnalyserSettingsJsonString: async () => {
        return dbClient.fetchAnalyserSettingsJsonString();
    },
    updateByName: async (payload: { name: string; jsonData: string }) => {
        if (payload.name === 'WORK_SETTINGS') {
            setTimeout(() => {
                sendToTrayWindow('WORK_SETTINGS_UPDATED');
            }, 1000);
        }

        return dbClient.updateByName(payload.name, payload.jsonData);
    },
    getRunningLogItemAsJson: async () => {
        return dbClient.getRunningLogItemAsJson();
    },
    updateByNameDataSettings: async (payload: { name: string; jsonData: string }) => {
        const result = await dbClient.updateByName(payload.name, payload.jsonData);
        await initBackgroundJob();
        return result;
    },

    fetchWorkSettingsJsonString: async () => {
        return dbClient.fetchWorkSettingsJsonString();
    },

    fetchDataSettingsJsonString: async () => {
        return dbClient.fetchDataSettingsJsonString();
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
        return dbClient.changeColorForApp(payload.appName, payload.color);
    },
    setCategoryForApp: async (payload: { appName: string; categoryId: number | null }) => {
        return dbClient.setCategoryForApp(payload.appName, payload.categoryId);
    },
    retrieveAllAppSettingsWithCategory: async () => {
        return dbClient.retrieveAllAppSettingsWithCategory();
    },
};

const categoryActions = {
    getCategories: async () => {
        return dbClient.getCategories();
    },
    createCategory: async (payload: NewCategory) => {
        return dbClient.createCategory(payload);
    },
    updateCategory: async (payload: { id: number; category: Partial<NewCategory> }) => {
        return dbClient.updateCategory(payload.id, payload.category);
    },
    deleteCategory: async (payload: { id: number }) => {
        return dbClient.deleteCategory(payload.id);
    },
};

const trackItemActions = {
    findAllDayItems: async ({ from, to, taskName }: { from: string; to: string; taskName: string }) => {
        const data = await dbClient.findAllDayItemsDb(from, to, taskName);

        const lastItems = await getLastItemsAll({ from, to, taskName });
        return [...data, ...lastItems];
    },

    getAppUsageByCategory: async (payload: { from: string; to: string }) => {
        return dbClient.getAppUsageByCategory(payload.from, payload.to);
    },
    getAppUsageByApp: async (payload: { from: string; to: string }) => {
        return dbClient.getAppUsageByApp(payload.from, payload.to);
    },

    createTrackItem: async (payload: { trackItem: TrackItem }) => {
        return dbClient.createTrackItem(payload.trackItem);
    },
    updateTrackItem: async (payload: { trackItem: TrackItem; trackItemId: number }) => {
        return dbClient.updateTrackItemDb(payload.trackItem, payload.trackItemId);
    },
    updateTrackItemColor: async (payload: { appName: string; color: string }) => {
        return dbClient.updateTrackItemColor(payload.appName, payload.color);
    },
    deleteByIds: async (payload: { trackItemIds: number[] }) => {
        return dbClient.deleteByIds(payload.trackItemIds);
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
        return dbClient.findAllItems(from, to, taskName, searchStr, paging, sumTotal);
    },
    exportFromItems: async (payload: {
        from: string;
        to: string;
        taskName: string;
        searchStr: string;
        format?: 'csv' | 'json';
    }) => {
        const { from, to, taskName, searchStr, format = 'csv' } = payload;

        const results = await dbClient.findItemsForExport(from, to, taskName, searchStr);
        return exportFile(from, to, taskName, results, format);
    },
    findFirstChunkLogItems: async () => {
        const items = await dbClient.findFirstChunkLogItemsDb();
        const ongoingLogItem = await getOngoingItemWithDuration();

        if (ongoingLogItem) {
            items.push(ongoingLogItem);
        }

        return items;
    },
    findFirstTrackItem: async () => {
        return dbClient.findFirstTrackItem();
    },
};

export const initIpcActions = () =>
    setupMainHandler(
        { ipcMain } as any,
        { ...settingsActions, ...appSettingsActions, ...trackItemActions, ...categoryActions },
        true,
    );
