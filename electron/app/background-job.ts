import { logManager } from './log-manager';
import { appConstants } from './app-constants';
import { statusTrackItemJob } from './jobs/status-track-item-job';
import { appTrackItemJob } from './jobs/app-track-item-job';
import { saveToDbJob } from './jobs/save-to-db';

let logger = logManager.getLogger('BackgroundJob');

export class BackgroundJob {
    async runTimeTrackingJobs() {
        await appTrackItemJob.run();
        await statusTrackItemJob.run();
    }

    async runDbJobs() {
        await saveToDbJob.run();
    }

    init() {
        logger.debug('Environment:' + process.env.NODE_ENV);
        logger.debug('Running background service.');

        // time tracking jobs
        setInterval(() => this.runTimeTrackingJobs(), appConstants.TIME_TRACKING_JOB_INTERVAL); // TODO: Allow user to change this within the Settings view so that they can reduce tockler's energy usage

        // db jobs
        setInterval(() => this.runDbJobs(), appConstants.DB_JOB_INTERVAL);
    }
}

export const backgroundJob = new BackgroundJob();
