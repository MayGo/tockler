import { logManager } from './log-manager';
import { appEmitter } from './app-event-emitter';
import { settingsService } from './services/settings-service';
import { TrackItemType } from './enums/track-item-type';
import { showNotification } from './notification';
import randomcolor from 'randomcolor';
import { stateManager } from './state-manager';
export interface TrackItemRaw {
    app?: string;
    taskName?: TrackItemType;
    title?: string;
    color?: string;
    beginDate?: Date;
    endDate?: Date;
    url?: string;
}

const logger = logManager.getLogger('TrackItemService');
export class TaskAnalyser {
    newItem: TrackItemRaw | null = null;

    findFirst(str: string, findRe: string) {
        if (!findRe) {
            return null;
        }

        let re = new RegExp(findRe, 'g');
        let result = re.exec(str);

        if (result != null) {
            let first = result[0];
            return first;
        }

        return null;
    }

    onNotificationClick() {
        if (taskAnalyser.newItem == null) {
            logger.debug('Already clicked. Prevent from creating double item.');
            return;
        }

        logger.debug('Clicked. Creating new task', taskAnalyser.newItem);

        appEmitter.emit('start-new-log-item', taskAnalyser.newItem);

        showNotification({
            title: 'New task created!',
            body: `Task "${taskAnalyser.newItem.title}" running.`,
            onClick: () => this.onNotificationClick(),
            silent: true,
        });

        taskAnalyser.newItem = null;
    }

    async analyseAndNotify(item: TrackItemRaw) {
        try {
            let analyserItems = await settingsService.fetchAnalyserSettings();

            for (let patObj of analyserItems) {
                if (!patObj.findRe || !patObj.enabled) {
                    continue;
                }

                let foundStr = this.findFirst(item.title || '', patObj.findRe);

                if (!foundStr) {
                    continue;
                }

                let title = this.findFirst(item.title || '', patObj.takeTitle) || item.title || '';
                let app = this.findFirst(item.title || '', patObj.takeGroup) || foundStr;

                const runningItem = stateManager.getLogTrackItemMarkedAsRunning();

                const sameItem = runningItem && runningItem.app == app && runningItem.title === title;

                if (!sameItem) {
                    this.newItem = {
                        app: app,
                        title: title,
                        taskName: TrackItemType.LogTrackItem,
                        beginDate: new Date(),
                        endDate: new Date(),
                        color: randomcolor(),
                    };
                    showNotification({
                        body: `Click to create: "${app} - ${title}"`,
                        title: 'Create new task?',
                        onClick: () => this.onNotificationClick(),
                        silent: true,
                    });
                }
            }
        } catch (e) {
            logger.error('analyseAndNotify:', e);
        }
    }
}

export const taskAnalyser = new TaskAnalyser();
