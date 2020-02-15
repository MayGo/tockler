import { logManager } from './log-manager';
import { appEmitter } from './app-event-emitter';
import { settingsService } from './services/settings-service';
import { TrackItemType } from './enums/track-item-type';
import { showNotification } from './notification';

export interface TrackItemRaw {
    app?: string;
    taskName?: TrackItemType;
    title?: string;
    color?: string;
    beginDate?: Date;
    endDate?: Date;
}

export class TaskAnalyser {
    logger = logManager.getLogger('TrackItemService');
    newItem: TrackItemRaw;

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
            this.logger.debug('Already clicked. Prevent from creating double item.');
            return;
        }

        this.logger.debug('Clicked. Creating new task', taskAnalyser.newItem);

        appEmitter.emit('start-new-log-item', taskAnalyser.newItem);

        showNotification({
            title: 'New task created!',
            body: `Task "${taskAnalyser.newItem.title}" running.`,
            onClick: this.onNotificationClick,
            silent: true,
        });

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
                showNotification({
                    body: `Click to create: "${app}"`,
                    title: 'Create new task?',
                    onClick: this.onNotificationClick,
                });
            }
        } catch (e) {
            this.logger.error('analyseAndNotify:', e);
        }
    }
}

export const taskAnalyser = new TaskAnalyser();
