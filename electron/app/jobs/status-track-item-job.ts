import { logManager } from '../log-manager';
import { stateManager } from '../state-manager';
let logger = logManager.getLogger('LogTrackItemJob');

import * as moment from 'moment';
import { TrackItemType } from '../enums/track-item-type';
import { backgroundService } from '../background-service';
import BackgroundUtils from '../background-utils';
import config from '../config';
import * as path from 'path';
import UserMessages from '../user-messages';

import { exec, execSync, execFile } from 'child_process';
import { State } from '../enums/state';
import { appConstants } from '../app-constants';

export class StatusTrackItemJob {
    run() {
        try {
            this.saveUserIdleTime();
        } catch (error) {
            logger.error(error);
        }
    }

    saveUserIdleTime() {
        // 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
        let runExec = '';
        let args = [];
        if (process.platform === 'darwin') {
            runExec = 'sh';
            args.push(path.join(config.root, 'scripts', 'get-user-idle-time.mac.sh'));
        } else if (process.platform === 'win32') {
            runExec = 'powershell.exe';
            args.push(
                '"& ""' + path.join(config.root, 'scripts', 'get-user-idle-time.ps1') + '"""',
            );
        } else if (process.platform === 'linux') {
            runExec = 'sh';
            args.push(path.join(config.root, 'scripts', 'get-user-idle-time.linux.sh'));
        }

        // logger.debug('Script saveUserIdleTime file: ' + script)

        let handleSuccess = stdout => {
            logger.debug('Idle time: ' + stdout);

            let seconds = stdout;

            this.saveIdleTrackItem(seconds).then(
                () => logger.debug(`Idle saved ${seconds}`),
                e => logger.error('Idle error', e),
            );
        };

        let handleError = (error: string) => {
            logger.error('saveUserIdleTime error: ', error);
            UserMessages.showError('Error getting user idle time', error);
        };

        let callcack = (err: Error, stdout: any, stderr: string) => {
            if (stderr) {
                handleError(stderr);
                return;
            }

            if (err) {
                handleError(err.toString());
                logger.error('saveUserIdleTime err', err);
                return;
            }

            handleSuccess(stdout);
        };

        execFile(runExec, args, { timeout: 2000 }, callcack);
    }

    async saveIdleTrackItem(seconds) {
        if (stateManager.isSystemSleeping()) {
            logger.info('Computer is sleeping, not running saveIdleTrackItem');
            return 'SLEEPING';
        }

        let state: State =
            seconds > appConstants.IDLE_IN_SECONDS_TO_LOG ? State.Idle : State.Online;
        // Cannot go from OFFLINE to IDLE
        if (stateManager.isSystemOffline() && state === State.Idle) {
            logger.info('Not saving. Cannot go from OFFLINE to IDLE');
            return 'BAD_STATE';
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
