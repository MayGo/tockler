import { settingsService } from '../drizzle/queries/settings-service';
import { logManager } from '../utils/log-manager';
import { watchAndPropagateState, watchAndPropagateStateRemove } from './watchStates/watchAndPropagateState';
import { watchForIdleState, watchForIdleStateRemove } from './watchStates/watchForIdleState';
import { watchForPowerState, watchForPowerStateRemove } from './watchStates/watchForPowerState';
import { watchAndSetAppTrackItem, watchAndSetAppTrackItemRemove } from './watchTrackItems/watchAndSetAppTrackItem';
import { watchAndSetLogTrackItem, watchAndSetLogTrackItemRemove } from './watchTrackItems/watchAndSetLogTrackItem';
import {
    watchAndSetStatusTrackItem,
    watchAndSetStatusTrackItemRemove,
} from './watchTrackItems/watchAndSetStatusTrackItem';
let logger = logManager.getLogger('BackgroundJob');

export async function initBackgroundJob() {
    logger.debug('Init background service.');
    const dataSettings = await settingsService.fetchDataSettings();
    logger.debug('With settings:', dataSettings);

    const { idleAfterSeconds, backgroundJobInterval } = dataSettings;

    watchForIdleState(idleAfterSeconds);
    watchForPowerState();
    watchAndPropagateState();

    watchAndSetStatusTrackItem();
    watchAndSetAppTrackItem(backgroundJobInterval);
    watchAndSetLogTrackItem();
}

export function cleanupBackgroundJob() {
    logger.debug('Cleaning up background job');

    watchForIdleStateRemove();
    watchForPowerStateRemove();
    watchAndPropagateStateRemove();

    watchAndSetStatusTrackItemRemove();
    watchAndSetAppTrackItemRemove();
    watchAndSetLogTrackItemRemove();
}
