import randomcolor from 'randomcolor';
import { NormalizedActiveWindow } from '../background/watchTrackItems/watchForActiveWindow.utils';
import { dbClient } from '../drizzle/dbClient';
import { TrackItemType } from '../enums/track-item-type';
import { appEmitter } from '../utils/appEmitter';
import { logManager } from '../utils/log-manager';
import { showNotification } from './notification';
import { TrackItemRaw } from './task-analyser.utils';
const logger = logManager.getLogger('TrackItemService');
export class TaskAnalyser {
    newItem: TrackItemRaw | null = null;
    isEnabled: boolean = false;

    constructor() {
        this.initSettings();
        this.setupEventListeners();
    }

    async initSettings() {
        try {
            // Get the analyser enabled setting or default to false
            this.isEnabled = await dbClient.getAnalyserEnabled();
            logger.debug(`Task Analyser enabled: ${this.isEnabled}`);
        } catch (e) {
            logger.error('Error initializing task analyser settings:', e);
            this.isEnabled = false;
        }
    }

    setupEventListeners() {
        // Listen for active window changes
        appEmitter.on('active-window-changed', (activeWindow: NormalizedActiveWindow) => {
            logger.debug('Active window changed event received, analyser enabled:', this.isEnabled);
            if (this.isEnabled && activeWindow) {
                const item: TrackItemRaw = {
                    app: activeWindow.app,
                    title: activeWindow.title,
                    url: activeWindow.url,
                };
                this.analyseAndNotify(item);
            }
        });
    }

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

        appEmitter.emit('start-new-log-item2', taskAnalyser.newItem);

        showNotification({
            title: 'New task created!',
            body: `Task "${taskAnalyser.newItem.title}" running.`,
            onClick: () => this.onNotificationClick(),
            silent: true,
        });

        taskAnalyser.newItem = null;
    }

    async analyseAndNotify(item: TrackItemRaw) {
        // Skip analysis if feature is disabled
        if (!this.isEnabled) {
            logger.debug('Task analyser is disabled. Skipping analysis.');
            return;
        }

        try {
            logger.debug('Analysing item:', item);
            let analyserItems = await dbClient.fetchAnalyserSettings();

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

                const runningItem = await dbClient.getRunningLogItemAsJson();

                const sameItem = runningItem && runningItem.app == app && runningItem.title === title;

                if (!sameItem) {
                    this.newItem = {
                        app: app,
                        title: title,
                        taskName: TrackItemType.LogTrackItem,
                        beginDate: Date.now(),
                        endDate: Date.now(),
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

    // Method to toggle the analyser on/off
    async setEnabled(enabled: boolean) {
        this.isEnabled = enabled;
        await dbClient.setAnalyserEnabled(enabled);
        logger.debug(`Task Analyser enabled set to: ${enabled}`);
    }
}

export const taskAnalyser = new TaskAnalyser();
