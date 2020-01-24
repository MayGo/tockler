import { logManager } from './log-manager';
import { appConstants } from './app-constants';
import { logTrackItemJob } from './jobs/log-track-item-job';
import { statusTrackItemJob } from './jobs/status-track-item-job';
import { appTrackItemJob } from './jobs/app-track-item-job';
import { dialog } from 'electron';

let logger = logManager.getLogger('BackgroundJob');

export class BackgroundJob {
    errorDialogIsOpen = false;
    interval;
    async runAll() {
        if (this.interval) {
            clearInterval(this.interval);
        }

        try {
            await appTrackItemJob.run();
            await statusTrackItemJob.run();
            await logTrackItemJob.run();

            if (!this.errorDialogIsOpen) {
                this.interval = setInterval(
                    () => this.runAll(),
                    appConstants.BACKGROUND_JOB_INTERVAL,
                );
            }
        } catch (e) {
            logger.error('BackgroundJob:', e);

            const activeWinError = e.stdout;

            if (activeWinError) {
                this.errorDialogIsOpen = true;
                await dialog.showMessageBox({
                    message: activeWinError.replace('active-win', 'Tockler'),
                });

                this.errorDialogIsOpen = false;
                this.runAll();
            }
        }

        return true;
    }
    init() {
        logger.info('Environment:' + process.env.NODE_ENV);
        logger.info('Running background service.');

        this.runAll();
    }
}

export const backgroundJob = new BackgroundJob();
