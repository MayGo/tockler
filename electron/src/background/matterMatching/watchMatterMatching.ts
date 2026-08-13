import { logManager } from '../../utils/log-manager';
import { matchTrackItemsToMatters } from './matchTrackItemsToMatters';

const logger = logManager.getLogger('watchMatterMatching');

const SWEEP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

let sweepInterval: NodeJS.Timeout | null = null;

async function runSweep() {
    try {
        const result = await matchTrackItemsToMatters();
        if (result.processed > 0) {
            logger.debug('Matter matching sweep:', result);
        }
    } catch (error) {
        logger.error('Error running matter matching sweep:', error);
    }
}

// Periodically tags newly captured TrackItems with a matching Matter, if any.
// Deliberately separate from the capture watchers in watchTrackItems/ — it only
// ever reads TrackItems and writes MatterTags, never touches TrackItems itself.
export async function watchMatterMatching() {
    logger.debug('Starting matter matching sweep interval');

    if (sweepInterval) {
        clearInterval(sweepInterval);
    }

    await runSweep();
    sweepInterval = setInterval(runSweep, SWEEP_INTERVAL_MS);
}

export function watchMatterMatchingCleanup() {
    logger.debug('Stopping matter matching sweep interval');
    if (sweepInterval) {
        clearInterval(sweepInterval);
        sweepInterval = null;
    }
}
