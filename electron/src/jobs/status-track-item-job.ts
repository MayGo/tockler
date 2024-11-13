import { powerMonitor } from 'electron';
import { logManager } from '../log-manager';
import { stateManager } from '../state-manager';
import { backgroundService } from '../background-service';
import BackgroundUtils from '../background-utils';
import { State } from '../enums/state';
import { sendToTrayWindow } from '../window-manager';

let logger = logManager.getLogger('StatusTrackItemJob');

export class StatusTrackItemJob {
    run(idleAfterSeconds: number) {
        try {
            const seconds = powerMonitor.getSystemIdleTime();

            this.saveIdleTrackItem(seconds, idleAfterSeconds).then(
                () => {
                    // logger.debug(`Idle saved ${seconds}`);
                },
                (e: any) => logger.error('Idle error', e),
            );
        } catch (error: any) {
            logger.error(`Error in StatusTrackItemJob: ${error.toString()}`, error);
        }
    }

    async saveIdleTrackItem(seconds: number, idleAfterSeconds: number = 60) {
        if (stateManager.isSystemSleeping()) {
            logger.debug('Computer is sleeping, not running saveIdleTrackItem');
            return 'SLEEPING';
        }

        let state: State = seconds > idleAfterSeconds ? State.Idle : State.Online;
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

        let rawItem: any = {
            taskName: 'StatusTrackItem',
            app: state,
            title: state.toString().toLowerCase(),
            beginDate: BackgroundUtils.currentTimeMinusJobInterval(),
            endDate: new Date(),
        };

        await backgroundService.createOrUpdate(rawItem);

        return state;
    }
}

export const statusTrackItemJob = new StatusTrackItemJob();
