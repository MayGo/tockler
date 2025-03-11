import { settingsService } from './drizzle/queries/settings-service';
import { appTrackItemJob } from './jobs/app-track-item-job';
import { logTrackItemJob } from './jobs/log-track-item-job';
import { statusTrackItemJob } from './jobs/status-track-item-job';
import { logManager } from './log-manager';

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

export function cleanupBackgroundJob() {
    logger.debug('Cleaning up background job');
    if (bgInterval) {
        clearInterval(bgInterval);
        bgInterval = null;
    }
}
