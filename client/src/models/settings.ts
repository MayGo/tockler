import * as Config from 'electron-config';
const config = new Config();

const ipcRenderer = (<any>window).require('electron').ipcRenderer;
const openAtLogin = config.get('openAtLogin');
const isAutoUpdateEnabled = config.get('isAutoUpdateEnabled');

export const settingsModel: any = {
    namespace: 'settings',
    state: {
        work: { hoursToWork: 8 },
        app: {
            openAtLogin: typeof openAtLogin !== 'undefined' ? openAtLogin : true,
            isAutoUpdateEnabled:
                typeof isAutoUpdateEnabled !== 'undefined' ? isAutoUpdateEnabled : true,
        },
    },

    effects: {
        *saveSettings({ payload }: any, { call, put, select }: any) {
            console.log('Saving settings');
            const settings = yield select(state => state.form.settingsForm.values);
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
