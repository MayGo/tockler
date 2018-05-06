export const settingsModel: any = {
    namespace: 'settings',
    state: {
        work: { hoursToWork: 8 },
    },

    effects: {
        *saveWorkSettings({ payload }: any, { call, put, select }: any) {
            console.log('Saving work settings');
            const work = yield select(state => state.form.settingsForm.values);
            yield put({
                type: 'setWorkSettings',
                payload: { work },
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
    },
};
