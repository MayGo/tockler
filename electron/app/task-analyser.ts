import { logManager } from './log-manager';
import { appEmitter } from './app-event-emitter';
import { TrackItemAttributes } from './models/interfaces/track-item-interface';
import { settingsService } from './services/settings-service';
import { TrackItemType } from './enums/track-item-type';
import { showNotification } from './notification';

export class TaskAnalyser {
    logger = logManager.getLogger('TrackItemService');
    newItem: TrackItemAttributes;

    findFirst(str, findRe) {
        if (!findRe) {
            return;
        }

        let re = new RegExp(findRe, 'g');
        let result = re.exec(str);

        if (result != null) {
            let first = result[0];
            return first;
        }
    }

    onNotificationClick() {
        if (taskAnalyser.newItem == null) {
            this.logger.info('Already clicked. Prevent from creating double item.');
            return;
        }

        this.logger.info('Clicked. Creating new task', taskAnalyser.newItem);

        appEmitter.emit('start-new-log-item', taskAnalyser.newItem);

        showNotification(
            `Task "${taskAnalyser.newItem.title}" running.`,
            'New task created!',
            this.onNotificationClick,
        );

        taskAnalyser.newItem = null;
    }

    async analyseAndNotify(item) {
        try {
            let analyserItems = await settingsService.fetchAnalyserSettings();

            for (let patObj of analyserItems) {
                if (!patObj.findRe || !patObj.enabled) {
                    continue;
                }

                let foundStr = this.findFirst(item.title, patObj.findRe);

                if (!foundStr) {
                    continue;
                }

                let title = this.findFirst(item.title, patObj.takeTitle) || item.title;
                let app = this.findFirst(item.title, patObj.takeGroup) || foundStr;

                this.newItem = {
                    app: app,
                    title: title,
                    taskName: TrackItemType.LogTrackItem,
                    beginDate: new Date(),
                    endDate: new Date(),
                };
                showNotification(
                    `Click to create: "${app}"`,
                    'Create new task?',
                    this.onNotificationClick,
                );
            }
        } catch (e) {
            this.logger.error('analyseAndNotify:', e);
        }
    }
}

export const taskAnalyser = new TaskAnalyser();
