import { logManager } from './log-manager';

const logger = logManager.getLogger('setupMainHandler');

const isPromise = (obj: any) => {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};

export const setupMainHandler = (electronModule: any, availableActions: any, enableLogs = false) => {
    enableLogs && logger.info('setupMainHandler Logs enabled !');

    Object.keys(availableActions).forEach((actionName) => {
        enableLogs && logger.info(`Creating IPC handle for name = ${actionName}`);
        electronModule.ipcMain.handle(actionName, async (_event: any, ...args: any[]) => {
            enableLogs && logger.info(`Got new request with name = ${actionName}`, args);
            try {
                const result = availableActions[actionName](...args);
                if (isPromise(result)) {
                    result.catch((e: any) => {
                        //error in async code
                        logger.error(e);
                        return { error: e.toString() };
                    });

                    return await result;
                }
                return result;
            } catch (e: any) {
                logger.error(e);
                return { error: e.toString() };
            }
        });
    });
};
