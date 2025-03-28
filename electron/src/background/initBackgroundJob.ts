import { settingsService } from '../drizzle/queries/settings-service';
import { logManager } from '../utils/log-manager';
import { watchAndPropagateState, watchAndPropagateStateCleanup } from './watchStates/watchAndPropagateState';
import { watchForIdleState, watchForIdleStateCleanup } from './watchStates/watchForIdleState';
import { watchForPowerState, watchForPowerStateCleanup } from './watchStates/watchForPowerState';
import { watchAndSetAppTrackItem, watchAndSetAppTrackItemCleanup } from './watchTrackItems/watchAndSetAppTrackItem';
import { watchAndSetLogTrackItem, watchAndSetLogTrackItemCleanup } from './watchTrackItems/watchAndSetLogTrackItem';
import {
    watchAndSetStatusTrackItem,
    watchAndSetStatusTrackItemCleanup,
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

export async function cleanupBackgroundJob() {
    logger.debug('Cleaning up background job');

    watchForIdleStateCleanup();
    watchForPowerStateCleanup();
    watchAndPropagateStateCleanup();

    await watchAndSetStatusTrackItemCleanup();
    await watchAndSetAppTrackItemCleanup();
    await watchAndSetLogTrackItemCleanup();
}
