
import { logManager } from '../log-manager';
import { stateManager } from '../state-manager';
var logger = logManager.getLogger('LogTrackItemJob');

import * as moment from 'moment';
import { TrackItemType } from "../track-item-type.enum";
import { backgroundService } from '../background.service';
import BackgroundUtils from "../background.utils";
import config from "../config";
import * as path from 'path';
import UserMessages from "../user-messages";

import { exec, execSync, execFile } from "child_process";
import { State } from "../state.enum";
import { appConstants } from "../app-constants";

export class StatusTrackItemJob {

    run() {
        try {
            this.checkIfIsInCorrectState();
            this.saveUserIdleTime();
        } catch (error) {
            logger.error(error);
        }
    }

    checkIfIsInCorrectState(): void {

    }

    saveUserIdleTime() {

        //'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
        let runExec = "";
        let args = [];
        if (process.platform === 'darwin') {
            runExec = "sh";
            args.push(path.join(config.root, "scripts", "get-user-idle-time.mac.sh"));
        } else if (process.platform === 'win32') {
            runExec = 'powershell.exe';
            args.push('"& ""' + path.join(config.root, "scripts", "get-user-idle-time.ps1") + '"""');
        } else if (process.platform === 'linux') {
            runExec = "sh";
            args.push(path.join(config.root, "scripts", "get-user-idle-time.linux.sh"));
        }

        //logger.debug('Script saveUserIdleTime file: ' + script)

        var handleSuccess = (stdout) => {
            logger.debug('Idle time: ' + stdout);

            var seconds = stdout;

            this.saveIdleTrackItem(seconds);
        };

        var handleError = (error) => {
            logger.error('saveUserIdleTime error: ' + error);

            /* if (error.includes('UnauthorizedAccess') || error.includes('AuthorizationManager check failed')) {
                 error = 'Choose [A] Always run in opened command prompt.';
                 execSync('start cmd.exe  /K' + script);
             }*/

            UserMessages.showError('Error getting user idle time', error);

        };

        var callcack = (err, stdout, stderr) => {

            if (stderr) {
                handleError(stderr);
                return;
            }

            if (err) {
                handleError(err);
                logger.error("saveUserIdleTime err", err);
                return;
            }

            handleSuccess(stdout);
        };

        execFile(runExec, args, { timeout: 2000 }, callcack);
    }

    saveIdleTrackItem(seconds) {

        if (stateManager.isSystemSleeping()) {
            logger.info('Computer is sleeping, not running saveIdleTrackItem');
            return 'SLEEPING';
        }

        let state: State = (seconds > appConstants.IDLE_IN_SECONDS_TO_LOG) ? State.Idle : State.Online;
        // Cannot go from OFFLINE to IDLE
        if (stateManager.isSystemOffline() && state === State.Idle) {
            logger.info('Not saving. Cannot go from OFFLINE to IDLE');
            return 'BAD_STATE';
        }

        var rawItem: any = {
            taskName: 'StatusTrackItem',
            app: state,
            title: state.toString().toLowerCase(),
            beginDate: BackgroundUtils.currentTimeMinusJobInterval(),
            endDate: new Date()
        };

        backgroundService.createOrUpdate(rawItem);
    }
}

export const statusTrackItemJob = new StatusTrackItemJob();
