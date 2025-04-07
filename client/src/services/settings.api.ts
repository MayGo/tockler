import { ITrackItem } from '../@types/ITrackItem';
import { Logger } from '../logger';
import { ElectronEventEmitter } from './ElectronEventEmitter';

// Use the Window interface extension from global declarations
const { electronBridge } = window;
const { configGet, configSet } = electronBridge;

const THEME_CONFIG_KEY = 'selectedTheme';
const IS_NATIVE_THEME_ENABLED = 'isNativeThemeEnabled';
const IS_LOGGING_ENABLED = 'isLoggingEnabled';
const OPEN_AT_LOGIN = 'openAtLogin';
const IS_AUTO_UPDATE_ENABLED = 'isAutoUpdateEnabled';
const NATIVE_THEME_CONFIG_CHANGED = 'nativeThemeChanged';
const USE_PURPLE_TRAY_ICON = 'usePurpleTrayIcon';
const USE_PURPLE_TRAY_ICON_CHANGED = 'usePurpleTrayIconChanged';
const MAC_AUTO_HIDE_MENU_BAR_ENABLED = 'macAutoHideMenuBarEnabled';

export function getNativeThemeChange() {
    return configGet(IS_NATIVE_THEME_ENABLED) as boolean;
}

export function saveNativeThemeChange(enabled) {
    configSet(IS_NATIVE_THEME_ENABLED, enabled);
    ElectronEventEmitter.send(NATIVE_THEME_CONFIG_CHANGED);
}

// -----

export function getOpenAtLogin() {
    return configGet(OPEN_AT_LOGIN) as boolean;
}

export function saveOpenAtLogin(openAtLogin) {
    if (openAtLogin !== getOpenAtLogin()) {
        configSet(OPEN_AT_LOGIN, openAtLogin);
        ElectronEventEmitter.send('openAtLoginChanged');
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

export function getMacAutoHideMenuBarEnabled() {
    return configGet(MAC_AUTO_HIDE_MENU_BAR_ENABLED) as boolean;
}

export function saveMacAutoHideMenuBarEnabled(enabled) {
    configSet(MAC_AUTO_HIDE_MENU_BAR_ENABLED, enabled);
}
export function saveUsePurpleTrayIcon(enabled) {
    configSet(USE_PURPLE_TRAY_ICON, enabled);
    ElectronEventEmitter.send(USE_PURPLE_TRAY_ICON_CHANGED);
}

export function getThemeFromStorage() {
    const colorMode = configGet(THEME_CONFIG_KEY);
    Logger.info('Got theme from storage:', colorMode);
    return colorMode;
}

export function saveThemeToStorage(colorMode) {
    Logger.info('Save theme to config:', colorMode);
    return ElectronEventEmitter.emit('saveThemeAndNotify', colorMode);
}

export async function updateByName(name, jsonData) {
    Logger.debug('updateByName', JSON.stringify(jsonData));
    return ElectronEventEmitter.emit('updateByName', { name, jsonData: JSON.stringify(jsonData) });
}

export async function notifyUser(durationMs: number) {
    Logger.debug('notifyUser', durationMs);
    return ElectronEventEmitter.emit('notifyUser', { durationMs });
}

export function getRunningLogItem() {
    return ElectronEventEmitter.emit('getRunningLogItemAsJson') as Promise<ITrackItem>;
}

export function getMachineId() {
    return ElectronEventEmitter.emit('getMachineId');
}

export async function fetchWorkSettings() {
    const jsonStr = await ElectronEventEmitter.emit('fetchWorkSettingsJsonString');
    try {
        return JSON.parse(jsonStr as string);
    } catch (e) {
        Logger.error('Error in fetchWorkSettings', jsonStr, e);
        return null;
    }
}

export async function fetchDataSettings() {
    const jsonStr = await ElectronEventEmitter.emit('fetchDataSettingsJsonString');
    try {
        return JSON.parse(jsonStr as string);
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
    return ElectronEventEmitter.emit('updateByNameDataSettings', {
        name: 'DATA_SETTINGS',
        jsonData: JSON.stringify(data),
    });
}

export function saveAnalyserSettings(data) {
    updateByName('ANALYSER_SETTINGS', data);
}

export async function getTaskAnalyserEnabled() {
    return ElectronEventEmitter.emit('getTaskAnalyserEnabled') as Promise<boolean>;
}

export async function setTaskAnalyserEnabled(enabled: boolean) {
    return ElectronEventEmitter.emit('setTaskAnalyserEnabled', { enabled });
}

export async function fetchAnalyserSettings() {
    const jsonStr = await ElectronEventEmitter.emit('fetchAnalyserSettingsJsonString');

    try {
        return JSON.parse(jsonStr as string);
    } catch (e) {
        Logger.error('fetchAnalyserSettings', jsonStr, e);
        return [];
    }
}
