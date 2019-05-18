import { TrackItemService } from '../services/TrackItemService';
import { SettingsService } from '../services/SettingsService';
import * as Immutable from 'immutable';

const ipcRenderer = (<any>window).require('electron').ipcRenderer;

export const trayModel: any = {
    namespace: 'tray',
    state: Immutable.fromJS({
        lastLogItems: [],
    }),

    effects: {
        *stopRunningLogItem({ payload }: any, { call, put, select }: any) {
            console.log('stopRunningLogItem');

            const runningLogItem = yield select(state => state.tray.get('runningLogItem'));

            if (runningLogItem) {
                const createdItem = yield call(
                    TrackItemService.stopRunningLogItem,
                    runningLogItem.id,
                );
                console.log('Created item:', createdItem);

                yield put({
                    type: 'loadLastLogItems',
                });
                yield put({
                    type: 'setRunningLogItem',
                    payload: {
                        runningLogItem: null,
                    },
                });
            } else {
                console.error('No running log item to stop');
            }
        },
    },
    reducers: {
        lastLogItems(state: any, { payload: { lastLogItems } }: any) {
            return state.set('lastLogItems', lastLogItems);
        },
        setRunningLogItem(state: any, { payload: { runningLogItem } }: any) {
            console.log('Setting running log item:', runningLogItem);
            return state.set('runningLogItem', runningLogItem);
        },
    },
};
