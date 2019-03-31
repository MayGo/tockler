import * as Config from 'electron-store';
import { SettingsService } from '../services/SettingsService';
const config = new Config();

const ipcRenderer = (<any>window).require('electron').ipcRenderer;
const openAtLogin = config.get('openAtLogin');
const isAutoUpdateEnabled = config.get('isAutoUpdateEnabled');

const defaultWorkSettings = {
    workDayStartTime: '08:30',
    workDayEndTime: '17:00',
    splitTaskAfterIdlingForMinutes: 3,
};
const defaultAnalyserSettings = [
    { findRe: '\\w+-\\d+.*JIRA', takeTitle: '', takeGroup: '\\w+-\\d+', enabled: true },
    { findRe: '9GAG', takeTitle: '', takeGroup: '9GAG', enabled: true },
];

console.log(defaultAnalyserSettings, defaultWorkSettings);

export const settingsModel: any = {
    namespace: 'settings',
    state: {
        work: { hoursToWork: 8 },
        app: {
            openAtLogin: typeof openAtLogin !== 'undefined' ? openAtLogin : true,
            isAutoUpdateEnabled:
                typeof isAutoUpdateEnabled !== 'undefined' ? isAutoUpdateEnabled : true,
        },
        analyser: [],
    },

    subscriptions: {
        setup({ dispatch }: any) {
            console.log('Settings data setup');

            dispatch({
                type: 'fetchAnalyserSettings',
            });
        },
    },

    effects: {
        *fetchAnalyserSettings({ payload }: any, { call, put }: any) {
            console.log('fetchAnalyserSettings');

            const analyser = yield call(SettingsService.fetchAnalyserSettings);

            yield put({
                type: 'setAnalyserSettings',
                payload: {
                    analyser,
                },
            });
        },
        *saveSettings({ payload }: any, { call, put, select }: any) {
            const settingsForm = yield select(state => state.form.settingsForm);
            console.log('Saving settings"', settingsForm);
            const settings = settingsForm.values;
            const currentSettings = yield select(state => state.settings);

            if (settings.app.openAtLogin !== currentSettings.app.openAtLogin) {
                console.log('Setting openAtLogin', settings.app.openAtLogin);
                config.set('openAtLogin', settings.app.openAtLogin);

                ipcRenderer.send('openAtLoginChanged');
            }
            if (settings.app.isAutoUpdateEnabled !== currentSettings.app.isAutoUpdateEnabled) {
                console.log('Setting isAutoUpdateEnabled', settings.app.isAutoUpdateEnabled);
                config.set('isAutoUpdateEnabled', settings.app.isAutoUpdateEnabled);
            }
            console.log('Saving analyser settings:', settings.analyser);
            yield call(
                SettingsService.updateByName,
                'ANALYSER_SETTINGS',
                settings.analyser ? settings.analyser : [],
            );

            yield put({
                type: 'setAnalyserSettings',
                payload: { analyser: settings.analyser },
            });

            yield put({
                type: 'setWorkSettings',
                payload: { work: settings.work },
            });
            yield put({
                type: 'setAppSettings',
                payload: { app: settings.app },
            });
        },
    },

    reducers: {
        setAnalyserSettings(state: any, { payload: { analyser } }: any) {
            console.info('setAnalyserSettings:', analyser);
            return {
                ...state,
                analyser: analyser ? analyser : [],
            };
        },
        setWorkSettings(state: any, { payload: { work } }: any) {
            console.info('setWorkSettings:', work);
            return {
                ...state,
                work,
            };
        },
        setAppSettings(state: any, { payload: { app } }: any) {
            console.info('setAppSettings:', app);
            return {
                ...state,
                app,
            };
        },
    },
};
