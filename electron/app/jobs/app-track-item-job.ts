import { logManager } from '../log-manager';
import { stateManager } from '../state-manager';
import * as activeWin from 'active-win';
import BackgroundUtils from '../background-utils';
import { backgroundService } from '../background-service';
import { TrackItemType } from '../enums/track-item-type';
import { taskAnalyser } from '../task-analyser';
import { TrackItem } from '../models/TrackItem';
import { appConstants } from '../app-constants';
import { dialog } from 'electron';

let logger = logManager.getLogger('AppTrackItemJob');

export class AppTrackItemJob {
    lastUpdatedItem: TrackItem;
    errorDialogIsOpen = false;

    async run() {
        if (this.errorDialogIsOpen) {
            logger.debug('Not running appTrackItemJob. Error dialog is open.');
            return;
        }

        try {
            if (this.checkIfIsInCorrectState()) {
                let activeWindow = await activeWin();
                let updatedItem: TrackItem = await this.saveActiveWindow(
                    activeWindow ? activeWindow : {},
                );

                if (!BackgroundUtils.isSameItems(updatedItem, this.lastUpdatedItem)) {
                    logger.debug('App and title changed. Analysing title');
                    taskAnalyser.analyseAndNotify(updatedItem).then(
                        () => logger.debug('Analysing has run.'),
                        e => logger.error('Error in Analysing', e),
                    );
                }

                this.lastUpdatedItem = updatedItem;
            } else {
                logger.debug('App not in correct state');
                return false;
            }

            return true;
        } catch (error) {
            const activeWinError = await this.checkIfPermissionError(error);

            if (activeWinError) {
                logger.info('Permission error: ' + activeWinError);
            } else {
                logger.error('Error in AppTrackItemJob.');
                logger.error(error);
            }
        }
    }

    async checkIfPermissionError(e) {
        const activeWinError = e.stdout;

        if (activeWinError) {
            this.errorDialogIsOpen = true;
            await dialog.showMessageBox({
                message: activeWinError.replace('active-win', 'Tockler'),
            });

            this.errorDialogIsOpen = false;
            return activeWinError;
        }
        return;
    }

    checkIfIsInCorrectState() {
        if (stateManager.isSystemSleeping()) {
            stateManager.resetAppTrackItem();
            logger.debug('System is sleeping.');
            return false;
        }

        if (stateManager.isSystemIdling()) {
            stateManager.resetAppTrackItem();
            logger.debug('App is idling.');
            return false;
        }
        return true;
    }

    async saveActiveWindow(result): Promise<TrackItem> {
        let rawItem: any = { taskName: TrackItemType.AppTrackItem };

        rawItem.beginDate = BackgroundUtils.currentTimeMinusJobInterval();
        rawItem.endDate = new Date();

        if (!result.app) {
            // logger.debug('rawitem has no app', result);
            if (result.owner && result.owner.name) {
                rawItem.app = result.owner.name;
            } else {
                rawItem.app = 'NATIVE';
            }
        } else {
            rawItem.title = result.app;
        }

        if (!result.title) {
            // logger.error('rawitem has no title', result);
            rawItem.title = 'NO_TITLE';
        } else {
            rawItem.title = result.title.replace(/\n$/, '').replace(/^\s/, '');
        }

        // logger.debug('Active window (parsed):', rawItem);

        let savedItem = await backgroundService.createOrUpdate(rawItem);
        return savedItem;
    }
}

export const appTrackItemJob = new AppTrackItemJob();
