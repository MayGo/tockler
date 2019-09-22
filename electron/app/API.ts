import { ipcMain } from 'electron';

import { setupMainHandler } from 'eiphop';
import { settingsService } from './services/settings-service';

const settingsActions = {
    fetchAnalyserSettingsJsonString: async (req, res) => {
        const data = await settingsService.fetchAnalyserSettingsJsonString();
        res.send(data);
    },
    updateByName: async (req, res) => {
        const { payload } = req;
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

export const initIpcActions = () =>
    setupMainHandler({ ipcMain } as any, { ...settingsActions }, true);
