import path from 'path';
import { Worker } from 'worker_threads';

import { config } from '../utils/config';
import { WorkerActionArgs, WorkerActionReturns } from './dbTypes';

const workerFilePath = path.resolve(__dirname, './dbWorker.js');

const outputPath = config.databaseConfig.outputPath;

const worker = new Worker(workerFilePath, {
    workerData: {
        outputPath,
    },
});

let messageId = 0;
const pending = new Map<number, { resolve: Function; reject: Function }>();

worker.on('message', ({ id, result, error }) => {
    console.warn('...........worker.on', id, result, error);
    const cb = pending.get(id);
    if (!cb) return;
    pending.delete(id);
    error ? cb.reject(new Error(error)) : cb.resolve(result);
});

function callWorker<K extends keyof WorkerActionArgs>(
    action: K,
    args: WorkerActionArgs[K],
): Promise<WorkerActionReturns[K]> {
    console.warn('...........callWorker', action, args);

    const id = ++messageId;
    return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        worker.postMessage({ id, action, args });
    });
}

// Proxy client API
export const dbClient: {
    [K in keyof WorkerActionArgs]: (...args: WorkerActionArgs[K]) => Promise<WorkerActionReturns[K]>;
} = new Proxy({} as any, {
    get:
        (_, action: string) =>
        (...args: any[]) =>
            callWorker(action as any, args),
});
