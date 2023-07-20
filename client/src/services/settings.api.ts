import { EventEmitter } from './EventEmitter';
import { Logger } from '../logger';

const { electronBridge } = window as any;
const { configGet, configSet } = electronBridge;

const THEME_CONFIG_KEY = 'selectedTheme';
const IS_NATIVE_THEME_ENABLED = 'isNativeThemeEnabled';
const IS_LOGGING_ENABLED = 'isLoggingEnabled';
const OPEN_AT_LOGIN = 'openAtLogin';
const IS_AUTO_UPDATE_ENABLED = 'isAutoUpdateEnabled';
const NATIVE_THEME_CONFIG_CHANGED = 'nativeThemeChanged';
const USE_PURPLE_TRAY_ICON = 'usePurpleTrayIcon';
const USE_PURPLE_TRAY_ICON_CHANGED = 'usePurpleTrayIconChanged';

export function getNativeThemeChange() {
    return configGet(IS_NATIVE_THEME_ENABLED) as boolean;
}

export function saveNativeThemeChange(enabled) {
    configSet(IS_NATIVE_THEME_ENABLED, enabled);
    EventEmitter.send(NATIVE_THEME_CONFIG_CHANGED);
}

// -----

export function getOpenAtLogin() {
    return configGet(OPEN_AT_LOGIN) as boolean;
}

export function saveOpenAtLogin(openAtLogin) {
    if (openAtLogin !== getOpenAtLogin()) {
        configSet(OPEN_AT_LOGIN, openAtLogin);
        EventEmitter.send('openAtLoginChanged');
    }
}

// -----

export function getIsAutoUpdateEnabled() {
    return configGet(IS_AUTO_UPDATE_ENABLED) as boolean;
}

export function saveIsAutoUpdateEnabled(isAutoUpdateEnabled) {
    if (isAutoUpdateEnabled !== getIsAutoUpdateEnabled()) {
        Logger.debug('Setting isAutoUpdateEnabled', isAutoUpdateEnabled);
        configSet(IS_AUTO_UPDATE_ENABLED, isAutoUpdateEnabled);
    }
}

// -----

export function getIsLoggingEnabled() {
    return configGet(IS_LOGGING_ENABLED) as boolean;
}

export function saveIsLoggingEnabled(isLoggingEnabled) {
    if (isLoggingEnabled !== getIsLoggingEnabled()) {
        Logger.debug('Setting isLoggingEnabled', isLoggingEnabled);
        configSet(IS_LOGGING_ENABLED, isLoggingEnabled);
    }
}

// -----

export function getUsePurpleTrayIcon() {
    return configGet(USE_PURPLE_TRAY_ICON) as boolean;
}

export function saveUsePurpleTrayIcon(enabled) {
    configSet(USE_PURPLE_TRAY_ICON, enabled);
    EventEmitter.send(USE_PURPLE_TRAY_ICON_CHANGED);
}

export function getThemeFromStorage() {
    const colorMode = configGet(THEME_CONFIG_KEY);
    Logger.info('Got theme from storage:', colorMode);
    return colorMode;
}

export function saveThemeToStorage(colorMode) {
    Logger.info('Save theme to config:', colorMode);
    return EventEmitter.emit('saveThemeAndNotify', colorMode);
}

export async function updateByName(name, jsonData) {
    Logger.debug('updateByName', JSON.stringify(jsonData));
    return EventEmitter.emit('updateByName', { name, jsonData: JSON.stringify(jsonData) });
}

export async function notifyUser(message) {
    Logger.debug('notifyUser', message);
    return EventEmitter.emit('notifyUser', { message });
}

export function getRunningLogItem() {
    return EventEmitter.emit('getRunningLogItemAsJson');
}

export function getMachineId() {
    return EventEmitter.emit('getMachineId');
}

export async function fetchWorkSettings() {
    const jsonStr = await EventEmitter.emit('fetchWorkSettingsJsonString');
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        Logger.error('Error in fetchWorkSettings', jsonStr, e);
        return null;
    }
}

export async function fetchDataSettings() {
    const jsonStr = await EventEmitter.emit('fetchDataSettingsJsonString');
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        Logger.error('Error in fetchDataSettings', jsonStr, e);
        return null;
    }
}

export function saveWorkSettings(data) {
    updateByName('WORK_SETTINGS', data);
}

export function saveDataSettings(data) {
    updateByName('DATA_SETTINGS', data);
    return EventEmitter.emit('updateByNameDataSettings', { name: 'DATA_SETTINGS', jsonData: JSON.stringify(data) });
}

export function saveAnalyserSettings(data) {
    updateByName('ANALYSER_SETTINGS', data);
}

export async function fetchAnalyserSettings() {
    const jsonStr = await EventEmitter.emit('fetchAnalyserSettingsJsonString');
    Logger.debug('fetchAnalyserSettings', jsonStr);
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        Logger.error('fetchAnalyserSettings', jsonStr, e);
        return [];
    }
}
