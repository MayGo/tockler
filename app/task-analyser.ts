'use strict';
import { TrackItemInstance } from './models/interfaces/track-item-interface';
import { settingsService } from './services/settings-service';
import { trackItemService } from './services/track-item-service';
import { appSettingService } from './services/app-setting-service';

import * as notifier from "node-notifier";

const config = require('./config');
const path = require('path');
const $q = require('q');
const moment = require('moment');
const iconUrl = config.icon;

notifier.on('click', function (notifierObject, options) {
    if (TaskAnalyser.newItem == null) {
        console.log("Already clicked. Prevent from creating double item.");
        return;
    }
    console.log("Clicked. Creating new task", TaskAnalyser.newItem);
    appSettingService.getAppColor(TaskAnalyser.newItem.app).then((color) => {
        TaskAnalyser.newItem.color = color;
        //TODO: refactor
        trackItemService.createTrackItem(TaskAnalyser.newItem).then((trackItem: any) => {
            console.log("Created new task, saving reference: ", trackItem.id);
            TaskAnalyser.newItem = null;

            notifier.notify({
                title: 'New task created!',
                message: `Task "${trackItem.title}" running.`,
                icon: iconUrl,
                sound: true, // Only Notification Center or Windows Toasters
                wait: false // Wait with callback, until user action is taken against notification
            });

            settingsService.saveRunningLogItemReference(trackItem.id);
        });
    });
});

export default class TaskAnalyser {

    static _newItem;

    static get newItem() {
        return TaskAnalyser._newItem;
    }

    static set newItem(tempNewItem) {
        TaskAnalyser._newItem = tempNewItem;
    }

    static findFirst(str, findRe) {
        if (!findRe) {
            return;
        }
        var re = new RegExp(findRe, "g");
        var result = re.exec(str);

        if (result != null) {
            let first = result[0];
            return first;
        }
    }

    static analyseAndNotify(item) {

        if (item.taskName !== 'AppTrackItem') {
            return;
        }

        settingsService.fetchAnalyserSettings().then((analyserItems: any) => {
            for (let patObj of analyserItems) {
                if (!patObj.findRe || !patObj.active) {
                    continue;
                }

                let foundStr = TaskAnalyser.findFirst(item.title, patObj.findRe);

                if (!foundStr) {
                    continue;
                }

                let title = TaskAnalyser.findFirst(item.title, patObj.takeTitle) || item.title;
                let app = TaskAnalyser.findFirst(item.title, patObj.takeGroup) || foundStr;

                settingsService.getRunningLogItem().then((runningItem: TrackItemInstance) => {
                    if (runningItem && runningItem.title === title && runningItem.app == app) {
                        console.log("Same item, not notifying to create new item.");
                        return;
                    }
                    TaskAnalyser.newItem = {
                        app: app,
                        title: title,
                        taskName: 'LogTrackItem',
                        beginDate: new Date(),
                        endDate: new Date()
                    };

                    notifier.notify({
                        title: 'Create new task?',
                        message: `Click to create: "${app}"`,
                        icon: iconUrl,
                        sound: true, // Only Notification Center or Windows Toasters
                        wait: true // Wait with callback, until user action is taken against notification
                    }, function (err, response) {
                        // Response is response from notification
                    });
                });
            }
        });
    }

    static async getTaskSplitDate() {
        let onlineItems = await trackItemService.findLastOnlineItem();
        if (onlineItems && onlineItems.length > 0) {
            let settings = await settingsService.fetchWorkSettings();

            var onlineItem = onlineItems[0];
            var minutesAfterToSplit = settings.splitTaskAfterIdlingForMinutes || 3;
            var minutesFromNow = moment().diff(onlineItem.endDate, 'minutes');

            console.log(`Minutes from now:  ${minutesFromNow}, minutesAfterToSplit: ${minutesAfterToSplit}`);

            if (minutesFromNow >= minutesAfterToSplit) {
                let endDate = moment(onlineItem.endDate).add(minutesAfterToSplit, 'minutes').toDate();
                return endDate;
            }
        } 

       // return null;
    }
}