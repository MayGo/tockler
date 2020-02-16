import { powerMonitor } from 'electron';
import { logManager } from '../log-manager';
import { stateManager } from '../state-manager';
import { backgroundService } from '../background-service';
import BackgroundUtils from '../background-utils';
import { State } from '../enums/state';
import { appConstants } from '../app-constants';
import { sendToTrayWindow } from '../window-manager';

let logger = logManager.getLogger('StatusTrackItemJob');

export class StatusTrackItemJob {
    run() {
        try {
            const seconds = powerMonitor.getSystemIdleTime();

            this.saveIdleTrackItem(seconds).then(
                () => {
                    // logger.debug(`Idle saved ${seconds}`);
                },
                e => logger.error('Idle error', e),
            );
        } catch (error) {
            logger.error('Error in StatusTrackItemJob.');
            logger.error(error);
        }
    }

    async saveIdleTrackItem(seconds) {
        if (stateManager.isSystemSleeping()) {
            logger.debug('Computer is sleeping, not running saveIdleTrackItem');
            return 'SLEEPING';
        }

        let state: State =
            seconds > appConstants.IDLE_IN_SECONDS_TO_LOG ? State.Idle : State.Online;
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
    }
}

export const statusTrackItemJob = new StatusTrackItemJob();
