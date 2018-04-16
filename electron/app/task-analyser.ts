import { logManager } from './log-manager';
import { appEmitter } from './app-event-emitter';
import { TrackItemAttributes, TrackItemInstance } from './models/interfaces/track-item-interface';
import { appSettingService } from './services/app-setting-service';
import * as notifier from 'node-notifier';
import { settingsService } from './services/settings-service';
import { TrackItemType } from './enums/track-item-type';
import config from './config';

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

    async analyseAndNotify(item) {
        try {
            let analyserItems = await settingsService.fetchAnalyserSettings();

            for (let patObj of analyserItems) {
                if (!patObj.findRe || !patObj.active) {
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

                notifier.notify(
                    {
                        title: 'Create new task?',
                        message: `Click to create: "${app}"`,
                        icon: config.iconBig,
                        sound: true, // Only Notification Center or Windows Toasters
                        wait: true, // Wait with callback, until user action is taken against notification
                    },
                    function(err, response) {
                        // Response is response from notification
                    },
                );
            }
        } catch (e) {
            this.logger.error('analyseAndNotify:', e);
        }
    }
}

export const taskAnalyser = new TaskAnalyser();

notifier.on('click', function(notifierObject, options) {
    if (taskAnalyser.newItem == null) {
        console.log('Already clicked. Prevent from creating double item.');
        return;
    }

    console.log('Clicked. Creating new task', taskAnalyser.newItem);

    appEmitter.emit('start-new-log-item', taskAnalyser.newItem);

    notifier.notify({
        title: 'New task created!',
        message: `Task "${taskAnalyser.newItem.title}" running.`,
        icon: config.iconBig,
        sound: true, // Only Notification Center or Windows Toasters
        wait: false, // Wait with callback, until user action is taken against notification
    });

    taskAnalyser.newItem = null;
});
