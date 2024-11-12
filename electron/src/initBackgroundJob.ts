import { logManager } from './log-manager.js';
import { logTrackItemJob } from './jobs/log-track-item-job.js';
import { statusTrackItemJob } from './jobs/status-track-item-job.js';
import { appTrackItemJob } from './jobs/app-track-item-job.js';
import { settingsService } from './services/settings-service.js';

let logger = logManager.getLogger('BackgroundJob');

let bgInterval: NodeJS.Timeout | null = null;

async function runAll(dataSettings: any) {
    const { idleAfterSeconds } = dataSettings;

    await appTrackItemJob.run();
    await statusTrackItemJob.run(idleAfterSeconds);
    await logTrackItemJob.run();
}

export async function initBackgroundJob() {
    logger.debug('Environment:' + process.env['NODE_ENV']);
    const dataSettings = await settingsService.fetchDataSettings();
    logger.debug('Running background service.', dataSettings);

    const { backgroundJobInterval } = dataSettings;

    if (bgInterval) {
        clearInterval(bgInterval);
    }

    bgInterval = setInterval(() => runAll(dataSettings), backgroundJobInterval * 1000);
}
