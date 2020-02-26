import { logManager } from './log-manager';
import { appConstants } from './app-constants';
import { logTrackItemJob } from './jobs/log-track-item-job';
import { statusTrackItemJob } from './jobs/status-track-item-job';
import { appTrackItemJob } from './jobs/app-track-item-job';

let logger = logManager.getLogger('BackgroundJob');

export class BackgroundJob {
    async runAll() {
        await appTrackItemJob.run();
        await statusTrackItemJob.run();
        await logTrackItemJob.run();
    }

    init() {
        logger.debug('Environment:' + process.env.NODE_ENV);
        logger.debug('Running background service.');

        setInterval(() => this.runAll(), appConstants.BACKGROUND_JOB_INTERVAL);
    }
}

export const backgroundJob = new BackgroundJob();
