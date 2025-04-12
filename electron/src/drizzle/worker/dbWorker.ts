import { parentPort } from 'worker_threads';
import { WorkerActionArgs, WorkerActionReturns, WorkerServices } from '../dbTypes';
import { dbService } from './dbService';
import { appSettingService } from './queries/app-setting-service';
import { settingsService } from './queries/settings-service';
import { trackItemService } from './queries/track-item-service';
import { trackItemDb } from './queries/trackItem.db';

const actions: {
    [K in keyof WorkerServices]: (...args: WorkerActionArgs[K]) => Promise<WorkerActionReturns[K]>;
} = Object.assign({}, trackItemService, appSettingService, settingsService, trackItemDb, dbService);

parentPort!.on(
    'message',
    async <K extends keyof WorkerActionArgs>(msg: { id: number; action: K; args: WorkerActionArgs[K] }) => {
        console.warn('...........dbWorker::message', msg);
        const { id, action, args } = msg;

        try {
            const result = await actions[action](...args);
            console.warn('...........dbWorker::result', result);
            parentPort!.postMessage({ id, result });
        } catch (error: any) {
            console.warn('...........dbWorker::error', error);
            parentPort!.postMessage({ id, error: error.message });
        }
    },
);
