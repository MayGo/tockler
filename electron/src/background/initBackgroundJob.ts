import { settingsService } from '../drizzle/queries/settings-service';
import { logManager } from '../utils/log-manager';
import { appTrackItemJobRun } from './appTrackItemJobRun';
import { logTrackItemJobRun } from './logTrackItemJobRun';
import { statusTrackItemJobRun } from './statusTrackItemJobRun';
import { startIdleStateWatcher } from './watchForIdleState';
import { startWatchForPowerState } from './watchForPowerState';

let logger = logManager.getLogger('BackgroundJob');

let bgInterval: NodeJS.Timeout | null = null;

async function runAll(dataSettings: any) {
    const { idleAfterSeconds } = dataSettings;

    await appTrackItemJobRun();
    await statusTrackItemJobRun(idleAfterSeconds);
    await logTrackItemJobRun();
}

export async function initBackgroundJob() {
    logger.debug('Environment:' + process.env['NODE_ENV']);
    const dataSettings = await settingsService.fetchDataSettings();
    logger.debug('Running background service.', dataSettings);

    const { backgroundJobInterval } = dataSettings;

    if (bgInterval) {
        clearInterval(bgInterval);
    }
    const { idleAfterSeconds } = dataSettings;

    startIdleStateWatcher(idleAfterSeconds);

    startWatchForPowerState();

    bgInterval = setInterval(() => runAll(dataSettings), backgroundJobInterval * 1000);
}

export function cleanupBackgroundJob() {
    logger.debug('Cleaning up background job');
    if (bgInterval) {
        clearInterval(bgInterval);
        bgInterval = null;
    }
}
