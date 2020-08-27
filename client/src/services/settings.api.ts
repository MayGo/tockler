import { EventEmitter } from './EventEmitter';
import { Logger } from '../logger';
import { emit } from 'eiphop';
import { ThemeVariables } from '../constants';

const { Store } = window as any;

const config = new Store();

export function getOpenAtLogin() {
    return config.get('openAtLogin') as boolean;
}

export function getIsAutoUpdateEnabled() {
    return config.get('isAutoUpdateEnabled') as boolean;
}

export function saveOpenAtLogin(openAtLogin) {
    if (openAtLogin !== getOpenAtLogin()) {
        EventEmitter.send('openAtLoginChanged');
        config.set('openAtLogin', openAtLogin);
    }
}

export function getTheme() {
    const activeTheme = config.get('activeThemeName');
    const theme = config.get('theme');

    if (theme && activeTheme === theme.name) {
        return theme;
    }

    if (activeTheme) {
        const themeVariables = ThemeVariables[activeTheme];
        if (themeVariables) {
            return themeVariables;
        } else {
            Logger.error('No such theme:', activeTheme);
        }
    }

    return theme;
}

export function saveTheme(theme) {
    config.set('theme', theme);
}

export function saveIsAutoUpdateEnabled(isAutoUpdateEnabled) {
    if (isAutoUpdateEnabled !== getIsAutoUpdateEnabled()) {
        Logger.debug('Setting isAutoUpdateEnabled', isAutoUpdateEnabled);
        config.set('isAutoUpdateEnabled', isAutoUpdateEnabled);
    }
}

export async function updateByName(name, jsonData) {
    Logger.debug('updateByName', JSON.stringify(jsonData));

    return emit('updateByName', { name, jsonData: JSON.stringify(jsonData) });
}

export function getRunningLogItem() {
    return emit('getRunningLogItemAsJson');
}

export function fetchWorkSettings() {
    return emit('fetchWorkSettings');
}

export function saveAnalyserSettings(data) {
    updateByName('ANALYSER_SETTINGS', data);
}

export async function fetchAnalyserSettings() {
    const jsonStr = await emit('fetchAnalyserSettingsJsonString');
    Logger.debug('fetchAnalyserSettings', jsonStr);
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        Logger.error('fetchAnalyserSettings', jsonStr, e);
        return [];
    }
}
