import { logManager } from '../log-manager';
import { Log } from '../models/Log';

export class LogService {
    logger = logManager.getLogger('LogService');
    lastLog: null | Log = null;

    async createUpdateLog(logAttributes: Partial<Log>): Promise<Log> {
        let log: Log = null;
        if (
            logAttributes.type === this.lastLog.type &&
            logAttributes.message === this.lastLog.message &&
            logAttributes.jsonData === this.lastLog.jsonData
        ) {
            const now = new Date();
            await Log.query().findById(this.lastLog.id).patch({
                updatedAt: now,
            });
            log = this.lastLog;
            log.updatedAt = now;
        } else {
            log = await Log.query().insert(logAttributes);
        }
        this.lastLog = log;
        return log;
    }

    async findAllLogs(from: Date, to?: Date) {
        return Log.query()
            .where('updatedAt', '>=', from)
            .where('updatedAt', '<=', to)
            .orderBy('updatedAt', 'DESC');
    }
}

export const logService = new LogService();
