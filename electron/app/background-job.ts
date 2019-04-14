import { logManager } from './log-manager';
import { appConstants } from './app-constants';
import { logTrackItemJob } from './jobs/log-track-item-job';
import { statusTrackItemJob } from './jobs/status-track-item-job';
import { appTrackItemJob } from './jobs/app-track-item-job';

let logger = logManager.getLogger('BackgroundJob');

export class BackgroundJob {
    async runAll() {
        try {
            await appTrackItemJob.run();
            await statusTrackItemJob.run();
            await logTrackItemJob.run();
        } catch (e) {
            logger.error('BackgroundJob:', e);
        }
    }
    init() {
        logger.info('Environment:' + process.env.NODE_ENV);
        logger.info('Running background service.');
        setInterval(this.runAll, appConstants.BACKGROUND_JOB_INTERVAL);
    }
}

export const backgroundJob = new BackgroundJob();
