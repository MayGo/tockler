import { EventEmitter } from './EventEmitter';
import { Logger } from '../logger';
import { emit } from 'eiphop';

const { Store } = window as any;

const config = new Store();

const THEME_CONFIG_KEY = 'selectedTheme';
const IS_NATIVE_THEME_ENABLED = 'isNativeThemeEnabled';
const IS_LOGGING_ENABLED = 'isLoggingEnabled';
const OPEN_AT_LOGIN = 'openAtLogin';
const IS_AUTO_UPDATE_ENABLED = 'isAutoUpdateEnabled';
const NATIVE_THEME_CONFIG_CHANGED = 'nativeThemeChanged';

export function getNativeThemeChange() {
    return config.get(IS_NATIVE_THEME_ENABLED) as boolean;
}

export function getOpenAtLogin() {
    return config.get(OPEN_AT_LOGIN) as boolean;
}

export function getIsAutoUpdateEnabled() {
    return config.get(IS_AUTO_UPDATE_ENABLED) as boolean;
}
export function getIsLoggingEnabled() {
    return config.get(IS_LOGGING_ENABLED) as boolean;
}

export function saveNativeThemeChange(enabled) {
    config.set(IS_NATIVE_THEME_ENABLED, enabled);
    EventEmitter.send(NATIVE_THEME_CONFIG_CHANGED);
}
export function saveOpenAtLogin(openAtLogin) {
    if (openAtLogin !== getOpenAtLogin()) {
        EventEmitter.send('openAtLoginChanged');
        config.set(OPEN_AT_LOGIN, openAtLogin);
    }
}

export function getThemeFromStorage() {
    const colorMode = config.get(THEME_CONFIG_KEY);
    Logger.info('Got theme from storage:', colorMode);
    return colorMode;
}

export function saveThemeToStorage(colorMode) {
    Logger.info('Save theme to config:', colorMode);
    return emit('saveThemeAndNotify', colorMode);
}

export function saveIsAutoUpdateEnabled(isAutoUpdateEnabled) {
    if (isAutoUpdateEnabled !== getIsAutoUpdateEnabled()) {
        Logger.debug('Setting isAutoUpdateEnabled', isAutoUpdateEnabled);
        config.set(IS_AUTO_UPDATE_ENABLED, isAutoUpdateEnabled);
    }
}
export function saveIsLoggingEnabled(isLoggingEnabled) {
    if (isLoggingEnabled !== getIsLoggingEnabled()) {
        Logger.debug('Setting isLoggingEnabled', isLoggingEnabled);
        config.set(IS_LOGGING_ENABLED, isLoggingEnabled);
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
