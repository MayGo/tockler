import { settingsService } from '../drizzle/queries/settings-service';
import { logManager } from '../utils/log-manager';
import { watchAndPropagateState, watchAndPropagateStateRemove } from './watchAndPropagateState';
import { watchAndSetAppTrackItem, watchAndSetAppTrackItemRemove } from './watchAndSetAppTrackItem';
import { watchAndSetStatusTrackItem, watchAndSetStatusTrackItemRemove } from './watchAndSetStatusTrackItem';
import { watchForActiveWindow } from './watchForActiveWindow';
import { watchForIdleState, watchForIdleStateRemove } from './watchForIdleState';
import { watchForPowerState, watchForPowerStateRemove } from './watchForPowerState';
let logger = logManager.getLogger('BackgroundJob');

export async function initBackgroundJob() {
    logger.debug('Init background service.');
    const dataSettings = await settingsService.fetchDataSettings();
    logger.debug('With settings:', dataSettings);

    const { idleAfterSeconds, backgroundJobInterval } = dataSettings;

    watchForIdleState(idleAfterSeconds);
    watchForActiveWindow(backgroundJobInterval);
    watchForPowerState();
    watchAndPropagateState();
    watchAndSetStatusTrackItem();
    watchAndSetAppTrackItem();
}

export function cleanupBackgroundJob() {
    logger.debug('Cleaning up background job');

    watchForIdleStateRemove();
    watchForPowerStateRemove();
    watchAndPropagateStateRemove();
    watchAndSetStatusTrackItemRemove();
    watchAndSetAppTrackItemRemove();
}
