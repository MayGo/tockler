import { powerMonitor } from 'electron';
import { TrackItemRaw } from '../app/task-analyser';
import { sendToTrayWindow } from '../app/window-manager';
import { backgroundService } from '../background/background-service';
import BackgroundUtils from '../background/background-utils';
import { stateManager } from '../background/state-manager';
import { State } from '../enums/state';
import { TrackItemType } from '../enums/track-item-type';
import { logManager } from '../utils/log-manager';

const logger = logManager.getLogger('StatusTrackItemJob');

export const statusTrackItemJobRun = async (idleAfterSeconds: number) => {
    try {
        const seconds = powerMonitor.getSystemIdleTime();
        await saveIdleTrackItem(seconds, idleAfterSeconds).catch((e: any) => logger.error('Idle error', e));
    } catch (error: any) {
        logger.error(`Error in StatusTrackItemJob: ${error.toString()}`, error);
    }
};

const saveIdleTrackItem = async (
    seconds: number,
    idleAfterSeconds: number = 60,
): Promise<State | 'SLEEPING' | 'BAD_STATE'> => {
    if (stateManager.isSystemSleeping()) {
        logger.debug('Computer is sleeping, not running saveIdleTrackItem');
        return 'SLEEPING';
    }

    const state: State = seconds > idleAfterSeconds ? State.Idle : State.Online;

    // Cannot go from OFFLINE to IDLE
    if (stateManager.isSystemOffline() && state === State.Idle) {
        logger.error('Not saving. Cannot go from OFFLINE to IDLE');
        return 'BAD_STATE';
    }

    // If system just got online
    if (!stateManager.isSystemOnline() && state === State.Online) {
        sendToTrayWindow('system-is-online');
    }

    // If system just got offline/idle
    if (stateManager.isSystemOnline() && state !== State.Online) {
        sendToTrayWindow('system-is-not-online');
    }

    const rawItem: Partial<TrackItemRaw> = {
        taskName: TrackItemType.StatusTrackItem,
        app: state,
        title: state.toString().toLowerCase(),
        beginDate: BackgroundUtils.currentTimeMinusJobInterval(),
        endDate: Date.now(),
    };

    await backgroundService.createOrUpdate(rawItem);

    return state;
};
