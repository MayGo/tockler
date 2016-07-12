'use strict';

const notifier = require('node-notifier');

const TrackItemCrud = require('./TrackItemCrud');
const SettingsCrud = require('./SettingsCrud');
const AppItemCrud = require('./AppItemCrud');
const path = require('path');

class TaskAnalyser {


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

    static analyse(item) {

        if (item.taskName !== 'AppTrackItem') {
            return;
        }

        var iconUrl = path.join(__dirname, 'shared/img/icon/timetracker_icon.ico');

        SettingsCrud.fetchAnalyserSettings().then((analyserItems)=> {
            for (let patObj of analyserItems) {
                if (!patObj.findRe || !patObj.active) {
                    return;
                }

                let foundStr = TaskAnalyser.findFirst(item.title, patObj.findRe);

                if (!foundStr) {
                    continue;
                }

                let title = TaskAnalyser.findFirst(item.title, patObj.takeTitle) || item.title;
                let app = TaskAnalyser.findFirst(item.title, patObj.takeGroup) || foundStr;

                SettingsCrud.getRunningLogItem().then((runningItem)=> {
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
                        wait: false // Wait with callback, until user action is taken against notification
                    }, function (err, response) {
                        // Response is response from notification
                    });

                    notifier.on('click', function (notifierObject, options) {
                        if (TaskAnalyser.newItem == null) {
                            console.log("Already clicked. Prevent from creating double item.");
                            return;
                        }
                        console.log("Clicked. Creating new task", TaskAnalyser.newItem);
                        AppItemCrud.getAppColor(TaskAnalyser.newItem.app).then((color) => {
                            TaskAnalyser.newItem.color = color;
                            TrackItemCrud.createItem(TaskAnalyser.newItem).then((trackItem)=> {
                                console.log("Created new task, saving reference: ", trackItem.id);
                                TaskAnalyser.newItem = null;
                                notifier.notify({
                                    title: 'New task created!',
                                    message: `Task "${trackItem.title}" running.`,
                                    icon: iconUrl,
                                    sound: true, // Only Notification Center or Windows Toasters
                                    wait: false // Wait with callback, until user action is taken against notification
                                });
                                SettingsCrud.saveRunningLogItemReferemce(trackItem.id);
                            });
                        });
                    });
                });
            }

        });


    }
}
module.exports = TaskAnalyser;